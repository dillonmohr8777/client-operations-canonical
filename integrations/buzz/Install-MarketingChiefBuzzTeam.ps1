[CmdletBinding()]
param(
    [string]$RelayUrl,
    [switch]$RequireRelay,
    [switch]$UseNativeManagedAgents
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
. (Join-Path $PSScriptRoot 'MarketingChief.BuzzCredential.ps1')
. (Join-Path $PSScriptRoot 'MarketingChief.BuzzProcess.ps1')

$manifestPath = Join-Path $PSScriptRoot 'team.manifest.json'
$runtimeRoot = Join-Path $PSScriptRoot 'runtime'
$statePath = Join-Path $runtimeRoot 'team-state.json'
$manifest = Get-Content -Raw -LiteralPath $manifestPath -Encoding UTF8 | ConvertFrom-Json
if ([int]$manifest.schemaVersion -ne 1 -or @($manifest.agents).Count -ne 8 -or @($manifest.channels).Count -ne 10) {
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
        [string]$AuthTagCredentialTarget,
        [string]$InputText,
        [int]$TimeoutSeconds = 30
    )
    $parameters = @{
        CredentialTarget = $CredentialTarget
        RelayUrl = $RelayUrl
        ArgumentList = $Arguments
        TimeoutSeconds = $TimeoutSeconds
    }
    if (-not [string]::IsNullOrWhiteSpace($AuthTagCredentialTarget)) {
        $parameters.AuthTagCredentialTarget = $AuthTagCredentialTarget
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
    managedBy = 'windows-credential-manager'
    publicKey = [string]$ownerIdentity.publicKey
    created = [bool]$ownerIdentity.created
})
if (-not $UseNativeManagedAgents) {
    foreach ($agent in @($manifest.agents)) {
        $identity = Initialize-MarketingChiefBuzzIdentity -Target ([string]$agent.credentialTarget)
        $authTag = New-MarketingChiefBuzzAuthTag `
            -OwnerCredentialTarget ([string]$manifest.owner.credentialTarget) `
            -AgentPublicKey ([string]$identity.publicKey)
        Set-MarketingChiefBuzzAuthTag -Target ([string]$agent.authTagCredentialTarget) -AuthTag $authTag
        $authTag = $null
        $identityRows.Add([pscustomobject][ordered]@{
            id = [string]$agent.id
            displayName = [string]$agent.displayName
            harness = [string]$agent.harness
            credentialTarget = [string]$agent.credentialTarget
            authTagCredentialTarget = [string]$agent.authTagCredentialTarget
            managedBy = 'marketing-chief-bridge'
            publicKey = [string]$identity.publicKey
            created = [bool]$identity.created
        })
    }
}

$baseState = [pscustomobject][ordered]@{
    schemaVersion = 1
    identityMode = if ($UseNativeManagedAgents) { 'native-managed' } else { 'bridge-managed' }
    status = 'identities_ready'
    relayHttpUrl = $RelayUrl
    relayWsUrl = $RelayUrl -replace '^https://', 'wss://'
    ownerPublicKey = [string]$ownerIdentity.publicKey
    identities = @($identityRows)
    channels = @()
    provisionedAt = $null
    lastCheckedAt = [DateTimeOffset]::UtcNow.ToString('o')
    summary = if ($UseNativeManagedAgents) {
        'The owner bridge identity is protected by Windows Credential Manager. Buzz Desktop managed-agent discovery has not completed.'
    } else {
        'All private identities are stored in Windows Credential Manager. Relay provisioning has not completed.'
    }
}

try {
    $null = Invoke-BuzzJson -CredentialTarget ([string]$manifest.owner.credentialTarget) -Arguments @('channels', 'list', '--limit', '1') -TimeoutSeconds 20
}
catch {
    $baseState.status = 'awaiting_auth'
    $baseState.summary = if ($UseNativeManagedAgents) {
        'Official Buzz Desktop is ready. Hosted community authentication is required before native managed agents and channels can be discovered.'
    } else {
        'Official Buzz Desktop and all local identities are ready. Hosted community authentication is required before channels can be provisioned.'
    }
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
if ($UseNativeManagedAgents) {
    $nativePidRoot = Join-Path $env:APPDATA 'xyz.block.buzz.app\agents\agent-pids'
    $nativeAcpPath = 'C:\Users\dillo\AppData\Local\Buzz\buzz-acp.exe'
    $activeNativePubkeys = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
    if (Test-Path -LiteralPath $nativePidRoot -PathType Container) {
        $liveAcpProcesses = @(
            Get-CimInstance Win32_Process -Filter "Name = 'buzz-acp.exe'" -ErrorAction SilentlyContinue |
                Where-Object { [string]$_.ExecutablePath -ceq $nativeAcpPath })
        $liveAcpPids = [Collections.Generic.HashSet[int]]::new()
        foreach ($process in $liveAcpProcesses) { $null = $liveAcpPids.Add([int]$process.ProcessId) }
        foreach ($pidFile in @(Get-ChildItem -LiteralPath $nativePidRoot -Filter '*.json' -File -ErrorAction SilentlyContinue)) {
            if ($pidFile.Name -cmatch '^([a-f0-9]{64})__[a-f0-9]{64}\.json$') {
                $nativePubkey = $Matches[1]
            }
            else {
                continue
            }
            try {
                $pidRecord = Get-Content -Raw -LiteralPath $pidFile.FullName -Encoding UTF8 | ConvertFrom-Json
                if ($liveAcpPids.Contains([int]$pidRecord.pid)) { $null = $activeNativePubkeys.Add($nativePubkey) }
            }
            catch {
                continue
            }
        }
    }
    foreach ($agent in @($manifest.agents)) {
        $matches = @(Invoke-BuzzJson -CredentialTarget ([string]$manifest.owner.credentialTarget) -Arguments @(
            'users', 'get', '--name', [string]$agent.displayName
        ))
        $exactMatches = @($matches | Where-Object { [string]$_.display_name -ceq [string]$agent.displayName })
        if ($exactMatches.Count -gt 1) {
            $exactMatches = @($exactMatches | Where-Object { $activeNativePubkeys.Contains([string]$_.pubkey) })
        }
        if ($exactMatches.Count -ne 1) {
            throw "Expected exactly one active Buzz Desktop managed identity named $($agent.displayName); found $($exactMatches.Count)."
        }
        $publicKey = [string]$exactMatches[0].pubkey
        if ($publicKey -cnotmatch '^[a-f0-9]{64}$') {
            throw "Buzz Desktop managed identity $($agent.displayName) returned an invalid public key."
        }
        $identityRows.Add([pscustomobject][ordered]@{
            id = [string]$agent.id
            displayName = [string]$agent.displayName
            harness = [string]$agent.harness
            credentialTarget = $null
            authTagCredentialTarget = $null
            managedBy = 'buzz-desktop'
            publicKey = $publicKey
            created = $false
        })
    }
    $baseState.identities = @($identityRows)
}
else {
    foreach ($agent in @($manifest.agents)) {
        $null = Invoke-BuzzJson `
            -CredentialTarget ([string]$agent.credentialTarget) `
            -AuthTagCredentialTarget ([string]$agent.authTagCredentialTarget) `
            -Arguments @(
            'users', 'set-profile',
            '--name', [string]$agent.displayName,
            '--about', [string]$agent.role
        )
    }
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
    $desiredPublicKeys = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
    $null = $desiredPublicKeys.Add([string]$ownerIdentity.publicKey)
    foreach ($memberId in @($channel.members)) {
        $member = @($identityRows | Where-Object { [string]$_.id -ceq [string]$memberId })[0]
        if ($null -eq $member) { throw "Buzz channel $($channel.name) references an unknown agent." }
        $null = $desiredPublicKeys.Add([string]$member.publicKey)
    }
    $existingMembers = @(Invoke-BuzzJson -CredentialTarget ([string]$manifest.owner.credentialTarget) -Arguments @(
        'channels', 'members', '--channel', $channelId
    ))
    foreach ($existingMember in $existingMembers) {
        $existingPublicKey = [string]$existingMember.pubkey
        if (-not $desiredPublicKeys.Contains($existingPublicKey)) {
            $null = Invoke-BuzzJson -CredentialTarget ([string]$manifest.owner.credentialTarget) -Arguments @(
                'channels', 'remove-member',
                '--channel', $channelId,
                '--pubkey', $existingPublicKey
            )
        }
    }
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
    $finalMembers = @(Invoke-BuzzJson -CredentialTarget ([string]$manifest.owner.credentialTarget) -Arguments @(
        'channels', 'members', '--channel', $channelId
    ))
    $finalPublicKeys = @($finalMembers | ForEach-Object { [string]$_.pubkey } | Sort-Object -Unique)
    if ($finalPublicKeys.Count -ne $desiredPublicKeys.Count -or @($finalPublicKeys | Where-Object { -not $desiredPublicKeys.Contains($_) }).Count -ne 0) {
        throw "Buzz channel $($channel.name) membership did not converge to the manifest."
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
$baseState.summary = if ($UseNativeManagedAgents) {
    "$(@($manifest.agents).Count) Buzz Desktop managed agents covering ten routed functions and ten private rooms are provisioned on the authenticated Buzz community."
} else {
    "$(@($manifest.agents).Count) bridge-managed agent identities covering ten routed functions and ten private rooms are provisioned on the authenticated Buzz community."
}
Write-TeamState -State $baseState
$baseState
