---
name: use-local-models
description: Select Marketing Chief catalog model IDs and use Codex Ollama Cloud MCP without localhost Cursor BYOK or new local pulls.
---

# Use local models

## Instructions

1. Read `references/cursor-local-models.json` or `registry/cursor-local-models.json`.
2. Authorized inference is Ollama Cloud through Codex desktop `local-ai-worker` tools `ollama_cloud_status` and `ollama_cloud_run`.
3. Call `ollama_cloud_run` only with an exact alias from `ollama_cloud_status`, `instruction`, and `cloudAuthorized: true`.
4. Do not download or launch new local models or purchase anything.
5. Do not enable Override OpenAI Base URL or add custom models as localhost BYOK. Cursor backend cannot reach desktop loopback.
6. If a catalog ID uses the `mc-` prefix, the gateway must already understand that alias. Do not create OmniRoute aliases from this skill.
7. Cloud Agents stay on Cursor-hosted models. Do not claim a loopback model is serving this session.
8. Never pull weights from a Cloud Agent, write secrets, edit `state.vscdb`, enable tunnels, or mutate the canonical queue.

## Examples

- User asks for Ollama Cloud: run `ollama_cloud_status`, then `ollama_cloud_run` with an exact listed alias.
- User asks for DeepSeek Pro locally: keep `deepseek-v4-pro-0813` as catalog only; do not treat `deepseek-v4-pro:0813-cloud` as a local pull and do not launch vLLM from this skill.
- User asks for Kimi K2.7 Code as a custom model: keep `mc-kimi-k2.7-code`, not `kimi-k2.7-code`, and do not add it as localhost BYOK.

## Performance Notes

Keep one chat model selected. Embedding work uses `nomic-embed-text` outside the chat picker.

## Troubleshooting

- Model already available: the ID collides with a Cursor built-in. Use the `mc-` picker ID.
- Connection failed from Cloud Agent: expected. Cursor backend cannot reach desktop loopback.
- Empty model list after Refresh: expected. This pack is catalog only, not a hosted Cursor picker.
