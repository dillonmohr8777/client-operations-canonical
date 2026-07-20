[CmdletBinding()]
param(
    [string]$RepositoryRoot = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = 'Stop'
$expectedMachine = 'AHCM-3LCQVF4'
$actualMachine = [Environment]::MachineName

if ($actualMachine -ne $expectedMachine) {
    throw "This contributor guard is only for $expectedMachine. Current machine: $actualMachine"
}

$root = [IO.Path]::GetFullPath($RepositoryRoot)
$gitDirRaw = (& git -C $root rev-parse --git-dir 2>&1 | Out-String).Trim()
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($gitDirRaw)) {
    throw "Not a Git repository: $root"
}

$gitDir = if ([IO.Path]::IsPathRooted($gitDirRaw)) { $gitDirRaw } else { Join-Path $root $gitDirRaw }
$hooksDir = Join-Path $gitDir 'hooks'
[IO.Directory]::CreateDirectory($hooksDir) | Out-Null
$hookPath = Join-Path $hooksDir 'pre-push'

$hook = @'
#!/bin/sh
set -eu

zero=0000000000000000000000000000000000000000

while read local_ref local_sha remote_ref remote_sha
do
  case "$remote_ref" in
    refs/heads/ahcm/*) ;;
    *)
      echo "Push blocked: AHCM may push only ahcm/* contribution branches." >&2
      exit 1
      ;;
  esac

  if [ "$remote_sha" = "$zero" ]; then
    git fetch origin main >/dev/null 2>&1 || true
    base=$(git merge-base "$local_sha" origin/main)
  else
    base="$remote_sha"
  fi

  changed=$(git diff --name-only "$base" "$local_sha")
  blocked=$(printf '%s\n' "$changed" | grep -E '^(queue/work-items\.json|CONTROL\.md|intake/|state/intake-sync\.json|state/handoff-receipts\.jsonl|state/queue-mutations\.jsonl|state/corrections\.jsonl|state/prediction-outcomes\.jsonl)$' || true)

  if [ -n "$blocked" ]; then
    echo "Push blocked: AHCM contribution modifies protected canonical state:" >&2
    printf '%s\n' "$blocked" >&2
    echo "Put the proposed canonical change in the PR description for DESKTOP review." >&2
    exit 1
  fi
done

exit 0
'@

[IO.File]::WriteAllText($hookPath, $hook, [Text.UTF8Encoding]::new($false))

[pscustomobject]@{
    status = 'installed'
    machine = $actualMachine
    repository = $root
    hook = $hookPath
    allowedBranches = 'ahcm/*'
    canonicalWriter = 'DESKTOP-4AHKEC4'
} | ConvertTo-Json -Compress
