$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$registryPath = Join-Path $root "registry\clients.json"
$registry = Get-Content -LiteralPath $registryPath -Raw | ConvertFrom-Json

if ($registry.schemaVersion -ne 1) { throw "Unsupported client registry schema." }
$ids = @($registry.clients | ForEach-Object { $_.id })
if (@($ids | Group-Object | Where-Object Count -gt 1).Count -gt 0) { throw "Duplicate client IDs detected." }

foreach ($client in $registry.clients) {
    if (-not $client.id -or -not $client.displayName -or -not $client.folder) { throw "Incomplete client record." }
    $folder = Join-Path $root $client.folder
    if (-not (Test-Path -LiteralPath $folder -PathType Container)) { throw "Missing client folder: $($client.folder)" }
}

[pscustomobject]@{
    status = "valid"
    clients = @($registry.clients).Count
    active = @($registry.clients | Where-Object status -eq "active").Count
    needsConfirmation = @($registry.clients | Where-Object status -eq "needs-confirmation").Count
    communicationScan = $registry.communicationScan.status
} | ConvertTo-Json
