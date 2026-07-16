[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Client,
    [Parameter(Mandatory = $true)][string]$DedupeKey,
    [Parameter(Mandatory = $true)][string]$Title,
    [Parameter(Mandatory = $true)][string]$RequestedOutcome,
    [Parameter(Mandatory = $true)][ValidateSet('user','file','gmail','slack','meeting','intake','other')][string]$SourceType,
    [Parameter(Mandatory = $true)][string]$SourceLocator,
    [Parameter(Mandatory = $true)][string]$SourceSummary,
    [Parameter(Mandatory = $true)][ValidateSet('P0','P1','P2','P3')][string]$Priority,
    [Parameter(Mandatory = $true)][string]$PriorityRationale,
    [Parameter(Mandatory = $true)][string]$NextAction,
    [Parameter(Mandatory = $true)][ValidateSet('read_only_verification','local_research','local_draft','local_artifact','local_test','external_delivery','publishing','deployment','spend','account_change','destructive','human_authentication','business_decision')][string]$ActionClass,
    [Parameter(Mandatory = $true)][string[]]$DefinitionOfDone,
    [ValidateSet('normal','emergency')][string]$Lane = 'normal',
    [string]$EmergencyRationale,
    [ValidateSet('automatic','explicit')][string]$ApprovalTier = 'automatic',
    [string]$ApprovalAction = 'Local reversible work only.',
    [ValidateSet('','captured','triaged','ready','needs_approval','blocked')][string]$Status = '',
    [string]$DueAt,
    [ValidateRange(0,1)][double]$Confidence = 0.8,
    [Parameter(Mandatory = $true)][int]$ExpectedQueueRevision,
    [ValidateSet('marketing-chief')][string]$Writer = 'marketing-chief',
    [string]$QueuePath,
    [string]$ControlPath,
    [string]$RegistryPath,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'MarketingOs.Common.ps1')
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if ([string]::IsNullOrWhiteSpace($QueuePath)) { $QueuePath = Join-Path $projectRoot 'queue\work-items.json' }
if ([string]::IsNullOrWhiteSpace($ControlPath)) { $ControlPath = Join-Path $projectRoot 'CONTROL.md' }
if ([string]::IsNullOrWhiteSpace($RegistryPath)) { $RegistryPath = Join-Path $projectRoot 'registry\clients.json' }
$normalizedDedupeKey = $DedupeKey.Trim()

$textFields = @(
    @{ name='DedupeKey'; value=$normalizedDedupeKey; max=240 }, @{ name='Title'; value=$Title; max=300 },
    @{ name='RequestedOutcome'; value=$RequestedOutcome; max=4000 }, @{ name='SourceLocator'; value=$SourceLocator; max=1000 },
    @{ name='SourceSummary'; value=$SourceSummary; max=4000 }, @{ name='PriorityRationale'; value=$PriorityRationale; max=2000 },
    @{ name='NextAction'; value=$NextAction; max=3000 }, @{ name='ApprovalAction'; value=$ApprovalAction; max=2000 }
)
foreach ($field in $textFields) {
    $value = [string]$field.value
    if ([string]::IsNullOrWhiteSpace($value)) { throw "$($field.name) is required." }
    if ($value.Length -gt [int]$field.max) { throw "$($field.name) exceeds its length limit." }
    if (-not (Test-MarketingSafeText $value)) { throw "$($field.name) contains secret, direct-identifier, or raw-communication material. Use redacted metadata or an opaque locator." }
}
if (@($DefinitionOfDone).Count -lt 1 -or @($DefinitionOfDone).Count -gt 10) { throw 'DefinitionOfDone requires 1 to 10 checks.' }
foreach ($check in @($DefinitionOfDone)) {
    if ([string]::IsNullOrWhiteSpace([string]$check) -or ([string]$check).Length -gt 1000 -or -not (Test-MarketingSafeText ([string]$check))) { throw 'A definition-of-done check is invalid or unsafe.' }
}
if ($Lane -eq 'emergency') {
    if ($Priority -ne 'P0') { throw 'Emergency-lane work must be P0.' }
    if ([string]::IsNullOrWhiteSpace($EmergencyRationale) -or -not (Test-MarketingSafeText $EmergencyRationale)) { throw 'EmergencyRationale is required and must be safe.' }
}
elseif ($PSBoundParameters.ContainsKey('EmergencyRationale')) { throw 'EmergencyRationale is only valid for the emergency lane.' }

$automaticClass = Test-MarketingAutomaticActionClass $ActionClass
$externalClass = $ActionClass -in @('external_delivery','publishing','deployment','spend','account_change','destructive')
$gatedClass = -not $automaticClass
if ($automaticClass -and (Test-MarketingRiskyActionText $NextAction)) { throw 'Risky action wording cannot be classified as automatic local work.' }
if ($gatedClass) {
    $ApprovalTier = 'explicit'
    if ([string]::IsNullOrWhiteSpace($ApprovalAction) -or $ApprovalAction -eq 'Local reversible work only.') { $ApprovalAction = 'Approve the classified gated action before execution.' }
}
if ([string]::IsNullOrWhiteSpace($Status)) { $Status = if ($ApprovalTier -eq 'explicit') { 'needs_approval' } else { 'ready' } }
if ($ApprovalTier -eq 'explicit' -and $Status -ne 'needs_approval' -and $Status -ne 'blocked') { throw 'Explicit or gated work must begin in needs_approval or blocked status.' }
if (-not [string]::IsNullOrWhiteSpace($DueAt)) { $DueAt = [DateTimeOffset]::Parse($DueAt).ToString('o') }

$resolver = Join-Path $PSScriptRoot 'Resolve-Client.ps1'
$resolvedOutput = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $resolver -Name $Client
if ($LASTEXITCODE -ne 0) { throw 'Client routing failed or requires confirmation.' }
$resolved = (($resolvedOutput -join [Environment]::NewLine) | ConvertFrom-Json)
if ($resolved.status -ne 'resolved' -or $resolved.client.status -ne 'active') { throw 'Client must resolve to exactly one active registry record.' }
$clientId = [string]$resolved.client.id

$lockPath = Join-Path $projectRoot 'state\.marketing-chief.lock'
$lock = $null; $queueTemp = $null; $controlTemp = $null
try {
    $lock = [IO.File]::Open($lockPath,[IO.FileMode]::OpenOrCreate,[IO.FileAccess]::ReadWrite,[IO.FileShare]::None)
    $queue = Get-Content -LiteralPath $QueuePath -Raw -Encoding UTF8 | ConvertFrom-Json
    if ([int]$queue.revision -ne $ExpectedQueueRevision) { throw "Stale queue revision. Expected $ExpectedQueueRevision; current is $($queue.revision)." }
    if (@($queue.workItems | Where-Object { ([string]$_.dedupeKey).Trim() -ieq $normalizedDedupeKey }).Count -gt 0) { throw 'DedupeKey already exists in the canonical queue.' }
    $registry = Get-Content -LiteralPath $RegistryPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $liveClient = @($registry.clients | Where-Object { $_.id -eq $clientId -and $_.status -eq 'active' })
    if ($liveClient.Count -ne 1) { throw 'The resolved client is no longer exactly active in the canonical registry.' }
    if ($Status -in @($queue.wipPolicy.activeStatuses)) {
        $limit = if ($Lane -eq 'emergency') { [int]$queue.wipPolicy.emergencyLimit } else { [int]$queue.wipPolicy.normalLimit }
        $used = @($queue.workItems | Where-Object { $_.lane -eq $Lane -and $_.status -in @($queue.wipPolicy.activeStatuses) }).Count
        if ($used -ge $limit) { throw "$Lane WIP limit is full ($used/$limit)." }
    }

    $today = [DateTimeOffset]::UtcNow.ToString('yyyyMMdd'); $maxSequence = 0
    foreach ($existing in @($queue.workItems)) {
        if ([string]$existing.id -match ("^wi-{0}-(\d+)$" -f $today)) { $maxSequence = [math]::Max($maxSequence,[int]$Matches[1]) }
    }
    $workItemId = 'wi-{0}-{1:d4}' -f $today,($maxSequence + 1)
    $now = [DateTimeOffset]::UtcNow.ToString('o')
    $newItem = [pscustomobject][ordered]@{
        id=$workItemId; version=1; dedupeKey=$normalizedDedupeKey; scope='client'; clientId=$clientId
        routing=[pscustomobject]@{ status='resolved'; matchedBy='registry-resolver'; registryStatus='active'; verifiedAt=$now }
        title=$Title.Trim(); requestedOutcome=$RequestedOutcome.Trim()
        source=[pscustomobject]@{ type=$SourceType; locator=$SourceLocator.Trim(); observedAt=$now; redactedSummary=$SourceSummary.Trim() }
        status=$Status; lane=$Lane
        emergencyRationale=if ($Lane -eq 'emergency') { $EmergencyRationale.Trim() } else { $null }
        priority=[pscustomobject]@{ level=$Priority; rationale=$PriorityRationale.Trim() }; owner='marketing-chief'; nextAction=$NextAction.Trim()
        execution=[pscustomobject]@{ actionClass=$ActionClass; automaticEligible=($automaticClass -and $ApprovalTier -eq 'automatic'); externalAction=$externalClass; reversible=$automaticClass; classifiedAt=$now }
        definitionOfDone=@($DefinitionOfDone | ForEach-Object { $_.Trim() }); dueAt=if ([string]::IsNullOrWhiteSpace($DueAt)){$null}else{$DueAt}; reviewAt=$null
        evidence=[pscustomobject]@{ asOf=$now; freshness='current'; refs=@($SourceLocator.Trim()) }
        approval=[pscustomobject]@{ tier=$ApprovalTier; action=$ApprovalAction.Trim(); status=if($ApprovalTier -eq 'explicit'){'pending'}else{'not_required'}; approvalRef=$null }
        dependencies=@(); assumptions=@(); confidence=$Confidence; artifactRefs=@(); outcome=$null; createdAt=$now; updatedAt=$now
    }
    $queue.workItems=@($queue.workItems)+$newItem; $queue.revision=[int]$queue.revision+1; $queue.updatedAt=$now; $queue.updatedBy=$Writer
    $token=[guid]::NewGuid().ToString('N'); $queueTemp=Join-Path (Split-Path -Parent $QueuePath) ".work-items.$token.tmp.json"; $controlTemp=Join-Path (Split-Path -Parent $ControlPath) ".CONTROL.$token.tmp.md"
    [IO.File]::WriteAllText($queueTemp,(($queue|ConvertTo-Json -Depth 100)+[Environment]::NewLine),[Text.UTF8Encoding]::new($false))
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'Update-MarketingControl.ps1') -QueuePath $queueTemp -OutputPath $controlTemp -AsOf $now -InternalRender | Out-Null
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $controlTemp)) { throw 'CONTROL rendering failed; canonical state was not changed.' }
    if ($DryRun) { [pscustomobject]@{status='would-create';workItemId=$workItemId;clientId=$clientId;queueRevision=$queue.revision;lane=$Lane;actionClass=$ActionClass}|ConvertTo-Json -Compress; return }

    $backupRoot=Join-Path $projectRoot 'backups'; $backupDirectory=Resolve-MarketingChildPath -Root $backupRoot -Child ("{0}-new-{1}" -f [DateTimeOffset]::UtcNow.ToString('yyyyMMddTHHmmssZ'),$workItemId)
    New-Item -ItemType Directory -Path $backupDirectory -Force|Out-Null; Copy-Item -LiteralPath $QueuePath -Destination (Join-Path $backupDirectory 'work-items.json') -Force; Copy-Item -LiteralPath $ControlPath -Destination (Join-Path $backupDirectory 'CONTROL.md') -Force
    try { Move-Item -LiteralPath $queueTemp -Destination $QueuePath -Force; Move-Item -LiteralPath $controlTemp -Destination $ControlPath -Force }
    catch { Copy-Item -LiteralPath (Join-Path $backupDirectory 'work-items.json') -Destination $QueuePath -Force; Copy-Item -LiteralPath (Join-Path $backupDirectory 'CONTROL.md') -Destination $ControlPath -Force; throw }
    $mutation=[pscustomobject][ordered]@{schemaVersion=1;mutationId=('qm-'+[guid]::NewGuid().ToString('N'));recordedAt=$now;action='create';workItemId=$workItemId;clientId=$clientId;priorQueueRevision=$ExpectedQueueRevision;queueRevision=[int]$queue.revision;writer=$Writer;externalActionTaken=$false;backup=$backupDirectory}
    $auditRecorded=$true; try{[IO.File]::AppendAllText((Join-Path $projectRoot 'state\queue-mutations.jsonl'),(($mutation|ConvertTo-Json -Compress -Depth 10)+[Environment]::NewLine),[Text.UTF8Encoding]::new($false))}catch{$auditRecorded=$false}
    [pscustomobject]@{status='created';workItemId=$workItemId;clientId=$clientId;queueRevision=$queue.revision;auditRecorded=$auditRecorded}|ConvertTo-Json -Compress
}
finally {
    if ($null -ne $lock) { $lock.Dispose() }
    if (-not [string]::IsNullOrWhiteSpace([string]$queueTemp)) { Remove-Item -LiteralPath $queueTemp -Force -ErrorAction SilentlyContinue }
    if (-not [string]::IsNullOrWhiteSpace([string]$controlTemp)) { Remove-Item -LiteralPath $controlTemp -Force -ErrorAction SilentlyContinue }
}
