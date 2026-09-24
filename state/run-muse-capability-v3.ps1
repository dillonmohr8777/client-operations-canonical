Set-Location 'C:\Users\dillo\Documents\Codex\projects\client-operations'
Write-Host 'Muse capability plan v3' -ForegroundColor Cyan
$one = Get-Content -Raw -Path 'state\MUSE-PROMPT-one-line.txt'
$one = $one.Trim()
Write-Host ('PROMPT_LEN=' + $one.Length)
Write-Host $one
& 'C:\Users\dillo\AppData\Local\Programs\muse\muse.cmd' exec --trust-workspace --approval-mode on-request --workspace 'C:\Users\dillo\Documents\Codex\projects\client-operations' -- $one 2>&1 | Tee-Object -FilePath 'state\muse-capability-plan-stdout-2026-09-17.log'
Write-Host 'Finished.' -ForegroundColor Green
