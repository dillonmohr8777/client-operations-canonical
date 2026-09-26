[CmdletBinding()]
param(
    [ValidateSet('Diagnose', 'Apply')]
    [string]$Action = 'Diagnose',
    [string]$ConfigPath,
    [string]$LocalStatePath,
    [string]$LogsSqlitePath,
    [string]$CodexHome,
    [string]$GpuSafetyScriptPath,
    [string]$EvidenceRoot,
    [switch]$CompactLogs,
    [switch]$RestartDesktop
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($CodexHome)) {
    $CodexHome = Join-Path $env:USERPROFILE '.codex'
}
if ([string]::IsNullOrWhiteSpace($ConfigPath)) {
    $ConfigPath = Join-Path $CodexHome 'config.toml'
}
if ([string]::IsNullOrWhiteSpace($LogsSqlitePath)) {
    $LogsSqlitePath = Join-Path $CodexHome 'logs_2.sqlite'
}
if ([string]::IsNullOrWhiteSpace($GpuSafetyScriptPath)) {
    $GpuSafetyScriptPath = Join-Path $CodexHome 'tools\Set-CodexGpuSafety.ps1'
}
if ([string]::IsNullOrWhiteSpace($EvidenceRoot)) {
    $EvidenceRoot = Join-Path $env:LOCALAPPDATA 'Codex\Reliability'
}

$codexAppTimeoutSeconds = 120
$compactThresholdBytes = 256MB
$storeLocalStateRelative = 'LocalCache\Roaming\Codex\web\Codex\Local State'
$packageFamilyName = 'OpenAI.Codex_2p2nqsd0c76g0'
$appUserModelId = "$packageFamilyName!App"

function Get-CodexStoreLocalStatePaths {
    $paths = New-Object System.Collections.Generic.List[string]
    $packagesRoot = Join-Path $env:LOCALAPPDATA 'Packages'
    if (Test-Path -LiteralPath $packagesRoot) {
        Get-ChildItem -LiteralPath $packagesRoot -Directory -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -like 'OpenAI.Codex_*' } |
            ForEach-Object {
                $candidate = Join-Path $_.FullName $storeLocalStateRelative
                if (Test-Path -LiteralPath $candidate) { $paths.Add($candidate) }
            }
    }
    $roaming = Join-Path $env:APPDATA 'Codex\web\Codex\Local State'
    if (Test-Path -LiteralPath $roaming) { $paths.Add($roaming) }
    @($paths | Select-Object -Unique)
}

function Get-TargetLocalStatePaths {
    if (-not [string]::IsNullOrWhiteSpace($LocalStatePath)) {
        return @($LocalStatePath)
    }
    Get-CodexStoreLocalStatePaths
}

function Set-ChromiumHardwareAccelerationOffText {
    param([Parameter(Mandatory)][string]$Raw)
    $updated = $Raw
    if ($updated -match '"hardware_acceleration_mode_enabled"\s*:') {
        $updated = [regex]::Replace($updated, '"hardware_acceleration_mode_enabled"\s*:\s*(true|false)', '"hardware_acceleration_mode_enabled":false')
    }
    else {
        $updated = [regex]::Replace($updated, '^\s*\{', '{"hardware_acceleration_mode_enabled":false,')
    }
    if ($updated -match '"hardware_acceleration_mode_previous"\s*:') {
        $updated = [regex]::Replace($updated, '"hardware_acceleration_mode_previous"\s*:\s*(true|false)', '"hardware_acceleration_mode_previous":false')
    }
    else {
        $updated = [regex]::Replace($updated, '^\s*\{', '{"hardware_acceleration_mode_previous":false,')
    }
    return $updated
}

function Get-HardwareAccelerationState {
    param([string]$Raw)
    $enabled = $null
    $previous = $null
    if ($Raw -match '"hardware_acceleration_mode_enabled"\s*:\s*(true|false)') {
        $enabled = [bool]::Parse($Matches[1])
    }
    if ($Raw -match '"hardware_acceleration_mode_previous"\s*:\s*(true|false)') {
        $previous = [bool]::Parse($Matches[1])
    }
    [pscustomobject]@{
        EnabledPresent = $null -ne $enabled
        Enabled = $enabled
        Previous = $previous
        Safe = ($enabled -eq $false)
    }
}

function Set-CodexAppStartupTimeoutText {
    param(
        [Parameter(Mandatory)][string]$Text,
        [int]$Seconds = 120
    )
    $sectionPattern = '(?ms)^\[mcp_servers\.codex_app\](.*?)(?=^\[|\z)'
    $assignment = "startup_timeout_sec = $Seconds"
    $sectionMatch = [regex]::Match($Text, $sectionPattern)
    if ($sectionMatch.Success) {
        $body = $sectionMatch.Groups[1].Value
        if ($body -match '(?m)^startup_timeout_sec\s*=') {
            $newBody = [regex]::Replace($body, '(?m)^startup_timeout_sec\s*=\s*.*$', $assignment)
        }
        else {
            $trimmed = $body.TrimStart("`r", "`n")
            $newBody = "`r`n$assignment`r`n$trimmed"
        }
        return $Text.Remove($sectionMatch.Index, $sectionMatch.Length).Insert($sectionMatch.Index, "[mcp_servers.codex_app]$newBody")
    }
    $block = "[mcp_servers.codex_app]`r`n$assignment`r`n`r`n"
    $insertMatch = [regex]::Match($Text, '(?m)^\[mcp_servers\.')
    if ($insertMatch.Success) {
        return $Text.Insert($insertMatch.Index, $block)
    }
    $trimmedText = $Text.TrimEnd()
    return "$trimmedText`r`n`r`n$block"
}

function Get-CodexAppStartupTimeout {
    param([string]$Text)
    $sectionPattern = '(?ms)^\[mcp_servers\.codex_app\](.*?)(?=^\[|\z)'
    if ($Text -notmatch $sectionPattern) { return $null }
    $body = $Matches[1]
    if ($body -match '(?m)^startup_timeout_sec\s*=\s*([0-9]+(?:\.[0-9]+)?)') {
        return [double]$Matches[1]
    }
    return $null
}

function Get-SqliteStats {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        return [pscustomobject]@{ Exists = $false; Bytes = 0; PageCount = $null; FreelistCount = $null }
    }
    $bytes = (Get-Item -LiteralPath $Path).Length
    $python = @'
import os, sqlite3, sys, json
path = sys.argv[1]
info = {"exists": True, "bytes": os.path.getsize(path), "pageCount": None, "freelistCount": None, "error": None}
try:
    con = sqlite3.connect("file:%s?mode=ro" % path.replace("\\", "/"), uri=True, timeout=15)
    try:
        info["pageCount"] = con.execute("PRAGMA page_count").fetchone()[0]
        info["freelistCount"] = con.execute("PRAGMA freelist_count").fetchone()[0]
    finally:
        con.close()
except Exception as exc:
    info["error"] = str(exc)
print(json.dumps(info))
'@
    $pyPath = Join-Path ([IO.Path]::GetTempPath()) ('codex-sqlite-stats-' + [guid]::NewGuid().ToString('N') + '.py')
    [IO.File]::WriteAllText($pyPath, $python)
    try {
        $raw = & python $pyPath $Path
        $parsed = $raw | ConvertFrom-Json
        return [pscustomobject]@{
            Exists = $true
            Bytes = [int64]$bytes
            PageCount = $parsed.pageCount
            FreelistCount = $parsed.freelistCount
            Error = $parsed.error
        }
    }
    finally {
        Remove-Item -LiteralPath $pyPath -Force -ErrorAction SilentlyContinue
    }
}

function Invoke-SqliteVacuumInto {
    param(
        [Parameter(Mandatory)][string]$Source,
        [Parameter(Mandatory)][string]$Destination
    )
    $python = @'
import os, sqlite3, sys
src, dst = sys.argv[1], sys.argv[2]
os.makedirs(os.path.dirname(dst), exist_ok=True)
if os.path.exists(dst):
    os.remove(dst)
con = sqlite3.connect(src, timeout=120)
try:
    con.execute("VACUUM INTO ?", (dst,))
finally:
    con.close()
print(os.path.getsize(dst))
'@
    $pyPath = Join-Path ([IO.Path]::GetTempPath()) ('codex-sqlite-vacuum-' + [guid]::NewGuid().ToString('N') + '.py')
    [IO.File]::WriteAllText($pyPath, $python)
    try {
        $sizeText = & python $pyPath $Source $Destination
        if ($LASTEXITCODE -ne 0) { throw "sqlite VACUUM INTO failed with exit $LASTEXITCODE" }
        return [int64]$sizeText.Trim()
    }
    finally {
        Remove-Item -LiteralPath $pyPath -Force -ErrorAction SilentlyContinue
    }
}

function Get-CodexDesktopProcesses {
    @(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
        $path = [string]$_.ExecutablePath
        if ([string]::IsNullOrWhiteSpace($path)) { return $false }
        if ($path -match 'WindowsApps\\OpenAI\.Codex_') { return $true }
        if ($_.Name -eq 'codex.exe' -and $path -match 'AppData\\Local\\OpenAI\\Codex\\bin\\') { return $true }
        return $false
    } | Select-Object ProcessId, ParentProcessId, Name, WorkingSetSize, ExecutablePath)
}

function Get-LatestConnectionLogSignals {
    $logRoot = Join-Path $env:LOCALAPPDATA 'Codex\Logs'
    if (-not (Test-Path -LiteralPath $logRoot)) { return $null }
    $latest = Get-ChildItem -LiteralPath $logRoot -Recurse -Filter 'codex-desktop-*.log' -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTimeUtc -Descending |
        Select-Object -First 1
    if ($null -eq $latest) { return $null }
    $tail = Get-Content -LiteralPath $latest.FullName -Tail 80 -ErrorAction SilentlyContinue
    $joined = @($tail) -join "`n"
    [pscustomobject]@{
        Path = $latest.FullName
        LastWriteTimeUtc = $latest.LastWriteTimeUtc.ToString('o')
        HasConnected = $joined -match 'hasConnection=true|currentState=connected|next=connected'
        HasDisconnected = $joined -match 'currentState=disconnected'
        CodexAppTimeout = $joined -match 'MCP client for `codex_app` timed out'
        Automations500 = $joined -match 'routePattern=/automations status=500'
    }
}

function Write-Utf8NoBom {
    param([string]$Path, [string]$Text)
    $dir = Split-Path -Parent $Path
    if (-not [string]::IsNullOrWhiteSpace($dir) -and -not (Test-Path -LiteralPath $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    $utf8 = [Text.UTF8Encoding]::new($false)
    [IO.File]::WriteAllText($Path, $Text, $utf8)
}

function Backup-File {
    param([string]$Path, [string]$Stamp)
    if (-not (Test-Path -LiteralPath $Path)) { return $null }
    $backupDir = Join-Path $EvidenceRoot 'ConfigBackups'
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    $name = (Split-Path -Leaf $Path) + ".pre-connection-repair-$Stamp"
    $destination = Join-Path $backupDir $name
    Copy-Item -LiteralPath $Path -Destination $destination -Force
    return $destination
}

$now = [DateTimeOffset]::UtcNow
$stamp = $now.ToString('yyyyMMdd-HHmmss')
$result = [ordered]@{
    schemaVersion = 1
    action = $Action
    checkedAtUtc = $now.ToString('o')
    machine = $env:COMPUTERNAME
    appVersion = $null
    processes = @()
    localState = @()
    config = $null
    sqlite = $null
    connectionLog = $null
    changes = @()
    restart = $null
    ok = $false
}

try {
    $pkg = Get-AppxPackage -Name 'OpenAI.Codex' -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($null -ne $pkg) { $result.appVersion = [string]$pkg.Version }

    $result.processes = @(Get-CodexDesktopProcesses | ForEach-Object {
        [pscustomobject]@{
            pid = $_.ProcessId
            name = $_.Name
            wsMB = [math]::Round(($_.WorkingSetSize / 1MB), 1)
        }
    })
    $result.connectionLog = Get-LatestConnectionLogSignals
    $result.sqlite = Get-SqliteStats -Path $LogsSqlitePath

    $configText = $null
    $configExists = Test-Path -LiteralPath $ConfigPath
    if ($configExists) {
        $configText = [IO.File]::ReadAllText($ConfigPath)
    }
    $timeout = if ($null -ne $configText) { Get-CodexAppStartupTimeout -Text $configText } else { $null }
    $result.config = [pscustomobject]@{
        path = $ConfigPath
        exists = $configExists
        codexAppStartupTimeoutSec = $timeout
        timeoutOk = ($timeout -ge $codexAppTimeoutSeconds)
    }

    foreach ($path in @(Get-TargetLocalStatePaths)) {
        $raw = [IO.File]::ReadAllText($path)
        $state = Get-HardwareAccelerationState -Raw $raw
        $result.localState += [pscustomobject]@{
            path = $path
            enabledPresent = $state.EnabledPresent
            enabled = $state.Enabled
            previous = $state.Previous
            safe = $state.Safe
        }
    }

    if ($Action -eq 'Diagnose') {
        $result.ok = $true
        $result | ConvertTo-Json -Depth 8
        return
    }

    $changes = New-Object System.Collections.Generic.List[string]

    if ($RestartDesktop) {
        $targets = @(Get-CodexDesktopProcesses)
        foreach ($proc in $targets) {
            Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue
        }
        $deadline = (Get-Date).AddSeconds(30)
        do {
            Start-Sleep -Milliseconds 400
            $remaining = @(Get-CodexDesktopProcesses)
        } while ($remaining.Count -gt 0 -and (Get-Date) -lt $deadline)
        $changes.Add("stopped-desktop-processes:$($targets.Count)")
        $result.restart = [ordered]@{ stopped = $targets.Count; launched = $false }
    }

    foreach ($path in @(Get-TargetLocalStatePaths)) {
        if (-not (Test-Path -LiteralPath $path) -and -not [string]::IsNullOrWhiteSpace($LocalStatePath)) {
            $parent = Split-Path -Parent $path
            if (-not (Test-Path -LiteralPath $parent)) {
                New-Item -ItemType Directory -Path $parent -Force | Out-Null
            }
            Write-Utf8NoBom -Path $path -Text '{}'
        }
        if (-not (Test-Path -LiteralPath $path)) { continue }
        Backup-File -Path $path -Stamp $stamp | Out-Null
        $raw = [IO.File]::ReadAllText($path)
        $updated = Set-ChromiumHardwareAccelerationOffText -Raw $raw
        if ($updated -ne $raw) {
            $temp = "$path.connection-repair.tmp"
            Write-Utf8NoBom -Path $temp -Text $updated
            Move-Item -LiteralPath $temp -Destination $path -Force
            $changes.Add("gpu-safety:$path")
        }
    }

    if ($configExists) {
        Backup-File -Path $ConfigPath -Stamp $stamp | Out-Null
        $updatedConfig = Set-CodexAppStartupTimeoutText -Text $configText -Seconds $codexAppTimeoutSeconds
        if ($updatedConfig -ne $configText) {
            $temp = "$ConfigPath.connection-repair.tmp"
            Write-Utf8NoBom -Path $temp -Text $updatedConfig
            Move-Item -LiteralPath $temp -Destination $ConfigPath -Force
            $changes.Add("mcp-timeout:$ConfigPath")
        }
        if ($updatedConfig -notmatch '(?m)^keepRemoteControlAwakeWhilePluggedIn\s*=\s*true') {
            if ($updatedConfig -match '(?m)^keepRemoteControlAwakeWhilePluggedIn\s*=') {
                $updatedConfig = [regex]::Replace($updatedConfig, '(?m)^keepRemoteControlAwakeWhilePluggedIn\s*=\s*.*$', 'keepRemoteControlAwakeWhilePluggedIn = true')
            }
            elseif ($updatedConfig -match '(?m)^\[desktop\]') {
                $updatedConfig = [regex]::Replace($updatedConfig, '(?m)^\[desktop\]', "[desktop]`r`nkeepRemoteControlAwakeWhilePluggedIn = true")
            }
            $temp = "$ConfigPath.connection-repair.tmp"
            Write-Utf8NoBom -Path $temp -Text $updatedConfig
            Move-Item -LiteralPath $temp -Destination $ConfigPath -Force
            $changes.Add('remote-control-awake')
        }
    }

    if ($GpuSafetyScriptPath -notmatch 'client-operations' -and -not [string]::IsNullOrWhiteSpace($GpuSafetyScriptPath)) {
        $safetyDir = Split-Path -Parent $GpuSafetyScriptPath
        if (Test-Path -LiteralPath $safetyDir) {
            $expectedNeedle = 'Packages\OpenAI.Codex'
            $needsWrite = -not (Test-Path -LiteralPath $GpuSafetyScriptPath) -or ([IO.File]::ReadAllText($GpuSafetyScriptPath) -notmatch [regex]::Escape($expectedNeedle))
            if ($needsWrite) {
                if (Test-Path -LiteralPath $GpuSafetyScriptPath) {
                    Backup-File -Path $GpuSafetyScriptPath -Stamp $stamp | Out-Null
                }
                $gpuSafety = @'
[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

$storeState = Join-Path $env:LOCALAPPDATA "Packages\OpenAI.Codex_2p2nqsd0c76g0\LocalCache\Roaming\Codex\web\Codex\Local State"
$roamingState = Join-Path $env:APPDATA "Codex\web\Codex\Local State"
$localStatePath = if (Test-Path -LiteralPath $storeState) { $storeState } else { $roamingState }
$backupRoot = Join-Path $env:LOCALAPPDATA "Codex\Reliability\ConfigBackups"

if (-not (Test-Path -LiteralPath $localStatePath)) {
    throw "Codex Local State was not found at $localStatePath"
}

New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null

$raw = [System.IO.File]::ReadAllText($localStatePath)
if ($raw -match '"hardware_acceleration_mode_enabled"\s*:') {
    $raw = [regex]::Replace($raw, '"hardware_acceleration_mode_enabled"\s*:\s*(true|false)', '"hardware_acceleration_mode_enabled":false')
} else {
    $raw = [regex]::Replace($raw, '^\s*\{', '{"hardware_acceleration_mode_enabled":false,')
}
if ($raw -match '"hardware_acceleration_mode_previous"\s*:') {
    $raw = [regex]::Replace($raw, '"hardware_acceleration_mode_previous"\s*:\s*(true|false)', '"hardware_acceleration_mode_previous":false')
} else {
    $raw = [regex]::Replace($raw, '^\s*\{', '{"hardware_acceleration_mode_previous":false,')
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = Join-Path $backupRoot "Codex-Local-State.pre-gpu-safety-$timestamp.json"
Copy-Item -LiteralPath $localStatePath -Destination $backupPath -Force

$tempPath = "$localStatePath.gpu-safety.tmp"
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText($tempPath, $raw, $utf8NoBom)
Move-Item -LiteralPath $tempPath -Destination $localStatePath -Force

$verifyRaw = [System.IO.File]::ReadAllText($localStatePath)
$result = [pscustomobject]@{
    LocalStatePath = $localStatePath
    BackupPath = $backupPath
    HardwareAccelerationEnabled = [bool]($verifyRaw -match '"hardware_acceleration_mode_enabled"\s*:\s*false')
    PreviousHardwareAccelerationMode = [bool]($verifyRaw -match '"hardware_acceleration_mode_previous"\s*:\s*false')
    AppliedAtUtc = (Get-Date).ToUniversalTime().ToString("o")
}

$result | ConvertTo-Json -Compress
'@
                Write-Utf8NoBom -Path $GpuSafetyScriptPath -Text $gpuSafety
                $changes.Add('gpu-safety-script-path')
            }
        }
    }

    $pluginMcp = Join-Path $CodexHome 'plugins\cache\openai-bundled\codex-app-tools\0.1.3\desktop-mcp.json'
    if (Test-Path -LiteralPath $pluginMcp) {
        $pluginJson = Get-Content -LiteralPath $pluginMcp -Raw | ConvertFrom-Json
        if ($pluginJson.mcpServers.codex_app.startup_timeout_sec -lt $codexAppTimeoutSeconds) {
            Backup-File -Path $pluginMcp -Stamp $stamp | Out-Null
            $pluginJson.mcpServers.codex_app.startup_timeout_sec = $codexAppTimeoutSeconds
            Write-Utf8NoBom -Path $pluginMcp -Text (($pluginJson | ConvertTo-Json -Depth 20) + [Environment]::NewLine)
            $changes.Add('plugin-codex-app-timeout')
        }
    }

    $sqliteBytes = 0
    if (Test-Path -LiteralPath $LogsSqlitePath) {
        $sqliteBytes = (Get-Item -LiteralPath $LogsSqlitePath).Length
    }
    $shouldCompact = [bool]$CompactLogs -or ($RestartDesktop -and $sqliteBytes -ge $compactThresholdBytes)
    if ($shouldCompact -and (Test-Path -LiteralPath $LogsSqlitePath)) {
        $backupDir = Join-Path $EvidenceRoot ("log-compact-" + $stamp)
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
        $compactPath = Join-Path $backupDir 'logs_2.sqlite.compact'
        $compactBytes = Invoke-SqliteVacuumInto -Source $LogsSqlitePath -Destination $compactPath
        if ($RestartDesktop) {
            foreach ($suffix in @('', '-wal', '-shm')) {
                $live = "$LogsSqlitePath$suffix"
                if (Test-Path -LiteralPath $live) {
                    Move-Item -LiteralPath $live -Destination (Join-Path $backupDir (Split-Path -Leaf $live)) -Force
                }
            }
            Copy-Item -LiteralPath $compactPath -Destination $LogsSqlitePath -Force
            $changes.Add("sqlite-compact:$compactBytes")
        }
        else {
            $changes.Add("sqlite-compact-prepared:$compactBytes")
        }
        $result.sqlite = Get-SqliteStats -Path $LogsSqlitePath
    }

    if ($RestartDesktop) {
        Start-Process -FilePath "$env:SystemRoot\explorer.exe" -ArgumentList "shell:AppsFolder\$appUserModelId" | Out-Null
        $launchDeadline = (Get-Date).AddSeconds(45)
        $launched = $false
        do {
            Start-Sleep -Milliseconds 500
            $running = @(Get-CodexDesktopProcesses | Where-Object Name -eq 'ChatGPT.exe')
            if ($running.Count -gt 0) { $launched = $true; break }
        } while ((Get-Date) -lt $launchDeadline)
        $result.restart.launched = $launched
        $changes.Add("restart-launched:$launched")
        Start-Sleep -Seconds 6
        $result.processes = @(Get-CodexDesktopProcesses | ForEach-Object {
            [pscustomobject]@{
                pid = $_.ProcessId
                name = $_.Name
                wsMB = [math]::Round(($_.WorkingSetSize / 1MB), 1)
            }
        })
        $result.connectionLog = Get-LatestConnectionLogSignals
    }

    $result.changes = @($changes)
    $gpuSafe = @($result.localState | Where-Object { -not $_.safe }).Count -eq 0 -or @($result.localState).Count -eq 0
    if ($Action -eq 'Apply') {
        $configTextAfter = if (Test-Path -LiteralPath $ConfigPath) { [IO.File]::ReadAllText($ConfigPath) } else { '' }
        $timeoutAfter = Get-CodexAppStartupTimeout -Text $configTextAfter
        $result.config.codexAppStartupTimeoutSec = $timeoutAfter
        $result.config.timeoutOk = ($timeoutAfter -ge $codexAppTimeoutSeconds)
        $result.localState = @()
        foreach ($path in @(Get-TargetLocalStatePaths)) {
            if (-not (Test-Path -LiteralPath $path)) { continue }
            $raw = [IO.File]::ReadAllText($path)
            $state = Get-HardwareAccelerationState -Raw $raw
            $result.localState += [pscustomobject]@{
                path = $path
                enabledPresent = $state.EnabledPresent
                enabled = $state.Enabled
                previous = $state.Previous
                safe = $state.Safe
            }
        }
        $gpuSafe = @($result.localState | Where-Object { -not $_.safe }).Count -eq 0
        $result.ok = [bool]$result.config.timeoutOk -and $gpuSafe -and (-not $RestartDesktop -or [bool]$result.restart.launched)
    }

    New-Item -ItemType Directory -Path $EvidenceRoot -Force | Out-Null
    $evidencePath = Join-Path $EvidenceRoot ("connection-repair-" + $stamp + '.json')
    Write-Utf8NoBom -Path $evidencePath -Text (($result | ConvertTo-Json -Depth 8) + [Environment]::NewLine)
    $result.evidencePath = $evidencePath
    $result | ConvertTo-Json -Depth 8
}
catch {
    $result.ok = $false
    $result.error = $_.Exception.Message
    $result | ConvertTo-Json -Depth 8
    exit 1
}
