[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$AgentPath,
    [Parameter(Mandatory = $true)][string]$Workspace,
    [Parameter(Mandatory = $true)][string]$PromptPath,
    [string]$Model
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

$AgentPath = [IO.Path]::GetFullPath($AgentPath)
$Workspace = [IO.Path]::GetFullPath($Workspace).TrimEnd('\')
$PromptPath = [IO.Path]::GetFullPath($PromptPath)

if (-not (Test-Path -LiteralPath $AgentPath -PathType Leaf)) {
    throw 'Cursor Agent launcher is unavailable.'
}
if (-not (Test-Path -LiteralPath $Workspace -PathType Container)) {
    throw 'Cursor Agent workspace is unavailable.'
}
if (-not (Test-Path -LiteralPath (Join-Path $Workspace 'AGENTS.md') -PathType Leaf)) {
    throw 'Cursor Agent workspace is not the governed Marketing Chief root.'
}
if (-not (Test-Path -LiteralPath $PromptPath -PathType Leaf)) {
    throw 'Cursor Agent prompt is unavailable.'
}

$prompt = Get-Content -LiteralPath $PromptPath -Raw -Encoding UTF8
if ([string]::IsNullOrWhiteSpace($prompt) -or $prompt.Length -gt 20000) {
    throw 'Cursor Agent prompt has an invalid size.'
}
if ($prompt -match '(?i)(?:bw://item/|authorization["'']?\s*[:=]\s*["'']?bearer|password\s*[:=]|api[_ -]?key\s*[:=]|access[_ -]?token\s*[:=])') {
    throw 'Cursor Agent prompt contains prohibited secret-shaped material.'
}
if (-not [string]::IsNullOrWhiteSpace($Model) -and $Model -notmatch '^[a-z0-9][a-z0-9.\-\[\],=_]{1,199}$') {
    throw 'Cursor Agent model identifier is invalid.'
}

$arguments = @('-p', '--force', '--trust', '--workspace', $Workspace, '--output-format', 'json')
if (-not [string]::IsNullOrWhiteSpace($Model)) {
    $arguments += @('--model', $Model)
}
$arguments += $prompt

& $AgentPath @arguments
exit $LASTEXITCODE
