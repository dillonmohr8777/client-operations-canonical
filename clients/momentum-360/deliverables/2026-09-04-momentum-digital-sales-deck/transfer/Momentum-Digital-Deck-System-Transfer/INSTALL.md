# Momentum Digital Deck System Transfer

This transfer contains the complete portable source for the Momentum Digital deck system:

- The editable PowerPoint, static PDF, and self-playing MP4
- The deck build project, brand assets, source record, and QA documentation
- The `client-logo` and `client-deck` skills
- Windows and macOS/Linux installers
- A SHA-256 manifest for every payload file

The transfer excludes dependency caches and temporary render probes. Each skill retains its pinned `package-lock.json`, so a destination computer can restore the dependencies for its own platform.

## Install on Windows

```powershell
.\install.ps1 -Target Claude
.\install.ps1 -Target Codex
.\install.ps1 -Target Both
```

If a destination skill already exists, the installer stops. To replace an existing copy safely, rerun with `-Force`; the old directory is moved to a timestamped backup first.

Use `-SkipDependencies` only when Node.js is unavailable or dependency installation will be handled separately.

## Install on macOS or Linux

```bash
chmod +x install.sh
./install.sh claude
./install.sh codex
./install.sh both
```

Set `FORCE=1` to create backups and replace existing skill directories. Set `SKIP_DEPENDENCIES=1` to skip `npm ci`.

## Important limitation

A PDF upload cannot silently execute or install software. Upload `Momentum-Deck-System-Transfer-Installer.pdf` and `Momentum-Digital-Deck-System-Transfer.zip` together, then explicitly ask the coding agent to install and validate the package. General ChatGPT can read the system as context, while Claude Code or Codex with filesystem access can perform the installation.
