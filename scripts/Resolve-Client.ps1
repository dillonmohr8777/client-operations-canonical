param(
    [string]$Name,
    [switch]$List
)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$registry = Get-Content -LiteralPath (Join-Path $root "registry\clients.json") -Raw | ConvertFrom-Json

if ($List -and -not [string]::IsNullOrWhiteSpace($Name)) {
    [pscustomobject]@{
        status = "invalid-request"
        reason = "Use either -List or -Name, not both."
    } | ConvertTo-Json
    exit 64
}

if ($List) {
    [pscustomobject]@{
        status = "list"
        clients = @($registry.clients | Select-Object id,displayName,status,folder)
    } | ConvertTo-Json -Depth 4
    exit 0
}

if ([string]::IsNullOrWhiteSpace($Name)) {
    [pscustomobject]@{
        status = "invalid-request"
        reason = "Provide -Name for an exact resolution or use -List explicitly."
    } | ConvertTo-Json
    exit 64
}

$needle = $Name.Trim().ToLowerInvariant()
$matches = @($registry.clients | Where-Object {
    $_.id.ToLowerInvariant() -eq $needle -or
    $_.displayName.ToLowerInvariant() -eq $needle -or
    @($_.aliases | ForEach-Object { $_.ToLowerInvariant() }) -contains $needle -or
    @($_.emailDomains | ForEach-Object { $_.ToLowerInvariant() }) -contains $needle -or
    @($_.contacts | ForEach-Object { $_.email.ToLowerInvariant() }) -contains $needle -or
    @($_.slackChannels | ForEach-Object { $_.ToLowerInvariant() }) -contains $needle
})

if ($matches.Count -ne 1) {
    [pscustomobject]@{ status = "ambiguous-or-missing"; query = $Name; matches = @($matches | Select-Object id,displayName,status) } | ConvertTo-Json -Depth 5
    exit 2
}

$client = $matches[0]
$safeClient = $client | Select-Object id,displayName,status,folder
if ($client.status -ne "active") {
    [pscustomobject]@{ status = "blocked-inactive-client"; query = $Name; client = $safeClient } | ConvertTo-Json -Depth 4
    exit 3
}

[pscustomobject]@{ status = "resolved"; client = $safeClient } | ConvertTo-Json -Depth 4
exit 0
