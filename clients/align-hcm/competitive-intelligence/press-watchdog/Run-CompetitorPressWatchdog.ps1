$ErrorActionPreference = "Stop"

$watcher = Join-Path $PSScriptRoot "Invoke-CompetitorPressWatch.ps1"
$logRoot = Join-Path $PSScriptRoot "runtime\logs"
New-Item -ItemType Directory -Force -Path $logRoot | Out-Null

$stamp = (Get-Date).ToString("yyyy-MM-dd-HHmmss")
$logPath = Join-Path $logRoot "$stamp.log"

try {
  $output = & powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File $watcher 2>&1
  $exitCode = $LASTEXITCODE
  $output | Out-File -LiteralPath $logPath -Encoding UTF8
  if ($exitCode -ne 0) {
    throw "Competitor press watcher exited with code $exitCode. See $logPath"
  }
} catch {
  $_ | Out-String | Out-File -LiteralPath $logPath -Encoding UTF8 -Append
  throw
}
