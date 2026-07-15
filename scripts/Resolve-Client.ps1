param([string]$Name)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$registry = Get-Content -LiteralPath (Join-Path $root "registry\clients.json") -Raw | ConvertFrom-Json

if (-not $Name) {
    $registry.clients | Select-Object id,displayName,status,folder | ConvertTo-Json
    exit 0
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

[pscustomobject]@{ status = "resolved"; client = $matches[0] } | ConvertTo-Json -Depth 8
