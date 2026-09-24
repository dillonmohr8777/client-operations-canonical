[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-z0-9][a-z0-9-]{2,79}$')]
    [string]$BatchId,

    [string[]]$ClientIds = @(
        'fagan-painting',
        'onsite-concrete-landscape',
        'pro-fence-deck',
        'hope-wellness-center'
    )
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

$root = Split-Path -Parent $PSScriptRoot
$workflowPath = Join-Path $root 'workflows\grok-video-factory.workflow.json'
$registryPath = Join-Path $root 'registry\clients.json'
$videoWorkRoot = [IO.Path]::GetFullPath((Join-Path $root 'work\video-factory'))
$batchRoot = [IO.Path]::GetFullPath((Join-Path $videoWorkRoot $BatchId))

if (-not $batchRoot.StartsWith(($videoWorkRoot.TrimEnd('\') + '\'), [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Video batch path escapes the governed work root.'
}
if (Test-Path -LiteralPath $batchRoot) {
    throw "Video batch already exists and will not be overwritten: $batchRoot"
}
if (-not (Test-Path -LiteralPath $workflowPath -PathType Leaf)) {
    throw 'Grok video workflow is unavailable.'
}
if (-not (Test-Path -LiteralPath $registryPath -PathType Leaf)) {
    throw 'Client registry is unavailable.'
}

$workflow = Get-Content -LiteralPath $workflowPath -Raw -Encoding UTF8 | ConvertFrom-Json
$registry = Get-Content -LiteralPath $registryPath -Raw -Encoding UTF8 | ConvertFrom-Json
$resolvedClients = @()

foreach ($clientId in $ClientIds) {
    $matches = @($registry.clients | Where-Object { [string]$_.id -ceq [string]$clientId })
    if ($matches.Count -ne 1) {
        throw "Client ID does not resolve exactly once: $clientId"
    }
    $client = $matches[0]
    if ([string]$client.status -cne 'active') {
        throw "Client is not active: $clientId"
    }
    $clientFolder = [IO.Path]::GetFullPath((Join-Path $root ([string]$client.folder)))
    $profilePath = Join-Path $clientFolder 'video-factory\profile.json'
    if (-not (Test-Path -LiteralPath $profilePath -PathType Leaf)) {
        throw "Video profile is unavailable: $profilePath"
    }
    $profile = Get-Content -LiteralPath $profilePath -Raw -Encoding UTF8 | ConvertFrom-Json
    if ([string]$profile.clientId -cne [string]$client.id) {
        throw "Video profile client ID mismatch: $clientId"
    }
    if ([int]$profile.monthlyTarget -lt 4 -or [int]$profile.monthlyTarget -gt 8) {
        throw "Video profile target is outside the supported range: $clientId"
    }

    $resolvedClients += [pscustomobject][ordered]@{
        clientId = [string]$client.id
        clientDisplayName = [string]$client.displayName
        clientFolder = ([string]$client.folder).Replace('\', '/')
        profilePath = (Join-Path ([string]$client.folder) 'video-factory\profile.json').Replace('\', '/')
        targetVideos = [int]$profile.monthlyTarget
        outputDirectory = "work/video-factory/$BatchId/$clientId"
        planPath = "work/video-factory/$BatchId/$clientId/plan.json"
        evaluationPath = "work/video-factory/$BatchId/$clientId/evaluation.json"
    }
}

New-Item -ItemType Directory -Path $batchRoot -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $batchRoot 'qa') -Force | Out-Null
foreach ($client in $resolvedClients) {
    New-Item -ItemType Directory -Path (Join-Path $batchRoot $client.clientId) -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $batchRoot "$($client.clientId)\renders") -Force | Out-Null
}

$request = [pscustomobject][ordered]@{
    schemaVersion = 1
    workflowId = [string]$workflow.workflowId
    batchId = $BatchId
    generatedAt = (Get-Date).ToUniversalTime().ToString('o')
    productionState = 'draft-local'
    models = [pscustomobject][ordered]@{
        orchestrator = [string]$workflow.models.orchestrator
        parallelPlanner = [string]$workflow.models.parallelPlanner
        evaluator = [string]$workflow.models.evaluator
        videoRenderer = [string]$workflow.models.videoRenderer
    }
    liveVideoGenerationEnabled = $false
    clients = $resolvedClients
    authority = $workflow.authority
}

$requestPath = Join-Path $batchRoot 'batch-request.json'
$request | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $requestPath -Encoding UTF8

$prompt = @"
# Cursor Grok 4.5 Video Factory Batch

You are the bounded planner and evaluator for batch `$BatchId`.

Read:

- `work/video-factory/$BatchId/batch-request.json`
- `workflows/grok-video-factory.workflow.json`
- `schemas/grok-video-batch.schema.json`
- each exact `profilePath` listed in the batch request
- each exact client's `CLIENT.md`
- only source manifests explicitly referenced by that client's profile

For each client listed in `batch-request.json`:

1. Create exactly `targetVideos` concepts.
2. Write only the strict plan JSON to the listed `planPath`.
3. Use `productionState` = `draft-local`.
4. Keep every client completely separated.
5. Make each concept meaningfully different and production-ready: hook, objective, concise voiceover, on-screen text, 3-12 timed shots, source references, generation prompts, negative prompts, CTA state, and safety checks.
6. If approved real media is missing, use `concept-only`, `licensed-stock`, or safe `synthetic-broll` and say exactly what is missing.
7. Do not invent project results, employees, customers, patients, testimonials, service areas, prices, warranties, financing, offers, awards, contact details, or CTAs.
8. Hope Wellness may not include diagnosis, treatment promises, cures, guaranteed outcomes, fictional patient stories, synthetic patient depictions, crisis instructions, or individualized medical advice.
9. Pro Fence stock assets are generic category B-roll and may not be framed as company projects or before-and-after proof.
10. Nothing may be sent, posted, scheduled, published, deployed, or rendered through a paid API.

Then evaluate each plan against the schema, profile, truth boundary, visual distinctiveness, production feasibility, and safety rules. Revise the plan locally if needed, with no more than two evaluation passes.

Write the final evaluation JSON to the listed `evaluationPath` with:

- `schemaVersion`
- `batchId`
- `clientId`
- `model`
- `score` from 0 to 1
- `passed`
- `criteria` object containing `schema`, `truth`, `distinctiveness`, `feasibility`, and `safety`
- `issues` array
- `revisionCount`

Do not alter the registry, profiles, workflow, schema, policies, queue, or any file outside this exact batch directory.
"@

$promptPath = Join-Path $batchRoot 'CURSOR_GROK_4_5_PROMPT.md'
$prompt | Set-Content -LiteralPath $promptPath -Encoding UTF8

$readme = @"
# Grok Video Factory Batch: $BatchId

Status: local planning batch; not rendered through a paid API; not sent or published.

Clients: $($resolvedClients.clientDisplayName -join ', ')

Planning model: $($workflow.models.orchestrator)

Run:

``````powershell
.\scripts\Invoke-CursorGrokVideoFactory.ps1 -BatchId $BatchId
.\scripts\Test-GrokVideoFactoryBatch.ps1 -BatchId $BatchId
.\scripts\New-ProFenceVideoProof.ps1 -BatchId $BatchId
``````
"@
$readme | Set-Content -LiteralPath (Join-Path $batchRoot 'README.md') -Encoding UTF8

[pscustomobject]@{
    status = 'created'
    batchId = $BatchId
    batchRoot = $batchRoot
    clients = $resolvedClients.Count
    plannedVideos = ($resolvedClients | Measure-Object -Property targetVideos -Sum).Sum
    promptPath = $promptPath
    liveVideoGenerationEnabled = $false
} | ConvertTo-Json -Depth 5
