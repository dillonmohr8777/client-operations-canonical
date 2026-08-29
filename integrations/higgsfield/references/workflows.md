# Higgsfield bundled workflows

Call `get_workflow_instructions` with no argument first. Then load exactly one matching workflow. Do not generate from a prompt alone.

| Workflow | Use when |
|---|---|
| `ad-multiplier` | Multiple edited versions of one 4-30 second source ad. |
| `brand-asset-creation` | Logos, kits, mockups, decks, merchandise, or branded stills. |
| `character-sheet` | Multi-view character or model sheets. |
| `faceless-video` | Finished narrator-led faceless channel videos. |
| `narrator` | Locked-voice takes or consented photo-in-video narration. |
| `product-photoshoot` | Packshots, lifestyle, hero, carousel, or static ad packs. |
| `subtitles` | Captions must be burned into video pixels. |
| `thumbnail-generation` | YouTube or Instagram covers. |
| `ugc-product-video` | Product-only UGC, no talking head. |
| `ugc-review-video` | Talking-head creator review. Default UGC ask. |
| `ugc-try-on-video` | Wearable fit-check UGC. |
| `ugc-tutorial-video` | Step-by-step how-to UGC. |
| `ugc-unboxing-video` | Unboxing or first-reaction UGC. |
| `ugc-website-video` | Creator talks while a real site or store page is on screen. |
| `video-editing` | Assemble clips in a file-backed higgsedit project. |
| `website-builder-flow` | Required before any Higgsfield website, app, or game tool. |

## Duration trap that broke the ChatGPT plugin

A single Higgsfield video generation is typically 15 seconds or less. A 16-second request is not "one Seedance job." Load `faceless-video`, a UGC workflow, or `video-editing`, generate scene clips, and assemble a finished cut.

## Official CLI companion skills

`npx skills add higgsfield-ai/skills` installs a separate coding-agent pack. Those skills still obey Marketing Chief routing, logo-lock, and spend gates.

| Official skill | Typical ask |
|---|---|
| `higgsfield-generate` | Any image, video, audio, Marketing Studio, or virality score |
| `higgsfield-soul-id` | Train a face-faithful Soul character |
| `higgsfield-product-photoshoot` | Brand product stills |
| `higgsfield-brandkit` | Visual identity and brandbook |
| `higgsfield-marketplace-cards` | Marketplace and A+ cards |
| `higgsfield-websites` | Higgsfield-hosted website CLI |
| `higgsfield-video-explainer` | Narrated explainer |
| `higgsfield-youtube-thumbnail` | Thumbnails and vertical covers |
| `higgsfield-game-generation` | Browser games and game assets |
