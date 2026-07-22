$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$temp = Join-Path ([IO.Path]::GetTempPath()) ('slack-ai-command-' + [Guid]::NewGuid().ToString('N'))
[IO.Directory]::CreateDirectory($temp) | Out-Null
try {
  $config = @{ teamId='T1'; allowedUserIds=@('U1'); allowedChannelIds=@('C1'); allowedClientIds=@('momentum-360') }
  $configPath = Join-Path $temp 'config.json'
  $config | ConvertTo-Json | Set-Content -LiteralPath $configPath -Encoding UTF8

  function Invoke-Case([hashtable]$Event) {
    $eventPath = Join-Path $temp ('event-' + [Guid]::NewGuid().ToString('N') + '.json')
    $Event | ConvertTo-Json | Set-Content -LiteralPath $eventPath -Encoding UTF8
    $raw = & (Join-Path $root 'Convert-SlackAiCommand.ps1') -EventPath $eventPath -ConfigPath $configPath -OutputDirectory (Join-Path $temp 'runs') 2>$null
    $code = $LASTEXITCODE
    if ($null -eq $code) { $code = 0 }
    return @{ code=$code; result=($raw | ConvertFrom-Json) }
  }

  $ok = Invoke-Case @{ team_id='T1'; channel_id='C1'; channel_type='channel'; user_id='U1'; ts='1.100'; text='/ai momentum-360: prepare a local chatbot QA report' }
  if ($ok.code -ne 0 -or -not $ok.result.accepted -or $ok.result.approvalRequired) { throw ('Safe command was not accepted: ' + ($ok | ConvertTo-Json -Compress -Depth 4)) }

  $replay = Invoke-Case @{ team_id='T1'; channel_id='C1'; channel_type='channel'; user_id='U1'; ts='1.100'; text='/ai momentum-360: prepare a local chatbot QA report' }
  if ($replay.code -ne 0 -or -not $replay.result.duplicate) { throw 'Replay was not deduplicated.' }

  $gated = Invoke-Case @{ team_id='T1'; channel_id='C1'; channel_type='channel'; user_id='U1'; ts='1.200'; text='/ai momentum-360: activate SMS and send the client update' }
  if ($gated.code -ne 0 -or -not $gated.result.approvalRequired) { throw 'External command did not require approval.' }

  $denied = Invoke-Case @{ team_id='T1'; channel_id='C1'; channel_type='channel'; user_id='U9'; ts='1.300'; text='/ai momentum-360: prepare a report' }
  if ($denied.code -ne 2 -or $denied.result.reason -ne 'user-not-allowed') { throw 'Unauthorized user was not rejected.' }

  [pscustomobject]@{ status='passed'; assertions=4 } | ConvertTo-Json -Compress
}
finally {
  if (Test-Path -LiteralPath $temp) { Remove-Item -LiteralPath $temp -Recurse -Force }
}
