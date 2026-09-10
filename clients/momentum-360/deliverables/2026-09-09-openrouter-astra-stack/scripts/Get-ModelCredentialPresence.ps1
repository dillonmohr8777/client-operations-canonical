param(
  [string]$OutPath = (Join-Path $PSScriptRoot "..\credential-presence.json")
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not ("Codex.FrontierCredPresence.NativeMethods" -as [type])) {
  Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
namespace Codex.FrontierCredPresence {
  public static class NativeMethods {
    [DllImport("Advapi32.dll", EntryPoint = "CredReadW", CharSet = CharSet.Unicode, SetLastError = true)]
    public static extern bool CredRead(string target, UInt32 type, UInt32 flags, out IntPtr credentialPtr);
    [DllImport("Advapi32.dll", SetLastError = true)]
    public static extern void CredFree(IntPtr buffer);
  }
}
'@
}

$targets = @(
  "Codex/OpenAI/Momentum360/Astra",
  "Hermes/OpenRouter/Hermes Zero Credit",
  "Codex/TelegramModelGateway/OpenRouter",
  "Codex/TelegramModelGateway/InferenceNet",
  "Codex/ZAI/GLM-5.3-Flash",
  "Codex/ZAI/GLM-5.3-CodingPlan",
  "Codex/TelegramModelGateway/TelegramBot",
  "Codex/OpenAI/API",
  "Codex/OpenAI/Personal",
  "Codex/Anthropic/API",
  "Codex/Google/Gemini",
  "Codex/xAI/API"
)

$rows = foreach ($target in $targets) {
  $ptr = [IntPtr]::Zero
  $present = $false
  $win32 = 0
  try {
    $present = [Codex.FrontierCredPresence.NativeMethods]::CredRead($target, 1, 0, [ref]$ptr)
    if (-not $present) {
      $win32 = [Runtime.InteropServices.Marshal]::GetLastWin32Error()
    }
  } finally {
    if ($ptr -ne [IntPtr]::Zero) {
      [Codex.FrontierCredPresence.NativeMethods]::CredFree($ptr)
    }
  }
  [pscustomobject]@{
    target = $target
    present = [bool]$present
    win32 = if ($present) { 0 } else { $win32 }
  }
}

$payload = [pscustomobject]@{
  generatedAtUtc = [DateTime]::UtcNow.ToString("o")
  locators = $rows
  envOmnirouteUser = [bool][Environment]::GetEnvironmentVariable("OMNIROUTE_API_KEY", "User")
  envOmnirouteProcess = [bool][Environment]::GetEnvironmentVariable("OMNIROUTE_API_KEY", "Process")
  xaiDpapiPresent = [bool](Test-Path -LiteralPath "C:\Users\dillo\AppData\Local\Codex\Secrets\xai-dillon-os-daily-x-search.dpapi")
}
$payload | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $OutPath -Encoding utf8
$payload | ConvertTo-Json -Depth 5
