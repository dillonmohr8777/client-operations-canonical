[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-z0-9][a-z0-9-]{2,79}$')]
    [string]$BatchId
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

$root = Split-Path -Parent $PSScriptRoot
$validator = Join-Path $PSScriptRoot 'Validate-GrokVideoFactoryBatch.py'
if (-not (Test-Path -LiteralPath $validator -PathType Leaf)) {
    throw 'Grok video batch validator is unavailable.'
}

& python $validator --root $root --batch-id $BatchId
exit $LASTEXITCODE
