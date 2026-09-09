# Claude Design opportunities for Momentum

Research checked September 8, 2026. Strategy only; none of the proposed experiments below has been built or published by this research pass.

## Recommendation

Start with a reusable Momentum motion editor, then an interactive business simulator inside one ebook, then a branching sales presentation. These extend the assets and manuscripts already in hand and create reusable capabilities. A larger collection of decorative effects is a lower priority.

Current baseline inspected in this session: five complete native ebooks, a separate chapter motion prototype, an imported Momentum design system, and six local SVG motion roles. The report collection has individual Netlify URLs. Its current figures are dated snapshots, not continuously refreshed account feeds. Local code and native Claude Design remain separately maintained copies; automatic synchronization was not verified in the earlier hands-on test.

## What the research actually established

- Anthropic's current product documentation supports interactive prototypes, design-system imports, direct editing, adjustment controls, and HTML export. It describes Code handoff, but that does not establish that our local bridge works. [Product documentation](https://claude.com/product/design)
- Claude Design's designer describes making a custom editor to produce the product's intro animation, adjustable motion physics, and visual color controls. He also identifies interactive documents as an opportunity. [Nate Parrott's first-person account, July 24](https://claude.com/blog/how-the-product-designer-who-built-claude-design-uses-it-to-explore-ideas-before-building-them)
- In his interview, Parrott describes tuning timing and cursor position manually through generated controls, and changing assumptions inside a presentation. That is evidence for purpose-built editing interfaces and simulations, not a promise that arbitrary output will be correct. [First-person interview transcript](https://pod.wave.co/podcast/dive-club--556f9cbd-ac35-4833-98cc-6d19a1ee9091/nate-parrott-how-a-side-project-became-claude-design)
- Official guidance supports complete interactive flows, alternative layouts, approval-interface prototypes and codebase context. Production behavior still needs implementation and verification. [Prototype workflow](https://claude.com/resources/tutorials/using-claude-design-for-prototypes-and-ux)
- The documented direct-edit workflow can reduce repeated generation. Start with a small complete layout and add interactions incrementally. [Help Center](https://support.claude.com/en/articles/14604416-get-started-with-claude-design)

## Ten concrete opportunities

These are proposed Momentum applications, not claims that Claude Design has a dedicated built-in feature for each one. Effort is relative to the existing project, not a time or cost quote.

| Priority | Concept | What the person experiences | First bounded experiment | Effort / dependency |
|---|---|---|---|---|
| 1 | Momentum motion editor | Sliders control logo hop, title timing, icon movement and chapter transitions. Side-by-side playback makes decisions visual. | One existing logo, one heading and one SVG; three saved motion presets. | Low to medium; existing assets. |
| 2 | Business simulator inside an ebook | The reader changes assumptions and sees how a workflow changes. | Missed-call volume, answer rate and booking rate drive a simple animated funnel. | Medium; reviewed formulas and clearly hypothetical inputs. |
| 3 | Branching sales presentation | A prospect selects their industry and problem; the presentation follows the relevant path. | Three branches using only approved Momentum services and evidence. | Medium; approved copy and explicit navigation. |
| 4 | Annotated before-and-after case study | A slider reveals a real interface change; hotspots explain what was fixed and why. | One consented example, two exact screenshots, three annotations. | Low to medium; verified comparable evidence. |
| 5 | Interactive service map | Clicking a service reveals its inputs, outputs, human reviewer and next step. | One workflow with five nodes and a manually replayable example. | Medium; verified service boundaries. |
| 6 | Campaign composition editor | A reusable composition accepts approved copy and artwork; the user previews different aspect ratios and text lengths. | One existing campaign rendered as square, portrait and landscape previews. | Medium; final video or image export needs its own verified pipeline. |
| 7 | Guided training scenario | Staff choose a response to a simulated enquiry and see the consequences and explanation. | A short three-decision lead-handoff exercise with no real personal data. | Medium; scenario and answer-key review. |
| 8 | Interactive report explanation | Selecting a metric reveals its definition, date window, source and related next action. | One client, five verified metrics, five concise update bullets. | Medium; use a snapshot first. Live refresh requires actual integrations. |
| 9 | Spatial service demonstration | A visitor rotates a small object or room and selects meaningful hotspots. | One licensed existing 3D asset, three hotspots and a static mobile fallback. | Higher; asset loading, performance and native-preview compatibility must be tested. |
| 10 | Editorial layout comparison tool | The same manuscript appears in several chapter treatments, with controls for text measure, spacing and callouts. | One chapter in three visibly distinct directions using the current brand tokens. | Low to medium; preserve manuscript and citation structure. |

## The three strongest experiments

### 1. Motion editor

The useful leap is an editor for our exact assets. Controls would include hop height, cycle length, entrance delay, easing, replay and pause. Presets would separate reading, presentation and promotional contexts. Body copy would remain stable. Approved settings would become reusable values in the design system rather than another vague instruction to make something move more.

Acceptance: the same control produces the same visible result on replay; settings can be retained; the logo is never stretched; reduced-motion mode reveals a complete static composition; mobile controls remain usable.

### 2. Business simulator

The phone-to-booking ebook is the strongest first candidate. A reader could adjust a clearly labeled example's missed calls and response rate and watch the contact path change. This teaches the relationship rather than merely animating an icon. The experiment would not estimate real revenue or imply an observed lift. Inputs, formulas and assumptions would remain visible.

Acceptance: manually checked calculation examples match the display; unavailable facts are not manufactured; keyboard controls work; the explanation is understandable with motion disabled.

### 3. Branching presentation

A salesperson could begin with the prospect's problem and open only the relevant service explanation, evidence and next step. The result would work for a live call and as a browsable follow-up. It would use approved claims, with a persistent way back to the overview. A first prototype would have three short paths and no CRM write or email automation.

Acceptance: every path has a clear ending; no dead controls; claim sources remain visible; the presentation works without narration; no unapproved pricing or promises.

## Motion technology choices

- Existing CSS and SVG are enough for simple hops, line drawing and short responses. Reuse the current code before adding libraries.
- Motion supports HTML/SVG animation, path drawing and coordinated sequences. It is a suitable candidate for an editor with replayable timelines. [Motion API](https://motion.dev/docs/animate)
- GSAP ScrollTrigger can connect animation progress to scrolling and coordinate timeline stages. Reserve it for a genuinely complex explanatory scene. [GSAP documentation](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- Rive state machines can support responsive character behavior. Momo would need an authored Rive asset; the MP4 references do not become a rig automatically. [Rive playback documentation](https://rive.app/docs/runtimes/web/state-machines)
- Browser view transitions are another option for page changes, with a normal-navigation fallback. [MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)

An implementation should choose one animation approach for each need and test it in the actual native preview and exported page. Loading a library is not proof of compatibility.

## X research and evidence limits

I searched X/Twitter-specific queries and broader web indexes. Directly indexed example: Rayyan Khan reported producing a course deck from design screenshots and course content. This is a useful reference for source-to-training reuse, but its claimed speed is self-reported and I did not independently inspect the generated deck or video. [Original X post](https://x.com/rayyanfkhan/status/2045582512202867009)

Many other results were X trending summaries or mirrors rather than inspectable original demonstrations. I excluded those as proof of capability. The strongest sources found were the product designer's first-person account, interview transcript and current official documentation. This was a targeted research pass, not an exhaustive archive of X or a visual review of every social video.

Community reports of 3D scenes and sophisticated video compositions were treated as leads, not verified capabilities. A small proof is needed before committing to either as a production workflow.

## Suggested order and stop conditions

1. Finish and inspect the already resumed single-chapter prototype.
2. Build one motion editor around the assets it uses, only after choosing that experiment.
3. Add one hypothetical simulator, preserving the underlying chapter.
4. Reuse the approved interaction in a short branching presentation.
5. Expand only after a desktop/mobile review demonstrates that the interaction improves understanding.

Keep strategy distinct from execution. This research does not authorize new publishing, external messages, paid services or wholesale changes to the five ebooks. The existing request for shorter report updates remains five or six factual bullets with the individual client Netlify URL, without a default PDF attachment.
