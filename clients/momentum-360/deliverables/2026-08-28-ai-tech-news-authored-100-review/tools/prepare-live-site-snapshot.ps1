[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[0-9a-fA-F-]{36}$')]
    [string]$SiteId,

    [Parameter(Mandatory = $true)]
    [ValidatePattern('^https://')]
    [string]$BaseUrl,

    [Parameter(Mandatory = $true)]
    [string]$OutputPath,

    [Parameter(Mandatory = $false)]
    [string]$SeedRoot
)

$ErrorActionPreference = 'Stop'

$resolvedOutput = [System.IO.Path]::GetFullPath($OutputPath)
$resolvedSeed = if ([string]::IsNullOrWhiteSpace($SeedRoot)) { $null } else { [System.IO.Path]::GetFullPath($SeedRoot) }
if ($null -ne $resolvedSeed -and -not (Test-Path -LiteralPath $resolvedSeed -PathType Container)) {
    throw "SeedRoot does not exist: $resolvedSeed"
}
if (Test-Path -LiteralPath $resolvedOutput) {
    $existing = Get-ChildItem -LiteralPath $resolvedOutput -Force -ErrorAction Stop | Select-Object -First 1
    if ($null -ne $existing) {
        throw "OutputPath must be absent or empty: $resolvedOutput"
    }
} else {
    New-Item -ItemType Directory -Path $resolvedOutput -Force | Out-Null
}

$apiData = @{ site_id = $SiteId } | ConvertTo-Json -Compress
$rawManifest = (& netlify api listSiteFiles --data $apiData | Out-String)
if ($LASTEXITCODE -ne 0) {
    throw "Netlify file manifest lookup failed for site $SiteId"
}

$files = @($rawManifest | ConvertFrom-Json)
if ($files.Count -eq 0) {
    throw "Netlify returned an empty file manifest for site $SiteId"
}

$client = [System.Net.Http.HttpClient]::new()
$client.Timeout = [TimeSpan]::FromSeconds(90)
$sha1 = [System.Security.Cryptography.SHA1]::Create()
$base = $BaseUrl.TrimEnd('/')
$downloaded = 0
$verified = 0
$seeded = 0
$batchSize = 20

try {
    for ($offset = 0; $offset -lt $files.Count; $offset += $batchSize) {
        $last = [Math]::Min($offset + $batchSize - 1, $files.Count - 1)
        $batch = @($files[$offset..$last])
        $pending = foreach ($file in $batch) {
            $relative = ([string]$file.path).TrimStart('/')
            if ([string]::IsNullOrWhiteSpace($relative) -or $relative -match '(^|/)\.\.(/|$)') {
                throw "Unsafe file path in Netlify manifest: $($file.path)"
            }

            $destination = [System.IO.Path]::GetFullPath((Join-Path $resolvedOutput ($relative -replace '/', [System.IO.Path]::DirectorySeparatorChar)))
            $outputPrefix = $resolvedOutput.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
            if (-not $destination.StartsWith($outputPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
                throw "Resolved file escaped OutputPath: $($file.path)"
            }

            if ($null -ne $resolvedSeed) {
                $seedPath = Join-Path $resolvedSeed ($relative -replace '/', [System.IO.Path]::DirectorySeparatorChar)
                if (Test-Path -LiteralPath $seedPath -PathType Leaf) {
                    $seedSha = (Get-FileHash -Algorithm SHA1 -LiteralPath $seedPath).Hash.ToLowerInvariant()
                    if ($seedSha -eq [string]$file.sha) {
                        $directory = Split-Path -Parent $destination
                        if (-not (Test-Path -LiteralPath $directory)) {
                            New-Item -ItemType Directory -Path $directory -Force | Out-Null
                        }
                        Copy-Item -LiteralPath $seedPath -Destination $destination -Force
                        $seeded++
                        $verified++
                        continue
                    }
                }
            }

            $uri = [Uri]::new($base + [string]$file.path)
            [pscustomobject]@{
                File = $file
                Destination = $destination
                Task = $client.GetByteArrayAsync($uri)
            }
        }

        if ($pending.Count -gt 0) {
            [System.Threading.Tasks.Task]::WhenAll([System.Threading.Tasks.Task[]]$pending.Task).GetAwaiter().GetResult()
        }

        foreach ($item in $pending) {
            $bytes = $item.Task.GetAwaiter().GetResult()
            $directory = Split-Path -Parent $item.Destination
            if (-not (Test-Path -LiteralPath $directory)) {
                New-Item -ItemType Directory -Path $directory -Force | Out-Null
            }
            [System.IO.File]::WriteAllBytes($item.Destination, $bytes)
            $downloaded++

            $actualSha = [Convert]::ToHexString($sha1.ComputeHash($bytes)).ToLowerInvariant()
            if ($actualSha -ne [string]$item.File.sha) {
                throw "SHA-1 mismatch after downloading $($item.File.path): expected $($item.File.sha), got $actualSha"
            }
            $verified++
        }
    }
} finally {
    $sha1.Dispose()
    $client.Dispose()
}

$receipt = [ordered]@{
    capturedAt = (Get-Date).ToUniversalTime().ToString('o')
    siteId = $SiteId
    baseUrl = $base
    outputPath = $resolvedOutput
    manifestFileCount = $files.Count
    downloadedFileCount = $downloaded
    seededFileCount = $seeded
    sha1VerifiedFileCount = $verified
}

$receipt | ConvertTo-Json -Depth 4
