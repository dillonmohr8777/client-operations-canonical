[CmdletBinding()]
param(
    [string]$CanonicalRoot,
    [string]$Repository = 'dillonmohr8777/client-operations-canonical',
    [string]$AuthorLogin = 'dillonmohr8777',
    [string]$BaseBranch = 'main',
    [ValidateRange(1, 50)]
    [int]$MaximumPullRequests = 20,
    [string]$FixturePath,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

if ([string]::IsNullOrWhiteSpace($CanonicalRoot)) {
    $CanonicalRoot = Split-Path -Parent $PSScriptRoot
}
$CanonicalRoot = [IO.Path]::GetFullPath($CanonicalRoot).TrimEnd('\')
$queuePath = Join-Path $CanonicalRoot 'queue\work-items.json'
$controlPath = Join-Path $CanonicalRoot 'CONTROL.md'
$registryPath = Join-Path $CanonicalRoot 'registry\clients.json'
$mutationPath = Join-Path $CanonicalRoot 'state\queue-mutations.jsonl'
$runtimeRoot = Join-Path $env:LOCALAPPDATA 'Codex\MarketingChief\CursorSlackIntake'
$statePath = Join-Path $runtimeRoot 'state.json'
$logPath = Join-Path $runtimeRoot 'events.jsonl'
$expectedWorkspaceId = 'T066HGS7N'
$expectedChannelId = 'D0BJEC2MM6V'
$expectedRequesterId = 'U0A6MD920MA'
$expectedCursorId = 'U0BJCELQYLS'

. (Join-Path $PSScriptRoot 'MarketingOs.Common.ps1')

function Read-JsonFile {
    param([Parameter(Mandatory = $true)][string]$Path)
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return $null }
    return Get-Content -LiteralPath $Path -Raw -Encoding UTF8 | ConvertFrom-Json
}

function Write-AtomicJson {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][object]$Value
    )
    $directory = Split-Path -Parent $Path
    if (-not (Test-Path -LiteralPath $directory -PathType Container)) {
        [IO.Directory]::CreateDirectory($directory) | Out-Null
    }
    $temporary = Join-Path $directory ('.' + [IO.Path]::GetFileName($Path) + '.' + [guid]::NewGuid().ToString('N') + '.tmp')
    $backup = Join-Path $directory ('.' + [IO.Path]::GetFileName($Path) + '.' + [guid]::NewGuid().ToString('N') + '.bak')
    try {
        [IO.File]::WriteAllText(
            $temporary,
            (($Value | ConvertTo-Json -Depth 30) + [Environment]::NewLine),
            [Text.UTF8Encoding]::new($false)
        )
        if (Test-Path -LiteralPath $Path -PathType Leaf) {
            [IO.File]::Replace($temporary, $Path, $backup, $true)
            Remove-Item -LiteralPath $backup -Force -ErrorAction SilentlyContinue
        }
        else {
            [IO.File]::Move($temporary, $Path)
        }
    }
    finally {
        Remove-Item -LiteralPath $temporary, $backup -Force -ErrorAction SilentlyContinue
    }
}

function Write-Event {
    param(
        [Parameter(Mandatory = $true)][string]$Event,
        [Parameter(Mandatory = $true)][string]$Status,
        [AllowNull()][string]$Reference
    )
    if ($DryRun) { return }
    if (-not (Test-Path -LiteralPath $runtimeRoot -PathType Container)) {
        [IO.Directory]::CreateDirectory($runtimeRoot) | Out-Null
    }
    $safeReference = if ([string]::IsNullOrWhiteSpace($Reference)) { $null } else {
        ([string]$Reference -replace '[^A-Za-z0-9._:/-]', '_').Substring(0, [Math]::Min(200, ([string]$Reference).Length))
    }
    $record = [pscustomobject][ordered]@{
        recordedAt = [DateTimeOffset]::UtcNow.ToString('o')
        event = $Event
        status = $Status
        reference = $safeReference
        containsSecrets = $false
    }
    [IO.File]::AppendAllText(
        $logPath,
        (($record | ConvertTo-Json -Compress) + [Environment]::NewLine),
        [Text.UTF8Encoding]::new($false)
    )
}

function Invoke-Gh {
    param([Parameter(Mandatory = $true)][string[]]$Arguments)
    $previousPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        $output = @(& gh @Arguments 2>$null)
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $previousPreference
    }
    [pscustomobject]@{ exitCode = $exitCode; output = @($output) }
}

function Invoke-Git {
    param([Parameter(Mandatory = $true)][string[]]$Arguments)
    $previousPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        $output = @(& git -C $CanonicalRoot @Arguments 2>$null)
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $previousPreference
    }
    [pscustomobject]@{ exitCode = $exitCode; output = @($output) }
}

function Test-CanonicalWriteReady {
    $guardedPaths = @(
        'queue/work-items.json',
        'CONTROL.md',
        'state/queue-mutations.jsonl'
    )
    $statusResult = Invoke-Git -Arguments (@('status', '--porcelain', '--') + $guardedPaths)
    if ($statusResult.exitCode -ne 0) { return [pscustomobject]@{ ready = $false; reason = 'git_status_failed' } }
    if (@($statusResult.output).Count -gt 0) { return [pscustomobject]@{ ready = $false; reason = 'canonical_paths_have_pending_changes' } }
    $fetchResult = Invoke-Git -Arguments @('fetch', 'origin', '--prune')
    if ($fetchResult.exitCode -ne 0) { return [pscustomobject]@{ ready = $false; reason = 'git_fetch_failed' } }
    $divergenceResult = Invoke-Git -Arguments @('rev-list', '--left-right', '--count', "HEAD...origin/$BaseBranch")
    $counts = ($divergenceResult.output -join ' ') -split '\s+'
    if ($divergenceResult.exitCode -ne 0 -or $counts.Count -lt 2) {
        return [pscustomobject]@{ ready = $false; reason = 'git_divergence_check_failed' }
    }
    if ([int]$counts[0] -ne 0 -or [int]$counts[1] -ne 0) {
        return [pscustomobject]@{ ready = $false; reason = 'canonical_branch_not_exactly_synced' }
    }
    $pullResult = Invoke-Git -Arguments @('pull', '--ff-only', 'origin', $BaseBranch)
    if ($pullResult.exitCode -ne 0) { return [pscustomobject]@{ ready = $false; reason = 'git_fast_forward_failed' } }
    return [pscustomobject]@{ ready = $true; reason = 'ready' }
}

function Publish-CanonicalRequest {
    param(
        [Parameter(Mandatory = $true)][string]$RequestRelativePath,
        [Parameter(Mandatory = $true)][string]$WorkItemId
    )
    $paths = @(
        $RequestRelativePath,
        'queue/work-items.json',
        'CONTROL.md',
        'state/queue-mutations.jsonl'
    )
    $addResult = Invoke-Git -Arguments (@('add', '--') + $paths)
    if ($addResult.exitCode -ne 0) { throw 'Failed to stage the exact Cursor Slack intake paths.' }
    $commitResult = Invoke-Git -Arguments @('commit', '-m', "Capture Cursor Slack request for $WorkItemId")
    if ($commitResult.exitCode -ne 0) { throw 'Failed to commit the Cursor Slack intake mutation.' }
    $pushResult = Invoke-Git -Arguments @('push', 'origin', "HEAD:$BaseBranch")
    if ($pushResult.exitCode -ne 0) { throw 'Failed to fast-forward the Cursor Slack intake mutation.' }
}

function Get-ActionClass {
    param(
        [Parameter(Mandatory = $true)][string]$Mode,
        [Parameter(Mandatory = $true)][string]$Instruction
    )
    if ($Instruction -match '(?i)\b(?:integrat(?:e|ed|ion)|connect|install|authorize|grant access|change permissions?)\b.{0,120}\b(?:Slack|Cursor|account|workspace|app|integration)\b') {
        return 'account_change'
    }
    if ($Instruction -match '(?i)\b(?:publish|post|go live)\b') { return 'publishing' }
    if ($Instruction -match '(?i)\bdeploy\b') { return 'deployment' }
    if ($Instruction -match '(?i)\b(?:spend|purchase|buy|pay|charge|raise budget|increase budget)\b') { return 'spend' }
    if ($Instruction -match '(?i)\b(?:delete|remove account)\b') { return 'destructive' }
    if ($Instruction -match '(?i)\b(?:MFA|CAPTCHA|one-time code|login code|provider consent|passkey)\b') { return 'human_authentication' }
    if ($Instruction -match '(?i)\b(?:decide|choose|approve)\b.{0,100}\b(?:budget|offer|contract|pricing|positioning)\b') { return 'business_decision' }
    if (Test-MarketingRiskyActionText $Instruction) { return 'external_delivery' }
    switch ($Mode) {
        'analyze' { return 'local_research' }
        'prepare' { return 'local_artifact' }
        'execute_safe' { return 'local_test' }
        'draft_for_approval' { return 'local_draft' }
        'monitor' { return 'read_only_verification' }
        default { throw 'The Cursor Slack request mode is unsupported.' }
    }
}

function Assert-ExactProperties {
    param(
        [Parameter(Mandatory = $true)][object]$Object,
        [Parameter(Mandatory = $true)][string[]]$Allowed,
        [Parameter(Mandatory = $true)][string]$Label
    )
    $actual = @($Object.PSObject.Properties.Name)
    foreach ($name in $actual) {
        if ($name -notin $Allowed) { throw "$Label contains an unsupported property." }
    }
    foreach ($name in $Allowed) {
        if ($name -eq 'dueAt' -or $name -eq 'testOnly') { continue }
        if ($name -notin $actual) { throw "$Label is missing a required property." }
    }
}

function ConvertTo-ValidatedRequest {
    param(
        [Parameter(Mandatory = $true)][object]$Candidate,
        [AllowNull()][object]$PullRequest
    )
    Assert-ExactProperties -Object $Candidate `
        -Allowed @('schemaVersion','requestId','source','clientId','title','instruction','mode','priority','dueAt','testOnly') `
        -Label 'Cursor Slack request'
    if ([int]$Candidate.schemaVersion -ne 1) { throw 'Cursor Slack request schema is unsupported.' }
    $requestId = [string]$Candidate.requestId
    $messageTsFromId = $null
    if ($requestId -match '^slack-(\d{10})-(\d{6})$') {
        $messageTsFromId = "$($Matches[1]).$($Matches[2])"
    }
    elseif ($requestId -notmatch '^cursor-slack-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$') {
        throw 'Cursor Slack request identifier is invalid.'
    }

    Assert-ExactProperties -Object $Candidate.source `
        -Allowed @('workspaceId','channelId','messageTs','requesterUserId','cursorUserId') `
        -Label 'Cursor Slack source'
    if (
        [string]$Candidate.source.workspaceId -cne $expectedWorkspaceId -or
        [string]$Candidate.source.channelId -cne $expectedChannelId -or
        [string]$Candidate.source.requesterUserId -cne $expectedRequesterId -or
        [string]$Candidate.source.cursorUserId -cne $expectedCursorId
    ) { throw 'Cursor Slack source identity does not match the allowlisted Dillon-to-Cursor route.' }
    $messageTs = $null
    if (-not [string]::IsNullOrWhiteSpace([string]$Candidate.source.messageTs)) {
        $messageTs = [string]$Candidate.source.messageTs
        if ($messageTs -notmatch '^\d{10}\.\d{6}$') { throw 'Cursor Slack message timestamp is invalid.' }
    }
    if ($null -ne $messageTsFromId -and $messageTs -cne $messageTsFromId) {
        throw 'Cursor Slack message timestamp does not match the request identifier.'
    }

    $clientId = [string]$Candidate.clientId
    if ($clientId -notmatch '^[a-z0-9][a-z0-9-]{0,79}$') { throw 'Cursor Slack client identifier is invalid.' }
    $title = ([string]$Candidate.title).Trim()
    $instruction = ([string]$Candidate.instruction).Trim()
    $mode = [string]$Candidate.mode
    $priority = [string]$Candidate.priority
    if ($title.Length -lt 4 -or $title.Length -gt 180 -or -not (Test-MarketingSafeText $title)) {
        throw 'Cursor Slack title is empty, too large, or unsafe.'
    }
    if ($instruction.Length -lt 8 -or $instruction.Length -gt 3000 -or -not (Test-MarketingSafeText $instruction)) {
        throw 'Cursor Slack instruction is empty, too large, or unsafe.'
    }
    if ($mode -notin @('analyze','prepare','execute_safe','draft_for_approval','monitor')) {
        throw 'Cursor Slack mode is unsupported.'
    }
    if ($priority -notin @('P0','P1','P2','P3')) { throw 'Cursor Slack priority is unsupported.' }

    $dueAt = $null
    if ($null -ne $Candidate.PSObject.Properties['dueAt'] -and -not [string]::IsNullOrWhiteSpace([string]$Candidate.dueAt)) {
        $parsedDue = [DateTimeOffset]::MinValue
        if (-not [DateTimeOffset]::TryParse([string]$Candidate.dueAt, [ref]$parsedDue)) { throw 'Cursor Slack dueAt is invalid.' }
        $dueAt = $parsedDue.ToString('o')
    }
    $testOnly = $false
    if ($null -ne $Candidate.PSObject.Properties['testOnly']) { $testOnly = [bool]$Candidate.testOnly }

    $registry = Read-JsonFile -Path $registryPath
    $matches = @($registry.clients | Where-Object { [string]$_.id -ceq $clientId })
    if ($matches.Count -ne 1 -or [string]$matches[0].status -cne 'active') {
        throw 'Cursor Slack request does not resolve to exactly one active registry client.'
    }

    $actionClass = Get-ActionClass -Mode $mode -Instruction $instruction
    $automatic = Test-MarketingAutomaticActionClass $actionClass
    [pscustomobject][ordered]@{
        schemaVersion = 1
        requestId = $requestId
        source = [pscustomobject][ordered]@{
            workspaceId = $expectedWorkspaceId
            channelId = $expectedChannelId
            messageTs = $messageTs
            requesterUserId = $expectedRequesterId
            cursorUserId = $expectedCursorId
            pullRequest = if ($null -eq $PullRequest) { $null } else { [int]$PullRequest.number }
        }
        clientId = $clientId
        title = $title
        instruction = $instruction
        mode = $mode
        priority = $priority
        dueAt = $dueAt
        testOnly = $testOnly
        actionClass = $actionClass
        automaticEligible = $automatic
        privacy = [pscustomobject][ordered]@{
            classification = 'redacted-owner-instruction'
            containsSecrets = $false
            containsDirectIdentifiers = $false
            containsRawCommunications = $false
        }
    }
}

function Get-PullRequestCandidate {
    $listResult = Invoke-Gh -Arguments @(
        'pr','list','--repo',$Repository,'--state','open','--limit',[string]$MaximumPullRequests,
        '--json','number,title,author,baseRefName,headRefOid,url,isDraft'
    )
    if ($listResult.exitCode -ne 0) { throw 'GitHub pull-request intake lookup failed.' }
    $parsedItems = (($listResult.output -join [Environment]::NewLine) | ConvertFrom-Json)
    $items = @($parsedItems | ForEach-Object { $_ })
    foreach ($item in @($items | Sort-Object number)) {
        if ([string]$item.title -notmatch '^\[Marketing Chief Intake\]') { continue }
        if ([string]$item.author.login -cne $AuthorLogin) { continue }
        if ([string]$item.baseRefName -cne $BaseBranch) { continue }
        if ([int]$item.number -in @($state.processedPullRequestNumbers)) { continue }
        return $item
    }
    return $null
}

function Get-RequestFromPullRequest {
    param([Parameter(Mandatory = $true)][object]$PullRequest)
    $viewResult = Invoke-Gh -Arguments @(
        'pr','view',[string]$PullRequest.number,'--repo',$Repository,
        '--json','number,files,author,baseRefName,headRefOid,title,url'
    )
    if ($viewResult.exitCode -ne 0) { throw 'Cursor Slack intake pull request could not be inspected.' }
    $view = ($viewResult.output -join [Environment]::NewLine) | ConvertFrom-Json
    if ([string]$view.author.login -cne $AuthorLogin -or [string]$view.baseRefName -cne $BaseBranch) {
        throw 'Cursor Slack intake pull request identity changed during validation.'
    }
    $files = @($view.files)
    if ($files.Count -ne 1) { throw 'Cursor Slack intake pull request must contain exactly one file.' }
    $file = $files[0]
    $path = ([string]$file.path).Replace('\','/')
    if (
        $path -notmatch '^intake/cursor-slack-requests/pending/(?:slack-\d{10}-\d{6}|cursor-slack-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\.json$' -or
        [int]$file.deletions -ne 0 -or [int]$file.additions -gt 80
    ) { throw 'Cursor Slack intake pull request contains an unsafe file change.' }

    $encodedPath = ($path -split '/' | ForEach-Object { [uri]::EscapeDataString($_) }) -join '/'
    $apiPath = "repos/$Repository/contents/${encodedPath}?ref=$([uri]::EscapeDataString([string]$view.headRefOid))"
    $contentResult = Invoke-Gh -Arguments @('api',$apiPath)
    if ($contentResult.exitCode -ne 0) { throw 'Cursor Slack intake request content could not be read.' }
    $contentEnvelope = ($contentResult.output -join [Environment]::NewLine) | ConvertFrom-Json
    if ([string]$contentEnvelope.encoding -cne 'base64' -or [int]$contentEnvelope.size -gt 12000) {
        throw 'Cursor Slack intake request content is too large or unsupported.'
    }
    $raw = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String(([string]$contentEnvelope.content -replace '\s','')))
    $candidate = $raw | ConvertFrom-Json
    $expectedFileName = ([string]$candidate.requestId) + '.json'
    if ([IO.Path]::GetFileName($path) -cne $expectedFileName) {
        throw 'Cursor Slack request file name does not match its request identifier.'
    }
    return [pscustomobject]@{ request = $candidate; pullRequest = $view }
}

foreach ($requiredPath in @($queuePath, $controlPath, $registryPath, $mutationPath)) {
    if (-not (Test-Path -LiteralPath $requiredPath -PathType Leaf)) {
        throw "Required Cursor Slack intake source is missing: $requiredPath"
    }
}

$state = Read-JsonFile -Path $statePath
if ($null -eq $state -or [int]$state.schemaVersion -ne 1) {
    $state = [pscustomobject][ordered]@{
        schemaVersion = 1
        updatedAt = $null
        processedRequestIds = @()
        processedPullRequestNumbers = @()
        lastStatus = 'new'
        lastReference = $null
    }
}
if ($null -eq $state.PSObject.Properties['processedPullRequestNumbers']) {
    Add-Member -InputObject $state -MemberType NoteProperty -Name processedPullRequestNumbers -Value @()
}

try {
    $pullRequest = $null
    if (-not [string]::IsNullOrWhiteSpace($FixturePath)) {
        if (-not $DryRun) { throw 'FixturePath is available only in DryRun mode.' }
        $candidate = Read-JsonFile -Path ([IO.Path]::GetFullPath($FixturePath))
        if ($null -eq $candidate) { throw 'Cursor Slack intake fixture is unavailable.' }
    }
    else {
        if ($null -eq (Get-Command gh -ErrorAction SilentlyContinue)) { throw 'GitHub CLI is unavailable.' }
        $pullRequest = Get-PullRequestCandidate
        if ($null -eq $pullRequest) {
            $state.updatedAt = [DateTimeOffset]::UtcNow.ToString('o')
            $state.lastStatus = 'idle'
            $state.lastReference = $null
            if (-not $DryRun) { Write-AtomicJson -Path $statePath -Value $state }
            [pscustomobject][ordered]@{
                status = 'idle'
                imported = $false
                containsSecrets = $false
            } | ConvertTo-Json -Compress
            exit 0
        }
        $fetched = Get-RequestFromPullRequest -PullRequest $pullRequest
        $candidate = $fetched.request
        $pullRequest = $fetched.pullRequest
    }

    $request = ConvertTo-ValidatedRequest -Candidate $candidate -PullRequest $pullRequest
    if ([string]$request.requestId -in @($state.processedRequestIds)) {
        if (-not $DryRun -and $null -ne $pullRequest) {
            $state.processedPullRequestNumbers = @($state.processedPullRequestNumbers) + [int]$pullRequest.number
            $state.processedPullRequestNumbers = @($state.processedPullRequestNumbers | Select-Object -Unique | Select-Object -Last 500)
            $state.updatedAt = [DateTimeOffset]::UtcNow.ToString('o')
            $state.lastStatus = 'duplicate'
            $state.lastReference = [string]$request.requestId
            Write-AtomicJson -Path $statePath -Value $state
        }
        [pscustomobject][ordered]@{
            status = 'duplicate'
            requestId = [string]$request.requestId
            imported = $false
            containsSecrets = $false
        } | ConvertTo-Json -Compress
        exit 0
    }

    $queue = Read-JsonFile -Path $queuePath
    $dedupeKey = "cursor-slack:$([string]$request.requestId)"
    $existing = @($queue.workItems | Where-Object { [string]$_.dedupeKey -ceq $dedupeKey })
    if ($existing.Count -gt 1) { throw 'Multiple canonical work items claim the Cursor Slack request.' }
    if ($existing.Count -eq 1) {
        $state.processedRequestIds = @($state.processedRequestIds) + [string]$request.requestId
        if ($null -ne $pullRequest) {
            $state.processedPullRequestNumbers = @($state.processedPullRequestNumbers) + [int]$pullRequest.number
            $state.processedPullRequestNumbers = @($state.processedPullRequestNumbers | Select-Object -Unique | Select-Object -Last 500)
        }
        $state.updatedAt = [DateTimeOffset]::UtcNow.ToString('o')
        $state.lastStatus = 'already-imported'
        $state.lastReference = [string]$request.requestId
        if (-not $DryRun) { Write-AtomicJson -Path $statePath -Value $state }
        [pscustomobject][ordered]@{
            status = 'already-imported'
            requestId = [string]$request.requestId
            workItemId = [string]$existing[0].id
            imported = $false
            containsSecrets = $false
        } | ConvertTo-Json -Compress
        exit 0
    }

    if ($DryRun -or [bool]$request.testOnly) {
        if (-not $DryRun -and [bool]$request.testOnly -and $null -ne $pullRequest) {
            $state.processedRequestIds = @($state.processedRequestIds) + [string]$request.requestId
            $state.processedRequestIds = @($state.processedRequestIds | Select-Object -Unique | Select-Object -Last 500)
            $state.processedPullRequestNumbers = @($state.processedPullRequestNumbers) + [int]$pullRequest.number
            $state.processedPullRequestNumbers = @($state.processedPullRequestNumbers | Select-Object -Unique | Select-Object -Last 500)
            $state.updatedAt = [DateTimeOffset]::UtcNow.ToString('o')
            $state.lastStatus = 'test-validated'
            $state.lastReference = [string]$request.requestId
            Write-AtomicJson -Path $statePath -Value $state
        }
        [pscustomobject][ordered]@{
            status = if ([bool]$request.testOnly) { 'test-validated' } else { 'would-import' }
            requestId = [string]$request.requestId
            clientId = [string]$request.clientId
            actionClass = [string]$request.actionClass
            automaticEligible = [bool]$request.automaticEligible
            imported = $false
            containsSecrets = $false
        } | ConvertTo-Json -Compress
        exit 0
    }

    $writeReady = Test-CanonicalWriteReady
    if (-not $writeReady.ready) {
        Write-Event -Event 'request' -Status 'deferred' -Reference ([string]$writeReady.reason)
        [pscustomobject][ordered]@{
            status = 'deferred'
            reason = [string]$writeReady.reason
            requestId = [string]$request.requestId
            imported = $false
            containsSecrets = $false
        } | ConvertTo-Json -Compress
        exit 0
    }

    $queue = Read-JsonFile -Path $queuePath
    $requestRelativePath = "intake/cursor-slack-requests/$([string]$request.requestId).json"
    $requestPath = Join-Path $CanonicalRoot $requestRelativePath.Replace('/','\')
    if (Test-Path -LiteralPath $requestPath -PathType Leaf) { throw 'Cursor Slack request source already exists without a queue binding.' }
    Write-AtomicJson -Path $requestPath -Value $request

    $workItemArgs = @{
        Client = [string]$request.clientId
        DedupeKey = $dedupeKey
        Title = [string]$request.title
        RequestedOutcome = [string]$request.instruction
        SourceType = 'slack'
        SourceLocator = $requestRelativePath
        SourceSummary = 'Authenticated Dillon-authored Slack request relayed by Cursor through an owner-authored private GitHub pull request.'
        Priority = [string]$request.priority
        PriorityRationale = "Owner-set $([string]$request.priority) priority in the allowlisted Cursor Slack intake route."
        NextAction = [string]$request.instruction
        ActionClass = [string]$request.actionClass
        DefinitionOfDone = @(
            'Complete the requested local outcome and record allowlisted evidence.',
            'Preserve the exact active client route and exclude raw communications, direct identifiers, and secrets.',
            'Keep sending, publishing, deployment, spend, account changes, destructive actions, and human authentication pending explicit approval.'
        )
        ApprovalTier = if ([bool]$request.automaticEligible) { 'automatic' } else { 'explicit' }
        ApprovalAction = if ([bool]$request.automaticEligible) {
            'Local reversible preparation only. Any consequential external action remains separately approval-gated.'
        }
        else {
            'Explicit owner approval is required before the classified consequential action can execute.'
        }
        ExpectedQueueRevision = [int]$queue.revision
    }
    if (-not [string]::IsNullOrWhiteSpace([string]$request.dueAt)) {
        $workItemArgs.DueAt = [string]$request.dueAt
    }
    try {
        $createdOutput = & (Join-Path $PSScriptRoot 'New-MarketingWorkItem.ps1') @workItemArgs
        $created = (($createdOutput -join [Environment]::NewLine) | ConvertFrom-Json)
        if ([string]::IsNullOrWhiteSpace([string]$created.workItemId)) {
            throw 'Canonical writer returned no work-item identifier.'
        }
        Publish-CanonicalRequest -RequestRelativePath $requestRelativePath -WorkItemId ([string]$created.workItemId)
    }
    catch {
        if (Test-Path -LiteralPath $requestPath -PathType Leaf) {
            $tracked = Invoke-Git -Arguments @('ls-files', '--error-unmatch', '--', $requestRelativePath)
            if ($tracked.exitCode -ne 0) { Remove-Item -LiteralPath $requestPath -Force -ErrorAction SilentlyContinue }
        }
        throw
    }

    $state.processedRequestIds = @($state.processedRequestIds) + [string]$request.requestId
    $state.processedRequestIds = @($state.processedRequestIds | Select-Object -Last 500)
    if ($null -ne $pullRequest) {
        $state.processedPullRequestNumbers = @($state.processedPullRequestNumbers) + [int]$pullRequest.number
        $state.processedPullRequestNumbers = @($state.processedPullRequestNumbers | Select-Object -Unique | Select-Object -Last 500)
    }
    $state.updatedAt = [DateTimeOffset]::UtcNow.ToString('o')
    $state.lastStatus = 'imported'
    $state.lastReference = [string]$created.workItemId
    Write-AtomicJson -Path $statePath -Value $state
    Write-Event -Event 'request' -Status 'imported' -Reference ([string]$created.workItemId)

    [pscustomobject][ordered]@{
        status = 'imported'
        requestId = [string]$request.requestId
        workItemId = [string]$created.workItemId
        clientId = [string]$request.clientId
        actionClass = [string]$request.actionClass
        imported = $true
        containsSecrets = $false
    } | ConvertTo-Json -Compress
}
catch {
    Write-Event -Event 'request' -Status 'failed' -Reference $_.Exception.GetType().Name
    throw
}
