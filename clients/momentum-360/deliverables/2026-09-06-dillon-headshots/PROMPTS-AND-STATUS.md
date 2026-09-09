# Dillon headshots

Status: The user accepted the face preservation but rejected the merchandise treatment. A clean, unbranded alternative is now under `clean-portraits/`, with `Dillon-10-Clean-Portraits.zip` and `CLEAN-PREVIEW.jpg`. The user has been asked whether they want unbranded professional clothing or more convincing branded apparel; this is a review alternative, not an assertion that the new direction has been accepted. Previous embroidered files remain under `final/` for history. Early generated portraits in `drafts/` are superseded.

Photo 1 is the sole approved face authority. The user authorized photo compositing after the first generated faces drifted, then requested smaller logos with natural embroidered placement. The final method preserves 265298 source head/face pixels exactly in every lossless PNG, with a narrow blend at the external silhouette. No face retouching, recoloring, whitening, sharpening or resampling was applied inside the protected mask. See `VERIFICATION.json` and `qa/protected-face-mask.png`.

Final method: built-in image generation for clothing/background plates, then deterministic Python/OpenCV/Pillow compositing with the original face. The exact existing logo artwork supplies the silhouette; fine satin stitch texture, edge shading, local garment lighting and a small contact shadow create the embroidery treatment. See `prepare_composites.py`, `composite_headshots.py`, and `package_headshots.py` for the reproducible final processing. The face check is repeated after logo application and PNG saving.

Method attempted: built-in image generation. Original face reference: C:\Users\dillo\.codex\codex-remote-attachments\01a07806-fcb7-7a71-8e92-4c4d21e89acd\F209BC68-B1BD-4570-A134-570C87993959\1-Photo-1.jpg
Logo reference: C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-08-03-need-momentum-homepage-concepts\public\assets\brand\need-momentum-logo.png
Logo provenance: existing Need Momentum homepage concept ASSET-SOURCES.md; original blue Momentum wordmark extracted from public site.

## Prompt set

Use case: identity-preserve. Create ONE photorealistic premium professional headshot, vertical 4:5 portrait, high resolution. Input 1 is the absolute facial identity and expression reference. Preserve this exact man's face as closely as possible: identical facial proportions, blue-gray eyes, eyebrows, nose, natural tooth shape and warm smile, curly dark brown hair, hairline, ears, jawline and natural skin texture. Keep the head nearly frontal with the same gentle tilt and same smile as input 1; change primarily clothing, light and environment. No face redesign, beautification, changed age, plastic skin or extra facial hair. Input 2 is the authentic Need Momentum blue logo artwork: circular handwritten m symbol and MOMENTUM wordmark. Faithfully use this exact symbol/lettering/color with no invented extra symbols, no 360 and no extra slogans. Branding must be clearly legible but understated, naturally integrated into the specified scene. Tight head-and-shoulders to upper chest crop, eyes tack sharp, flattering 85mm portrait perspective, real skin pores, premium editorial color, plausible natural light. No hands, no collage, no frames, no UI, no watermark. 

### 01-classic-studio
Closest to source: black premium crewneck T-shirt, soft light-gray seamless studio background. Put a small precise blue Momentum logo on left chest, fully within frame. Beautiful soft frontal window-like studio light. Relaxed, friendly, very natural.

### 02-navy-blazer
Tailored dark navy blazer over crisp white open-collar shirt, softly blurred warm brick city courtyard. Small authentic blue Momentum logo embroidered on the white shirt chest, visible just inside the blazer opening. Golden late-afternoon edge light, face neutrally and softly lit. Sophisticated approachable professional.

### 03-white-polo
Premium white cotton polo with exact blue Momentum logo embroidered subtly on left chest. Airy sunlit office, soft neutral window and green plant bokeh. Fresh natural daylight, inviting expression matching reference.

### 04-blue-studio
Black tailored blazer over a clean black crewneck, pale gray studio backdrop with a gentle wash of the logo's blue at one edge. Place exact blue Momentum logo as small embroidered chest branding on crewneck visible below neckline. Refined editorial studio lighting with luminous natural face.

### 05-creative-loft
Premium charcoal overshirt worn open over white T-shirt, exact blue Momentum logo neatly printed on white tee upper chest. Warm creative loft with softly defocused brick, wood and daylight. Face same pose and warm smile as reference.

### 06-black-polo
Fitted black textured polo, small exact blue Momentum logo at left chest. Soft slate-gray office backdrop, clean diffused studio lighting, slight warm rim. Confident approachable business portrait, no harsh shadows.

### 07-rooftop
Cream lightweight unstructured blazer over navy crewneck with subtle authentic blue Momentum logo on upper chest. A softly blurred city rooftop at golden hour; distant architecture only, no fake prominent landmarks. Face lit with soft neutral fill, warm hair light, preserve reference smile.

### 08-brand-office
Crisp white open-collar Oxford shirt. Contemporary minimal office wall with authentic blue Momentum logo mounted behind and beside the subject, clear and undistorted, well spaced from his head. Subject face dominates; logo secondary and fully visible. Warm daylight, premium corporate editorial headshot.

### 09-casual-hoodie
Premium light heather-gray hoodie with small precise blue Momentum logo on left chest. Clean off-white studio background, soft flattering wrap light. Modern relaxed agency headshot, hood down, no cords across logo, identical face and smile.

### 10-signature-blue
Deep navy smart-casual quarter-zip over white crewneck, small exact blue Momentum logo embroidered on left chest. Bright warm-gray studio with subtle cool blue shadow gradient. Premium clean headshot with same expression and face pose as source, polished natural color.

## Minimal correction test

EDIT THE FIRST IMAGE, do not generate a new portrait. Keep the entire original photo composition and dimensions. The man's entire head, face, hair, ears and neck are protected and must remain unchanged from image 1. Preserve original facial pixels/appearance: exact eyes, eyelids, eye size, natural teeth, lip shape, smile, cheeks, jaw, slight stubble, skin color, original soft photographic texture and original lighting. Do not beautify, sharpen, smooth, whiten teeth, enlarge eyes, intensify stubble, change proportions, relight or reinterpret his face. Make ONLY ONE small change: add the exact blue Momentum logo from image 2 to the left chest of his existing black T-shirt, scaled small as a realistic printed brand mark. Preserve exact logo drawing, circular filled-blue m emblem, wordmark shape and spelling. Leave the rest of original photo, including gray background, untouched. The outcome must be the original supplied photograph with a logo on the shirt, not a newly imagined lookalike.
