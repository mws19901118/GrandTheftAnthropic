# Cinematic cutscene art (asset pack v1)

The game now supports independently layered backgrounds and character portraits. These assets are produced as a downloadable ZIP in the associated ChatGPT conversation. The binary assets must be placed in this folder before they will appear on GitHub Pages.

Expected paths:

- `assets/cutscenes/scenes/nvidia_depot.webp` — 1280×900 NVIDIA depot background, no baked dialogue
- `assets/cutscenes/scenes/openai_rooftop.webp` — 1280×720 rooftop / boardroom
- `assets/cutscenes/scenes/deepseek_casino.webp` — 1280×720 casino / server hall
- `assets/cutscenes/characters/dario.png` — transparent portrait, glasses and suit
- `assets/cutscenes/characters/jensen.png` — transparent portrait, black leather jacket
- `assets/cutscenes/characters/alice.png` — transparent portrait, trench coat

The UI uses the existing illustrated SVG character when an individual PNG is not available. The existing building illustration remains behind scene backgrounds as a CSS fallback. Do not replace or alter `building_images.js` or NVIDIA's `warehouse_art.js`.

Characters are composited over the backgrounds and highlighted by the speaker. The dialogue text and choices are rendered by the game and are never part of the background image.
