[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
. (Join-Path $PSScriptRoot 'MarketingChief.BuzzCredential.ps1')

$manifest = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'team.manifest.json') -Encoding UTF8 | ConvertFrom-Json
$stackBindings = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'stack.bindings.json') -Encoding UTF8 | ConvertFrom-Json
$statePath = Join-Path $PSScriptRoot 'runtime\team-state.json'
$state = if (Test-Path -LiteralPath $statePath -PathType Leaf) {
    Get-Content -Raw -LiteralPath $statePath -Encoding UTF8 | ConvertFrom-Json
} else { $null }
$failures = [Collections.Generic.List[string]]::new()
if (@($manifest.agents).Count -ne 10) { $failures.Add('manifest_agent_count') }
if (@($manifest.channels).Count -ne 10) { $failures.Add('manifest_channel_count') }
if ([string]$manifest.executionPolicy.coordinatorId -ne 'marketing-chief') { $failures.Add('coordinator_policy') }
if ([int]$manifest.executionPolicy.maxConcurrentInternalWorkers -ne 3) { $failures.Add('worker_budget') }
if (-not [bool]$manifest.executionPolicy.queueRemainsCanonical -or -not [bool]$manifest.executionPolicy.watchtowerRemainsScheduler) { $failures.Add('canonical_policy') }
if (@($stackBindings.bindings).Count -ne 15) { $failures.Add('stack_binding_count') }
$requiredBindings = @('canonical-operations', 'operator-studio', 'watchtower', 'buzz', 'codex-claude', 'omniroute-ollama', 'operator-clients', 'mcp', 'access', 'browser', 'gmail', 'slack', 'hubspot', 'paid-media', 'source-deploy')
foreach ($bindingId in $requiredBindings) {
    if (-not @($stackBindings.bindings | Where-Object { [string]$_.id -ceq $bindingId }).Count) { $failures.Add("stack_binding_missing:$bindingId") }
}
foreach ($target in @([string]$manifest.owner.credentialTarget) + @($manifest.agents | ForEach-Object { [string]$_.credentialTarget })) {
    try {
        $privateKey = Get-MarketingChiefBuzzPrivateKey -Target $target
        if ($privateKey -notmatch '^[a-f0-9]{64}$') { $failures.Add("credential_shape:$target") }
    }
    catch { $failures.Add("credential_missing:$target") }
    finally { $privateKey = $null }
}
foreach ($path in @(
    'C:\Users\dillo\AppData\Local\Buzz\buzz.exe',
    'C:\Users\dillo\AppData\Local\Buzz\buzz-desktop.exe',
    'C:\Users\dillo\AppData\Local\Buzz\buzz-acp.exe',
    'C:\Users\dillo\AppData\Roaming\npm\codex-acp.cmd',
    'C:\Users\dillo\AppData\Roaming\npm\claude-agent-acp.cmd'
)) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { $failures.Add("binary_missing:$path") }
}
$sourceText = Get-ChildItem -LiteralPath $PSScriptRoot -Recurse -File |
    Where-Object { $_.FullName -notmatch '\\runtime\\' } |
    ForEach-Object { Get-Content -Raw -LiteralPath $_.FullName -ErrorAction SilentlyContinue }
if (($sourceText -join "`n") -match '(?i)(?:sk|nfc|ghp|xox[baprs])_[A-Za-z0-9_-]{20,}|authorization\s*[:=]\s*bearer\s+[A-Za-z0-9._-]{20,}') {
    $failures.Add('secret_shaped_source')
}
$task = Get-ScheduledTask -TaskName 'MarketingChief-BuzzBridge' -ErrorAction SilentlyContinue
if ($null -ne $task) {
    $action = @($task.Actions)[0]
    if ([string]$action.Execute -notmatch 'wscript\.exe$' -or [string]$action.Arguments -notmatch 'Run-HiddenScheduledTask\.vbs') {
        $failures.Add('task_not_console_free')
    }
}
if ($null -eq $state) { $failures.Add('runtime_state_missing') }
elseif ([string]$state.status -eq 'ready' -and @($state.channels).Count -ne 10) { $failures.Add('runtime_channel_count') }

[pscustomobject][ordered]@{
    ok = $failures.Count -eq 0
    status = if ($null -eq $state) { 'missing' } else { [string]$state.status }
    agentCount = @($manifest.agents).Count
    channelCount = @($manifest.channels).Count
    stackBindingCount = @($stackBindings.bindings).Count
    credentialCount = @($manifest.agents).Count + 1
    scheduledTaskPresent = $null -ne $task
    failures = @($failures)
}
if ($failures.Count) { exit 1 }
