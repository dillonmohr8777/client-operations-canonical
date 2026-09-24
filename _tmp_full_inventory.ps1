$repo = "C:\Users\dillo\repos\claude-skills-repo"
Push-Location $repo
$paths = git ls-tree -r --name-only HEAD | Where-Object { $_ -match 'SKILL\.md$' }
Pop-Location

"TOTAL_SKILL_MD_IN_TREE: $($paths.Count)"

$rows = @()
$totalWords = 0
foreach ($p in $paths) {
    $content = git -C $repo show ("HEAD:" + $p) 2>$null
    $text = ($content -join "`n")
    $w = ($text -split '\s+' | Where-Object { $_ -ne '' }).Count
    $totalWords += $w
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($text)
    $sha = [System.Security.Cryptography.SHA256]::Create()
    $hashBytes = $sha.ComputeHash($bytes)
    $hash = [System.BitConverter]::ToString($hashBytes).Replace('-','')
    $segs = $p -split '/'
    # top = second segment (first after 'skills/'), since everything lives under skills/
    $top = if ($segs.Count -gt 1) { $segs[1] } else { $segs[0] }
    $skillName = $segs[$segs.Count - 2]
    $rows += [PSCustomObject]@{ Path=$p; Top=$top; Words=$w; Hash=$hash; SkillName=$skillName; LineCount=($text -split "`n").Count; Text=$text }
}

"TOTAL_WORDS: $totalWords"
""
"=== BY TOP-LEVEL (2nd path segment) ==="
$rows | Group-Object Top | ForEach-Object {
    [PSCustomObject]@{ TopDir=$_.Name; Count=$_.Count; Words=($_.Group | Measure-Object Words -Sum).Sum }
} | Sort-Object Count -Descending | Export-Csv "C:\Users\dillo\Documents\Codex\projects\client-operations\_tmp_bytop.csv" -NoTypeInformation

$rows | Select-Object Path,Top,Words,Hash,SkillName,LineCount | Export-Csv "C:\Users\dillo\Documents\Codex\projects\client-operations\_tmp_allrows.csv" -NoTypeInformation

"=== HASH DEDUPE ==="
$uniqueHashes = ($rows | Select-Object -ExpandProperty Hash -Unique)
"UNIQUE_HASHES: $($uniqueHashes.Count) / TOTAL: $($rows.Count)"

$byHash = $rows | Group-Object Hash
$crossDupFiles = 0
$crossDupGroups = 0
foreach ($g in $byHash) {
    $tops = $g.Group.Top | Select-Object -Unique
    if ($tops.Count -gt 1) { $crossDupFiles += $g.Count; $crossDupGroups++ }
}
"CROSS_TOPDIR_DUP_GROUPS: $crossDupGroups  FILES_INVOLVED: $crossDupFiles"

"=== NAME-LEVEL DUPES ACROSS TOPDIRS ==="
$byName = $rows | Group-Object SkillName
$multi = $byName | Where-Object { ($_.Group.Top | Select-Object -Unique).Count -gt 1 }
"SKILL_NAMES_IN_MULTIPLE_TOPDIRS: $($multi.Count)"

$rows | Group-Object Hash | ForEach-Object { $_ } | Out-Null

# Save rows object for later use
$rows | Export-Csv "C:\Users\dillo\Documents\Codex\projects\client-operations\_tmp_rows_full.csv" -NoTypeInformation
