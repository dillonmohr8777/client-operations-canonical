[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$WorkItemId,
    [Parameter(Mandatory=$true)][int]$ExpectedQueueRevision,
    [Parameter(Mandatory=$true)][int]$ExpectedWorkItemVersion,
    [ValidateSet('','captured','triaged','ready','in_progress','verification','needs_approval','executed','observed','done','blocked','deferred','cancelled')][string]$Status='',
    [ValidateSet('','P0','P1','P2','P3')][string]$Priority='',
    [string]$NextAction,
    [ValidateSet('','read_only_verification','local_research','local_draft','local_artifact','local_test','external_delivery','publishing','deployment','spend','account_change','destructive','human_authentication','business_decision')][string]$ActionClass='',
    [string]$OutcomeSummary,
    [ValidateSet('','pending','approved','rejected','not_required')][string]$ApprovalStatus='',
    [string]$ApprovalRef,
    [switch]$ExternalActionTaken,
    [string]$DueAt,
    [switch]$ClearDue,
    [ValidateSet('marketing-chief')][string]$Writer='marketing-chief',
    [string]$QueuePath,
    [string]$ControlPath,
    [string]$RegistryPath,
    [switch]$DryRun
)

$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'MarketingOs.Common.ps1')
$projectRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if([string]::IsNullOrWhiteSpace($QueuePath)){$QueuePath=Join-Path $projectRoot 'queue\work-items.json'}
if([string]::IsNullOrWhiteSpace($ControlPath)){$ControlPath=Join-Path $projectRoot 'CONTROL.md'}
if([string]::IsNullOrWhiteSpace($RegistryPath)){$RegistryPath=Join-Path $projectRoot 'registry\clients.json'}

$hasMutation=-not [string]::IsNullOrWhiteSpace($Status) -or -not [string]::IsNullOrWhiteSpace($Priority) -or $PSBoundParameters.ContainsKey('NextAction') -or -not [string]::IsNullOrWhiteSpace($ActionClass) -or $PSBoundParameters.ContainsKey('OutcomeSummary') -or -not [string]::IsNullOrWhiteSpace($ApprovalStatus) -or $PSBoundParameters.ContainsKey('ApprovalRef') -or $ExternalActionTaken -or $PSBoundParameters.ContainsKey('DueAt') -or $ClearDue
if(-not $hasMutation){throw 'At least one mutation field is required.'}
if($ClearDue -and $PSBoundParameters.ContainsKey('DueAt')){throw 'Use either DueAt or ClearDue, not both.'}
if($PSBoundParameters.ContainsKey('NextAction') -and [string]::IsNullOrWhiteSpace($ActionClass)){throw 'ActionClass is required whenever NextAction is supplied.'}
foreach($field in @(@{n='WorkItemId';v=$WorkItemId;m=160},@{n='NextAction';v=$NextAction;m=3000},@{n='OutcomeSummary';v=$OutcomeSummary;m=5000},@{n='ApprovalRef';v=$ApprovalRef;m=1000})){
    if($null-ne$field.v -and ([string]$field.v).Length-gt$field.m){throw "$($field.n) exceeds its length limit."}
    if($null-ne$field.v -and -not(Test-MarketingSafeText([string]$field.v))){throw "$($field.n) contains secret, direct-identifier, or raw-communication material."}
}
if($PSBoundParameters.ContainsKey('NextAction') -and [string]::IsNullOrWhiteSpace($NextAction)){throw 'NextAction cannot be empty.'}
if($PSBoundParameters.ContainsKey('OutcomeSummary') -and [string]::IsNullOrWhiteSpace($OutcomeSummary)){throw 'OutcomeSummary cannot be empty when supplied.'}
if($ApprovalStatus -eq 'approved' -and [string]::IsNullOrWhiteSpace($ApprovalRef)){throw 'ApprovalRef is required when approval is approved.'}
if(-not [string]::IsNullOrWhiteSpace($DueAt)){$DueAt=[DateTimeOffset]::Parse($DueAt).ToString('o')}

$lockPath=Join-Path $projectRoot 'state\.marketing-chief.lock';$lock=$null;$queueTemp=$null;$controlTemp=$null
try{
    $lock=[IO.File]::Open($lockPath,[IO.FileMode]::OpenOrCreate,[IO.FileAccess]::ReadWrite,[IO.FileShare]::None)
    $queue=Get-Content -LiteralPath $QueuePath -Raw -Encoding UTF8|ConvertFrom-Json
    if([int]$queue.revision-ne$ExpectedQueueRevision){throw "Stale queue revision. Expected $ExpectedQueueRevision; current is $($queue.revision)."}
    $matches=@($queue.workItems|Where-Object{$_.id-eq$WorkItemId});if($matches.Count-ne1){throw 'Work item must resolve exactly once.'};$item=$matches[0]
    if([int]$item.version-ne$ExpectedWorkItemVersion){throw "Stale work-item version. Expected $ExpectedWorkItemVersion; current is $($item.version)."}
    $registry=Get-Content -LiteralPath $RegistryPath -Raw -Encoding UTF8|ConvertFrom-Json
    if(@($registry.clients|Where-Object{$_.id-eq$item.clientId-and$_.status-eq'active'}).Count-ne1){throw 'The work item client is not exactly active in the canonical registry.'}

    $oldStatus=[string]$item.status;$targetStatus=if([string]::IsNullOrWhiteSpace($Status)){$oldStatus}else{$Status}
    if(-not(Test-MarketingStatusTransition -From $oldStatus -To $targetStatus)){throw "Invalid status transition: $oldStatus -> $targetStatus."}
    $currentExecution=if($item.PSObject.Properties.Name-contains'execution'){$item.execution}else{$null}
    $currentClass=if($null-ne$currentExecution){[string]$currentExecution.actionClass}else{''};$targetClass=if([string]::IsNullOrWhiteSpace($ActionClass)){$currentClass}else{$ActionClass}
    if([string]::IsNullOrWhiteSpace($targetClass)){throw 'Work item has no execution.actionClass; classify it before mutation.'}
    $targetAction=if($PSBoundParameters.ContainsKey('NextAction')){$NextAction.Trim()}else{[string]$item.nextAction}
    $automaticClass=Test-MarketingAutomaticActionClass $targetClass
    $externalClass=$targetClass-in@('external_delivery','publishing','deployment','spend','account_change','destructive')
    if($automaticClass -and (Test-MarketingRiskyActionText $targetAction)){throw 'Risky action wording cannot be classified as automatic local work.'}

    $targetApproval=if([string]::IsNullOrWhiteSpace($ApprovalStatus)){[string]$item.approval.status}else{$ApprovalStatus}
    $approvalTier=[string]$item.approval.tier
    if(-not $automaticClass){$approvalTier='explicit';if($targetApproval-eq'not_required'){$targetApproval='pending'}}
    if($targetApproval-eq'approved'){
        $ref=if($PSBoundParameters.ContainsKey('ApprovalRef')){$ApprovalRef}else{[string]$item.approval.approvalRef}
        if([string]::IsNullOrWhiteSpace($ref)){throw 'Approved work requires a non-secret ApprovalRef.'}
    }
    if($targetApproval-eq'rejected' -and $targetStatus-notin@('deferred','cancelled')){throw 'Rejected work must transition to deferred or cancelled.'}
    if(($approvalTier-eq'explicit' -or -not $automaticClass) -and $targetApproval-ne'approved' -and $targetStatus-notin@('needs_approval','blocked','deferred','cancelled')){throw 'Approval-gated work cannot advance until approval is recorded.'}
    if($targetApproval-eq'pending' -and $targetStatus-notin@('needs_approval','blocked','deferred','cancelled')){throw 'Pending approval cannot advance to an execution state.'}
    if($targetApproval-eq'not_required' -and $approvalTier-ne'automatic'){throw 'Only automatic-tier work may use approval status not_required.'}
    $newOutcomeProvided=$PSBoundParameters.ContainsKey('OutcomeSummary')-and-not[string]::IsNullOrWhiteSpace($OutcomeSummary)
    if($ExternalActionTaken){
        if(-not$externalClass){throw 'ExternalActionTaken is valid only for an external action class.'}
        if($targetApproval-ne'approved'){throw 'ExternalActionTaken requires recorded explicit approval.'}
        if(-not$newOutcomeProvided){throw 'ExternalActionTaken requires a verified OutcomeSummary.'}
        if($targetStatus-notin@('verification','executed','observed','done')){throw 'ExternalActionTaken requires a verification or completion status.'}
    }
    $existingOutcomeStatus=if($null-ne$item.outcome){[string]$item.outcome.status}else{''}
    $existingOutcomeSummary=if($null-ne$item.outcome){[string]$item.outcome.summary}else{''}
    $existingOutcomeVerified=$existingOutcomeStatus-in@('completed','verification','verified')-and-not[string]::IsNullOrWhiteSpace($existingOutcomeSummary)
    if($targetStatus-eq'done' -and -not($newOutcomeProvided-or$existingOutcomeVerified)){throw 'Transition to done requires a nonblank OutcomeSummary in this mutation or an existing verified/completed outcome.'}

    $active=@($queue.wipPolicy.activeStatuses);$wasActive=$oldStatus-in$active;$willBeActive=$targetStatus-in$active
    if($willBeActive -and -not $wasActive){
        $lane=[string]$item.lane;if($lane-notin@('normal','emergency')){throw 'Work item lane must be normal or emergency.'}
        $limit=if($lane-eq'emergency'){[int]$queue.wipPolicy.emergencyLimit}else{[int]$queue.wipPolicy.normalLimit}
        $used=@($queue.workItems|Where-Object{$_.id-ne$item.id-and$_.lane-eq$lane-and$_.status-in$active}).Count
        if($used-ge$limit){throw "$lane WIP limit is full ($used/$limit)."}
    }

    $now=[DateTimeOffset]::UtcNow.ToString('o')
    if(-not[string]::IsNullOrWhiteSpace($Status)){$item.status=$Status}
    if(-not[string]::IsNullOrWhiteSpace($Priority)){$item.priority.level=$Priority}
    if($PSBoundParameters.ContainsKey('NextAction')){$item.nextAction=$targetAction}
    $item.execution=[pscustomobject]@{actionClass=$targetClass;automaticEligible=($automaticClass-and$approvalTier-eq'automatic' -and $targetApproval-eq'not_required');externalAction=$externalClass;reversible=$automaticClass;classifiedAt=$now}
    $item.approval.tier=$approvalTier
    if(-not[string]::IsNullOrWhiteSpace($ApprovalStatus)){$item.approval.status=$ApprovalStatus}
    elseif(-not$automaticClass -and [string]$item.approval.status-eq'not_required'){$item.approval.status='pending'}
    if($PSBoundParameters.ContainsKey('ApprovalRef')){$item.approval.approvalRef=if([string]::IsNullOrWhiteSpace($ApprovalRef)){$null}else{$ApprovalRef.Trim()}}
    if($PSBoundParameters.ContainsKey('OutcomeSummary')){$item.outcome=[pscustomobject]@{status=$targetStatus;verifiedAt=$now;summary=$OutcomeSummary.Trim();externalActionTaken=[bool]$ExternalActionTaken}}
    if($ClearDue){$item.dueAt=$null}elseif($PSBoundParameters.ContainsKey('DueAt')){$item.dueAt=$DueAt}
    $item.version=[int]$item.version+1;$item.updatedAt=$now;$queue.revision=[int]$queue.revision+1;$queue.updatedAt=$now;$queue.updatedBy=$Writer

    $token=[guid]::NewGuid().ToString('N');$queueTemp=Join-Path(Split-Path -Parent $QueuePath)".work-items.$token.tmp.json";$controlTemp=Join-Path(Split-Path -Parent $ControlPath)".CONTROL.$token.tmp.md"
    [IO.File]::WriteAllText($queueTemp,(($queue|ConvertTo-Json -Depth 100)+[Environment]::NewLine),[Text.UTF8Encoding]::new($false))
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'Update-MarketingControl.ps1') -QueuePath $queueTemp -OutputPath $controlTemp -AsOf $now -InternalRender|Out-Null
    if($LASTEXITCODE-ne0-or-not(Test-Path -LiteralPath $controlTemp)){throw 'CONTROL rendering failed; canonical state was not changed.'}
    if($DryRun){[pscustomobject]@{status='would-update';workItemId=$item.id;workItemVersion=$item.version;queueRevision=$queue.revision;targetStatus=$targetStatus;actionClass=$targetClass;externalActionTaken=[bool]$ExternalActionTaken}|ConvertTo-Json -Compress;return}

    $backupRoot=Join-Path $projectRoot 'backups';$backupDirectory=Resolve-MarketingChildPath -Root $backupRoot -Child("{0}-update-{1}"-f[DateTimeOffset]::UtcNow.ToString('yyyyMMddTHHmmssZ'),$item.id)
    New-Item -ItemType Directory -Path $backupDirectory -Force|Out-Null;Copy-Item -LiteralPath $QueuePath -Destination(Join-Path $backupDirectory 'work-items.json')-Force;Copy-Item -LiteralPath $ControlPath -Destination(Join-Path $backupDirectory 'CONTROL.md')-Force
    try{Move-Item -LiteralPath $queueTemp -Destination $QueuePath -Force;Move-Item -LiteralPath $controlTemp -Destination $ControlPath -Force}catch{Copy-Item -LiteralPath(Join-Path $backupDirectory 'work-items.json')-Destination $QueuePath -Force;Copy-Item -LiteralPath(Join-Path $backupDirectory 'CONTROL.md')-Destination $ControlPath -Force;throw}
    $mutation=[pscustomobject][ordered]@{schemaVersion=1;mutationId=('qm-'+[guid]::NewGuid().ToString('N'));recordedAt=$now;action='update';workItemId=$item.id;clientId=$item.clientId;priorQueueRevision=$ExpectedQueueRevision;queueRevision=[int]$queue.revision;priorWorkItemVersion=$ExpectedWorkItemVersion;workItemVersion=[int]$item.version;writer=$Writer;externalActionTaken=[bool]$ExternalActionTaken;backup=$backupDirectory}
    $auditRecorded=$true;try{[IO.File]::AppendAllText((Join-Path $projectRoot 'state\queue-mutations.jsonl'),(($mutation|ConvertTo-Json -Compress -Depth 10)+[Environment]::NewLine),[Text.UTF8Encoding]::new($false))}catch{$auditRecorded=$false}
    [pscustomobject]@{status='updated';workItemId=$item.id;workItemVersion=$item.version;queueRevision=$queue.revision;auditRecorded=$auditRecorded}|ConvertTo-Json -Compress
}finally{
    if($null -ne $lock){$lock.Dispose()}
    if(-not [string]::IsNullOrWhiteSpace([string]$queueTemp)){Remove-Item -LiteralPath $queueTemp -Force -ErrorAction SilentlyContinue}
    if(-not [string]::IsNullOrWhiteSpace([string]$controlTemp)){Remove-Item -LiteralPath $controlTemp -Force -ErrorAction SilentlyContinue}
}
