# Local open-weight model roster

`registry/local-models.json` is the canonical recommended set of current local and open-weight models for Marketing Chief, OmniRoute, and Ollama.

This roster does not pull weights, launch new local models, purchase anything, change OmniRoute defaults, create a second queue, or authorize spend. Pulling weights, launching new local models, purchases, and OmniRoute default changes stay approval-gated. Vendor benchmark numbers are observations from official cards and library pages reviewed on 2026-09-08. They are not independent reruns and they are not permission to enable a route.

## Use Ollama Cloud through Codex

Authorized inference is Ollama Cloud. Codex owns the explicit cloud MCP in desktop `local-ai-worker`: `ollama_cloud_status` and `ollama_cloud_run`. Call `ollama_cloud_run` only with an exact alias from `ollama_cloud_status`, `instruction`, and `cloudAuthorized: true`. Catalog presence does not prove account entitlement. Do not download or launch new local models or purchase anything.

This Cloud Agent cannot reach desktop loopback or those MCP tools. DESKTOP and AHCM remain the only catalog hosts. Do not open a tunnel so a Cloud Agent can pretend it is local.

Desktop Cursor CLI verified `ollama_cloud_run` on 2026-09-08: requested `gemma4:31b-cloud`, provider receipt `gemma4:31b`, answer `42`, 464 ms. Two CLI MCP permission rules unblocked that headless call. All deny rules stayed. `skipApproval` remains false. The hosted web agent stays separate and must not reuse that desktop receipt.

## Cursor backend cannot reach desktop loopback

Do not enable Override OpenAI Base URL, do not point Cursor at `http://127.0.0.1:11434/v1`, and do not add custom models as localhost BYOK. Cursor Cloud and the Cursor backend cannot reach desktop loopback. The plugin only records picker IDs and docs. It is not a hosted catalog and it is not a working loopback route.

Collision IDs stay `mc-kimi-k2.7-code` and `mc-glm-5.1`. Cloud Agents keep Cursor-hosted models.

## Catalog pull sets stay unused

The 24 GB, 16 GB, and recommended-if-fits tags remain catalog evidence. Do not pull them under the current scope.

24 GB catalog: `ornith:35b`, `qwen3.8:27b`, `gemma4:31b`, `gpt-oss:20b`, `ornith:9b`.

16 GB catalog: `ornith:9b`, `gpt-oss:20b`, `qwen3.5:9b`, `gemma4:e4b`.

If they fit, unused catalog: `qwen3.6:35b`, `qwen3.5:35b`, `gemma4:26b`, `glm-4.7-flash`.

A `:cloud` tag is a hosted alias, not a local install. `scripts/Update-AiStackState.ps1 -NoWrite` may probe loopback for evidence only. It must not pull, launch, purchase, or write Cursor settings.

## Plugin installer stays dry-run here

`scripts/Install-CursorLocalModels.ps1` is prepare-only in this session. Do not run `-Apply`, do not change installed plugins, and do not expose endpoints.

Validate the roster and pack without touching loopback:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Test-LocalModelRoster.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Test-CursorLocalModels.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Install-CursorLocalModels.ps1
```

## DeepSeek Pro is not an Ollama local pull

`deepseek-v4-pro:cloud` and `deepseek-v4-pro:0813-cloud` are hosted aliases. Official local serve is Hugging Face `deepseek-ai/DeepSeek-V4-Pro-0813` through vLLM or SGLang on multi-GPU. Flash is `deepseek-ai/DeepSeek-V4-Flash`. Same for Kimi weights on Hugging Face. Those need a cluster. Do not download or launch them from this roster. Cursor picker ID `deepseek-v4-pro-0813` is catalog only and is not a localhost BYOK route.

The preview card still has the published MMLU-Pro 87.5, GPQA Diamond 90.1, LiveCodeBench 93.5, and SWE-bench Verified 80.6 tables. Those scores stay on the preview record so the 0813 agentic suite is not mixed with the older knowledge table.

## Catalog lanes

| Lane | Model | Why | Authorized path |
| --- | --- | --- | --- |
| Cloud MCP | Exact alias from `ollama_cloud_status` | Signed-in Ollama Cloud through Codex `local-ai-worker`. | `ollama_cloud_run` with `cloudAuthorized: true` |
| Frontier cluster | DeepSeek-V4-Pro-0813 | Latest official DeepSeek Pro. Terminal-Bench 2.1 87.9, HLE 42.7 / 60.0 with tools, DeepSWE 62.7. | Hugging Face + vLLM or SGLang. Do not pull from this roster. |
| Daily coding catalog | Ornith-1.0-35B | Best current 24 GB coding-agent scores: SWE-bench Verified 75.6, Terminal-Bench 2.1 64.2. | Unused local tag `ornith:35b` |
| Daily general catalog | Qwen3.8-27B | Newest local Qwen weights, 18 GB, 256K, vision. | Unused local tag `qwen3.8:27b` |
| Daily vision catalog | Gemma 4 31B | Local Google open model. GPQA Diamond 84.3, LiveCodeBench v6 80.0, MMMU Pro 76.9. | Unused local tag `gemma4:31b`. Cloud example alias `gemma4:31b-cloud` only if `ollama_cloud_status` lists it. |
| Compact daily catalog | gpt-oss-20B | Apache-2.0, 14 GB MXFP4. | Unused local tag `gpt-oss:20b` |
| Compact coding catalog | Ornith-1.0-9B | 5.6 GB coding specialist. SWE-bench Verified 69.4. | Unused local tag `ornith:9b` |

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
