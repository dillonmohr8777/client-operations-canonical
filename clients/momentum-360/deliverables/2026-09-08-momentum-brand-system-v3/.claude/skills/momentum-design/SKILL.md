---
name: momentum-design
description: Select and configure existing Momentum ebook layouts, typography, icons, motion and reader interactions from this project. Use for Momentum editorial design sessions and source-to-Claude-Design handoffs.
argument-hint: "[surface or configuration question]"
---

Use the current user request to determine scope. A configuration or inventory request should produce a concise selection and brief, not a new design pass.

This skill belongs to the Momentum v3 deliverable containing this directory. Read `design-integration/ELEMENTS.md` and the relevant entries in `design-integration/elements.json` at that deliverable root. Inspect the actual referenced source before claiming it is current. `PRODUCT.md` owns product truth; `DESIGN.md` and the current live brand surface own visual decisions. Older v2 and collateral files are optional mechanics references, not the current brand authority.

Prioritize ebook typography, chapter composition, reading rhythm, navigation, meaningful motion and useful exercises. Preserve full manuscripts and citations. Use existing icons and motion before proposing generation. Pick a small set for one chapter; extend only within the requested scope. Apply the installed Impeccable workflow when implementation is actually requested.

Native ebook project: https://claude.ai/design/p/735d088e-aa09-41e7-be15-9afdd92a2948
Reusable system: https://claude.ai/design/p/09b3bbc0-a8f7-4acc-88ae-8a47648d75a4
Current brand: https://momentum-ai-launch-batch.netlify.app/brand

The native project is a separate artifact from local HTML. Read `CLAUDE-DESIGN-WORKFLOW.md` for the tested integration state. A registered MCP endpoint or a source upload does not prove automatic synchronization. Avoid the ambiguous `/design` command, which collides with an existing artifact skill in the installed Claude Code session.

Return a compact receipt: selected elements and their source files, the proposed chapter/surface treatment, what is configured versus implemented, and the next concrete review. Keep other clients' assets and data out of this Momentum package.

Request: $ARGUMENTS
