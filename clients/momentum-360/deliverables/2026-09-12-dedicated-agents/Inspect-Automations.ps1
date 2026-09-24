param([string]$OutputPath = (Join-Path $PSScriptRoot 'automation-audit.json'))
$ErrorActionPreference = 'Stop'
$names = @('commitment-follow-through','daily-communications-brain','daily-momentum-semrush-opportunities','weekly-client-marketing-reports','momentum-hubspot-day-pulse','momentum-hubspot-night-pulse','momentum-workshop-calendar-intake','momentum-radar-daily-12','keep-agency-wars-build-moving')
$automations = foreach ($name in $names) {
    $path = Join-Path 'C:\Users\dillo\.codex\automations' "$name\automation.toml"
    $record = [ordered]@{id=$name; path=$path; exists=(Test-Path -LiteralPath $path); state_evidence='configuration_only'}
    if ($record.exists) {
        $content = Get-Content -LiteralPath $path -Raw
        foreach ($key in @('name','status','kind','target_thread_id','rrule','schedule','model')) {
            $match = [regex]::Match($content, '(?m)^' + $key + '\s*=\s*"([^"\r\n]*)"\s*$')
            $record[$key] = if ($match.Success) { $match.Groups[1].Value } else { $null }
        }
    }
    [pscustomobject]$record
}
$tasks = foreach ($name in @('Momentum360-Daily-Agent-Health','Momentum360-Weekly-Reporting','Momentum360-Daily-CallRail-Summary','Momentum-WeeklyDashboard-Finish')) {
    $task = Get-ScheduledTask -TaskName $name -ErrorAction SilentlyContinue
    if ($task) {
        $info = $task | Get-ScheduledTaskInfo
        [pscustomobject]@{name=$name;state=[string]$task.State;last_run=$info.LastRunTime.ToString('o');last_result=$info.LastTaskResult;next_run=if($info.NextRunTime){$info.NextRunTime.ToString('o')}else{$null};result_proves='process_exit_only_not_delivery'}
    } else { [pscustomobject]@{name=$name;state='NOT_FOUND'} }
}
$monitorPath = 'C:\Users\dillo\Documents\Codex\2026-09-12\commitment-monitor\outputs\commitment-follow-through.json'
$monitor = if (Test-Path -LiteralPath $monitorPath) { Get-Content -LiteralPath $monitorPath -Raw | ConvertFrom-Json } else { $null }
$result = [ordered]@{
    observed_at_utc=[DateTime]::UtcNow.ToString('o'); client='momentum-360'; mutation_scope='this_local_receipt_only'
    automations=@($automations); windows_tasks=@($tasks)
    commitment_monitor=if($monitor){@{source=$monitorPath;last_successful_scan_utc=$monitor.last_successful_scan_utc;retained_count=@($monitor.commitments).Count;active_worker=$monitor.active_worker_thread_id;daily_dispatch_count=$monitor.daily_dispatch_count;dispatch_proof='requires_app_receipt_and_artifact_review'}}else{$null}
    caution='Configuration and exit codes do not prove provider access, client outcomes, or delivery. Review owner receipts.'
}
$result | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $OutputPath -Encoding utf8
if (-not ((Get-Content -LiteralPath $OutputPath -Raw | ConvertFrom-Json).automations.Count -eq $names.Count)) { throw 'Incomplete automation inventory' }
Write-Output "Saved $OutputPath; $($names.Count) configurations and $(@($tasks).Count) Windows task records. No scheduler changed."

