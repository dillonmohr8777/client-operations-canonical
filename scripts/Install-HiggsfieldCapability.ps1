[CmdletBinding()]
param(
    [string]$ProjectRoot,
    [switch]$InstallCli,
    [switch]$InstallOfficialSkills,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

if ([string]::IsNullOrWhiteSpace($ProjectRoot)) {
    $ProjectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
}

$cursorDir = Join-Path $ProjectRoot '.cursor'
$mcpSource = Join-Path $ProjectRoot 'integrations/higgsfield/mcp.cursor.json'
$mcpDest = Join-Path $cursorDir 'mcp.json'
$skillSource = Join-Path $ProjectRoot 'integrations/higgsfield/skills/higgsfield-marketing-chief/SKILL.md'
$skillDestDir = Join-Path $cursorDir 'skills/higgsfield-marketing-chief'
$skillDest = Join-Path $skillDestDir 'SKILL.md'
$ruleDestDir = Join-Path $cursorDir 'rules'
$ruleDest = Join-Path $ruleDestDir 'higgsfield-mcp.mdc'
$ruleSource = Join-Path $ProjectRoot '.cursor/rules/higgsfield-mcp.mdc'

$actions = New-Object System.Collections.ArrayList
$humanHandoffs = New-Object System.Collections.ArrayList

function Add-Action {
    param([string]$Name, [string]$Status, [string]$Detail)
    [void]$actions.Add([pscustomobject][ordered]@{ name = $Name; status = $Status; detail = $Detail })
}

function Copy-TextFile {
    param([string]$From, [string]$To)
    if (-not (Test-Path -LiteralPath $From -PathType Leaf)) {
        throw "Install source is missing: $From"
    }
    $dir = Split-Path -Parent $To
    if ($DryRun) {
        Add-Action ([IO.Path]::GetFileName($To)) 'would-write' $To
        return
    }
    if (-not (Test-Path -LiteralPath $dir)) {
        [IO.Directory]::CreateDirectory($dir) | Out-Null
    }
    $bytes = [IO.File]::ReadAllBytes($From)
    [IO.File]::WriteAllBytes($To, $bytes)
    Add-Action ([IO.Path]::GetFileName($To)) 'written' $To
}

if (-not (Test-Path -LiteralPath $mcpSource -PathType Leaf)) { throw "Missing $mcpSource" }
if (-not (Test-Path -LiteralPath $skillSource -PathType Leaf)) { throw "Missing $skillSource" }

Copy-TextFile -From $mcpSource -To $mcpDest
Copy-TextFile -From $skillSource -To $skillDest
if (Test-Path -LiteralPath $ruleSource -PathType Leaf) {
    Copy-TextFile -From $ruleSource -To $ruleDest
}

$cli = Get-Command higgsfield -ErrorAction SilentlyContinue
if ($InstallCli) {
    if ($null -ne $cli) {
        Add-Action 'higgsfield-cli' 'already-installed' ([string]$cli.Source)
    } elseif ($DryRun) {
        Add-Action 'higgsfield-cli' 'would-install' 'Official install script or npm package'
    } else {
        $npm = Get-Command npm -ErrorAction SilentlyContinue
        if ($null -ne $npm) {
            & $npm.Source @('i','-g','@higgsfield/cli')
            if ($LASTEXITCODE -ne 0) { throw 'npm install of @higgsfield/cli failed.' }
            Add-Action 'higgsfield-cli' 'installed' '@higgsfield/cli'
        } else {
            throw 'npm is required to install @higgsfield/cli on this machine.'
        }
    }
    [void]$humanHandoffs.Add('higgsfield auth login')
} else {
    Add-Action 'higgsfield-cli' $(if ($null -ne $cli) { 'present' } else { 'skipped' }) 'Pass -InstallCli to install. Auth remains a human handoff.'
}

if ($InstallOfficialSkills) {
    if ($DryRun) {
        Add-Action 'official-skills' 'would-install' 'npx skills add higgsfield-ai/skills'
    } else {
        $npx = Get-Command npx -ErrorAction SilentlyContinue
        if ($null -eq $npx) { throw 'npx is required to install higgsfield-ai/skills.' }
        & $npx.Source @('--yes','skills','add','higgsfield-ai/skills')
        if ($LASTEXITCODE -ne 0) { throw 'npx skills add higgsfield-ai/skills failed.' }
        Add-Action 'official-skills' 'installed' 'higgsfield-ai/skills'
    }
} else {
    Add-Action 'official-skills' 'skipped' 'Pass -InstallOfficialSkills to install the official coding-agent pack.'
}

[void]$humanHandoffs.Add('Sign in to Higgsfield when Cursor prompts for MCP OAuth')
[void]$humanHandoffs.Add('Do not generate a paid test image unless Dillon approves the credit spend')

$installStatus = 'installed'
if ($DryRun) { $installStatus = 'dry-run' }
[pscustomobject][ordered]@{
    status = $installStatus
    checkedAt = [DateTimeOffset]::UtcNow.ToString('o')
    projectRoot = $ProjectRoot
    dryRun = [bool]$DryRun
    actions = @($actions.ToArray())
    humanHandoffs = @($humanHandoffs.ToArray())
    chatgptPluginIsProduction = $false
    containsSecrets = $false
} | ConvertTo-Json -Depth 6
