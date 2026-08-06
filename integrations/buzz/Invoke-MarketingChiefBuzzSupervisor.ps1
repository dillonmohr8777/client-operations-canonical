[CmdletBinding()]
param([switch]$Restart)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
. (Join-Path $PSScriptRoot 'MarketingChief.BuzzCredential.ps1')

$manifest = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'team.manifest.json') -Encoding UTF8 | ConvertFrom-Json
$runtimeRoot = Join-Path $PSScriptRoot 'runtime'
$statePath = Join-Path $runtimeRoot 'team-state.json'
$processPath = Join-Path $runtimeRoot 'processes.json'
$teamRulesPath = Join-Path $PSScriptRoot 'prompts\team-rules.md'
$stackBindingsPath = Join-Path $PSScriptRoot 'stack.bindings.json'
$skillAssignmentsPath = Join-Path $PSScriptRoot 'skills.assignments.json'
$acpPath = 'C:\Users\dillo\AppData\Local\Buzz\buzz-acp.exe'
$codexAdapterPath = 'C:\Users\dillo\AppData\Roaming\npm\codex-acp.cmd'
$claudeAdapterPath = 'C:\Users\dillo\AppData\Roaming\npm\claude-agent-acp.cmd'
if (-not (Test-Path -LiteralPath $statePath -PathType Leaf)) { throw 'Run Install-MarketingChiefBuzzTeam.ps1 first.' }
if (-not (Test-Path -LiteralPath $acpPath -PathType Leaf)) { throw 'Official Buzz ACP is not installed.' }
if (-not (Test-Path -LiteralPath $stackBindingsPath -PathType Leaf)) { throw 'Buzz stack bindings are missing.' }
if (-not (Test-Path -LiteralPath $skillAssignmentsPath -PathType Leaf)) { throw 'Buzz skill assignments are missing.' }
$state = Get-Content -Raw -LiteralPath $statePath -Encoding UTF8 | ConvertFrom-Json
if ([string]$state.status -ne 'ready') { throw 'Buzz hosted-community provisioning is not ready.' }
$relayWsUrl = [string]$state.relayWsUrl
if ($relayWsUrl -notmatch '^wss://[A-Za-z0-9.-]+(?::\d{2,5})?/?$') { throw 'Buzz runtime relay is invalid.' }
$ownerPublicKey = [string]$state.ownerPublicKey
$allowlist = (@(
    $ownerPublicKey
    $state.identities | Where-Object { [string]$_.harness -ne 'owner' } | ForEach-Object { [string]$_.publicKey }
) | Sort-Object -Unique) -join ','
$identityMode = if ($state.PSObject.Properties.Name -contains 'identityMode') { [string]$state.identityMode } else { 'bridge-managed' }
$existing = if (Test-Path -LiteralPath $processPath -PathType Leaf) {
    Get-Content -Raw -LiteralPath $processPath -Encoding UTF8 | ConvertFrom-Json
} else { $null }

function Test-ClaudeAcpAuthentication {
    if (-not (Test-Path -LiteralPath $claudeAdapterPath -PathType Leaf)) { return $false }
    $startInfo = [Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = 'C:\Windows\System32\cmd.exe'
    $startInfo.Arguments = '/d /c ' + $claudeAdapterPath + ' --cli auth status'
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $process = [Diagnostics.Process]::new()
    $process.StartInfo = $startInfo
    try {
        if (-not $process.Start()) { return $false }
        if (-not $process.WaitForExit(10000)) {
            try { $process.Kill() } catch { }
            return $false
        }
        if ($process.ExitCode -ne 0) { return $false }
        $status = $process.StandardOutput.ReadToEnd() | ConvertFrom-Json
        return [bool]$status.loggedIn
    }
    catch { return $false }
    finally {
        if ($null -ne $process) { $process.Dispose() }
    }
}

$claudeRequested = @($manifest.agents | Where-Object { [string]$_.harness -ceq 'claude' }).Count -gt 0
$claudeAuthenticated = if ($claudeRequested) { Test-ClaudeAcpAuthentication } else { $false }

if ($identityMode -ceq 'native-managed') {
    if ($Restart) { throw 'Buzz Desktop owns native managed-agent restarts. Restart the desktop app instead.' }
    $desktopPath = 'C:\Users\dillo\AppData\Local\Buzz\buzz-desktop.exe'
    $desktopRows = @(Get-CimInstance Win32_Process |
        Where-Object { $_.Name -ceq 'buzz-desktop.exe' -and [string]$_.ExecutablePath -ceq $desktopPath })
    if ($desktopRows.Count -ne 1) {
        throw "Expected exactly one official Buzz Desktop process; found $($desktopRows.Count)."
    }
    $desktopPid = [int]$desktopRows[0].ProcessId
    $nativeRows = @(Get-CimInstance Win32_Process |
        Where-Object {
            $_.Name -ceq 'buzz-acp.exe' -and
            [int]$_.ParentProcessId -eq $desktopPid -and
            [string]$_.ExecutablePath -ceq $acpPath
        } |
        Sort-Object ProcessId)
    if ($nativeRows.Count -ne @($manifest.agents).Count) {
        throw "Buzz Desktop is supervising $($nativeRows.Count) managed agents; expected $(@($manifest.agents).Count)."
    }
    $nativeProcessRows = [Collections.Generic.List[object]]::new()
    for ($index = 0; $index -lt $nativeRows.Count; $index += 1) {
        $nativeProcessRows.Add([pscustomobject][ordered]@{
            slot = $index + 1
            pid = [int]$nativeRows[$index].ProcessId
            parentPid = $desktopPid
            path = $acpPath
            managedBy = 'buzz-desktop'
        })
    }
    $nativePayload = [pscustomobject][ordered]@{
        schemaVersion = 2
        mode = 'native-managed'
        relayWsUrl = $relayWsUrl
        desktopPid = $desktopPid
        checkedAt = [DateTimeOffset]::UtcNow.ToString('o')
        processes = @($nativeProcessRows)
    }
    [IO.File]::WriteAllText($processPath, (($nativePayload | ConvertTo-Json -Depth 10) + [Environment]::NewLine), [Text.UTF8Encoding]::new($false))
    $nativePayload
    return
}

if ($Restart -and $null -ne $existing) {
    foreach ($row in @($existing.processes)) {
        $process = Get-Process -Id ([int]$row.pid) -ErrorAction SilentlyContinue
        if ($null -ne $process -and $process.Path -eq $acpPath) { Stop-Process -Id $process.Id -Force }
    }
}

$processRows = [Collections.Generic.List[object]]::new()
foreach ($agent in @($manifest.agents)) {
    $old = $null
    if ($null -ne $existing) {
        $oldMatches = @($existing.processes | Where-Object {
            $_.PSObject.Properties.Name -contains 'agentId' -and
            [string]$_.agentId -ceq [string]$agent.id
        })
        if ($oldMatches.Count) { $old = $oldMatches[0] }
    }
    $running = if ($null -ne $old) { Get-Process -Id ([int]$old.pid) -ErrorAction SilentlyContinue } else { $null }
    if ($null -ne $running -and $running.Path -eq $acpPath -and -not $Restart) {
        $processRows.Add($old)
        continue
    }

    $privateKey = Get-MarketingChiefBuzzPrivateKey -Target ([string]$agent.credentialTarget)
    $authTag = Get-MarketingChiefBuzzAuthTag -Target ([string]$agent.authTagCredentialTarget)
    $requestedHarness = [string]$agent.harness
    $effectiveHarness = if ($requestedHarness -ceq 'claude' -and -not $claudeAuthenticated) {
        'codex'
    } else {
        $requestedHarness
    }
    $adapter = if ($effectiveHarness -ceq 'claude') { $claudeAdapterPath } else { $codexAdapterPath }
    if (-not (Test-Path -LiteralPath $adapter -PathType Leaf)) { throw "ACP adapter is missing for $($agent.id)." }
    $startInfo = [Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = $acpPath
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.WorkingDirectory = 'C:\Users\dillo\Documents\Codex\projects\client-operations'
    $startInfo.EnvironmentVariables['BUZZ_PRIVATE_KEY'] = $privateKey
    $startInfo.EnvironmentVariables['BUZZ_AUTH_TAG'] = $authTag
    $startInfo.EnvironmentVariables['BUZZ_RELAY_URL'] = $relayWsUrl.TrimEnd('/')
    $startInfo.EnvironmentVariables['BUZZ_ACP_AGENT_OWNER'] = $ownerPublicKey
    $startInfo.EnvironmentVariables['BUZZ_ACP_AGENT_COMMAND'] = 'C:\Windows\System32\cmd.exe'
    # buzz-acp tokenizes BUZZ_ACP_AGENT_ARGS itself. These installed adapter paths
    # contain no spaces, so embedded quotes would become literal characters for cmd.
    $startInfo.EnvironmentVariables['BUZZ_ACP_AGENT_ARGS'] = '/d /c ' + $adapter
    if ($effectiveHarness -ceq 'codex') {
        # Dillon explicitly authorizes the Buzz team to use the full local
        # Marketing Chief tool surface. The Codex ACP adapter reads this
        # before session/new and maps it to approval=never plus
        # danger-full-access. Existing team rules still gate delivery, spend,
        # account changes, publishing, and destructive actions.
        $startInfo.EnvironmentVariables['INITIAL_AGENT_MODE'] = 'agent-full-access'
    }
    $startInfo.EnvironmentVariables['BUZZ_ACP_SYSTEM_PROMPT_FILE'] = Join-Path $PSScriptRoot ([string]$agent.promptFile)
    $startInfo.EnvironmentVariables['BUZZ_ACP_TEAM_INSTRUCTIONS'] = [IO.File]::ReadAllText($teamRulesPath) + [Environment]::NewLine + [Environment]::NewLine + '# Declared operating stack' + [Environment]::NewLine + [IO.File]::ReadAllText($stackBindingsPath) + [Environment]::NewLine + [Environment]::NewLine + '# Designated skill assignments' + [Environment]::NewLine + [IO.File]::ReadAllText($skillAssignmentsPath)
    $startInfo.EnvironmentVariables['BUZZ_ACP_AGENTS'] = '1'
    $startInfo.EnvironmentVariables['BUZZ_ACP_CONTEXT_MESSAGE_LIMIT'] = '16'
    $startInfo.EnvironmentVariables['BUZZ_ACP_MAX_TURNS_PER_SESSION'] = '24'
    $startInfo.EnvironmentVariables['BUZZ_ACP_RESPOND_TO'] = 'allowlist'
    $startInfo.EnvironmentVariables['BUZZ_ACP_RESPOND_TO_ALLOWLIST'] = $allowlist
    $startInfo.EnvironmentVariables['BUZZ_ACP_ALLOWED_RESPOND_TO'] = 'owner-only,allowlist'
    # codex-acp advertises read-only, agent, and agent-full-access. Claude uses
    # bypassPermissions. Avoid applying a Claude-only mode to Codex sessions.
    $startInfo.EnvironmentVariables['BUZZ_ACP_PERMISSION_MODE'] = if ($effectiveHarness -ceq 'codex') {
        'default'
    } else {
        'bypass-permissions'
    }
    $startInfo.EnvironmentVariables['BUZZ_ACP_SESSION_TITLE'] = 'Marketing Chief · ' + [string]$agent.displayName
    $startInfo.EnvironmentVariables['BUZZ_ACP_LAZY_POOL'] = 'true'
    $process = [Diagnostics.Process]::new()
    $process.StartInfo = $startInfo
    try {
        if (-not $process.Start()) { throw "Could not start Buzz ACP for $($agent.id)." }
        $processRows.Add([pscustomobject][ordered]@{
            agentId = [string]$agent.id
            displayName = [string]$agent.displayName
            harness = $effectiveHarness
            requestedHarness = $requestedHarness
            fallbackApplied = $effectiveHarness -cne $requestedHarness
            pid = $process.Id
            startedAt = [DateTimeOffset]::UtcNow.ToString('o')
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
    schemaVersion = 2
    relayWsUrl = $relayWsUrl
    claudeAuthenticated = $claudeAuthenticated
    startedAt = [DateTimeOffset]::UtcNow.ToString('o')
    processes = @($processRows)
}
[IO.File]::WriteAllText($processPath, (($payload | ConvertTo-Json -Depth 10) + [Environment]::NewLine), [Text.UTF8Encoding]::new($false))
$payload
