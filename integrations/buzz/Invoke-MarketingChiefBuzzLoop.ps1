[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string[]]$AgentIds,

    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$Instruction,

    [ValidateRange(30, 600)]
    [int]$ReplyTimeoutSeconds = 240,

    [ValidateRange(2, 15)]
    [int]$PollIntervalSeconds = 5
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
. (Join-Path $PSScriptRoot 'MarketingChief.BuzzProcess.ps1')

$dmQueryPath = Join-Path $PSScriptRoot 'tools\buzz-dm-query.mjs'
if (-not (Test-Path -LiteralPath $dmQueryPath -PathType Leaf)) {
    throw "Buzz DM query helper is missing: $dmQueryPath"
}

$secretPattern = '(?i)(?:sk|nfc|ghp|xox[baprs])_[A-Za-z0-9_-]{20,}|authorization\s*[:=]\s*bearer\s+[A-Za-z0-9._-]{20,}|(?:password|api[_ -]?key|access[_ -]?token)\s*[:=]\s*\S{8,}'
if ($Instruction -match $secretPattern) {
    throw 'The Buzz instruction contains secret-shaped material and was not sent.'
}

$requestedAgentIds = @($AgentIds | ForEach-Object { ([string]$_).Trim() } | Where-Object { $_ } | Select-Object -Unique)
if ($requestedAgentIds.Count -lt 1 -or $requestedAgentIds.Count -gt 3) {
    throw 'Buzz loop delegation requires one to three unique agent IDs.'
}

$manifest = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'team.manifest.json') -Encoding UTF8 | ConvertFrom-Json
$statePath = Join-Path $PSScriptRoot 'runtime\team-state.json'
if (-not (Test-Path -LiteralPath $statePath -PathType Leaf)) {
    throw 'Buzz team state is missing. Run Install-MarketingChiefBuzzTeam.ps1 first.'
}
$state = Get-Content -Raw -LiteralPath $statePath -Encoding UTF8 | ConvertFrom-Json
if ([string]$state.status -ne 'ready') { throw 'Buzz team state is not ready.' }

function Invoke-BuzzOwnerJson {
    param(
        [Parameter(Mandatory = $true)][string[]]$ArgumentList,
        [string]$InputText,
        [ValidateRange(5, 60)][int]$TimeoutSeconds = 20
    )

    $parameters = @{
        CredentialTarget = [string]$manifest.owner.credentialTarget
        RelayUrl = [string]$state.relayHttpUrl
        ArgumentList = $ArgumentList
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
    $relayWsUrl = [string]$state.relayWsUrl
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
    $startInfo.WorkingDirectory = Split-Path -Parent $PSScriptRoot
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

function Open-BuzzAgentDm {
    param([Parameter(Mandatory = $true)][string]$PublicKey)

    $lastError = $null
    foreach ($attempt in 1..3) {
        try {
            $opened = Invoke-BuzzOwnerJson -ArgumentList @('dms', 'open', '--pubkey', $PublicKey) -TimeoutSeconds 20
            if ([string]$opened.dm_id -match '^[a-f0-9-]{36}$') { return $opened }
            $lastError = 'Buzz returned an invalid DM identifier.'
        }
        catch {
            $lastError = $_.Exception.Message
        }
        if ($attempt -lt 3) { Start-Sleep -Seconds $attempt }
    }
    throw "Could not open the protected agent DM: $lastError"
}

$results = [Collections.Generic.List[object]]::new()
foreach ($agentId in $requestedAgentIds) {
    $agentMatches = @($manifest.agents | Where-Object { [string]$_.id -ceq $agentId })
    $identityMatches = @($state.identities | Where-Object { [string]$_.id -ceq $agentId })
    if ($agentMatches.Count -ne 1 -or $identityMatches.Count -ne 1) {
        throw "Buzz agent '$agentId' is not uniquely provisioned."
    }

    $agent = $agentMatches[0]
    $identity = $identityMatches[0]
    if ([string]$identity.publicKey -notmatch '^[a-f0-9]{64}$') {
        throw "Buzz agent '$agentId' has an invalid public identity."
    }

    $dm = Open-BuzzAgentDm -PublicKey ([string]$identity.publicKey)
    $sentAt = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    $sendResult = Invoke-BuzzOwnerJson -ArgumentList @(
        'messages', 'send',
        '--channel', [string]$dm.dm_id,
        '--content', '-',
        '--mention', [string]$identity.publicKey
    ) -InputText $Instruction -TimeoutSeconds 30

    $eventId = [string]$sendResult.event_id
    if (-not [bool]$sendResult.accepted -or $eventId -notmatch '^[a-f0-9]{64}$') {
        throw "Buzz did not confirm delivery to '$agentId'. The send was not retried."
    }

    $reply = $null
    $deadline = [DateTimeOffset]::UtcNow.AddSeconds($ReplyTimeoutSeconds)
    while ([DateTimeOffset]::UtcNow -lt $deadline) {
        Start-Sleep -Seconds $PollIntervalSeconds
        try {
            $messages = @(
                Invoke-BuzzOwnerDmQuery `
                    -ChannelId ([string]$dm.dm_id) `
                    -Since ($sentAt - 5) `
                    -Limit 80
            )
        }
        catch {
            continue
        }

        $replyMatches = @($messages | Where-Object {
            [string]$_.pubkey -ceq [string]$identity.publicKey -and
            [long]$_.created_at -ge $sentAt
        } | Sort-Object { [long]$_.created_at })
        if ($replyMatches.Count) {
            $reply = $replyMatches[-1]
            break
        }
    }

    if ($null -eq $reply) {
        $results.Add([pscustomobject][ordered]@{
            agentId = $agentId
            displayName = [string]$agent.displayName
            state = 'timed_out'
            deliveryAccepted = $true
            replyAuthoredByExpectedIdentity = $false
            reply = ''
            eventId = $eventId
            dmId = [string]$dm.dm_id
        })
        continue
    }

    $replyText = [string]$reply.content
    $unsafeReply = $replyText -match $secretPattern
    $results.Add([pscustomobject][ordered]@{
        agentId = $agentId
        displayName = [string]$agent.displayName
        state = if ($unsafeReply) { 'unsafe_reply_blocked' } else { 'replied' }
        deliveryAccepted = $true
        replyAuthoredByExpectedIdentity = $true
        reply = if ($unsafeReply) { '[redacted: secret-shaped reply blocked]' } else { $replyText }
        eventId = $eventId
        replyEventId = [string]$reply.id
        dmId = [string]$dm.dm_id
    })
}

$payload = [pscustomobject][ordered]@{
    schemaVersion = 1
    workflow = 'buzz-loop'
    pattern = 'router-orchestrator'
    ok = @($results | Where-Object { [string]$_.state -ne 'replied' }).Count -eq 0
    requestedAgentCount = $requestedAgentIds.Count
    results = @($results)
    containsSecrets = $false
    persistedTranscript = $false
}
$payload
if (-not $payload.ok) { exit 1 }
