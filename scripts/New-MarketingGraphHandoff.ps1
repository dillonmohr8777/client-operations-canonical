[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$GraphPath,
    [Parameter(Mandatory = $true)]
    [ValidateRange(1, 2147483647)]
    [int]$ExpectedGraphRevision,
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-z][a-z0-9-]{1,79}$')]
    [string]$WorkerRole,
    [Parameter(Mandatory = $true)]
    [ValidateSet('completed', 'partially_completed', 'blocked', 'failed')]
    [string]$Status,
    [Parameter(Mandatory = $true)]
    [ValidateSet('in_progress', 'verification', 'needs_approval', 'executed', 'observed', 'done', 'blocked', 'deferred', 'cancelled')]
    [string]$ProposedTransition,
    [Parameter(Mandatory = $true)]
    [string]$Summary,
    [string[]]$Artifacts = @(),
    [string[]]$Evidence = @(),
    [string[]]$Verification = @(),
    [string[]]$Assumptions = @(),
    [string[]]$Risks = @(),
    [string]$HandoffId,
    [string]$OutputPath,
    [string]$ProjectRoot,
    [string]$QueuePath,
    [string]$RegistryPath,
    [string]$WorkflowPath
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'MarketingOs.Common.ps1')

if ([string]::IsNullOrWhiteSpace($ProjectRoot)) { $ProjectRoot = Join-Path $PSScriptRoot '..' }
$ProjectRoot = [IO.Path]::GetFullPath($ProjectRoot).TrimEnd('\')
if ([string]::IsNullOrWhiteSpace($QueuePath)) { $QueuePath = Join-Path $ProjectRoot 'queue\work-items.json' }
if ([string]::IsNullOrWhiteSpace($RegistryPath)) { $RegistryPath = Join-Path $ProjectRoot 'registry\clients.json' }
if ([string]::IsNullOrWhiteSpace($WorkflowPath)) { $WorkflowPath = Join-Path $ProjectRoot 'workflows\marketing-chief-execution-graph.workflow.json' }
$GraphPath = [IO.Path]::GetFullPath($GraphPath)
$QueuePath = [IO.Path]::GetFullPath($QueuePath)
$RegistryPath = [IO.Path]::GetFullPath($RegistryPath)
$WorkflowPath = [IO.Path]::GetFullPath($WorkflowPath)
$projectPrefix = $ProjectRoot + '\'
if (-not $GraphPath.StartsWith($projectPrefix, [StringComparison]::OrdinalIgnoreCase)) { throw 'Execution graph path must stay inside the project.' }

function Get-RelativeProjectLocator {
    param([string]$Path)
    $full = [IO.Path]::GetFullPath($Path)
    if (-not $full.StartsWith($projectPrefix, [StringComparison]::OrdinalIgnoreCase)) { throw 'Path escapes the project.' }
    return $full.Substring($projectPrefix.Length).Replace('\', '/')
}

function Get-CleanArray {
    param([AllowNull()][string[]]$Values, [string]$Name, [int]$Limit, [switch]$Locators)
    $items = @($Values | Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) } | ForEach-Object { ([string]$_).Trim() } | Select-Object -Unique)
    if ($items.Count -gt $Limit) { throw "$Name exceeds the $Limit item limit." }
    foreach ($item in $items) {
        if ($item.Length -gt 1000) { throw "$Name contains an overlong entry." }
        if ($Locators) {
            if (-not (Test-MarketingSafeLocator $item)) { throw "$Name contains an unsafe locator." }
        }
        elseif (-not (Test-MarketingSafeText $item)) { throw "$Name contains unsafe text." }
    }
    return [string[]]$items
}

if ([string]::IsNullOrWhiteSpace($Summary) -or $Summary.Length -gt 4000 -or -not (Test-MarketingSafeText $Summary)) { throw 'Handoff summary is missing, unsafe, or overlong.' }

$graphValidator = Join-Path $PSScriptRoot 'Test-MarketingExecutionGraph.ps1'
$graphValidationOutput = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $graphValidator -GraphPath $GraphPath -ProjectRoot $ProjectRoot -QueuePath $QueuePath -RegistryPath $RegistryPath -WorkflowPath $WorkflowPath -Format Json
$graphValidationExit = $LASTEXITCODE
try { $graphValidation = ($graphValidationOutput -join [Environment]::NewLine) | ConvertFrom-Json } catch { throw 'Execution graph validator did not return valid JSON.' }
if ($graphValidationExit -ne 0 -or [string]$graphValidation.status -ne 'valid') { throw ('Handoff rejected by execution graph validation: ' + (@($graphValidation.problems) -join '; ')) }

$graphRaw = [IO.File]::ReadAllText($GraphPath, [Text.UTF8Encoding]::new($false))
if ((Get-MarketingTextSha256 $graphRaw) -ne [string]$graphValidation.contentSha256) { throw 'Execution graph changed after validation.' }
$graph = $graphRaw | ConvertFrom-Json
if ([int]$graph.graphRevision -ne $ExpectedGraphRevision) { throw "Stale graph revision. Expected $ExpectedGraphRevision; current is $($graph.graphRevision)." }
if ([string]$graph.status -in @('completed', 'stale')) { throw "Execution graph status $($graph.status) cannot produce a handoff." }

$workerNode = @($graph.nodes | Where-Object { [string]$_.kind -eq 'worker_execution' })
$verifierNodes = @($graph.nodes | Where-Object { [string]$_.kind -eq 'verification' })
$handoffNode = @($graph.nodes | Where-Object { [string]$_.kind -eq 'handoff_assembly' })
if ($workerNode.Count -ne 1 -or $handoffNode.Count -ne 1) { throw 'Execution graph worker or handoff node is not unique.' }
if ($Status -eq 'completed') {
    if ([string]$workerNode[0].status -ne 'completed') { throw 'Completed handoff requires a completed worker node.' }
    if (@($verifierNodes | Where-Object { [string]$_.status -ne 'completed' }).Count -gt 0) { throw 'Completed handoff requires every definition-of-done verifier to pass.' }
    if ([string]$handoffNode[0].status -ne 'ready') { throw 'Completed handoff requires the handoff assembly node to be ready.' }
}

$artifactList = @(Get-CleanArray -Values $Artifacts -Name 'artifacts' -Limit 10 -Locators)
$evidenceList = @(Get-CleanArray -Values $Evidence -Name 'evidence' -Limit 8 -Locators)
$verificationList = @(Get-CleanArray -Values $Verification -Name 'verification' -Limit 10)
$assumptionList = @(Get-CleanArray -Values $Assumptions -Name 'assumptions' -Limit 5)
$riskList = @(Get-CleanArray -Values $Risks -Name 'risks' -Limit 5)
if ($Status -eq 'completed' -and $verificationList.Count -eq 0) { throw 'Completed handoff requires verification evidence.' }

$clientRootLocator = [string]$graph.scope.clientRoot
foreach ($artifact in $artifactList) {
    if (-not $artifact.StartsWith(($clientRootLocator + '/'), [StringComparison]::OrdinalIgnoreCase)) { throw 'Handoff artifact escapes the exact client folder.' }
    $candidate = [IO.Path]::GetFullPath((Join-Path $ProjectRoot ($artifact.Replace('/', '\'))))
    if (-not $candidate.StartsWith(([IO.Path]::GetFullPath((Join-Path $ProjectRoot ($clientRootLocator.Replace('/', '\')))).TrimEnd('\') + '\'), [StringComparison]::OrdinalIgnoreCase)) { throw 'Handoff artifact escapes the exact client folder.' }
    if ($Status -eq 'completed' -and -not (Test-Path -LiteralPath $candidate -PathType Leaf)) { throw 'Completed handoff references a missing artifact.' }
}

$graphLocator = Get-RelativeProjectLocator -Path $GraphPath
$evidenceList = [string[]](@($evidenceList) + @($graphLocator, ('sha256:' + [string]$graphValidation.contentSha256)) | Select-Object -Unique)
if ($evidenceList.Count -gt 10) { throw 'Graph evidence causes the handoff evidence limit to be exceeded.' }

if ([string]::IsNullOrWhiteSpace($HandoffId)) { $HandoffId = 'handoff-' + [guid]::NewGuid().ToString('N') }
if ($HandoffId -notmatch '^[A-Za-z0-9][A-Za-z0-9_-]{7,159}$') { throw 'HandoffId must be a path-safe slug of 8 to 160 characters.' }
if ([string]::IsNullOrWhiteSpace($OutputPath)) { $OutputPath = Join-Path $ProjectRoot ("state\worker-handoffs\{0}.json" -f $HandoffId) }
$OutputPath = [IO.Path]::GetFullPath($OutputPath)
if (-not $OutputPath.StartsWith($projectPrefix, [StringComparison]::OrdinalIgnoreCase)) { throw 'Handoff output path must stay inside the project.' }
if (Test-Path -LiteralPath $OutputPath) { throw 'Handoff output already exists.' }
$outputDirectory = Split-Path -Parent $OutputPath
[IO.Directory]::CreateDirectory($outputDirectory) | Out-Null

$now = [DateTimeOffset]::UtcNow.ToString('o')
$approvalGate = [string]$graph.handoffContract.approvalGate
$handoff = [pscustomobject][ordered]@{
    schemaVersion = 1
    handoffId = $HandoffId
    workItemId = [string]$graph.workItem.id
    expectedWorkItemVersion = [int]$graph.workItem.expectedVersion
    clientId = [string]$graph.workItem.clientId
    workerRole = $WorkerRole
    status = $Status
    startedAt = [string]$graph.createdAt
    finishedAt = $now
    summary = $Summary.Trim()
    artifacts = @($artifactList)
    evidence = @($evidenceList)
    verification = @($verificationList)
    assumptions = @($assumptionList)
    risks = @($riskList)
    privacy = 'redacted'
    containsSecrets = $false
    containsDirectIdentifiers = $false
    containsRawCommunications = $false
    approvalGate = $approvalGate
    proposedTransition = $ProposedTransition
    canonicalWriteAttempted = $false
    externalActionAttempted = $false
}

$handoffJson = ($handoff | ConvertTo-Json -Depth 20) + [Environment]::NewLine
if ([Text.UTF8Encoding]::new($false).GetByteCount($handoffJson) -gt 20480) { throw 'Handoff exceeds 20 KB.' }
$tempPath = Join-Path $outputDirectory ('.handoff.' + [guid]::NewGuid().ToString('N') + '.tmp.json')
$committed = $false
try {
    [IO.File]::WriteAllText($tempPath, $handoffJson, [Text.UTF8Encoding]::new($false))
    $handoffValidator = Join-Path $PSScriptRoot 'Test-MarketingHandoff.ps1'
    $validationOutput = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $handoffValidator -HandoffPath $tempPath -ProjectRoot $ProjectRoot -QueuePath $QueuePath -RegistryPath $RegistryPath -Format Json
    $validationExit = $LASTEXITCODE
    try { $validation = ($validationOutput -join [Environment]::NewLine) | ConvertFrom-Json } catch { throw 'Worker handoff validator did not return valid JSON.' }
    if ($validationExit -ne 0 -or [string]$validation.status -ne 'valid') { throw ('Worker handoff is invalid: ' + (@($validation.errors) -join '; ')) }
    Move-Item -LiteralPath $tempPath -Destination $OutputPath
    $committed = $true

    $handoffLocator = Get-RelativeProjectLocator -Path $OutputPath
    $handoffHash = Get-MarketingTextSha256 $handoffJson
    $graphUpdate = @{
        GraphPath = $GraphPath
        ExpectedGraphRevision = $ExpectedGraphRevision
        NodeId = [string]$handoffNode[0].id
        Status = 'completed'
        Actor = $WorkerRole
        Summary = 'Validated worker handoff assembled for Marketing Chief reconciliation.'
        Evidence = @($handoffLocator, ('sha256:' + $handoffHash))
        ProjectRoot = $ProjectRoot
        QueuePath = $QueuePath
        RegistryPath = $RegistryPath
        WorkflowPath = $WorkflowPath
    }
    $null = & (Join-Path $PSScriptRoot 'Update-MarketingExecutionGraph.ps1') @graphUpdate

    [pscustomobject][ordered]@{
        status = 'created'
        handoffId = $HandoffId
        handoffPath = $handoffLocator
        handoffSha256 = $handoffHash
        graphRunId = [string]$graph.graphRunId
        graphRevision = $ExpectedGraphRevision + 1
        graphStatus = 'handoff_ready'
        canonicalWriteAttempted = $false
        externalActionAttempted = $false
    } | ConvertTo-Json -Compress
}
catch {
    if ($committed -and (Test-Path -LiteralPath $OutputPath)) { Remove-Item -LiteralPath $OutputPath -Force }
    throw
}
finally {
    if (Test-Path -LiteralPath $tempPath) { Remove-Item -LiteralPath $tempPath -Force -ErrorAction SilentlyContinue }
}
