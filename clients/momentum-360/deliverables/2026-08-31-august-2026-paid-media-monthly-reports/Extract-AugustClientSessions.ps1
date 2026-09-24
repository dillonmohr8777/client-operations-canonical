[CmdletBinding()]
param(
    [string]$SessionsRoot = 'C:\Users\dillo\.codex\sessions\2026\08',
    [string]$OutputPath = (Join-Path $PSScriptRoot 'august-client-session-corpus.json')
)

$clientPatterns = [ordered]@{
    'kimberly-james-bridal' = '(?i)\bkimberly\b|\bkjb\b|kimberly james bridal'
    'replenish-7-eleven' = '(?i)\breplenish\b|7[ -]?eleven'
    'omega-landscaping' = '(?i)\bomega landscaping\b|\bomega\b'
    'onsite-concrete-landscape' = '(?i)\bonsite concrete\b|\bonsite\b'
    'nexla' = '(?i)\bnexla\b'
    'puttery' = '(?i)\bputtery\b|\btock\b'
    'fagan-painting' = '(?i)\bfagan(?: painting)?\b'
    'nkcdc' = '(?i)\bnkcdc\b|new kensington community development corporation'
    'hope-wellness-center' = '(?i)\bhope wellness(?: center)?\b|\bthe hope wellness center\b'
    'bar-crawl-usa' = '(?i)\bbar crawl usa\b|\bbarcrawlusa\b|\bbcusa\b'
    'va-claims-edge' = '(?i)\bva claims(?: edge)?\b|\bvaclaimsedge\b'
    'revive-systems' = '(?i)\brevive systems\b'
    'bridge-software' = '(?i)\bbridge software\b|\bbridge software development\b|\bbridge-connected-signal\b'
}

$sessions = [System.Collections.Generic.List[object]]::new()

Get-ChildItem -LiteralPath $SessionsRoot -Filter '*.jsonl' -Recurse -File | Sort-Object FullName | ForEach-Object {
    $sessionId = $null
    $sessionTimestamp = $null
    $cwd = $null
    $messages = [System.Collections.Generic.List[object]]::new()
    $userText = [System.Collections.Generic.List[string]]::new()

    $stream = [System.IO.FileStream]::new(
        $_.FullName,
        [System.IO.FileMode]::Open,
        [System.IO.FileAccess]::Read,
        [System.IO.FileShare]::ReadWrite
    )
    $reader = [System.IO.StreamReader]::new($stream)
    try {
    while (-not $reader.EndOfStream) {
        $line = $reader.ReadLine()
        if ($line -notmatch '"type":"(session_meta|event_msg)"') {
            continue
        }

        try {
            $entry = $line | ConvertFrom-Json -Depth 100
        }
        catch {
            continue
        }

        if ($entry.type -eq 'session_meta') {
            $sessionId = if ($entry.payload.id) { [string]$entry.payload.id } else { [string]$entry.payload.session_id }
            $sessionTimestamp = [string]$entry.payload.timestamp
            $cwd = [string]$entry.payload.cwd
            continue
        }

        if ($entry.type -ne 'event_msg') {
            continue
        }

        $payloadType = [string]$entry.payload.type
        if ($payloadType -eq 'user_message') {
            $message = [string]$entry.payload.message
            if (-not [string]::IsNullOrWhiteSpace($message)) {
                $userText.Add($message)
                $messages.Add([ordered]@{
                    timestamp = [string]$entry.timestamp
                    role = 'user'
                    phase = 'request'
                    text = $message
                })
            }
        }
        elseif ($payloadType -eq 'agent_message') {
            $message = [string]$entry.payload.message
            if (-not [string]::IsNullOrWhiteSpace($message)) {
                $messages.Add([ordered]@{
                    timestamp = [string]$entry.timestamp
                    role = 'assistant'
                    phase = [string]$entry.payload.phase
                    text = $message
                })
            }
        }
    }
    }
    finally {
        $reader.Dispose()
        $stream.Dispose()
    }

    $joinedUserText = $userText -join "`n"
    $clientIds = [System.Collections.Generic.List[string]]::new()
    foreach ($pair in $clientPatterns.GetEnumerator()) {
        if ($joinedUserText -match $pair.Value) {
            $clientIds.Add([string]$pair.Key)
        }
    }

    if ($clientIds.Count -eq 0) {
        return
    }

    $assistantFinals = @($messages | Where-Object { $_.role -eq 'assistant' -and $_.phase -eq 'final_answer' })
    $assistantEvidence = if ($assistantFinals.Count -gt 0) {
        $assistantFinals
    }
    else {
        @($messages | Where-Object { $_.role -eq 'assistant' } | Select-Object -Last 6)
    }

    $sessions.Add([ordered]@{
        sessionId = $sessionId
        timestamp = $sessionTimestamp
        cwd = $cwd
        sourcePath = $_.FullName
        clientIds = @($clientIds)
        userMessages = @($messages | Where-Object { $_.role -eq 'user' })
        assistantEvidence = @($assistantEvidence)
    })
}

$output = [ordered]@{
    generatedAt = (Get-Date).ToUniversalTime().ToString('o')
    period = '2026-08-01 through 2026-08-31'
    sessionsRoot = $SessionsRoot
    sessionCount = $sessions.Count
    clientSessionCounts = [ordered]@{}
    sessions = @($sessions)
}

foreach ($clientId in $clientPatterns.Keys) {
    $output.clientSessionCounts[$clientId] = @($sessions | Where-Object { $_.clientIds -contains $clientId }).Count
}

$json = $output | ConvertTo-Json -Depth 20
[System.IO.File]::WriteAllText($OutputPath, $json, [System.Text.UTF8Encoding]::new($false))

[ordered]@{
    outputPath = $OutputPath
    sessionCount = $sessions.Count
    clientSessionCounts = $output.clientSessionCounts
    sha256 = (Get-FileHash -LiteralPath $OutputPath -Algorithm SHA256).Hash.ToLowerInvariant()
} | ConvertTo-Json -Depth 10
