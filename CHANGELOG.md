# v1.8 — Animated NVIDIA Depot

- Replaced the static-only NVIDIA asset renderer with a layered animation overlay.
- Added an independent moving forklift, an opening/closing rolling shutter, rooftop steam, pulsing security beacons, and entrance light spill.
- The warehouse base remains a static illustration; overlays are procedural, not extracted from the source PNG.
- Preserved all mission, collision, save, and economy code.
- Browser gameplay testing is still required.

# v1.3 — First Two Chapters

- Chapter 1: GPU auction negotiation with alternate pricing, cargo integrity, rival pursuit, scaled delivery payout.
- Chapter 2: Three-stage OpenAI document terminal with wrong-answer consequences and timed boardroom escape.
- Narrative encounters separated into story_missions.js.
- Longer mission clocks for expanded map, persistent chapter state in v13 saves.
- Existing property economy, contracts, garage, and remaining campaign preserved.


## v1.4 — Entrances & NVIDIA district polish
- Removed GPS route line and GPS HUD; minimap remains.
- Added explicit glowing entrance/loading pads at every major site and property.
- Mission and property interactions now use those pads, not invisible building centers.
- Added context-sensitive E prompts and out-of-range guidance.
- NVIDIA depot gains loading bays, Blackwell cargo crates, shipping sign, and road markings.
- Kept story, economy, save compatibility, and game logic separate.

## v1.5 — Art Direction Pass
- Added isolated `visuals.js` rendering enhancement layer. No story, economy or collision changes.
- Rebuilt key building silhouettes with facade window patterns, neon trims, rooftop structures and distinct signage.
- Upgraded NVIDIA depot with loading bays, Blackwell signage, roof vents, containers, beacons, parking markings and floodlights.
- Added contextual curbs, road shoulders, palms, street lamps, props, building pads and reflections.
- Upgraded vehicle and Dario silhouettes and basic walking animation.
- Visual detail is procedurally drawn, not hand-painted sprites; it is a substantial art pass, not final AAA quality.


## v1.6 — City Identity Art Pass
- Added independent `environment_art.js` overlay layer.
- Road lane dashes, crosswalks and bridge rail posts.
- Animated water reflections and handcrafted district street props.
- Distinctive rooftop silhouettes for all eight story locations.
- No gameplay, coordinates, story, physics or save format changes.


## v1.7 — NVIDIA Warehouse Asset Integration
- Replaced the NVIDIA procedural tower with a standalone illustrated transparent PNG sprite, loaded asynchronously from `assets/nvidia_warehouse.png`.
- Added `warehouse_art.js`, an art-only override after the existing visual layers.
- Kept the original warehouse drawing as a fallback until the asset loads or if it fails.
- Kept site coordinates, entry pad, collision, mission dialogue, and economic mechanics unchanged.
- Mission objectives should name Jensen only; Alice appears naturally in dialogue.
- Known limitation: single static isometric sprite, no multi-angle animation; art footprint is larger than the existing physics collision, and visual alignment may need tuning in-browser.


## v1.9 — Depot alignment hotfix
- Register animated shutter and forklift to illustration pixel coordinates.
- Move shutter to loading bay #2 on the right-hand facade.
- Restrict forklift motion to the illustrated loading apron, away from the road.
- Keep story, collision, economy and saves unchanged.
- Note: still layered 2D overlays, not skeletal animation or extracted sprites.
