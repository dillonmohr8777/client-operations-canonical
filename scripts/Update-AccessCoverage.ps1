[CmdletBinding()]
param(
    [string]$OutputPath,
    [string]$AccessRegistryPath,
    [ValidateRange(1, 365)][int]$VerificationFreshnessDays = 30,
    [string]$AsOf,
    [switch]$NoWrite
)

$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if ([string]::IsNullOrWhiteSpace($OutputPath)) { $OutputPath = Join-Path $projectRoot 'state\access-coverage.json' }
$clientRegistryPath = Join-Path $projectRoot 'registry\clients.json'
$queuePath = Join-Path $projectRoot 'queue\work-items.json'
$accessRegistryPath = if ([string]::IsNullOrWhiteSpace($AccessRegistryPath)) { Join-Path $env:LOCALAPPDATA 'Codex\AccessBroker\registry.json' } else { [IO.Path]::GetFullPath($AccessRegistryPath) }
$now = if ([string]::IsNullOrWhiteSpace($AsOf)) { [DateTimeOffset]::UtcNow } else { [DateTimeOffset]::Parse($AsOf) }

function Get-VerificationState {
    param($Value)
    if ([string]::IsNullOrWhiteSpace([string]$Value)) { return 'missing' }
    $parsed = [DateTimeOffset]::MinValue
    if (-not [DateTimeOffset]::TryParse([string]$Value, [ref]$parsed)) { return 'invalid' }
    $parsed = $parsed.ToUniversalTime()
    if ($parsed -gt $now.AddMinutes(5)) { return 'future' }
    if (($now - $parsed).TotalDays -gt $VerificationFreshnessDays) { return 'stale' }
    return 'fresh'
}

$clients = Get-Content -LiteralPath $clientRegistryPath -Raw -Encoding UTF8 | ConvertFrom-Json
$queue = Get-Content -LiteralPath $queuePath -Raw -Encoding UTF8 | ConvertFrom-Json
$access = Get-Content -LiteralPath $accessRegistryPath -Raw -Encoding UTF8 | ConvertFrom-Json
$activeQueueClients = @($queue.workItems | Where-Object { $_.status -notin @('done','cancelled') } | ForEach-Object { [string]$_.clientId } | Where-Object { $_ } | Select-Object -Unique)

$rows = New-Object System.Collections.Generic.List[object]
foreach ($client in @($clients.clients | Sort-Object id)) {
    $brokerMatches = @($access.clients | Where-Object { $_.id -eq $client.id })
    $accessMappingRequired = if ($null -ne $client.PSObject.Properties['accessMappingRequired']) { [bool]$client.accessMappingRequired } else { $true }
    $systems = @(if ($brokerMatches.Count -eq 1) { @($brokerMatches[0].systems) } else { @() })
    $verified = @($systems | Where-Object { (Get-VerificationState $_.last_verified_at) -eq 'fresh' })
    $stale = @($systems | Where-Object { (Get-VerificationState $_.last_verified_at) -eq 'stale' })
    $invalidVerification = @($systems | Where-Object { (Get-VerificationState $_.last_verified_at) -in @('invalid','future') })
    $exactItems = @($systems | Where-Object { [string]$_.secret_ref -match '^bw://item/[0-9a-fA-F-]{36}$' })
    $opaqueRoutes = @($systems | Where-Object { [string]$_.secret_ref -match '^(op|bws|bw|vault|aws-sm|azure-kv|gcp-sm|oauth|windows-credential|dpapi-bootstrap)://' })
    $rows.Add([pscustomobject][ordered]@{
        clientId = [string]$client.id
        registryStatus = [string]$client.status
        activeQueue = [string]$client.id -in $activeQueueClients
        accessMappingRequired = $accessMappingRequired
        accessBrokerRecord = $brokerMatches.Count -eq 1
        systemCount = $systems.Count
        verifiedSystemCount = $verified.Count
        staleVerificationCount = $stale.Count
        invalidVerificationCount = $invalidVerification.Count
        opaqueRouteCount = $opaqueRoutes.Count
        exactBitwardenItemCount = $exactItems.Count
        coverageState = if (-not $accessMappingRequired) { 'not-required' } elseif ($brokerMatches.Count -ne 1) { 'missing-client-route' } elseif ($systems.Count -eq 0) { 'no-systems' } elseif ($verified.Count -eq $systems.Count -and $exactItems.Count -gt 0) { 'verified-with-exact-item' } elseif ($verified.Count -gt 0) { 'partial-current' } elseif ($stale.Count -gt 0) { 'stale' } elseif ($invalidVerification.Count -gt 0) { 'invalid-verification' } else { 'unverified' }
    })
}

$operationsClients = @($access.clients | Where-Object { $_.id -notin @($clients.clients.id) })
$allSystems = @($access.clients | ForEach-Object { @($_.systems) })
$allVerified = @($allSystems | Where-Object { (Get-VerificationState $_.last_verified_at) -eq 'fresh' })
$allStale = @($allSystems | Where-Object { (Get-VerificationState $_.last_verified_at) -eq 'stale' })
$allInvalidVerification = @($allSystems | Where-Object { (Get-VerificationState $_.last_verified_at) -in @('invalid','future') })
$allExactItems = @($allSystems | Where-Object { [string]$_.secret_ref -match '^bw://item/[0-9a-fA-F-]{36}$' })
$primaryVaultClientMatches = @($access.clients | Where-Object { $_.id -eq 'dillon-operations' })
$primaryVaultSystems = @(if ($primaryVaultClientMatches.Count -eq 1) {
    $primaryVaultClientMatches[0].systems | Where-Object {
        $_.id -eq 'bitwarden-password-manager' -and
        $_.account_role -eq 'primary-codex-and-claude-client-vault'
    }
}
else { @() })
$secondaryVaultSystems = @(if ($primaryVaultClientMatches.Count -eq 1) {
    $primaryVaultClientMatches[0].systems | Where-Object {
        $_.id -eq 'bitwarden-secondary-dillon-account' -and
        $_.service -eq 'bitwarden' -and
        $_.account_role -eq 'secondary-bitwarden-account'
    }
}
else { @() })
$secondaryVaultSystem = if ($secondaryVaultSystems.Count -eq 1) { $secondaryVaultSystems[0] } else { $null }
$primaryChromeExtensionState = if ($primaryVaultSystems.Count -eq 1) { [string]$primaryVaultSystems[0].chrome_extension_state } else { 'unknown' }
$primaryExtensionTimeoutPolicy = if ($primaryVaultSystems.Count -ne 1) {
    'unknown'
}
elseif ($null -ne $primaryVaultSystems[0].PSObject.Properties['chrome_extension_timeout_policy']) {
    [string]$primaryVaultSystems[0].chrome_extension_timeout_policy
}
else {
    'unverified'
}
$primaryVaultIdentityStatus = switch ($primaryChromeExtensionState) {
    'installed-and-vault-open-in-persistent-chrome-account-identity-unverified' { 'unverified'; break }
    'installed-and-vault-open-in-persistent-chrome-primary-account-identity-verified' { 'verified'; break }
    default { 'unknown' }
}
$priorityMissingExactItems = @($rows | Where-Object { $_.activeQueue -and $_.accessMappingRequired -and [int]$_.exactBitwardenItemCount -lt 1 })
$credentialHumanGate = switch ($primaryVaultIdentityStatus) {
    'unverified' { 'Confirm the open Bitwarden vault is the primary Codex/Claude vault before exact item mapping.'; break }
    'verified' {
        if ($priorityMissingExactItems.Count -gt 0) {
            'Map an exact Bitwarden item for active clients: ' + (($priorityMissingExactItems.clientId | Sort-Object) -join ', ') + '.'
        }
        elseif ($allExactItems.Count -lt 1) { 'Map exact Bitwarden item GUIDs.' }
        elseif ($primaryExtensionTimeoutPolicy -ne 'on-browser-restart-lock-pin-enabled-master-password-on-restart-disabled') { 'Verify the Bitwarden extension timeout policy.' }
        else { $null }
        break
    }
    default { 'Unlock the primary Bitwarden Chrome extension before exact item mapping.' }
}

$report = [pscustomobject][ordered]@{
    schemaVersion = 2
    asOf = $now.ToString('o')
    privacy = 'non-secret-routing-metadata-only'
    summary = [pscustomobject]@{
        canonicalClientCount = @($clients.clients).Count
        canonicalClientsWithAccessBrokerRecord = @($rows | Where-Object { $_.accessBrokerRecord }).Count
        activeQueueClients = $activeQueueClients.Count
        accessBrokerClientCount = @($access.clients).Count
        registeredSystemCount = $allSystems.Count
        verifiedSystemCount = $allVerified.Count
        staleVerificationCount = $allStale.Count
        invalidVerificationCount = $allInvalidVerification.Count
        verificationFreshnessDays = $VerificationFreshnessDays
        exactBitwardenItemCount = $allExactItems.Count
        operationsOnlyClientCount = $operationsClients.Count
    }
    priority = @($rows | Where-Object { $_.activeQueue } | Sort-Object clientId)
    clients = $rows.ToArray()
    credentialVault = [pscustomobject][ordered]@{
        primaryRouteCount = $primaryVaultSystems.Count
        primaryChromeExtensionState = $primaryChromeExtensionState
        primaryVaultIdentityStatus = $primaryVaultIdentityStatus
        primaryExtensionTimeoutPolicy = $primaryExtensionTimeoutPolicy
        secondaryRoute = [pscustomobject][ordered]@{
            routeCount = $secondaryVaultSystems.Count
            id = if ($null -eq $secondaryVaultSystem) { $null } else { [string]$secondaryVaultSystem.id }
            service = if ($null -eq $secondaryVaultSystem) { $null } else { [string]$secondaryVaultSystem.service }
            accountRole = if ($null -eq $secondaryVaultSystem) { $null } else { [string]$secondaryVaultSystem.account_role }
            authMethod = if ($null -eq $secondaryVaultSystem) { $null } else { [string]$secondaryVaultSystem.auth_method }
            accessState = if ($null -eq $secondaryVaultSystem) { $null } else { [string]$secondaryVaultSystem.access_state }
            usePolicy = if ($null -eq $secondaryVaultSystem) { $null } else { [string]$secondaryVaultSystem.use_policy }
            retiredAt = if ($null -eq $secondaryVaultSystem) { $null } else { [string]$secondaryVaultSystem.retired_at }
            allowedCapabilityCount = if ($null -eq $secondaryVaultSystem) { 0 } else { @($secondaryVaultSystem.allowed_capabilities).Count }
            prohibitedCapabilities = if ($null -eq $secondaryVaultSystem) { @() } else { @($secondaryVaultSystem.prohibited_capabilities | ForEach-Object { [string]$_ }) }
            remediationStatus = if ($null -eq $secondaryVaultSystem) { $null } else { [string]$secondaryVaultSystem.remediation_status }
            remediationDeferredAt = if ($null -eq $secondaryVaultSystem) { $null } else { [string]$secondaryVaultSystem.remediation_deferred_at }
        }
    }
    humanGate = $credentialHumanGate
    safety = 'No raw vault inventory, usernames, passwords, tokens, codes, cookies, account identifiers, or credential values were read or stored.'
}

if (-not $NoWrite) {
    $directory = Split-Path -Parent $OutputPath
    if (-not (Test-Path -LiteralPath $directory)) { New-Item -ItemType Directory -Path $directory -Force | Out-Null }
    $temp = "$OutputPath.tmp.$([guid]::NewGuid().ToString('N'))"
    try {
        [IO.File]::WriteAllText($temp, (($report | ConvertTo-Json -Depth 20) + [Environment]::NewLine), [Text.UTF8Encoding]::new($false))
        Move-Item -LiteralPath $temp -Destination $OutputPath -Force
    }
    finally { Remove-Item -LiteralPath $temp -Force -ErrorAction SilentlyContinue }
}

$report | ConvertTo-Json -Depth 20
