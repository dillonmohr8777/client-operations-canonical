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
$acpPath = 'C:\Users\dillo\AppData\Local\Buzz\buzz-acp.exe'
if (-not (Test-Path -LiteralPath $statePath -PathType Leaf)) { throw 'Run Install-MarketingChiefBuzzTeam.ps1 first.' }
if (-not (Test-Path -LiteralPath $acpPath -PathType Leaf)) { throw 'Official Buzz ACP is not installed.' }
if (-not (Test-Path -LiteralPath $stackBindingsPath -PathType Leaf)) { throw 'Buzz stack bindings are missing.' }
$state = Get-Content -Raw -LiteralPath $statePath -Encoding UTF8 | ConvertFrom-Json
if ([string]$state.status -ne 'ready') { throw 'Buzz hosted-community provisioning is not ready.' }
$relayWsUrl = [string]$state.relayWsUrl
if ($relayWsUrl -notmatch '^wss://[A-Za-z0-9.-]+(?::\d{2,5})?/?$') { throw 'Buzz runtime relay is invalid.' }
$ownerPublicKey = [string]$state.ownerPublicKey
$allowlist = (@($state.identities | Where-Object { [string]$_.harness -ne 'owner' } | ForEach-Object { [string]$_.publicKey }) -join ',')
$existing = if (Test-Path -LiteralPath $processPath -PathType Leaf) {
    Get-Content -Raw -LiteralPath $processPath -Encoding UTF8 | ConvertFrom-Json
} else { $null }

if ($Restart -and $null -ne $existing) {
    foreach ($row in @($existing.processes)) {
        $process = Get-Process -Id ([int]$row.pid) -ErrorAction SilentlyContinue
        if ($null -ne $process -and $process.Path -eq $acpPath) { Stop-Process -Id $process.Id -Force }
    }
}

$processRows = [Collections.Generic.List[object]]::new()
foreach ($agent in @($manifest.agents)) {
    $old = if ($null -ne $existing) { @($existing.processes | Where-Object { [string]$_.agentId -ceq [string]$agent.id })[0] } else { $null }
    $running = if ($null -ne $old) { Get-Process -Id ([int]$old.pid) -ErrorAction SilentlyContinue } else { $null }
    if ($null -ne $running -and $running.Path -eq $acpPath -and -not $Restart) {
        $processRows.Add($old)
        continue
    }

    $privateKey = Get-MarketingChiefBuzzPrivateKey -Target ([string]$agent.credentialTarget)
    $adapter = if ([string]$agent.harness -ceq 'claude') {
        'C:\Users\dillo\AppData\Roaming\npm\claude-agent-acp.cmd'
    } else {
        'C:\Users\dillo\AppData\Roaming\npm\codex-acp.cmd'
    }
    if (-not (Test-Path -LiteralPath $adapter -PathType Leaf)) { throw "ACP adapter is missing for $($agent.id)." }
    $startInfo = [Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = $acpPath
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.WorkingDirectory = 'C:\Users\dillo\Documents\Codex\projects\client-operations'
    $startInfo.EnvironmentVariables['BUZZ_PRIVATE_KEY'] = $privateKey
    $startInfo.EnvironmentVariables['BUZZ_RELAY_URL'] = $relayWsUrl.TrimEnd('/')
    $startInfo.EnvironmentVariables['BUZZ_ACP_AGENT_OWNER'] = $ownerPublicKey
    $startInfo.EnvironmentVariables['BUZZ_ACP_AGENT_COMMAND'] = 'C:\Windows\System32\cmd.exe'
    $startInfo.EnvironmentVariables['BUZZ_ACP_AGENT_ARGS'] = '/d /s /c ""' + $adapter + '""'
    $startInfo.EnvironmentVariables['BUZZ_ACP_SYSTEM_PROMPT_FILE'] = Join-Path $PSScriptRoot ([string]$agent.promptFile)
    $startInfo.EnvironmentVariables['BUZZ_ACP_TEAM_INSTRUCTIONS'] = [IO.File]::ReadAllText($teamRulesPath) + [Environment]::NewLine + [Environment]::NewLine + '# Declared operating stack' + [Environment]::NewLine + [IO.File]::ReadAllText($stackBindingsPath)
    $startInfo.EnvironmentVariables['BUZZ_ACP_AGENTS'] = '1'
    $startInfo.EnvironmentVariables['BUZZ_ACP_CONTEXT_MESSAGE_LIMIT'] = '16'
    $startInfo.EnvironmentVariables['BUZZ_ACP_MAX_TURNS_PER_SESSION'] = '24'
    $startInfo.EnvironmentVariables['BUZZ_ACP_RESPOND_TO'] = 'allowlist'
    $startInfo.EnvironmentVariables['BUZZ_ACP_RESPOND_TO_ALLOWLIST'] = $allowlist
    $startInfo.EnvironmentVariables['BUZZ_ACP_ALLOWED_RESPOND_TO'] = 'owner-only,allowlist'
    $startInfo.EnvironmentVariables['BUZZ_ACP_PERMISSION_MODE'] = 'accept-edits'
    $startInfo.EnvironmentVariables['BUZZ_ACP_SESSION_TITLE'] = 'Marketing Chief · ' + [string]$agent.displayName
    $startInfo.EnvironmentVariables['BUZZ_ACP_LAZY_POOL'] = 'true'
    $process = [Diagnostics.Process]::new()
    $process.StartInfo = $startInfo
    try {
        if (-not $process.Start()) { throw "Could not start Buzz ACP for $($agent.id)." }
        $processRows.Add([pscustomobject][ordered]@{
            agentId = [string]$agent.id
            displayName = [string]$agent.displayName
            harness = [string]$agent.harness
            pid = $process.Id
            startedAt = [DateTimeOffset]::UtcNow.ToString('o')
        })
    }
    finally {
        $startInfo.EnvironmentVariables['BUZZ_PRIVATE_KEY'] = ''
        $privateKey = $null
        if ($null -ne $process) { $process.Dispose() }
    }
}

$payload = [pscustomobject][ordered]@{
    schemaVersion = 1
    relayWsUrl = $relayWsUrl
    startedAt = [DateTimeOffset]::UtcNow.ToString('o')
    processes = @($processRows)
}
[IO.File]::WriteAllText($processPath, (($payload | ConvertTo-Json -Depth 10) + [Environment]::NewLine), [Text.UTF8Encoding]::new($false))
$payload
