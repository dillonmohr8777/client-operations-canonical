[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$RequestPath,
    [ValidateSet('Plain','Json')][string]$Format='Plain'
)

$ErrorActionPreference='Stop'
if(-not(Test-Path -LiteralPath $RequestPath -PathType Leaf)){throw "Request not found: $RequestPath"}
$request=Get-Content -LiteralPath $RequestPath -Raw -Encoding UTF8|ConvertFrom-Json
$contract=[ordered]@{
    schemaVersion=[int]$request.schemaVersion
    requestId=[string]$request.requestId
    clientId=[string]$request.clientId
    source=$request.source
    triggerClass=[string]$request.triggerClass
    platforms=@($request.platforms|Sort-Object)
    locations=@($request.locations|Sort-Object key)
    objective=[string]$request.objective
    offer=$request.offer
    landingPage=$request.landingPage
    tracking=$request.tracking
    budget=$request.budget
    schedule=$request.schedule
    accountRefs=@($request.accountRefs|Sort-Object)
    authorityRef=[string]$request.authorityRef
    currentEvidenceAt=[string]$request.currentEvidenceAt
}
$json=$contract|ConvertTo-Json -Compress -Depth 30
$bytes=[Text.Encoding]::UTF8.GetBytes($json)
$sha=[Security.Cryptography.SHA256]::Create()
try{$hash=([BitConverter]::ToString($sha.ComputeHash($bytes))).Replace('-','').ToLowerInvariant()}finally{$sha.Dispose()}
if($Format-eq'Plain'){$hash}else{[pscustomobject][ordered]@{schemaVersion=1;requestId=[string]$request.requestId;fingerprint=$hash;containsSecrets=$false;containsDirectIdentifiers=$false}|ConvertTo-Json -Compress}
