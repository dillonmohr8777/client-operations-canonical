[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$syncScript = Join-Path $PSScriptRoot 'Sync-CursorSlackIntake.ps1'
$tempRoot = Join-Path $env:TEMP ('cursor-slack-intake-tests-' + [guid]::NewGuid().ToString('N'))
$checks = New-Object System.Collections.Generic.List[object]
$failed = $false

function Add-Check {
    param([string]$Name, [bool]$Passed, [string]$Detail)
    $script:checks.Add([pscustomobject][ordered]@{ name = $Name; passed = $Passed; detail = $Detail })
    if (-not $Passed) { $script:failed = $true }
}

function Write-Fixture {
    param([string]$Name, [object]$Value)
    $path = Join-Path $tempRoot ($Name + '.json')
    [IO.File]::WriteAllText($path, (($Value | ConvertTo-Json -Depth 20) + [Environment]::NewLine), [Text.UTF8Encoding]::new($false))
    return $path
}

function Copy-Object {
    param([object]$Value)
    return (($Value | ConvertTo-Json -Depth 20) | ConvertFrom-Json)
}

function Invoke-Fixture {
    param([string]$Path)
    $previousPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        $output = @(& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $syncScript -CanonicalRoot $projectRoot -FixturePath $Path -DryRun 2>&1)
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $previousPreference
    }
    [pscustomobject]@{ exitCode = $exitCode; output = ($output -join [Environment]::NewLine) }
}

[IO.Directory]::CreateDirectory($tempRoot) | Out-Null
try {
    $parseErrors = $null
    [void][Management.Automation.Language.Parser]::ParseFile($syncScript, [ref]$null, [ref]$parseErrors)
    Add-Check 'parse' (@($parseErrors).Count -eq 0) ("errors={0}" -f @($parseErrors).Count)

    $queueHashBefore = (Get-FileHash -LiteralPath (Join-Path $projectRoot 'queue\work-items.json') -Algorithm SHA256).Hash
    $valid = [pscustomobject][ordered]@{
        schemaVersion = 1
        requestId = 'slack-1784922105-135699'
        source = [pscustomobject][ordered]@{
            workspaceId = 'T0A6J12L9F6'
            channelId = 'D0BJEC2MM6V'
            messageTs = '1784922105.135699'
            requesterUserId = 'U0A6MD920MA'
            cursorUserId = 'U0BJCELQYLS'
        }
        clientId = 'align-hcm'
        title = 'Prepare an exact-routed review packet'
        instruction = 'Prepare a local review packet using the current Align HCM evidence and keep all delivery pending approval.'
        mode = 'prepare'
        priority = 'P2'
        dueAt = $null
        testOnly = $false
    }
    $validResult = Invoke-Fixture -Path (Write-Fixture -Name 'valid' -Value $valid)
    $validJson = if ($validResult.exitCode -eq 0) { $validResult.output | ConvertFrom-Json } else { $null }
    Add-Check 'valid-request' ($validResult.exitCode -eq 0 -and [string]$validJson.status -eq 'would-import') ([string]$validResult.output)
    Add-Check 'valid-local-class' ([string]$validJson.actionClass -eq 'local_artifact' -and [bool]$validJson.automaticEligible) ([string]$validResult.output)

    $gated = Copy-Object $valid
    $gated.requestId = 'slack-1784922106-135700'
    $gated.source.messageTs = '1784922106.135700'
    $gated.instruction = 'Publish the completed Align HCM article after review.'
    $gated.mode = 'execute_safe'
    $gatedResult = Invoke-Fixture -Path (Write-Fixture -Name 'gated' -Value $gated)
    $gatedJson = if ($gatedResult.exitCode -eq 0) { $gatedResult.output | ConvertFrom-Json } else { $null }
    Add-Check 'gated-request' (
        $gatedResult.exitCode -eq 0 -and
        [string]$gatedJson.actionClass -eq 'publishing' -and
        -not [bool]$gatedJson.automaticEligible
    ) ([string]$gatedResult.output)

    $wrongRequester = Copy-Object $valid
    $wrongRequester.requestId = 'slack-1784922107-135701'
    $wrongRequester.source.messageTs = '1784922107.135701'
    $wrongRequester.source.requesterUserId = 'U0000000000'
    $wrongRequesterResult = Invoke-Fixture -Path (Write-Fixture -Name 'wrong-requester' -Value $wrongRequester)
    Add-Check 'reject-wrong-requester' ($wrongRequesterResult.exitCode -ne 0) ([string]$wrongRequesterResult.output)

    $inactive = Copy-Object $valid
    $inactive.requestId = 'slack-1784922108-135702'
    $inactive.source.messageTs = '1784922108.135702'
    $inactive.clientId = 'zen-spa-tropicana'
    $inactiveResult = Invoke-Fixture -Path (Write-Fixture -Name 'inactive' -Value $inactive)
    Add-Check 'reject-inactive-client' ($inactiveResult.exitCode -ne 0) ([string]$inactiveResult.output)

    $secret = Copy-Object $valid
    $secret.requestId = 'slack-1784922109-135703'
    $secret.source.messageTs = '1784922109.135703'
    $secret.instruction = 'Use access_token: this-value-must-never-enter-intake for the task.'
    $secretResult = Invoke-Fixture -Path (Write-Fixture -Name 'secret' -Value $secret)
    Add-Check 'reject-secret-shaped-text' ($secretResult.exitCode -ne 0) ([string]$secretResult.output)

    $queueHashAfter = (Get-FileHash -LiteralPath (Join-Path $projectRoot 'queue\work-items.json') -Algorithm SHA256).Hash
    Add-Check 'dry-run-no-queue-mutation' ($queueHashBefore -ceq $queueHashAfter) 'queue hash unchanged'

    $checkArray = @($checks | ForEach-Object { $_ })
    [pscustomobject][ordered]@{
        passed = @($checkArray | Where-Object passed).Count
        failed = @($checkArray | Where-Object { -not $_.passed }).Count
        checks = $checkArray
        containsSecrets = $false
    } | ConvertTo-Json -Depth 10
    if ($failed) { exit 1 }
}
finally {
    Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
}
