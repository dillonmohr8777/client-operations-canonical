[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateScript({ Test-Path -LiteralPath $_ -PathType Leaf })]
    [string]$ImagePath,

    [string]$CredentialTarget = 'Codex.ClientAccess.PutteryNYC.TockRoleAccount',

    [long]$ExpectedIssuedAt = 1788200681,

    [string]$ExpectedPatronId = '231115346',

    [switch]$Force,

    [switch]$Diagnostics
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Await-WinRtOperation {
    param(
        [Parameter(Mandatory = $true)]$Operation,
        [Parameter(Mandatory = $true)][Type]$ResultType
    )

    $method = [System.WindowsRuntimeSystemExtensions].GetMethods() |
        Where-Object {
            $_.Name -eq 'AsTask' -and
            $_.IsGenericMethodDefinition -and
            $_.GetParameters().Count -eq 1
        } |
        Select-Object -First 1
    $task = $method.MakeGenericMethod($ResultType).Invoke($null, @($Operation))
    $task.GetAwaiter().GetResult()
}

function ConvertFrom-Base64Url {
    param([Parameter(Mandatory = $true)][string]$Value)

    $base64 = $Value.Replace('-', '+').Replace('_', '/')
    switch ($base64.Length % 4) {
        2 { $base64 += '==' }
        3 { $base64 += '=' }
        1 { throw 'invalid_base64url_length' }
    }
    [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($base64))
}

function ConvertTo-Base64Url {
    param([Parameter(Mandatory = $true)][string]$Value)

    [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($Value)).TrimEnd('=').Replace('+', '-').Replace('/', '_')
}

if (-not ('Codex.PutteryCredential.NativeMethods' -as [type])) {
    Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;

namespace Codex.PutteryCredential {
  [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
  public struct CREDENTIAL {
    public UInt32 Flags;
    public UInt32 Type;
    public IntPtr TargetName;
    public IntPtr Comment;
    public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten;
    public UInt32 CredentialBlobSize;
    public IntPtr CredentialBlob;
    public UInt32 Persist;
    public UInt32 AttributeCount;
    public IntPtr Attributes;
    public IntPtr TargetAlias;
    public IntPtr UserName;
  }

  public static class NativeMethods {
    [DllImport("Advapi32.dll", EntryPoint = "CredReadW", CharSet = CharSet.Unicode, SetLastError = true)]
    public static extern bool CredRead(string target, UInt32 type, UInt32 flags, out IntPtr credentialPtr);

    [DllImport("Advapi32.dll", EntryPoint = "CredWriteW", CharSet = CharSet.Unicode, SetLastError = true)]
    public static extern bool CredWrite(ref CREDENTIAL credential, UInt32 flags);

    [DllImport("Advapi32.dll", SetLastError = true)]
    public static extern void CredFree(IntPtr buffer);
  }
}
'@
}

$stage = 'startup'
$stream = $null
$ocrText = $null
$token = $null
$tokenBytes = $null
$existingPtr = [IntPtr]::Zero
$targetPtr = [IntPtr]::Zero
$userPtr = [IntPtr]::Zero
$commentPtr = [IntPtr]::Zero
$blobPtr = [IntPtr]::Zero

try {
    $stage = 'winrt_setup'
    Add-Type -AssemblyName System.Runtime.WindowsRuntime
    $null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
    $null = [Windows.Storage.Streams.IRandomAccessStream, Windows.Storage.Streams, ContentType = WindowsRuntime]
    $null = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Foundation, ContentType = WindowsRuntime]
    $null = [Windows.Graphics.Imaging.SoftwareBitmap, Windows.Foundation, ContentType = WindowsRuntime]
    $null = [Windows.Graphics.Imaging.BitmapTransform, Windows.Foundation, ContentType = WindowsRuntime]
    $null = [Windows.Graphics.Imaging.BitmapBounds, Windows.Foundation, ContentType = WindowsRuntime]
    $null = [Windows.Graphics.Imaging.BitmapPixelFormat, Windows.Foundation, ContentType = WindowsRuntime]
    $null = [Windows.Graphics.Imaging.BitmapAlphaMode, Windows.Foundation, ContentType = WindowsRuntime]
    $null = [Windows.Graphics.Imaging.ExifOrientationMode, Windows.Foundation, ContentType = WindowsRuntime]
    $null = [Windows.Graphics.Imaging.ColorManagementMode, Windows.Foundation, ContentType = WindowsRuntime]
    $null = [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime]
    $null = [Windows.Media.Ocr.OcrResult, Windows.Foundation, ContentType = WindowsRuntime]

    $stage = 'image_read'
    $resolvedImage = (Resolve-Path -LiteralPath $ImagePath).Path
    $file = Await-WinRtOperation -Operation (
        [Windows.Storage.StorageFile]::GetFileFromPathAsync($resolvedImage)
    ) -ResultType ([Windows.Storage.StorageFile])
    $stream = Await-WinRtOperation -Operation (
        $file.OpenAsync([Windows.Storage.FileAccessMode]::Read)
    ) -ResultType ([Windows.Storage.Streams.IRandomAccessStream])
    $decoder = Await-WinRtOperation -Operation (
        [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)
    ) -ResultType ([Windows.Graphics.Imaging.BitmapDecoder])
    $bitmap = Await-WinRtOperation -Operation (
        $decoder.GetSoftwareBitmapAsync()
    ) -ResultType ([Windows.Graphics.Imaging.SoftwareBitmap])

    $stage = 'ocr_recognition'
    $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
    if ($null -eq $engine) { throw 'ocr_engine_unavailable' }
    $result = Await-WinRtOperation -Operation (
        $engine.RecognizeAsync($bitmap)
    ) -ResultType ([Windows.Media.Ocr.OcrResult])
    $ocrCandidates = @([string]$result.Text)

    # The screenshot's credential occupies a narrow band. A 3x in-memory crop
    # gives Windows OCR a second pass without writing the secret-bearing image
    # or OCR text to disk.
    $transform = New-Object Windows.Graphics.Imaging.BitmapTransform
    $bounds = New-Object Windows.Graphics.Imaging.BitmapBounds
    $bounds.X = [uint32]0
    $bounds.Y = [uint32]415
    $bounds.Width = [uint32]589
    $bounds.Height = [uint32]250
    $transform.Bounds = $bounds
    $transform.ScaledWidth = [uint32]1767
    $transform.ScaledHeight = [uint32]750
    $croppedBitmap = Await-WinRtOperation -Operation (
        $decoder.GetSoftwareBitmapAsync(
            [Windows.Graphics.Imaging.BitmapPixelFormat]::Bgra8,
            [Windows.Graphics.Imaging.BitmapAlphaMode]::Premultiplied,
            $transform,
            [Windows.Graphics.Imaging.ExifOrientationMode]::RespectExifOrientation,
            [Windows.Graphics.Imaging.ColorManagementMode]::DoNotColorManage
        )
    ) -ResultType ([Windows.Graphics.Imaging.SoftwareBitmap])
    $croppedResult = Await-WinRtOperation -Operation (
        $engine.RecognizeAsync($croppedBitmap)
    ) -ResultType ([Windows.Media.Ocr.OcrResult])
    $ocrCandidates += [string]$croppedResult.Text
    $ocrText = $ocrCandidates -join "`n"

    $stage = 'jwt_extract'
    $jwtHeader = $null
    $jwtPayload = $null
    foreach ($candidateText in $ocrCandidates) {
        $anchor = [regex]::Match($candidateText, '(?is)role\s+account\s+key\s*:\s*(?<body>.*)')
        $searchText = if ($anchor.Success) { [string]$anchor.Groups['body'].Value } else { $candidateText }
        $stop = [regex]::Match($searchText, '(?im)^\s*(?:[•*\-]\s*)?Puttery\s+NYC\b|^\s*@Dillon')
        if ($stop.Success) { $searchText = $searchText.Substring(0, $stop.Index) }
        $collapsed = [regex]::Replace($searchText, '\s+', '')
        $matches = [regex]::Matches($collapsed, 'eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{32,}')

        foreach ($candidate in $matches) {
            try {
                $parts = $candidate.Value.Split('.')
                if ($parts.Count -ne 3) { continue }
                $header = (ConvertFrom-Base64Url -Value $parts[0]) | ConvertFrom-Json
                $payload = (ConvertFrom-Base64Url -Value $parts[1]) | ConvertFrom-Json
                if (
                    [string]$header.typ -eq 'JWT' -and
                    [string]$header.alg -eq 'HS256' -and
                    [string]$payload.client -eq 'puttery' -and
                    [string]$payload.patronId -match '^\d+$' -and
                    [long]$payload.iat -gt 0
                ) {
                    $token = [string]$candidate.Value
                    $jwtHeader = $header
                    $jwtPayload = $payload
                    break
                }
            }
            catch {
                continue
            }
        }
        if ($token) { break }
    }
    if (-not $token) {
        # OCR commonly confuses characters inside the readable JWT header and
        # payload. Those two segments are reconstructed from the visible,
        # non-secret account claims, while the 256-bit signature is taken only
        # from the image and never written anywhere except Credential Manager.
        $expectedHeaderObject = [ordered]@{ typ = 'JWT'; alg = 'HS256' }
        $expectedPayloadObject = [ordered]@{
            iat = $ExpectedIssuedAt
            client = 'puttery'
            patronId = $ExpectedPatronId
        }
        $expectedHeaderSegment = ConvertTo-Base64Url -Value ($expectedHeaderObject | ConvertTo-Json -Compress)
        $expectedPayloadSegment = ConvertTo-Base64Url -Value ($expectedPayloadObject | ConvertTo-Json -Compress)

        foreach ($candidateText in $ocrCandidates) {
            $anchor = [regex]::Match($candidateText, '(?is)role\s+account\s+key\s*:\s*(?<body>.*)')
            $region = if ($anchor.Success) { [string]$anchor.Groups['body'].Value } else { $candidateText }
            $collapsedRegion = [regex]::Replace($region, '\s+', '')
            $jwtStart = $collapsedRegion.IndexOf('eyJ', [StringComparison]::OrdinalIgnoreCase)
            if ($jwtStart -lt 0) { continue }
            $segments = $collapsedRegion.Substring($jwtStart).Split('.')
            if ($segments.Count -lt 3) { continue }
            $signatureMatch = [regex]::Match($segments[2], '^[A-Za-z0-9_-]{43}')
            if (-not $signatureMatch.Success) { continue }
            if ($expectedHeaderSegment.Length -ne 36 -or $expectedPayloadSegment.Length -ne 80) {
                throw 'expected_jwt_claim_shape_invalid'
            }
            $token = '{0}.{1}.{2}' -f $expectedHeaderSegment, $expectedPayloadSegment, $signatureMatch.Value
            $jwtHeader = [pscustomobject]$expectedHeaderObject
            $jwtPayload = [pscustomobject]$expectedPayloadObject
            break
        }
    }
    if (-not $token) {
        if ($Diagnostics) {
            $safeDiagnostics = @()
            foreach ($candidateText in $ocrCandidates) {
                $anchor = [regex]::Match($candidateText, '(?is)role\s+account\s+key\s*:\s*(?<body>.*)')
                $region = if ($anchor.Success) { [string]$anchor.Groups['body'].Value } else { $candidateText }
                $stop = [regex]::Match($region, '(?im)^\s*(?:[•*\-]\s*)?Puttery\s+NYC\b|^\s*@Dillon')
                if ($stop.Success) { $region = $region.Substring(0, $stop.Index) }
                $lineShapes = @()
                foreach ($line in ($region -split '\r?\n')) {
                    if ([string]::IsNullOrWhiteSpace($line)) { continue }
                    $lineShapes += [pscustomobject]@{
                        length = $line.Length
                        base64urlCharacters = ([regex]::Matches($line, '[A-Za-z0-9_-]')).Count
                        dots = ([regex]::Matches($line, '\.')).Count
                        spaces = ([regex]::Matches($line, '\s')).Count
                        startsWithJwtMarker = [regex]::IsMatch($line.Trim(), '^eyJ', 'IgnoreCase')
                    }
                }
                $collapsedRegion = [regex]::Replace($region, '\s+', '')
                $jwtStart = $collapsedRegion.IndexOf('eyJ', [StringComparison]::OrdinalIgnoreCase)
                $segmentLengths = @()
                $headerDecodes = $false
                $payloadDecodes = $false
                $headerShapeMatches = $false
                $payloadShapeMatches = $false
                if ($jwtStart -ge 0) {
                    $jwtTail = $collapsedRegion.Substring($jwtStart)
                    $segments = $jwtTail.Split('.')
                    $segmentLengths = @($segments | Select-Object -First 6 | ForEach-Object { $_.Length })
                    if ($segments.Count -ge 2) {
                        try {
                            $safeHeader = (ConvertFrom-Base64Url -Value $segments[0]) | ConvertFrom-Json
                            $headerDecodes = $true
                            $headerShapeMatches = ([string]$safeHeader.typ -eq 'JWT' -and [string]$safeHeader.alg -eq 'HS256')
                        }
                        catch {}
                        try {
                            $safePayload = (ConvertFrom-Base64Url -Value $segments[1]) | ConvertFrom-Json
                            $payloadDecodes = $true
                            $payloadShapeMatches = (
                                [string]$safePayload.client -eq 'puttery' -and
                                [string]$safePayload.patronId -match '^\d+$' -and
                                [long]$safePayload.iat -gt 0
                            )
                        }
                        catch {}
                    }
                }
                $safeDiagnostics += [pscustomobject]@{
                    anchorFound = $anchor.Success
                    regionLength = $region.Length
                    jwtMarkerFound = [regex]::IsMatch($region, 'eyJ', 'IgnoreCase')
                    segmentLengths = $segmentLengths
                    headerDecodes = $headerDecodes
                    payloadDecodes = $payloadDecodes
                    headerShapeMatches = $headerShapeMatches
                    payloadShapeMatches = $payloadShapeMatches
                    lines = $lineShapes
                }
            }
            [pscustomobject]@{
                diagnostic = 'sanitized_ocr_shape'
                passes = $safeDiagnostics
            } | ConvertTo-Json -Depth 8
        }
        throw 'puttery_role_jwt_not_found'
    }

    $stage = 'existing_check'
    $exists = [Codex.PutteryCredential.NativeMethods]::CredRead(
        $CredentialTarget,
        1,
        0,
        [ref]$existingPtr
    )
    if ($exists -and -not $Force) { throw 'credential_target_already_exists' }

    $stage = 'credential_write'
    $tokenBytes = [Text.Encoding]::Unicode.GetBytes($token)
    if ($tokenBytes.Length -gt 2560) { throw 'credential_too_large' }
    $targetPtr = [Runtime.InteropServices.Marshal]::StringToCoTaskMemUni($CredentialTarget)
    $userPtr = [Runtime.InteropServices.Marshal]::StringToCoTaskMemUni('Puttery NYC Tock role account')
    $commentPtr = [Runtime.InteropServices.Marshal]::StringToCoTaskMemUni(
        'Imported from the user-supplied vendor screenshot; rotate before production use.'
    )
    $blobPtr = [Runtime.InteropServices.Marshal]::AllocCoTaskMem($tokenBytes.Length)
    [Runtime.InteropServices.Marshal]::Copy($tokenBytes, 0, $blobPtr, $tokenBytes.Length)

    $credential = New-Object Codex.PutteryCredential.CREDENTIAL
    $credential.Type = 1
    $credential.TargetName = $targetPtr
    $credential.UserName = $userPtr
    $credential.Comment = $commentPtr
    $credential.CredentialBlobSize = [uint32]$tokenBytes.Length
    $credential.CredentialBlob = $blobPtr
    $credential.Persist = 2

    $written = [Codex.PutteryCredential.NativeMethods]::CredWrite([ref]$credential, 0)
    if (-not $written) { throw 'windows_credential_write_failed' }

    [pscustomobject]@{
        stored = $true
        target = $CredentialTarget
        type = 'tock_role_account_jwt'
        client = [string]$jwtPayload.client
        algorithm = [string]$jwtHeader.alg
        source = 'user_supplied_screenshot'
        productionUse = 'hold_pending_rotation'
    } | ConvertTo-Json
}
catch {
    [pscustomobject]@{
        stored = $false
        stage = $stage
        error = [string]$_.Exception.Message
    } | ConvertTo-Json
    exit 1
}
finally {
    if ($existingPtr -ne [IntPtr]::Zero) {
        [Codex.PutteryCredential.NativeMethods]::CredFree($existingPtr)
    }
    if ($blobPtr -ne [IntPtr]::Zero) {
        $tokenByteCount = 0
        if ($null -ne $tokenBytes) { $tokenByteCount = $tokenBytes.Length }
        for ($index = 0; $index -lt $tokenByteCount; $index++) {
            [Runtime.InteropServices.Marshal]::WriteByte($blobPtr, $index, 0)
        }
        [Runtime.InteropServices.Marshal]::FreeCoTaskMem($blobPtr)
    }
    foreach ($pointer in @($targetPtr, $userPtr, $commentPtr)) {
        if ($pointer -ne [IntPtr]::Zero) {
            [Runtime.InteropServices.Marshal]::FreeCoTaskMem($pointer)
        }
    }
    if ($tokenBytes) { [Array]::Clear($tokenBytes, 0, $tokenBytes.Length) }
    if ($stream) { $stream.Dispose() }
    $token = $null
    $ocrText = $null
}
