$rows = Import-Csv 'C:\Users\dillo\Documents\Codex\projects\client-operations\_tmp_allrows.csv'
$byName = $rows | Group-Object SkillName | Where-Object { ($_.Group.Top | Select-Object -Unique).Count -gt 1 }
$sample = $byName | Select-Object -First 15
foreach ($g in $sample) {
    $hashes = $g.Group.Hash | Select-Object -Unique
    $status = if ($hashes.Count -eq 1) { 'IDENTICAL' } else { 'DIFFERS' }
    $topsStr = ($g.Group.Top | Select-Object -Unique) -join ','
    "$($g.Name) [$($g.Count) copies, tops: $topsStr]: $status"
}

"=== ONLY-IN-MIRROR SKILL NAMES (per mirror) ==="
$mirrors = @('.gemini','engineering','engineering-team','marketing-skill','c-level-advisor','product-team','ra-qm-team','project-management','agenthub','autoresearch-agent','self-improving-agent','executive-mentor','business-growth','finance','skill-tester','playwright-pro')
$canonicalNames = ($rows | Where-Object { ($_.Path -split '/').Count -eq 3 } | Select-Object -ExpandProperty SkillName) | Select-Object -Unique
foreach ($m in $mirrors) {
    $mirrorRows = $rows | Where-Object { $_.Top -eq $m }
    $mirrorNames = $mirrorRows | Select-Object -ExpandProperty SkillName | Select-Object -Unique
    $onlyHere = $mirrorNames | Where-Object { $canonicalNames -notcontains $_ }
    "-- $m ($($onlyHere.Count) names only-in-mirror of $($mirrorNames.Count) total) --"
    $onlyHere | Select-Object -First 10
}
