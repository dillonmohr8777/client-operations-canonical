[CmdletBinding()]
param([switch]$Restart)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

. (Join-Path $PSScriptRoot 'MarketingChief.BuzzCredential.ps1')

$manifestPath = Join-Path $PSScriptRoot 'team.manifest.json'
$statePath = Join-Path $PSScriptRoot 'runtime\team-state.json'
$processStatePath = Join-Path $PSScriptRoot 'runtime\presence-processes.json'
$statusRoot = Join-Path $PSScriptRoot 'runtime\presence'
$daemonPath = Join-Path $PSScriptRoot 'tools\buzz-presence-daemon.mjs'
$lock = [Threading.Mutex]::new($false, 'Local\MarketingChiefBuzzPresenceKeeper')
$lockHeld = $false

try {
    $lockHeld = $lock.WaitOne(0)
    if (-not $lockHeld) {
        [pscustomobject][ordered]@{
            status = 'busy'
            mode = 'nostr-presence-only'
            containsSecrets = $false
        }
        return
    }

    foreach ($requiredPath in @($manifestPath, $statePath, $daemonPath)) {
        if (-not (Test-Path -LiteralPath $requiredPath -PathType Leaf)) {
            throw "Required Buzz presence file is missing: $requiredPath"
        }
    }

    $node = (Get-Command node.exe -ErrorAction Stop).Source
    $manifest = Get-Content -Raw -LiteralPath $manifestPath -Encoding UTF8 | ConvertFrom-Json
    $teamState = Get-Content -Raw -LiteralPath $statePath -Encoding UTF8 | ConvertFrom-Json
    if ([string]$teamState.status -cne 'ready') {
        throw 'Buzz team provisioning is not ready.'
    }
    $relayWsUrl = [string]$teamState.relayWsUrl
    if ($relayWsUrl -notmatch '^wss://[A-Za-z0-9.-]+(?::\d{2,5})?/?$') {
        throw 'Buzz presence relay URL is invalid.'
    }

    New-Item -ItemType Directory -Path $statusRoot -Force | Out-Null
    $existing = if (Test-Path -LiteralPath $processStatePath -PathType Leaf) {
        Get-Content -Raw -LiteralPath $processStatePath -Encoding UTF8 | ConvertFrom-Json
    } else {
        $null
    }

    if ($Restart -and $null -ne $existing) {
        foreach ($row in @($existing.processes)) {
            $candidate = Get-CimInstance Win32_Process -Filter "ProcessId = $([int]$row.pid)" -ErrorAction SilentlyContinue
            if ($null -ne $candidate -and
                [string]$candidate.ExecutablePath -ceq $node -and
                [string]$candidate.CommandLine -like "*buzz-presence-daemon.mjs*") {
                Stop-Process -Id ([int]$row.pid) -Force -ErrorAction SilentlyContinue
            }
        }
    }

    $processRows = [Collections.Generic.List[object]]::new()
    foreach ($agent in @($manifest.agents)) {
        $agentId = [string]$agent.id
        $old = $null
        if ($null -ne $existing) {
            $matches = @($existing.processes | Where-Object { [string]$_.agentId -ceq $agentId })
            if ($matches.Count -gt 0) { $old = $matches[0] }
        }
        $running = if ($null -ne $old) {
            Get-CimInstance Win32_Process -Filter "ProcessId = $([int]$old.pid)" -ErrorAction SilentlyContinue
        } else {
            $null
        }
        if ($null -ne $running -and
            [string]$running.ExecutablePath -ceq $node -and
            [string]$running.CommandLine -like "*buzz-presence-daemon.mjs*" -and
            -not $Restart) {
            $processRows.Add($old)
            continue
        }

        $privateKey = Get-MarketingChiefBuzzPrivateKey -Target ([string]$agent.credentialTarget)
        $authTag = Get-MarketingChiefBuzzAuthTag -Target ([string]$agent.authTagCredentialTarget)
        $statusFile = Join-Path $statusRoot ($agentId + '.json')
        $startInfo = [Diagnostics.ProcessStartInfo]::new()
        $startInfo.FileName = $node
        $startInfo.Arguments = '"' + $daemonPath.Replace('"', '\"') + '" --agent-id ' + $agentId +
            ' --status-file "' + $statusFile.Replace('"', '\"') + '"'
        $startInfo.UseShellExecute = $false
        $startInfo.CreateNoWindow = $true
        $startInfo.WorkingDirectory = Split-Path -Parent $PSScriptRoot
        $startInfo.EnvironmentVariables['BUZZ_PRIVATE_KEY'] = $privateKey
        $startInfo.EnvironmentVariables['BUZZ_AUTH_TAG'] = $authTag
        $startInfo.EnvironmentVariables['BUZZ_RELAY_URL'] = $relayWsUrl.TrimEnd('/')

        $process = [Diagnostics.Process]::new()
        $process.StartInfo = $startInfo
        try {
            if (-not $process.Start()) {
                throw "Could not start Buzz presence keeper for $agentId."
            }
            $processRows.Add([pscustomobject][ordered]@{
                agentId = $agentId
                displayName = [string]$agent.displayName
                pid = $process.Id
                startedAt = [DateTimeOffset]::UtcNow.ToString('o')
                mode = 'nostr-presence-only'
            })
        }
        finally {
            $startInfo.EnvironmentVariables['BUZZ_PRIVATE_KEY'] = ''
            $startInfo.EnvironmentVariables['BUZZ_AUTH_TAG'] = ''
            $privateKey = $null
            $authTag = $null
            if ($null -ne $process) { $process.Dispose() }
        }
    }

    $payload = [pscustomobject][ordered]@{
        schemaVersion = 1
        mode = 'nostr-presence-only'
        relayWsUrl = $relayWsUrl
        updatedAt = [DateTimeOffset]::UtcNow.ToString('o')
        processes = @($processRows)
        containsSecrets = $false
    }
    [IO.File]::WriteAllText(
        $processStatePath,
        (($payload | ConvertTo-Json -Depth 10) + [Environment]::NewLine),
        [Text.UTF8Encoding]::new($false)
    )
    $payload
}
finally {
    if ($lockHeld) { $lock.ReleaseMutex() }
    $lock.Dispose()
}
