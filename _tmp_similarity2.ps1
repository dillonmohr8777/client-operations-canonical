$repo = "C:\Users\dillo\repos\claude-skills-repo"
$rows = Import-Csv 'C:\Users\dillo\Documents\Codex\projects\client-operations\_tmp_allrows.csv'
$byName = $rows | Group-Object SkillName | Where-Object { ($_.Group.Top | Select-Object -Unique).Count -gt 1 }
$samples = @('a11y-audit','ab-test-setup','agent-designer','agile-product-owner','api-design-reviewer','ai-security','ad-creative','analytics-tracking','agent-protocol','adversarial-reviewer')
foreach ($name in $samples) {
    $g = $byName | Where-Object { $_.Name -eq $name }
    $canon = $g.Group | Where-Object { ($_.Path -split '/').Count -eq 3 } | Select-Object -First 1
    $mirror = $g.Group | Where-Object { $_.Path -ne $canon.Path -and $_.Top -ne '.gemini' } | Select-Object -First 1
    if (-not $mirror) { continue }
    if ($canon.Hash -eq $mirror.Hash) {
        "$name [$($mirror.Top)] : IDENTICAL (same hash)"
        continue
    }
    $c1 = (git -C $repo show ("HEAD:" + $canon.Path)) -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }
    $c2 = (git -C $repo show ("HEAD:" + $mirror.Path)) -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }
    $set1 = $c1 | Select-Object -Unique
    $set2 = $c2 | Select-Object -Unique
    $shared = (Compare-Object $set1 $set2 -IncludeEqual -ExcludeDifferent).Count
    $maxLines = [Math]::Max($set1.Count, $set2.Count)
    $pct = [Math]::Round(100 * $shared / $maxLines, 1)
    "$name [$($mirror.Top)] : canon_lines=$($set1.Count) mirror_lines=$($set2.Count) shared=$shared similarity=$pct%"
}
