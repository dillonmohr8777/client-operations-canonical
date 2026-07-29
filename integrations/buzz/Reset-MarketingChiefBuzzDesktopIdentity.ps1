[CmdletBinding()]
param([switch]$RestartDesktop)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
. (Join-Path $PSScriptRoot 'MarketingChief.BuzzCredential.ps1')

$privateKeyHex = $null
$desktopSecret = $null
$pointer = [IntPtr]::Zero
$readBytes = $null
$writeBytes = $null
$writePointer = [IntPtr]::Zero
try {
    $privateKeyHex = Get-MarketingChiefBuzzPrivateKey -Target 'MarketingChief-Buzz-Owner'
    $nodeScript = @'
let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", chunk => input += chunk);
process.stdin.on("end", () => {
  const charset = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
  const generators = [0x3b6a57b2,0x26508e6d,0x1ea119fa,0x3d4233dd,0x2a1462b3];
  const polymod = values => {
    let chk = 1;
    for (const value of values) {
      const top = chk >>> 25;
      chk = ((chk & 0x1ffffff) << 5) ^ value;
      for (let i = 0; i < 5; i++) if ((top >>> i) & 1) chk ^= generators[i];
    }
    return chk >>> 0;
  };
  const hrp = "nsec";
  const bytes = Buffer.from(input.trim(), "hex");
  if (bytes.length !== 32) process.exit(2);
  let acc = 0, bits = 0;
  const words = [];
  for (const byte of bytes) {
    acc = (acc << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      words.push((acc >> bits) & 31);
    }
  }
  if (bits > 0) words.push((acc << (5 - bits)) & 31);
  const expand = [...hrp].map(ch => ch.charCodeAt(0) >> 5)
    .concat([0], [...hrp].map(ch => ch.charCodeAt(0) & 31));
  const mod = (polymod(expand.concat(words, [0,0,0,0,0,0])) ^ 1) >>> 0;
  const checksum = Array.from({length:6}, (_,i) => (mod >>> (5 * (5 - i))) & 31);
  process.stdout.write(hrp + "1" + words.concat(checksum).map(v => charset[v]).join(""));
});
'@
    $startInfo = [Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = 'node.exe'
    $startInfo.Arguments = '-e ' + ('"{0}"' -f $nodeScript.Replace('\', '\\').Replace('"', '\"').Replace("`r", '').Replace("`n", ' '))
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.RedirectStandardInput = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $process = [Diagnostics.Process]::new()
    $process.StartInfo = $startInfo
    try {
        if (-not $process.Start()) { throw 'Could not start the protected Buzz identity encoder.' }
        $process.StandardInput.Write($privateKeyHex)
        $process.StandardInput.Close()
        $desktopSecret = $process.StandardOutput.ReadToEnd().Trim()
        $process.WaitForExit()
        if ($process.ExitCode -ne 0 -or $desktopSecret -notmatch '^nsec1[023456789acdefghjklmnpqrstuvwxyz]{58}$') {
            throw 'Buzz identity encoding failed.'
        }
    }
    finally {
        if ($null -ne $process) { $process.Dispose() }
    }

    if (-not [MarketingChief.Win32.CredentialApi]::CredRead('secrets.buzz-desktop', 1, 0, [ref]$pointer)) {
        throw 'Buzz Desktop protected storage is unavailable.'
    }
    $stored = [Runtime.InteropServices.Marshal]::PtrToStructure($pointer, [type][MarketingChief.Win32.Credential])
    if ($stored.CredentialBlobSize -lt 20 -or $stored.CredentialBlobSize -gt 8192) { throw 'Buzz Desktop protected storage has an invalid size.' }
    $readBytes = New-Object byte[] $stored.CredentialBlobSize
    [Runtime.InteropServices.Marshal]::Copy($stored.CredentialBlob, $readBytes, 0, [int]$stored.CredentialBlobSize)
    $storedText = if ($readBytes.Length -ge 2 -and $readBytes[1] -eq 0) {
        [Text.Encoding]::Unicode.GetString($readBytes)
    } else {
        [Text.Encoding]::UTF8.GetString($readBytes)
    }
    try { $storedMap = $storedText | ConvertFrom-Json }
    catch { throw 'Buzz Desktop protected storage could not be parsed safely.' }
    $storedMap.identity = $desktopSecret
    $updatedJson = $storedMap | ConvertTo-Json -Depth 20 -Compress
    $writeBytes = [Text.Encoding]::Unicode.GetBytes($updatedJson)
    $writePointer = [Runtime.InteropServices.Marshal]::AllocCoTaskMem($writeBytes.Length)
    [Runtime.InteropServices.Marshal]::Copy($writeBytes, 0, $writePointer, $writeBytes.Length)
    $credential = New-Object MarketingChief.Win32.Credential
    $credential.Flags = 0
    $credential.Type = 1
    $credential.TargetName = 'secrets.buzz-desktop'
    $credential.Comment = 'Buzz Desktop protected identity store'
    $credential.CredentialBlobSize = [uint32]$writeBytes.Length
    $credential.CredentialBlob = $writePointer
    $credential.Persist = 2
    $credential.AttributeCount = 0
    $credential.Attributes = [IntPtr]::Zero
    $credential.TargetAlias = $null
    $credential.UserName = 'secrets'
    if (-not [MarketingChief.Win32.CredentialApi]::CredWrite([ref]$credential, 0)) {
        throw [ComponentModel.Win32Exception]::new([Runtime.InteropServices.Marshal]::GetLastWin32Error())
    }

    $publicKey = Get-MarketingChiefBuzzPublicKey -PrivateKeyHex $privateKeyHex
    $statePath = Join-Path $PSScriptRoot 'runtime\team-state.json'
    if (Test-Path -LiteralPath $statePath -PathType Leaf) {
        $state = Get-Content -Raw -LiteralPath $statePath -Encoding UTF8 | ConvertFrom-Json
        $state.ownerPublicKey = $publicKey
        $ownerRow = @($state.identities | Where-Object { [string]$_.id -ceq 'dillon' })[0]
        if ($null -ne $ownerRow) { $ownerRow.publicKey = $publicKey }
        $state.status = 'awaiting_auth'
        $state.lastCheckedAt = [DateTimeOffset]::UtcNow.ToString('o')
        $state.summary = 'Buzz Desktop and the local bridge use the same protected owner identity. Hosted community authentication is still required.'
        [IO.File]::WriteAllText($statePath, (($state | ConvertTo-Json -Depth 20) + [Environment]::NewLine), [Text.UTF8Encoding]::new($false))
    }

    if ($RestartDesktop) {
        Get-Process -Name 'buzz-desktop' -ErrorAction SilentlyContinue | Stop-Process -Force
        Start-Process -FilePath 'C:\Users\dillo\AppData\Local\Buzz\buzz-desktop.exe'
    }
    [pscustomobject][ordered]@{
        rotated = $true
        publicKey = $publicKey
        desktopAligned = $true
        restarted = [bool]$RestartDesktop
    }
}
finally {
    if ($pointer -ne [IntPtr]::Zero) { [MarketingChief.Win32.CredentialApi]::CredFree($pointer) }
    if ($writePointer -ne [IntPtr]::Zero) {
        for ($index = 0; $index -lt $writeBytes.Length; $index++) { [Runtime.InteropServices.Marshal]::WriteByte($writePointer, $index, 0) }
        [Runtime.InteropServices.Marshal]::FreeCoTaskMem($writePointer)
    }
    if ($null -ne $readBytes) { [Array]::Clear($readBytes, 0, $readBytes.Length) }
    if ($null -ne $writeBytes) { [Array]::Clear($writeBytes, 0, $writeBytes.Length) }
    $privateKeyHex = $null
    $desktopSecret = $null
}
