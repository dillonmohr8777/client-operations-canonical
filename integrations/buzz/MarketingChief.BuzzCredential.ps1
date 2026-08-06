Set-StrictMode -Version Latest

. (Join-Path (Join-Path $PSScriptRoot '..\..\scripts') 'MarketingChief.SitesBridgeCredential.ps1')

function Assert-MarketingChiefBuzzCredentialTarget {
    [CmdletBinding()]
    param([Parameter(Mandatory = $true)][string]$Target)

    if ($Target -notmatch '^MarketingChief-Buzz-(?:Owner|Agent-[A-Za-z0-9]{2,80})$') {
        throw 'Buzz credential target must use the MarketingChief-Buzz namespace.'
    }
}

function Assert-MarketingChiefBuzzAuthTagCredentialTarget {
    [CmdletBinding()]
    param([Parameter(Mandatory = $true)][string]$Target)

    if ($Target -notmatch '^MarketingChief-Buzz-AuthTag-[A-Za-z0-9]{2,80}$') {
        throw 'Buzz owner-attestation target must use the MarketingChief-Buzz-AuthTag namespace.'
    }
}

function Set-MarketingChiefBuzzAuthTag {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)][string]$Target,
        [Parameter(Mandatory = $true)][string]$AuthTag
    )

    Assert-MarketingChiefBuzzAuthTagCredentialTarget -Target $Target
    try { $tag = $AuthTag | ConvertFrom-Json }
    catch { throw 'Buzz owner attestation must be a valid JSON tag.' }
    if (@($tag).Count -ne 4 -or [string]$tag[0] -cne 'auth' -or
        [string]$tag[1] -cnotmatch '^[a-f0-9]{64}$' -or
        -not [string]::IsNullOrEmpty([string]$tag[2]) -or
        [string]$tag[3] -cnotmatch '^[a-f0-9]{128}$') {
        throw 'Buzz owner attestation has an invalid shape.'
    }
    $encoded = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($AuthTag)).TrimEnd('=').Replace('+', '-').Replace('/', '_')
    Set-MarketingChiefSitesCredential -Target $Target -Token $encoded -UserName 'marketing-chief-buzz-auth-tag'
    $encoded = $null
}

function Get-MarketingChiefBuzzAuthTag {
    [CmdletBinding()]
    param([Parameter(Mandatory = $true)][string]$Target)

    Assert-MarketingChiefBuzzAuthTagCredentialTarget -Target $Target
    $encoded = Get-MarketingChiefSitesCredential -Target $Target
    if ($encoded -notmatch '^[A-Za-z0-9_-]{32,512}$') {
        throw "Stored Buzz owner attestation is invalid for target $Target."
    }
    $padded = $encoded.Replace('-', '+').Replace('_', '/')
    switch ($padded.Length % 4) {
        2 { $padded += '==' }
        3 { $padded += '=' }
    }
    try { $authTag = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($padded)) }
    catch { throw "Stored Buzz owner attestation is invalid for target $Target." }
    $encoded = $null
    $padded = $null
    try { $tag = $authTag | ConvertFrom-Json }
    catch { throw "Stored Buzz owner attestation is invalid for target $Target." }
    if (@($tag).Count -ne 4 -or [string]$tag[0] -cne 'auth' -or
        [string]$tag[1] -cnotmatch '^[a-f0-9]{64}$' -or
        -not [string]::IsNullOrEmpty([string]$tag[2]) -or
        [string]$tag[3] -cnotmatch '^[a-f0-9]{128}$') {
        throw "Stored Buzz owner attestation has an invalid shape for target $Target."
    }
    return $authTag
}

function New-MarketingChiefBuzzAuthTag {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)][string]$OwnerCredentialTarget,
        [Parameter(Mandatory = $true)][string]$AgentPublicKey
    )

    if ($AgentPublicKey -cnotmatch '^[a-f0-9]{64}$') { throw 'Buzz agent public key is invalid.' }
    $ownerPrivateKey = $null
    $inputJson = $null
    try {
        $ownerPrivateKey = Get-MarketingChiefBuzzPrivateKey -Target $OwnerCredentialTarget
        $inputJson = @{
            ownerSecretHex = $ownerPrivateKey
            agentPubkeyHex = $AgentPublicKey
            conditions = ''
        } | ConvertTo-Json -Compress
        $helperPath = Join-Path $PSScriptRoot 'tools\compute-buzz-auth-tag.mjs'
        if (-not (Test-Path -LiteralPath $helperPath -PathType Leaf)) {
            throw 'Buzz owner-attestation helper is missing.'
        }
        $startInfo = [Diagnostics.ProcessStartInfo]::new()
        $startInfo.FileName = 'node.exe'
        $startInfo.Arguments = '"' + $helperPath.Replace('"', '\"') + '"'
        $startInfo.UseShellExecute = $false
        $startInfo.CreateNoWindow = $true
        $startInfo.RedirectStandardInput = $true
        $startInfo.RedirectStandardOutput = $true
        $startInfo.RedirectStandardError = $true
        $process = [Diagnostics.Process]::new()
        $process.StartInfo = $startInfo
        try {
            if (-not $process.Start()) { throw 'Could not start the Buzz owner-attestation helper.' }
            $process.StandardInput.Write($inputJson)
            $process.StandardInput.Close()
            $authTag = $process.StandardOutput.ReadToEnd().Trim()
            $stderr = $process.StandardError.ReadToEnd()
            $process.WaitForExit()
            if ($process.ExitCode -ne 0) { throw "Buzz owner-attestation generation failed: $stderr" }
            return $authTag
        }
        finally {
            if ($null -ne $process) { $process.Dispose() }
        }
    }
    finally {
        $ownerPrivateKey = $null
        $inputJson = $null
    }
}

function Set-MarketingChiefBuzzPrivateKey {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)][string]$Target,
        [Parameter(Mandatory = $true)][string]$PrivateKeyHex
    )

    Assert-MarketingChiefBuzzCredentialTarget -Target $Target
    if ($PrivateKeyHex -notmatch '^[a-f0-9]{64}$') {
        throw 'Buzz private key must be a 32-byte lowercase hexadecimal value.'
    }
    Set-MarketingChiefSitesCredential -Target $Target -Token $PrivateKeyHex -UserName 'marketing-chief-buzz'
}

function Get-MarketingChiefBuzzPrivateKey {
    [CmdletBinding()]
    param([Parameter(Mandatory = $true)][string]$Target)

    Assert-MarketingChiefBuzzCredentialTarget -Target $Target
    $privateKey = Get-MarketingChiefSitesCredential -Target $Target
    if ($privateKey -notmatch '^[a-f0-9]{64}$') {
        throw "Stored Buzz private key has an invalid shape for target $Target."
    }
    return $privateKey
}

function Remove-MarketingChiefBuzzPrivateKey {
    [CmdletBinding()]
    param([Parameter(Mandatory = $true)][string]$Target)

    Assert-MarketingChiefBuzzCredentialTarget -Target $Target
    Remove-MarketingChiefSitesCredential -Target $Target
}

function New-MarketingChiefBuzzIdentityMaterial {
    [CmdletBinding()]
    param()

    $nodeScript = @'
const crypto = require("node:crypto");
const ecdh = crypto.createECDH("secp256k1");
const publicKey = ecdh.generateKeys("hex", "compressed");
const privateKey = ecdh.getPrivateKey("hex").padStart(64, "0");
process.stdout.write(JSON.stringify({
  privateKey,
  publicKey: publicKey.slice(2)
}));
'@
    $startInfo = [Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = 'node.exe'
    $startInfo.Arguments = '-e ' + ('"{0}"' -f $nodeScript.Replace('\', '\\').Replace('"', '\"').Replace("`r", '').Replace("`n", ' '))
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $process = [Diagnostics.Process]::new()
    $process.StartInfo = $startInfo
    try {
        if (-not $process.Start()) { throw 'Could not start Node to generate Buzz identity material.' }
        $stdout = $process.StandardOutput.ReadToEnd()
        $stderr = $process.StandardError.ReadToEnd()
        $process.WaitForExit()
        if ($process.ExitCode -ne 0) { throw "Buzz identity generation failed: $stderr" }
        $material = $stdout | ConvertFrom-Json
        if ([string]$material.privateKey -notmatch '^[a-f0-9]{64}$' -or [string]$material.publicKey -notmatch '^[a-f0-9]{64}$') {
            throw 'Buzz identity generator returned an invalid key shape.'
        }
        return $material
    }
    finally {
        if ($null -ne $process) { $process.Dispose() }
    }
}

function Get-MarketingChiefBuzzPublicKey {
    [CmdletBinding()]
    param([Parameter(Mandatory = $true)][string]$PrivateKeyHex)

    if ($PrivateKeyHex -notmatch '^[a-f0-9]{64}$') {
        throw 'Buzz private key must be a 32-byte lowercase hexadecimal value.'
    }
    $nodeScript = @'
const crypto = require("node:crypto");
let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", chunk => input += chunk);
process.stdin.on("end", () => {
  const ecdh = crypto.createECDH("secp256k1");
  ecdh.setPrivateKey(Buffer.from(input.trim(), "hex"));
  process.stdout.write(ecdh.getPublicKey("hex", "compressed").slice(2));
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
        if (-not $process.Start()) { throw 'Could not start Node to derive the Buzz public key.' }
        $process.StandardInput.Write($PrivateKeyHex)
        $process.StandardInput.Close()
        $publicKey = $process.StandardOutput.ReadToEnd().Trim()
        $stderr = $process.StandardError.ReadToEnd()
        $process.WaitForExit()
        if ($process.ExitCode -ne 0) { throw "Buzz public-key derivation failed: $stderr" }
        if ($publicKey -notmatch '^[a-f0-9]{64}$') { throw 'Derived Buzz public key has an invalid shape.' }
        return $publicKey
    }
    finally {
        if ($null -ne $process) { $process.Dispose() }
    }
}

function Initialize-MarketingChiefBuzzIdentity {
    [CmdletBinding()]
    param([Parameter(Mandatory = $true)][string]$Target)

    Assert-MarketingChiefBuzzCredentialTarget -Target $Target
    $material = $null
    try {
        $privateKey = Get-MarketingChiefBuzzPrivateKey -Target $Target
        $created = $false
    }
    catch {
        if ($_.Exception.Message -notmatch 'not installed') { throw }
        $material = New-MarketingChiefBuzzIdentityMaterial
        $privateKey = [string]$material.privateKey
        Set-MarketingChiefBuzzPrivateKey -Target $Target -PrivateKeyHex $privateKey
        $created = $true
    }
    try {
        [pscustomobject][ordered]@{
            target = $Target
            publicKey = Get-MarketingChiefBuzzPublicKey -PrivateKeyHex $privateKey
            created = $created
            storedInWindowsCredentialManager = $true
        }
    }
    finally {
        $privateKey = $null
        if ($null -ne $material) {
            $material.privateKey = $null
            $material = $null
        }
    }
}
