[CmdletBinding()]
param(
    [string]$Date,
    [string]$OutputPath,
    [switch]$Check,
    [string]$RosterPath,
    [string]$RegistryPath,
    [string]$ProjectRoot
)

$ErrorActionPreference = 'Stop'

function Get-PropertyValue {
    param($Object, [string]$Name, $Default = $null)
    if ($null -ne $Object -and $Object.PSObject.Properties.Name -contains $Name) { return $Object.$Name }
    return $Default
}

function Get-EasternTimeZone {
    foreach ($id in @('America/New_York', 'Eastern Standard Time')) {
        try { return [TimeZoneInfo]::FindSystemTimeZoneById($id) } catch {}
    }
    throw 'America/New_York time zone is unavailable on this host.'
}

function Resolve-ProjectRelativePath {
    param([string]$Root, [string]$RelativePath, [string]$RequiredPrefix)
    if ([string]::IsNullOrWhiteSpace($RelativePath) -or [IO.Path]::IsPathRooted($RelativePath)) {
        throw "Unsafe project-relative path: $RelativePath"
    }
    $normalizedRelative = $RelativePath.Replace('/', [IO.Path]::DirectorySeparatorChar)
    $resolved = [IO.Path]::GetFullPath((Join-Path $Root $normalizedRelative))
    $prefix = [IO.Path]::GetFullPath((Join-Path $Root $RequiredPrefix)).TrimEnd('\', '/') + [IO.Path]::DirectorySeparatorChar
    if (-not $resolved.StartsWith($prefix, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Path escapes the required project boundary: $RelativePath"
    }
    return $resolved
}

function Get-FileSha256 {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return $null }
    return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
}

function Get-ConfigAccountReference {
    param($Config)
    foreach ($name in @('accountRef', 'accountLocator', 'accessRef')) {
        $value = [string](Get-PropertyValue $Config $name '')
        if (-not [string]::IsNullOrWhiteSpace($value)) { return $value.Trim() }
    }
    $account = Get-PropertyValue $Config 'account' $null
    if ($null -ne $account) {
        foreach ($name in @('ref', 'accountRef', 'locator', 'accessRef')) {
            $value = [string](Get-PropertyValue $account $name '')
            if (-not [string]::IsNullOrWhiteSpace($value)) { return $value.Trim() }
        }
    }
    return $null
}

function Test-OpaqueAccountReference {
    param([string]$Value)
    if ([string]::IsNullOrWhiteSpace($Value) -or $Value.Length -gt 500) { return $false }
    return $Value -match '^(?:access-broker:|access-broker://|bw://item/|google-ads://account/|meta-ads://account/)[A-Za-z0-9._:/-]+$'
}

function New-ReviewCheck {
    param(
        [string]$Id,
        [string]$Label,
        [string]$EvidenceRequired,
        [string]$MaterialFindingRule,
        [bool]$Blocked
    )
    return [pscustomobject][ordered]@{
        id = $Id
        label = $Label
        status = $(if ($Blocked) { 'blocked-by-route-or-config' } else { 'pending-read-only-evidence' })
        evidenceRequired = $EvidenceRequired
        materialFindingRule = $MaterialFindingRule
        providerMutationAllowed = $false
    }
}

function New-LaneChecks {
    param($Lane, [bool]$Blocked)
    $channelEvidence = if ([string]$Lane.platform -eq 'google-ads') {
        'Current read-only search-term or search-category evidence, match behavior, negative-keyword coverage, and campaign-type limitations.'
    } else {
        'Current read-only creative age, frequency, reach, CTR or result-rate trend, and placement-level delivery evidence.'
    }
    $channelRule = if ([string]$Lane.platform -eq 'google-ads') {
        'Candidate only when irrelevant intent, preventable query waste, missing negatives, or opaque Performance Max query coverage is material and currently evidenced.'
    } else {
        'Candidate only when fatigue, frequency, placement concentration, or creative deterioration is material and currently evidenced.'
    }
    return @(
        (New-ReviewCheck 'session_account' 'Session and exact account' 'Live read-only identity, account, client, platform, and authorization readback.' 'Candidate when the expected account cannot be verified, the route is mismatched, or authentication blocks the review.' $Blocked),
        (New-ReviewCheck 'delivery_pacing' 'Delivery and pacing' ("Current delivery state, spend and budget pacing against the configured guardrails; expected state is {0}." -f [string]$Lane.expectedDeliveryState) 'Candidate when delivery differs from the client-approved state or pacing breaches a current configured guardrail.' $Blocked),
        (New-ReviewCheck 'conversion_tracking_dedup' 'Conversion tracking and deduplication' 'Current primary and secondary conversion definitions, event health, attribution settings, CRM or appointment reconciliation, and duplicate-event evidence.' 'Candidate when tracking is broken, duplicated, misclassified, stale, or materially disconnected from qualified outcomes.' $Blocked),
        (New-ReviewCheck 'landing_page_health' 'Landing-page health' 'Current destination URL readback, status, mobile usability, form or call path, message match, and tracking continuity.' 'Candidate when a destination is unavailable, materially degraded, mismatched, or unable to preserve conversion measurement.' $Blocked),
        (New-ReviewCheck ([string]$Lane.channelSpecificReview) 'Channel-specific optimization evidence' $channelEvidence $channelRule $Blocked),
        (New-ReviewCheck 'change_history' 'Change history' 'Current platform change history and the exact actor, timestamp, object, and before or after state for material changes.' 'Candidate when an unexplained, unauthorized, or materially harmful change is currently evidenced.' $Blocked),
        (New-ReviewCheck 'budget_recommendation' 'Budget recommendation' 'Current outcome quality, pacing, marginal efficiency, learning state, configured ceilings, and explicit uncertainty.' 'Candidate only as a recommendation with evidence; no budget mutation is authorized by this manifest.' $Blocked),
        (New-ReviewCheck 'readback_freshness' 'Readback freshness' 'Timestamped live readback from the exact platform account and any required downstream lead-quality source.' 'Candidate when the evidence is too stale to support today''s decision or a required downstream source is unavailable.' $Blocked)
    )
}

$rootValue = if ([string]::IsNullOrWhiteSpace($ProjectRoot)) { Split-Path -Parent $PSScriptRoot } else { $ProjectRoot }
$root = [IO.Path]::GetFullPath($rootValue)
if ([string]::IsNullOrWhiteSpace($RosterPath)) { $RosterPath = Join-Path $root 'registry\paid-media-roster.json' }
if ([string]::IsNullOrWhiteSpace($RegistryPath)) { $RegistryPath = Join-Path $root 'registry\clients.json' }
$RosterPath = [IO.Path]::GetFullPath($RosterPath)
$RegistryPath = [IO.Path]::GetFullPath($RegistryPath)

$timeZone = Get-EasternTimeZone
if ([string]::IsNullOrWhiteSpace($Date)) {
    $reviewDate = [TimeZoneInfo]::ConvertTime([DateTimeOffset]::UtcNow, $timeZone).Date
} else {
    if ($Date -notmatch '^\d{4}-\d{2}-\d{2}$') { throw 'Date must use yyyy-MM-dd.' }
    $reviewDate = [DateTime]::ParseExact($Date, 'yyyy-MM-dd', [Globalization.CultureInfo]::InvariantCulture, [Globalization.DateTimeStyles]::None)
}
$reviewDateText = $reviewDate.ToString('yyyy-MM-dd', [Globalization.CultureInfo]::InvariantCulture)
$windowStartLocal = [DateTime]::SpecifyKind($reviewDate.Date, [DateTimeKind]::Unspecified)
$windowEndLocal = [DateTime]::SpecifyKind($reviewDate.Date.AddDays(1), [DateTimeKind]::Unspecified)
$windowStart = [DateTimeOffset]::new($windowStartLocal, $timeZone.GetUtcOffset($windowStartLocal))
$windowEnd = [DateTimeOffset]::new($windowEndLocal, $timeZone.GetUtcOffset($windowEndLocal))
if ([string]::IsNullOrWhiteSpace($OutputPath)) {
    $OutputPath = Join-Path $root ("state\paid-media\daily-review-{0}.json" -f $reviewDateText)
}
$OutputPath = [IO.Path]::GetFullPath($OutputPath)

if (-not (Test-Path -LiteralPath $RosterPath -PathType Leaf)) { throw "Paid-media roster not found: $RosterPath" }
try { $roster = Get-Content -LiteralPath $RosterPath -Raw -Encoding UTF8 | ConvertFrom-Json } catch { throw "Paid-media roster is invalid JSON: $RosterPath" }
if ([int](Get-PropertyValue $roster 'schemaVersion' 0) -ne 1) { throw 'Unsupported paid-media roster schema.' }
if ([string](Get-PropertyValue $roster 'timezone' '') -ne 'America/New_York') { throw 'Paid-media roster must use America/New_York.' }
$lanes = @($roster.lanes)
if ($lanes.Count -ne 7) { throw 'Paid-media roster must contain exactly seven lanes.' }
$expectedLaneIds = @(
    'google-ads--kimberly-james-bridal',
    'google-ads--replenish-7-eleven',
    'google-ads--fresh-blends-kwik-trip',
    'google-ads--omega-landscaping',
    'google-ads--onsite-concrete-landscape',
    'meta-ads--shadow-heating-cooling',
    'meta-ads--kimberly-james-bridal'
)
$laneIds = @($lanes | ForEach-Object { [string]$_.laneId })
if (@($laneIds | Group-Object | Where-Object Count -gt 1).Count -gt 0) { throw 'Paid-media roster has duplicate lane IDs.' }
if (@($laneIds | Where-Object { $_ -notin $expectedLaneIds }).Count -gt 0 -or @($expectedLaneIds | Where-Object { $_ -notin $laneIds }).Count -gt 0) {
    throw 'Paid-media roster does not match the exact eight authorized client-platform lanes.'
}
$orders = @($lanes | ForEach-Object { [int]$_.order })
if (@($orders | Group-Object | Where-Object Count -gt 1).Count -gt 0 -or ($orders | Measure-Object -Minimum).Minimum -ne 1 -or ($orders | Measure-Object -Maximum).Maximum -ne 7) {
    throw 'Paid-media roster order must be unique from 1 through 7.'
}
foreach ($lane in $lanes) {
    if ([string]$lane.platform -notin @('google-ads', 'meta-ads')) { throw "Unsupported paid-media platform: $($lane.platform)" }
    if ([string]$lane.laneId -cne ("{0}--{1}" -f [string]$lane.platform, [string]$lane.clientId)) { throw "Lane ID does not exactly match client and platform: $($lane.laneId)" }
    if (-not [bool]$lane.active) { throw "Roster lane is not active: $($lane.laneId)" }
    if ([string]$lane.metricsPolicy -ne 'historical-observations-never-authority') { throw "Unsafe metrics policy: $($lane.laneId)" }
    $null = Resolve-ProjectRelativePath $root ([string]$lane.configPath) 'clients'
}

$registryAvailable = $false
$registryHash = Get-FileSha256 $RegistryPath
$registryClients = @()
$registryError = $null
if (-not (Test-Path -LiteralPath $RegistryPath -PathType Leaf)) {
    $registryError = 'client-registry-missing'
} else {
    try {
        $clientRegistry = Get-Content -LiteralPath $RegistryPath -Raw -Encoding UTF8 | ConvertFrom-Json
        if ($null -eq $clientRegistry.PSObject.Properties['clients']) { throw 'clients array missing' }
        $registryClients = @($clientRegistry.clients)
        $registryAvailable = $true
    } catch {
        $registryError = 'client-registry-invalid'
    }
}

$laneManifests = @()
foreach ($lane in @($lanes | Sort-Object order, laneId)) {
    $blockers = New-Object System.Collections.Generic.List[string]
    $registryState = 'unavailable'
    if (-not $registryAvailable) {
        $blockers.Add($registryError)
    } else {
        $matches = @($registryClients | Where-Object { [string]$_.id -ceq [string]$lane.clientId })
        if ($matches.Count -ne 1) {
            $registryState = 'missing-or-ambiguous'
            $blockers.Add('client-route-not-exactly-one')
        } elseif ([string]$matches[0].status -ne 'active') {
            $registryState = 'not-active'
            $blockers.Add('client-route-not-active')
        } else {
            $registryState = 'active-exact'
        }
    }

    $configResolvedPath = Resolve-ProjectRelativePath $root ([string]$lane.configPath) 'clients'
    $configHash = Get-FileSha256 $configResolvedPath
    $configState = 'missing'
    $accountReferenceState = 'not-checked'
    if (-not (Test-Path -LiteralPath $configResolvedPath -PathType Leaf)) {
        $blockers.Add('paid-media-config-missing')
        $accountReferenceState = 'missing-with-config'
    } else {
        try {
            $config = Get-Content -LiteralPath $configResolvedPath -Raw -Encoding UTF8 | ConvertFrom-Json
            $configState = 'parsed'
            if ([int](Get-PropertyValue $config 'schemaVersion' 0) -ne 1) { $blockers.Add('paid-media-config-schema-invalid') }
            if ([string](Get-PropertyValue $config 'clientId' '') -cne [string]$lane.clientId) { $blockers.Add('paid-media-config-client-mismatch') }
            $platformKey = ([string]$lane.platform).Replace('-', '_')
            $platformConfig = Get-PropertyValue (Get-PropertyValue $config 'platforms' $null) $platformKey $null
            if ($null -eq $platformConfig) { $blockers.Add('paid-media-config-platform-missing') }
            elseif (-not [bool](Get-PropertyValue $platformConfig 'enabledForPlanning' $false)) { $blockers.Add('paid-media-config-platform-disabled') }
            $expectedBlueprintRef = "clients/$([string]$lane.clientId)/paid-media/blueprints/$platformKey.json"
            $blueprintRef = [string](Get-PropertyValue $platformConfig 'launchBlueprintRef' '')
            if ($blueprintRef -cne $expectedBlueprintRef) { $blockers.Add('paid-media-config-blueprint-mismatch') }
            else {
                $blueprintPath = Resolve-ProjectRelativePath $root $blueprintRef 'clients'
                if (-not (Test-Path -LiteralPath $blueprintPath -PathType Leaf)) { $blockers.Add('paid-media-blueprint-missing') }
            }
            $accountReference = [string](Get-PropertyValue $platformConfig 'exactAccountRef' '')
            if ([string]::IsNullOrWhiteSpace($accountReference)) {
                $accountReferenceState = 'missing'
                $blockers.Add('opaque-account-reference-missing')
            } elseif (-not (Test-OpaqueAccountReference $accountReference)) {
                $accountReferenceState = 'unsafe-or-non-opaque'
                $blockers.Add('opaque-account-reference-invalid')
            } else {
                $accountReferenceState = 'present-opaque'
            }
            if ($blockers.Count -eq 0) { $configState = 'ready' } else { $configState = 'invalid-or-incomplete' }
        } catch {
            $configState = 'invalid-json'
            $accountReferenceState = 'not-checked'
            $blockers.Add('paid-media-config-invalid-json')
        }
    }

    $isBlocked = $blockers.Count -gt 0
    $laneManifests += [pscustomobject][ordered]@{
        order = [int]$lane.order
        reviewKey = ("{0}::{1}" -f $reviewDateText, [string]$lane.laneId)
        laneId = [string]$lane.laneId
        clientId = [string]$lane.clientId
        platform = [string]$lane.platform
        expectedDeliveryState = [string]$lane.expectedDeliveryState
        currentStateAsOf = [string]$lane.currentStateAsOf
        currentStateNote = [string]$lane.currentStateNote
        metricsPolicy = 'historical-observations-never-authority'
        configPath = ([string]$lane.configPath).Replace('\', '/')
        configSha256 = $configHash
        routeState = [pscustomobject][ordered]@{
            clientRegistry = $registryState
            paidMediaConfig = $configState
            accountReference = $accountReferenceState
            reviewEligibility = $(if ($isBlocked) { 'blocked-fail-closed' } else { 'ready-for-read-only-review' })
        }
        blockers = @($blockers)
        reviewFocus = @($lane.reviewFocus)
        checks = @(New-LaneChecks $lane $isBlocked)
        materialFindingCandidate = $null
    }
}

$blockedLaneCount = @($laneManifests | Where-Object { $_.routeState.reviewEligibility -eq 'blocked-fail-closed' }).Count
$manifest = [pscustomobject][ordered]@{
    schemaVersion = 1
    manifestId = "paid-media-daily-review-$reviewDateText"
    reviewDate = $reviewDateText
    timezone = 'America/New_York'
    reviewWindow = [pscustomobject][ordered]@{
        start = $windowStart.ToString('o')
        endExclusive = $windowEnd.ToString('o')
    }
    status = $(if ($blockedLaneCount -eq 0) { 'ready-for-read-only-review' } else { 'blocked-fail-closed' })
    source = [pscustomobject][ordered]@{
        rosterPath = 'registry/paid-media-roster.json'
        rosterSha256 = Get-FileSha256 $RosterPath
        clientRegistryPath = 'registry/clients.json'
        clientRegistrySha256 = $registryHash
    }
    policy = [pscustomobject][ordered]@{
        exactRosterOnly = $true
        oneReviewPerEasternDay = $true
        providerCallsAttempted = $false
        canonicalQueueMutationAttempted = $false
        externalActionAttempted = $false
        historicalMetricsAreAuthority = $false
        missingOrInvalidRouteState = 'fail-closed'
        externalMutation = 'requires exact active authority for the client, platform account, action, requester, limits, validation, and rollback'
    }
    summary = [pscustomobject][ordered]@{
        laneCount = $laneManifests.Count
        readyLaneCount = $laneManifests.Count - $blockedLaneCount
        blockedLaneCount = $blockedLaneCount
        googleAdsLaneCount = @($laneManifests | Where-Object platform -eq 'google-ads').Count
        metaAdsLaneCount = @($laneManifests | Where-Object platform -eq 'meta-ads').Count
        materialFindingCandidateCount = 0
    }
    materialFindingCandidateContract = [pscustomobject][ordered]@{
        contractVersion = 1
        candidateOnly = $true
        manifestGeneratorMayMutateQueue = $false
        chiefMayMaterializeOnlyWhenMaterial = $true
        requiredFields = @(
            'candidateId', 'manifestId', 'reviewKey', 'clientId', 'platform', 'findingClass', 'severity',
            'summary', 'observedAt', 'evidenceRefs', 'freshness', 'confidence', 'recommendedActionClass',
            'externalMutationRequested', 'approvalGate', 'privacy', 'containsSecrets',
            'containsDirectIdentifiers', 'containsRawCommunications', 'queueMutationAttempted'
        )
        allowedFindingClasses = @(
            'account-or-session-mismatch', 'unexpected-delivery-state', 'material-pacing-anomaly',
            'tracking-or-dedup-failure', 'landing-page-failure', 'material-channel-waste-or-fatigue',
            'unexplained-change', 'material-budget-recommendation', 'stale-or-missing-readback'
        )
        allowedSeverity = @('medium', 'high', 'critical')
        evidenceRule = 'Use current exact-account readback and downstream outcome evidence; historical metrics alone cannot support a candidate.'
        queueRule = 'The Marketing Chief separately deduplicates and materializes a candidate. This manifest never creates or mutates queue/work-items.json.'
        externalMutationRule = 'A candidate never authorizes a provider mutation. Any external change requires exact active authority and a separate verified execution contract.'
        privacyDefaults = [pscustomobject][ordered]@{
            privacy = 'redacted'
            containsSecrets = $false
            containsDirectIdentifiers = $false
            containsRawCommunications = $false
            queueMutationAttempted = $false
        }
    }
    lanes = @($laneManifests)
}

$json = $manifest | ConvertTo-Json -Depth 30
$expectedText = $json + "`n"
$summary = [pscustomobject][ordered]@{
    reviewDate = $reviewDateText
    manifestStatus = [string]$manifest.status
    laneCount = [int]$manifest.summary.laneCount
    readyLaneCount = [int]$manifest.summary.readyLaneCount
    blockedLaneCount = [int]$manifest.summary.blockedLaneCount
    path = $OutputPath
    providerCallsAttempted = $false
    canonicalQueueMutationAttempted = $false
    externalActionAttempted = $false
}

if ($Check) {
    if (-not (Test-Path -LiteralPath $OutputPath -PathType Leaf)) {
        $summary | Add-Member -NotePropertyName status -NotePropertyValue 'missing'
        $summary | ConvertTo-Json -Compress
        exit 2
    }
    $currentText = [IO.File]::ReadAllText($OutputPath)
    if ($currentText -cne $expectedText) {
        $summary | Add-Member -NotePropertyName status -NotePropertyValue 'drift'
        $summary | ConvertTo-Json -Compress
        exit 3
    }
    $summary | Add-Member -NotePropertyName status -NotePropertyValue 'current'
    $summary | ConvertTo-Json -Compress
    exit 0
}

$outputDirectory = Split-Path -Parent $OutputPath
if (-not (Test-Path -LiteralPath $outputDirectory -PathType Container)) {
    $null = [IO.Directory]::CreateDirectory($outputDirectory)
}
$temporaryPath = Join-Path $outputDirectory ('.' + [IO.Path]::GetFileName($OutputPath) + '.' + [guid]::NewGuid().ToString('N') + '.tmp')
try {
    [IO.File]::WriteAllText($temporaryPath, $expectedText, [Text.UTF8Encoding]::new($false))
    Move-Item -LiteralPath $temporaryPath -Destination $OutputPath -Force
} finally {
    if (Test-Path -LiteralPath $temporaryPath) { Remove-Item -LiteralPath $temporaryPath -Force }
}
$summary | Add-Member -NotePropertyName status -NotePropertyValue 'written'
$summary | ConvertTo-Json -Compress
