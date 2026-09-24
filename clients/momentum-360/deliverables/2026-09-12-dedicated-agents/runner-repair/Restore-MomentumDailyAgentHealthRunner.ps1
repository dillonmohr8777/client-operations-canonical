[CmdletBinding()]
param(
    [switch]$Apply
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repo = 'C:\Users\dillo\Documents\Codex\projects\client-operations'
$sourceCommit = 'da33d74bebba5fd90b3b8a037e7d0f6ac4dcdaa1'
$automationRoot = Join-Path $repo 'clients\momentum-360\automation\daily-agent-health'
$paths = @(
    'clients/momentum-360/automation/daily-agent-health/Install-MomentumDailyAgentHealthTask.ps1',
    'clients/momentum-360/automation/daily-agent-health/PROMPT.md',
    'clients/momentum-360/automation/daily-agent-health/README.md',
    'clients/momentum-360/automation/daily-agent-health/Repair-MomentumCodexModelCache.ps1',
    'clients/momentum-360/automation/daily-agent-health/Run-MomentumDailyAgentHealth.ps1',
    'clients/momentum-360/automation/daily-agent-health/Test-MomentumDailyAgentHealth.ps1',
    'clients/momentum-360/automation/daily-agent-health/Test-MomentumDailyAgentHealthPreflight.ps1',
    'clients/momentum-360/automation/daily-agent-health/expected-configuration.json',
    'clients/momentum-360/automation/daily-agent-health/state/delivery-ledger.json'
)
$runnerPath = 'clients/momentum-360/automation/daily-agent-health/Run-MomentumDailyAgentHealth.ps1'
$supportPaths = @($paths | Where-Object { $_ -ne $runnerPath })

function Invoke-Git {
    param([Parameter(Mandatory)][string[]]$Arguments)
    $output = & git @Arguments 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "git $($Arguments -join ' ') failed: $output"
    }
    return $output
}

if (-not (Test-Path -LiteralPath $repo)) {
    throw "Repository root not found: $repo"
}

Push-Location -LiteralPath $repo
try {
    Invoke-Git -Arguments @('cat-file', '-e', "$sourceCommit^{commit}") | Out-Null

    $results = foreach ($path in $paths) {
        Invoke-Git -Arguments @('cat-file', '-e', "$sourceCommit`:$path") | Out-Null
        $target = Join-Path $repo ($path -replace '/', '\')
        [pscustomobject]@{
            path = $path
            sourceExists = $true
            targetExists = Test-Path -LiteralPath $target
        }
    }

    $runner = Join-Path $automationRoot 'Run-MomentumDailyAgentHealth.ps1'
    $manifest = 'C:\Users\dillo\.codex\tools\hidden-scheduled-tasks.tsv'
    $manifestLine = if (Test-Path -LiteralPath $manifest) {
        Select-String -LiteralPath $manifest -Pattern '^Momentum360-Daily-Agent-Health\t' | Select-Object -First 1 -ExpandProperty Line
    } else {
            $null
    }
    $taskState = try {
        (Get-ScheduledTask -TaskName 'Momentum360-Daily-Agent-Health' -ErrorAction Stop).State.ToString()
    } catch {
        'NotFound'
    }
    $existingTargets = @($results | Where-Object { $_.targetExists })

    [pscustomobject]@{
        mode = if ($Apply) { 'apply' } else { 'dry-run' }
        sourceCommit = $sourceCommit
        liveRunnerExistsBefore = Test-Path -LiteralPath $runner
        manifestTargetsRunner = [bool]($manifestLine -and $manifestLine.Contains($runner))
        scheduledTaskState = $taskState
        applyAllowed = ($taskState -in @('Disabled', 'NotFound')) -and ($existingTargets.Count -eq 0)
        blockers = @(
            if ($taskState -notin @('Disabled', 'NotFound')) {
                "scheduled task is $taskState; disable it before restoring files"
            }
            foreach ($target in $existingTargets) {
                "target already exists: $($target.path)"
            }
        )
        files = $results
    } | ConvertTo-Json -Depth 5

    if (-not $Apply) {
        return
    }
    if ($taskState -notin @('Disabled', 'NotFound')) {
        throw "Refusing to apply while scheduled task Momentum360-Daily-Agent-Health is $taskState. Disable the task first; this script will not change scheduler state."
    }
    if ($existingTargets.Count -gt 0) {
        throw "Refusing to overwrite existing automation files: $(@($existingTargets.path) -join ', ')"
    }

    $created = [System.Collections.Generic.List[string]]::new()
    try {
        foreach ($path in @($supportPaths + $runnerPath)) {
            $target = Join-Path $repo ($path -replace '/', '\')
            $resolvedParent = [IO.Path]::GetFullPath((Split-Path -Parent $target))
            $resolvedAutomationRoot = [IO.Path]::GetFullPath($automationRoot)
            if (-not $resolvedParent.StartsWith($resolvedAutomationRoot, [StringComparison]::OrdinalIgnoreCase)) {
                throw "Refusing to write outside automation root: $target"
            }
            New-Item -ItemType Directory -Force -Path $resolvedParent | Out-Null
            $content = Invoke-Git -Arguments @('show', "$sourceCommit`:$path")
            [IO.File]::WriteAllLines($target, [string[]]$content, [Text.UTF8Encoding]::new($false))
            $created.Add($target) | Out-Null
        }
    } catch {
        foreach ($createdPath in @($created | Sort-Object Length -Descending)) {
            if ((Test-Path -LiteralPath $createdPath) -and [IO.Path]::GetFullPath($createdPath).StartsWith([IO.Path]::GetFullPath($automationRoot), [StringComparison]::OrdinalIgnoreCase)) {
                Remove-Item -LiteralPath $createdPath -Force
            }
        }
        throw
    }

    if (-not (Test-Path -LiteralPath $runner)) {
        throw "Restore completed but runner is still missing: $runner"
    }

    Write-Output "Restored Momentum daily-agent runner files from $sourceCommit. Runner was written last. Next: run the restored runner with -DryRun -NoRetry only."
}
finally {
    Pop-Location
}
