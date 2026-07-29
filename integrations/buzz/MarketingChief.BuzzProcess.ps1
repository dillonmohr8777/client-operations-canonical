Set-StrictMode -Version Latest

. (Join-Path $PSScriptRoot 'MarketingChief.BuzzCredential.ps1')

function ConvertTo-MarketingChiefProcessArgument {
    param([Parameter(Mandatory = $true)][string]$Value)
    if ($Value -notmatch '[\s"]') { return $Value }
    return '"' + ($Value -replace '(\\*)"', '$1$1\"' -replace '(\\+)$', '$1$1') + '"'
}

function Invoke-MarketingChiefBuzzProcess {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)][string]$CredentialTarget,
        [Parameter(Mandatory = $true)][string]$RelayUrl,
        [Parameter(Mandatory = $true)][string[]]$ArgumentList,
        [string]$StandardInput,
        [ValidateRange(5, 300)][int]$TimeoutSeconds = 45
    )

    Assert-MarketingChiefBuzzCredentialTarget -Target $CredentialTarget
    if ($RelayUrl -notmatch '^https://[A-Za-z0-9.-]+(?::\d{2,5})?/?$') {
        throw 'Buzz CLI relay URL must be an HTTPS origin.'
    }
    $buzzPath = 'C:\Users\dillo\AppData\Local\Buzz\buzz.exe'
    if (-not (Test-Path -LiteralPath $buzzPath -PathType Leaf)) {
        throw "Buzz CLI is not installed at $buzzPath."
    }

    $privateKey = Get-MarketingChiefBuzzPrivateKey -Target $CredentialTarget
    $startInfo = [Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = $buzzPath
    $startInfo.Arguments = ($ArgumentList | ForEach-Object { ConvertTo-MarketingChiefProcessArgument -Value ([string]$_) }) -join ' '
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $startInfo.RedirectStandardInput = $true
    $startInfo.EnvironmentVariables['BUZZ_PRIVATE_KEY'] = $privateKey
    $startInfo.EnvironmentVariables['BUZZ_RELAY_URL'] = $RelayUrl.TrimEnd('/')
    $startInfo.EnvironmentVariables['BUZZ_SHELL'] = 'C:\Program Files\Git\bin\bash.exe'

    $process = [Diagnostics.Process]::new()
    $process.StartInfo = $startInfo
    try {
        if (-not $process.Start()) { throw 'Buzz CLI process did not start.' }
        if ($PSBoundParameters.ContainsKey('StandardInput')) {
            $process.StandardInput.Write($StandardInput)
        }
        $process.StandardInput.Close()
        if (-not $process.WaitForExit($TimeoutSeconds * 1000)) {
            try { $process.Kill() } catch { }
            throw "Buzz CLI timed out after $TimeoutSeconds seconds."
        }
        $stdout = $process.StandardOutput.ReadToEnd()
        $stderr = $process.StandardError.ReadToEnd()
        [pscustomobject][ordered]@{
            exitCode = $process.ExitCode
            stdout = $stdout.Trim()
            stderr = $stderr.Trim()
        }
    }
    finally {
        $startInfo.EnvironmentVariables['BUZZ_PRIVATE_KEY'] = ''
        $privateKey = $null
        if ($null -ne $process) { $process.Dispose() }
    }
}

function ConvertFrom-MarketingChiefBuzzJson {
    [CmdletBinding()]
    param([Parameter(Mandatory = $true)]$Result)

    if ([int]$Result.exitCode -ne 0) {
        $safeMessage = if ([string]::IsNullOrWhiteSpace([string]$Result.stderr)) {
            "Buzz CLI exited with code $($Result.exitCode)."
        }
        else {
            [string]$Result.stderr
        }
        throw $safeMessage
    }
    if ([string]::IsNullOrWhiteSpace([string]$Result.stdout)) { return $null }
    try { return ([string]$Result.stdout | ConvertFrom-Json) }
    catch { throw 'Buzz CLI returned a non-JSON success response.' }
}
