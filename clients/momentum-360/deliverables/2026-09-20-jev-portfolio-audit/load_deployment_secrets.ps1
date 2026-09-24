# Keep service-only credentials in the existing private Docker volume, not logs or source.
$secretJson = docker run --rm --network none --read-only --mount type=volume,source=deer-flow_gateway-data,target=/runtime --entrypoint python deer-flow-gateway:momentum-20260920-latest -c "import json,os,secrets; from pathlib import Path; p=Path('/runtime/.deployment-secrets.json'); created=False; exec('try:\n fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)\nexcept FileExistsError:\n pass\nelse:\n with os.fdopen(fd,\'w\') as f: json.dump({\'internal_auth\':secrets.token_urlsafe(48),\'frontend_auth\':secrets.token_urlsafe(48)},f)'); print(p.read_text())"
if ($LASTEXITCODE -ne 0) { throw 'Cannot load persistent service credentials' }
$serviceSecrets = $secretJson | ConvertFrom-Json
if (!$serviceSecrets.internal_auth -or !$serviceSecrets.frontend_auth) { throw 'Incomplete persistent service credentials' }
$env:DEER_FLOW_INTERNAL_AUTH_TOKEN = $serviceSecrets.internal_auth
$env:BETTER_AUTH_SECRET = $serviceSecrets.frontend_auth
$secretJson = $null
$serviceSecrets = $null
