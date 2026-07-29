[CmdletBinding()]
param(
    [string]$RelayUrl,
    [switch]$RequireRelay
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
. (Join-Path $PSScriptRoot 'MarketingChief.BuzzCredential.ps1')
. (Join-Path $PSScriptRoot 'MarketingChief.BuzzProcess.ps1')

$manifestPath = Join-Path $PSScriptRoot 'team.manifest.json'
$runtimeRoot = Join-Path $PSScriptRoot 'runtime'
$statePath = Join-Path $runtimeRoot 'team-state.json'
$manifest = Get-Content -Raw -LiteralPath $manifestPath -Encoding UTF8 | ConvertFrom-Json
if ([int]$manifest.schemaVersion -ne 1 -or @($manifest.agents).Count -ne 10 -or @($manifest.channels).Count -ne 10) {
    throw 'The Marketing Chief Buzz team manifest is invalid.'
}
if ([string]::IsNullOrWhiteSpace($RelayUrl)) { $RelayUrl = [string]$manifest.relay.httpUrl }
if ($RelayUrl -notmatch '^https://[A-Za-z0-9.-]+(?::\d{2,5})?/?$') { throw 'Buzz relay must be an HTTPS origin.' }
$RelayUrl = $RelayUrl.TrimEnd('/')
if (-not (Test-Path -LiteralPath $runtimeRoot -PathType Container)) {
    New-Item -ItemType Directory -Path $runtimeRoot -Force | Out-Null
}

function Write-TeamState {
    param([Parameter(Mandatory = $true)][object]$State)
    $tempPath = "$statePath.tmp.$([guid]::NewGuid().ToString('N'))"
    try {
        [IO.File]::WriteAllText($tempPath, (($State | ConvertTo-Json -Depth 20) + [Environment]::NewLine), [Text.UTF8Encoding]::new($false))
        Move-Item -LiteralPath $tempPath -Destination $statePath -Force
    }
    finally {
        Remove-Item -LiteralPath $tempPath -Force -ErrorAction SilentlyContinue
    }
}

function Invoke-BuzzJson {
    param(
        [Parameter(Mandatory = $true)][string]$CredentialTarget,
        [Parameter(Mandatory = $true)][string[]]$Arguments,
        [string]$InputText,
        [int]$TimeoutSeconds = 30
    )
    $parameters = @{
        CredentialTarget = $CredentialTarget
        RelayUrl = $RelayUrl
        ArgumentList = $Arguments
        TimeoutSeconds = $TimeoutSeconds
    }
    if ($PSBoundParameters.ContainsKey('InputText')) { $parameters.StandardInput = $InputText }
    ConvertFrom-MarketingChiefBuzzJson -Result (Invoke-MarketingChiefBuzzProcess @parameters)
}

$identityRows = [Collections.Generic.List[object]]::new()
$ownerIdentity = Initialize-MarketingChiefBuzzIdentity -Target ([string]$manifest.owner.credentialTarget)
$identityRows.Add([pscustomobject][ordered]@{
    id = [string]$manifest.owner.id
    displayName = [string]$manifest.owner.displayName
    harness = 'owner'
    credentialTarget = [string]$manifest.owner.credentialTarget
    publicKey = [string]$ownerIdentity.publicKey
    created = [bool]$ownerIdentity.created
})
foreach ($agent in @($manifest.agents)) {
    $identity = Initialize-MarketingChiefBuzzIdentity -Target ([string]$agent.credentialTarget)
    $identityRows.Add([pscustomobject][ordered]@{
        id = [string]$agent.id
        displayName = [string]$agent.displayName
        harness = [string]$agent.harness
        credentialTarget = [string]$agent.credentialTarget
        publicKey = [string]$identity.publicKey
        created = [bool]$identity.created
    })
}

$baseState = [pscustomobject][ordered]@{
    schemaVersion = 1
    status = 'identities_ready'
    relayHttpUrl = $RelayUrl
    relayWsUrl = $RelayUrl -replace '^https://', 'wss://'
    ownerPublicKey = [string]$ownerIdentity.publicKey
    identities = @($identityRows)
    channels = @()
    provisionedAt = $null
    lastCheckedAt = [DateTimeOffset]::UtcNow.ToString('o')
    summary = 'All private identities are stored in Windows Credential Manager. Relay provisioning has not completed.'
}

try {
    $null = Invoke-BuzzJson -CredentialTarget ([string]$manifest.owner.credentialTarget) -Arguments @('channels', 'list', '--limit', '1') -TimeoutSeconds 20
}
catch {
    $baseState.status = 'awaiting_auth'
    $baseState.summary = 'Official Buzz Desktop and all local identities are ready. Hosted community authentication is required before channels can be provisioned.'
    Write-TeamState -State $baseState
    if ($RequireRelay) { throw 'Buzz hosted-community authentication is required before relay provisioning.' }
    $baseState
    return
}

$null = Invoke-BuzzJson -CredentialTarget ([string]$manifest.owner.credentialTarget) -Arguments @(
    'users', 'set-profile',
    '--name', [string]$manifest.owner.displayName,
    '--about', 'Owner of the private Marketing Chief agent team.'
)
foreach ($agent in @($manifest.agents)) {
    $null = Invoke-BuzzJson -CredentialTarget ([string]$agent.credentialTarget) -Arguments @(
        'users', 'set-profile',
        '--name', [string]$agent.displayName,
        '--about', [string]$agent.role
    )
}

$channelRows = [Collections.Generic.List[object]]::new()
foreach ($channel in @($manifest.channels)) {
    $matches = @(Invoke-BuzzJson -CredentialTarget ([string]$manifest.owner.credentialTarget) -Arguments @(
        'channels', 'search', '--query', [string]$channel.name, '--exact'
    ))
    if ($matches.Count -gt 1) { throw "Multiple Buzz channels match $($channel.name)." }
    if ($matches.Count -eq 1) {
        $channelId = [string]$matches[0].channel_id
        $created = $false
    }
    else {
        $createdResponse = Invoke-BuzzJson -CredentialTarget ([string]$manifest.owner.credentialTarget) -Arguments @(
            'channels', 'create',
            '--name', [string]$channel.name,
            '--type', [string]$channel.type,
            '--visibility', [string]$channel.visibility,
            '--description', [string]$channel.description
        )
        $channelId = [string]$createdResponse.channel_id
        $created = $true
    }
    if ($channelId -notmatch '^[a-f0-9-]{36}$') { throw "Buzz channel $($channel.name) returned an invalid identifier." }
    foreach ($memberId in @($channel.members)) {
        $member = @($identityRows | Where-Object { [string]$_.id -ceq [string]$memberId })[0]
        if ($null -eq $member) { throw "Buzz channel $($channel.name) references an unknown agent." }
        $null = Invoke-BuzzJson -CredentialTarget ([string]$manifest.owner.credentialTarget) -Arguments @(
            'channels', 'add-member',
            '--channel', $channelId,
            '--pubkey', [string]$member.publicKey,
            '--role', 'bot'
        )
    }
    $channelRows.Add([pscustomobject][ordered]@{
        id = [string]$channel.id
        name = [string]$channel.name
        channelId = $channelId
        created = $created
        memberCount = @($channel.members).Count
    })
}

$baseState.status = 'ready'
$baseState.channels = @($channelRows)
$baseState.provisionedAt = [DateTimeOffset]::UtcNow.ToString('o')
$baseState.lastCheckedAt = $baseState.provisionedAt
$baseState.summary = 'Ten agent identities and ten private rooms are provisioned on the authenticated Buzz community.'
Write-TeamState -State $baseState
$baseState
