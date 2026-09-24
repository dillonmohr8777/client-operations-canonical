$repo = "C:\Users\dillo\repos\claude-skills-repo"
$files = Get-ChildItem -Recurse -Filter SKILL.md -Path $repo

$totalWords = 0
$rows = @()
foreach ($f in $files) {
    $w = (Get-Content -Raw $f.FullName | Measure-Object -Word).Words
    $totalWords += $w
    $rel = $f.FullName.Substring($repo.Length + 1)
    $top = $rel.Split('\')[0]
    $hash = (Get-FileHash $f.FullName -Algorithm SHA256).Hash
    $parentName = $f.Directory.Name
    $rows += [PSCustomObject]@{ Rel=$rel; Top=$top; Words=$w; Hash=$hash; SkillName=$parentName; FullPath=$f.FullName }
}

"TOTAL_FILES: $($files.Count)"
"TOTAL_WORDS: $totalWords"
""
"=== BY TOP-LEVEL DIR ==="
$rows | Group-Object Top | ForEach-Object {
    [PSCustomObject]@{ TopDir=$_.Name; Count=$_.Count; Words=($_.Group | Measure-Object Words -Sum).Sum }
} | Sort-Object Words -Descending | Format-Table -AutoSize | Out-String -Width 200

"=== HASH DEDUPE ==="
$uniqueHashes = $rows | Select-Object -ExpandProperty Hash -Unique
"UNIQUE_HASHES: $($uniqueHashes.Count) / TOTAL: $($rows.Count)"

"=== CROSS-TOPDIR EXACT DUPLICATES (same hash, different Top) ==="
$byHash = $rows | Group-Object Hash
$crossDupCount = 0
foreach ($g in $byHash) {
    $tops = $g.Group.Top | Select-Object -Unique
    if ($tops.Count -gt 1) {
        $crossDupCount += $g.Count
    }
}
"FILES_IN_CROSS_TOPDIR_DUP_GROUPS: $crossDupCount"

"=== SKILL NAME APPEARING IN >1 TOPDIR (sample) ==="
$byName = $rows | Group-Object SkillName
$multi = $byName | Where-Object { ($_.Group.Top | Select-Object -Unique).Count -gt 1 }
"NAMES_IN_MULTIPLE_TOPDIRS: $($multi.Count)"
$multi | Select-Object -First 25 | ForEach-Object {
    $tops = ($_.Group | Select-Object Top, Hash, FullPath)
    "NAME: $($_.Name) -- occurrences: $($_.Count)"
    $tops | ForEach-Object { "    $($_.Top) | $($_.Hash.Substring(0,10)) | $($_.FullPath)" }
}

$rows | Export-Csv -Path "C:\Users\dillo\Documents\Codex\projects\client-operations\_tmp_inventory_rows.csv" -NoTypeInformation
