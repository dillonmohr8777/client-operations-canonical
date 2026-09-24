[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-z0-9][a-z0-9-]{2,79}$')]
    [string]$BatchId,

    [string]$Model = 'cursor-grok-4.5-high'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

$root = Split-Path -Parent $PSScriptRoot
$videoWorkRoot = [IO.Path]::GetFullPath((Join-Path $root 'work\video-factory'))
$batchRoot = [IO.Path]::GetFullPath((Join-Path $videoWorkRoot $BatchId))
$promptPath = Join-Path $batchRoot 'CURSOR_GROK_4_5_PROMPT.md'
$launcher = Get-Command cursor-agent -ErrorAction SilentlyContinue

if (-not $batchRoot.StartsWith(($videoWorkRoot.TrimEnd('\') + '\'), [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Video batch path escapes the governed work root.'
}
if (-not (Test-Path -LiteralPath $batchRoot -PathType Container)) {
    throw "Video batch does not exist: $BatchId"
}
if (-not (Test-Path -LiteralPath $promptPath -PathType Leaf)) {
    throw 'Cursor Grok prompt is unavailable.'
}
if (-not $launcher) {
    throw 'Cursor Agent launcher is unavailable.'
}
if ($Model -notlike 'cursor-grok-4.5-*') {
    throw 'This workflow is locked to Cursor Grok 4.5.'
}

$statusOutput = & $launcher.Source status 2>&1
if ($LASTEXITCODE -ne 0 -or ($statusOutput -join "`n") -notmatch 'Logged in') {
    throw 'Cursor Agent is not authenticated.'
}

& (Join-Path $PSScriptRoot 'Invoke-CursorAgentPrompt.ps1') `
    -AgentPath $launcher.Source `
    -Workspace $root `
    -PromptPath $promptPath `
    -Model $Model

exit $LASTEXITCODE
