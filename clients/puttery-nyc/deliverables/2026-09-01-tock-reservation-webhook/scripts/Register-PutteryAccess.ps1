[CmdletBinding()]
param(
    [string]$RegistryPath = 'C:\Users\dillo\AppData\Local\Codex\AccessBroker\registry.json',
    [string]$AuditPath = 'C:\Users\dillo\AppData\Local\Codex\AccessBroker\audit.jsonl'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$mutex = [Threading.Mutex]::new($false, 'Codex.AccessBroker.Registry.PutteryNYC')
$hasMutex = $false
$temporaryPath = $null

try {
    $hasMutex = $mutex.WaitOne([TimeSpan]::FromSeconds(20))
    if (-not $hasMutex) { throw 'access_registry_lock_timeout' }
    if (-not (Test-Path -LiteralPath $RegistryPath -PathType Leaf)) {
        throw 'access_registry_missing'
    }

    $document = Get-Content -Raw -LiteralPath $RegistryPath | ConvertFrom-Json
    if ([int]$document.schema_version -lt 1) { throw 'access_registry_schema_invalid' }
    $clients = @($document.clients)
    if (@($clients | Where-Object { $_.id -eq 'puttery-nyc' }).Count -gt 0) {
        throw 'puttery_access_registry_entry_already_exists'
    }

    $verifiedAt = (Get-Date).ToUniversalTime().ToString('o')
    $entry = [pscustomobject][ordered]@{
        id = 'puttery-nyc'
        display_name = 'Puttery NYC'
        status = 'active'
        authorization = [pscustomobject][ordered]@{
            basis = 'user-direct-request://2026-09-01/tock-reservation-webhook-setup'
            reviewed_at = $verifiedAt
            valid_until = $null
            allowed_capabilities = @(
                'account.metadata.read',
                'credential.reference.read',
                'credential.protected.store',
                'tock.data-export.authorization.probe',
                'tock.webhook.receiver.local-test'
            )
            prohibited_capabilities = @(
                'credentials.reveal',
                'tock.webhook.production.register',
                'tock.data-export.payload.download',
                'guest.profile.read',
                'ad.conversion.send',
                'ads.spend.change',
                'billing.purchase',
                'ownership.change',
                'security.controls.disable'
            )
        }
        systems = @(
            [pscustomobject][ordered]@{
                id = 'tock-data-exports-api'
                service = 'tock'
                endpoint = 'https://api.exploretock.com/api/data/export/urls'
                environment = 'production'
                auth_method = 'windows-credential-manager-jwt'
                secret_ref = 'wincred://Codex.ClientAccess.PutteryNYC.TockRoleAccount'
                allowed_capabilities = @(
                    'account.metadata.read',
                    'tock.data-export.authorization.probe'
                )
                last_verified_at = $null
            },
            [pscustomobject][ordered]@{
                id = 'tock-reservation-webhook'
                service = 'tock'
                endpoint = 'pending://durable-https-host/webhooks/tock/reservations'
                environment = 'production'
                auth_method = 'windows-credential-manager-static-header'
                secret_ref = 'wincred://Codex.ClientAccess.PutteryNYC.TockWebhookAuthorization'
                allowed_capabilities = @('tock.webhook.receiver.local-test')
                last_verified_at = $verifiedAt
            }
        )
    }

    $document.clients = @($clients + $entry)
    $directory = Split-Path -Parent $RegistryPath
    $timestamp = (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssZ')
    $backupPath = Join-Path $directory "registry.json.pre-puttery-$timestamp.bak"
    Copy-Item -LiteralPath $RegistryPath -Destination $backupPath

    $temporaryPath = Join-Path $directory "registry.json.puttery-$([guid]::NewGuid().ToString('N')).tmp"
    $json = $document | ConvertTo-Json -Depth 100
    [IO.File]::WriteAllText($temporaryPath, $json + [Environment]::NewLine, [Text.UTF8Encoding]::new($false))
    $validation = Get-Content -Raw -LiteralPath $temporaryPath | ConvertFrom-Json
    $inserted = @($validation.clients | Where-Object { $_.id -eq 'puttery-nyc' })
    if ($inserted.Count -ne 1 -or @($inserted[0].systems).Count -ne 2) {
        throw 'access_registry_write_validation_failed'
    }
    Move-Item -LiteralPath $temporaryPath -Destination $RegistryPath -Force
    $temporaryPath = $null

    $audit = [ordered]@{
        at = $verifiedAt
        event = 'access_registry_client_added'
        client_id = 'puttery-nyc'
        systems = @('tock-data-exports-api', 'tock-reservation-webhook')
        contains_secrets = $false
        production_webhook_authorized = $false
    } | ConvertTo-Json -Compress
    [IO.File]::AppendAllText($AuditPath, $audit + [Environment]::NewLine, [Text.UTF8Encoding]::new($false))

    [pscustomobject]@{
        registered = $true
        clientId = 'puttery-nyc'
        systemCount = 2
        backup = $backupPath
        containsSecrets = $false
        productionWebhookAuthorized = $false
    } | ConvertTo-Json
}
finally {
    if ($temporaryPath -and (Test-Path -LiteralPath $temporaryPath -PathType Leaf)) {
        Remove-Item -LiteralPath $temporaryPath -Force -Confirm:$false
    }
    if ($hasMutex) { $mutex.ReleaseMutex() }
    $mutex.Dispose()
}
