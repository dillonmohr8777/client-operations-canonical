# Marketing Chief Local Models

Registers the canonical local and open-weight roster inside Cursor as unique catalog picker IDs.

This plugin does not add models to Cursor's hosted catalog. Cursor backend cannot reach desktop loopback, so do not enable Override OpenAI Base URL or localhost BYOK. Authorized inference is Ollama Cloud through Codex desktop `local-ai-worker` tools `ollama_cloud_status` and `ollama_cloud_run`. Do not download or launch new local models or purchase anything. Cloud Agents keep using Cursor-hosted models.

## Install

From the Marketing Chief repo:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Install-CursorLocalModels.ps1
```

Do not run `-Apply` from a Cloud Agent. `-Apply` would copy this plugin to `~/.cursor/plugins/local/marketing-chief-local-models` and write a non-secret catalog to `~/.cursor/marketing-chief-local-models.json`. It does not write API keys, edit `state.vscdb`, enable tunnels, pull Ollama weights, or change OmniRoute defaults.

## Components

- Rule `local-models` — always-on catalog IDs and authority gates
- Skill `use-local-models` — how to choose a lane and use Ollama Cloud MCP
- Command `local-models` — print the current catalog table
- `references/cursor-local-models.json` — generated pack

## Catalog picker IDs

| Lane | Catalog ID |
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

These IDs are catalog only. They are not localhost BYOK routes. Do not add `kimi-k2.7-code` or `glm-5.1` as those collide with Cursor built-ins; the pack uses `mc-kimi-k2.7-code` and `mc-glm-5.1`.
