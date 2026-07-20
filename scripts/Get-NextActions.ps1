[CmdletBinding()]
param(
    [string]$QueuePath,
    [string]$RegistryPath,
    [ValidateSet('Json','Markdown')][string]$Format='Markdown',
    [string]$AsOf,
    [string]$FeedbackPath,
    [string]$PortfolioPriorityPath
)

$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'MarketingOs.Common.ps1')
if([string]::IsNullOrWhiteSpace($QueuePath)){$QueuePath=Join-Path $PSScriptRoot '..\queue\work-items.json'}
if([string]::IsNullOrWhiteSpace($RegistryPath)){$RegistryPath=Join-Path $PSScriptRoot '..\registry\clients.json'}
if([string]::IsNullOrWhiteSpace($FeedbackPath)){$FeedbackPath=Join-Path $PSScriptRoot '..\state\prediction-outcomes.jsonl'}
if([string]::IsNullOrWhiteSpace($PortfolioPriorityPath)){$PortfolioPriorityPath=Join-Path $PSScriptRoot '..\state\portfolio-priorities.json'}

function Get-PropertyValue{param($Object,[string]$Name,$Default=$null);if($null-ne$Object-and$Object.PSObject.Properties.Name-contains$Name){return $Object.$Name};return $Default}
function Get-PriorityWeight{param([string]$Level);switch($Level){'P0'{100}'P1'{75}'P2'{50}'P3'{25}default{0}}}
function Get-PortfolioTierWeight{param([string]$Tier);switch($Tier){'critical'{80}'strategic'{40}'standard'{15}'maintenance'{0}default{0}}}
function Get-StatusWeight{param([string]$Status);switch($Status){'in_progress'{35}'verification'{32}'ready'{28}'needs_approval'{24}'blocked'{15}'triaged'{8}'captured'{4}default{0}}}
function Get-DueScore{
    param($DueAt,[DateTimeOffset]$Now)
    if([string]::IsNullOrWhiteSpace([string]$DueAt)){return [pscustomobject]@{score=0;label='no evidenced deadline'}}
    try{$due=[DateTimeOffset]::Parse([string]$DueAt)}catch{return [pscustomobject]@{score=0;label='invalid due date'}}
    $hours=($due-$Now).TotalHours
    if($hours-lt0){return [pscustomobject]@{score=50;label='overdue'}}
    if($hours-le24){return [pscustomobject]@{score=40;label='due within 24 hours'}}
    if($hours-le72){return [pscustomobject]@{score=25;label='due within 3 days'}}
    if($hours-le168){return [pscustomobject]@{score=10;label='due within 7 days'}}
    return [pscustomobject]@{score=0;label=('due '+$due.ToString('yyyy-MM-dd HH:mm zzz'))}
}
function Test-FreshDate{param($Value,[DateTimeOffset]$Now,[int]$Days=14);try{$date=[DateTimeOffset]::Parse([string]$Value);return $date-le$Now-and($Now-$date).TotalDays-le$Days}catch{return $false}}
function Get-AutomaticEligibility{
    param($Item,[DateTimeOffset]$Now,$RegistryMap)
    $reasons=New-Object System.Collections.Generic.List[string]
    $clientId=[string](Get-PropertyValue $Item 'clientId' '')
    if([string]::IsNullOrWhiteSpace($clientId)-or-not$RegistryMap.ContainsKey($clientId)-or[string]$RegistryMap[$clientId].status-ne'active'){$reasons.Add('client registry route is not exact and active')}
    $routing=Get-PropertyValue $Item 'routing' $null
    if([string](Get-PropertyValue $routing 'status' '')-ne'resolved'-or[string](Get-PropertyValue $routing 'registryStatus' '')-ne'active'){$reasons.Add('work-item routing is not resolved and active')}
    if(-not(Test-FreshDate (Get-PropertyValue $routing 'verifiedAt' $null) $Now)){$reasons.Add('routing verification is older than 14 days or invalid')}
    $evidence=Get-PropertyValue $Item 'evidence' $null
    if([string](Get-PropertyValue $evidence 'freshness' '')-ne'current'-or-not(Test-FreshDate (Get-PropertyValue $evidence 'asOf' $null) $Now)){$reasons.Add('evidence is stale or invalid')}
    $evidenceRefs = @(Get-PropertyValue $evidence 'refs' ([object[]]@()))
    if ($evidenceRefs.Count -lt 1) { $reasons.Add('evidence references are missing') }
    if ([string](Get-PropertyValue $Item 'lane' '') -notin @('normal','emergency')) { $reasons.Add('work-item WIP lane is invalid') }
    $execution=Get-PropertyValue $Item 'execution' $null;$actionClass=[string](Get-PropertyValue $execution 'actionClass' '')
    if(-not(Test-MarketingAutomaticActionClass $actionClass)){$reasons.Add('action class is approval-gated')}
    if(-not[bool](Get-PropertyValue $execution 'automaticEligible' $false)){$reasons.Add('automatic eligibility is false')}
    if([bool](Get-PropertyValue $execution 'externalAction' $true)){$reasons.Add('external action is true')}
    if(-not[bool](Get-PropertyValue $execution 'reversible' $false)){$reasons.Add('action is not reversible')}
    if(Test-MarketingRiskyActionText([string](Get-PropertyValue $Item 'nextAction' ''))){$reasons.Add('next action contains gated action language')}
    $approval=Get-PropertyValue $Item 'approval' $null
    $approvalTier=[string](Get-PropertyValue $approval 'tier' '')
    $approvalStatus=[string](Get-PropertyValue $approval 'status' '')
    if($approvalTier-ne'automatic'-or$approvalStatus-ne'not_required'){$reasons.Add('approval state is not exactly automatic and not_required')}
    return [pscustomobject]@{ eligible = ($reasons.Count -eq 0); reasons = @($reasons); actionClass = $actionClass }
}
function Format-Choice{param($Choice,[string]$EmptyText);if($null-eq$Choice){return $EmptyText};return ('**{0}** (`{1}`, score {2}): {3} Why: {4}.'-f$Choice.title,$Choice.workItemId,$Choice.score,$Choice.nextAction,$Choice.why)}

if(-not(Test-Path -LiteralPath $QueuePath -PathType Leaf)){throw "Queue not found: $QueuePath"}
if(-not(Test-Path -LiteralPath $RegistryPath -PathType Leaf)){throw "Registry not found: $RegistryPath"}
$queue=Get-Content -LiteralPath $QueuePath -Raw -Encoding UTF8|ConvertFrom-Json
$registry=Get-Content -LiteralPath $RegistryPath -Raw -Encoding UTF8|ConvertFrom-Json
$registryMap = @{}
foreach ($client in @($registry.clients)) { $registryMap[[string]$client.id] = $client }
$portfolioMap = @{}
$portfolioPriorities = $null
if(Test-Path -LiteralPath $PortfolioPriorityPath -PathType Leaf){
    $portfolioPriorities=Get-Content -LiteralPath $PortfolioPriorityPath -Raw -Encoding UTF8|ConvertFrom-Json
    if([int]$portfolioPriorities.schemaVersion-ne1){throw 'Unsupported portfolio-priority schema.'}
    $seenPortfolioIds=@{};$seenActiveRanks=@{}
    foreach($entry in @($portfolioPriorities.entries)){
        $entryClientId=[string]$entry.clientId
        if([string]::IsNullOrWhiteSpace($entryClientId)-or-not$registryMap.ContainsKey($entryClientId)){throw "Portfolio priority has an unknown client route: $entryClientId"}
        if($seenPortfolioIds.ContainsKey($entryClientId)){throw "Portfolio priority has a duplicate client route: $entryClientId"};$seenPortfolioIds[$entryClientId]=$true
        $registryStatus=[string]$registryMap[$entryClientId].status;$tier=[string]$entry.tier
        if($tier-notin@('critical','strategic','standard','maintenance','excluded')){throw "Portfolio priority has an invalid tier: $entryClientId"}
        if($registryStatus-eq'active'){
            if([string]$entry.routeStatus-ne'resolved'-or-not[bool]$entry.activeWorkEligible-or$tier-eq'excluded'){throw "Active client has an ineligible portfolio-priority route: $entryClientId"}
            $rank=[int]$entry.rank;if($rank-lt1-or$seenActiveRanks.ContainsKey($rank)){throw "Active portfolio rank is invalid or duplicated: $entryClientId"};$seenActiveRanks[$rank]=$true
            $portfolioMap[$entryClientId]=$entry
        }
        elseif([bool]$entry.activeWorkEligible-or$tier-ne'excluded'-or$null-ne$entry.rank){throw "Inactive or quarantined client is portfolio-eligible: $entryClientId"}
    }
    if($seenPortfolioIds.Count-ne$registryMap.Count){throw 'Portfolio priorities must contain exactly one entry for every canonical client.'}
}
$now=if([string]::IsNullOrWhiteSpace($AsOf)){[DateTimeOffset]::UtcNow}else{[DateTimeOffset]::Parse($AsOf)}
$activeStatuses=@($queue.wipPolicy.activeStatuses)
$normalActive=@($queue.workItems|Where-Object{$_.lane-eq'normal'-and$_.status-in$activeStatuses}).Count
$emergencyActive=@($queue.workItems|Where-Object{$_.lane-eq'emergency'-and$_.status-in$activeStatuses}).Count
$normalFull=$normalActive-ge[int]$queue.wipPolicy.normalLimit;$emergencyFull=$emergencyActive-ge[int]$queue.wipPolicy.emergencyLimit
$inactiveStatuses=@('done','cancelled','deferred','executed','observed')

$recommendations=@()
foreach ($item in @($queue.workItems)) {
    $priority=Get-PropertyValue $item 'priority' $null;$priorityLevel=[string](Get-PropertyValue $priority 'level' '');$status=[string]$item.status
    $due=Get-DueScore (Get-PropertyValue $item 'dueAt' $null) $now;$confidence=[double](Get-PropertyValue $item 'confidence' 0)
    $freshness=[string](Get-PropertyValue (Get-PropertyValue $item 'evidence' $null) 'freshness' '')
    $clientId=[string]$item.clientId;$portfolioEntry=if($portfolioMap.ContainsKey($clientId)){$portfolioMap[$clientId]}else{$null};$portfolioTier=if($null-eq$portfolioEntry){$null}else{[string]$portfolioEntry.tier};$portfolioRank=if($null-eq$portfolioEntry){$null}else{[int]$portfolioEntry.rank};$portfolioWeight=Get-PortfolioTierWeight $portfolioTier
    $score=(Get-PriorityWeight $priorityLevel)+(Get-StatusWeight $status)+$due.score+$portfolioWeight+$(if($freshness-eq'current'){5}else{0})+[math]::Round(([math]::Max(0,[math]::Min(1,$confidence))*10),2)
    $approval=Get-PropertyValue $item 'approval' $null;$approvalPending=[string](Get-PropertyValue $approval 'status' '')-eq'pending';$approvalExplicit=[string](Get-PropertyValue $approval 'tier' '')-eq'explicit'
    $eligibility=Get-AutomaticEligibility $item $now $registryMap;$lane='none'
    if($status-in$inactiveStatuses){$lane='none'}
    elseif($status-eq'needs_approval'-or$approvalPending){$lane='decision'}
    elseif($status-eq'blocked'){$lane='unblock'}
    elseif($status-in@('ready','in_progress','verification')){
        if($eligibility.eligible){$lane='automatic'}elseif($approvalExplicit-or$eligibility.actionClass-in@('external_delivery','publishing','deployment','spend','account_change','destructive','human_authentication','business_decision')){$lane='decision'}else{$lane='unblock'}
    }
    $workLane=[string](Get-PropertyValue $item 'lane' 'normal')
    if($lane-eq'automatic'-and$status-notin$activeStatuses-and(($workLane-eq'normal'-and$normalFull)-or($workLane-eq'emergency'-and$emergencyFull))){$lane='none'}
    $why=New-Object System.Collections.Generic.List[string];if($priorityLevel){$why.Add($priorityLevel)};if($null-ne$portfolioEntry){$why.Add(('portfolio rank {0} ({1})'-f$portfolioRank,$portfolioTier))};if($due.label){$why.Add($due.label)};if($freshness-eq'current'){$why.Add('current evidence')};if($status){$why.Add('status '+$status)}
    if(-not$eligibility.eligible-and$lane-in@('decision','unblock')){$why.Add(($eligibility.reasons-join '; '))}
    $recommendations+=[pscustomobject][ordered]@{lane=$lane;workLane=$workLane;workItemId=[string]$item.id;workItemVersion=[int]$item.version;clientId=[string]$item.clientId;title=[string]$item.title;status=$status;priority=$priorityLevel;portfolioTier=$portfolioTier;portfolioRank=$portfolioRank;portfolioWeight=$portfolioWeight;score=[math]::Round($score,2);dueAt=$item.dueAt;nextAction=[string]$item.nextAction;replacementAction=$null;why=($why-join', ');confidence=$confidence;actionClass=$eligibility.actionClass;automaticEligibilityReasons=@($eligibility.reasons);learnedSampleCount=0;learnedAdjustment=0;feedbackDecision=$null;feedbackAdjustment=0;suppressedByFeedback=$false}
}

$feedbackEntries = @()
if (Test-Path -LiteralPath $FeedbackPath -PathType Leaf) {
    foreach ($line in @(Get-Content -LiteralPath $FeedbackPath -Encoding UTF8)) {
        if (-not [string]::IsNullOrWhiteSpace($line)) {
            try { $entry = $line | ConvertFrom-Json; $feedbackEntries += $entry } catch {}
        }
    }
}
foreach ($recommendation in $recommendations) {
    $learned = @($feedbackEntries | Where-Object {
        [string](Get-PropertyValue $_ 'clientId' '') -ceq [string]$recommendation.clientId -and
        [string](Get-PropertyValue $_ 'predictionLane' '') -ceq [string]$recommendation.lane -and
        [string](Get-PropertyValue $_ 'actionClass' '') -ceq [string]$recommendation.actionClass -and
        [string](Get-PropertyValue $_ 'workItemId' '') -cne [string]$recommendation.workItemId -and
        [string](Get-PropertyValue $_ 'decision' '') -in @('accept','modify','defer','reject')
    })
    if ($learned.Count -ge 3) {
        $priorTotal = 0
        foreach ($entry in $learned) {
            $priorTotal += switch ([string]$entry.decision) { 'accept' { 3 } 'modify' { 1 } 'defer' { -2 } 'reject' { -4 } default { 0 } }
        }
        $priorAdjustment = [math]::Max(-10, [math]::Min(10, $priorTotal))
        $recommendation.learnedSampleCount = $learned.Count
        $recommendation.learnedAdjustment = $priorAdjustment
        $recommendation.score = [math]::Round(([double]$recommendation.score + $priorAdjustment),2)
        $recommendation.why += (', learned prior ' + $priorAdjustment + ' from ' + $learned.Count + ' comparable outcomes')
    }
    $latest = @($feedbackEntries | Where-Object {
        [string](Get-PropertyValue $_ 'workItemId' '') -eq $recommendation.workItemId -and
        [string](Get-PropertyValue $_ 'predictionLane' '') -eq $recommendation.lane -and
        [int](Get-PropertyValue $_ 'workItemVersion' 0) -eq $recommendation.workItemVersion -and
        [string](Get-PropertyValue $_ 'predictedAction' '') -ceq [string]$recommendation.nextAction
    } | Sort-Object @{Expression={Get-PropertyValue $_ 'recordedAt' ''};Descending=$true} | Select-Object -First 1)
    if ($latest.Count -eq 1) {
        $adjustment = switch ([string]$latest[0].decision) { 'accept' { 10 } 'modify' { 0 } 'defer' { -8 } 'reject' { -20 } default { 0 } }
        $recommendation.feedbackDecision = [string]$latest[0].decision; $recommendation.feedbackAdjustment = $adjustment
        $recommendation.score = [math]::Round(([double]$recommendation.score + $adjustment),2); $recommendation.why += (', last prediction ' + $recommendation.feedbackDecision)
        if ($recommendation.feedbackDecision -in @('defer','reject')) {
            $recommendation.lane = 'none'; $recommendation.suppressedByFeedback = $true
            $recommendation.why += '; suppressed until the work-item version or predicted action changes'
        }
        elseif ($recommendation.feedbackDecision -eq 'modify') {
            $replacement = [string]$latest[0].replacementAction
            $recommendation.replacementAction = if ([string]::IsNullOrWhiteSpace($replacement)) { $null } else { $replacement.Trim() }
            $recommendation.lane = 'none'; $recommendation.suppressedByFeedback = $true
            $recommendation.why += '; replacement is held until Update-MarketingQueue reclassifies it'
        }
    }
}
function Select-Lane{param([string]$Lane);return @($recommendations|Where-Object{$_.lane-eq$Lane}|Sort-Object @{Expression='score';Descending=$true},@{Expression={if($null-eq$_.portfolioRank){[int]::MaxValue}else{[int]$_.portfolioRank}};Descending=$false},@{Expression='dueAt';Descending=$false},@{Expression='workItemId';Descending=$false}|Select-Object -First 1)[0]}
$automatic = Select-Lane 'automatic'; $decision = Select-Lane 'decision'; $unblock = Select-Lane 'unblock'
$result=[pscustomobject][ordered]@{schemaVersion=3;generatedAt=$now.ToString('o');queueRevision=[int]$queue.revision;policy=[pscustomobject]@{automatic='Only fresh, exact-routed, same-client, reversible local classes without risky action wording or an approval gate.';decision='A human approval or business choice is required.';unblock='Execution cannot continue until the named dependency, stale evidence, route, or human gate changes.';portfolio='Portfolio value changes ordering only after routing and lane eligibility. It never bypasses due dates, evidence, approval, safety, or WIP gates.';wip=("normal $normalActive/$($queue.wipPolicy.normalLimit); emergency $emergencyActive/$($queue.wipPolicy.emergencyLimit)");feedback='Exact feedback is bound to the work-item version and predicted action. Comparable outcomes affect future same-client, same-lane, same-action-class predictions only after three cross-item samples. Defer and reject suppress the exact item until its state changes; modify is held until the queue reclassifies the replacement.'};nextAutomatic=$automatic;nextDecision=$decision;nextUnblock=$unblock;ranked=@($recommendations|Where-Object{$_.lane-ne'none'}|Sort-Object @{Expression='score';Descending=$true},@{Expression={if($null-eq$_.portfolioRank){[int]::MaxValue}else{[int]$_.portfolioRank}};Descending=$false},@{Expression='workItemId';Descending=$false});suppressed=@($recommendations|Where-Object{$_.suppressedByFeedback});pendingModifications=@($recommendations|Where-Object{$_.feedbackDecision-eq'modify'-and$_.suppressedByFeedback})}
$markdown=@"
<!-- marketing-chief:predictions:start -->
## Predicted next actions

**Next automatic action:** $(Format-Choice $automatic 'No automatic action is currently eligible.')

**Next Dillon decision:** $(Format-Choice $decision 'No Dillon decision is currently waiting.')

**Next unblock:** $(Format-Choice $unblock 'No blocked work item currently needs an unblock.')
<!-- marketing-chief:predictions:end -->
"@
if($Format-eq'Json'){$result|ConvertTo-Json -Depth 20}else{$markdown.TrimEnd()}
