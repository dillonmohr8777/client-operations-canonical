[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$projectRoot = [IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot))
$promoterPath = Join-Path $projectRoot 'scripts\Promote-ClientHistoryContext.ps1'
$registryPath = Join-Path $projectRoot 'registry\clients.json'
$supplementPath = Join-Path $projectRoot 'state\client-history-research\gmail-bridge-software-history-2026-07-16.json'
$onsiteSupplementPath = Join-Path $projectRoot 'state\client-history-research\gmail-onsite-concrete-landscape-history-2026-07-16.json'
$beginMarker = '<!-- BEGIN CLIENT-HISTORY-PROMOTION:v1 -->'
$endMarker = '<!-- END CLIENT-HISTORY-PROMOTION:v1 -->'
$testRoot = Join-Path $PSScriptRoot ('.client-history-promotion-' + [guid]::NewGuid().ToString('N'))
$powerShellPath = (Get-Process -Id $PID).Path

function Get-ManagedBlock {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return $null }
    $text = [IO.File]::ReadAllText($Path)
    $start = $text.IndexOf($beginMarker, [StringComparison]::Ordinal)
    $endStart = $text.IndexOf($endMarker, [StringComparison]::Ordinal)
    if ($start -lt 0 -or $endStart -le $start) { return $null }
    return $text.Substring($start, ($endStart + $endMarker.Length) - $start)
}

function Invoke-PromoterChild {
    param([AllowEmptyCollection()][string[]]$Arguments = @())

    $priorErrorActionPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        $output = @(& $powerShellPath -NoProfile -NonInteractive -ExecutionPolicy Bypass -File $promoterPath @Arguments 2>&1 | ForEach-Object { [string]$_ })
        $exitCode = $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $priorErrorActionPreference
    }
    return [pscustomobject]@{
        ExitCode = $exitCode
        Output = ($output -join [Environment]::NewLine)
    }
}

function Assert-True {
    param(
        [Parameter(Mandatory = $true)][bool]$Condition,
        [Parameter(Mandatory = $true)][string]$Message
    )
    if (-not $Condition) { throw $Message }
}

try {
    [IO.Directory]::CreateDirectory($testRoot) | Out-Null

    $baseline = Invoke-PromoterChild -Arguments @('-Check')
    Assert-True -Condition ($baseline.ExitCode -eq 0) -Message ("Baseline promoter check failed: " + $baseline.Output)
    $baselineResult = $baseline.Output | ConvertFrom-Json
    Assert-True -Condition ([string]$baselineResult.status -eq 'current') -Message 'Baseline promoter check did not report current.'
    Assert-True -Condition ([int]$baselineResult.activeClients -eq 18) -Message 'Baseline promoter check did not validate 18 active clients.'

    $registry = Get-Content -LiteralPath $registryPath -Raw | ConvertFrom-Json
    Assert-True -Condition (@($registry.clients).Count -eq 20) -Message 'Registry does not contain the expected 20 clients.'
    Assert-True -Condition (@($registry.clients | Where-Object status -eq 'active').Count -eq 18) -Message 'Registry does not contain the expected 18 active clients.'
    Assert-True -Condition (@($registry.clients | Where-Object status -eq 'inactive').Count -eq 1) -Message 'Registry does not contain exactly one inactive client.'
    Assert-True -Condition (@($registry.clients | Where-Object status -eq 'needs-confirmation').Count -eq 1) -Message 'Registry does not contain exactly one needs-confirmation client.'
    $momentum = @($registry.clients | Where-Object { [string]$_.id -eq 'momentum-360' })[0]
    $momentumPath = Join-Path $projectRoot (Join-Path ([string]$momentum.folder) 'context\operating-context.md')
    $momentumBlock = Get-ManagedBlock -Path $momentumPath
    Assert-True -Condition (-not [string]::IsNullOrWhiteSpace($momentumBlock)) -Message 'Momentum managed block is missing.'
    foreach ($token in @('bridge-software', 'Bridge Software Development', 'Bridge Software', 'Bridge', 'The Ecosystem', 'Ecosystem')) {
        $pattern = '(?i)(?<![\p{L}\p{N}])' + [regex]::Escape($token) + '(?![\p{L}\p{N}])'
        Assert-True -Condition ($momentumBlock -notmatch $pattern) -Message "Momentum managed block contains Bridge routing token '$token'."
    }

    $zen = @($registry.clients | Where-Object { [string]$_.id -eq 'zen-spa-tropicana' })[0]
    $zenPath = Join-Path $projectRoot (Join-Path ([string]$zen.folder) 'context\operating-context.md')
    $zenBlock = Get-ManagedBlock -Path $zenPath
    Assert-True -Condition (-not [string]::IsNullOrWhiteSpace($zenBlock)) -Message 'Zen historical managed block is missing.'
    Assert-True -Condition ($zenBlock -match '(?im)^- Promotion schema: `client-history-context/v1`\s*$') -Message 'Zen is not frozen on the historical v1 schema.'
    Assert-True -Condition ($zenBlock -match '(?im)^- Registry status: `inactive`(?:\s|\().*$') -Message 'Zen does not declare inactive status.'
    Assert-True -Condition ($zenBlock -match '(?im)^- Slack: .*historical-only\.\s*$') -Message 'Zen does not preserve the historical-only Slack statement.'
    Assert-True -Condition ($zenBlock -notmatch '(?i)client-history-context/v2|complete-live-evidence') -Message 'Zen contains an active promotion marker.'

    $revive = @($registry.clients | Where-Object { [string]$_.id -eq 'revive-systems' })[0]
    $revivePath = Join-Path $projectRoot (Join-Path ([string]$revive.folder) 'context\operating-context.md')
    Assert-True -Condition ($null -eq (Get-ManagedBlock -Path $revivePath)) -Message 'Revive contains a client-history promotion block.'

    $onsite = @($registry.clients | Where-Object { [string]$_.id -eq 'onsite-concrete-landscape' })[0]
    $onsitePath = Join-Path $projectRoot (Join-Path ([string]$onsite.folder) 'context\operating-context.md')
    $onsiteBlock = Get-ManagedBlock -Path $onsitePath
    Assert-True -Condition (-not [string]::IsNullOrWhiteSpace($onsiteBlock)) -Message 'Onsite managed block is missing.'
    Assert-True -Condition ($onsiteBlock -match '(?im)^- Canonical client ID: `onsite-concrete-landscape`\s*$') -Message 'Onsite managed block is not routed to the exact client ID.'
    Assert-True -Condition ($onsiteBlock -match '(?i)8 reported contact actions') -Message 'Onsite managed block is missing the supplied paid-media evidence.'
    Assert-True -Condition ($onsiteBlock -match '(?i)5 Vacaville location or service pages and 3 blogs') -Message 'Onsite managed block is missing the supplied landing-page and content evidence.'
    Assert-True -Condition ($onsiteBlock -match '(?im)^- Slack: `no-promotable-dillon-authored-evidence`;') -Message 'Onsite managed block does not preserve the Slack no-evidence boundary.'
    Assert-True -Condition ($onsiteBlock -notmatch '(?i)onsiteclp@gmail\.com') -Message 'Onsite managed block contains a direct contact address.'

    $strictBooleanFixture = Join-Path $testRoot 'bridge-string-boolean.json'
    $strictBooleanJson = Get-Content -LiteralPath $supplementPath -Raw | ConvertFrom-Json
    $strictBooleanJson.privacy.containsSecrets = 'false'
    [IO.File]::WriteAllText($strictBooleanFixture, ($strictBooleanJson | ConvertTo-Json -Depth 100), (New-Object Text.UTF8Encoding($false)))
    $strictBooleanResult = Invoke-PromoterChild -Arguments @('-Check', '-GmailSupplementArtifactPath', $strictBooleanFixture)
    Assert-True -Condition ($strictBooleanResult.ExitCode -ne 0) -Message 'String-valued false was accepted as a Boolean gate.'
    Assert-True -Condition ($strictBooleanResult.Output -match 'Boolean value false') -Message 'String-valued false failed without the strict Boolean diagnostic.'

    $nullBooleanFixture = Join-Path $testRoot 'bridge-null-boolean.json'
    $nullBooleanJson = Get-Content -LiteralPath $supplementPath -Raw | ConvertFrom-Json
    $nullBooleanJson.privacy.redacted = $null
    [IO.File]::WriteAllText($nullBooleanFixture, ($nullBooleanJson | ConvertTo-Json -Depth 100), (New-Object Text.UTF8Encoding($false)))
    $nullBooleanResult = Invoke-PromoterChild -Arguments @('-Check', '-GmailSupplementArtifactPath', $nullBooleanFixture)
    Assert-True -Condition ($nullBooleanResult.ExitCode -ne 0) -Message 'Null was accepted as a Boolean gate.'
    Assert-True -Condition ($nullBooleanResult.Output -match 'Boolean value true') -Message 'Null Boolean failed without the strict Boolean diagnostic.'

    $missingProvenanceFixture = Join-Path $testRoot 'bridge-missing-provenance.json'
    $missingProvenanceJson = Get-Content -LiteralPath $supplementPath -Raw | ConvertFrom-Json
    $missingProvenanceJson.PSObject.Properties.Remove('provenanceModel')
    [IO.File]::WriteAllText($missingProvenanceFixture, ($missingProvenanceJson | ConvertTo-Json -Depth 100), (New-Object Text.UTF8Encoding($false)))
    $missingProvenanceResult = Invoke-PromoterChild -Arguments @('-Check', '-GmailSupplementArtifactPath', $missingProvenanceFixture)
    Assert-True -Condition ($missingProvenanceResult.ExitCode -ne 0) -Message 'Bridge supplement without provenance was accepted.'
    Assert-True -Condition ($missingProvenanceResult.Output -match 'provenance') -Message 'Missing Bridge provenance failed without a provenance diagnostic.'

    $writeEnabledFixture = Join-Path $testRoot 'bridge-write-enabled.json'
    $writeEnabledJson = Get-Content -LiteralPath $supplementPath -Raw | ConvertFrom-Json
    $writeEnabledJson.auditPolicy.writesAllowed = $true
    [IO.File]::WriteAllText($writeEnabledFixture, ($writeEnabledJson | ConvertTo-Json -Depth 100), (New-Object Text.UTF8Encoding($false)))
    $writeEnabledResult = Invoke-PromoterChild -Arguments @('-Check', '-GmailSupplementArtifactPath', $writeEnabledFixture)
    Assert-True -Condition ($writeEnabledResult.ExitCode -ne 0) -Message 'Write-enabled Bridge supplement was accepted.'
    Assert-True -Condition ($writeEnabledResult.Output -match 'writesAllowed') -Message 'Write-enabled Bridge supplement failed without a no-write diagnostic.'

    $onsiteRouteMismatchFixture = Join-Path $testRoot 'onsite-route-mismatch.json'
    $onsiteRouteMismatchJson = Get-Content -LiteralPath $onsiteSupplementPath -Raw | ConvertFrom-Json
    $onsiteRouteMismatchJson.client.clientId = 'bridge-software'
    [IO.File]::WriteAllText($onsiteRouteMismatchFixture, ($onsiteRouteMismatchJson | ConvertTo-Json -Depth 100), (New-Object Text.UTF8Encoding($false)))
    $onsiteRouteMismatchResult = Invoke-PromoterChild -Arguments @('-Check', '-GmailOnsiteSupplementArtifactPath', $onsiteRouteMismatchFixture)
    Assert-True -Condition ($onsiteRouteMismatchResult.ExitCode -ne 0) -Message 'Cross-client Onsite supplement route was accepted.'
    Assert-True -Condition ($onsiteRouteMismatchResult.Output -match 'active canonical route') -Message 'Cross-client Onsite route failed without an exact-route diagnostic.'

    $transientArtifacts = @(Get-ChildItem -LiteralPath (Join-Path $projectRoot 'clients') -Recurse -Force -File | Where-Object {
        $_.Name -match '(?i)(?:\.tmp(?:\.bak)?$|\.client-history\.lock$)'
    })
    $transientArtifactPaths = @($transientArtifacts | ForEach-Object { $_.FullName })
    Assert-True -Condition ($transientArtifacts.Count -eq 0) -Message ('Transient promoter artifacts remain: ' + ($transientArtifactPaths -join ', '))

    [ordered]@{
        status = 'PASS'
        baseline = 'current'
        canonicalClients = 20
        activeClients = 18
        momentumBridgeTokens = 0
        zenHistoricalShape = 'valid'
        revivePromotionBlock = $false
        strictBooleanGate = 'rejected-string-and-null'
        bridgeProvenanceGate = 'rejected-missing-model'
        bridgeNoWriteGate = 'rejected-write-enabled'
        onsiteExactRouteGate = 'rejected-cross-client-route'
        transientArtifacts = 0
    } | ConvertTo-Json -Depth 4
} finally {
    if (Test-Path -LiteralPath $testRoot) {
        $resolvedTestRoot = [IO.Path]::GetFullPath($testRoot)
        $resolvedTestsDirectory = [IO.Path]::GetFullPath($PSScriptRoot).TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
        if (-not $resolvedTestRoot.StartsWith($resolvedTestsDirectory, [StringComparison]::OrdinalIgnoreCase)) {
            throw "Refusing to remove test data outside the tests directory: $resolvedTestRoot"
        }
        Remove-Item -LiteralPath $resolvedTestRoot -Recurse -Force
    }
}
