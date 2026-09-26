---
name: local-models
description: List the Marketing Chief local open-weight catalog IDs and the Ollama Cloud MCP path.
---

# Local models

Read `references/cursor-local-models.json` if this plugin is installed, or `registry/cursor-local-models.json` in the Marketing Chief repo. Use Ollama Cloud through Codex desktop `local-ai-worker` tools `ollama_cloud_status` and `ollama_cloud_run`. Do not download or launch new local models or purchase anything. Cursor backend cannot reach desktop loopback, so do not enable Override OpenAI Base URL or localhost BYOK. Do not change OmniRoute.

## Authorized path

1. `ollama_cloud_status` for exact registered aliases
2. `ollama_cloud_run` with that exact alias, `instruction`, and `cloudAuthorized: true`
3. Keep Cloud Agents on Cursor-hosted models

## Catalog chat IDs

- `deepseek-v4-pro-0813`
- `deepseek-v4-flash-0731`
- `ornith:35b`
- `qwen3.8:27b`
- `gemma4:31b`
- `gpt-oss:20b`
- `ornith:9b`
- `qwen3.6:35b`
- `qwen3.5:35b`
- `qwen3.5:9b`
- `gemma4:26b`
- `gemma4:e4b`
- `glm-4.7-flash`

## Also in the pack

- Watch: `qwen3-coder-next`, `llama4:scout`, `gpt-oss:120b`
- Collision-safe: `mc-kimi-k2.7-code`, `mc-glm-5.1`
- Preview: `deepseek-v4-pro-preview`
- Embeddings only: `nomic-embed-text`

Cloud Agents keep Cursor-hosted models. Loopback is not reachable from Cursor Cloud.
