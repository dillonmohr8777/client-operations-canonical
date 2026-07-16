[CmdletBinding()]
param(
    [string]$LedgerPath,
    [ValidateSet('','voice','design','routing','process','context','prediction')][string]$Category='',
    [string]$ClientId,
    [ValidateSet('Json','Object')][string]$Format='Json'
)

$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'MarketingOs.Common.ps1')
$projectRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if ([string]::IsNullOrWhiteSpace($LedgerPath)) { $LedgerPath=Join-Path $projectRoot 'state\corrections.jsonl' }
if (-not (Test-Path -LiteralPath $LedgerPath -PathType Leaf)) { throw 'Correction ledger is missing.' }
if (-not [string]::IsNullOrWhiteSpace($ClientId) -and $ClientId -notmatch '^[a-z0-9][a-z0-9-]{0,119}$') { throw 'ClientId filter is invalid.' }

function Test-LegacyCorrectionText {
    param([AllowNull()][string]$Value)
    return -not [string]::IsNullOrWhiteSpace($Value) -and $Value.Length -le 4000 -and $Value -notmatch '[\r\n]' -and (Test-MarketingSafeText $Value)
}

function Test-CorrectionTimestamp {
    param([AllowNull()][string]$Value)
    if ([string]::IsNullOrWhiteSpace($Value) -or $Value.Length -gt 64) { return $false }
    $parsed=[DateTimeOffset]::MinValue
    return [DateTimeOffset]::TryParse($Value,[Globalization.CultureInfo]::InvariantCulture,[Globalization.DateTimeStyles]::RoundtripKind,[ref]$parsed)
}

function Test-CorrectionSlug {
    param([AllowNull()][string]$Value)
    return -not [string]::IsNullOrWhiteSpace($Value) -and $Value -match '^[a-z0-9][a-z0-9-]{0,119}$'
}

function Test-LegacyEvidenceReference {
    param([AllowNull()][string]$Value)
    if ([string]::IsNullOrWhiteSpace($Value) -or $Value.Length -gt 1000 -or $Value -match '[\r\n]' -or $Value.Contains('..')) { return $false }
    if (Test-MarketingSafeLocator $Value) { return $true }
    if ($Value -match '^scripts/[A-Za-z0-9._/ -]+$') { return $true }
    if ($Value -notmatch '^(?i)C:\\Users\\dillo\\(?:Documents\\Codex|\.codex)\\') { return $false }
    $blocked=@(
        '(?i)(password|passwd|api[_ -]?key|access[_ -]?token|refresh[_ -]?token|session[_ -]?cookie|recovery[_ -]?code|one[_ -]?time[_ -]?code)\s*[:=]',
        '(?i)\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b',
        '(?<!\d)(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]\d{4}(?!\d)',
        '(?i)-----BEGIN [A-Z ]*PRIVATE KEY-----',
        '(?i)\b(AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9_]{20,}|xox[baprs]-[A-Za-z0-9-]{20,}|sk-[A-Za-z0-9_-]{20,}|ck_[A-Za-z0-9_-]{12,})\b'
    )
    foreach ($pattern in $blocked) { if ($Value -match $pattern) { return $false } }
    return $true
}

$normalized=New-Object System.Collections.Generic.List[object]
$lineNumber=0
foreach ($line in @(Get-Content -LiteralPath $LedgerPath -Encoding UTF8)) {
    $lineNumber++
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    try { $entry=$line|ConvertFrom-Json } catch { throw "Correction ledger line $lineNumber is invalid JSON." }
    if ([int]$entry.schemaVersion -eq 1) {
        foreach ($required in @('correctionId','recordedAt','workItemId','clientId','category','signalSource','triggerRef','changeSummary','lesson','appliesTo','evidenceRefs','confidence','privacy','supersedes')) {
            if ($entry.PSObject.Properties.Name -notcontains $required) { throw "Legacy correction line $lineNumber is missing $required." }
        }
        if ([string]$entry.correctionId -notmatch '^corr-[0-9]{8}-[0-9]{4}$') { throw "Legacy correction line $lineNumber has an invalid correctionId." }
        if (-not (Test-CorrectionTimestamp ([string]$entry.recordedAt))) { throw "Legacy correction line $lineNumber has an invalid recordedAt timestamp." }
        if ([string]$entry.category -notin @('voice','design','routing','process','context','prediction')) { throw "Legacy correction line $lineNumber has an invalid category." }
        if ([string]$entry.signalSource -notin @('dillon_edit','system_audit','user_decision','observed_edit','verifier','incident','outcome')) { throw "Legacy correction line $lineNumber has an invalid signalSource." }
        if (-not (Test-LegacyCorrectionText ([string]$entry.triggerRef)) -or -not (Test-LegacyCorrectionText ([string]$entry.lesson))) { throw "Legacy correction line $lineNumber has unsafe trigger or lesson text." }
        if (-not (Test-MarketingSafeText ([string]$entry.changeSummary)) -or [string]::IsNullOrWhiteSpace([string]$entry.changeSummary)) { throw "Legacy correction line $lineNumber has unsafe summary text." }
        if ([string]$entry.privacy -ne 'redacted') { throw "Legacy correction line $lineNumber violates the privacy contract." }
        if (-not [string]::IsNullOrWhiteSpace([string]$entry.workItemId) -and [string]$entry.workItemId -notmatch '^wi-[A-Za-z0-9-]+$') { throw "Legacy correction line $lineNumber has an invalid workItemId." }
        if (-not [string]::IsNullOrWhiteSpace([string]$entry.clientId) -and -not (Test-CorrectionSlug ([string]$entry.clientId))) { throw "Legacy correction line $lineNumber has an invalid clientId." }
        if ($null -eq $entry.appliesTo -or $entry.appliesTo.PSObject.Properties.Name -notcontains 'clientIds') { throw "Legacy correction line $lineNumber has invalid applicability metadata." }
        $clientIds=New-Object System.Collections.Generic.List[string]
        foreach ($candidateClientId in @($entry.appliesTo.clientIds)+@($entry.clientId)) {
            if ([string]::IsNullOrWhiteSpace([string]$candidateClientId)) { continue }
            if (-not (Test-CorrectionSlug ([string]$candidateClientId))) { throw "Legacy correction line $lineNumber has an unsafe clientId." }
            if (-not $clientIds.Contains([string]$candidateClientId)) { [void]$clientIds.Add([string]$candidateClientId) }
        }
        foreach ($ref in @($entry.evidenceRefs)) { if (-not (Test-LegacyEvidenceReference ([string]$ref))) { throw "Legacy correction line $lineNumber has an unsafe evidence reference." } }
        try { $confidence=[double]$entry.confidence } catch { throw "Legacy correction line $lineNumber has invalid confidence." }
        if ([double]::IsNaN($confidence) -or [double]::IsInfinity($confidence) -or $confidence -lt 0 -or $confidence -gt 1) { throw "Legacy correction line $lineNumber has invalid confidence." }
        $supersedes=if ($null -eq $entry.supersedes -or [string]::IsNullOrWhiteSpace([string]$entry.supersedes)) { $null } else { [string]$entry.supersedes }
        if ($null -ne $supersedes -and $supersedes -notmatch '^corr-[0-9]{8}-[0-9]{4}$') { throw "Legacy correction line $lineNumber has an invalid supersedes reference." }
        $record=[pscustomobject][ordered]@{
            schemaVersion=1;correctionId=[string]$entry.correctionId;recordedAt=[string]$entry.recordedAt;category=[string]$entry.category
            source=[string]$entry.signalSource;triggerRef=[string]$entry.triggerRef;clientIds=$clientIds.ToArray();workItemId=if([string]::IsNullOrWhiteSpace([string]$entry.workItemId)){$null}else{[string]$entry.workItemId}
            summary=[string]$entry.changeSummary;lesson=[string]$entry.lesson;replacementRule=[string]$entry.lesson;evidenceLocators=@($entry.evidenceRefs)
            confidence=$confidence;privacy='redacted';actor=$null;supersedes=$supersedes
        }
    }
    elseif ([int]$entry.schemaVersion -eq 2) {
        foreach ($required in @('correctionId','recordedAt','category','source','clientId','workItemId','lesson','replacementRule','evidenceLocator','actor','privacy','containsSecrets','containsDirectIdentifiers','containsRawCommunications')) {
            if ($entry.PSObject.Properties.Name -notcontains $required) { throw "Correction line $lineNumber is missing $required." }
        }
        if ([string]$entry.correctionId -notmatch '^mc-[0-9]{14}-[a-f0-9]{8}$' -or -not (Test-CorrectionTimestamp ([string]$entry.recordedAt))) { throw "Correction line $lineNumber has an invalid identity or timestamp." }
        if ([string]$entry.category -notin @('voice','design','routing','process','context','prediction') -or [string]$entry.source -notin @('user_decision','observed_edit','verifier','incident','outcome') -or [string]$entry.actor -notin @('dillon','marketing-chief')) { throw "Correction line $lineNumber has an invalid closed-enum value." }
        if ([string]$entry.privacy -ne 'redacted' -or [bool]$entry.containsSecrets -or [bool]$entry.containsDirectIdentifiers -or [bool]$entry.containsRawCommunications) { throw "Correction line $lineNumber violates the privacy contract." }
        if ([string]::IsNullOrWhiteSpace([string]$entry.lesson) -or -not (Test-MarketingSafeText ([string]$entry.lesson)) -or -not (Test-MarketingSafeText ([string]$entry.replacementRule))) { throw "Correction line $lineNumber contains unsafe text." }
        if (-not [string]::IsNullOrWhiteSpace([string]$entry.clientId) -and -not (Test-CorrectionSlug ([string]$entry.clientId))) { throw "Correction line $lineNumber has an invalid clientId." }
        if (-not [string]::IsNullOrWhiteSpace([string]$entry.workItemId) -and [string]$entry.workItemId -notmatch '^wi-[A-Za-z0-9-]+$') { throw "Correction line $lineNumber has an invalid workItemId." }
        if (-not [string]::IsNullOrWhiteSpace([string]$entry.evidenceLocator) -and -not (Test-MarketingSafeLocator ([string]$entry.evidenceLocator))) { throw "Correction line $lineNumber has an unsafe evidence locator." }
        $clientIds=if ([string]::IsNullOrWhiteSpace([string]$entry.clientId)) { @() } else { @([string]$entry.clientId) }
        $evidenceLocators=if ($null -eq $entry.evidenceLocator) { @() } else { @([string]$entry.evidenceLocator) }
        $record=[pscustomobject][ordered]@{
            schemaVersion=2;correctionId=[string]$entry.correctionId;recordedAt=[string]$entry.recordedAt;category=[string]$entry.category
            source=[string]$entry.source;triggerRef=$null;clientIds=$clientIds;workItemId=$entry.workItemId;summary=[string]$entry.lesson
            lesson=[string]$entry.lesson;replacementRule=$entry.replacementRule;evidenceLocators=$evidenceLocators;confidence=$null
            privacy='redacted';actor=[string]$entry.actor;supersedes=$null
        }
    }
    else { throw "Correction ledger line $lineNumber has an unsupported schemaVersion." }
    if (-not [string]::IsNullOrWhiteSpace($Category) -and $record.category -ne $Category) { continue }
    if (-not [string]::IsNullOrWhiteSpace($ClientId) -and $ClientId -notin @($record.clientIds)) { continue }
    [void]$normalized.Add($record)
}
$result=[pscustomobject][ordered]@{schemaVersion=1;count=$normalized.Count;items=$normalized.ToArray()}
if ($Format -eq 'Json') { $result|ConvertTo-Json -Depth 10 } else { $result }
