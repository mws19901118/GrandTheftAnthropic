# Codex project instructions — Grand Theft Anthropic

Read `GAME_DESIGN.md`, `ARCHITECTURE.md`, and `ROADMAP.md` before changing the game. This repository is a playable English-language satirical browser game, not a greenfield concept.

## Invariants
- All player-facing game text must be in English. Chinese is fine for developer conversation.
- Keep narrative (`story.js`), property balance (`properties.js`), property mission content (`asset_missions.js`), presentation (`style.css`), and game runtime (`game.js`) separate. Prefer further modularization over adding large new blocks to `game.js`.
- Preserve the playable main campaign, repeatable side gigs, asset purchases/upgrades, timed passive income, asset missions, BUSTED/retry, and post-IPO free roam.
- The tone is AI-industry black comedy, with explicitly fictional wrongdoing. Do not imply invented crimes are historical facts.
- When Jensen Huang and Alice Huang appear in the same scene, place them next to each other; keep their visual grouping together.
- Avoid permanently labeling every building with individual people's names; use company or district labels instead.
- Do not regress driving to point-to-point movement across buildings: collision, road advantage and meaningful route planning are core requirements.
- Do not silently alter story waypoints, timer budgets, or property prices without verifying reachability and economic viability.

## Workflow
1. Inspect the current source and document the intended change.
2. Implement in small, reviewable commits, with an explicit change summary.
3. Run syntax checks (`node --check` on JS files) and exercise the game in a real browser (prefer Playwright), including browser console errors.
4. Smoke-test start, drive/exit, interaction, BUSTED/retry, side gig, property purchase and income, asset missions, IPO/free roam. Report which paths were actually tested.
5. Never claim browser testing if only syntax checks were run. Avoid external dependencies unless necessary; the game should remain locally playable.

## Immediate priority
Implement ROADMAP.md Phase 1: a larger, varied, navigable city with distinct districts, road network, bridges, obstacles, and meaningful car physics. Rebalance timers and police behavior after the map changes. Preserve mission logic and property locations via data-driven coordinates.
