# Local open-weight model roster

`registry/local-models.json` is the canonical recommended set of current local and open-weight models for Marketing Chief, OmniRoute, and Ollama.

This roster does not pull weights, change OmniRoute defaults, create a second queue, or authorize spend. Pulling weights and changing OmniRoute defaults stay approval-gated. Vendor benchmark numbers are observations from official cards and library pages reviewed on 2026-09-08. They are not independent reruns and they are not permission to enable a route.

## Cloud Agents cannot install these

You get them on **DESKTOP** or **AHCM**, not in a Cloud Agent. A Cloud Agent session cannot download weights onto those machines or reach `127.0.0.1:11434`. Do not use Ollama `:cloud` tags as “we have them locally.” Do not open a tunnel so a Cloud Agent can pretend it is local.

## Pull on DESKTOP or AHCM

Start here on a 24 GB box. Pull the daily set in Ollama, then point desktop Cursor at loopback:

```powershell
ollama pull ornith:35b
ollama pull qwen3.8:27b
ollama pull gemma4:31b
ollama pull gpt-oss:20b
ollama pull ornith:9b
```

16 GB class instead: `ornith:9b`, `gpt-oss:20b`, `qwen3.5:9b`, `gemma4:e4b`.

Also recommended local pulls if they fit: `qwen3.6:35b`, `qwen3.5:35b`, `gemma4:26b`, `glm-4.7-flash`.

Confirm they are local, not `:cloud`:

```powershell
ollama list
curl.exe http://127.0.0.1:11434/api/tags
```

After a pull on DESKTOP or AHCM, report which roster tags are actually installed:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Update-AiStackState.ps1 -NoWrite
```

`-NoWrite` probes only `127.0.0.1:11434` and `127.0.0.1:20128`. Cloud Ollama aliases such as `deepseek-v4-pro:cloud` are ignored when counting local models.

## Institute into desktop Cursor

Then in **desktop** Cursor, not a Cloud Agent:

1. Run `scripts/Install-CursorLocalModels.ps1 -Apply` from the repo.
2. Settings → Models → enable OpenAI API Key and Override OpenAI Base URL.
3. Set the URL to `http://127.0.0.1:11434/v1` (include `/v1`). OmniRoute is `http://127.0.0.1:20128/v1` when that gateway is the intended route.
4. Type the exact picker ID, for example `ornith:35b`, and click **Add Custom Model**.
5. Select that model in Agent/Chat.

Cursor does not auto-discover `/v1/models`. The plugin only installs IDs and docs. Overriding the OpenAI base URL sends those custom IDs to Ollama; keep the IDs exact. `kimi-k2.7-code` and `glm-5.1` collide with Cursor built-ins, so use `mc-kimi-k2.7-code` and `mc-glm-5.1` only if a local gateway already aliases them.

| Lane | Add this exact ID |
| --- | --- |
| Daily coding | `ornith:35b` |
| Daily general | `qwen3.8:27b` |
| Daily vision | `gemma4:31b` |
| Compact daily | `gpt-oss:20b` |
| Compact coding | `ornith:9b` |
| 16 GB extra | `qwen3.5:9b`, `gemma4:e4b` |
| If they fit | `qwen3.6:35b`, `qwen3.5:35b`, `gemma4:26b`, `glm-4.7-flash` |
| Frontier cluster | `deepseek-v4-pro-0813` against a cluster OpenAI-compatible `/v1` |
| Frontier workstation | `deepseek-v4-flash-0731` against that same class of `/v1` |

`scripts/Install-CursorLocalModels.ps1 -Apply` copies `integrations/cursor/marketing-chief-local-models` to `~/.cursor/plugins/local/marketing-chief-local-models` and writes a non-secret catalog to `~/.cursor/marketing-chief-local-models.json`. It never writes API keys, edits `state.vscdb`, enables tunnels, pulls weights, or changes OmniRoute defaults.

Validate the roster and pack without touching loopback:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Test-LocalModelRoster.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Test-CursorLocalModels.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Install-CursorLocalModels.ps1
```

## DeepSeek Pro is not an Ollama local pull

`deepseek-v4-pro:cloud` and `deepseek-v4-pro:0813-cloud` are hosted aliases. Official local serve is Hugging Face `deepseek-ai/DeepSeek-V4-Pro-0813` through vLLM or SGLang on multi-GPU. Flash is `deepseek-ai/DeepSeek-V4-Flash`. Same for Kimi weights on Hugging Face. Those need a cluster, then a Cursor picker ID of `deepseek-v4-pro-0813` against that OpenAI-compatible `/v1`.

The preview card still has the published MMLU-Pro 87.5, GPQA Diamond 90.1, LiveCodeBench 93.5, and SWE-bench Verified 80.6 tables. Those scores stay on the preview record so the 0813 agentic suite is not mixed with the older knowledge table.

## What to run locally

| Lane | Model | Why | Local path |
| --- | --- | --- | --- |
| Frontier cluster | DeepSeek-V4-Pro-0813 | Latest official DeepSeek Pro. Terminal-Bench 2.1 87.9, HLE 42.7 / 60.0 with tools, DeepSWE 62.7. | Hugging Face + vLLM or SGLang. Ollama has only a cloud alias. |
| Frontier workstation | DeepSeek-V4-Flash-0731 | Same V4 family with 13B active experts. Terminal-Bench 2.1 82.7. | Hugging Face + vLLM or SGLang. |
| Daily coding | Ornith-1.0-35B | Best current 24 GB coding-agent scores: SWE-bench Verified 75.6, Terminal-Bench 2.1 64.2. | `ollama pull ornith:35b` |
| Daily general | Qwen3.8-27B | Newest local Qwen weights, 18 GB, 256K, vision. | `ollama pull qwen3.8:27b` |
| Daily vision | Gemma 4 31B | Local Google open model. GPQA Diamond 84.3, LiveCodeBench v6 80.0, MMMU Pro 76.9. | `ollama pull gemma4:31b` |
| Compact daily | gpt-oss-20B | Apache-2.0, 14 GB MXFP4. | `ollama pull gpt-oss:20b` |
| Compact coding | Ornith-1.0-9B | 5.6 GB coding specialist. SWE-bench Verified 69.4. | `ollama pull ornith:9b` |

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
