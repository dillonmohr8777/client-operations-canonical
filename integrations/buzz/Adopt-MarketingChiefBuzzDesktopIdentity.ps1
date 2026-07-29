[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
. (Join-Path $PSScriptRoot 'MarketingChief.BuzzCredential.ps1')

$sourceTarget = 'secrets.buzz-desktop'
$pointer = [IntPtr]::Zero
$bytes = $null
$blobText = $null
$desktopSecret = $null
$privateKeyHex = $null
if (-not [MarketingChief.Win32.CredentialApi]::CredRead($sourceTarget, 1, 0, [ref]$pointer)) {
    throw 'Buzz Desktop has not created its protected identity yet.'
}
try {
    $credential = [Runtime.InteropServices.Marshal]::PtrToStructure($pointer, [type][MarketingChief.Win32.Credential])
    if ($credential.CredentialBlobSize -lt 40 -or $credential.CredentialBlobSize -gt 8192) {
        throw 'Buzz Desktop protected storage returned an invalid blob size.'
    }
    $bytes = New-Object byte[] $credential.CredentialBlobSize
    [Runtime.InteropServices.Marshal]::Copy($credential.CredentialBlob, $bytes, 0, [int]$credential.CredentialBlobSize)
    $blobText = if ($bytes.Length -ge 2 -and $bytes[1] -eq 0) {
        [Text.Encoding]::Unicode.GetString($bytes)
    } else {
        [Text.Encoding]::UTF8.GetString($bytes)
    }
    try { $blob = $blobText | ConvertFrom-Json }
    catch { throw 'Buzz Desktop protected storage could not be parsed safely.' }
    $desktopSecret = [string]$blob.identity
    if ($desktopSecret -notmatch '^nsec1[023456789acdefghjklmnpqrstuvwxyz]{58}$') {
        throw 'Buzz Desktop protected identity has an invalid shape.'
    }

    $nodeScript = @'
let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", chunk => input += chunk);
process.stdin.on("end", () => {
  const charset = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
  const value = input.trim().toLowerCase();
  if (!value.startsWith("nsec1")) process.exit(2);
  const encoded = value.slice(5);
  const words = [...encoded].map(ch => charset.indexOf(ch));
  if (words.some(v => v < 0) || words.length < 7) process.exit(3);
  const payload = words.slice(0, -6);
  let acc = 0, bits = 0;
  const output = [];
  for (const word of payload) {
    acc = (acc << 5) | word;
    bits += 5;
    while (bits >= 8) {
      bits -= 8;
      output.push((acc >> bits) & 255);
    }
  }
  const hex = Buffer.from(output).toString("hex");
  if (!/^[a-f0-9]{64}$/.test(hex)) process.exit(4);
  process.stdout.write(hex);
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
        if (-not $process.Start()) { throw 'Could not start the protected Buzz identity converter.' }
        $process.StandardInput.Write($desktopSecret)
        $process.StandardInput.Close()
        $privateKeyHex = $process.StandardOutput.ReadToEnd().Trim()
        $process.WaitForExit()
        if ($process.ExitCode -ne 0 -or $privateKeyHex -notmatch '^[a-f0-9]{64}$') {
            throw 'Buzz Desktop identity conversion failed.'
        }
    }
    finally {
        if ($null -ne $process) { $process.Dispose() }
    }

    Set-MarketingChiefBuzzPrivateKey -Target 'MarketingChief-Buzz-Owner' -PrivateKeyHex $privateKeyHex
    $publicKey = Get-MarketingChiefBuzzPublicKey -PrivateKeyHex $privateKeyHex
    $statePath = Join-Path $PSScriptRoot 'runtime\team-state.json'
    if (Test-Path -LiteralPath $statePath -PathType Leaf) {
        $state = Get-Content -Raw -LiteralPath $statePath -Encoding UTF8 | ConvertFrom-Json
        $state.ownerPublicKey = $publicKey
        $ownerRow = @($state.identities | Where-Object { [string]$_.id -ceq 'dillon' })[0]
        if ($null -ne $ownerRow) { $ownerRow.publicKey = $publicKey }
        $state.status = 'awaiting_auth'
        $state.lastCheckedAt = [DateTimeOffset]::UtcNow.ToString('o')
        $state.summary = 'Buzz Desktop identity is aligned with the local bridge. Hosted community authentication is required before channel provisioning.'
        [IO.File]::WriteAllText($statePath, (($state | ConvertTo-Json -Depth 20) + [Environment]::NewLine), [Text.UTF8Encoding]::new($false))
    }
    [pscustomobject][ordered]@{
        adopted = $true
        publicKey = $publicKey
        source = 'Buzz Desktop protected OS keychain'
        storedInWindowsCredentialManager = $true
    }
}
finally {
    if ($null -ne $bytes) { [Array]::Clear($bytes, 0, $bytes.Length) }
    $blobText = $null
    $desktopSecret = $null
    $privateKeyHex = $null
    if ($pointer -ne [IntPtr]::Zero) { [MarketingChief.Win32.CredentialApi]::CredFree($pointer) }
}
