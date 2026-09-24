[CmdletBinding()]
param(
    [ValidateSet('Package', 'Live')]
    [string]$Mode = 'Package',
    [string]$ManifestPath = (Join-Path $PSScriptRoot 'deployment-package.json'),
    [string]$ResponsesPath = (Join-Path $PSScriptRoot 'live-responses.json')
)

$ErrorActionPreference = 'Stop'

foreach ($path in $ManifestPath, $ResponsesPath) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        throw "Required file not found: $path"
    }
}

$manifest = Get-Content -Raw -Encoding UTF8 -LiteralPath $ManifestPath |
    ConvertFrom-Json
$responses = Get-Content -Raw -Encoding UTF8 -LiteralPath $ResponsesPath |
    ConvertFrom-Json

$checks = [System.Collections.Generic.List[object]]::new()

function Add-ReadinessCheck {
    param(
        [string]$Name,
        [bool]$Passed,
        [string]$Detail
    )

    $checks.Add([pscustomobject]@{
        Name = $Name
        Passed = $Passed
        Detail = $Detail
    })
}

Add-ReadinessCheck -Name 'Manifest portal guard' `
    -Passed ([string]$manifest.portalId -eq '242825734') `
    -Detail 'Expected Align portal 242825734.'

Add-ReadinessCheck -Name 'Manifest agent guard' `
    -Passed ([string]$manifest.agent.name -eq 'Align HCM Customer Agent') `
    -Detail 'Expected the exact Align agent name.'

$knowledgeUrls = @($manifest.knowledge.urls)
Add-ReadinessCheck -Name 'Knowledge URL inventory' `
    -Passed ($knowledgeUrls.Count -eq 26) `
    -Detail "Expected 26 public URLs; found $($knowledgeUrls.Count)."

Add-ReadinessCheck -Name 'Knowledge URLs are unique and Align-only' `
    -Passed (
        @($knowledgeUrls | Sort-Object -Unique).Count -eq 26 -and
        @($knowledgeUrls | Where-Object {
            $_ -notmatch '^https://www\.alignhcm\.com/'
        }).Count -eq 0
    ) `
    -Detail 'Every source must be a unique www.alignhcm.com URL.'

Add-ReadinessCheck -Name 'Initial release is public-source only' `
    -Passed (
        $manifest.knowledge.publicOnly -eq $true -and
        $manifest.knowledge.privateSourcesEnabled -eq $false
    ) `
    -Detail 'Private sources must remain disabled.'

Add-ReadinessCheck -Name 'Package remains on deployment hold' `
    -Passed (
        $manifest.deployment.enabled -eq $false -and
        $manifest.deployment.approvalHold -eq $true -and
        $manifest.deployment.activationAuthorized -eq $false
    ) `
    -Detail 'Package mode must fail closed against accidental activation.'

$tests = @($responses.tests)
Add-ReadinessCheck -Name 'Acceptance response inventory' `
    -Passed (
        [string]$responses.portalId -eq '242825734' -and
        [string]$responses.agentName -eq 'Align HCM Customer Agent' -and
        $tests.Count -eq 26 -and
        @($tests.id | Sort-Object -Unique).Count -eq 26
    ) `
    -Detail 'Expected 26 unique Align test records.'

if ($Mode -eq 'Live') {
    $blankResponses = @($tests | Where-Object {
        [string]::IsNullOrWhiteSpace([string]$_.response)
    })
    $manualNotPassed = @($tests | Where-Object {
        [string]$_.manualReview -ne 'pass'
    })

    Add-ReadinessCheck -Name 'Live responses captured' `
        -Passed ($blankResponses.Count -eq 0) `
        -Detail "$($blankResponses.Count) responses remain blank."

    Add-ReadinessCheck -Name 'Manual source review complete' `
        -Passed ($manualNotPassed.Count -eq 0) `
        -Detail "$($manualNotPassed.Count) tests still require manual review."

    Add-ReadinessCheck -Name 'Live capture metadata complete' `
        -Passed (
            -not [string]::IsNullOrWhiteSpace([string]$responses.capturedAt) -and
            [string]$responses.channel -eq 'live-chat-test'
        ) `
        -Detail 'A dated Live Chat test capture is required.'

    foreach ($property in @(
        'creditsVerified',
        'trackingCodeVerified',
        'existingAgentStateVerified',
        'editorPermissionVerified',
        'assignedSeatVerified',
        'brandAssignmentVerified',
        'knowledgeSyncVerified',
        'handoffVerified',
        'liveTestsPassed'
    )) {
        Add-ReadinessCheck -Name "Live gate: $property" `
            -Passed ($manifest.deployment.$property -eq $true) `
            -Detail "deployment.$property must be true after authenticated verification."
    }

    Add-ReadinessCheck -Name 'Exact channel is recorded' `
        -Passed (
            -not [string]::IsNullOrWhiteSpace(
                [string]$manifest.deployment.targetChannelId
            ) -and
            -not [string]::IsNullOrWhiteSpace(
                [string]$manifest.deployment.targetChannelName
            ) -and
            $null -ne $manifest.deployment.workingHours -and
            $null -ne $manifest.deployment.conversationCoveragePercent
        ) `
        -Detail 'Channel ID, name, hours, and coverage must be captured.'
}

$failed = @($checks | Where-Object { -not $_.Passed })
$checks | Format-Table -AutoSize
Write-Output ''
Write-Output (
    "Deployment readiness ({0}): {1} passed, {2} failed" -f
        $Mode,
        ($checks.Count - $failed.Count),
        $failed.Count
)

if ($failed.Count -gt 0) {
    exit 1
}
