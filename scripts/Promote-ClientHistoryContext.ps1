[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'Low')]
param(
    [string]$GmailArtifactPath,
    [string]$GmailSupplementArtifactPath,
    [string]$GmailOnsiteSupplementArtifactPath,
    [string]$SlackArtifactPath,
    [string]$RegistryPath,
    [switch]$Check
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$projectRoot = [IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot))
$beginMarker = '<!-- BEGIN CLIENT-HISTORY-PROMOTION:v1 -->'
$endMarker = '<!-- END CLIENT-HISTORY-PROMOTION:v1 -->'
$expectedIndependentClients = @('bok-law-firm', 'ami-cleaning', 'cindy-may-christmas')
$expectedAffiliatedClient = 'bridge-software'
$expectedOnsiteClient = 'onsite-concrete-landscape'
$expectedSupplementClients = @($expectedAffiliatedClient, $expectedOnsiteClient)
$expectedInactiveClient = 'zen-spa-tropicana'
$expectedQuarantinedClient = 'revive-systems'
$expectedPortfolioContract = [ordered]@{
    Total = 20
    Active = 18
    Inactive = 1
    NeedsConfirmation = 1
}

function Get-OptionalProperty {
    param(
        [AllowNull()][object]$InputObject,
        [Parameter(Mandatory = $true)][string]$Name,
        [AllowNull()][object]$Default = $null
    )

    if ($null -eq $InputObject) { return $Default }
    $property = $InputObject.PSObject.Properties[$Name]
    if ($null -eq $property) { return $Default }
    return $property.Value
}

function Resolve-ProjectPath {
    param(
        [AllowEmptyString()][string]$Path,
        [Parameter(Mandatory = $true)][string]$DefaultRelativePath
    )

    $candidate = $Path
    if ([string]::IsNullOrWhiteSpace($candidate)) {
        $candidate = Join-Path $projectRoot $DefaultRelativePath
    } elseif (-not [IO.Path]::IsPathRooted($candidate)) {
        $candidate = Join-Path $projectRoot $candidate
    }

    $resolved = [IO.Path]::GetFullPath($candidate)
    $rootPrefix = $projectRoot.TrimEnd([IO.Path]::DirectorySeparatorChar, [IO.Path]::AltDirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
    if (-not $resolved.StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Path escapes the canonical project: $resolved"
    }
    return $resolved
}

function Get-ProjectRelativePath {
    param([Parameter(Mandatory = $true)][string]$Path)

    $full = [IO.Path]::GetFullPath($Path)
    $rootPrefix = $projectRoot.TrimEnd([IO.Path]::DirectorySeparatorChar, [IO.Path]::AltDirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
    if (-not $full.StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Cannot create a project-relative locator for: $full"
    }
    return $full.Substring($rootPrefix.Length).Replace('\', '/')
}

function Read-JsonFile {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "Required JSON file is missing: $Path"
    }
    return (Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json)
}

function Get-Sha256Hex {
    param([Parameter(Mandatory = $true)][string]$Path)

    $stream = [IO.File]::OpenRead($Path)
    $sha256 = [Security.Cryptography.SHA256]::Create()
    try {
        $hashBytes = $sha256.ComputeHash($stream)
        return ([BitConverter]::ToString($hashBytes)).Replace('-', '')
    } finally {
        $sha256.Dispose()
        $stream.Dispose()
    }
}

function Assert-False {
    param(
        [AllowNull()][object]$Value,
        [Parameter(Mandatory = $true)][string]$Label
    )
    if ($Value -isnot [bool] -or $Value -ne $false) { throw "$Label must be the Boolean value false." }
}

function Assert-True {
    param(
        [AllowNull()][object]$Value,
        [Parameter(Mandatory = $true)][string]$Label
    )
    if ($Value -isnot [bool] -or $Value -ne $true) { throw "$Label must be the Boolean value true." }
}

function Assert-GmailSupplementArtifact {
    param(
        [Parameter(Mandatory = $true)][object]$Artifact,
        [Parameter(Mandatory = $true)][string]$ExpectedClientId,
        [Parameter(Mandatory = $true)][string]$ExpectedDisplayName,
        [Parameter(Mandatory = $true)][string]$Label
    )

    if ([int]$Artifact.schemaVersion -ne 1 -or [string]$Artifact.artifactType -ne 'gmail-client-history-supplement') {
        throw "Unexpected $Label Gmail supplement schema or type."
    }
    if ([string]$Artifact.status -ne 'complete-exact-new-client-route') { throw "$Label Gmail supplement is not complete." }
    Assert-True -Value $Artifact.privacy.redacted -Label "$Label Gmail privacy.redacted"
    Assert-False -Value $Artifact.privacy.containsSecrets -Label "$Label Gmail privacy.containsSecrets"
    Assert-False -Value $Artifact.privacy.containsOneTimeCodes -Label "$Label Gmail privacy.containsOneTimeCodes"
    Assert-False -Value $Artifact.privacy.containsRawCommunications -Label "$Label Gmail privacy.containsRawCommunications"
    Assert-False -Value $Artifact.privacy.containsMessageSnippets -Label "$Label Gmail privacy.containsMessageSnippets"
    Assert-False -Value $Artifact.privacy.containsAttachmentContent -Label "$Label Gmail privacy.containsAttachmentContent"
    Assert-False -Value $Artifact.privacy.containsDirectContactDetails -Label "$Label Gmail privacy.containsDirectContactDetails"
    Assert-False -Value $Artifact.privacy.containsUnnecessaryPii -Label "$Label Gmail privacy.containsUnnecessaryPii"
    Assert-True -Value $Artifact.privacy.storesOpaqueGmailLocatorsOnly -Label "$Label Gmail privacy.storesOpaqueGmailLocatorsOnly"
    Assert-True -Value $Artifact.source.mailboxIdentityVerified -Label "$Label Gmail mailboxIdentityVerified"
    Assert-False -Value $Artifact.source.mailboxAddressStored -Label "$Label Gmail mailboxAddressStored"
    Assert-True -Value $Artifact.coverage.allExactQueriesReachedTokenExhaustion -Label "$Label Gmail exact query exhaustion"
    Assert-True -Value $Artifact.summary.promotionReady -Label "$Label Gmail promotion readiness"
    Assert-False -Value $Artifact.auditPolicy.literalContactAddressesStored -Label "$Label Gmail literalContactAddressesStored"
    Assert-True -Value $Artifact.auditPolicy.fullRelevantThreadRead -Label "$Label Gmail fullRelevantThreadRead"
    Assert-False -Value $Artifact.auditPolicy.attachmentBodiesOpened -Label "$Label Gmail attachmentBodiesOpened"
    Assert-False -Value $Artifact.auditPolicy.writesAllowed -Label "$Label Gmail writesAllowed"
    Assert-False -Value $Artifact.auditPolicy.mailboxMutationsPerformed -Label "$Label Gmail mailboxMutationsPerformed"
    if ([string]$Artifact.provenanceModel.granularity -ne 'client-record') { throw "$Label Gmail provenance must remain client-record scoped." }
    Assert-False -Value $Artifact.provenanceModel.itemLevelOneToOneLocatorMapping -Label "$Label Gmail provenance itemLevelOneToOneLocatorMapping"
    if (
        [string]$Artifact.source.registry -ne 'registry/clients.json' -or
        [string]$Artifact.source.registryRecord -ne $ExpectedClientId -or
        [string]$Artifact.coverage.canonicalClientId -ne $ExpectedClientId -or
        [string]$Artifact.client.clientId -ne $ExpectedClientId -or
        [string]$Artifact.client.displayName -cne $ExpectedDisplayName -or
        [string]$Artifact.client.registryStatus -ne 'active' -or
        [string]$Artifact.client.knowledgeDisposition -ne 'current-client-eligible' -or
        [int]$Artifact.summary.currentClientKnowledgeRecords -ne 1
    ) {
        throw "$Label Gmail supplement does not map exactly to its active canonical route."
    }
    if (
        [int]$Artifact.coverage.pagesRead -lt 1 -or
        [int]$Artifact.coverage.messageMatches -lt 1 -or
        [int]$Artifact.coverage.uniqueThreads -lt 1 -or
        [int]$Artifact.coverage.uniqueThreads -gt [int]$Artifact.coverage.messageMatches -or
        [int]$Artifact.client.coverage.messageMatches -ne [int]$Artifact.coverage.messageMatches -or
        [int]$Artifact.client.coverage.uniqueThreads -ne [int]$Artifact.coverage.uniqueThreads
    ) {
        throw "$Label Gmail supplement has inconsistent coverage counts."
    }
    $opaqueIds = @($Artifact.client.opaqueLocators.messageIds) + @($Artifact.client.opaqueLocators.threadIds)
    if ($opaqueIds.Count -lt 1 -or @($opaqueIds | Where-Object { [string]$_ -notmatch '^[A-Za-z0-9_-]{6,200}$' }).Count -gt 0) {
        throw "$Label Gmail supplement contains a missing or unsafe opaque locator."
    }
    $serialized = $Artifact | ConvertTo-Json -Depth 100 -Compress
    if ($serialized -match '(?i)[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}') {
        throw "$Label Gmail supplement contains a literal contact address."
    }
}

function Get-Utf8FileSnapshot {
    param([Parameter(Mandatory = $true)][string]$Path)

    $bytes = [IO.File]::ReadAllBytes($Path)
    $encoding = New-Object Text.UTF8Encoding($false, $true)
    $sha256 = [Security.Cryptography.SHA256]::Create()
    try {
        $hashBytes = $sha256.ComputeHash($bytes)
        return [pscustomobject]@{
            Text = $encoding.GetString($bytes)
            Sha256 = ([BitConverter]::ToString($hashBytes)).Replace('-', '')
        }
    } finally {
        $sha256.Dispose()
    }
}

function Get-ManagedFileState {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        return [pscustomobject]@{
            Exists = $false
            Text = $null
            Sha256 = $null
            NewLine = "`n"
            Prefix = $null
            ManagedBlock = $null
            Suffix = $null
            HasManagedBlock = $false
        }
    }

    $snapshot = Get-Utf8FileSnapshot -Path $Path
    $text = [string]$snapshot.Text
    $beginCount = ([regex]::Matches($text, [regex]::Escape($beginMarker))).Count
    $endCount = ([regex]::Matches($text, [regex]::Escape($endMarker))).Count
    if ($beginCount -ne $endCount -or $beginCount -gt 1) {
        throw "Malformed or duplicate client-history sentinels in $Path"
    }

    $newLine = "`n"
    if ($text.Contains("`r`n")) { $newLine = "`r`n" }

    if ($beginCount -eq 0) {
        return [pscustomobject]@{
            Exists = $true
            Text = $text
            Sha256 = [string]$snapshot.Sha256
            NewLine = $newLine
            Prefix = $text
            ManagedBlock = $null
            Suffix = ''
            HasManagedBlock = $false
        }
    }

    $start = $text.IndexOf($beginMarker, [StringComparison]::Ordinal)
    $endStart = $text.IndexOf($endMarker, [StringComparison]::Ordinal)
    if ($start -lt 0 -or $endStart -le $start) {
        throw "Client-history sentinels are out of order in $Path"
    }
    $managedEnd = $endStart + $endMarker.Length

    return [pscustomobject]@{
        Exists = $true
        Text = $text
        Sha256 = [string]$snapshot.Sha256
        NewLine = $newLine
        Prefix = $text.Substring(0, $start)
        ManagedBlock = $text.Substring($start, $managedEnd - $start)
        Suffix = $text.Substring($managedEnd)
        HasManagedBlock = $true
    }
}

function Assert-ExcludedClientContextState {
    param(
        [Parameter(Mandatory = $true)][string]$ZenContextPath,
        [Parameter(Mandatory = $true)][string]$ReviveContextPath
    )

    $zenState = Get-ManagedFileState -Path $ZenContextPath
    if (-not $zenState.Exists -or -not $zenState.HasManagedBlock) {
        throw 'Zen historical context must persist as a managed inactive snapshot.'
    }
    $zenBlock = [string]$zenState.ManagedBlock
    if ($zenBlock -notmatch '(?im)^- Promotion schema: `client-history-context/v1`\s*$') {
        throw 'Zen historical context must remain on the frozen v1 schema.'
    }
    if ($zenBlock -notmatch '(?im)^- Registry status: `inactive`(?:\s|\().*$') {
        throw 'Zen historical context must declare the inactive registry status.'
    }
    if ($zenBlock -notmatch '(?im)^- Slack: .*historical-only\.\s*$') {
        throw 'Zen historical context must state that Slack evidence is historical-only.'
    }
    if ($zenBlock -match '(?i)client-history-context/v2|complete-live-evidence') {
        throw 'Zen historical context contains an active-promotion marker.'
    }

    $reviveState = Get-ManagedFileState -Path $ReviveContextPath
    if ($reviveState.HasManagedBlock) {
        throw 'Revive Systems must not contain a client-history promotion block.'
    }

    return [pscustomobject]@{
        ZenSha256 = [string]$zenState.Sha256
        ReviveExists = [bool]$reviveState.Exists
        ReviveSha256 = if ($reviveState.Exists) { [string]$reviveState.Sha256 } else { $null }
    }
}

function Get-NameTokens {
    param([AllowNull()][object[]]$PeopleAndRoles)

    $tokens = New-Object 'System.Collections.Generic.List[string]'
    foreach ($entryObject in @($PeopleAndRoles)) {
        $entry = [string]$entryObject
        $colon = $entry.IndexOf(':')
        if ($colon -le 0) { continue }
        $names = $entry.Substring(0, $colon).Trim()
        $parts = @($names -split '\s*,\s*(?:and\s+)?|\s+and\s+|\s*&\s*')
        foreach ($partObject in $parts) {
            $part = ([string]$partObject).Trim()
            if ($part.Length -lt 2) { continue }
            $null = $tokens.Add($part)
            $first = @($part -split '\s+')[0]
            if ($first.Length -ge 3) { $null = $tokens.Add($first) }
        }
    }
    return @($tokens | Select-Object -Unique | Sort-Object Length -Descending)
}

function Get-ClientRoutingTokens {
    param([Parameter(Mandatory = $true)][object]$Client)

    $tokens = New-Object 'System.Collections.Generic.List[string]'
    foreach ($candidateObject in @([string]$Client.id, [string]$Client.displayName) + @($Client.aliases)) {
        $candidate = ([string]$candidateObject).Trim()
        if ([string]::IsNullOrWhiteSpace($candidate)) { continue }
        $null = $tokens.Add($candidate)
        if ($candidate -match '^(?i)The\s+(.+)$') {
            $withoutArticle = ([string]$Matches[1]).Trim()
            if (-not [string]::IsNullOrWhiteSpace($withoutArticle)) { $null = $tokens.Add($withoutArticle) }
        }
    }
    return @($tokens | Select-Object -Unique | Sort-Object Length -Descending)
}

function Get-CrossClientTokens {
    param(
        [Parameter(Mandatory = $true)][object[]]$RegistryClients,
        [Parameter(Mandatory = $true)][string]$CurrentClientId
    )

    $tokens = New-Object 'System.Collections.Generic.List[string]'
    foreach ($client in $RegistryClients) {
        if ([string]$client.id -eq $CurrentClientId) { continue }
        foreach ($token in @(Get-ClientRoutingTokens -Client $client)) { $null = $tokens.Add($token) }
    }
    return @($tokens | Select-Object -Unique | Sort-Object Length -Descending)
}

function Test-ContainsStandaloneToken {
    param(
        [AllowNull()][object]$Value,
        [AllowNull()][string[]]$Tokens = @()
    )

    $text = [string]$Value
    foreach ($token in @($Tokens)) {
        if ([string]::IsNullOrWhiteSpace($token)) { continue }
        $pattern = '(?i)(?<![\p{L}\p{N}])' + [regex]::Escape($token) + '(?![\p{L}\p{N}])'
        if ($text -match $pattern) { return $true }
    }
    return $false
}

function Replace-StandaloneToken {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Text,
        [Parameter(Mandatory = $true)][string]$Token,
        [Parameter(Mandatory = $true)][string]$Replacement
    )

    if ([string]::IsNullOrWhiteSpace($Token)) { return $Text }
    $pattern = '(?i)(?<![\p{L}\p{N}])' + [regex]::Escape($Token) + '(?![\p{L}\p{N}])'
    return [regex]::Replace($Text, $pattern, [Text.RegularExpressions.MatchEvaluator]{ param($match) $Replacement })
}

function ConvertTo-SafeText {
    param(
        [AllowNull()][object]$Value,
        [AllowNull()][string[]]$NameTokens = @(),
        [AllowNull()][string[]]$CrossClientTokens = @(),
        [string]$NameReplacement = '[stakeholder]',
        [switch]$VoicePattern
    )

    $text = [string]$Value
    $text = $text -replace '[\r\n\t]+', ' '
    $text = [regex]::Replace($text, 'https?://\S+', '[link omitted]', 'IgnoreCase')
    foreach ($token in @($NameTokens)) {
        $replacement = $NameReplacement
        if ($VoicePattern) { $replacement = '[recipient]' }
        $text = Replace-StandaloneToken -Text $text -Token $token -Replacement $replacement
    }
    foreach ($token in @($CrossClientTokens)) {
        $text = Replace-StandaloneToken -Text $text -Token $token -Replacement '[separate client omitted]'
    }
    if ($VoicePattern) {
        $text = [regex]::Replace($text, '(?i)\b(Hi|Hey)\s+(?!(?:or|and|there|team|all)\b)[A-Z][a-z]+\b', '$1 [recipient]')
        $text = $text.Replace('"', '').Replace([string][char]0x201C, '').Replace([string][char]0x201D, '')
    }
    $text = $text.Replace('|', '/')
    $text = [regex]::Replace($text, '\s+', ' ').Trim()

    if ($text -match '(?i)\b[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}\b') {
        throw 'Rendered context contains an email address.'
    }
    if ($text -match '(?i)(?:mail\.google\.com|slack\.com/archives)') {
        throw 'Rendered context contains a Gmail or Slack URL.'
    }
    if ($text -match '(?i)\b(?:password|api[ _-]?key|access[ _-]?token|one[ _-]?time[ _-]?code|recovery[ _-]?code)\b\s*[:=]\s*\S+') {
        throw 'Rendered context contains a secret-like assignment.'
    }
    if ($text -match '(?i)\bOn\s+.+\s+wrote:\s*$') {
        throw 'Rendered context contains quoted reply history.'
    }
    return $text
}

function Get-RedactedRoles {
    param(
        [AllowNull()][object[]]$PeopleAndRoles,
        [AllowNull()][string[]]$CrossClientTokens = @()
    )

    $roles = New-Object 'System.Collections.Generic.List[string]'
    foreach ($entryObject in @($PeopleAndRoles)) {
        $entry = [string]$entryObject
        $colon = $entry.IndexOf(':')
        $role = $entry
        if ($colon -gt 0 -and $colon -lt ($entry.Length - 1)) {
            $role = $entry.Substring($colon + 1)
        } elseif ($entry -match '^(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\s+as\s+(.+)$') {
            $role = [string]$Matches[1]
        }
        $safe = ConvertTo-SafeText -Value $role -CrossClientTokens $CrossClientTokens
        if (-not [string]::IsNullOrWhiteSpace($safe)) { $null = $roles.Add($safe) }
    }
    return @($roles | Select-Object -Unique)
}

function Add-MarkdownBullets {
    param(
        [Parameter(Mandatory = $true)][Text.StringBuilder]$Builder,
        [AllowNull()][object[]]$Values,
        [AllowNull()][string[]]$NameTokens = @(),
        [AllowNull()][string[]]$CrossClientTokens = @(),
        [string]$NameReplacement = '[stakeholder]',
        [switch]$VoicePattern
    )

    $rendered = New-Object 'System.Collections.Generic.List[string]'
    foreach ($value in @($Values)) {
        if (Test-ContainsStandaloneToken -Value $value -Tokens $CrossClientTokens) { continue }
        $safe = ConvertTo-SafeText -Value $value -NameTokens $NameTokens -CrossClientTokens $CrossClientTokens -NameReplacement $NameReplacement -VoicePattern:$VoicePattern
        if (-not [string]::IsNullOrWhiteSpace($safe)) { $null = $rendered.Add($safe) }
    }
    if ($rendered.Count -eq 0) {
        $null = $Builder.AppendLine('- unknown')
        return
    }
    foreach ($item in @($rendered | Select-Object -Unique)) {
        $null = $Builder.AppendLine('- ' + $item)
    }
}

function Assert-ManagedBlockSafe {
    param(
        [Parameter(Mandatory = $true)][string]$Block,
        [Parameter(Mandatory = $true)][object]$CurrentClient,
        [Parameter(Mandatory = $true)][object[]]$RegistryClients
    )

    $forbiddenPatterns = @(
        '(?i)\b[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}\b',
        '(?i)https?://',
        '(?i)(?:mail\.google\.com|slack\.com/archives)',
        '(?i)<(?:html|body|blockquote)\b',
        '(?im)^\s*>\s+',
        '(?i)\bOn\s+.+\s+wrote:',
        '(?i)\b(?:password|api[ _-]?key|access[ _-]?token|one[ _-]?time[ _-]?code|recovery[ _-]?code)\b\s*[:=]\s*\S+',
        '(?<!\d)(?:\+?1[\s.\-]?)?\(?\d{3}\)?[\s.\-]\d{3}[\s.\-]\d{4}(?!\d)'
    )
    foreach ($pattern in $forbiddenPatterns) {
        if ($Block -match $pattern) {
            throw "Managed block for $($CurrentClient.id) failed its privacy scan."
        }
    }

    foreach ($other in $RegistryClients) {
        if ([string]$other.id -eq [string]$CurrentClient.id) { continue }
        foreach ($token in @(Get-ClientRoutingTokens -Client $other)) {
            if ([string]::IsNullOrWhiteSpace($token)) { continue }
            $pattern = '(?i)(?<![\p{L}\p{N}])' + [regex]::Escape($token) + '(?![\p{L}\p{N}])'
            if ($Block -match $pattern) {
                $matchingLines = @($Block -split '\r?\n' | Where-Object { $_ -match $pattern })
                foreach ($matchingLine in $matchingLines) {
                    $allowedPortfolioAffiliation = (
                        [string]$other.id -eq 'momentum-360' -and
                        [string]$CurrentClient.id -in @($expectedIndependentClients + $expectedAffiliatedClient) -and
                        $matchingLine -match '^- Affiliation constraint:'
                    )
                    if (-not $allowedPortfolioAffiliation) {
                        throw "Managed block for $($CurrentClient.id) contains cross-client token '$token' in: $matchingLine"
                    }
                }
            }
        }
    }
}

function New-ManagedBlock {
    param(
        [Parameter(Mandatory = $true)][object]$RegistryClient,
        [Parameter(Mandatory = $true)][object]$GmailClient,
        [Parameter(Mandatory = $true)][object]$SlackClient,
        [Parameter(Mandatory = $true)][object]$GmailArtifact,
        [Parameter(Mandatory = $true)][object]$SlackArtifact,
        [Parameter(Mandatory = $true)][object[]]$RegistryClients,
        [Parameter(Mandatory = $true)][string]$GmailLocator,
        [Parameter(Mandatory = $true)][string]$SlackLocator,
        [Parameter(Mandatory = $true)][string]$GmailHash,
        [Parameter(Mandatory = $true)][string]$SlackHash,
        [Parameter(Mandatory = $true)][string]$NewLine
    )

    $gmailNameTokens = @(Get-NameTokens -PeopleAndRoles @($GmailClient.keyPeopleAndRoles))
    $slackNameTokens = @(Get-NameTokens -PeopleAndRoles @($SlackClient.keyPeopleAndRoles))
    $nameTokens = @($gmailNameTokens + $slackNameTokens | Select-Object -Unique)
    $crossClientTokens = @(Get-CrossClientTokens -RegistryClients $RegistryClients -CurrentClientId ([string]$RegistryClient.id))
    $gmailRoles = @(Get-RedactedRoles -PeopleAndRoles @($GmailClient.keyPeopleAndRoles) -CrossClientTokens $crossClientTokens)
    $slackRoles = @(Get-RedactedRoles -PeopleAndRoles @($SlackClient.keyPeopleAndRoles) -CrossClientTokens $crossClientTokens)
    $confidenceLevel = ConvertTo-SafeText -Value $GmailClient.confidence.level
    $confidenceScore = [string]::Format([Globalization.CultureInfo]::InvariantCulture, '{0:0.00}', [double]$GmailClient.confidence.score)
    $confidenceRationale = ConvertTo-SafeText -Value $GmailClient.confidence.rationale -NameTokens $nameTokens -CrossClientTokens $crossClientTokens
    $slackConfidenceLevel = ConvertTo-SafeText -Value $SlackClient.confidence.level
    $slackConfidenceScore = [string]::Format([Globalization.CultureInfo]::InvariantCulture, '{0:0.00}', [double]$SlackClient.confidence.score)
    $slackConfidenceRationale = ConvertTo-SafeText -Value $SlackClient.confidence.rationale -NameTokens $nameTokens -CrossClientTokens $crossClientTokens -NameReplacement 'operator'
    $gmailGeneratedDate = ([DateTimeOffset]$GmailArtifact.generatedAtUtc).ToString('yyyy-MM-dd')
    $slackGeneratedDate = ([DateTimeOffset]$SlackArtifact.generatedAtUtc).ToString('yyyy-MM-dd')
    $gmailCoverage = $GmailClient.coverage
    $gmailPageNoun = if ([int]$gmailCoverage.pages -eq 1) { 'page' } else { 'pages' }
    $slackCoverage = $SlackClient.coverage
    $slackAuditStatus = [string]$SlackClient.slackAuditStatus
    $slackHasEvidence = $slackAuditStatus -like 'complete-live-evidence*'
    $slackConversationCount = @($SlackClient.matchedConversations).Count
    $slackThreadNoun = if ([int]$slackCoverage.threadCount -eq 1) { 'important thread' } else { 'important threads' }
    $slackLastDate = if ($null -eq $slackCoverage.newestMessageAt) { $null } else { ([DateTimeOffset]$slackCoverage.newestMessageAt).ToString('yyyy-MM-dd') }
    $statusRecord = $GmailClient.lastKnownStatusFromGmail
    $statusBasis = ConvertTo-SafeText -Value $statusRecord.basis -NameTokens $nameTokens -CrossClientTokens $crossClientTokens
    $statusState = ConvertTo-SafeText -Value $statusRecord.state -NameTokens $nameTokens -CrossClientTokens $crossClientTokens
    $statusIsInternalOnly = ([string]$statusRecord.basis -match '(?i)latest internal draft|^calendar and internal draft')

    $builder = New-Object Text.StringBuilder
    $null = $builder.AppendLine($beginMarker)
    $null = $builder.AppendLine('## Communication-derived operating context')
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('- Promotion schema: `client-history-context/v2`')
    $null = $builder.AppendLine(('- Last updated from artifact set: {0}' -f $slackGeneratedDate))
    $null = $builder.AppendLine('- Context role: redacted historical operating evidence; not canonical queue state, delivery authorization, or item-level message attribution')
    $null = $builder.AppendLine(('- Canonical client ID: `{0}`' -f [string]$RegistryClient.id))
    $null = $builder.AppendLine(('- Canonical display name: {0}' -f [string]$RegistryClient.displayName))
    $null = $builder.AppendLine(('- Registry status: `{0}`' -f [string]$RegistryClient.status))
    $null = $builder.AppendLine(('- Knowledge disposition: `{0}`' -f [string]$GmailClient.knowledgeDisposition))
    $null = $builder.AppendLine('- Privacy: names reduced to roles; no raw messages, snippets, contact details, message URLs, secrets, or one-to-one item/message claims')
    $null = $builder.AppendLine(('- Gmail evidence confidence: {0} ({1}); {2}' -f $confidenceLevel, $confidenceScore, $confidenceRationale))
    $null = $builder.AppendLine(('- Slack evidence confidence: {0} ({1}); {2}' -f $slackConfidenceLevel, $slackConfidenceScore, $slackConfidenceRationale))
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('### Evidence coverage')
    $null = $builder.AppendLine()
    $null = $builder.AppendLine(('- Gmail: `{0}`; {1} matched messages across {2} threads and {3} {4}, {5} through {6}; exact registry queries reached token exhaustion. Counts are client-query matches, not portfolio-unique totals.' -f [string]$GmailArtifact.status, [int]$gmailCoverage.messageMatches, [int]$gmailCoverage.uniqueThreads, [int]$gmailCoverage.pages, $gmailPageNoun, [string]$gmailCoverage.oldestDate, [string]$gmailCoverage.newestDate))
    $null = $builder.AppendLine(('- Gmail artifact: `{0}`; SHA-256 `{1}`' -f $GmailLocator, $GmailHash))
    if ($slackHasEvidence) {
        $null = $builder.AppendLine(('- Slack: `{0}`; {1} Dillon-authored messages across {2} matched conversations and {3} {4}, {5} through {6}; relevant cursors were exhausted within the connected user''s visible scope.' -f $slackAuditStatus, [int]$slackCoverage.messageCount, $slackConversationCount, [int]$slackCoverage.threadCount, $slackThreadNoun, ([DateTimeOffset]$slackCoverage.oldestMessageAt).ToString('yyyy-MM-dd'), $slackLastDate))
    } else {
        $null = $builder.AppendLine(('- Slack: `{0}`; no safely attributable Dillon-authored evidence matched this client within the audited visible scope. This is not a universal absence claim.' -f $slackAuditStatus))
    }
    $null = $builder.AppendLine(('- Slack artifact: `{0}`; SHA-256 `{1}`' -f $SlackLocator, $SlackHash))
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('### Identity and routing')
    $null = $builder.AppendLine()
    $constraints = @(Get-OptionalProperty -InputObject $RegistryClient -Name 'affiliationConstraints' -Default @())
    if ($constraints.Count -eq 0) {
        $null = $builder.AppendLine('- Affiliation constraints: no explicit portfolio affiliation assertion is recorded; do not infer ownership from shared communication participants.')
    } else {
        foreach ($constraint in $constraints) {
            if ([string]$constraint.relation -eq 'not-client-of') {
                $null = $builder.AppendLine(('- Affiliation constraint: not a client of Momentum 360; exact portfolio owner remains unknown. Observed {0}; confidence {1}; source `{2}`.' -f [string]$constraint.observedAt, [string]$constraint.confidence, [string]$constraint.sourceLocator))
            } elseif ([string]$constraint.relation -eq 'client-of' -and [string]$RegistryClient.id -eq $expectedAffiliatedClient) {
                $null = $builder.AppendLine(('- Affiliation constraint: verified child-client route under Momentum 360; keep its identity, work, metrics, and status separate from the parent portfolio record. Observed {0}; confidence {1}; source `{2}`.' -f [string]$constraint.observedAt, [string]$constraint.confidence, [string]$constraint.sourceLocator))
            } else {
                throw "Unsupported affiliation constraint while rendering $($RegistryClient.id)."
            }
        }
    }
    $gmailRoutingConstraint = ConvertTo-SafeText -Value $GmailClient.routingConstraint -NameTokens $nameTokens -CrossClientTokens $crossClientTokens
    if ([string]::IsNullOrWhiteSpace($gmailRoutingConstraint)) {
        $gmailRoutingConstraint = 'unknown; no additional Gmail routing constraint was recorded'
    } elseif ($gmailRoutingConstraint.Contains('[separate client omitted]')) {
        if ([string]$RegistryClient.id -in $expectedIndependentClients) {
            $gmailRoutingConstraint = 'Independent current client. Enforce the negative affiliation constraint above and do not infer portfolio ownership.'
        } elseif ([string]$RegistryClient.id -eq 'momentum-360') {
            $gmailRoutingConstraint = 'Keep independently routed client records separate from Momentum 360.'
        } else {
            $gmailRoutingConstraint = 'Keep the referenced client record separate; do not blend routing, context, metrics, or current state.'
        }
    }
    $slackRoutingConstraint = ConvertTo-SafeText -Value $SlackClient.routingConstraint -NameTokens $nameTokens -CrossClientTokens $crossClientTokens
    if ([string]$RegistryClient.id -eq $expectedAffiliatedClient) {
        $gmailRoutingConstraint = 'Allow exact interactive Bridge resolution; background label-only packets still require a registered source identity.'
        $slackRoutingConstraint = 'Use the exact Bridge channel or registered source identity and keep this child-client route isolated from the parent portfolio record.'
    } elseif ([string]::IsNullOrWhiteSpace($slackRoutingConstraint)) {
        $slackRoutingConstraint = 'no additional Slack routing constraint was recorded'
    } elseif ($slackRoutingConstraint.Contains('[separate client omitted]')) {
        $slackRoutingConstraint = 'Keep the referenced client record separate; do not blend routing, context, metrics, or current state.'
    }
    $null = $builder.AppendLine(('- Gmail routing constraint: {0}' -f $gmailRoutingConstraint))
    $null = $builder.AppendLine(('- Slack routing constraint: {0}' -f $slackRoutingConstraint))
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('### Key people and roles')
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('#### Gmail-derived roles')
    $null = $builder.AppendLine()
    Add-MarkdownBullets -Builder $builder -Values $gmailRoles -CrossClientTokens $crossClientTokens
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('#### Slack-derived roles')
    $null = $builder.AppendLine()
    if ($slackHasEvidence) { Add-MarkdownBullets -Builder $builder -Values $slackRoles -CrossClientTokens $crossClientTokens }
    else { $null = $builder.AppendLine('- No safely attributable role evidence matched within the audited visible Slack scope.') }
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('### Recurring work patterns')
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('#### Gmail-derived patterns')
    $null = $builder.AppendLine()
    Add-MarkdownBullets -Builder $builder -Values @($GmailClient.recurringWork) -NameTokens $nameTokens -CrossClientTokens $crossClientTokens
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('#### Slack-derived patterns')
    $null = $builder.AppendLine()
    if ($slackHasEvidence) { Add-MarkdownBullets -Builder $builder -Values @($SlackClient.recurringWork) -NameTokens $nameTokens -CrossClientTokens $crossClientTokens }
    else { $null = $builder.AppendLine('- No safely attributable recurring-work evidence matched within the audited visible Slack scope.') }
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('### Communication-derived commitments and promises')
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('These inherit the enclosing client-record evidence scope. Re-read the cited source before treating any one item as current or message-specific.')
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('#### Gmail-derived commitments')
    $null = $builder.AppendLine()
    Add-MarkdownBullets -Builder $builder -Values @($GmailClient.commitmentsAndPromises) -NameTokens $nameTokens -CrossClientTokens $crossClientTokens
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('#### Slack-derived commitments')
    $null = $builder.AppendLine()
    if ($slackHasEvidence) { Add-MarkdownBullets -Builder $builder -Values @($SlackClient.commitmentsAndPromises) -NameTokens $nameTokens -CrossClientTokens $crossClientTokens }
    else { $null = $builder.AppendLine('- No safely attributable commitment evidence matched within the audited visible Slack scope.') }
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('### Communication-derived decisions')
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('These are historical decision signals, not permission for sending, publishing, spend, account changes, or other external action.')
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('#### Gmail-derived decisions')
    $null = $builder.AppendLine()
    Add-MarkdownBullets -Builder $builder -Values @($GmailClient.decisions) -NameTokens $nameTokens -CrossClientTokens $crossClientTokens
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('#### Slack-derived decisions')
    $null = $builder.AppendLine()
    if ($slackHasEvidence) { Add-MarkdownBullets -Builder $builder -Values @($SlackClient.decisions) -NameTokens $nameTokens -CrossClientTokens $crossClientTokens }
    else { $null = $builder.AppendLine('- No safely attributable decision evidence matched within the audited visible Slack scope.') }
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('### Campaigns and services')
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('#### Gmail-derived campaigns and services')
    $null = $builder.AppendLine()
    Add-MarkdownBullets -Builder $builder -Values @($GmailClient.campaignsAndServices) -NameTokens $nameTokens -CrossClientTokens $crossClientTokens
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('#### Slack-derived campaigns and services')
    $null = $builder.AppendLine()
    if ($slackHasEvidence) { Add-MarkdownBullets -Builder $builder -Values @($SlackClient.campaignsAndServices) -NameTokens $nameTokens -CrossClientTokens $crossClientTokens }
    else { $null = $builder.AppendLine('- No safely attributable campaign or service evidence matched within the audited visible Slack scope.') }
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('### Metrics and tools')
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('#### Gmail-derived metric signals')
    $null = $builder.AppendLine()
    Add-MarkdownBullets -Builder $builder -Values @($GmailClient.metricsLinksAndTools.metrics) -NameTokens $nameTokens -CrossClientTokens $crossClientTokens
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('#### Gmail-derived tools mentioned')
    $null = $builder.AppendLine()
    Add-MarkdownBullets -Builder $builder -Values @($GmailClient.metricsLinksAndTools.tools) -NameTokens $nameTokens -CrossClientTokens $crossClientTokens
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('#### Slack-derived metrics and tools')
    $null = $builder.AppendLine()
    if ($slackHasEvidence) { Add-MarkdownBullets -Builder $builder -Values @($SlackClient.metricsAndTools) -NameTokens $nameTokens -CrossClientTokens $crossClientTokens }
    else { $null = $builder.AppendLine('- No safely attributable metric or tool evidence matched within the audited visible Slack scope.') }
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('### Dillon sent-email patterns')
    $null = $builder.AppendLine()
    $null = $builder.AppendLine(('- Support: {0} sent-message matches across {1} sent threads.' -f [int]$GmailClient.dillonSentVoice.support.sentMessageMatches, [int]$GmailClient.dillonSentVoice.support.sentThreadMatches))
    $null = $builder.AppendLine('- Scope: aggregate sent-email behavior for this client only; not raw quotes and not the client brand voice.')
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('#### Patterns')
    $null = $builder.AppendLine()
    Add-MarkdownBullets -Builder $builder -Values @($GmailClient.dillonSentVoice.patterns) -NameTokens $nameTokens -CrossClientTokens $crossClientTokens -VoicePattern
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('#### Watchouts')
    $null = $builder.AppendLine()
    Add-MarkdownBullets -Builder $builder -Values @($GmailClient.dillonSentVoice.watchouts) -NameTokens $nameTokens -CrossClientTokens $crossClientTokens -VoicePattern
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('### Dillon Slack patterns')
    $null = $builder.AppendLine()
    if ($slackHasEvidence) {
        $null = $builder.AppendLine(('- Support: {0} Dillon-authored messages across {1} matched conversations.' -f [int]$slackCoverage.messageCount, $slackConversationCount))
        $null = $builder.AppendLine('- Scope: aggregate Dillon-authored Slack behavior for this client within visible audited conversations; not raw quotes and not the client brand voice.')
        $null = $builder.AppendLine()
        Add-MarkdownBullets -Builder $builder -Values @($SlackClient.dillonVoiceAndTonePatterns) -NameTokens $nameTokens -CrossClientTokens $crossClientTokens -VoicePattern
    } else {
        $null = $builder.AppendLine('- No client-specific Slack voice pattern is promoted because no safely attributable Dillon-authored evidence matched within the audited visible scope.')
    }
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('### Current-state signals')
    $null = $builder.AppendLine()
    if ($statusIsInternalOnly) {
        $null = $builder.AppendLine(('- Gmail current external status: unknown as of {0}; the newest basis is internal Draft or calendar evidence and is not promoted as current.' -f [string]$statusRecord.asOf))
        $null = $builder.AppendLine(('- Internal-only signal retained for context: {0}' -f $statusState))
    } else {
        $null = $builder.AppendLine(('- Gmail last-known signal as of {0} (basis: {1}): {2}' -f [string]$statusRecord.asOf, $statusBasis, $statusState))
    }
    if ($slackHasEvidence) {
        $slackStatusState = ConvertTo-SafeText -Value $SlackClient.lastKnownStatusFromSlack -NameTokens $nameTokens -CrossClientTokens $crossClientTokens
        $null = $builder.AppendLine(('- Slack last-known signal as of {0} within the audited visible scope ({1}, {2}): {3}' -f $slackLastDate, $slackConfidenceLevel, $slackConfidenceScore, $slackStatusState))
    } else {
        $null = $builder.AppendLine('- Slack last-known status: unknown; no safely attributable Dillon-authored evidence matched within the audited visible scope, which does not prove absence outside that scope.')
    }
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('#### Potential Gmail open loops requiring source re-read')
    $null = $builder.AppendLine()
    Add-MarkdownBullets -Builder $builder -Values @($GmailClient.openLoops) -NameTokens $nameTokens -CrossClientTokens $crossClientTokens
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('#### Potential Slack open loops requiring source re-read')
    $null = $builder.AppendLine()
    if ($slackHasEvidence) { Add-MarkdownBullets -Builder $builder -Values @($SlackClient.openLoops) -NameTokens $nameTokens -CrossClientTokens $crossClientTokens }
    else { $null = $builder.AppendLine('- No Slack open loop is promoted from a zero-match client row.') }
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('#### Known unknowns')
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('- Item-level source mapping is unknown because the audit provenance is client-record scoped.')
    $null = $builder.AppendLine('- Slack facts inherit the enclosing client-row coverage and opaque locator set; they are not claimed as one-fact-to-one-message mappings.')
    $null = $builder.AppendLine('- Slack conclusions are authoritative only within conversations visible to the connected user and exclude deleted messages and inaccessible file bodies.')
    $null = $builder.AppendLine('- Any conflict with newer canonical queue or live-system evidence requires source re-read; this block does not overwrite that state.')
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('### Communication source ledger')
    $null = $builder.AppendLine()
    $null = $builder.AppendLine('| Claim scope | Observed date or window | Confidence | Safe source locator |')
    $null = $builder.AppendLine('| --- | --- | --- | --- |')
    $null = $builder.AppendLine(('| Gmail synthesized client record | {0} through {1} | {2} ({3}) | `{4}` |' -f [string]$gmailCoverage.oldestDate, [string]$gmailCoverage.newestDate, $confidenceLevel, $confidenceScore, $GmailLocator))
    $null = $builder.AppendLine(('| Gmail last-known status signal | {0} | {1} ({2}) | `{3}` |' -f [string]$statusRecord.asOf, $confidenceLevel, $confidenceScore, $GmailLocator))
    if ($slackHasEvidence) {
        $null = $builder.AppendLine(('| Slack synthesized client record | {0} through {1} | {2} ({3}) | `{4}` |' -f ([DateTimeOffset]$slackCoverage.oldestMessageAt).ToString('yyyy-MM-dd'), $slackLastDate, $slackConfidenceLevel, $slackConfidenceScore, $SlackLocator))
        $null = $builder.AppendLine(('| Slack last-known status signal | {0} | {1} ({2}) | `{3}` |' -f $slackLastDate, $slackConfidenceLevel, $slackConfidenceScore, $SlackLocator))
    } else {
        $null = $builder.AppendLine(('| Slack audited no-match coverage | {0} | none; visible-scope no-match only | `{1}` |' -f $slackGeneratedDate, $SlackLocator))
    }
    $null = $builder.Append($endMarker)

    $block = $builder.ToString().Replace("`r`n", "`n").Replace("`r", "`n")
    if ($NewLine -ne "`n") { $block = $block.Replace("`n", $NewLine) }
    Assert-ManagedBlockSafe -Block $block -CurrentClient $RegistryClient -RegistryClients $RegistryClients
    return $block
}

function Start-Utf8AtomicWrite {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Text,
        [Parameter(Mandatory = $true)][bool]$DestinationExists,
        [AllowNull()][string]$ExpectedOriginalSha256
    )

    $directory = Split-Path -Parent $Path
    if (-not (Test-Path -LiteralPath $directory -PathType Container)) {
        [IO.Directory]::CreateDirectory($directory) | Out-Null
    }
    $fileName = [IO.Path]::GetFileName($Path)
    $tempPath = Join-Path $directory ('.' + $fileName + '.' + [guid]::NewGuid().ToString('N') + '.tmp')
    $backupPath = $tempPath + '.bak'
    $lockPath = Join-Path $directory ('.' + $fileName + '.client-history.lock')
    $encoding = New-Object Text.UTF8Encoding($false)
    $lockStream = $null
    $replacementCompleted = $false
    try {
        $lockStream = [IO.File]::Open($lockPath, [IO.FileMode]::OpenOrCreate, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
        [IO.File]::WriteAllBytes($tempPath, $encoding.GetBytes($Text))
        if ($DestinationExists) {
            if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
                throw "Destination disappeared before atomic replacement: $Path"
            }
            $actualOriginalSha256 = Get-Sha256Hex -Path $Path
            if ([string]::IsNullOrWhiteSpace($ExpectedOriginalSha256) -or $actualOriginalSha256 -cne $ExpectedOriginalSha256) {
                throw "Concurrent edit detected before atomic replacement: $Path"
            }
            [IO.File]::Replace($tempPath, $Path, $backupPath, $true)
            $replacementCompleted = $true
        } else {
            if (Test-Path -LiteralPath $Path) {
                throw "Destination appeared before atomic creation: $Path"
            }
            [IO.File]::Move($tempPath, $Path)
            $replacementCompleted = $true
        }

        return [pscustomobject]@{
            Path = $Path
            DestinationExisted = $DestinationExists
            BackupPath = $backupPath
            LockPath = $lockPath
            LockStream = $lockStream
        }
    } catch {
        $failure = $_
        $restoreFailure = $null
        if ($replacementCompleted) {
            try {
                if ($DestinationExists) {
                    if (-not (Test-Path -LiteralPath $backupPath -PathType Leaf)) { throw 'Atomic backup is missing.' }
                    if (Test-Path -LiteralPath $Path -PathType Leaf) {
                        [IO.File]::Replace($backupPath, $Path, $null, $true)
                    } else {
                        [IO.File]::Move($backupPath, $Path)
                    }
                } elseif (Test-Path -LiteralPath $Path) {
                    Remove-Item -LiteralPath $Path -Force
                }
            } catch {
                $restoreFailure = $_
            }
        }
        if (Test-Path -LiteralPath $tempPath) {
            Remove-Item -LiteralPath $tempPath -Force -ErrorAction SilentlyContinue
        }
        if ($null -ne $lockStream) { $lockStream.Dispose() }
        if (Test-Path -LiteralPath $lockPath) {
            Remove-Item -LiteralPath $lockPath -Force -ErrorAction SilentlyContinue
        }
        if ($null -ne $restoreFailure) {
            throw "Atomic write failed and rollback also failed for $Path. Backup retained at $backupPath. Original error: $($failure.Exception.Message). Rollback error: $($restoreFailure.Exception.Message)"
        }
        throw $failure
    }
}

function Complete-Utf8AtomicWrite {
    param([Parameter(Mandatory = $true)][object]$Receipt)

    $cleanupFailure = $null
    try {
        if (Test-Path -LiteralPath ([string]$Receipt.BackupPath)) {
            Remove-Item -LiteralPath ([string]$Receipt.BackupPath) -Force
        }
    } catch {
        $cleanupFailure = $_
    } finally {
        if ($null -ne $Receipt.LockStream) { $Receipt.LockStream.Dispose() }
        if (Test-Path -LiteralPath ([string]$Receipt.LockPath)) {
            Remove-Item -LiteralPath ([string]$Receipt.LockPath) -Force -ErrorAction SilentlyContinue
        }
    }
    if ($null -ne $cleanupFailure) { throw $cleanupFailure }
}

function Undo-Utf8AtomicWrite {
    param([Parameter(Mandatory = $true)][object]$Receipt)

    $restoreFailure = $null
    try {
        if ([bool]$Receipt.DestinationExisted) {
            if (-not (Test-Path -LiteralPath ([string]$Receipt.BackupPath) -PathType Leaf)) {
                throw 'Atomic backup is missing.'
            }
            if (Test-Path -LiteralPath ([string]$Receipt.Path) -PathType Leaf) {
                [IO.File]::Replace([string]$Receipt.BackupPath, [string]$Receipt.Path, $null, $true)
            } else {
                [IO.File]::Move([string]$Receipt.BackupPath, [string]$Receipt.Path)
            }
        } elseif (Test-Path -LiteralPath ([string]$Receipt.Path)) {
            Remove-Item -LiteralPath ([string]$Receipt.Path) -Force
        }
    } catch {
        $restoreFailure = $_
    } finally {
        if ($null -ne $Receipt.LockStream) { $Receipt.LockStream.Dispose() }
        if (Test-Path -LiteralPath ([string]$Receipt.LockPath)) {
            Remove-Item -LiteralPath ([string]$Receipt.LockPath) -Force -ErrorAction SilentlyContinue
        }
    }
    if ($null -ne $restoreFailure) {
        throw "Post-write verification failed and rollback failed for $($Receipt.Path). Backup retained at $($Receipt.BackupPath). Rollback error: $($restoreFailure.Exception.Message)"
    }
}

$GmailArtifactPath = Resolve-ProjectPath -Path $GmailArtifactPath -DefaultRelativePath 'state\client-history-research\gmail-client-history-2026-07-16.json'
$GmailSupplementArtifactPath = Resolve-ProjectPath -Path $GmailSupplementArtifactPath -DefaultRelativePath 'state\client-history-research\gmail-bridge-software-history-2026-07-16.json'
$GmailOnsiteSupplementArtifactPath = Resolve-ProjectPath -Path $GmailOnsiteSupplementArtifactPath -DefaultRelativePath 'state\client-history-research\gmail-onsite-concrete-landscape-history-2026-07-16.json'
$SlackArtifactPath = Resolve-ProjectPath -Path $SlackArtifactPath -DefaultRelativePath 'state\client-history-research\slack-client-history-2026-07-16.json'
$RegistryPath = Resolve-ProjectPath -Path $RegistryPath -DefaultRelativePath 'registry\clients.json'

$registry = Read-JsonFile -Path $RegistryPath
$gmail = Read-JsonFile -Path $GmailArtifactPath
$gmailSupplement = Read-JsonFile -Path $GmailSupplementArtifactPath
$gmailOnsiteSupplement = Read-JsonFile -Path $GmailOnsiteSupplementArtifactPath
$slack = Read-JsonFile -Path $SlackArtifactPath

if ([int]$registry.schemaVersion -ne 1) { throw 'Unsupported client registry schema.' }
$registryClients = @($registry.clients)
$activeClients = @($registryClients | Where-Object { [string]$_.status -eq 'active' })
$inactiveClients = @($registryClients | Where-Object { [string]$_.status -eq 'inactive' })
$needsConfirmationClients = @($registryClients | Where-Object { [string]$_.status -eq 'needs-confirmation' })
$unexpectedRegistryStatuses = @($registryClients | Where-Object { [string]$_.status -notin @('active', 'inactive', 'needs-confirmation') })
if (
    $registryClients.Count -ne [int]$expectedPortfolioContract.Total -or
    $activeClients.Count -ne [int]$expectedPortfolioContract.Active -or
    $inactiveClients.Count -ne [int]$expectedPortfolioContract.Inactive -or
    $needsConfirmationClients.Count -ne [int]$expectedPortfolioContract.NeedsConfirmation
) {
    throw ('Registry must contain exactly {0} clients: {1} active, {2} inactive, and {3} needs-confirmation.' -f $expectedPortfolioContract.Total, $expectedPortfolioContract.Active, $expectedPortfolioContract.Inactive, $expectedPortfolioContract.NeedsConfirmation)
}
if ([string]$inactiveClients[0].id -ne $expectedInactiveClient) { throw 'Zen Spa must be the sole inactive historical client.' }
if ([string]$needsConfirmationClients[0].id -ne $expectedQuarantinedClient) { throw 'Revive Systems must be the sole needs-confirmation client.' }
if ($unexpectedRegistryStatuses.Count -ne 0) { throw 'Registry contains an unsupported client status.' }

if ([string]$gmail.artifactType -ne 'gmail-client-history-audit') { throw 'Unexpected Gmail artifact type.' }
if ([string]$gmail.status -ne 'complete-exact-registry-match') { throw 'Gmail audit is not complete for exact registry matches.' }
Assert-True -Value $gmail.privacy.redacted -Label 'Gmail privacy.redacted'
Assert-False -Value $gmail.privacy.containsSecrets -Label 'Gmail privacy.containsSecrets'
Assert-False -Value $gmail.privacy.containsOneTimeCodes -Label 'Gmail privacy.containsOneTimeCodes'
Assert-False -Value $gmail.privacy.containsRawCommunications -Label 'Gmail privacy.containsRawCommunications'
Assert-False -Value $gmail.privacy.containsMessageSnippets -Label 'Gmail privacy.containsMessageSnippets'
Assert-False -Value $gmail.privacy.containsAttachmentContent -Label 'Gmail privacy.containsAttachmentContent'
Assert-False -Value $gmail.privacy.containsDirectContactDetails -Label 'Gmail privacy.containsDirectContactDetails'
Assert-False -Value $gmail.privacy.containsUnnecessaryPii -Label 'Gmail privacy.containsUnnecessaryPii'
Assert-True -Value $gmail.privacy.storesOpaqueGmailLocatorsOnly -Label 'Gmail privacy.storesOpaqueGmailLocatorsOnly'
Assert-True -Value $gmail.coverage.allExactQueriesReachedTokenExhaustion -Label 'Gmail exact query exhaustion'
if ([int]$gmail.coverage.activeRecordsEligibleForCurrentClientKnowledge -ne 17 -or [int]$gmail.coverage.needsConfirmationRecordsQuarantined -ne 1) {
    throw 'Gmail active and quarantined coverage counts do not match the registry contract.'
}
if (@($gmail.portfolioRouting.quarantinedClientIds).Count -ne 1 -or [string]$gmail.portfolioRouting.quarantinedClientIds[0] -ne $expectedQuarantinedClient) {
    throw 'Gmail portfolio routing does not quarantine Revive Systems exactly.'
}
$gmailIndependent = @($gmail.portfolioRouting.independentCurrentClientsNotMomentum360 | Sort-Object)
$expectedIndependent = @($expectedIndependentClients | Sort-Object)
if (($gmailIndependent -join '|') -cne ($expectedIndependent -join '|')) {
    throw 'Gmail portfolio routing does not preserve the three independent-client guards exactly.'
}
if ([string]$gmail.provenanceModel.granularity -ne 'client-record') { throw 'Gmail provenance must remain client-record scoped.' }
Assert-False -Value $gmail.provenanceModel.itemLevelOneToOneLocatorMapping -Label 'Gmail provenance itemLevelOneToOneLocatorMapping'

$supplementSpecs = @(
    [pscustomobject]@{
        ClientId = $expectedAffiliatedClient
        DisplayName = 'Bridge Software'
        Label = 'Bridge'
        Path = $GmailSupplementArtifactPath
        Artifact = $gmailSupplement
    },
    [pscustomobject]@{
        ClientId = $expectedOnsiteClient
        DisplayName = 'Onsite Concrete & Landscape'
        Label = 'Onsite'
        Path = $GmailOnsiteSupplementArtifactPath
        Artifact = $gmailOnsiteSupplement
    }
)
foreach ($spec in $supplementSpecs) {
    Assert-GmailSupplementArtifact -Artifact $spec.Artifact -ExpectedClientId ([string]$spec.ClientId) -ExpectedDisplayName ([string]$spec.DisplayName) -Label ([string]$spec.Label)
    $registryMatch = @($registryClients | Where-Object { [string]$_.id -eq [string]$spec.ClientId })
    if ($registryMatch.Count -ne 1 -or [string]$registryMatch[0].status -ne 'active' -or [string]$registryMatch[0].displayName -cne [string]$spec.DisplayName) {
        throw "$($spec.Label) Gmail supplement has no exact active registry route."
    }
}

if ([string]$slack.artifactType -ne 'slack-client-history-audit') { throw 'Unexpected Slack artifact type.' }
if ([int]$slack.schemaVersion -ne 1 -or [string]$slack.status -ne 'complete') { throw 'Slack audit is not a completed v1 artifact.' }
Assert-True -Value $slack.privacy.redacted -Label 'Slack privacy.redacted'
Assert-False -Value $slack.privacy.containsSecrets -Label 'Slack privacy.containsSecrets'
Assert-False -Value $slack.privacy.containsRawCommunications -Label 'Slack privacy.containsRawCommunications'
Assert-False -Value $slack.privacy.containsDirectIdentifiers -Label 'Slack privacy.containsDirectIdentifiers'
Assert-True -Value $slack.privacy.storesOpaqueSlackLocatorsOnly -Label 'Slack privacy.storesOpaqueSlackLocatorsOnly'
Assert-True -Value $slack.coverage.workspaceIdentityVerified -Label 'Slack workspace identity'
Assert-True -Value $slack.coverage.authedUserIdentityVerified -Label 'Slack authenticated user identity'
Assert-True -Value $slack.coverage.conversationInventoryEstablished -Label 'Slack conversation inventory'
Assert-True -Value $slack.coverage.inventoryCursorExhausted -Label 'Slack inventory cursor exhaustion'
Assert-True -Value $slack.coverage.allRelevantCursorsExhausted -Label 'Slack relevant cursor exhaustion'
Assert-True -Value $slack.coverage.authoritativeWithinVisibleDillonAuthoredScope -Label 'Slack visible-scope authority'
Assert-False -Value $slack.coverage.authoritativeWorkspaceWideConclusionsPossible -Label 'Slack authoritative conclusions'
Assert-False -Value $slack.auditPolicy.writesAllowed -Label 'Slack writesAllowed'
if ($null -ne $slack.blocker) { throw 'Completed Slack audit unexpectedly contains a blocker.' }
$expectedConversationTypes = @('public_channel', 'private_channel', 'im', 'mpim') | Sort-Object
$actualConversationTypes = @($slack.coverage.intendedConversationTypes) | Sort-Object
if (($actualConversationTypes -join '|') -cne ($expectedConversationTypes -join '|')) { throw 'Slack conversation-type coverage is incomplete.' }
if (
    [int]$slack.coverage.visibleConversationsTotal -ne 106 -or
    [int]$slack.coverage.canonicalEvidenceConversations -ne 29 -or
    [int]$slack.coverage.dillonAuthoredMessagesReviewed -ne 1232 -or
    [int]$slack.coverage.importantThreadsRead -ne 5 -or
    [int]$slack.coverage.threadRepliesRead -ne 18
) {
    throw 'Slack completed coverage counts changed unexpectedly.'
}
$expectedConnectorResults = @(
    'workspace|success',
    'public_channel|success',
    'private_channel|success',
    'im|success',
    'mpim|success',
    'files:write|success'
)
$actualConnectorResults = foreach ($connectorCheck in @($slack.connectorChecks)) {
    if ([string]$connectorCheck.operation -eq 'slack_list_workspaces') { 'workspace|' + [string]$connectorCheck.result }
    elseif ([string]$connectorCheck.operation -eq 'slack_list_user_conversations') { [string]$connectorCheck.conversationType + '|' + [string]$connectorCheck.result }
    elseif ([string]$connectorCheck.operation -eq 'slack_files_write_probe') {
        Assert-False -Value $connectorCheck.fileUploadedOrShared -Label 'Slack capability probe fileUploadedOrShared'
        [string]$connectorCheck.capability + '|' + [string]$connectorCheck.result
    }
}
if ((@($actualConnectorResults | Sort-Object) -join '|') -cne (@($expectedConnectorResults | Sort-Object) -join '|')) {
    throw 'Slack connector capability results changed unexpectedly.'
}

$gmailById = @{}
$gmailArtifactById = @{}
foreach ($client in @($gmail.clients)) {
    $id = [string]$client.clientId
    if ($gmailById.ContainsKey($id)) { throw "Duplicate Gmail client record: $id" }
    $gmailById[$id] = $client
    $gmailArtifactById[$id] = $gmail
}
if ($gmailById.Count -ne 18 -or @($expectedSupplementClients | Where-Object { $gmailById.ContainsKey([string]$_) }).Count -ne 0) {
    throw 'Primary Gmail audit must remain the original 18-record snapshot without later exact-route supplements.'
}
foreach ($registryClient in @($registryClients | Where-Object { [string]$_.id -notin $expectedSupplementClients })) {
    if (-not $gmailById.ContainsKey([string]$registryClient.id)) {
        throw "Primary Gmail artifact is missing historical registry client: $($registryClient.id)"
    }
}
foreach ($spec in $supplementSpecs) {
    $clientId = [string]$spec.ClientId
    if ($gmailById.ContainsKey($clientId)) { throw "Duplicate supplemented Gmail client record: $clientId" }
    $gmailById[$clientId] = $spec.Artifact.client
    $gmailArtifactById[$clientId] = $spec.Artifact
}
if ($gmailById.Count -ne $registryClients.Count) { throw 'Combined Gmail artifacts do not cover every canonical client exactly.' }
$reviveGmail = $gmailById[$expectedQuarantinedClient]
if ([string]$reviveGmail.knowledgeDisposition -ne 'quarantined-not-current-client') {
    throw 'Revive Systems is not quarantined in the Gmail artifact.'
}

foreach ($clientId in $expectedIndependentClients) {
    $client = @($registryClients | Where-Object { [string]$_.id -eq $clientId })[0]
    $constraints = @(Get-OptionalProperty -InputObject $client -Name 'affiliationConstraints' -Default @())
    if ($constraints.Count -ne 1) { throw "$clientId must have exactly one affiliation constraint." }
    $constraint = $constraints[0]
    if (
        [string]$constraint.relation -ne 'not-client-of' -or
        [string]$constraint.organizationId -ne 'momentum-360' -or
        [string]$constraint.portfolioOwner -ne 'unknown' -or
        [string]$constraint.observedAt -ne '2026-07-16' -or
        [string]$constraint.sourceLocator -ne 'user-correction://2026-07-16/client-portfolio-affiliation' -or
        [double]$constraint.confidence -ne 1.0
    ) {
        throw "$clientId has an invalid affiliation constraint."
    }
}

$bridgeRegistry = @($registryClients | Where-Object { [string]$_.id -eq $expectedAffiliatedClient })[0]
$bridgeConstraints = @(Get-OptionalProperty -InputObject $bridgeRegistry -Name 'affiliationConstraints' -Default @())
if ($bridgeConstraints.Count -ne 1) { throw 'Bridge must have exactly one verified affiliation constraint.' }
$bridgeConstraint = $bridgeConstraints[0]
if (
    [string]$bridgeConstraint.relation -ne 'client-of' -or
    [string]$bridgeConstraint.organizationId -ne 'momentum-360' -or
    [string]$bridgeConstraint.portfolioOwner -ne 'momentum-360' -or
    [string]$bridgeConstraint.observedAt -ne '2026-07-16' -or
    [double]$bridgeConstraint.confidence -lt 0.98
) {
    throw 'Bridge has an invalid parent-portfolio affiliation constraint.'
}
Assert-False -Value $bridgeRegistry.intakeRouting.allowLegacyLabelOnly -Label 'Bridge intakeRouting.allowLegacyLabelOnly'
Assert-True -Value $bridgeRegistry.intakeRouting.requireExactSourceIdentity -Label 'Bridge intakeRouting.requireExactSourceIdentity'

$slackById = @{}
$activeSlackEvidenceIds = New-Object 'System.Collections.Generic.List[string]'
$activeSlackNoEvidenceIds = New-Object 'System.Collections.Generic.List[string]'
$inactiveSlackHistoricalEvidenceCount = 0
$quarantinedSlackClientCount = 0
foreach ($slackClient in @($slack.clients)) {
    $id = [string]$slackClient.clientId
    if ($slackById.ContainsKey($id)) { throw "Duplicate Slack client record: $id" }
    $registryClient = @($registryClients | Where-Object { [string]$_.id -eq $id })
    if ($registryClient.Count -ne 1) { throw "Slack artifact contains an unknown client route: $id" }
    $registryClient = $registryClient[0]
    if ([string]$slackClient.displayName -cne [string]$registryClient.displayName -or [string]$slackClient.registryStatus -ne [string]$registryClient.status) {
        throw "Slack identity or registry status differs for $id"
    }

    $status = [string]$slackClient.slackAuditStatus
    $hasEvidence = $status -like 'complete-live-evidence*'
    if ([string]$registryClient.status -eq 'active') {
        if ([string]$slackClient.promotionEligibility -ne 'active') { throw "Active Slack row is not promotion-eligible: $id" }
        if ($hasEvidence) {
            if (
                [int]$slackClient.coverage.messageCount -lt 1 -or
                @($slackClient.matchedConversations).Count -lt 1 -or
                [double]$slackClient.confidence.score -le 0 -or
                [string]::IsNullOrWhiteSpace([string]$slackClient.lastKnownStatusFromSlack)
            ) { throw "Slack evidence row is incomplete: $id" }
            $null = $activeSlackEvidenceIds.Add($id)
        } elseif ($status -eq 'no-promotable-dillon-authored-evidence') {
            if (
                [int]$slackClient.coverage.messageCount -ne 0 -or
                @($slackClient.matchedConversations).Count -ne 0 -or
                [double]$slackClient.confidence.score -ne 0 -or
                -not [string]::IsNullOrWhiteSpace([string]$slackClient.lastKnownStatusFromSlack)
            ) { throw "Slack zero-match row contains promoted evidence: $id" }
            $null = $activeSlackNoEvidenceIds.Add($id)
        } else {
            throw "Unsupported active Slack audit status for $id"
        }
    } elseif ($id -eq $expectedInactiveClient) {
        if (
            [string]$slackClient.promotionEligibility -ne 'historical-only-excluded-from-promotion' -or
            $status -ne 'complete-historical-evidence-not-for-active-promotion' -or
            [int]$slackClient.coverage.messageCount -lt 1
        ) { throw 'Zen Slack history is not preserved as historical-only.' }
        $inactiveSlackHistoricalEvidenceCount++
    } elseif ($id -eq $expectedQuarantinedClient) {
        if (
            [string]$slackClient.promotionEligibility -ne 'quarantined' -or
            $status -ne 'quarantined-before-message-read' -or
            [int]$slackClient.coverage.messageCount -ne 0
        ) { throw 'Revive Slack evidence is not quarantined before message promotion.' }
        $quarantinedSlackClientCount++
    } else {
        throw "Unexpected non-active Slack route: $id"
    }
    $slackById[$id] = $slackClient
}
if ($slackById.Count -ne $registryClients.Count) { throw 'Slack and registry client row sets differ.' }
foreach ($registryClient in $registryClients) {
    if (-not $slackById.ContainsKey([string]$registryClient.id)) { throw "Slack artifact is missing registry client: $($registryClient.id)" }
}
if (($activeSlackEvidenceIds.Count + $activeSlackNoEvidenceIds.Count) -ne $activeClients.Count) {
    throw 'Slack active evidence and no-match rows do not partition the active registry exactly.'
}
if (
    [int]$slack.summary.canonicalClientRecords -ne $registryClients.Count -or
    [int]$slack.summary.activeClientRecords -ne $activeClients.Count -or
    [int]$slack.summary.inactiveClientRecords -ne $inactiveClients.Count -or
    [int]$slack.summary.needsConfirmationClientRecords -ne $needsConfirmationClients.Count -or
    [int]$slack.summary.clientsWithLiveSlackEvidence -ne ($activeSlackEvidenceIds.Count + $inactiveSlackHistoricalEvidenceCount) -or
    [int]$slack.summary.activeClientsWithLiveSlackEvidence -ne $activeSlackEvidenceIds.Count -or
    [int]$slack.summary.inactiveHistoricalClientsWithEvidence -ne $inactiveSlackHistoricalEvidenceCount -or
    [int]$slack.summary.activeClientsWithoutPromotableSlackEvidence -ne $activeSlackNoEvidenceIds.Count -or
    [int]$slack.summary.quarantinedClients -ne $quarantinedSlackClientCount -or
    [int]$slack.summary.dillonAuthoredMessagesReviewed -ne [int]$slack.coverage.dillonAuthoredMessagesReviewed
) {
    throw 'Slack summary is inconsistent with the validated row set.'
}
$slackPriorityMap = @{}
foreach ($priority in @($slack.portfolioPriorities)) { $slackPriorityMap[[string]$priority.clientId] = $priority }
if (
    $slackPriorityMap.Count -ne 3 -or
    [int]$slackPriorityMap[$expectedAffiliatedClient].priorityRank -ne 1 -or
    [string]$slackPriorityMap[$expectedAffiliatedClient].route -ne 'resolved-active' -or
    [int]$slackPriorityMap['va-claims-edge'].priorityRank -ne 2 -or
    [string]$slackPriorityMap['va-claims-edge'].route -ne 'resolved-active' -or
    [string]$slackPriorityMap[$expectedInactiveClient].route -ne 'inactive-historical-only'
) {
    throw 'Slack portfolio-priority routing does not match the explicit owner correction.'
}

$gmailHash = Get-Sha256Hex -Path $GmailArtifactPath
$slackHash = Get-Sha256Hex -Path $SlackArtifactPath
$gmailRelative = Get-ProjectRelativePath -Path $GmailArtifactPath
$slackRelative = Get-ProjectRelativePath -Path $SlackArtifactPath
$supplementHashById = @{}
$supplementRelativeById = @{}
foreach ($spec in $supplementSpecs) {
    $clientId = [string]$spec.ClientId
    $supplementHashById[$clientId] = Get-Sha256Hex -Path ([string]$spec.Path)
    $supplementRelativeById[$clientId] = Get-ProjectRelativePath -Path ([string]$spec.Path)
}
$gmailHashById = @{}
$gmailRelativeById = @{}
foreach ($registryClient in $registryClients) {
    $id = [string]$registryClient.id
    if ($supplementHashById.ContainsKey($id)) {
        $gmailHashById[$id] = [string]$supplementHashById[$id]
        $gmailRelativeById[$id] = [string]$supplementRelativeById[$id]
    } else {
        $gmailHashById[$id] = $gmailHash
        $gmailRelativeById[$id] = $gmailRelative
    }
}

$zenContextPath = Resolve-ProjectPath -Path (Join-Path ([string]$inactiveClients[0].folder) 'context\operating-context.md') -DefaultRelativePath ([string]$inactiveClients[0].folder)
$reviveContextPath = Resolve-ProjectPath -Path (Join-Path ([string]$needsConfirmationClients[0].folder) 'context\operating-context.md') -DefaultRelativePath ([string]$needsConfirmationClients[0].folder)
$excludedContextBefore = Assert-ExcludedClientContextState -ZenContextPath $zenContextPath -ReviveContextPath $reviveContextPath
$zenContextHashBefore = [string]$excludedContextBefore.ZenSha256
$reviveContextExistedBefore = [bool]$excludedContextBefore.ReviveExists
$reviveContextHashBefore = $excludedContextBefore.ReviveSha256

$changed = New-Object 'System.Collections.Generic.List[string]'
$unchanged = New-Object 'System.Collections.Generic.List[string]'
$drift = New-Object 'System.Collections.Generic.List[string]'
$wouldChange = New-Object 'System.Collections.Generic.List[string]'

foreach ($registryClient in $activeClients) {
    $clientId = [string]$registryClient.id
    $gmailClient = $gmailById[$clientId]
    $gmailArtifactForClient = $gmailArtifactById[$clientId]
    $slackClient = $slackById[$clientId]
    if ([string]$gmailClient.registryStatus -ne 'active' -or [string]$gmailClient.knowledgeDisposition -ne 'current-client-eligible') {
        throw "Active client is not eligible for promotion: $clientId"
    }
    if ([string]$slackClient.registryStatus -ne 'active' -or [string]$slackClient.promotionEligibility -ne 'active') {
        throw "Active client is not Slack-promotion eligible: $clientId"
    }

    $targetPath = Resolve-ProjectPath -Path (Join-Path ([string]$registryClient.folder) 'context\operating-context.md') -DefaultRelativePath ([string]$registryClient.folder)
    if ($targetPath -match '(?i)\\(?:revive-systems|zen-spa-tropicana)\\') { throw 'Inactive or quarantined clients must never be promotion targets.' }
    $state = Get-ManagedFileState -Path $targetPath
    $expectedOriginalSha256 = $state.Sha256
    $gmailLocator = [string]$gmailRelativeById[$clientId] + '#client=' + $clientId
    $slackLocator = $slackRelative + '#client=' + $clientId
    $expectedBlock = New-ManagedBlock -RegistryClient $registryClient -GmailClient $gmailClient -SlackClient $slackClient -GmailArtifact $gmailArtifactForClient -SlackArtifact $slack -RegistryClients $registryClients -GmailLocator $gmailLocator -SlackLocator $slackLocator -GmailHash ([string]$gmailHashById[$clientId]) -SlackHash $slackHash -NewLine $state.NewLine
    $relativeTarget = Get-ProjectRelativePath -Path $targetPath

    if ($state.HasManagedBlock -and $state.ManagedBlock -ceq $expectedBlock) {
        $null = $unchanged.Add($relativeTarget)
        continue
    }

    if ($Check) {
        $null = $drift.Add($relativeTarget)
        continue
    }

    $newText = $null
    if (-not $state.Exists) {
        $newText = '# ' + [string]$registryClient.displayName + ' operating context' + $state.NewLine + $state.NewLine + $expectedBlock + $state.NewLine
    } elseif (-not $state.HasManagedBlock) {
        $separator = $state.NewLine + $state.NewLine
        if ($state.Text.EndsWith($state.NewLine + $state.NewLine, [StringComparison]::Ordinal)) {
            $separator = ''
        } elseif ($state.Text.EndsWith($state.NewLine, [StringComparison]::Ordinal)) {
            $separator = $state.NewLine
        }
        $newText = $state.Text + $separator + $expectedBlock + $state.NewLine
    } else {
        $newText = $state.Prefix + $expectedBlock + $state.Suffix
    }

    if (-not $PSCmdlet.ShouldProcess($targetPath, 'Create or replace the redacted client-history managed block')) {
        $null = $wouldChange.Add($relativeTarget)
        continue
    }

    $originalText = $state.Text
    $writeReceipt = Start-Utf8AtomicWrite -Path $targetPath -Text $newText -DestinationExists ([bool]$state.Exists) -ExpectedOriginalSha256 $expectedOriginalSha256
    try {
        $after = Get-ManagedFileState -Path $targetPath
        if (-not $after.HasManagedBlock -or $after.ManagedBlock -cne $expectedBlock) {
            throw "Post-write managed-block verification failed: $relativeTarget"
        }
        if ($after.Text -cne $newText) {
            throw "Post-write whole-file verification failed: $relativeTarget"
        }
        if ($state.Exists -and $state.HasManagedBlock) {
            if ($after.Prefix -cne $state.Prefix -or $after.Suffix -cne $state.Suffix) {
                throw "Bytes outside the managed block changed: $relativeTarget"
            }
        } elseif ($state.Exists -and -not $after.Text.StartsWith($originalText, [StringComparison]::Ordinal)) {
            throw "Existing content was not preserved while appending: $relativeTarget"
        }
    } catch {
        $verificationFailure = $_
        try {
            Undo-Utf8AtomicWrite -Receipt $writeReceipt
        } catch {
            throw "Post-write verification error: $($verificationFailure.Exception.Message) Rollback error: $($_.Exception.Message)"
        }
        throw $verificationFailure
    }
    Complete-Utf8AtomicWrite -Receipt $writeReceipt
    $null = $changed.Add($relativeTarget)
}

$excludedContextAfter = Assert-ExcludedClientContextState -ZenContextPath $zenContextPath -ReviveContextPath $reviveContextPath
$zenContextHashAfter = [string]$excludedContextAfter.ZenSha256
if ($zenContextHashAfter -cne $zenContextHashBefore) { throw 'Zen historical context changed during active-client promotion.' }
if ([bool]$excludedContextAfter.ReviveExists -ne $reviveContextExistedBefore) { throw 'Revive Systems context-file existence changed during active-client promotion.' }
if ($reviveContextExistedBefore -and [string]$excludedContextAfter.ReviveSha256 -cne [string]$reviveContextHashBefore) {
    throw 'Revive Systems context changed during active-client promotion.'
}

$mode = 'apply'
if ($Check) { $mode = 'check' }
elseif ($WhatIfPreference) { $mode = 'what-if' }

$status = 'current'
if ($Check -and $drift.Count -gt 0) { $status = 'drift' }
elseif ($changed.Count -gt 0) { $status = 'updated' }
elseif ($wouldChange.Count -gt 0) { $status = 'would-update' }

$result = [ordered]@{
    status = $status
    mode = $mode
    activeClients = $activeClients.Count
    promotedClientIds = @($activeClients | ForEach-Object { [string]$_.id })
    historicalOnlyClients = @($expectedInactiveClient)
    quarantinedClients = @($expectedQuarantinedClient)
    excludedFromActivePromotion = @($expectedInactiveClient, $expectedQuarantinedClient)
    zenHistoricalContextSha256 = $zenContextHashAfter
    slackCoverage = [ordered]@{
        activeClientsWithEvidence = $activeSlackEvidenceIds.Count
        activeClientsWithoutPromotableEvidence = $activeSlackNoEvidenceIds.Count
        activeEvidenceClientIds = @($activeSlackEvidenceIds)
        activeNoEvidenceClientIds = @($activeSlackNoEvidenceIds)
        dillonAuthoredMessagesReviewed = [int]$slack.coverage.dillonAuthoredMessagesReviewed
        visibleConversations = [int]$slack.coverage.visibleConversationsTotal
    }
    changed = @($changed)
    wouldChange = @($wouldChange)
    unchanged = @($unchanged)
    drift = @($drift)
    inputs = [ordered]@{
        gmailPrimary = $gmailRelative
        gmailPrimarySha256 = $gmailHash
        gmailSupplements = @($supplementSpecs | ForEach-Object {
            [ordered]@{
                clientId = [string]$_.ClientId
                path = [string]$supplementRelativeById[[string]$_.ClientId]
                sha256 = [string]$supplementHashById[[string]$_.ClientId]
            }
        })
        gmailBridgeSupplement = [string]$supplementRelativeById[$expectedAffiliatedClient]
        gmailBridgeSupplementSha256 = [string]$supplementHashById[$expectedAffiliatedClient]
        gmailOnsiteSupplement = [string]$supplementRelativeById[$expectedOnsiteClient]
        gmailOnsiteSupplementSha256 = [string]$supplementHashById[$expectedOnsiteClient]
        slack = $slackRelative
        slackSha256 = $slackHash
    }
    privacy = [ordered]@{
        redacted = $true
        rawCommunicationsPromoted = $false
        directContactDetailsPromoted = $false
        itemLevelLocatorClaimsPromoted = $false
        slackFactsPromoted = $true
        inactiveSlackFactsPromoted = $false
        quarantinedSlackFactsPromoted = $false
    }
    canonicalQueueTouched = $false
    externalActionAttempted = $false
}
$result | ConvertTo-Json -Depth 8

if ($Check -and $drift.Count -gt 0) { exit 2 }
