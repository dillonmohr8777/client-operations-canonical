[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
. 'C:\Users\dillo\.codex\terminal-bootstrap.ps1'
$source = 'C:\Users\dillo\Documents\Codex\worktrees\client-ops-claude-creative-factory-20260902\clients\puttery-nyc\deliverables\2026-09-01-tock-reservation-webhook\public-relay\scripts\Drain-TockRelay.ps1'
$code = [IO.File]::ReadAllText($source)
$start = $code.IndexOf("if (-not ('Codex.PutteryDrainCredential.NativeMethods'")
$end = $code.IndexOf('function Invoke-Receiver')
if ($start -lt 0 -or $end -le $start) { throw 'protected_reader_unavailable' }
. ([scriptblock]::Create($code.Substring($start, $end - $start)))
try {
    $env:TOCK_RELAY_DRAIN_TOKEN = Read-ProtectedValue -EnvName 'TOCK_RELAY_DRAIN_TOKEN' -Target 'Codex.ClientAccess.PutteryNYC.TockRelayDrainToken'
    & 'C:\Program Files\nodejs\node.exe' (Join-Path $PSScriptRoot 'publish-dashboard-status.mjs')
    $resultCode = $LASTEXITCODE
} finally { Remove-Item Env:\TOCK_RELAY_DRAIN_TOKEN -ErrorAction SilentlyContinue }
exit $resultCode
