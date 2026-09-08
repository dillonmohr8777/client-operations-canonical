# Local open-weight model roster

`registry/local-models.json` is the canonical recommended set of current local and open-weight models for Marketing Chief, OmniRoute, and Ollama.

This file is prepare-only. It does not pull weights, change OmniRoute defaults, create a second queue, or authorize spend. Vendor benchmark numbers are observations from official cards and library pages reviewed on 2026-09-08. They are not independent reruns and they are not permission to enable a route.

## How to use it

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Test-LocalModelRoster.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Test-CursorLocalModels.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Install-CursorLocalModels.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Install-CursorLocalModels.ps1 -Apply
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Update-AiStackState.ps1 -NoWrite
```

`Update-AiStackState.ps1` rereads the roster, probes only `127.0.0.1:11434` and `127.0.0.1:20128`, and optionally writes `state/ai-stack.json`. Cloud Ollama aliases such as `deepseek-v4-pro:cloud` are ignored when counting local models. Pulling a model or changing an OmniRoute default remains approval-gated.

## Institute into Cursor

`registry/cursor-local-models.json` is the generated picker pack. Project rule `.cursor/rules/local-models.mdc` is always on in this repo. `scripts/Install-CursorLocalModels.ps1 -Apply` copies `integrations/cursor/marketing-chief-local-models` to `~/.cursor/plugins/local/marketing-chief-local-models` and writes a non-secret catalog to `~/.cursor/marketing-chief-local-models.json`.

Cursor does not auto-discover `/v1/models`. A plugin or repo rule cannot inject IDs into the hosted model catalog. On a desktop that can reach loopback:

1. Open Cursor Settings → Models.
2. Enable OpenAI API Key and Override OpenAI Base URL.
3. Set `http://127.0.0.1:11434/v1` for Ollama or `http://127.0.0.1:20128/v1` for OmniRoute.
4. Type each `pickerId` and click Add Custom Model.

| Lane | Add this exact ID |
| --- | --- |
| Frontier cluster | `deepseek-v4-pro-0813` |
| Frontier workstation | `deepseek-v4-flash-0731` |
| Daily coding | `ornith:35b` |
| Daily general | `qwen3.8:27b` |
| Daily vision | `gemma4:31b` |
| Compact daily | `gpt-oss:20b` |
| Compact coding | `ornith:9b` |
| Local Qwen / Gemma / GLM | `qwen3.6:35b`, `qwen3.5:35b`, `qwen3.5:9b`, `gemma4:26b`, `gemma4:e4b`, `glm-4.7-flash` |

Cloud Agents keep Cursor-hosted models. Loopback URLs are not reachable from Cursor Cloud. Do not add `kimi-k2.7-code` or `glm-5.1` as custom models; those names collide with Cursor built-ins. The pack uses `mc-kimi-k2.7-code` and `mc-glm-5.1`. The installer never writes API keys, edits `state.vscdb`, enables tunnels, or changes OmniRoute defaults.

## What to run locally

| Lane | Model | Why | Local path |
| --- | --- | --- | --- |
| Frontier cluster | DeepSeek-V4-Pro-0813 | Latest official DeepSeek Pro. Terminal-Bench 2.1 87.9, HLE 42.7 / 60.0 with tools, DeepSWE 62.7. | Hugging Face + vLLM or SGLang. Ollama has only a cloud alias. |
| Frontier workstation | DeepSeek-V4-Flash-0731 | Same V4 family with 13B active experts. Terminal-Bench 2.1 82.7. | Hugging Face + vLLM or SGLang. |
| Daily coding | Ornith-1.0-35B | Best current 24 GB coding-agent scores: SWE-bench Verified 75.6, Terminal-Bench 2.1 64.2. | `ollama run ornith:35b` |
| Daily general | Qwen3.8-27B | Newest local Qwen weights, 18 GB, 256K, vision. | `ollama run qwen3.8:27b` |
| Daily vision | Gemma 4 31B | Local Google open model. GPQA Diamond 84.3, LiveCodeBench v6 80.0, MMMU Pro 76.9. | `ollama run gemma4:31b` |
| Compact daily | gpt-oss-20B | Apache-2.0, 14 GB MXFP4. | `ollama run gpt-oss:20b` |
| Compact coding | Ornith-1.0-9B | 5.6 GB coding specialist. SWE-bench Verified 69.4. | `ollama run ornith:9b` |

## DeepSeek Pro note

"DeepSeek Pro" now means **DeepSeek-V4-Pro-0813**, the official production release that supersedes the April 2026 preview. Official local serving is vLLM or SGLang. The Ollama library entries `deepseek-v4-pro:cloud` and `deepseek-v4-pro:0813-cloud` are hosted aliases, not local weights.

The preview card still has the published MMLU-Pro 87.5, GPQA Diamond 90.1, LiveCodeBench 93.5, and SWE-bench Verified 80.6 tables. Those scores stay on the preview record so the 0813 agentic suite is not mixed with the older knowledge table.

## Sources checked

- [DeepSeek-V4-Pro-0813](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-0813)
- [DeepSeek-V4-Pro preview](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro)
- [Ollama library](https://ollama.com/library)
- [Ollama DeepSeek-V4-Pro](https://ollama.com/library/deepseek-v4-pro)
- [Ollama Qwen3.8](https://ollama.com/library/qwen3.8)
- [Ollama Gemma 4](https://ollama.com/library/gemma4)
- [Ollama Ornith](https://ollama.com/library/ornith)
- [Ornith-1 benchmark tables](https://github.com/deepreinforce-ai/Ornith-1)
- [Ollama gpt-oss](https://ollama.com/library/gpt-oss)
- [Ollama GLM-4.7-Flash](https://ollama.com/library/glm-4.7-flash)
- [Ollama GLM-5.1](https://ollama.com/library/glm-5.1)
- [Ollama Kimi K2.7 Code](https://ollama.com/library/kimi-k2.7-code)
