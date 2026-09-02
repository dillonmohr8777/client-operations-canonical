# Claude creative stack status

Verified on 2026-09-02 from Claude Code 2.1.233.

| Capability | Current state | v0.1 use |
| --- | --- | --- |
| Dillon Creative Factory | Connected | Twelve client-safe tools in every Claude project |
| Hugging Face | Connected | Space discovery plus the factory's no-Higgsfield free-tool search |
| Canva | Registered, authentication required | Design-draft manifests until Dillon completes OAuth |
| Figma | Registered, authentication required | Design-draft manifests until Dillon completes OAuth |
| Cloudflare Browser | Registered, authentication required | Local hidden Chrome visual QA works now; remote browser waits for OAuth |
| Notion | Registered, authentication required | No workspace reads until the exact workspace is authenticated |
| Vercel | Registered, authentication required | Local preview builds only; remote preview adapter waits for OAuth |
| Cloudflare Agents | Connected | Documentation/agent capability only; no public factory deployment was created |

Higgsfield is intentionally excluded from free-tool discovery and is not represented as part of the free stack.

Authentication is the remaining gate for Canva, Figma, Cloudflare Browser, Notion, and Vercel. Those flows can require interactive account selection or consent, so the factory reports `adapter-not-connected` instead of claiming work happened.
