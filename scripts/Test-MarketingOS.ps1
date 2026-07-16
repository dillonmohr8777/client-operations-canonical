[CmdletBinding()]
param([switch]$Detailed)

$ErrorActionPreference='Stop'
$projectRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$checks=New-Object System.Collections.Generic.List[object]
$failed=$false
$tempRoot=Join-Path $env:TEMP ('marketing-os-tests-'+[guid]::NewGuid().ToString('N'))
[IO.Directory]::CreateDirectory($tempRoot)|Out-Null

function Add-Check{param([string]$Name,[bool]$Passed,[string]$Detail);$script:checks.Add([pscustomobject][ordered]@{name=$Name;passed=$Passed;detail=$Detail});if(-not$Passed){$script:failed=$true}}
function Invoke-Script{
    param([string]$ScriptPath,[string[]]$Arguments)
    $previousErrorPreference=$ErrorActionPreference
    try{
        $ErrorActionPreference='Continue'
        $output=& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $ScriptPath @Arguments 2>&1
        $exitCode=$LASTEXITCODE
    }
    finally{$ErrorActionPreference=$previousErrorPreference}
    [pscustomobject]@{exitCode=$exitCode;output=($output-join[Environment]::NewLine)}
}
function Add-ExitCheck{param([string]$Name,$Result,[bool]$ShouldPass=$true);$pass=if($ShouldPass){$Result.exitCode-eq0}else{$Result.exitCode-ne0};Add-Check $Name $pass ("exit={0}"-f$Result.exitCode)}
function Write-Utf8Text{param([string]$Path,[string]$Text);$dir=Split-Path -Parent $Path;if(-not(Test-Path -LiteralPath $dir)){[IO.Directory]::CreateDirectory($dir)|Out-Null};[IO.File]::WriteAllText($Path,$Text,[Text.UTF8Encoding]::new($false))}
function Write-Utf8Json{param([string]$Path,$Object);Write-Utf8Text $Path (($Object|ConvertTo-Json -Depth 100)+[Environment]::NewLine)}
function Copy-JsonObject{param($Object);return (($Object|ConvertTo-Json -Depth 100)|ConvertFrom-Json)}
function Read-JsonOutput{param($Result);try{return ($Result.output|ConvertFrom-Json)}catch{return $null}}

$queuePath=Join-Path $projectRoot 'queue\work-items.json'
$registryPath=Join-Path $projectRoot 'registry\clients.json'
$controlPath=Join-Path $projectRoot 'CONTROL.md'
$fixturePath=Join-Path $projectRoot 'tests\fixtures\valid-worker-handoff.json'
$queue=Get-Content -LiteralPath $queuePath -Raw -Encoding UTF8|ConvertFrom-Json
$registry=Get-Content -LiteralPath $registryPath -Raw -Encoding UTF8|ConvertFrom-Json

try{
    foreach ($path in @('queue\work-items.json','registry\clients.json','workflows\marketing-chief.workflow.json','schemas\worker-handoff.schema.json','schemas\design-contract.schema.json','intake\index.json','state\intake-sync.json','state\system-health.json','state\task-continuity.json','state\access-coverage.json')){
        $full=Join-Path $projectRoot $path
        try{[void](Get-Content -LiteralPath $full -Raw -Encoding UTF8|ConvertFrom-Json);Add-Check "json:$path" $true 'valid'}catch{Add-Check "json:$path" $false 'invalid-or-missing'}
    }
    foreach ($script in @(Get-ChildItem -LiteralPath $PSScriptRoot -Filter '*.ps1' -File)){
        $parseErrors=$null;[void][Management.Automation.Language.Parser]::ParseFile($script.FullName,[ref]$null,[ref]$parseErrors)
        Add-Check ("powershell-parse:{0}"-f$script.Name) (@($parseErrors).Count-eq0) ("errors={0}"-f@($parseErrors).Count)
    }

    Add-ExitCheck 'client-registry' (Invoke-Script (Join-Path $PSScriptRoot 'Test-ClientRegistry.ps1') @())
    $predictionResult=Invoke-Script (Join-Path $PSScriptRoot 'Get-NextActions.ps1') @('-Format','Json','-AsOf',[string]$queue.updatedAt)
    Add-ExitCheck 'next-action-predictor' $predictionResult
    $prediction=Read-JsonOutput $predictionResult
    Add-Check 'prediction:three-surfaces' ($null-ne$prediction.nextDecision-and$null-ne$prediction.nextUnblock) 'decision-and-unblock-present'

    $canonicalControlCheck=Invoke-Script (Join-Path $PSScriptRoot 'Update-MarketingControl.ps1') @('-Check')
    Add-ExitCheck 'control:canonical-current' $canonicalControlCheck
    $directWriteWithoutRevision=Invoke-Script (Join-Path $PSScriptRoot 'Update-MarketingControl.ps1') @()
    Add-ExitCheck 'control:direct-write-requires-revision' $directWriteWithoutRevision $false

    # Stable positive handoff fixture against an isolated queue snapshot.
    $handoffQueue=Copy-JsonObject $queue;$handoffQueue.revision=200;$handoffQueue.updatedAt='2026-07-16T06:00:00Z'
    $handoffItem=@($handoffQueue.workItems|Where-Object{$_.id-eq'wi-20260715-0003'})[0]
    $handoffItem.version=2;$handoffItem.status='ready';$handoffItem.outcome=$null;$handoffItem.approval.tier='automatic';$handoffItem.approval.status='not_required';$handoffItem.approval.approvalRef=$null
    $handoffQueuePath=Join-Path $tempRoot 'handoff\queue.json';$handoffControlPath=Join-Path $tempRoot 'handoff\CONTROL.md';Write-Utf8Json $handoffQueuePath $handoffQueue
    Add-ExitCheck 'handoff:positive-validation' (Invoke-Script (Join-Path $PSScriptRoot 'Test-MarketingHandoff.ps1') @('-HandoffPath',$fixturePath,'-QueuePath',$handoffQueuePath,'-RegistryPath',$registryPath,'-Format','Json'))
    Add-ExitCheck 'handoff:positive-accept-dry-run' (Invoke-Script (Join-Path $PSScriptRoot 'Accept-WorkerHandoff.ps1') @('-HandoffPath',$fixturePath,'-QueuePath',$handoffQueuePath,'-ControlPath',$handoffControlPath,'-RegistryPath',$registryPath,'-ExpectedQueueRevision','200','-DryRun'))

    $baseHandoff=Get-Content -LiteralPath $fixturePath -Raw -Encoding UTF8|ConvertFrom-Json
    $negativeHandoffs=@(
        @{name='unsafe-id';edit={param($h)$h.handoffId='../escape'}},
        @{name='failed-to-done';edit={param($h)$h.status='failed';$h.proposedTransition='done'}},
        @{name='artifact-escape';edit={param($h)$h.artifacts=@('context/DESIGN_STANDARD.md')}},
        @{name='unsafe-evidence';edit={param($h)$h.evidence=@('password: REDACTED')}},
        @{name='phone';edit={param($h)$h.summary='Call 555-123-4567 for verification.'}},
        @{name='stale-version';edit={param($h)$h.expectedWorkItemVersion=999}}
    )
    foreach ($case in $negativeHandoffs){$h=Copy-JsonObject $baseHandoff;&$case.edit $h;$path=Join-Path $tempRoot ("handoff\negative-{0}.json"-f$case.name);Write-Utf8Json $path $h;Add-ExitCheck ("handoff:reject-{0}"-f$case.name) (Invoke-Script (Join-Path $PSScriptRoot 'Test-MarketingHandoff.ps1') @('-HandoffPath',$path,'-QueuePath',$handoffQueuePath,'-RegistryPath',$registryPath,'-Format','Json')) $false}
    $pendingQueue=Copy-JsonObject $handoffQueue;$pendingItem=@($pendingQueue.workItems|Where-Object{$_.id-eq'wi-20260715-0003'})[0];$pendingItem.status='needs_approval';$pendingItem.approval.tier='explicit';$pendingItem.approval.status='pending';$pendingQueuePath=Join-Path $tempRoot 'handoff\pending-queue.json';Write-Utf8Json $pendingQueuePath $pendingQueue
    $pendingHandoff=Copy-JsonObject $baseHandoff;$pendingHandoff.status='completed';$pendingHandoff.proposedTransition='verification';$pendingHandoff.approvalGate='none';$pendingHandoffPath=Join-Path $tempRoot 'handoff\pending-bypass.json';Write-Utf8Json $pendingHandoffPath $pendingHandoff
    Add-ExitCheck 'handoff:reject-pending-approval-bypass' (Invoke-Script (Join-Path $PSScriptRoot 'Test-MarketingHandoff.ps1') @('-HandoffPath',$pendingHandoffPath,'-QueuePath',$pendingQueuePath,'-RegistryPath',$registryPath,'-Format','Json')) $false

    # Queue mutation approval, completion, action-class, and WIP guards.
    $hope=@($queue.workItems|Where-Object{$_.id-eq'wi-20260715-0001'})[0]
    Add-ExitCheck 'queue:update-dry-run' (Invoke-Script (Join-Path $PSScriptRoot 'Update-MarketingQueue.ps1') @('-WorkItemId',$hope.id,'-ExpectedQueueRevision',[string]$queue.revision,'-ExpectedWorkItemVersion',[string]$hope.version,'-Priority',[string]$hope.priority.level,'-DryRun'))
    Add-ExitCheck 'queue:reject-pending-approval-bypass' (Invoke-Script (Join-Path $PSScriptRoot 'Update-MarketingQueue.ps1') @('-WorkItemId',$hope.id,'-ExpectedQueueRevision',[string]$queue.revision,'-ExpectedWorkItemVersion',[string]$hope.version,'-Status','in_progress','-DryRun')) $false
    $nkcdc=@($queue.workItems|Where-Object{$_.id-eq'wi-20260715-0003'})[0]
    Add-ExitCheck 'queue:reject-risky-automatic-text' (Invoke-Script (Join-Path $PSScriptRoot 'Update-MarketingQueue.ps1') @('-WorkItemId',$nkcdc.id,'-ExpectedQueueRevision',[string]$queue.revision,'-ExpectedWorkItemVersion',[string]$nkcdc.version,'-NextAction','Send the deck to the client.','-ActionClass','local_artifact','-DryRun')) $false

    $doneQueue=Copy-JsonObject $queue;$doneQueue.revision=301;$doneItem=@($doneQueue.workItems|Where-Object{$_.id-eq'wi-20260715-0003'})[0];$doneItem.version=20;$doneItem.status='verification';$doneItem.outcome=$null;$doneQueuePath=Join-Path $tempRoot 'queue\done.json';$doneControl=Join-Path $tempRoot 'queue\done-control.md';Write-Utf8Json $doneQueuePath $doneQueue
    Add-ExitCheck 'queue:reject-done-without-outcome' (Invoke-Script (Join-Path $PSScriptRoot 'Update-MarketingQueue.ps1') @('-QueuePath',$doneQueuePath,'-ControlPath',$doneControl,'-RegistryPath',$registryPath,'-WorkItemId',$doneItem.id,'-ExpectedQueueRevision','301','-ExpectedWorkItemVersion','20','-Status','done','-DryRun')) $false
    Add-ExitCheck 'queue:reject-empty-outcome' (Invoke-Script (Join-Path $PSScriptRoot 'Update-MarketingQueue.ps1') @('-QueuePath',$doneQueuePath,'-ControlPath',$doneControl,'-RegistryPath',$registryPath,'-WorkItemId',$doneItem.id,'-ExpectedQueueRevision','301','-ExpectedWorkItemVersion','20','-Status','done','-OutcomeSummary','   ','-DryRun')) $false
    $doneItem.outcome=[pscustomobject]@{status='ready';summary='Old unverified note.';verifiedAt='2026-07-16T05:00:00Z'};Write-Utf8Json $doneQueuePath $doneQueue
    Add-ExitCheck 'queue:reject-stale-unverified-outcome' (Invoke-Script (Join-Path $PSScriptRoot 'Update-MarketingQueue.ps1') @('-QueuePath',$doneQueuePath,'-ControlPath',$doneControl,'-RegistryPath',$registryPath,'-WorkItemId',$doneItem.id,'-ExpectedQueueRevision','301','-ExpectedWorkItemVersion','20','-Status','done','-DryRun')) $false

    $emergencyQueue=Copy-JsonObject $queue;$emergencyQueue.revision=401;$target=@($emergencyQueue.workItems|Where-Object{$_.id-eq'wi-20260715-0003'})[0];$target.version=30;$target.status='ready';$target.lane='emergency';$target.priority.level='P0';$target|Add-Member -NotePropertyName emergencyRationale -NotePropertyValue 'Time-critical local recovery test.' -Force
    $active=Copy-JsonObject $target;$active.id='wi-test-emergency-active';$active.version=1;$active.status='in_progress';$emergencyQueue.workItems=@($emergencyQueue.workItems)+$active;$emergencyQueuePath=Join-Path $tempRoot 'queue\emergency.json';$emergencyControl=Join-Path $tempRoot 'queue\emergency-control.md';Write-Utf8Json $emergencyQueuePath $emergencyQueue
    Add-ExitCheck 'wip:reject-second-emergency' (Invoke-Script (Join-Path $PSScriptRoot 'Update-MarketingQueue.ps1') @('-QueuePath',$emergencyQueuePath,'-ControlPath',$emergencyControl,'-RegistryPath',$registryPath,'-WorkItemId',$target.id,'-ExpectedQueueRevision','401','-ExpectedWorkItemVersion','30','-Status','in_progress','-DryRun')) $false
    $emergencyQueue.workItems=@($emergencyQueue.workItems|Where-Object{$_.id-ne'wi-test-emergency-active'});Write-Utf8Json $emergencyQueuePath $emergencyQueue
    Add-ExitCheck 'wip:allow-first-emergency' (Invoke-Script (Join-Path $PSScriptRoot 'Update-MarketingQueue.ps1') @('-QueuePath',$emergencyQueuePath,'-ControlPath',$emergencyControl,'-RegistryPath',$registryPath,'-WorkItemId',$target.id,'-ExpectedQueueRevision','401','-ExpectedWorkItemVersion','30','-Status','in_progress','-DryRun'))

    $newArgs=@('-Client','NKCDC','-DedupeKey','fixture:nkcdc:test-only','-Title','Fixture capture','-RequestedOutcome','Prove exact routing and stale-safe capture.','-SourceType','user','-SourceLocator','fixture://local','-SourceSummary','Synthetic redacted test observation.','-Priority','P3','-PriorityRationale','Test only.','-NextAction','Validate without committing.','-ActionClass','local_test','-DefinitionOfDone','Dry run returns a routed work item.','-ExpectedQueueRevision',[string]$queue.revision,'-DryRun')
    Add-ExitCheck 'queue:new-work-dry-run' (Invoke-Script (Join-Path $PSScriptRoot 'New-MarketingWorkItem.ps1') $newArgs)
    $dedupeArgs=@('-Client','NKCDC','-DedupeKey',('  '+[string]$nkcdc.dedupeKey.ToUpperInvariant()+'  '),'-Title','Duplicate fixture','-RequestedOutcome','Reject normalized duplicate state.','-SourceType','user','-SourceLocator','fixture://local','-SourceSummary','Synthetic redacted test observation.','-Priority','P3','-PriorityRationale','Test only.','-NextAction','Validate without committing.','-ActionClass','local_test','-DefinitionOfDone','Duplicate is rejected.','-ExpectedQueueRevision',[string]$queue.revision,'-DryRun')
    Add-ExitCheck 'queue:reject-normalized-dedupe' (Invoke-Script (Join-Path $PSScriptRoot 'New-MarketingWorkItem.ps1') $dedupeArgs) $false

    # Predictor fails closed and feedback changes behavior rather than only scores.
    $asOf='2026-07-16T07:00:00Z';$predictQueue=Copy-JsonObject $queue;$predictQueue.revision=500;$predictQueue.updatedAt=$asOf;$predictItem=Copy-JsonObject $nkcdc;$predictItem.version=77;$predictItem.status='ready';$predictItem.lane='normal';$predictItem.nextAction='Review the local artifact against the brief.';$predictItem.routing.status='resolved';$predictItem.routing.registryStatus='active';$predictItem.routing.verifiedAt=$asOf;$predictItem.evidence.asOf=$asOf;$predictItem.evidence.freshness='current';$predictItem.evidence.refs=@('clients/nkcdc/CLIENT.md');$predictItem.approval.tier='automatic';$predictItem.approval.status='not_required';$predictItem.execution.actionClass='local_artifact';$predictItem.execution.automaticEligible=$true;$predictItem.execution.externalAction=$false;$predictItem.execution.reversible=$true;$predictQueue.workItems=@($predictItem);$predictQueuePath=Join-Path $tempRoot 'predictor\queue.json';$feedbackPath=Join-Path $tempRoot 'predictor\feedback.jsonl';Write-Utf8Json $predictQueuePath $predictQueue;Write-Utf8Text $feedbackPath ''
    $basePrediction=Read-JsonOutput (Invoke-Script (Join-Path $PSScriptRoot 'Get-NextActions.ps1') @('-QueuePath',$predictQueuePath,'-RegistryPath',$registryPath,'-FeedbackPath',$feedbackPath,'-AsOf',$asOf,'-Format','Json'))
    Add-Check 'predictor:eligible-safe-local' ($basePrediction.nextAutomatic.workItemId-eq$predictItem.id) ([string]$basePrediction.nextAutomatic.workItemId)
    foreach ($badApproval in @('rejected','garbled')){$q=Copy-JsonObject $predictQueue;$q.workItems[0].approval.status=$badApproval;$p=Join-Path $tempRoot ("predictor\approval-$badApproval.json");Write-Utf8Json $p $q;$r=Read-JsonOutput (Invoke-Script (Join-Path $PSScriptRoot 'Get-NextActions.ps1') @('-QueuePath',$p,'-RegistryPath',$registryPath,'-FeedbackPath',$feedbackPath,'-AsOf',$asOf,'-Format','Json'));Add-Check ("predictor:reject-approval-$badApproval") ($null-eq$r.nextAutomatic) 'no-automatic'}
    $badLane=Copy-JsonObject $predictQueue;$badLane.workItems[0].lane='other';$badLanePath=Join-Path $tempRoot 'predictor\bad-lane.json';Write-Utf8Json $badLanePath $badLane;$badLaneResult=Read-JsonOutput (Invoke-Script (Join-Path $PSScriptRoot 'Get-NextActions.ps1') @('-QueuePath',$badLanePath,'-RegistryPath',$registryPath,'-FeedbackPath',$feedbackPath,'-AsOf',$asOf,'-Format','Json'));Add-Check 'predictor:reject-invalid-lane' ($null-eq$badLaneResult.nextAutomatic) 'no-automatic'
    $risky=Copy-JsonObject $predictQueue;$risky.workItems[0].nextAction='Send the artifact to the client.';$riskyPath=Join-Path $tempRoot 'predictor\risky.json';Write-Utf8Json $riskyPath $risky;$riskyResult=Read-JsonOutput (Invoke-Script (Join-Path $PSScriptRoot 'Get-NextActions.ps1') @('-QueuePath',$riskyPath,'-RegistryPath',$registryPath,'-FeedbackPath',$feedbackPath,'-AsOf',$asOf,'-Format','Json'));Add-Check 'predictor:reject-risky-automatic' ($null-eq$riskyResult.nextAutomatic) 'no-automatic'
    $feedbackBase=[ordered]@{schemaVersion=2;recordedAt=$asOf;workItemId=$predictItem.id;workItemVersion=77;predictionLane='automatic';predictedAction=$predictItem.nextAction;replacementAction=$null}
    $rejectFeedback=[pscustomobject](Copy-JsonObject $feedbackBase);$rejectFeedback|Add-Member decision reject;Write-Utf8Text $feedbackPath (($rejectFeedback|ConvertTo-Json -Compress)+[Environment]::NewLine);$rejectResult=Read-JsonOutput (Invoke-Script (Join-Path $PSScriptRoot 'Get-NextActions.ps1') @('-QueuePath',$predictQueuePath,'-RegistryPath',$registryPath,'-FeedbackPath',$feedbackPath,'-AsOf',$asOf,'-Format','Json'));Add-Check 'feedback:reject-suppresses' ($null-eq$rejectResult.nextAutomatic-and@($rejectResult.suppressed).Count-eq1) 'suppressed-until-version-change'
    $changedVersion=Copy-JsonObject $predictQueue;$changedVersion.workItems[0].version=78;$changedPath=Join-Path $tempRoot 'predictor\changed-version.json';Write-Utf8Json $changedPath $changedVersion;$changedResult=Read-JsonOutput (Invoke-Script (Join-Path $PSScriptRoot 'Get-NextActions.ps1') @('-QueuePath',$changedPath,'-RegistryPath',$registryPath,'-FeedbackPath',$feedbackPath,'-AsOf',$asOf,'-Format','Json'));Add-Check 'feedback:version-change-reenables' ($changedResult.nextAutomatic.workItemId-eq$predictItem.id) 'automatic-restored'
    $modifyFeedback=[pscustomobject](Copy-JsonObject $feedbackBase);$modifyFeedback|Add-Member decision modify;$modifyFeedback.replacementAction='Upload the artifact to the client Drive.';Write-Utf8Text $feedbackPath (($modifyFeedback|ConvertTo-Json -Compress)+[Environment]::NewLine);$modifyResult=Read-JsonOutput (Invoke-Script (Join-Path $PSScriptRoot 'Get-NextActions.ps1') @('-QueuePath',$predictQueuePath,'-RegistryPath',$registryPath,'-FeedbackPath',$feedbackPath,'-AsOf',$asOf,'-Format','Json'));Add-Check 'feedback:modify-requires-reclassification' ($null-eq$modifyResult.nextAutomatic-and@($modifyResult.pendingModifications).Count-eq1) 'held-for-queue-update'
    $acceptFeedback=[pscustomobject](Copy-JsonObject $feedbackBase);$acceptFeedback|Add-Member decision accept;Write-Utf8Text $feedbackPath (($acceptFeedback|ConvertTo-Json -Compress)+[Environment]::NewLine);$acceptPrediction=Read-JsonOutput (Invoke-Script (Join-Path $PSScriptRoot 'Get-NextActions.ps1') @('-QueuePath',$predictQueuePath,'-RegistryPath',$registryPath,'-FeedbackPath',$feedbackPath,'-AsOf',$asOf,'-Format','Json'));Add-Check 'feedback:accept-adjusts-score' ([double]$acceptPrediction.nextAutomatic.score-eq([double]$basePrediction.nextAutomatic.score+10)) ("score={0}"-f$acceptPrediction.nextAutomatic.score)

    $correctionLedger=Join-Path $tempRoot 'learning\corrections.jsonl'
    $canonicalCorrectionsResult=Invoke-Script (Join-Path $PSScriptRoot 'Get-MarketingCorrections.ps1') @('-Format','Json');Add-ExitCheck 'learning:canonical-ledger-valid' $canonicalCorrectionsResult
    $canonicalCorrections=Read-JsonOutput $canonicalCorrectionsResult
    $canonicalLegacy=@($canonicalCorrections.items|Where-Object{[int]$_.schemaVersion-eq1})
    Add-Check 'learning:legacy-six-lessons-preserved' ($canonicalLegacy.Count-eq6-and@($canonicalLegacy|Where-Object{[string]::IsNullOrWhiteSpace([string]$_.recordedAt)-or[string]::IsNullOrWhiteSpace([string]$_.summary)-or[string]::IsNullOrWhiteSpace([string]$_.lesson)-or$_.replacementRule-ne$_.lesson}).Count-eq0) ("legacy={0}"-f$canonicalLegacy.Count)
    $supersedingCorrection=@($canonicalLegacy|Where-Object{$_.correctionId-eq'corr-20260716-0005'})
    Add-Check 'learning:legacy-precedence-preserved' ($supersedingCorrection.Count-eq1-and$supersedingCorrection[0].supersedes-eq'corr-20260715-0001') ([string]$supersedingCorrection[0].supersedes)
    $legacyFixture=Get-Content -LiteralPath (Join-Path $projectRoot 'state\corrections.jsonl') -Encoding UTF8|Select-Object -First 1|ConvertFrom-Json
    foreach($legacyCase in @(
        @{name='source';edit={param($e)$e.signalSource='arbitrary_source'}},
        @{name='trigger';edit={param($e)$e.triggerRef='Call 555-123-4567'}},
        @{name='lesson';edit={param($e)$e.lesson='password: REDACTED'}},
        @{name='client-id';edit={param($e)$e.appliesTo.clientIds=@('person@example.com')}}
    )){$entry=Copy-JsonObject $legacyFixture;&$legacyCase.edit $entry;$legacyBadPath=Join-Path $tempRoot ("learning\legacy-bad-{0}.jsonl"-f$legacyCase.name);Write-Utf8Text $legacyBadPath (($entry|ConvertTo-Json -Compress -Depth 20)+[Environment]::NewLine);Add-ExitCheck ("learning:reject-unsafe-legacy-{0}"-f$legacyCase.name) (Invoke-Script (Join-Path $PSScriptRoot 'Get-MarketingCorrections.ps1') @('-LedgerPath',$legacyBadPath,'-Format','Json')) $false}
    $correctionPositive=Invoke-Script (Join-Path $PSScriptRoot 'Record-MarketingCorrection.ps1') @('-Category','voice','-Source','user_decision','-Lesson','Use the shorter direct opening for this channel.','-ReplacementRule','Lead with the requested outcome in the first sentence.','-ClientId','nkcdc','-WorkItemId',$nkcdc.id,'-EvidenceLocator','context/DILLON_VOICE.md','-LedgerPath',$correctionLedger)
    Add-ExitCheck 'learning:correction-recorded' $correctionPositive
    $correctionEntry=(Get-Content -LiteralPath $correctionLedger -Encoding UTF8|Select-Object -First 1)|ConvertFrom-Json
    Add-Check 'learning:correction-schema-redacted' ([int]$correctionEntry.schemaVersion-eq2-and$correctionEntry.privacy-eq'redacted'-and-not$correctionEntry.containsSecrets-and-not$correctionEntry.containsDirectIdentifiers-and-not$correctionEntry.containsRawCommunications) 'v2-redacted-fixed-flags'
    Add-ExitCheck 'learning:v2-ledger-readable' (Invoke-Script (Join-Path $PSScriptRoot 'Get-MarketingCorrections.ps1') @('-LedgerPath',$correctionLedger,'-Format','Json'))
    Add-ExitCheck 'learning:reject-secret-correction' (Invoke-Script (Join-Path $PSScriptRoot 'Record-MarketingCorrection.ps1') @('-Category','process','-Source','incident','-Lesson','password: REDACTED','-LedgerPath',(Join-Path $tempRoot 'learning\bad-secret.jsonl'))) $false
    Add-ExitCheck 'learning:reject-direct-identifier' (Invoke-Script (Join-Path $PSScriptRoot 'Record-MarketingCorrection.ps1') @('-Category','process','-Source','incident','-Lesson','Call 555-123-4567 next time.','-LedgerPath',(Join-Path $tempRoot 'learning\bad-phone.jsonl'))) $false
    Add-ExitCheck 'learning:reject-actor-injection' (Invoke-Script (Join-Path $PSScriptRoot 'Record-MarketingDecision.ps1') @('-WorkItemId',$nkcdc.id,'-PredictionLane','automatic','-Decision','accept','-Actor','password: REDACTED','-LedgerPath',(Join-Path $tempRoot 'learning\bad-actor.jsonl'))) $false

    # Intake is retrievable, source-bound, recurrence-safe, and race guarded.
    $pendingResult=Invoke-Script (Join-Path $PSScriptRoot 'Get-PendingIntake.ps1') @('-AsJson');Add-ExitCheck 'intake:list-safe' $pendingResult;$pending=Read-JsonOutput $pendingResult
    $locatorsSafe=@($pending.items|Where-Object{$_.sourceLocator-notmatch'^agent-os-run:[A-Za-z0-9][A-Za-z0-9_-]{5,79}/task\.json$'}).Count-eq0
    Add-Check 'intake:retrievable-safe-locators' $locatorsSafe ("count={0}"-f$pending.count)
    Add-ExitCheck 'intake:sync-dry-run' (Invoke-Script (Join-Path $PSScriptRoot 'Sync-AgentOsIntake.ps1') @('-DryRun','-Quiet'))
    $faganPending=@($pending.items|Where-Object{$_.clientId-eq'fagan-painting'}|Select-Object -First 1)
    if($faganPending.Count-eq1){Add-ExitCheck 'intake:reject-unrelated-same-client-promotion' (Invoke-Script (Join-Path $PSScriptRoot 'Resolve-IntakeObservation.ps1') @('-IntakeId',$faganPending[0].intakeId,'-Action','promote','-WorkItemId','wi-20260715-0002','-ExpectedIndexGeneratedAtUtc',$pending.indexGeneratedAtUtc,'-WhatIf')) $false}else{Add-Check 'intake:reject-unrelated-same-client-promotion' $false 'no-fagan-fixture'}

    $intakeRoot=Join-Path $tempRoot 'intake-positive';[IO.Directory]::CreateDirectory((Join-Path $intakeRoot 'registry'))|Out-Null;[IO.Directory]::CreateDirectory((Join-Path $intakeRoot 'queue'))|Out-Null;[IO.Directory]::CreateDirectory((Join-Path $intakeRoot 'intake'))|Out-Null;[IO.Directory]::CreateDirectory((Join-Path $intakeRoot 'state'))|Out-Null;Copy-Item $registryPath (Join-Path $intakeRoot 'registry\clients.json')
    $intakeIndex=Get-Content -LiteralPath (Join-Path $projectRoot 'intake\index.json') -Raw -Encoding UTF8|ConvertFrom-Json;$targetIntake=Copy-JsonObject (@($intakeIndex.items|Where-Object{$_.clientId-eq'fagan-painting'}|Select-Object -First 1)[0]);$intakeIndex.items=@($targetIntake);$intakeIndex.generatedAtUtc='2026-07-16T07:05:00.000Z';Write-Utf8Json (Join-Path $intakeRoot 'intake\index.json') $intakeIndex;Write-Utf8Text (Join-Path $intakeRoot 'intake\summary.md') ''
    $boundQueue=Copy-JsonObject $queue;$boundItem=Copy-JsonObject (@($boundQueue.workItems|Where-Object{$_.id-eq'wi-20260715-0002'})[0]);$boundItem.source.locator=$targetIntake.sourceLocator;$boundQueue.workItems=@($boundItem);Write-Utf8Json (Join-Path $intakeRoot 'queue\work-items.json') $boundQueue
    $resolvePositive=Invoke-Script (Join-Path $PSScriptRoot 'Resolve-IntakeObservation.ps1') @('-CanonicalRoot',$intakeRoot,'-MutexName',('Global\CodexMarketingOsTest'+[guid]::NewGuid().ToString('N')),'-IntakeId',$targetIntake.intakeId,'-Action','promote','-WorkItemId',$boundItem.id,'-ExpectedIndexGeneratedAtUtc','2026-07-16T07:05:00.000Z');Add-ExitCheck 'intake:source-bound-promotion' $resolvePositive;$resolvedIndex=Get-Content -LiteralPath (Join-Path $intakeRoot 'intake\index.json') -Raw|ConvertFrom-Json;Add-Check 'intake:promotion-persisted' ($resolvedIndex.items[0].triageState-eq'resolved'-and$resolvedIndex.items[0].promotedWorkItemId-eq$boundItem.id) 'resolved-and-linked'

    $recRoot=Join-Path $tempRoot 'intake-recurrence';$runs=Join-Path $recRoot 'runs';[IO.Directory]::CreateDirectory((Join-Path $recRoot 'registry'))|Out-Null;Copy-Item $registryPath (Join-Path $recRoot 'registry\clients.json');$now=[DateTimeOffset]::UtcNow;$occurrences=@(@{id='run-old001';at=$now.AddHours(-100)},@{id='run-new001';at=$now.AddHours(-1)},@{id='run-new002';at=$now.AddMinutes(-30)});$seq=0;foreach ($occ in $occurrences){$seq++;$dir=Join-Path $runs $occ.id;[IO.Directory]::CreateDirectory($dir)|Out-Null;$task=[ordered]@{created_at=$occ.at.ToString('o');job_id=("job-$seq");event_key=("gmail:test-$seq");client='Fagan Painting';client_alias='Fagan';requested_output='Prepare the recurring weekly local report.';safe_execution='local_deliverable_only';route='reporting'};Write-Utf8Json (Join-Path $dir 'task.json') $task}
    $recSync=Invoke-Script (Join-Path $PSScriptRoot 'Sync-AgentOsIntake.ps1') @('-SourceRunsPath',$runs,'-CanonicalRoot',$recRoot,'-InitialLookbackHours','168','-SemanticDedupeHours','72','-MutexName',('Global\CodexMarketingOsRecurrence'+[guid]::NewGuid().ToString('N')),'-Quiet');Add-ExitCheck 'intake:recurrence-sync' $recSync;$recIndex=Get-Content -LiteralPath (Join-Path $recRoot 'intake\index.json') -Raw|ConvertFrom-Json;Add-Check 'intake:recurrence-retained-after-window' (@($recIndex.items).Count-eq2-and[int]$recIndex.lastRun.semanticDuplicates-eq1) ("items={0};suppressed={1}"-f@($recIndex.items).Count,$recIndex.lastRun.semanticDuplicates)

    # Access state is live, timestamp-fresh, and reviewed-code integrity bound.
    $coverageTemp=Join-Path $tempRoot 'access-registry.json';$coverageDoc=[ordered]@{clients=@([ordered]@{id='fagan-painting';systems=@([ordered]@{last_verified_at='2026-07-16T06:00:00Z';secret_ref='bw://item/00000000-0000-4000-8000-000000000001'},[ordered]@{last_verified_at='2025-01-01T00:00:00Z';secret_ref='bw://item/00000000-0000-4000-8000-000000000002'},[ordered]@{last_verified_at='not-a-date';secret_ref='bw://item/00000000-0000-4000-8000-000000000003'},[ordered]@{last_verified_at='2026-07-17T00:00:00Z';secret_ref='bw://item/00000000-0000-4000-8000-000000000004'})})};Write-Utf8Json $coverageTemp $coverageDoc
    $coverageResult=Invoke-Script (Join-Path $PSScriptRoot 'Update-AccessCoverage.ps1') @('-NoWrite','-AccessRegistryPath',$coverageTemp,'-AsOf','2026-07-16T07:00:00Z','-VerificationFreshnessDays','30');Add-ExitCheck 'access-coverage:timestamp-validation' $coverageResult;$coverage=Read-JsonOutput $coverageResult;Add-Check 'access-coverage:fresh-stale-invalid-separated' ([int]$coverage.summary.verifiedSystemCount-eq1-and[int]$coverage.summary.staleVerificationCount-eq1-and[int]$coverage.summary.invalidVerificationCount-eq2) ("fresh={0};stale={1};invalid={2}"-f$coverage.summary.verifiedSystemCount,$coverage.summary.staleVerificationCount,$coverage.summary.invalidVerificationCount)
    $fakeBridge=Join-Path $tempRoot 'fake-bridge.ps1';Write-Utf8Text $fakeBridge "param([string]`$Operation)`n'{\"state\":\"unlocked\"}'`n"
    $healthMismatch=Invoke-Script (Join-Path $PSScriptRoot 'Update-MarketingSystemHealth.ps1') @('-NoWrite','-CredentialBridgePath',$fakeBridge);Add-ExitCheck 'health:hash-mismatch-probe' $healthMismatch;$healthMismatchJson=Read-JsonOutput $healthMismatch;Add-Check 'health:refuse-unreviewed-bridge' (-not[bool]$healthMismatchJson.credentialBridge.integrityVerified-and$healthMismatchJson.credentialBridge.securityReview-eq'unverified-integrity-mismatch') ([string]$healthMismatchJson.credentialBridge.securityReview)
    $completedAccess=Join-Path $tempRoot 'completed-access-broker.ps1';Write-Utf8Text $completedAccess "param([string]`$Action)`n'{\"status\":\"valid\"}'`n"
    $healthCompleted=Invoke-Script (Join-Path $PSScriptRoot 'Update-MarketingSystemHealth.ps1') @('-NoWrite','-CredentialBridgePath',$fakeBridge,'-AccessBrokerScriptPath',$completedAccess,'-ExternalProbeTimeoutSeconds','5');Add-ExitCheck 'health:completed-external-probe' $healthCompleted;$healthCompletedJson=Read-JsonOutput $healthCompleted;Add-Check 'health:completed-probe-exit-preserved' ([bool]$healthCompletedJson.accessBroker.valid-and-not[bool]$healthCompletedJson.accessBroker.timedOut) 'valid-non-timeout-exit-zero'
    $hangingAccess=Join-Path $tempRoot 'hanging-access-broker.ps1';Write-Utf8Text $hangingAccess "param([string]`$Action)`n& powershell.exe -NoProfile -NonInteractive -Command 'Start-Sleep -Seconds 10'`n'{}'`n"
    $healthTimeout=Invoke-Script (Join-Path $PSScriptRoot 'Update-MarketingSystemHealth.ps1') @('-NoWrite','-CredentialBridgePath',$fakeBridge,'-AccessBrokerScriptPath',$hangingAccess,'-ExternalProbeTimeoutSeconds','1');Add-ExitCheck 'health:bounded-external-probe' $healthTimeout;$healthTimeoutJson=Read-JsonOutput $healthTimeout;Add-Check 'health:timeout-degrades-not-hangs' ([bool]$healthTimeoutJson.accessBroker.timedOut-and-not[bool]$healthTimeoutJson.accessBroker.valid-and$healthTimeoutJson.overall-eq'degraded') ([string]$healthTimeoutJson.overall)
    Add-ExitCheck 'health:live-probe' (Invoke-Script (Join-Path $PSScriptRoot 'Update-MarketingSystemHealth.ps1') @('-NoWrite'))
    Add-ExitCheck 'access-coverage:live-probe' (Invoke-Script (Join-Path $PSScriptRoot 'Update-AccessCoverage.ps1') @('-NoWrite'))

    Add-Check 'marketing-chief-agent' (Test-Path -LiteralPath 'C:\Users\dillo\.codex\agents\marketing_chief.toml') 'global-agent-definition'
    Add-Check 'voice-context' (Test-Path -LiteralPath (Join-Path $projectRoot 'context\DILLON_VOICE.md')) 'channel-voice-contract'
    Add-Check 'design-context' (Test-Path -LiteralPath (Join-Path $projectRoot 'context\DESIGN_STANDARD.md')) 'rendered-qa-contract'
}
catch{Add-Check 'test-harness-unhandled' $false $_.Exception.Message}
finally{Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue}

$checkArray=$checks.ToArray();$result=[pscustomobject][ordered]@{status=if($failed){'failed'}else{'passed'};checkedAt=[DateTimeOffset]::UtcNow.ToString('o');checkCount=$checks.Count;failedCount=@($checkArray|Where-Object{-not$_.passed}).Count;checks=$checkArray}
if($Detailed){$result|ConvertTo-Json -Depth 12}else{[pscustomobject]@{status=$result.status;checkedAt=$result.checkedAt;checkCount=$result.checkCount;failedCount=$result.failedCount}|ConvertTo-Json -Compress}
if($failed){exit 1}
