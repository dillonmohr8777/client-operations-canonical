# Repaired native base verification

The project archive was downloaded through the existing Launch project UI into `repaired-launch-base.zip`. It is separate from the immutable historical 23:21 source and accepted review packages.

The local `qa-receipt.json` passes ten deterministic/aspect cases at full 1920×1080 and 1080×1920. It checks eight frames per case, repeat-capture hashes, dimensions, dirty transparent pixels, and runtime errors. Both `qa/16x9-contact.png` and `qa/9x16-contact.png` were visually inspected.

Atomic Assembly's new end cards are readable in both aspects, with the portrait kicker split into two lines. The repaired runtime includes font-metric gating before texture painting and playback-duration readout synchronization. The live Atomic UI showed 18 seconds on fresh load.

The prior five-film native repair is partial: Break the Frame still clips the first closing line and the returned WHAT IS in its portrait layout. This is an existing-base issue, not a completed derivative. It is reported to the main task for scope coordination. No local native source was changed.

The Atomic Assembly base itself is suitable for the separate Chain Reaction refinement. Preserve existing files and create new derivative-specific files only.
