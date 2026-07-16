[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][ValidateSet('voice','design','routing','process','context','prediction')][string]$Category,
    [Parameter(Mandatory=$true)][ValidateSet('user_decision','observed_edit','verifier','incident','outcome')][string]$Source,
    [Parameter(Mandatory=$true)][string]$Lesson,
    [string]$ReplacementRule,
    [string]$ClientId,
    [string]$WorkItemId,
    [string]$EvidenceLocator,
    [ValidateSet('dillon','marketing-chief')][string]$Actor='marketing-chief',
    [string]$QueuePath,
    [string]$RegistryPath,
    [string]$LedgerPath
)

$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'MarketingOs.Common.ps1')
$projectRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if([string]::IsNullOrWhiteSpace($QueuePath)){$QueuePath=Join-Path $projectRoot 'queue\work-items.json'}
if([string]::IsNullOrWhiteSpace($RegistryPath)){$RegistryPath=Join-Path $projectRoot 'registry\clients.json'}
if([string]::IsNullOrWhiteSpace($LedgerPath)){$LedgerPath=Join-Path $projectRoot 'state\corrections.jsonl'}

if([string]::IsNullOrWhiteSpace($Lesson)-or$Lesson.Length-gt4000-or-not(Test-MarketingSafeText $Lesson)){throw 'Lesson is required, limited to 4000 characters, and must contain only redacted safe text.'}
if(-not[string]::IsNullOrWhiteSpace($ReplacementRule)-and($ReplacementRule.Length-gt4000-or-not(Test-MarketingSafeText $ReplacementRule))){throw 'ReplacementRule must be redacted safe text no longer than 4000 characters.'}
if(-not[string]::IsNullOrWhiteSpace($EvidenceLocator)-and-not(Test-MarketingSafeLocator $EvidenceLocator)){throw 'EvidenceLocator must be an approved opaque or canonical locator.'}
if(-not[string]::IsNullOrWhiteSpace($ClientId)-and$ClientId-notmatch'^[a-z0-9][a-z0-9-]{0,119}$'){throw 'ClientId format is invalid.'}
if(-not[string]::IsNullOrWhiteSpace($WorkItemId)-and$WorkItemId-notmatch'^wi-[A-Za-z0-9-]+$'){throw 'WorkItemId format is invalid.'}

$registry=Get-Content -LiteralPath $RegistryPath -Raw -Encoding UTF8|ConvertFrom-Json
$queue=Get-Content -LiteralPath $QueuePath -Raw -Encoding UTF8|ConvertFrom-Json
$resolvedClientId=if([string]::IsNullOrWhiteSpace($ClientId)){$null}else{$ClientId}
if(-not[string]::IsNullOrWhiteSpace($WorkItemId)){
    $items=@($queue.workItems|Where-Object{$_.id-eq$WorkItemId})
    if($items.Count-ne1){throw 'WorkItemId must resolve exactly once.'}
    $itemClient=[string]$items[0].clientId
    if(-not[string]::IsNullOrWhiteSpace($resolvedClientId)-and$resolvedClientId-ne$itemClient){throw 'ClientId does not match the work item.'}
    $resolvedClientId=$itemClient
}
if(-not[string]::IsNullOrWhiteSpace($resolvedClientId)){
    if(@($registry.clients|Where-Object{$_.id-eq$resolvedClientId-and$_.status-eq'active'}).Count-ne1){throw 'ClientId must resolve to exactly one active client.'}
}

$entry=[pscustomobject][ordered]@{
    schemaVersion=2
    correctionId=('mc-'+[DateTimeOffset]::UtcNow.ToString('yyyyMMddHHmmss')+'-'+[guid]::NewGuid().ToString('N').Substring(0,8))
    recordedAt=[DateTimeOffset]::UtcNow.ToString('o')
    category=$Category
    source=$Source
    clientId=$resolvedClientId
    workItemId=if([string]::IsNullOrWhiteSpace($WorkItemId)){$null}else{$WorkItemId}
    lesson=$Lesson.Trim()
    replacementRule=if([string]::IsNullOrWhiteSpace($ReplacementRule)){$null}else{$ReplacementRule.Trim()}
    evidenceLocator=if([string]::IsNullOrWhiteSpace($EvidenceLocator)){$null}else{$EvidenceLocator.Trim()}
    actor=$Actor
    privacy='redacted'
    containsSecrets=$false
    containsDirectIdentifiers=$false
    containsRawCommunications=$false
}

$directory=Split-Path -Parent $LedgerPath;if(-not(Test-Path -LiteralPath $directory)){[IO.Directory]::CreateDirectory($directory)|Out-Null}
$lockPath=$LedgerPath+'.lock';$lock=$null
try{
    $lock=[IO.File]::Open($lockPath,[IO.FileMode]::OpenOrCreate,[IO.FileAccess]::ReadWrite,[IO.FileShare]::None)
    $line=($entry|ConvertTo-Json -Compress -Depth 10)+[Environment]::NewLine
    $bytes=[Text.UTF8Encoding]::new($false).GetBytes($line)
    $stream=[IO.File]::Open($LedgerPath,[IO.FileMode]::Append,[IO.FileAccess]::Write,[IO.FileShare]::Read)
    try{$stream.Write($bytes,0,$bytes.Length);$stream.Flush($true)}finally{$stream.Dispose()}
}
finally{if($null-ne$lock){$lock.Dispose()};if(Test-Path -LiteralPath $lockPath){Remove-Item -LiteralPath $lockPath -Force -ErrorAction SilentlyContinue}}
[pscustomobject]@{status='recorded';correctionId=$entry.correctionId;category=$Category;ledger=$LedgerPath}|ConvertTo-Json -Compress
