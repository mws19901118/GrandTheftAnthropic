# Grand Theft Anthropic v1.0 — AI Vice City

Open `index.html` in a modern desktop browser. No build step or internet needed.

## World upgrade
- `map.js` owns world dimensions, named districts, site IDs, roads, and impassable waterfront.
- Finite arterial roads, local roads, access streets and a bridge replace the endless grid.
- Main destinations are farther apart; mission timers and property checkpoint timers were increased.
- Roads offer higher driving speed; water and buildings block travel.
- Minimap shows the actual road segments and district areas.

## Known limitations
- This is a first-phase geography redesign, not a finished GTA-scale world.
- Driving still uses directional input rather than acceleration/steering, and traffic AI remains basic.
- A browser-based full playthrough has not been performed.
- Buildings have geometric collisions but generated decorative low-rise structures do not.

## Files
`map.js` geography; `story.js` campaign; `properties.js` economy; `asset_missions.js` side missions; `game.js` mechanics and rendering; `style.css` presentation.


## v1.1 controls
- WASD/arrows: move or drive toward direction; vehicles have inertia and brake gradually.
- Space: boost; E: interact; B: assets; G: freelance contract; P: save; L: load.
- Purchase Blackwell Warehouse and launch THE CUDA CARTEL for the rival van chase.
- A local browser save is automatically created approximately every 14 seconds of active play.

### v1.2 controls
G: accept a playable freelance delivery; travel to the green destination and press E. U: buy a vehicle turbo upgrade. Select difficulty on the title screen. Route overlay displays the suggested road route. Saves use browser localStorage; v1.1 saves can be loaded in the same browser origin.


## v1.3 first two chapters
At NVIDIA press E and choose a GPU deal. Drive the shipment to Anthropic HQ without losing cargo; rival vans pursue. At OpenAI press E to solve three security terminals; wrong answers cost money and raise wanted level. Escape to Anthropic HQ. Save with P and load with L.


### v1.4 interaction changes
Use the glowing ring on the SOUTH (street-facing) side of each building. Walk or drive into the ring and press E. Yellow rings mark active objectives; teal rings mark assets. The minimap shows destination locations. GPS route lines have been removed.


### v1.5 visual architecture
`visuals.js` is loaded after `game.js` and replaces only drawing functions. To revert to v1.4 appearance, remove its script tag in `index.html`. Story, map coordinates, physics, saves and gameplay are unchanged.


### v1.6 visual layer
`environment_art.js` extends the procedural renderer after `visuals.js` and is deliberately presentation-only. It can be disabled by removing its script tag.


### NVIDIA warehouse illustration (v1.7)
`assets/nvidia_warehouse.png` is the actual game sprite, rendered by `warehouse_art.js` after other procedural art layers. It is not a full-screen mockup. The original tower renderer remains as a loading fallback. The loading-bay art is decorative; existing entrance/collision coordinates are unchanged.
