[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptPath = Join-Path $PSScriptRoot 'Repair-CodexDesktopConnection.ps1'
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Repair script is missing: $scriptPath"
}

$null = [scriptblock]::Create((Get-Content -LiteralPath $scriptPath -Raw -Encoding UTF8))

$tempRoot = Join-Path $env:TEMP ('codex-connection-tests-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tempRoot -Force | Out-Null

function Invoke-Repair {
    param([string[]]$Arguments)
    $output = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $scriptPath @Arguments 2>&1
    $exitCode = $LASTEXITCODE
    [pscustomobject]@{
        exitCode = $exitCode
        output = ($output | Out-String)
        json = try { $output | ConvertFrom-Json } catch { $null }
    }
}

try {
    $configPath = Join-Path $tempRoot 'config.toml'
    $localStatePath = Join-Path $tempRoot 'Local State'
    $sqlitePath = Join-Path $tempRoot 'logs_2.sqlite'
    $evidenceRoot = Join-Path $tempRoot 'evidence'
    $gpuSafetyPath = Join-Path $tempRoot 'tools\Set-CodexGpuSafety.ps1'

    $config = @"
[plugins."codex-app-tools@openai-bundled"]
enabled = true

[mcp_servers.codex_apps]
command = "placeholder"

[mcp_servers.node_repl]
startup_timeout_sec = 30

[desktop]
keepRemoteControlAwakeWhilePluggedIn = false
"@
    [IO.File]::WriteAllText($configPath, $config)
    [IO.File]::WriteAllText($localStatePath, '{"hardware_acceleration_mode_previous":true,"chrome_labs_activation_threshold":87}')

    $apply = Invoke-Repair -Arguments @(
        '-Action', 'Apply',
        '-CodexHome', $tempRoot,
        '-ConfigPath', $configPath,
        '-LocalStatePath', $localStatePath,
        '-LogsSqlitePath', $sqlitePath,
        '-GpuSafetyScriptPath', $gpuSafetyPath,
        '-EvidenceRoot', $evidenceRoot
    )
    if ($apply.exitCode -ne 0) {
        throw "Apply failed: $($apply.output)"
    }
    if ($null -eq $apply.json -or $apply.json.ok -ne $true) {
        throw "Apply did not report ok. Output: $($apply.output)"
    }

    $configAfter = [IO.File]::ReadAllText($configPath)
    if ($configAfter -notmatch '(?m)^\[mcp_servers\.codex_app\]' ) {
        throw 'Apply did not insert [mcp_servers.codex_app].'
    }
    if ($configAfter -notmatch '(?m)^startup_timeout_sec = 120') {
        throw 'Apply did not set startup_timeout_sec = 120.'
    }
    if ($configAfter -notmatch '(?m)^\[mcp_servers\.codex_apps\]') {
        throw 'Apply mutated the unrelated codex_apps MCP section.'
    }
    if ($configAfter -notmatch '(?m)^keepRemoteControlAwakeWhilePluggedIn = true') {
        throw 'Apply did not keep remote control awake.'
    }

    $stateAfter = [IO.File]::ReadAllText($localStatePath)
    if ($stateAfter -notmatch '"hardware_acceleration_mode_enabled":false') {
        throw 'Apply did not disable hardware acceleration.'
    }
    if ($stateAfter -notmatch '"hardware_acceleration_mode_previous":false') {
        throw 'Apply did not clear previous hardware acceleration mode.'
    }
    if ($stateAfter -notmatch '"chrome_labs_activation_threshold":87') {
        throw 'Apply rewrote unrelated Local State fields.'
    }

    $again = Invoke-Repair -Arguments @(
        '-Action', 'Apply',
        '-CodexHome', $tempRoot,
        '-ConfigPath', $configPath,
        '-LocalStatePath', $localStatePath,
        '-LogsSqlitePath', $sqlitePath,
        '-GpuSafetyScriptPath', $gpuSafetyPath,
        '-EvidenceRoot', $evidenceRoot
    )
    if ($again.exitCode -ne 0 -or $again.json.ok -ne $true) {
        throw "Idempotent apply failed: $($again.output)"
    }

    $diagnose = Invoke-Repair -Arguments @(
        '-Action', 'Diagnose',
        '-CodexHome', $tempRoot,
        '-ConfigPath', $configPath,
        '-LocalStatePath', $localStatePath,
        '-LogsSqlitePath', $sqlitePath,
        '-EvidenceRoot', $evidenceRoot
    )
    if ($diagnose.exitCode -ne 0 -or $diagnose.json.config.timeoutOk -ne $true) {
        throw "Diagnose did not confirm the timeout repair: $($diagnose.output)"
    }
    if ($diagnose.json.localState[0].safe -ne $true) {
        throw 'Diagnose did not confirm GPU-safe Local State.'
    }

    [pscustomobject]@{
        status = 'passed'
        applyChanges = @($apply.json.changes)
        timeoutSec = $diagnose.json.config.codexAppStartupTimeoutSec
    } | ConvertTo-Json -Compress
}
finally {
    Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
}
