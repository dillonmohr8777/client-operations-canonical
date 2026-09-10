# OpenRouter Astra stack

Verified 2026-09-09 against [Ben Gusberg’s TikTok](https://www.tiktok.com/@bengusberg/video/7683351620536585486) (`https://www.tiktok.com/t/ZP83dqr8V/`). Spoken captions: `tiktok-captions.vtt`.

## Is the TikTok true?

**The method is real. The “free GPT-6 Astra / Claude Fable 5.1” claim is not.**

The 36-second clip says: go to a YC model-routing site, open Models, click Astra (or Fable 5.1), Quick Start, create an API key, and then you can use GPT-6 for free. That site is OpenRouter.

What is true:

- OpenRouter is the right institution point. One key can call Astra, Fable 5.1, Opus, Grok, Gemini, GPT-5.6, and the rest.
- Astra is listed. Official slug: `openai/gpt-6-astra`.
- Creating a key is the correct first step.

What is false:

- Creating a key does not make Astra or Fable free.
- Live OpenRouter Astra pricing is paid. Official page: [openrouter.ai/openai/gpt-6-astra](https://openrouter.ai/openai/gpt-6-astra). OpenAI Flex $5 / $25 per million tokens, Standard $10 / $50, Fast $20 / $100. OpenAI’s own Astra page matches Standard $10 / $50.
- The existing OpenRouter Telegram gateway key is authenticated and still returns **HTTP 402 Payment Required** for Astra, Fable 5.1, Opus 5, GPT-5.6 Sol, Grok 4.6, Gemini 3.8 Flash, and GLM 5.3 Flash.
- Muse Spark 1.3 returns **403** on that key (policy / entitlement, not a free promo).
- The advertised “free” GLM slug `z-ai/glm-5.2:free` returns **404**.

## What was instituted

These existing keys were attached to OmniRoute 3.8.48 without printing secret values:

| Locator | Attached as | Live generation tonight |
| --- | --- | --- |
| `Codex/TelegramModelGateway/OpenRouter` | OpenRouter Telegram Model Gateway | Authenticated. Paid frontier models 402 until credits exist. |
| `Hermes/OpenRouter/Hermes Zero Credit` | OpenRouter Hermes Zero Credit | Authenticated. Frontier slugs 404 / 403. Name matches the empty-credit state. |
| `Codex/TelegramModelGateway/InferenceNet` | Inference.net Personal Model Gateway | **DeepSeek V4 Pro 0813 live** through `local-ai-worker` (`PONG`, 79 tokens, ~$0.00015). Direct WinCred HTTP canary did not decode a usable status. OmniRoute marks this connection token as expired because of a storage-key mismatch, not because the Inference.net key is gone. |
| TokenRouter via `env://OMNIROUTE_API_KEY` | TokenRouter Kimi K3 | Catalog live: 119 routed models, credential probe valid. Generation is not entitled: `kimi-k3-free` 503, Fable 5 / Opus 5 / GPT-5.6 Sol / Terra / Grok 4.5 / Gemini 3.6 Flash all 403. No `gpt-6-astra` row. |
| `dpapi-bootstrap://xai/dillon-os/daily-x-search` | xAI Daily Search Gateway | Key present. Direct `api.x.ai/v1/responses` returns **403** for grok-4.6 / 4.5 / 4. Scope looks like search, not chat entitlement. |
| `Codex/OpenAI/Momentum360/Astra` | not present | Direct OpenAI Astra launcher exists at `C:\Users\dillo\.codex\tools\Invoke-Gpt6Astra.ps1`. Key has not been saved. |
| `Codex/ZAI/GLM-5.3-Flash` and Coding Plan | not present | Z.AI OmniRoute helpers exist. Keys have not been saved. |

OmniRoute now has dedicated openai-compatible provider nodes so slugs stay intact:

| Prefix | Node | Upstream |
| --- | --- | --- |
| `openrouter-gw` | `openai-compatible-chat-4212900d-eee7-4df6-ad33-bec2ee4f1be0` | `https://openrouter.ai/api/v1` |
| `inferencenet` | `openai-compatible-chat-7c8738b6-0b2c-45a2-a6f9-63c0f4341902` | `https://api.inference.net/v1` |
| `xai` | `openai-compatible-responses-cfbf2a15-65d7-4b57-8478-703f254016a8` | `https://api.x.ai/v1` |
| `tokenrouter` | existing | `https://api.tokenrouter.com/v1` |

The earlier Inference.net connection registered as provider `openai` was deleted so `openai/gpt-6-astra` is no longer stolen by Inference.net. Prefixed OpenRouter canaries now reach OpenRouter (401/404 from the stored copy) instead of `No active credentials for provider: openai`. Direct WinCred OpenRouter canaries remain the generation source of truth and still return 402.

The Telegram private gateway now has exact `/model` aliases for the TikTok set: `astra`, `fable`, `opus`, `muse`, `sol`, `grok`, `gemini`. Router tests: 13/13. Generation on those aliases still needs OpenRouter credits.

Canary scripts (no secrets in output):

- `scripts/Invoke-OpenRouterFrontierCanary.ps1`
- `scripts/Invoke-InferenceNetCanary.ps1`
- `scripts/Invoke-TokenRouterFrontierCanary.ps1`
- `scripts/Invoke-XaiFrontierCanary.ps1`
- `scripts/Invoke-PrefixedGatewayCanary.ps1`

## Do you have seven of the very best models?

**Yes, in Cursor. Not yet as funded API-key routes.**

Cursor on this machine already exposes these seven frontier rows:

1. Claude Fable 5.1
2. Claude Opus 5
3. Muse Spark 1.3
4. GPT-5.6 Sol
5. GPT-5.6 Terra
6. Grok 4.6
7. Gemini 3.8 Flash

GPT-6 Astra is the missing API row. It is listed on OpenRouter and in `Invoke-Gpt6Astra.ps1`, but there is no stored OpenAI key and OpenRouter returns 402.

The API-key stack tonight has **one** verified generation: DeepSeek V4 Pro on Inference.net.

The TikTok set (Astra, Fable, and the rest) unlocks on the API path only after one of these human gates:

1. Finish the existing OpenRouter funding handoff. The Sep 6 note still stands: credits were negative and the $6.21 checkout needed a Google Pay confirmation.
2. Or paste a billed OpenAI project key into `Save-OpenAiApiCredential.ps1`, then run `Invoke-Gpt6Astra.ps1 -Prompt "Reply with the single word PONG" -ReasoningEffort low`.

Seven API-key frontier models are not live until those 402s become 200s.
