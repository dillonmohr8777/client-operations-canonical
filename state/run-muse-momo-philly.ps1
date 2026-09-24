Set-Location 'C:\Users\dillo\Documents\Codex\projects\client-operations'
Write-Host 'Muse Momo + Philly finish' -ForegroundColor Cyan
$one = (Get-Content -Raw 'state\MUSE-PROMPT-momo-philly-one-line.txt').Trim()
Write-Host ('PROMPT_LEN=' + $one.Length)
& 'C:\Users\dillo\AppData\Local\Programs\muse\muse.cmd' exec --trust-workspace --approval-mode on-request --workspace 'C:\Users\dillo\Documents\Codex\projects\client-operations' -- $one 2>&1 | Tee-Object -FilePath 'state\muse-momo-philly-stdout-2026-09-17.log'
Write-Host 'Finished.' -ForegroundColor Green
