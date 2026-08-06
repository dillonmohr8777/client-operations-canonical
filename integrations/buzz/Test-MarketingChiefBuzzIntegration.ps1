[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
. (Join-Path $PSScriptRoot 'MarketingChief.BuzzCredential.ps1')
. (Join-Path $PSScriptRoot 'MarketingChief.BuzzProcess.ps1')

$manifest = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'team.manifest.json') -Encoding UTF8 | ConvertFrom-Json
$stackBindings = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'stack.bindings.json') -Encoding UTF8 | ConvertFrom-Json
$skillAssignments = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'skills.assignments.json') -Encoding UTF8 | ConvertFrom-Json
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$statePath = Join-Path $PSScriptRoot 'runtime\team-state.json'
$processStatePath = Join-Path $PSScriptRoot 'runtime\processes.json'
$roundtripStatePath = Join-Path $PSScriptRoot 'runtime\roundtrip-test.json'
$codexWorkerStatePath = Join-Path $PSScriptRoot 'runtime\codex-worker-state.json'
$presenceProcessStatePath = Join-Path $PSScriptRoot 'runtime\presence-processes.json'
$presenceStatusRoot = Join-Path $PSScriptRoot 'runtime\presence'
$state = if (Test-Path -LiteralPath $statePath -PathType Leaf) {
    Get-Content -Raw -LiteralPath $statePath -Encoding UTF8 | ConvertFrom-Json
} else { $null }
$processState = if (Test-Path -LiteralPath $processStatePath -PathType Leaf) {
    Get-Content -Raw -LiteralPath $processStatePath -Encoding UTF8 | ConvertFrom-Json
} else { $null }
$roundtripState = if (Test-Path -LiteralPath $roundtripStatePath -PathType Leaf) {
    Get-Content -Raw -LiteralPath $roundtripStatePath -Encoding UTF8 | ConvertFrom-Json
} else { $null }
$codexWorkerState = if (Test-Path -LiteralPath $codexWorkerStatePath -PathType Leaf) {
    Get-Content -Raw -LiteralPath $codexWorkerStatePath -Encoding UTF8 | ConvertFrom-Json
} else { $null }
$presenceProcessState = if (Test-Path -LiteralPath $presenceProcessStatePath -PathType Leaf) {
    Get-Content -Raw -LiteralPath $presenceProcessStatePath -Encoding UTF8 | ConvertFrom-Json
} else { $null }
$codexWorkerFresh = $false
if ($null -ne $codexWorkerState) {
    try {
        $codexWorkerFresh = ([DateTimeOffset]::UtcNow - [DateTimeOffset]::Parse([string]$codexWorkerState.updatedAt)).TotalMinutes -le 10
    }
    catch { $codexWorkerFresh = $false }
}
$codexFallbackStateValid = $null -ne $codexWorkerState -and
    [string]$codexWorkerState.mode -ceq 'codex-cli-safe-fallback' -and
    [string]$codexWorkerState.status -in @('ready', 'degraded') -and
    $codexWorkerFresh -and
    @($codexWorkerState.agents).Count -eq @($manifest.agents).Count
$nativeManaged = $null -ne $state -and
    $state.PSObject.Properties.Name -contains 'identityMode' -and
    [string]$state.identityMode -ceq 'native-managed'
$activeAgentCount = 0
$harnessFallbackCount = 0
$multiTurnAgentCount = 0
$fullAccessProofAgentCount = 0
$loopWrapperProven = $false
$claudeAuthenticated = $false
$onlinePresenceCount = 0
$failures = [Collections.Generic.List[string]]::new()
if (@($manifest.agents).Count -ne 8) { $failures.Add('manifest_agent_count') }
if (@($manifest.channels).Count -ne 10) { $failures.Add('manifest_channel_count') }
if ([string]$manifest.executionPolicy.coordinatorId -ne 'marketing-chief') { $failures.Add('coordinator_policy') }
if ([int]$manifest.executionPolicy.maxConcurrentInternalWorkers -ne 3) { $failures.Add('worker_budget') }
if (-not [bool]$manifest.executionPolicy.queueRemainsCanonical -or -not [bool]$manifest.executionPolicy.watchtowerRemainsScheduler) { $failures.Add('canonical_policy') }
if (@($stackBindings.bindings).Count -ne 15) { $failures.Add('stack_binding_count') }
$requiredBindings = @('canonical-operations', 'operator-studio', 'watchtower', 'buzz', 'codex-claude', 'omniroute-ollama', 'operator-clients', 'mcp', 'access', 'browser', 'gmail', 'slack', 'hubspot', 'paid-media', 'source-deploy')
foreach ($bindingId in $requiredBindings) {
    if (-not @($stackBindings.bindings | Where-Object { [string]$_.id -ceq $bindingId }).Count) { $failures.Add("stack_binding_missing:$bindingId") }
}
$manifestAgentIds = @($manifest.agents | ForEach-Object { [string]$_.id } | Sort-Object)
$skillAgentIds = @($skillAssignments.agents | ForEach-Object { [string]$_.id } | Sort-Object)
if (@($skillAssignments.agents).Count -ne @($manifest.agents).Count -or (Compare-Object $manifestAgentIds $skillAgentIds)) {
    $failures.Add('skill_assignment_roster')
}
$bindingIds = [Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
foreach ($binding in @($stackBindings.bindings)) { $null = $bindingIds.Add([string]$binding.id) }
foreach ($assignment in @($skillAssignments.agents)) {
    if (@($assignment.coreSkills).Count -gt [int]$skillAssignments.policy.maxCoreSkillsPerAgent) {
        $failures.Add("skill_budget:$([string]$assignment.id)")
    }
    foreach ($bindingId in @($assignment.defaultBindings)) {
        if (-not $bindingIds.Contains([string]$bindingId)) {
            $failures.Add("skill_binding_missing:$([string]$assignment.id):$bindingId")
        }
    }
    foreach ($skill in @($assignment.coreSkills)) {
        $skillFound = $false
        foreach ($skillRoot in @($skillAssignments.policy.skillRoots)) {
            if (Test-Path -LiteralPath (Join-Path ([string]$skillRoot) "$skill\SKILL.md") -PathType Leaf) {
                $skillFound = $true
                break
            }
        }
        if (-not $skillFound) { $failures.Add("skill_missing:$([string]$assignment.id):$skill") }
    }
    if ($assignment.PSObject.Properties.Name -contains 'referenceFiles') {
        foreach ($referenceFile in @($assignment.referenceFiles)) {
            $relativePath = [string]$referenceFile
            if ([IO.Path]::IsPathRooted($relativePath)) {
                $failures.Add("reference_not_relative:$([string]$assignment.id):$relativePath")
                continue
            }
            $resolvedPath = [IO.Path]::GetFullPath((Join-Path $projectRoot $relativePath))
            if (-not $resolvedPath.StartsWith($projectRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
                $failures.Add("reference_outside_project:$([string]$assignment.id):$relativePath")
            }
            elseif (-not (Test-Path -LiteralPath $resolvedPath -PathType Leaf)) {
                $failures.Add("reference_missing:$([string]$assignment.id):$relativePath")
            }
        }
    }
}
foreach ($target in @([string]$manifest.owner.credentialTarget)) {
    try {
        $privateKey = Get-MarketingChiefBuzzPrivateKey -Target $target
        if ($privateKey -notmatch '^[a-f0-9]{64}$') { $failures.Add("credential_shape:$target") }
    }
    catch { $failures.Add("credential_missing:$target") }
    finally { $privateKey = $null }
}
if (-not $nativeManaged) {
    foreach ($target in @($manifest.agents | ForEach-Object { [string]$_.credentialTarget })) {
        try {
            $privateKey = Get-MarketingChiefBuzzPrivateKey -Target $target
            if ($privateKey -notmatch '^[a-f0-9]{64}$') { $failures.Add("credential_shape:$target") }
        }
        catch { $failures.Add("credential_missing:$target") }
        finally { $privateKey = $null }
    }
    foreach ($target in @($manifest.agents | ForEach-Object { [string]$_.authTagCredentialTarget })) {
        try {
            $authTag = Get-MarketingChiefBuzzAuthTag -Target $target
            if ([string]::IsNullOrWhiteSpace($authTag)) { $failures.Add("auth_tag_missing:$target") }
        }
        catch { $failures.Add("auth_tag_missing:$target") }
        finally { $authTag = $null }
    }
}
$requiredRuntimePaths = @(
    (Join-Path $PSScriptRoot 'Invoke-MarketingChiefBuzzLoop.ps1'),
    (Join-Path $PSScriptRoot 'Start-MarketingChiefBuzzPresenceKeeper.ps1'),
    (Join-Path $PSScriptRoot 'tools\buzz-presence-daemon.mjs'),
    'C:\Users\dillo\AppData\Local\Buzz\buzz.exe',
    'C:\Users\dillo\AppData\Local\Buzz\buzz-desktop.exe'
)
if ($codexFallbackStateValid) {
    $requiredRuntimePaths += @(
        (Join-Path $PSScriptRoot 'Invoke-MarketingChiefBuzzCodexWorker.ps1'),
        (Join-Path $PSScriptRoot 'tools\buzz-dm-query.mjs'),
        'C:\Users\dillo\AppData\Roaming\npm\codex.exe'
    )
}
else {
    $requiredRuntimePaths += @(
        'C:\Users\dillo\AppData\Local\Buzz\buzz-acp.exe',
        'C:\Users\dillo\AppData\Roaming\npm\codex-acp.cmd',
        'C:\Users\dillo\AppData\Roaming\npm\claude-agent-acp.cmd'
    )
}
foreach ($path in $requiredRuntimePaths) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { $failures.Add("binary_missing:$path") }
}
$sourceText = Get-ChildItem -LiteralPath $PSScriptRoot -Recurse -File |
    Where-Object { $_.FullName -notmatch '\\runtime\\' } |
    ForEach-Object { Get-Content -Raw -LiteralPath $_.FullName -ErrorAction SilentlyContinue }
if (($sourceText -join "`n") -match '(?i)(?:sk|nfc|ghp|xox[baprs])_[A-Za-z0-9_-]{20,}|authorization\s*[:=]\s*bearer\s+[A-Za-z0-9._-]{20,}') {
    $failures.Add('secret_shaped_source')
}
$fullAccessModeConfigured = ($sourceText -join "`n") -match "INITIAL_AGENT_MODE'\]\s*=\s*'agent-full-access'|--dangerously-bypass-approvals-and-sandbox"
if (-not $fullAccessModeConfigured) { $failures.Add('codex_full_access_mode') }
$task = Get-ScheduledTask -TaskName 'MarketingChief-BuzzBridge' -ErrorAction SilentlyContinue
if ($null -ne $task) {
    $action = @($task.Actions)[0]
    if ([string]$action.Execute -notmatch 'wscript\.exe$' -or [string]$action.Arguments -notmatch 'Run-HiddenScheduledTask\.vbs') {
        $failures.Add('task_not_console_free')
    }
}
$workerTask = Get-ScheduledTask -TaskName 'MarketingChief-BuzzAgentWorker' -ErrorAction SilentlyContinue
if ($codexFallbackStateValid) {
    if ($null -eq $workerTask) {
        $failures.Add('worker_task_missing')
    }
    else {
        $workerAction = @($workerTask.Actions)[0]
        if ([string]$workerAction.Execute -notmatch 'wscript\.exe$' -or
            [string]$workerAction.Arguments -notmatch 'Run-HiddenScheduledTask\.vbs') {
            $failures.Add('worker_task_not_console_free')
        }
    }
}
$presenceTask = Get-ScheduledTask -TaskName 'MarketingChief-BuzzPresenceKeeper' -ErrorAction SilentlyContinue
if ($null -eq $presenceTask) {
    $failures.Add('presence_task_missing')
}
else {
    $presenceAction = @($presenceTask.Actions)[0]
    if ([string]$presenceAction.Execute -notmatch 'wscript\.exe$' -or
        [string]$presenceAction.Arguments -notmatch 'Run-HiddenScheduledTask\.vbs') {
        $failures.Add('presence_task_not_console_free')
    }
}
if ($null -eq $state) { $failures.Add('runtime_state_missing') }
elseif ([string]$state.status -eq 'ready') {
    if (@($state.channels).Count -ne 10) { $failures.Add('runtime_channel_count') }
    $expectedIdentityCount = @($manifest.agents).Count + 1
    if (@($state.identities).Count -ne $expectedIdentityCount) { $failures.Add('runtime_identity_count') }
    $publicKeys = @($state.identities | ForEach-Object { [string]$_.publicKey })
    if (@($publicKeys | Where-Object { $_ -cnotmatch '^[a-f0-9]{64}$' }).Count) { $failures.Add('runtime_public_key_shape') }
    if (@($publicKeys | Sort-Object -Unique).Count -ne $expectedIdentityCount) { $failures.Add('runtime_public_key_uniqueness') }
    if ($null -eq $presenceProcessState -or
        [string]$presenceProcessState.mode -cne 'nostr-presence-only' -or
        @($presenceProcessState.processes).Count -ne @($manifest.agents).Count) {
        $failures.Add('presence_process_state')
    }
    else {
        foreach ($agent in @($manifest.agents)) {
            $presenceRows = @($presenceProcessState.processes | Where-Object {
                [string]$_.agentId -ceq [string]$agent.id
            })
            if ($presenceRows.Count -ne 1) {
                $failures.Add("presence_process_roster:$([string]$agent.id)")
                continue
            }
            $presenceProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $([int]$presenceRows[0].pid)" -ErrorAction SilentlyContinue
            if ($null -eq $presenceProcess -or
                [string]$presenceProcess.ExecutablePath -notmatch '\\node\.exe$' -or
                [string]$presenceProcess.CommandLine -notmatch 'buzz-presence-daemon\.mjs') {
                $failures.Add("presence_process_missing:$([string]$agent.id)")
            }

            $presenceStatusPath = Join-Path $presenceStatusRoot (([string]$agent.id) + '.json')
            if (-not (Test-Path -LiteralPath $presenceStatusPath -PathType Leaf)) {
                $failures.Add("presence_status_missing:$([string]$agent.id)")
                continue
            }
            $presenceStatus = Get-Content -Raw -LiteralPath $presenceStatusPath -Encoding UTF8 | ConvertFrom-Json
            $presenceFresh = $false
            try {
                $presenceFresh = ([DateTimeOffset]::UtcNow - [DateTimeOffset]::Parse([string]$presenceStatus.updatedAt)).TotalSeconds -le 90
            }
            catch { $presenceFresh = $false }
            if ([string]$presenceStatus.state -cne 'online' -or -not $presenceFresh) {
                $failures.Add("presence_status_not_online:$([string]$agent.id)")
            }
        }

        try {
            $agentPublicKeys = @($state.identities |
                Where-Object { [string]$_.harness -cne 'owner' } |
                ForEach-Object { [string]$_.publicKey })
            $presenceResult = Invoke-MarketingChiefBuzzProcess `
                -CredentialTarget ([string]$manifest.owner.credentialTarget) `
                -RelayUrl ([string]$manifest.relay.httpUrl) `
                -ArgumentList @('users', 'presence', '--pubkeys', ($agentPublicKeys -join ',')) `
                -TimeoutSeconds 30
            if ([int]$presenceResult.exitCode -ne 0) {
                $failures.Add('presence_relay_query')
            }
            else {
                $livePresence = @(([string]$presenceResult.stdout | ConvertFrom-Json))
                $onlinePresenceCount = @($livePresence | Where-Object { [string]$_.status -ceq 'online' }).Count
                if ($livePresence.Count -ne @($manifest.agents).Count -or
                    $onlinePresenceCount -ne @($manifest.agents).Count) {
                    $failures.Add('presence_relay_not_all_online')
                }
            }
        }
        catch {
            $failures.Add('presence_relay_query')
        }
    }
    if ($nativeManaged) {
        $nativeIdentities = @($state.identities | Where-Object { [string]$_.managedBy -ceq 'buzz-desktop' })
        if ($nativeIdentities.Count -ne @($manifest.agents).Count) { $failures.Add('native_identity_count') }
        if ($null -eq $processState -or
            $processState.PSObject.Properties.Name -notcontains 'mode' -or
            [string]$processState.mode -cne 'native-managed') {
            $failures.Add('native_process_state')
        }
        elseif (@($processState.processes).Count -ne @($manifest.agents).Count) {
            $failures.Add('native_process_count')
        }
        else {
            foreach ($row in @($processState.processes)) {
                $process = Get-Process -Id ([int]$row.pid) -ErrorAction SilentlyContinue
                if ($null -eq $process -or [string]$process.Path -cne 'C:\Users\dillo\AppData\Local\Buzz\buzz-acp.exe') {
                    $failures.Add("native_process_missing:$([int]$row.pid)")
                }
            }
        }
        $nativeConfigPath = 'C:\Users\dillo\AppData\Roaming\xyz.block.buzz.app\agents\managed-agents.json'
        if (-not (Test-Path -LiteralPath $nativeConfigPath -PathType Leaf)) {
            $failures.Add('native_config_missing')
        }
        else {
            $nativeConfig = Get-Content -Raw -LiteralPath $nativeConfigPath -Encoding UTF8 | ConvertFrom-Json
            foreach ($agent in @($manifest.agents)) {
                $records = @($nativeConfig | Where-Object {
                    [string]$_.name -ceq [string]$agent.displayName -and -not [bool]$_.is_builtin
                })
                $instanceRecords = @($records | Where-Object { [string]$_.pubkey -match '^[a-f0-9]{64}$' })
                $definitionRecords = @($records | Where-Object { [string]$_.pubkey -notmatch '^[a-f0-9]{64}$' })
                if ($records.Count -ne 2 -or
                    $instanceRecords.Count -ne 1 -or [int]$instanceRecords[0].parallelism -ne 1 -or
                    $definitionRecords.Count -ne 1 -or [int]$definitionRecords[0].definition_parallelism -ne 1) {
                    $failures.Add("native_parallelism:$([string]$agent.id)")
                }
            }
            $nativeConfig = $null
        }
    }
    else {
        if ($codexFallbackStateValid) {
            foreach ($agent in @($manifest.agents)) {
                $workerRows = @($codexWorkerState.agents | Where-Object {
                    [string]$_.agentId -ceq [string]$agent.id
                })
                if ($workerRows.Count -ne 1) {
                    $failures.Add("worker_roster:$([string]$agent.id)")
                    continue
                }
                if ([string]$workerRows[0].status -notin @('ready', 'initialized', 'processing', 'retry_pending')) {
                    $failures.Add("worker_status:$([string]$agent.id)")
                }
            }
            $activeAgentCount = @($manifest.agents).Count
            $harnessFallbackCount = @($manifest.agents | Where-Object { [string]$_.harness -cne 'codex' }).Count
        }
        else {
            if ($null -eq $processState -or
                $processState.PSObject.Properties.Name -notcontains 'schemaVersion' -or
                [int]$processState.schemaVersion -lt 2) {
                $failures.Add('bridge_process_state')
            }
            elseif (@($processState.processes).Count -ne @($manifest.agents).Count) {
                $failures.Add('bridge_process_count')
            }
            else {
                $claudeAuthenticated = $processState.PSObject.Properties.Name -contains 'claudeAuthenticated' -and
                    [bool]$processState.claudeAuthenticated
                foreach ($agent in @($manifest.agents)) {
                    $rows = @($processState.processes | Where-Object { [string]$_.agentId -ceq [string]$agent.id })
                    if ($rows.Count -ne 1) {
                        $failures.Add("bridge_process_roster:$([string]$agent.id)")
                        continue
                    }
                    $row = $rows[0]
                    $process = Get-Process -Id ([int]$row.pid) -ErrorAction SilentlyContinue
                    if ($null -eq $process -or [string]$process.Path -cne 'C:\Users\dillo\AppData\Local\Buzz\buzz-acp.exe') {
                        $failures.Add("bridge_process_missing:$([string]$agent.id)")
                    }
                    else { $activeAgentCount += 1 }

                    $expectedHarness = if ([string]$agent.harness -ceq 'claude' -and -not $claudeAuthenticated) {
                        'codex'
                    } else {
                        [string]$agent.harness
                    }
                    if ([string]$row.harness -cne $expectedHarness) {
                        $failures.Add("bridge_harness:$([string]$agent.id)")
                    }
                    $fallbackExpected = $expectedHarness -cne [string]$agent.harness
                    if ($row.PSObject.Properties.Name -notcontains 'fallbackApplied' -or
                        [bool]$row.fallbackApplied -ne $fallbackExpected) {
                        $failures.Add("bridge_fallback:$([string]$agent.id)")
                    }
                    if ($fallbackExpected) { $harnessFallbackCount += 1 }
                }
            }
        }
    }
}
if ($null -eq $roundtripState -or -not [bool]$roundtripState.ok) {
    $failures.Add('roundtrip_evidence_missing')
}
else {
    if ($roundtripState.PSObject.Properties.Name -notcontains 'schemaVersion' -or
        [int]$roundtripState.schemaVersion -lt 3) {
        $failures.Add('roundtrip_evidence_schema')
    }
    $requiredRoundtripAgents = @($manifest.agents | ForEach-Object { [string]$_.id })
    foreach ($agentId in $requiredRoundtripAgents) {
        $checks = @($roundtripState.checks | Where-Object {
            [string]$_.agent -ceq $agentId -and
            [bool]$_.replyExact -and
            [bool]$_.replyAuthoredByExpectedIdentity -and
            [int]$_.turnCount -ge 1
        })
        if ($checks.Count -ne 1) { $failures.Add("roundtrip_agent:$agentId") }
    }
    $requiredContinuityAgents = @('marketing-chief', 'web-product')
    foreach ($agentId in $requiredContinuityAgents) {
        $checks = @($roundtripState.checks | Where-Object {
            [string]$_.agent -ceq $agentId -and
            [int]$_.turnCount -ge 2 -and
            [bool]$_.sessionContinuity
        })
        if ($checks.Count -ne 1) { $failures.Add("roundtrip_continuity:$agentId") }
    }
    $multiTurnAgentCount = @($roundtripState.checks | Where-Object {
        [int]$_.turnCount -ge 2 -and [bool]$_.sessionContinuity
    }).Count
    $fullAccessProofAgentCount = @($roundtripState.checks | Where-Object {
        [string]$_.agent -ceq 'web-product' -and
        $_.PSObject.Properties.Name -contains 'fullAccessProof' -and
        [bool]$_.fullAccessProof
    }).Count
    if ($fullAccessProofAgentCount -ne 1) { $failures.Add('roundtrip_full_access:web-product') }
    $loopWrapperProven = $roundtripState.PSObject.Properties.Name -contains 'loopWrapperProof' -and
        [bool]$roundtripState.loopWrapperProof.ok -and
        [bool]$roundtripState.loopWrapperProof.singleAgentConversation -and
        [bool]$roundtripState.loopWrapperProof.twoAgentRouting -and
        [bool]$roundtripState.loopWrapperProof.identityVerified -and
        [bool]$roundtripState.loopWrapperProof.secretShapedInstructionBlocked -and
        -not [bool]$roundtripState.loopWrapperProof.persistedTranscript
    if (-not $loopWrapperProven) { $failures.Add('roundtrip_loop_wrapper') }
    if ([bool]$roundtripState.containsSecrets -or [bool]$roundtripState.containsRawClientCommunications) {
        $failures.Add('roundtrip_evidence_unsafe')
    }
}

[pscustomobject][ordered]@{
    ok = $failures.Count -eq 0
    status = if ($null -eq $state) { 'missing' } else { [string]$state.status }
    agentCount = @($manifest.agents).Count
    channelCount = @($manifest.channels).Count
    stackBindingCount = @($stackBindings.bindings).Count
    skillAssignmentCount = @($skillAssignments.agents).Count
    identityMode = if ($null -eq $state -or $state.PSObject.Properties.Name -notcontains 'identityMode') { 'unknown' } else { [string]$state.identityMode }
    protectedIdentityCount = if ($null -eq $state) { 0 } else { @($state.identities).Count }
    bridgeCredentialCount = if ($nativeManaged) { 1 } else { (@($manifest.agents).Count * 2) + 1 }
    activeAgentCount = $activeAgentCount
    onlinePresenceCount = $onlinePresenceCount
    claudeAuthenticated = $claudeAuthenticated
    harnessFallbackCount = $harnessFallbackCount
    roundtripCheckCount = if ($null -eq $roundtripState) { 0 } else { @($roundtripState.checks).Count }
    multiTurnAgentCount = $multiTurnAgentCount
    fullAccessProofAgentCount = $fullAccessProofAgentCount
    fullAccessModeConfigured = $fullAccessModeConfigured
    loopWrapperProven = $loopWrapperProven
    scheduledTaskPresent = $null -ne $task
    presenceTaskPresent = $null -ne $presenceTask
    presenceMode = if ($null -eq $presenceProcessState) { 'missing' } else { [string]$presenceProcessState.mode }
    runtimeMode = if ($codexFallbackStateValid) { 'codex-cli-safe-fallback' } elseif ($nativeManaged) { 'native-managed' } else { 'official-acp' }
    failures = @($failures)
}
if ($failures.Count) { exit 1 }
