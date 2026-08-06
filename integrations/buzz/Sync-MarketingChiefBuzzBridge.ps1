[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
. (Join-Path $PSScriptRoot 'MarketingChief.BuzzProcess.ps1')

$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$manifest = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'team.manifest.json') -Encoding UTF8 | ConvertFrom-Json
$runtimeRoot = Join-Path $PSScriptRoot 'runtime'
$teamStatePath = Join-Path $runtimeRoot 'team-state.json'
$processStatePath = Join-Path $runtimeRoot 'processes.json'
$bridgeStatePath = Join-Path $runtimeRoot 'bridge-state.json'
$codexWorkerStatePath = Join-Path $runtimeRoot 'codex-worker-state.json'
$hostedConfigPath = Join-Path $projectRoot 'state\hosted-sync-config.json'
$hostedConfig = Get-Content -Raw -LiteralPath $hostedConfigPath -Encoding UTF8 | ConvertFrom-Json
$machineApi = ([string]$hostedConfig.siteUrl).TrimEnd('/') + '/api/machine'
$token = Get-MarketingChiefSitesCredential -Target ([string]$hostedConfig.credentialTarget)
$dispatchToken = Get-MarketingChiefSitesCredential -Target ([string]$hostedConfig.dispatchCredentialTarget)

function Invoke-MachineRequest {
    param(
        [Parameter(Mandatory = $true)][ValidateSet('GET', 'POST')][string]$Method,
        [AllowNull()][object]$Body
    )
    $parameters = @{
        Uri = $machineApi
        Method = $Method
        Headers = @{
            Authorization = "Bearer $token"
            'OAI-Sites-Authorization' = "Bearer $dispatchToken"
        }
        TimeoutSec = 60
        UseBasicParsing = $true
    }
    if ($Method -eq 'POST') {
        $parameters.ContentType = 'application/json; charset=utf-8'
        $parameters.Body = $Body | ConvertTo-Json -Depth 20 -Compress
    }
    Invoke-RestMethod @parameters
}

function Invoke-BuzzOwnerJson {
    param(
        [Parameter(Mandatory = $true)][string[]]$Arguments,
        [string]$InputText
    )
    $parameters = @{
        CredentialTarget = [string]$manifest.owner.credentialTarget
        RelayUrl = [string]$teamState.relayHttpUrl
        ArgumentList = $Arguments
        TimeoutSeconds = 45
    }
    if ($PSBoundParameters.ContainsKey('InputText')) { $parameters.StandardInput = $InputText }
    ConvertFrom-MarketingChiefBuzzJson -Result (Invoke-MarketingChiefBuzzProcess @parameters)
}

function Get-ActiveAgentCount {
    if (Test-Path -LiteralPath $processStatePath -PathType Leaf) {
        $processState = Get-Content -Raw -LiteralPath $processStatePath -Encoding UTF8 | ConvertFrom-Json
        $count = 0
        foreach ($row in @($processState.processes)) {
            $process = Get-Process -Id ([int]$row.pid) -ErrorAction SilentlyContinue
            if ($null -ne $process -and $process.Path -eq 'C:\Users\dillo\AppData\Local\Buzz\buzz-acp.exe') { $count += 1 }
        }
        if ($count -gt 0) { return $count }
    }
    if (Test-Path -LiteralPath $codexWorkerStatePath -PathType Leaf) {
        $workerState = Get-Content -Raw -LiteralPath $codexWorkerStatePath -Encoding UTF8 | ConvertFrom-Json
        $workerTask = Get-ScheduledTask -TaskName 'MarketingChief-BuzzAgentWorker' -ErrorAction SilentlyContinue
        $workerFresh = $false
        try {
            $workerFresh = ([DateTimeOffset]::UtcNow - [DateTimeOffset]::Parse([string]$workerState.updatedAt)).TotalMinutes -le 10
        }
        catch { $workerFresh = $false }
        if ($null -ne $workerTask -and
            $workerTask.State -in @('Ready', 'Running') -and
            $workerFresh -and
            [string]$workerState.status -in @('ready', 'degraded') -and
            @($workerState.agents).Count -eq @($manifest.agents).Count) {
            return @($manifest.agents).Count
        }
    }
    return 0
}

function Sync-RuntimeState {
    param(
        [Parameter(Mandatory = $true)][string]$ConnectionState,
        [Parameter(Mandatory = $true)][string]$Summary
    )
    $hostName = if ([string]$teamState.status -eq 'ready') { ([Uri][string]$teamState.relayHttpUrl).Host } else { $null }
    Invoke-MachineRequest -Method POST -Body @{
        action = 'sync-buzz-state'
        connectionState = $ConnectionState
        communityHost = $hostName
        agentCount = @($manifest.agents).Count
        channelCount = @($manifest.channels).Count
        activeAgentCount = Get-ActiveAgentCount
        lastCheckedAt = [DateTimeOffset]::UtcNow.ToString('o')
        summary = $Summary
    } | Out-Null
}

function Resolve-Message {
    param(
        [Parameter(Mandatory = $true)][object]$Message,
        [Parameter(Mandatory = $true)][string]$State,
        [Parameter(Mandatory = $true)][string]$Summary,
        [AllowNull()][string]$SafeEventId
    )
    Invoke-MachineRequest -Method POST -Body @{
        action = 'resolve-agent-message'
        id = [string]$Message.id
        state = $State
        safeEventId = if ($SafeEventId) { $SafeEventId } else { '' }
        resolutionSummary = $Summary
    } | Out-Null
}

function Get-MessageChannelId {
    param([Parameter(Mandatory = $true)][object]$Message)
    if ([string]$Message.targetType -ceq 'channel') {
        $channel = @($teamState.channels | Where-Object { [string]$_.id -ceq [string]$Message.targetId })[0]
        if ($null -eq $channel) { throw 'The requested Buzz room is not provisioned.' }
        return [string]$channel.channelId
    }
    $identity = @($teamState.identities | Where-Object { [string]$_.id -ceq [string]$Message.targetId })[0]
    if ($null -eq $identity -or [string]$identity.harness -eq 'owner') { throw 'The requested Buzz agent identity is unavailable.' }
    $dms = @(Invoke-BuzzOwnerJson -Arguments @('dms', 'list', '--limit', '200'))
    $existing = @($dms | Where-Object { @($_.participants) -contains [string]$identity.publicKey })[0]
    if ($null -ne $existing -and [string]$existing.dm_id -match '^[a-f0-9-]{36}$') { return [string]$existing.dm_id }
    $opened = Invoke-BuzzOwnerJson -Arguments @('dms', 'open', '--pubkey', [string]$identity.publicKey)
    if ([string]$opened.dm_id -notmatch '^[a-f0-9-]{36}$') { throw 'Buzz did not return a valid direct-message channel.' }
    return [string]$opened.dm_id
}

if (-not (Test-Path -LiteralPath $teamStatePath -PathType Leaf)) {
    & (Join-Path $PSScriptRoot 'Install-MarketingChiefBuzzTeam.ps1') | Out-Null
}
$teamState = Get-Content -Raw -LiteralPath $teamStatePath -Encoding UTF8 | ConvertFrom-Json
if ([string]$teamState.status -ne 'ready') {
    Sync-RuntimeState -ConnectionState awaiting_auth -Summary 'Official Buzz Desktop is installed. Hosted-community owner authentication must complete before protected agent delivery can begin.'
    return [pscustomobject]@{ status = 'awaiting_auth'; delivered = 0; failed = 0 }
}

$runtimeMode = 'official-acp'
try {
    & (Join-Path $PSScriptRoot 'Invoke-MarketingChiefBuzzSupervisor.ps1') | Out-Null
}
catch {
    $runtimeMode = 'codex-cli-safe-fallback'
}
$agentCount = @($manifest.agents).Count
$channelCount = @($manifest.channels).Count
$activeAgentCount = Get-ActiveAgentCount
if ($activeAgentCount -eq $agentCount) {
    $runtimeSummary = if ($runtimeMode -ceq 'official-acp') {
        "Authenticated Buzz Desktop community is connected. All $agentCount protected ACP agent runtimes are online, $channelCount private rooms are available, and the optional dashboard bridge is polling."
    }
    else {
        "Authenticated Buzz Desktop community is connected. All $agentCount protected identities are reachable through the hidden Codex worker, $channelCount private rooms are available, and Microsoft Defender remains enabled."
    }
    Sync-RuntimeState -ConnectionState ready -Summary $runtimeSummary
}
else {
    Sync-RuntimeState -ConnectionState degraded -Summary "Buzz community is provisioned, but only $activeAgentCount of $agentCount protected agent identities are currently reachable."
}

$remote = Invoke-MachineRequest -Method GET -Body $null
$delivered = 0
$failed = 0
foreach ($message in @($remote.agentMessages | Where-Object { [string]$_.state -ceq 'sending' })) {
    if (([DateTimeOffset]::UtcNow - [DateTimeOffset]::Parse([string]$message.createdAt)).TotalMinutes -gt 10) {
        Resolve-Message -Message $message -State failed -Summary 'Delivery remained uncertain beyond the retry window. Review in Buzz before re-queuing.' -SafeEventId $null
        $failed += 1
    }
}
foreach ($message in @($remote.agentMessages | Where-Object { [string]$_.state -ceq 'queued' })) {
    try {
        Resolve-Message -Message $message -State sending -Summary 'Windows Buzz bridge accepted the instruction for delivery.' -SafeEventId $null
        $channelId = Get-MessageChannelId -Message $message
        $sendArguments = [Collections.Generic.List[string]]::new()
        foreach ($argument in @('messages', 'send', '--channel', $channelId, '--content', '-')) {
            $sendArguments.Add($argument)
        }
        if ([string]$message.targetType -ceq 'agent') {
            $targetIdentity = @($teamState.identities | Where-Object { [string]$_.id -ceq [string]$message.targetId })[0]
            if ($null -eq $targetIdentity -or [string]$targetIdentity.publicKey -cnotmatch '^[a-f0-9]{64}$') {
                throw 'The requested Buzz agent mention target is unavailable.'
            }
            $sendArguments.Add('--mention')
            $sendArguments.Add([string]$targetIdentity.publicKey)
        }
        $result = Invoke-BuzzOwnerJson -Arguments @($sendArguments) -InputText ([string]$message.instruction)
        $eventId = [string]$result.event_id
        if ($eventId -notmatch '^[a-f0-9]{64}$') { throw 'Buzz did not return a valid delivery event.' }
        Resolve-Message -Message $message -State delivered -Summary "Delivered to $([string]$message.targetLabel) through the authenticated Buzz community." -SafeEventId $eventId
        $delivered += 1
    }
    catch {
        Resolve-Message -Message $message -State failed -Summary 'Buzz delivery failed closed. The instruction was not retried automatically.' -SafeEventId $null
        $failed += 1
    }
}

$bridgeState = [pscustomobject][ordered]@{
    schemaVersion = 1
    lastRunAt = [DateTimeOffset]::UtcNow.ToString('o')
    status = if ($failed) { 'degraded' } else { 'ready' }
    delivered = $delivered
    failed = $failed
    containsSecrets = $false
    containsRawClientCommunications = $false
}
[IO.File]::WriteAllText($bridgeStatePath, (($bridgeState | ConvertTo-Json -Depth 5) + [Environment]::NewLine), [Text.UTF8Encoding]::new($false))
$bridgeState
