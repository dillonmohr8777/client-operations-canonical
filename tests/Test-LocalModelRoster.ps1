$ErrorActionPreference = 'Stop'

function Assert-True {
    param([bool]$Condition, [string]$Message)
    if (-not $Condition) { throw $Message }
    $script:AssertionCount++
}

function New-TempPath {
    param([string]$Suffix)
    return Join-Path $script:TempRoot $Suffix
}

$script:AssertionCount = 0
$root = Split-Path -Parent $PSScriptRoot
$script:TempRoot = Join-Path ([IO.Path]::GetTempPath()) ('local-model-roster-tests-' + [guid]::NewGuid().ToString('N'))
[void][IO.Directory]::CreateDirectory($script:TempRoot)

$rosterPath = Join-Path $root 'registry\local-models.json'
$schemaPath = Join-Path $root 'schemas\local-models.schema.json'
$validatorPath = Join-Path $root 'scripts\Test-LocalModelRoster.ps1'
$healthPath = Join-Path $root 'scripts\Update-AiStackState.ps1'
$docsPath = Join-Path $root 'docs\LOCAL_MODELS.md'

try {
    foreach ($path in @($rosterPath, $schemaPath, $validatorPath, $healthPath, $docsPath)) {
        Assert-True (Test-Path -LiteralPath $path -PathType Leaf) "Missing required file: $path"
    }

    foreach ($script in @($validatorPath, $healthPath)) {
        $parseErrors = $null
        [void][Management.Automation.Language.Parser]::ParseFile($script, [ref]$null, [ref]$parseErrors)
        Assert-True (@($parseErrors).Count -eq 0) ("Parser errors in {0}" -f [IO.Path]::GetFileName($script))
    }

    $roster = Get-Content -LiteralPath $rosterPath -Raw -Encoding UTF8 | ConvertFrom-Json
    Assert-True ([int]$roster.schemaVersion -eq 1) 'Canonical roster schemaVersion must be 1.'
    Assert-True (@($roster.models | Where-Object id -eq 'deepseek-v4-pro-0813').Count -eq 1) 'Canonical roster must include DeepSeek-V4-Pro-0813.'

    $validation = & $validatorPath -RosterPath $rosterPath -SchemaPath $schemaPath | ConvertFrom-Json
    Assert-True ([string]$validation.status -eq 'valid') 'Canonical roster must validate.'
    Assert-True ([string]$validation.deepseekPro -eq 'deepseek-v4-pro-0813') 'Validator must report the official Pro id.'
    Assert-True ([int]$validation.localOllamaCount -ge 6) 'Canonical roster must keep local Ollama tags.'

    $healthOutputPath = New-TempPath 'ai-stack.json'
    $health = & $healthPath -RosterPath $rosterPath -OutputPath $healthOutputPath -NoWrite -ProbeTimeoutMilliseconds 250
    Assert-True ($null -ne $health) 'AI stack health must return an object.'
    Assert-True ([string]$health.status -in @('ready', 'degraded')) 'AI stack health must be ready or degraded when the roster is valid.'
    Assert-True ([string]$health.roster.deepseekPro -eq 'deepseek-v4-pro-0813') 'Health output must surface DeepSeek Pro.'
    Assert-True (-not [bool]$health.cloudAgentMayPull) 'Health output must keep Cloud Agent pulls closed.'
    Assert-True (@($health.pullHosts) -contains 'DESKTOP' -and @($health.pullHosts) -contains 'AHCM') 'Health output must name DESKTOP and AHCM as pull hosts.'
    Assert-True (@($health.pullSets.daily24gb.requested) -contains 'ornith:35b') 'Health output must report the 24 GB daily pull set.'
    Assert-True (@($health.pullSets.edge16gb.requested) -contains 'qwen3.5:9b') 'Health output must report the 16 GB class pull set.'
    Assert-True (@($health.pullSets.recommendedIfFits.requested) -contains 'glm-4.7-flash') 'Health output must report recommended-if-fits tags.'
    Assert-True (-not [bool]$health.probes.pullAttempted) 'Health check must not pull models.'
    Assert-True (-not [bool]$health.probes.omnirouteMutated) 'Health check must not mutate OmniRoute.'
    Assert-True (-not [bool]$health.probes.canonicalQueueMutated) 'Health check must not mutate the queue.'
    Assert-True (-not (Test-Path -LiteralPath $healthOutputPath)) '-NoWrite must not create an output file.'
    Assert-True ([int]$health.connectedProviderCount -eq 0) 'Health check must not invent connected providers.'

    $taintedPath = New-TempPath 'tainted-roster.json'
    $tainted = $roster | ConvertTo-Json -Depth 20 | ConvertFrom-Json
    $daily = @($tainted.models | Where-Object { [string]$_.id -eq 'qwen3.8-27b' })[0]
    $daily.ollamaLocalTag = 'qwen3.8:cloud'
    [IO.File]::WriteAllText($taintedPath, (($tainted | ConvertTo-Json -Depth 20) + "`n"), [Text.UTF8Encoding]::new($false))
    $failed = $false
    $failureText = ''
    try {
        [void](& $validatorPath -RosterPath $taintedPath -SchemaPath $schemaPath)
    }
    catch {
        $failed = $true
        $failureText = [string]$_.Exception.Message
    }
    Assert-True $failed 'A cloud Ollama tag marked local must be rejected.'
    Assert-True ($failureText -match 'Local Ollama tag cannot be a cloud alias') ("Cloud-as-local fixture must fail on the cloud-tag rule: {0}" -f $failureText)

    $cloudPullPath = New-TempPath 'cloud-pull-set.json'
    $cloudPull = $roster | ConvertTo-Json -Depth 20 | ConvertFrom-Json
    $cloudPull.pullSets.daily24gb[0] = 'ornith:35b-cloud'
    [IO.File]::WriteAllText($cloudPullPath, (($cloudPull | ConvertTo-Json -Depth 20) + "`n"), [Text.UTF8Encoding]::new($false))
    $cloudPullFailed = $false
    $cloudPullText = ''
    try {
        [void](& $validatorPath -RosterPath $cloudPullPath -SchemaPath $schemaPath)
    }
    catch {
        $cloudPullFailed = $true
        $cloudPullText = [string]$_.Exception.Message
    }
    Assert-True $cloudPullFailed 'A :cloud tag in a pull set must be rejected.'
    Assert-True ($cloudPullText -match 'cannot include a cloud alias') ("Cloud pull-set fixture must fail on the cloud-tag rule: {0}" -f $cloudPullText)

    $docs = Get-Content -LiteralPath $docsPath -Raw -Encoding UTF8
    Assert-True ($docs -match 'DeepSeek-V4-Pro-0813') 'Docs must name the official Pro release.'
    Assert-True ($docs -match 'does not pull') 'Docs must say the roster does not pull weights.'
    Assert-True ($docs -match 'Install-CursorLocalModels') 'Docs must name the Cursor installer.'
    Assert-True ($docs -match 'ollama pull ornith:35b') 'Docs must include the 24 GB daily pull commands.'
    Assert-True ($docs -match 'curl.exe http://127.0.0.1:11434/api/tags') 'Docs must confirm installed tags against loopback /api/tags.'
    Assert-True ($docs -match 'DESKTOP') 'Docs must name DESKTOP as a pull host.'
    Assert-True ($docs -match 'AHCM') 'Docs must name AHCM as a pull host.'
    Assert-True ($docs -match 'deepseek-v4-pro:cloud') 'Docs must call out the DeepSeek Pro cloud alias.'

    Write-Output ("local-model-roster tests passed ({0} assertions)" -f $script:AssertionCount)
    exit 0
}
catch {
    Write-Error $_
    exit 1
}
finally {
    if (Test-Path -LiteralPath $script:TempRoot) {
        Remove-Item -LiteralPath $script:TempRoot -Recurse -Force -ErrorAction SilentlyContinue
    }
}
