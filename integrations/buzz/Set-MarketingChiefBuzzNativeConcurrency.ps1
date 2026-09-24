[CmdletBinding()]
param(
    [ValidateRange(1, 32)]
    [int]$Parallelism = 1
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$configPath = 'C:\Users\dillo\AppData\Roaming\xyz.block.buzz.app\agents\managed-agents.json'
$desktopPath = 'C:\Users\dillo\AppData\Local\Buzz\buzz-desktop.exe'
$acpPath = 'C:\Users\dillo\AppData\Local\Buzz\buzz-acp.exe'
$expectedNames = @(
    'Marketing Chief',
    'Client Router',
    'Evidence Research',
    'Content and Creative',
    'Web and Product',
    'Paid Media',
    'CRM and Lifecycle',
    'Access Continuity',
    'Independent Verifier',
    'Watchtower Checker'
)

if (-not (Test-Path -LiteralPath $configPath -PathType Leaf)) {
    throw 'Buzz Desktop managed-agent configuration is missing.'
}
$running = @(Get-CimInstance Win32_Process |
    Where-Object {
        ([string]$_.ExecutablePath -ceq $desktopPath) -or
        ([string]$_.ExecutablePath -ceq $acpPath)
    })
if ($running.Count) {
    throw 'Close Buzz Desktop and its managed agents before changing native concurrency.'
}

$config = Get-Content -Raw -LiteralPath $configPath -Encoding UTF8 | ConvertFrom-Json
$updatedRecords = 0
foreach ($displayName in $expectedNames) {
    $matches = @($config | Where-Object {
        [string]$_.name -ceq $displayName -and -not [bool]$_.is_builtin
    })
    if ($matches.Count -ne 2) {
        throw "Expected exactly two protected Buzz records for $displayName; found $($matches.Count)."
    }
    foreach ($record in $matches) {
        $record.parallelism = $Parallelism
        $updatedRecords += 1
    }
}

$tempPath = "$configPath.tmp.$([guid]::NewGuid().ToString('N'))"
try {
    $json = ($config | ConvertTo-Json -Depth 100) + [Environment]::NewLine
    [IO.File]::WriteAllText($tempPath, $json, [Text.UTF8Encoding]::new($false))
    Move-Item -LiteralPath $tempPath -Destination $configPath -Force
}
finally {
    Remove-Item -LiteralPath $tempPath -Force -ErrorAction SilentlyContinue
    $json = $null
    $config = $null
}

[pscustomobject][ordered]@{
    ok = $true
    agentCount = $expectedNames.Count
    updatedRecordCount = $updatedRecords
    parallelism = $Parallelism
    containsSecrets = $false
}
