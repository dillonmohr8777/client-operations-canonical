Set-StrictMode -Version 2.0

function Get-MarketingTextSha256 {
    param([AllowEmptyString()][string]$Value)
    $sha = [Security.Cryptography.SHA256]::Create()
    try {
        $bytes = [Text.UTF8Encoding]::new($false).GetBytes($Value)
        return ([BitConverter]::ToString($sha.ComputeHash($bytes))).Replace('-', '')
    }
    finally { $sha.Dispose() }
}

function Test-MarketingSafeText {
    param([AllowNull()][string]$Value)
    if ([string]::IsNullOrWhiteSpace($Value)) { return $true }

    # Intake locators are opaque canonical references, not payment-card data.
    # Scrub the exact approved shape before generic secret-pattern checks so a
    # timestamped run id cannot be misclassified as a 13-19 digit card number.
    $safeCandidate = [regex]::Replace(
        $Value,
        '(?i)agent-os-run:[A-Za-z0-9][A-Za-z0-9_-]{5,79}/task\.json',
        'SAFE_AGENT_OS_LOCATOR'
    )

    $badPatterns = @(
        '(?i)-----BEGIN [A-Z ]*PRIVATE KEY-----',
        '(?i)(password|passwd|api[_ -]?key|access[_ -]?token|refresh[_ -]?token|session[_ -]?cookie|recovery[_ -]?code|one[_ -]?time[_ -]?code)\s*[:=]',
        '(?i)\b(AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9_]{20,}|xox[baprs]-[A-Za-z0-9-]{20,}|sk-[A-Za-z0-9_-]{20,}|ck_[A-Za-z0-9_-]{12,})\b',
        '(?i)\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b',
        '(?<!\d)(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]\d{4}(?!\d)',
        '(?<!\d)\d{3}-\d{2}-\d{4}(?!\d)',
        '(?<!\d)(?:\d[ -]*?){13,19}(?!\d)',
        '(?i)https?://[^/\s:@]+:[^/\s@]+@',
        '(?i)\b[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b',
        '(?im)^\s*(from|to|cc|bcc|subject|reply-to)\s*:',
        '(?i)\b(otp|verification code|security code|login code)\s*[:#-]?\s*\d{4,8}\b'
    )
    foreach ($pattern in $badPatterns) { if ($safeCandidate -match $pattern) { return $false } }

    $scrubbed = [regex]::Replace($safeCandidate, '(?i)sha256:[0-9a-f]{64}', 'SAFEHASH')
    $scrubbed = [regex]::Replace($scrubbed, '(?i)\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b', 'SAFEGUID')
    foreach ($match in [regex]::Matches($scrubbed, '\S+')) {
        $token = $match.Value.Trim('"', "'", '`', ',', ';', ':', '.', '(', ')', '[', ']', '{', '}', '<', '>')
        if ($token.Length -lt 10 -or $token.Length -gt 128) { continue }
        $hasUpper = $token -cmatch '[A-Z]'
        $hasLower = $token -cmatch '[a-z]'
        $hasDigit = $token -match '\d'
        $hasSymbol = $token -match '[^A-Za-z0-9]'
        if (($hasUpper -and $hasLower -and $hasDigit -and $hasSymbol) -or
            ($token.Length -ge 20 -and $hasUpper -and $hasLower -and $hasDigit)) {
            return $false
        }
    }
    return $true
}

function Test-MarketingSafeLocator {
    param([AllowNull()][string]$Value)
    if ([string]::IsNullOrWhiteSpace($Value) -or $Value.Length -gt 1000) { return $false }
    if ($Value.Contains('..') -or $Value -match '[\r\n]') { return $false }
    if (-not (Test-MarketingSafeText $Value)) { return $false }
    if ($Value -match '^(clients|context|docs|intake|queue|schemas|state|tests|workflows)/[A-Za-z0-9._/ -]+$') { return $true }
    if ($Value -match '^access-broker:[A-Za-z0-9._:/-]+$') { return $true }
    if ($Value -match '^sha256:[0-9a-fA-F]{64}$') { return $true }
    if ($Value -match '^source-commit:[0-9a-fA-F]{7,40}$') { return $true }
    if ($Value -match '^agent-os-run:[A-Za-z0-9-]{8,100}/task\.json$') { return $true }
    if ($Value -match '^sites-intent:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$') { return $true }
    return $false
}

function Test-MarketingRiskyActionText {
    param([AllowNull()][string]$Value)
    if ([string]::IsNullOrWhiteSpace($Value)) { return $false }
    return $Value -match '(?i)\b(send|email|message|post|publish|deploy|launch live|go live|purchase|buy|pay|charge|spend|raise budget|increase budget|delete|remove account|change permission|grant access|contact|call the (lead|prospect|client)|submit live)\b'
}

function Test-MarketingAutomaticActionClass {
    param([string]$ActionClass)
    return $ActionClass -in @('read_only_verification','local_research','local_draft','local_artifact','local_test')
}

function Test-MarketingStatusTransition {
    param([string]$From, [string]$To)
    if ([string]::IsNullOrWhiteSpace($To) -or $From -eq $To) { return $true }
    $matrix = @{
        captured = @('triaged','ready','needs_approval','blocked','deferred','cancelled')
        triaged = @('ready','needs_approval','blocked','deferred','cancelled')
        ready = @('in_progress','needs_approval','blocked','deferred','cancelled')
        in_progress = @('verification','needs_approval','blocked','deferred','cancelled')
        verification = @('in_progress','needs_approval','executed','observed','done','blocked','deferred','cancelled')
        needs_approval = @('ready','in_progress','verification','executed','observed','done','blocked','deferred','cancelled')
        executed = @('observed','done','blocked')
        observed = @('in_progress','done','blocked')
        blocked = @('ready','in_progress','needs_approval','deferred','cancelled')
        deferred = @('captured','triaged','ready','cancelled')
        done = @()
        cancelled = @()
    }
    if (-not $matrix.ContainsKey($From)) { return $false }
    return $To -in @($matrix[$From])
}

function Test-MarketingWorkerTransition {
    param([string]$WorkerStatus, [string]$ProposedTransition)
    $matrix = @{
        completed = @('verification','needs_approval','executed','observed','done')
        partially_completed = @('in_progress','verification','needs_approval','blocked','deferred')
        blocked = @('blocked','needs_approval','deferred')
        failed = @('blocked','deferred','cancelled')
    }
    return $matrix.ContainsKey($WorkerStatus) -and $ProposedTransition -in @($matrix[$WorkerStatus])
}

function Resolve-MarketingChildPath {
    param([Parameter(Mandatory = $true)][string]$Root, [Parameter(Mandatory = $true)][string]$Child)
    $rootFull = [IO.Path]::GetFullPath($Root).TrimEnd('\')
    $candidate = [IO.Path]::GetFullPath((Join-Path $rootFull $Child))
    $prefix = $rootFull + '\'
    if (-not $candidate.StartsWith($prefix, [StringComparison]::OrdinalIgnoreCase)) { throw 'Path escapes the required canonical root.' }
    return $candidate
}
