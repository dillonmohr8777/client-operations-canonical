[CmdletBinding()]
param(
    [string]$PackagePath = 'C:\Users\dillo\Documents\Codex\projects\client-operations\clients\bigorange-marketing\deliverables\2026-09-02-five-blog-growth-package'
)

$ErrorActionPreference = 'Stop'
$credentialTarget = 'Codex.ClientAccess.BigOrange.WordPress'
$site = 'https://bigorange.marketing'

if (-not ('BigOrange.Drafts.CredentialApi' -as [type])) {
    Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
namespace BigOrange.Drafts {
  [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
  public struct Credential { public UInt32 Flags; public UInt32 Type; public string TargetName; public string Comment; public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten; public UInt32 CredentialBlobSize; public IntPtr CredentialBlob; public UInt32 Persist; public UInt32 AttributeCount; public IntPtr Attributes; public string TargetAlias; public string UserName; }
  public static class CredentialApi {
    [DllImport("advapi32.dll", EntryPoint="CredReadW", CharSet=CharSet.Unicode, SetLastError=true)] public static extern bool CredRead(string target, UInt32 type, Int32 reservedFlag, out IntPtr credentialPtr);
    [DllImport("advapi32.dll")] public static extern void CredFree(IntPtr credentialPtr);
  }
}
'@
}

$pointer = [IntPtr]::Zero
$bytes = $null
$password = $null
try {
    if (-not [BigOrange.Drafts.CredentialApi]::CredRead($credentialTarget, 1, 0, [ref]$pointer)) {
        throw [ComponentModel.Win32Exception]::new([Runtime.InteropServices.Marshal]::GetLastWin32Error())
    }
    $stored = [Runtime.InteropServices.Marshal]::PtrToStructure($pointer, [type][BigOrange.Drafts.Credential])
    $bytes = New-Object byte[] $stored.CredentialBlobSize
    [Runtime.InteropServices.Marshal]::Copy($stored.CredentialBlob, $bytes, 0, [int]$stored.CredentialBlobSize)
    $zeroByteCount = @($bytes | Where-Object { $_ -eq 0 }).Count
    $password = if ($zeroByteCount -ge [Math]::Floor($bytes.Length / 4)) { [Text.Encoding]::Unicode.GetString($bytes).TrimEnd([char]0) } else { [Text.Encoding]::UTF8.GetString($bytes).TrimEnd([char]0) }

    $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $session.UserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/139 Safari/537.36'
    $loginUrl = "$site/wp-login.php"
    $adminUrl = "$site/wp-admin/"
    Invoke-WebRequest -Uri $loginUrl -WebSession $session -MaximumRedirection 5 | Out-Null
    $form = @{ log=$stored.UserName; pwd=$password; 'wp-submit'='Log In'; redirect_to=$adminUrl; testcookie='1' }
    $headers = @{ Referer=$loginUrl; Origin=$site; Accept='text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'; 'Accept-Language'='en-US,en;q=0.9' }
    $login = Invoke-WebRequest -Uri $loginUrl -Method Post -Body $form -ContentType 'application/x-www-form-urlencoded' -Headers $headers -WebSession $session -MaximumRedirection 8
    if ($login.Content -notmatch 'wp-admin-bar|wpwrap|Dashboard') { throw 'Authenticated WordPress dashboard was not reached.' }

    $editor = Invoke-WebRequest -Uri "$site/wp-admin/post-new.php" -WebSession $session -MaximumRedirection 5
    $patterns = @(
      'wpApiSettings\s*=\s*\{[^}]*"nonce"\s*:\s*"([^"]+)"',
      'createNonceMiddleware\(\s*"([^"]+)"\s*\)',
      '"nonce"\s*:\s*"([a-zA-Z0-9]+)"'
    )
    $nonce = $null
    foreach ($pattern in $patterns) { $m=[regex]::Match($editor.Content,$pattern); if ($m.Success) { $nonce=$m.Groups[1].Value; break } }
    if (-not $nonce) { throw 'WordPress REST nonce was not found in the authenticated editor.' }

    $manifest = Get-Content -LiteralPath (Join-Path $PackagePath 'blog-manifest.json') -Raw | ConvertFrom-Json
    $results = @()
    foreach ($item in $manifest) {
        $slug = [string]$item.proposed_slug
        $existing = @(Invoke-RestMethod -Uri "$site/wp-json/wp/v2/posts?slug=$([Uri]::EscapeDataString($slug))&context=edit&status=any&_fields=id,status,slug,link" -Headers @{ 'X-WP-Nonce'=$nonce } -WebSession $session)
        if ($existing.Count -gt 0 -and $existing[0].status -notin @('draft','pending','private')) {
            throw "A public post already uses slug $slug. No change was made."
        }
        $html = Get-Content -LiteralPath (Join-Path $PackagePath ('wordpress\' + $item.html_file)) -Raw
        $payload = [ordered]@{
            title = [string]$item.title
            slug = $slug
            status = 'draft'
            content = $html
            excerpt = [string]$item.meta_description
        } | ConvertTo-Json -Depth 8
        $uri = if ($existing.Count -gt 0) { "$site/wp-json/wp/v2/posts/$($existing[0].id)" } else { "$site/wp-json/wp/v2/posts" }
        $method = if ($existing.Count -gt 0) { 'Post' } else { 'Post' }
        $saved = Invoke-RestMethod -Uri $uri -Method $method -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($payload)) -Headers @{ 'X-WP-Nonce'=$nonce } -WebSession $session
        if ($saved.status -ne 'draft') { throw "Post $($saved.id) did not remain a draft." }
        $results += [ordered]@{
            assetId = [string]$item.asset_id
            postId = [int]$saved.id
            status = [string]$saved.status
            slug = [string]$saved.slug
            editor = "$site/wp-admin/post.php?post=$($saved.id)&action=edit"
            preview = [string]$saved.link
        }
    }
    $resultPath = Join-Path $PackagePath 'wordpress-draft-results.json'
    $results | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $resultPath -Encoding utf8
    [ordered]@{ status='PASS'; count=$results.Count; resultPath=$resultPath; posts=$results } | ConvertTo-Json -Depth 8
}
finally {
    if ($bytes) { [Array]::Clear($bytes,0,$bytes.Length) }
    $password = $null
    if ($pointer -ne [IntPtr]::Zero) { [BigOrange.Drafts.CredentialApi]::CredFree($pointer) }
}
