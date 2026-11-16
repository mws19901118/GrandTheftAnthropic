# Current Architecture (v0.9 baseline)

## Entry and runtime
- `index.html`: loads CSS and JavaScript files; run by opening locally in a modern browser.
- `style.css`: HUD, dialogs, modals, start screen.
- `story.js`: `missions` array (10 campaign stages) and narrative reward/effect configuration.
- `properties.js`: `propertyDefs` array, prices, upgrades, resource yields and world coordinates.
- `asset_missions.js`: `assetMissions` object, timed waypoint sequences and rewards.
- `game.js`: canvas drawing, world layout, collision, driving, police, economy tick, main/asset mission execution, controls, HUD.

## Current map assumptions
- `WORLD={w:2550,h:1860}`; roads derive from `RX` and `RY` axis-aligned coordinate arrays.
- `sites` coordinates and district rendering live in `game.js`, while properties and side-mission waypoints live in data files.
- `roadSurface(x,y)` determines road speed advantage; building collision uses runtime geometry.
- The renderer is procedural 2.5D Canvas; no imported asset pipeline.

## Important technical debt
- `game.js` (~27KB) still combines world data, physics, UI and rendering. Extract `world.js` (map data), `renderer.js` (Canvas), `physics.js` (movement/collision), `economy.js` and `missions.js` as work warrants.
- A map redesign requires coordinated waypoint updates across `game.js`, `properties.js` and `asset_missions.js`; introduce named locations or location IDs to avoid hardcoded duplicated coordinates.
- Economy uses time-based production but side gigs are instantaneous. Ensure sufficient cash and time for property acquisition, and avoid infinite trivial payouts if balance matters.
- The game has not been verified with an end-to-end browser test in this handoff; establish baseline behavior first.

## Controls
WASD/arrows move; E interact/vehicle/property/waypoint; Space boost; B property portfolio; G freelance side gig; R restart campaign.
