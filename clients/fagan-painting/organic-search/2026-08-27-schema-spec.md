# Fagan Painting schema and FAQ repair spec

Status: local spec. Phil publishes. No live mutation.

## Homepage JSON-LD

GSC currently detects Product snippets on `https://faganpainting.com/`. That is the wrong entity for a local painting contractor.

Replace product markup with one PaintingContractor / LocalBusiness block using only live-verified facts:

- name: Fagan Painting LLC
- url: https://faganpainting.com/
- telephone: +1-412-680-0102
- email: Faganpainting@gmail.com
- areaServed: Pittsburgh, PA (do not invent a street address; none was confirmed this tick)
- sameAs: https://www.facebook.com/faganhousepaintingservice
- priceRange: omit until a verified range exists
- warranty: two-year warranty on all work (live homepage copy, 2026-08-27)

Keep Breadcrumbs. Review snippets may remain if they match visible reviews on `/reviews/`.

## FAQ page repair

Live defect on `https://faganpainting.com/faqs/` (modified 2026-08-05):

Question: How do I choose the right paint colors and sheens?
Current answer: furniture moving / drop cloths (duplicate of the next question).
Replacement answer already used under Residential Painting FAQs: we help guide color palettes and sheens that match interior or exterior decor, lighting, and lifestyle.

After the visible text matches, add FAQPage JSON-LD for the questions that are actually on the page. Do not schema questions that are not visible.

## First 200-word answer blocks (interior page)

Use only live FAQ facts. Flag anything else for James.

Direct answer: Interior painting timelines depend on rooms and prep. A single room can often be finished in a day. A full interior typically takes 2 to 5 days. Prep includes protecting floors and furniture, filling nail holes, repairing minor drywall damage, caulking, and sanding. The crew can move large furniture to the center of the room. Small items and wall hangings should be removed first. The live FAQ states the team is licensed and insured.

Do not add pricing or a service-radius number until James confirms. The homepage already states a two-year warranty; keep that wording if schema includes it.
