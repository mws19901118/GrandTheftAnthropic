# Development Roadmap

## Phase 0 — Baseline validation (do first)
- Open `index.html` in browser; verify rendering and no console errors.
- Test mission progression, police BUSTED/retry, purchases, property tick, contracts, IPO/free roam.
- Record reproducible bugs before changing map.

## Phase 1 — Real AI Vice City (top priority)
- Replace uniform grid with 4–6 differentiated districts: Startup Valley, Compute Docks, IPO Financial District, Colossus Outskirts, parks/waterfront.
- Introduce coherent road hierarchy: local streets, arterials, elevated highway, bridge crossings, dead ends and barriers.
- Make road vs off-road tradeoffs meaningful; block buildings/water, provide sensible turning and collision feedback.
- Separate map/location definitions from rendering and story; use stable IDs for mission targets.
- Expand spacing between key sites, rebalance timed deliveries and property contracts, and ensure all destinations reachable.
- Improve minimap for roads and destinations; add recognizable landmarks and navigational signage.
- Test route reachability and timed missions in browser.

## Phase 2 — The CUDA Cartel playable chase
- Create a physical cargo pickup, enemy rival vans, damage/cargo risk, pursuit, and route choice.
- Give distinct success/failure outcomes, retries, and fair time limits.

## Phase 3 — Property empire depth
- Expand each property into 2–3 distinct missions, upgrades and visual progression.
- Rebalance cashflow and production, make acquisition of all properties achievable without grind/deadlock.
- Add Growth Agency and Safety Firm after core loops feel fun.

## Phase 4 — Visual and audio polish
- Higher-fidelity isometric assets, vehicle/person animation, ambient traffic, lighting and optional audio.
- Improve readability, performance and mobile controls.

## Phase 5 — Campaign depth and endings
- More varied mission mechanics and boss encounters; additional ending branches.
- Add save/load and regression tests.
