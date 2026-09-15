---
name: use-local-models
description: Select and register Marketing Chief local open-weight models in Cursor without pulling weights, writing API keys, or exposing loopback.
---

# Use local models

## Instructions

1. Read `references/cursor-local-models.json` or `registry/cursor-local-models.json`.
2. Pick one recommended lane. Default daily coding is `ornith:35b`. Default daily general is `qwen3.8:27b`. DeepSeek Pro is `deepseek-v4-pro-0813` and needs vLLM or SGLang.
3. On a desktop that can reach loopback, open Cursor Settings → Models. Enable OpenAI API Key and Override OpenAI Base URL. Set `http://127.0.0.1:11434/v1` or `http://127.0.0.1:20128/v1`.
4. Type the exact `pickerId` and click Add Custom Model. Cursor does not refresh custom models from `/v1/models`.
5. If a picker ID uses the `mc-` prefix, the gateway must already understand that alias. Do not create OmniRoute aliases from this skill.
6. Cloud Agents stay on Cursor-hosted models. Do not claim a loopback model is serving this session.
7. Never pull weights, write secrets, edit `state.vscdb`, enable tunnels, or mutate the canonical queue.

## Examples

- User asks to code locally on a 24 GB box: use `ornith:35b`.
- User asks for DeepSeek Pro in Cursor: add `deepseek-v4-pro-0813` only on a cluster desktop; do not treat `deepseek-v4-pro:0813-cloud` as local.
- User asks for Kimi K2.7 Code as a custom model: add `mc-kimi-k2.7-code`, not `kimi-k2.7-code`.

## Performance Notes

Keep one chat model selected. Embedding work uses `nomic-embed-text` outside the chat picker.

## Troubleshooting

- Model already available: the ID collides with a Cursor built-in. Use the `mc-` picker ID.
- Connection failed from Cloud Agent: expected. Loopback is not reachable from Cursor Cloud.
- Empty model list after Refresh: expected. Add the `pickerId` manually.
