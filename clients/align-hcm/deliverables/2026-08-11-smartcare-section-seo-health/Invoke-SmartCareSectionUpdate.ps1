param(
  [Parameter(Position = 0)]
  [ValidateSet("inspect", "deploy", "optimize")]
  [string]$Command = "inspect"
)

$ErrorActionPreference = "Stop"
$secretPath = "C:\Users\dillo\Documents\Codex\2026-07-12\hubspot-agent-set-jasonhubspottoken-ps1-hubspot\hubspot-agent\.secrets\align-hubspot-token.dpapi"
$scriptPath = Join-Path $PSScriptRoot "update-smartcare-section.mjs"
$previousServiceKey = $env:HUBSPOT_SERVICE_KEY
$loadedProtectedToken = $false

try {
  if (!$env:HUBSPOT_SERVICE_KEY) {
    if (!(Test-Path -LiteralPath $secretPath)) {
      throw "The protected Align HCM HubSpot token was not found."
    }

    $secure = ConvertTo-SecureString (Get-Content -LiteralPath $secretPath -Raw)
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try {
      $env:HUBSPOT_SERVICE_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
      $loadedProtectedToken = $true
    } finally {
      if ($ptr -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
      }
    }
  }

  & node $scriptPath $Command
  if ($LASTEXITCODE -ne 0) {
    throw "The SmartCare section update failed with exit code $LASTEXITCODE."
  }
} finally {
  if ($loadedProtectedToken) {
    if ($null -eq $previousServiceKey) {
      Remove-Item Env:HUBSPOT_SERVICE_KEY -ErrorAction SilentlyContinue
    } else {
      $env:HUBSPOT_SERVICE_KEY = $previousServiceKey
    }
  }
}
