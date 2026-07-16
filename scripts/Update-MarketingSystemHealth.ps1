[CmdletBinding()]
param(
    [string]$OutputPath,
    [string]$CredentialBridgePath,
    [string]$AccessBrokerScriptPath,
    [string]$AccessCoveragePath,
    [ValidateRange(1,120)][int]$ExternalProbeTimeoutSeconds = 20,
    [switch]$NoWrite
)

$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if ([string]::IsNullOrWhiteSpace($OutputPath)) { $OutputPath = Join-Path $projectRoot 'state\system-health.json' }

$warnings = New-Object System.Collections.Generic.List[string]

function Invoke-BoundedPowerShellProbe {
    param(
        [Parameter(Mandatory=$true)][string]$ScriptPath,
        [string[]]$Arguments=@(),
        [Parameter(Mandatory=$true)][int]$TimeoutSeconds
    )
    $quote={param([string]$Value)'"'+$Value.Replace('"','\"')+'"'}
    $argumentText=@('-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',(& $quote $ScriptPath))
    foreach($argument in @($Arguments)){$argumentText+=(& $quote ([string]$argument))}
    $captureRoot=Join-Path ([IO.Path]::GetTempPath()) ('marketing-os-probe-'+[guid]::NewGuid().ToString('N'))
    $stdoutPath=$captureRoot+'.stdout'
    $stderrPath=$captureRoot+'.stderr'
    $process=$null
    try{
        $process=Start-Process -FilePath 'powershell.exe' -ArgumentList ($argumentText -join ' ') -WindowStyle Hidden -PassThru -RedirectStandardOutput $stdoutPath -RedirectStandardError $stderrPath
        $completedWithinBound=$process.WaitForExit($TimeoutSeconds*1000)
        $timedOut=-not$completedWithinBound
        if($timedOut){
            $treeKill=$null
            try{
                $treeKill=Start-Process -FilePath 'taskkill.exe' -ArgumentList @('/PID',[string]$process.Id,'/T','/F') -WindowStyle Hidden -PassThru
                if(-not$treeKill.WaitForExit(5000)){try{$treeKill.Kill()}catch{};[void]$treeKill.WaitForExit(1000)}
            }
            catch{try{$process.Kill()}catch{}}
            finally{if($null-ne$treeKill){$treeKill.Dispose()}}
            [void]$process.WaitForExit(2000)
        }
        $exitCode=$null
        if($completedWithinBound){
            $process.WaitForExit()
            $process.Refresh()
            $exitCode=[int]$process.ExitCode
        }
        $stdout=if(Test-Path -LiteralPath $stdoutPath){try{[IO.File]::ReadAllText($stdoutPath)}catch{''}}else{''}
        $stderr=if(Test-Path -LiteralPath $stderrPath){try{[IO.File]::ReadAllText($stderrPath)}catch{''}}else{''}
        return [pscustomobject]@{timedOut=$timedOut;exitCode=$exitCode;stdout=$stdout;stderr=$stderr}
    }
    catch{return [pscustomobject]@{timedOut=$false;exitCode=$null;stdout='';stderr=$_.Exception.Message}}
    finally{
        if($null-ne$process){$process.Dispose()}
        Remove-Item -LiteralPath $stdoutPath,$stderrPath -Force -ErrorAction SilentlyContinue
    }
}

function Get-TaskHealth {
    param([string]$Name)
    $task = Get-ScheduledTask -TaskName $Name -ErrorAction SilentlyContinue
    if ($null -eq $task) { return [pscustomobject]@{ name = $Name; present = $false; enabled = $false; state = 'missing'; lastResult = $null; nextRun = $null; prepareOnly = $false } }
    $info = Get-ScheduledTaskInfo -TaskName $Name -ErrorAction SilentlyContinue
    $arguments = [string](($task.Actions | Select-Object -First 1).Arguments)
    return [pscustomobject][ordered]@{
        name = $Name
        present = $true
        enabled = [bool]$task.Settings.Enabled
        state = [string]$task.State
        lastResult = if ($null -eq $info) { $null } else { [int]$info.LastTaskResult }
        nextRun = if ($null -eq $info -or $info.NextRunTime.Year -le 1900) { $null } else { ([DateTimeOffset]$info.NextRunTime).ToString('o') }
        prepareOnly = $arguments -match '(?i)(^|\s)-PrepareOnly(\s|$)'
    }
}

$taskNames = @(
    'Codex-Morning-Orchestrator-Preflight',
    'DillonAgentOS-GmailBridge',
    'DillonAgentOS-SlackBridge',
    'DillonAgentOS-DailyBrief',
    'DillonAgentOS-WeeklyCloseout',
    'Codex-Chrome-Watchdog'
)
$tasks = @($taskNames | ForEach-Object { Get-TaskHealth $_ })

$morning = @($tasks | Where-Object { $_.name -eq 'Codex-Morning-Orchestrator-Preflight' })[0]
if ($morning.enabled) { $warnings.Add('redundant morning orchestrator preflight is enabled') }
foreach ($sensorName in @('DillonAgentOS-GmailBridge','DillonAgentOS-SlackBridge')) {
    $sensor = @($tasks | Where-Object { $_.name -eq $sensorName })[0]
    if ($sensor.enabled -and -not $sensor.prepareOnly) { $warnings.Add("$sensorName is enabled without PrepareOnly") }
    if ($sensor.lastResult -notin @($null, 0, 267009)) { $warnings.Add("$sensorName last result is $($sensor.lastResult)") }
}

$registryProbe=Invoke-BoundedPowerShellProbe -ScriptPath (Join-Path $PSScriptRoot 'Test-ClientRegistry.ps1') -TimeoutSeconds $ExternalProbeTimeoutSeconds
$registryTest=($registryProbe.stdout+([Environment]::NewLine)+$registryProbe.stderr).Trim()
$registryExit=$registryProbe.exitCode
if($registryProbe.timedOut){$warnings.Add('canonical client registry validation timed out')}
elseif($registryExit-ne0){$warnings.Add('canonical client registry validation failed')}

$accessScript = if([string]::IsNullOrWhiteSpace($AccessBrokerScriptPath)){'C:\Users\dillo\.codex\plugins\cache\personal\access-broker\0.1.0+codex.20260711232132\skills\access-broker\scripts\access-broker.ps1'}else{[IO.Path]::GetFullPath($AccessBrokerScriptPath)}
$accessOutput = $null
$accessExit = $null
$accessTimedOut=$false
if (Test-Path -LiteralPath $accessScript) {
    $accessProbe=Invoke-BoundedPowerShellProbe -ScriptPath $accessScript -Arguments @('-Action','validate') -TimeoutSeconds $ExternalProbeTimeoutSeconds
    $accessOutput=($accessProbe.stdout+([Environment]::NewLine)+$accessProbe.stderr).Trim()
    $accessExit=$accessProbe.exitCode
    $accessTimedOut=[bool]$accessProbe.timedOut
    if($accessTimedOut){$warnings.Add('Access Broker registry validation timed out')}
    elseif($accessExit-ne0){$warnings.Add('Access Broker registry validation failed')}
}
else {
    $warnings.Add('Access Broker validator is missing')
}

$reviewedBridgeSha256 = 'CA074FF763A980029EEFF33A83199B3C53FBD479A11FD3F5F2AA41271F9F84CB'
$bridgeScript = if ([string]::IsNullOrWhiteSpace($CredentialBridgePath)) { 'C:\Users\dillo\.codex\credential-bridge\Invoke-CodexBitwardenBridge.ps1' } else { [IO.Path]::GetFullPath($CredentialBridgePath) }
$bridge = $null
$bridgeLiveSha256 = $null
$bridgeIntegrityVerified = $false
if (Test-Path -LiteralPath $bridgeScript) {
    try { $bridgeLiveSha256 = (Get-FileHash -LiteralPath $bridgeScript -Algorithm SHA256).Hash.ToUpperInvariant() } catch { $bridgeLiveSha256 = $null }
    $bridgeIntegrityVerified = $bridgeLiveSha256 -ceq $reviewedBridgeSha256
    if (-not $bridgeIntegrityVerified) {
        $warnings.Add('Bitwarden bridge integrity does not match the independently reviewed build; execution was refused')
    }
    else {
        $bridgeProbe=Invoke-BoundedPowerShellProbe -ScriptPath $bridgeScript -Arguments @('-Operation','Status') -TimeoutSeconds $ExternalProbeTimeoutSeconds
        $bridgeOutput=$bridgeProbe.stdout
        $bridgeExit=$bridgeProbe.exitCode
        if($bridgeProbe.timedOut){$warnings.Add('Bitwarden bridge status check timed out')}
        else{try{$bridge=($bridgeOutput|ConvertFrom-Json)}catch{$bridge=$null}}
        if(-not$bridgeProbe.timedOut-and($bridgeExit-ne0-or$null-eq$bridge)){$warnings.Add('Bitwarden bridge status check failed')}
    }
}
else {
    $warnings.Add('Bitwarden bridge is missing')
}

$intakeStatePath = Join-Path $projectRoot 'state\intake-sync.json'
$intake = $null
if (Test-Path -LiteralPath $intakeStatePath) {
    try { $intake = Get-Content -LiteralPath $intakeStatePath -Raw -Encoding UTF8 | ConvertFrom-Json } catch { $warnings.Add('intake sync state is invalid JSON') }
}
else { $warnings.Add('intake sync state is missing') }

$taskContinuityPath = Join-Path $projectRoot 'state\task-continuity.json'
$taskContinuity = $null
if (Test-Path -LiteralPath $taskContinuityPath) {
    try { $taskContinuity = Get-Content -LiteralPath $taskContinuityPath -Raw -Encoding UTF8 | ConvertFrom-Json } catch { $warnings.Add('task continuity state is invalid JSON') }
}
else { $warnings.Add('task continuity state is missing') }

$queuePath = Join-Path $projectRoot 'queue\work-items.json'
$queue = $null
try { $queue = Get-Content -LiteralPath $queuePath -Raw -Encoding UTF8 | ConvertFrom-Json } catch { $warnings.Add('canonical queue is invalid JSON') }

$accessCoveragePath = if ([string]::IsNullOrWhiteSpace($AccessCoveragePath)) { Join-Path $projectRoot 'state\access-coverage.json' } else { [IO.Path]::GetFullPath($AccessCoveragePath) }
$accessCoverage = $null
if (Test-Path -LiteralPath $accessCoveragePath) {
    try { $accessCoverage = Get-Content -LiteralPath $accessCoveragePath -Raw -Encoding UTF8 | ConvertFrom-Json } catch { $warnings.Add('access coverage state is invalid JSON') }
}
else { $warnings.Add('access coverage state is missing') }

$gitOutput = & git -C $projectRoot status --porcelain 2>$null
$gitExit = $LASTEXITCODE
if ($gitExit -ne 0) { $warnings.Add('git status failed') }

$humanGates = New-Object System.Collections.Generic.List[string]
if ($null -ne $bridge -and $bridge.human_action_required) { $humanGates.Add([string]$bridge.human_action_required) }
switch ([string]$accessCoverage.credentialVault.primaryVaultIdentityStatus) {
    'unverified' { $humanGates.Add('bitwarden_primary_vault_identity_confirmation'); break }
    'verified' { break }
    default { $humanGates.Add('bitwarden_chrome_extension_unlock') }
}
$exactMappingKnown = $null -ne $accessCoverage -and $null -ne $accessCoverage.summary -and $null -ne $accessCoverage.summary.PSObject.Properties['exactBitwardenItemCount']
$exactMappingCount = if ($exactMappingKnown) { [int]$accessCoverage.summary.exactBitwardenItemCount } else { 0 }
$missingActiveExactRoutes = @(if ($null -eq $accessCoverage -or $null -eq $accessCoverage.priority) { @() } else { @($accessCoverage.priority | Where-Object {
    $mappingRequired = if ($null -ne $_.PSObject.Properties['accessMappingRequired']) { [bool]$_.accessMappingRequired } else { $true }
    $mappingRequired -and [int]$_.exactBitwardenItemCount -lt 1
}) })
if (-not $exactMappingKnown -or $exactMappingCount -lt 1) {
    $humanGates.Add('exact_bw_item_locator_mapping')
}
elseif ($missingActiveExactRoutes.Count -gt 0) {
    $humanGates.Add('active_client_exact_bw_item_mapping')
}
$extensionTimeoutPolicy = if (
    $null -ne $accessCoverage -and
    $null -ne $accessCoverage.credentialVault -and
    $null -ne $accessCoverage.credentialVault.PSObject.Properties['primaryExtensionTimeoutPolicy']
) { [string]$accessCoverage.credentialVault.primaryExtensionTimeoutPolicy } else { 'unknown' }
if ($extensionTimeoutPolicy -ne 'on-browser-restart-lock-pin-enabled-master-password-on-restart-disabled') {
    $humanGates.Add('bitwarden_extension_timeout_policy_verification')
}
$humanGates.Add('secondary_exposed_password_rotation')

$normalActiveCount = if ($null -eq $queue) { $null } else { @($queue.workItems | Where-Object { $_.lane -eq 'normal' -and $_.status -in @('in_progress','verification') }).Count }
$emergencyActiveCount = if ($null -eq $queue) { $null } else { @($queue.workItems | Where-Object { $_.lane -eq 'emergency' -and $_.status -in @('in_progress','verification') }).Count }

$health = [pscustomobject][ordered]@{
    schemaVersion = 2
    asOf = [DateTimeOffset]::UtcNow.ToString('o')
    overall = if ($warnings.Count -eq 0 -and $humanGates.Count -eq 0) { 'healthy' } elseif ($warnings.Count -eq 0) { 'healthy-with-human-gates' } else { 'degraded' }
    canonicalProject = $projectRoot
    queue = [pscustomobject]@{
        valid = $null -ne $queue
        revision = if ($null -eq $queue) { $null } else { [int]$queue.revision }
        workItemCount = if ($null -eq $queue) { $null } else { @($queue.workItems).Count }
        activeCount = if ($null -eq $queue) { $null } else { @($queue.workItems | Where-Object { $_.status -in @('in_progress','verification') }).Count }
        normalActiveCount = $normalActiveCount
        normalLimit = if ($null -eq $queue) { $null } else { [int]$queue.wipPolicy.normalLimit }
        emergencyActiveCount = $emergencyActiveCount
        emergencyLimit = if ($null -eq $queue) { $null } else { [int]$queue.wipPolicy.emergencyLimit }
    }
    clientRegistry = [pscustomobject]@{ valid = -not$registryProbe.timedOut -and $registryExit -eq 0; timedOut=[bool]$registryProbe.timedOut; validation = (($registryTest -join ' ') -replace '\s+', ' ').Trim() }
    accessBroker = [pscustomobject]@{ valid = -not$accessTimedOut -and $accessExit -eq 0; timedOut=$accessTimedOut; validatorPresent = Test-Path -LiteralPath $accessScript }
    accessCoverage = if ($null -eq $accessCoverage) { [pscustomobject]@{ valid = $false } } else { [pscustomobject]@{ valid = $true; summary = $accessCoverage.summary; priority = $accessCoverage.priority; credentialVault = $accessCoverage.credentialVault } }
    credentialBridge = [pscustomobject]@{
        present = Test-Path -LiteralPath $bridgeScript
        state = if ($null -eq $bridge) { 'unknown' } else { [string]$bridge.state }
        credentialPresent = if ($null -eq $bridge) { $false } else { [bool]$bridge.credential_present }
        humanActionRequired = if ($null -eq $bridge) { $null } else { $bridge.human_action_required }
        reviewedVersion = '1.1.2'
        reviewedSha256 = $reviewedBridgeSha256
        liveSha256 = $bridgeLiveSha256
        integrityVerified = $bridgeIntegrityVerified
        securityReview = if ($bridgeIntegrityVerified) { 'go-no-critical-or-high-findings-integrity-verified' } else { 'unverified-integrity-mismatch' }
    }
    scheduledTasks = $tasks
    intake = if ($null -eq $intake) { [pscustomobject]@{ valid = $false } } else { [pscustomobject]@{ valid = $true; state = $intake } }
    taskContinuity = if ($null -eq $taskContinuity) { [pscustomobject]@{ valid = $false } } else { [pscustomobject]@{ valid = $true; canonicalTask = $taskContinuity.canonicalTask; policy = $taskContinuity.policy; cleanup = $taskContinuity.cleanup } }
    browserPolicy = 'persistent-remote-chrome-only-never-edge'
    repository = [pscustomobject]@{ gitAvailable = $gitExit -eq 0; dirty = @($gitOutput).Count -gt 0; uncommittedPathCount = @($gitOutput).Count }
    humanGates = @($humanGates | Select-Object -Unique)
    warnings = @($warnings)
}

if (-not $NoWrite) {
    $directory = Split-Path -Parent $OutputPath
    if (-not (Test-Path -LiteralPath $directory)) { New-Item -ItemType Directory -Path $directory -Force | Out-Null }
    $temp = "$OutputPath.tmp.$([guid]::NewGuid().ToString('N'))"
    try {
        [IO.File]::WriteAllText($temp, (($health | ConvertTo-Json -Depth 30) + [Environment]::NewLine), [Text.UTF8Encoding]::new($false))
        Move-Item -LiteralPath $temp -Destination $OutputPath -Force
    }
    finally { Remove-Item -LiteralPath $temp -Force -ErrorAction SilentlyContinue }
}

$health | ConvertTo-Json -Depth 30
