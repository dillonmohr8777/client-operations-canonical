[CmdletBinding()]
param(
    [string]$InputPath = (Join-Path $PSScriptRoot 'august-client-session-corpus.json'),
    [string]$OutputDirectory = (Join-Path $PSScriptRoot 'session-briefs')
)

$corpus = Get-Content -LiteralPath $InputPath -Raw | ConvertFrom-Json -Depth 30
New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null

$summary = [System.Collections.Generic.List[object]]::new()

foreach ($clientId in $corpus.clientSessionCounts.PSObject.Properties.Name) {
    $clientSessions = @($corpus.sessions | Where-Object { $_.clientIds -contains $clientId })
    $lines = [System.Collections.Generic.List[string]]::new()
    $lines.Add("# $clientId")
    $lines.Add('')
    $lines.Add("Sessions reviewed: $($clientSessions.Count)")
    $lines.Add('')

    foreach ($session in $clientSessions) {
        $lines.Add("## $($session.timestamp) | $($session.sessionId)")
        $request = @($session.userMessages | Select-Object -First 1).text -join ' '
        if (-not [string]::IsNullOrWhiteSpace($request)) {
            $request = ($request -replace '\s+', ' ').Trim()
            if ($request.Length -gt 500) {
                $request = $request.Substring(0, 500) + '...'
            }
            $lines.Add("Request: $request")
        }

        foreach ($evidence in @($session.assistantEvidence)) {
            $text = ([string]$evidence.text).Trim()
            if (-not [string]::IsNullOrWhiteSpace($text)) {
                $lines.Add('')
                $lines.Add($text)
            }
        }
        $lines.Add('')
    }

    $outputPath = Join-Path $OutputDirectory "$clientId.md"
    [System.IO.File]::WriteAllLines($outputPath, $lines, [System.Text.UTF8Encoding]::new($false))
    $file = Get-Item -LiteralPath $outputPath
    $summary.Add([ordered]@{
        clientId = $clientId
        sessionCount = $clientSessions.Count
        outputPath = $outputPath
        bytes = $file.Length
        sha256 = (Get-FileHash -LiteralPath $outputPath -Algorithm SHA256).Hash.ToLowerInvariant()
    })
}

$summary | ConvertTo-Json -Depth 5
