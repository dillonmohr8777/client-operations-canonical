[CmdletBinding()]
param(
    [string[]]$AgentIds = @(),

    [ValidateRange(1, 8)]
    [int]$MaxMessages = 1,

    [ValidateRange(60, 7200)]
    [int]$CodexTimeoutSeconds = 7200,

    [ValidateRange(0, [long]::MaxValue)]
    [long]$ReplaySince = 0,

    [switch]$InitializeOnly
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
. (Join-Path $PSScriptRoot 'MarketingChief.BuzzProcess.ps1')

$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$runtimeRoot = Join-Path $PSScriptRoot 'runtime'
$statePath = Join-Path $runtimeRoot 'codex-worker-state.json'
$lockPath = Join-Path $runtimeRoot '.codex-worker.lock'
$manifestPath = Join-Path $PSScriptRoot 'team.manifest.json'
$teamStatePath = Join-Path $runtimeRoot 'team-state.json'
$teamRulesPath = Join-Path $PSScriptRoot 'prompts\team-rules.md'
$stackBindingsPath = Join-Path $PSScriptRoot 'stack.bindings.json'
$skillAssignmentsPath = Join-Path $PSScriptRoot 'skills.assignments.json'
$dmQueryPath = Join-Path $PSScriptRoot 'tools\buzz-dm-query.mjs'
$codexPath = 'C:\Users\dillo\AppData\Roaming\npm\codex.exe'
$secretPattern = '(?i)(?:sk|nfc|ghp|xox[baprs])_[A-Za-z0-9_-]{20,}|authorization\s*[:=]\s*bearer\s+[A-Za-z0-9._-]{20,}|(?:password|api[_ -]?key|access[_ -]?token|private[_ -]?key|auth[_ -]?tag)\s*[:=]\s*\S{8,}'

foreach ($path in @(
    $manifestPath,
    $teamStatePath,
    $teamRulesPath,
    $stackBindingsPath,
    $skillAssignmentsPath,
    $dmQueryPath,
    $codexPath
)) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        throw "Required Buzz Codex worker dependency is missing: $path"
    }
}

$manifest = Get-Content -Raw -LiteralPath $manifestPath -Encoding UTF8 | ConvertFrom-Json
$teamState = Get-Content -Raw -LiteralPath $teamStatePath -Encoding UTF8 | ConvertFrom-Json
if ([string]$teamState.status -cne 'ready') {
    throw 'Buzz hosted-community provisioning is not ready.'
}

$requestedAgentIds = @($AgentIds | ForEach-Object { ([string]$_).Trim() } | Where-Object { $_ } | Select-Object -Unique)
if (-not $requestedAgentIds.Count) {
    $requestedAgentIds = @($manifest.agents | ForEach-Object { [string]$_.id })
}
foreach ($agentId in $requestedAgentIds) {
    if (@($manifest.agents | Where-Object { [string]$_.id -ceq $agentId }).Count -ne 1) {
        throw "Buzz agent '$agentId' is not uniquely provisioned."
    }
}

$lock = $null
try {
    try {
        $lock = [IO.File]::Open($lockPath, [IO.FileMode]::OpenOrCreate, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
    }
    catch [IO.IOException] {
        [pscustomobject][ordered]@{
            status = 'busy'
            mode = 'codex-cli-safe-fallback'
            processed = 0
            failed = 0
        }
        return
    }

    $workerState = if (Test-Path -LiteralPath $statePath -PathType Leaf) {
        Get-Content -Raw -LiteralPath $statePath -Encoding UTF8 | ConvertFrom-Json
    }
    else {
        [pscustomobject][ordered]@{
            schemaVersion = 1
            mode = 'codex-cli-safe-fallback'
            status = 'initializing'
            updatedAt = [DateTimeOffset]::UtcNow.ToString('o')
            agents = @()
            containsSecrets = $false
            containsRawClientCommunications = $false
        }
    }

    function Save-WorkerState {
        $workerState.updatedAt = [DateTimeOffset]::UtcNow.ToString('o')
        $json = ($workerState | ConvertTo-Json -Depth 12) + [Environment]::NewLine
        [IO.File]::WriteAllText($statePath, $json, [Text.UTF8Encoding]::new($false))
    }

    function Get-OrCreate-AgentState {
        param([Parameter(Mandatory = $true)][string]$AgentId)

        $matches = @($workerState.agents | Where-Object { [string]$_.agentId -ceq $AgentId })
        if ($matches.Count -gt 1) { throw "Duplicate Buzz Codex worker state for '$AgentId'." }
        if ($matches.Count -eq 1) { return $matches[0] }

        $entry = [pscustomobject][ordered]@{
            agentId = $AgentId
            lastProcessedAt = 0
            lastProcessedEventId = ''
            lastReplyEventId = ''
            pendingEventId = ''
            attemptCount = 0
            status = 'new'
            lastRunAt = $null
            lastError = $null
        }
        $workerState.agents = @($workerState.agents) + $entry
        return $entry
    }

    function Invoke-BuzzOwnerJson {
        param(
            [Parameter(Mandatory = $true)][string[]]$Arguments,
            [string]$InputText,
            [ValidateRange(5, 120)][int]$TimeoutSeconds = 30
        )

        $parameters = @{
            CredentialTarget = [string]$manifest.owner.credentialTarget
            RelayUrl = [string]$teamState.relayHttpUrl
            ArgumentList = $Arguments
            TimeoutSeconds = $TimeoutSeconds
        }
        if ($PSBoundParameters.ContainsKey('InputText')) { $parameters.StandardInput = $InputText }
        ConvertFrom-MarketingChiefBuzzJson -Result (Invoke-MarketingChiefBuzzProcess @parameters)
    }

    function Invoke-BuzzAgentJson {
        param(
            [Parameter(Mandatory = $true)][object]$Agent,
            [Parameter(Mandatory = $true)][string[]]$Arguments,
            [string]$InputText,
            [ValidateRange(5, 120)][int]$TimeoutSeconds = 30
        )

        $parameters = @{
            CredentialTarget = [string]$Agent.credentialTarget
            AuthTagCredentialTarget = [string]$Agent.authTagCredentialTarget
            RelayUrl = [string]$teamState.relayHttpUrl
            ArgumentList = $Arguments
            TimeoutSeconds = $TimeoutSeconds
        }
        if ($PSBoundParameters.ContainsKey('InputText')) { $parameters.StandardInput = $InputText }
        ConvertFrom-MarketingChiefBuzzJson -Result (Invoke-MarketingChiefBuzzProcess @parameters)
    }

    function Invoke-BuzzOwnerDmQuery {
        param(
            [Parameter(Mandatory = $true)][string]$ChannelId,
            [Parameter(Mandatory = $true)][long]$Since,
            [ValidateRange(1, 200)][int]$Limit = 80
        )

        if ($ChannelId -cnotmatch '^[a-f0-9-]{36}$') {
            throw 'Buzz DM query channel is invalid.'
        }
        $relayWsUrl = [string]$teamState.relayWsUrl
        if ($relayWsUrl -cnotmatch '^wss://[A-Za-z0-9.-]+(?::\d{2,5})?/?$') {
            throw 'Buzz DM query relay is invalid.'
        }

        $privateKey = Get-MarketingChiefBuzzPrivateKey -Target ([string]$manifest.owner.credentialTarget)
        $node = (Get-Command node.exe -ErrorAction Stop).Source
        $startInfo = [Diagnostics.ProcessStartInfo]::new()
        $startInfo.FileName = $node
        $startInfo.Arguments = '"' + $dmQueryPath.Replace('"', '\"') +
            '" --channel ' + $ChannelId +
            ' --since ' + [string]$Since +
            ' --limit ' + [string]$Limit
        $startInfo.UseShellExecute = $false
        $startInfo.CreateNoWindow = $true
        $startInfo.WorkingDirectory = $projectRoot
        $startInfo.RedirectStandardOutput = $true
        $startInfo.RedirectStandardError = $true
        $startInfo.RedirectStandardInput = $true
        $startInfo.EnvironmentVariables['BUZZ_PRIVATE_KEY'] = $privateKey
        $startInfo.EnvironmentVariables['BUZZ_RELAY_URL'] = $relayWsUrl.TrimEnd('/')

        $process = [Diagnostics.Process]::new()
        $process.StartInfo = $startInfo
        try {
            if (-not $process.Start()) { throw 'Buzz WebSocket DM query did not start.' }
            $stdoutTask = $process.StandardOutput.ReadToEndAsync()
            $stderrTask = $process.StandardError.ReadToEndAsync()
            $process.StandardInput.Close()
            if (-not $process.WaitForExit(30000)) {
                try { $process.Kill() } catch { }
                throw 'Buzz WebSocket DM query timed out.'
            }
            $stdout = $stdoutTask.Result
            [void]$stderrTask.Result
            if ($process.ExitCode -ne 0) {
                throw 'Buzz WebSocket DM query failed.'
            }
            if ([string]::IsNullOrWhiteSpace($stdout)) { return @() }
            try {
                $parsed = $stdout | ConvertFrom-Json
                foreach ($row in @($parsed)) {
                    if ($row -is [array]) {
                        foreach ($nestedRow in $row) { $nestedRow }
                    }
                    else {
                        $row
                    }
                }
                return
            }
            catch { throw 'Buzz WebSocket DM query returned invalid JSON.' }
        }
        finally {
            $startInfo.EnvironmentVariables['BUZZ_PRIVATE_KEY'] = ''
            $privateKey = $null
            if ($null -ne $process) { $process.Dispose() }
        }
    }

    function Test-BuzzMessageChannel {
        param(
            [Parameter(Mandatory = $true)][object]$Message,
            [Parameter(Mandatory = $true)][string]$ChannelId
        )

        foreach ($tag in @($Message.tags)) {
            $parts = if ($tag -is [array]) {
                @($tag)
            }
            elseif ($null -ne $tag.PSObject.Properties['value']) {
                @($tag.value)
            }
            else {
                @()
            }
            if (
                $parts.Count -ge 2 -and
                [string]$parts[0] -ceq 'h' -and
                [string]$parts[1] -ceq $ChannelId
            ) {
                return $true
            }
        }
        return $false
    }

    function ConvertTo-ProcessArgument {
        param([Parameter(Mandatory = $true)][string]$Value)
        if ($Value -notmatch '[\s"]') { return $Value }
        return '"' + ($Value -replace '(\\*)"', '$1$1\"' -replace '(\\+)$', '$1$1') + '"'
    }

    function Invoke-CodexAgentTurn {
        param(
            [Parameter(Mandatory = $true)][object]$Agent,
            [Parameter(Mandatory = $true)][object]$Identity,
            [Parameter(Mandatory = $true)][object[]]$Conversation,
            [Parameter(Mandatory = $true)][object]$InstructionMessage
        )

        $rolePromptPath = Join-Path $PSScriptRoot ([string]$Agent.promptFile)
        if (-not (Test-Path -LiteralPath $rolePromptPath -PathType Leaf)) {
            throw "Buzz role prompt is missing for '$([string]$Agent.id)'."
        }

        $builder = [Text.StringBuilder]::new()
        [void]$builder.AppendLine("You are operating as $([string]$Agent.displayName) inside Dillon's private Buzz Desktop workspace.")
        [void]$builder.AppendLine('Complete the latest owner instruction using the real current files, connected tools, authenticated accounts, and runtime state.')
        [void]$builder.AppendLine('Do not call Buzz messaging tools yourself. Return one final response for the local bridge to deliver under your protected agent identity.')
        [void]$builder.AppendLine('Never expose secrets, tokens, cookies, private keys, one-time codes, recovery material, or raw private client communications.')
        [void]$builder.AppendLine('Keep external delivery, publishing outside an exact standing Netlify envelope, spend, account changes, destructive actions, and human-only authentication behind their existing gates.')
        [void]$builder.AppendLine()
        [void]$builder.AppendLine('# Role')
        [void]$builder.AppendLine([IO.File]::ReadAllText($rolePromptPath))
        [void]$builder.AppendLine()
        [void]$builder.AppendLine('# Team rules')
        [void]$builder.AppendLine([IO.File]::ReadAllText($teamRulesPath))
        [void]$builder.AppendLine()
        [void]$builder.AppendLine('# Declared operating stack')
        [void]$builder.AppendLine([IO.File]::ReadAllText($stackBindingsPath))
        [void]$builder.AppendLine()
        [void]$builder.AppendLine('# Designated skills')
        [void]$builder.AppendLine([IO.File]::ReadAllText($skillAssignmentsPath))
        [void]$builder.AppendLine()
        [void]$builder.AppendLine('# Recent protected DM context')
        foreach ($message in @($Conversation | Sort-Object { [long]$_.created_at } | Select-Object -Last 8)) {
            $author = if ([string]$message.pubkey -ceq [string]$teamState.ownerPublicKey) {
                'Dillon'
            }
            elseif ([string]$message.pubkey -ceq [string]$Identity.publicKey) {
                [string]$Agent.displayName
            }
            else {
                'Authorized teammate'
            }
            $content = ([string]$message.content).Trim()
            if ($content.Length -gt 4000) { $content = $content.Substring(0, 4000) + ' [truncated]' }
            [void]$builder.AppendLine("[$author] $content")
        }
        [void]$builder.AppendLine()
        [void]$builder.AppendLine('# Latest owner instruction')
        [void]$builder.AppendLine(([string]$InstructionMessage.content).Trim())
        [void]$builder.AppendLine()
        [void]$builder.AppendLine('Lead with the outcome. Include concrete evidence, remaining blockers, and the next safe action only when useful.')

        $workRoot = Join-Path $runtimeRoot 'codex-worker'
        if (-not (Test-Path -LiteralPath $workRoot -PathType Container)) {
            [IO.Directory]::CreateDirectory($workRoot) | Out-Null
        }
        $replyPath = Join-Path $workRoot (([string]$Agent.id) + '-' + [guid]::NewGuid().ToString('N') + '.txt')
        $arguments = @(
            'exec',
            '--ephemeral',
            '--dangerously-bypass-approvals-and-sandbox',
            '--dangerously-bypass-hook-trust',
            '--color', 'never',
            '-C', $projectRoot,
            '-o', $replyPath,
            '-'
        )
        $startInfo = [Diagnostics.ProcessStartInfo]::new()
        $startInfo.FileName = $codexPath
        $startInfo.Arguments = ($arguments | ForEach-Object { ConvertTo-ProcessArgument -Value ([string]$_) }) -join ' '
        $startInfo.UseShellExecute = $false
        $startInfo.CreateNoWindow = $true
        $startInfo.WorkingDirectory = $projectRoot
        $startInfo.RedirectStandardInput = $true
        $startInfo.RedirectStandardOutput = $true
        $startInfo.RedirectStandardError = $true
        $startInfo.EnvironmentVariables['NO_COLOR'] = '1'
        $process = [Diagnostics.Process]::new()
        $process.StartInfo = $startInfo
        try {
            if (-not $process.Start()) { throw 'Codex worker process did not start.' }
            $stdoutTask = $process.StandardOutput.ReadToEndAsync()
            $stderrTask = $process.StandardError.ReadToEndAsync()
            $process.StandardInput.Write($builder.ToString())
            $process.StandardInput.Close()
            if (-not $process.WaitForExit($CodexTimeoutSeconds * 1000)) {
                try { $process.Kill() } catch { }
                throw "Codex worker timed out after $CodexTimeoutSeconds seconds."
            }
            $stdout = $stdoutTask.Result
            $stderr = $stderrTask.Result
            if ($process.ExitCode -ne 0) {
                throw "Codex worker exited with code $($process.ExitCode)."
            }
            if (-not (Test-Path -LiteralPath $replyPath -PathType Leaf)) {
                throw 'Codex worker did not create a final response.'
            }
            $reply = [IO.File]::ReadAllText($replyPath).Trim()
            if ([string]::IsNullOrWhiteSpace($reply)) { throw 'Codex worker returned an empty response.' }
            if ($reply.Length -gt 20000) { $reply = $reply.Substring(0, 20000) + [Environment]::NewLine + [Environment]::NewLine + '[Response truncated by the Buzz bridge.]' }
            return $reply
        }
        finally {
            if (Test-Path -LiteralPath $replyPath -PathType Leaf) {
                Remove-Item -LiteralPath $replyPath -Force
            }
            if ($null -ne $process) { $process.Dispose() }
        }
    }

    $processed = 0
    $failed = 0
    $initialized = 0
    foreach ($agentId in $requestedAgentIds) {
        if ($processed -ge $MaxMessages) { break }
        $agent = @($manifest.agents | Where-Object { [string]$_.id -ceq $agentId })[0]
        $identity = @($teamState.identities | Where-Object { [string]$_.id -ceq $agentId })[0]
        if ($null -eq $identity -or [string]$identity.publicKey -cnotmatch '^[a-f0-9]{64}$') {
            throw "Buzz identity is unavailable for '$agentId'."
        }
        $entry = Get-OrCreate-AgentState -AgentId $agentId

        $dm = Invoke-BuzzOwnerJson -Arguments @('dms', 'open', '--pubkey', [string]$identity.publicKey)
        if ([string]$dm.dm_id -cnotmatch '^[a-f0-9-]{36}$') { throw "Buzz returned an invalid DM for '$agentId'." }
        $fetchSince = if ($ReplaySince -gt 0) {
            [Math]::Max(0, $ReplaySince - 5)
        }
        elseif ([long]$entry.lastProcessedAt -gt 0) {
            [Math]::Max(0, [long]$entry.lastProcessedAt - 5)
        }
        else {
            [DateTimeOffset]::UtcNow.AddHours(-2).ToUnixTimeSeconds()
        }
        # The desktop CLI's HTTP history query can stall on a live DM. Read the
        # exact protected channel through an authenticated Nostr subscription;
        # nothing is persisted and no raw message content is logged.
        $messages = @(
            Invoke-BuzzOwnerDmQuery -ChannelId ([string]$dm.dm_id) -Since $fetchSince -Limit 80 |
                Sort-Object { [long]$_.created_at }, { [string]$_.id } -Unique
        )
        $ownerMessages = @($messages | Where-Object {
            [string]$_.pubkey -ceq [string]$teamState.ownerPublicKey -and
            [string]$_.id -match '^[a-f0-9]{64}$' -and
            -not [string]::IsNullOrWhiteSpace([string]$_.content)
        } | Sort-Object { [long]$_.created_at }, { [string]$_.id })

        if ($InitializeOnly -or ([string]$entry.status -ceq 'new' -and $ReplaySince -eq 0)) {
            if ($ownerMessages.Count) {
                $latest = $ownerMessages[-1]
                $entry.lastProcessedAt = [long]$latest.created_at
                $entry.lastProcessedEventId = [string]$latest.id
            }
            $entry.status = 'initialized'
            $entry.lastRunAt = [DateTimeOffset]::UtcNow.ToString('o')
            $entry.lastError = $null
            $initialized += 1
            Save-WorkerState
            continue
        }

        $threshold = if ($ReplaySince -gt 0) { $ReplaySince } else { [long]$entry.lastProcessedAt }
        $pending = @($ownerMessages | Where-Object {
            if ($ReplaySince -gt 0) {
                [long]$_.created_at -ge $threshold
            }
            else {
                [long]$_.created_at -gt $threshold
            }
        })
        if (-not $pending.Count) {
            $entry.status = 'ready'
            $entry.lastRunAt = [DateTimeOffset]::UtcNow.ToString('o')
            $entry.lastError = $null
            Save-WorkerState
            continue
        }

        $instructionMessage = $pending[0]
        if ([string]$entry.pendingEventId -cne [string]$instructionMessage.id) {
            $entry.pendingEventId = [string]$instructionMessage.id
            $entry.attemptCount = 0
        }
        $entry.attemptCount = [int]$entry.attemptCount + 1
        $entry.status = 'processing'
        $entry.lastRunAt = [DateTimeOffset]::UtcNow.ToString('o')
        $entry.lastError = $null
        Save-WorkerState

        try {
            $instructionText = ([string]$instructionMessage.content).Trim()
            if ($instructionText -match $secretPattern) {
                $reply = 'I did not process that message because it appears to contain secret material. Keep credentials in Bitwarden, Windows Credential Manager, OAuth, or another approved secret store, then send me the non-secret task.'
            }
            else {
                $reply = Invoke-CodexAgentTurn -Agent $agent -Identity $identity -Conversation $messages -InstructionMessage $instructionMessage
                if ($reply -match $secretPattern) {
                    $reply = 'I completed the turn, but the local safety bridge blocked the response because it resembled secret material. No secret was posted to Buzz. Ask Marketing Chief for a sanitized result.'
                }
            }

            $sendResult = Invoke-BuzzAgentJson -Agent $agent -Arguments @(
                'messages', 'send',
                '--channel', [string]$dm.dm_id,
                '--content', '-'
            ) -InputText $reply -TimeoutSeconds 45
            if (-not [bool]$sendResult.accepted -or [string]$sendResult.event_id -cnotmatch '^[a-f0-9]{64}$') {
                throw "Buzz did not confirm the '$agentId' reply."
            }

            $entry.lastProcessedAt = [long]$instructionMessage.created_at
            $entry.lastProcessedEventId = [string]$instructionMessage.id
            $entry.lastReplyEventId = [string]$sendResult.event_id
            $entry.pendingEventId = ''
            $entry.attemptCount = 0
            $entry.status = 'ready'
            $entry.lastRunAt = [DateTimeOffset]::UtcNow.ToString('o')
            $entry.lastError = $null
            $processed += 1
        }
        catch {
            $failed += 1
            $entry.lastRunAt = [DateTimeOffset]::UtcNow.ToString('o')
            $errorCode = if ($_.Exception.Message -match 'timed out') {
                'codex_timeout'
            }
            elseif ($_.Exception.Message -match 'Buzz') {
                'buzz_delivery_error'
            }
            else {
                'codex_runtime_error'
            }
            $entry.lastError = $errorCode
            $entry.status = if ([int]$entry.attemptCount -ge 3) { 'blocked' } else { 'retry_pending' }

            # Do not retry one poisoned turn forever. After three Codex-side
            # failures, post a deterministic signed blocker and advance the DM.
            # Delivery failures remain blocked because another send is unlikely
            # to be safer or more reliable in the same turn.
            if ([int]$entry.attemptCount -ge 3 -and $errorCode -cne 'buzz_delivery_error') {
                try {
                    $blockerReply = 'I could not complete this turn after three local execution attempts. No external action was taken. The Marketing Chief worker recorded a sanitized runtime blocker; retry the instruction after the local Codex runtime is healthy.'
                    $blockerSend = Invoke-BuzzAgentJson -Agent $agent -Arguments @(
                        'messages', 'send',
                        '--channel', [string]$dm.dm_id,
                        '--content', '-'
                    ) -InputText $blockerReply -TimeoutSeconds 45
                    if (-not [bool]$blockerSend.accepted -or [string]$blockerSend.event_id -cnotmatch '^[a-f0-9]{64}$') {
                        throw "Buzz did not confirm the '$agentId' blocker reply."
                    }

                    $entry.lastProcessedAt = [long]$instructionMessage.created_at
                    $entry.lastProcessedEventId = [string]$instructionMessage.id
                    $entry.lastReplyEventId = [string]$blockerSend.event_id
                    $entry.pendingEventId = ''
                    $entry.attemptCount = 0
                    $entry.status = 'ready'
                    $entry.lastError = $errorCode + '_reported'
                    $processed += 1
                }
                catch {
                    $entry.status = 'blocked'
                    $entry.lastError = 'buzz_delivery_error'
                }
            }
        }
        Save-WorkerState
    }

    $allAgentStates = @($workerState.agents)
    $workerState.status = if (@($allAgentStates | Where-Object { [string]$_.status -in @('blocked', 'retry_pending') }).Count) {
        'degraded'
    }
    else {
        'ready'
    }
    Save-WorkerState

    [pscustomobject][ordered]@{
        status = [string]$workerState.status
        mode = 'codex-cli-safe-fallback'
        processed = $processed
        failed = $failed
        initialized = $initialized
        provisionedAgentCount = @($manifest.agents).Count
        trackedAgentCount = @($workerState.agents).Count
        containsSecrets = $false
        containsRawClientCommunications = $false
    }
}
finally {
    if ($null -ne $lock) { $lock.Dispose() }
}
