#!/usr/bin/env bash
set -euo pipefail

target="${1:-both}"
case "$target" in
  claude|codex|both) ;;
  *) echo "Usage: ./install.sh [claude|codex|both]" >&2; exit 2 ;;
esac

source_root="$(cd "$(dirname "$0")" && pwd)/skills"
skills=(client-logo client-deck)
destinations=()

if [[ "$target" == "claude" || "$target" == "both" ]]; then
  destinations+=("Claude:$HOME/.claude/skills")
fi
if [[ "$target" == "codex" || "$target" == "both" ]]; then
  destinations+=("Codex:$HOME/.codex/skills")
fi

for skill in "${skills[@]}"; do
  [[ -f "$source_root/$skill/SKILL.md" ]] || { echo "Missing source skill: $skill" >&2; exit 1; }
done

stamp="$(date -u +%Y%m%dT%H%M%SZ)"

for entry in "${destinations[@]}"; do
  name="${entry%%:*}"
  root="${entry#*:}"
  mkdir -p "$root"

  for skill in "${skills[@]}"; do
    source_path="$source_root/$skill"
    target_path="$root/$skill"

    if [[ -e "$target_path" ]]; then
      if [[ "${FORCE:-0}" != "1" ]]; then
        echo "$name already has $skill at $target_path. Rerun with FORCE=1 to back it up and replace it." >&2
        exit 1
      fi
      mv "$target_path" "$target_path.backup-$stamp"
    fi

    cp -R "$source_path" "$target_path"
    echo "Installed $skill for $name: $target_path"

    if [[ "${SKIP_DEPENDENCIES:-0}" != "1" && -f "$target_path/package-lock.json" ]]; then
      command -v npm >/dev/null || { echo "npm is required. Set SKIP_DEPENDENCIES=1 only if restoring separately." >&2; exit 1; }
      npm ci --prefix "$target_path"
    fi

    [[ -f "$target_path/SKILL.md" ]] || { echo "Validation failed: SKILL.md missing." >&2; exit 1; }
  done

  [[ -f "$root/client-deck/brands/momentum-digital.json" ]] || { echo "Momentum brand JSON missing." >&2; exit 1; }
  asset_count="$(find "$root/client-deck/assets/momentum-digital" -maxdepth 1 -type f -name '*.png' | wc -l | tr -d ' ')"
  [[ "$asset_count" == "4" ]] || { echo "Momentum brand assets incomplete." >&2; exit 1; }
done

echo "Install complete. Verify ffmpeg for video and logo animation. Microsoft PowerPoint on Windows is required for native presentation rendering and export."
