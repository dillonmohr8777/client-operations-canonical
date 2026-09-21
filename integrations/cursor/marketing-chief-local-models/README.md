# Marketing Chief Local Models

Registers the canonical local and open-weight roster inside Cursor as unique custom-model picker IDs.

This plugin does not add models to Cursor's hosted catalog by itself. Cursor does not auto-discover `/v1/models`. On a desktop that can reach loopback, add each `pickerId` under Settings → Models after enabling Override OpenAI Base URL. Cloud Agents keep using Cursor-hosted models.

## Install

From the Marketing Chief repo:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Install-CursorLocalModels.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Install-CursorLocalModels.ps1 -Apply
```

`-Apply` copies this plugin to `~/.cursor/plugins/local/marketing-chief-local-models` and writes a non-secret catalog to `~/.cursor/marketing-chief-local-models.json`. It does not write API keys, edit `state.vscdb`, enable tunnels, pull Ollama weights, or change OmniRoute defaults.

## Components

- Rule `local-models` — always-on picker IDs and authority gates
- Skill `use-local-models` — how to choose a lane and add the ID in Cursor
- Command `local-models` — print the current picker table
- `references/cursor-local-models.json` — generated pack

## Desktop picker

| Lane | Add this exact ID |
| --- | --- |
| Frontier cluster | `deepseek-v4-pro-0813` |
| Frontier workstation | `deepseek-v4-flash-0731` |
| Daily coding | `ornith:35b` |
| Daily general | `qwen3.8:27b` |
| Daily vision | `gemma4:31b` |
| Compact daily | `gpt-oss:20b` |
| Compact coding | `ornith:9b` |
| Local Qwen 3.6 | `qwen3.6:35b` |
| Local Qwen 3.5 35B | `qwen3.5:35b` |
| Local Qwen 3.5 9B | `qwen3.5:9b` |
| Gemma 4 26B | `gemma4:26b` |
| Gemma 4 E4B | `gemma4:e4b` |
| Local GLM | `glm-4.7-flash` |

Base URL is `http://127.0.0.1:11434/v1` for Ollama or `http://127.0.0.1:20128/v1` for OmniRoute. Include `/v1`. Do not add `kimi-k2.7-code` or `glm-5.1` as those collide with Cursor built-ins; the pack uses `mc-kimi-k2.7-code` and `mc-glm-5.1`.
