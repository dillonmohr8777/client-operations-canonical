$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$registryPath = Join-Path $root "registry\clients.json"
$registry = Get-Content -LiteralPath $registryPath -Raw | ConvertFrom-Json

if ($registry.schemaVersion -ne 1) { throw "Unsupported client registry schema." }
$ids = @($registry.clients | ForEach-Object { $_.id })
if (@($ids | Group-Object | Where-Object Count -gt 1).Count -gt 0) { throw "Duplicate client IDs detected." }

$allowedStatuses = @('active', 'inactive', 'needs-confirmation')
$routingKeys = @{}
foreach ($client in $registry.clients) {
    if (-not $client.id -or -not $client.displayName -or -not $client.folder) { throw "Incomplete client record." }
    if ([string]$client.id -notmatch '^[a-z0-9][a-z0-9-]{1,79}$') { throw "Invalid client ID: $($client.id)" }
    if ([string]$client.status -notin $allowedStatuses) { throw "Unsupported client status: $($client.status)" }
    $folder = [IO.Path]::GetFullPath((Join-Path $root $client.folder))
    if (-not $folder.StartsWith(([IO.Path]::GetFullPath((Join-Path $root 'clients')) + '\'), [StringComparison]::OrdinalIgnoreCase)) { throw "Client folder escapes the canonical clients root: $($client.folder)" }
    if (-not (Test-Path -LiteralPath $folder -PathType Container)) { throw "Missing client folder: $($client.folder)" }
    if (-not (Test-Path -LiteralPath (Join-Path $folder 'CLIENT.md') -PathType Leaf)) { throw "Missing CLIENT.md: $($client.folder)" }

    $keys = @([string]$client.id, [string]$client.displayName) + @($client.aliases) + @($client.emailDomains) + @($client.contacts | ForEach-Object { $_.email }) + @($client.slackChannels)
    foreach ($value in $keys) {
        $key = ([string]$value).Trim().ToLowerInvariant()
        if ([string]::IsNullOrWhiteSpace($key)) { continue }
        if ($routingKeys.ContainsKey($key) -and [string]$routingKeys[$key] -ne [string]$client.id) { throw "Cross-client routing-key collision: $key" }
        $routingKeys[$key] = [string]$client.id
    }

    if ($null -ne $client.PSObject.Properties['intakeRouting'] -and [bool]$client.intakeRouting.requireExactSourceIdentity) {
        if ([bool]$client.intakeRouting.allowLegacyLabelOnly) { throw "Exact-source intake policy cannot allow legacy label-only routing: $($client.id)" }
        if (@($client.contacts).Count + @($client.emailDomains).Count + @($client.slackChannels).Count -lt 1) { throw "Exact-source intake policy has no source identity keys: $($client.id)" }
    }
}

[pscustomobject]@{
    status = "valid"
    clients = @($registry.clients).Count
    active = @($registry.clients | Where-Object status -eq "active").Count
    inactive = @($registry.clients | Where-Object status -eq "inactive").Count
    needsConfirmation = @($registry.clients | Where-Object status -eq "needs-confirmation").Count
    communicationScan = $registry.communicationScan.status
} | ConvertTo-Json
