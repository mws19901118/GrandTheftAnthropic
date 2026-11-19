# Architecture

Grand Theft Anthropic is a dependency-free browser game. JavaScript files use **classic scripts** (not ES modules), sharing top-level game state and functions. The order in `index.html` is intentional.

## Runtime modules

| File | Responsibility |
| --- | --- |
| `index.html`, `style.css` | Document structure, UI styling, script load order |
| `map.js` | City geometry, site locations and roads |
| `story.js` | Campaign stages, rewards and objectives |
| `properties.js`, `asset_missions.js` | Property and side-mission data |
| `story_missions.js` | Story-specific interactions and timed transitions |
| `game.js` | Shared runtime state, input, physics, police, world update, HUD and rendering |
| `game_persistence.js` | Versioned localStorage saves, validation and legacy migration |
| `game_contracts.js` | Courier contracts, checkpoints, payouts and cooldowns |
| `game_assets.js` | Garage, property purchases, production and asset missions |
| `hq_defense.js` | HQ firewall minigame |
| `mission_arcade.js`, `puzzle_missions.js` | Interactive chapter minigames |
| `claude_briefings.js` | HQ terminal briefings and mission gating |
| `cinematic_dialogue.js` | Cutscenes and dialogue presentation |
| `visuals.js` and remaining `*_art.js` / `*_sprites.js` files | Visuals, world decoration and ambient rendering |

## Script order and coupling

The data files load first, then `game.js` declares shared state. Persistence, contracts and assets load **immediately after** `game.js` and before other systems. Their function declarations are called by the game loop only after page scripts have loaded.

Do not add `type="module"`, `defer`, or independently reorder scripts without migrating shared globals. All game-facing strings remain English.

## State and recovery

- Saves use `gta_anthropic_v14_save`; legacy v12/v13 saves are readable.
- Courier and asset runs store their checkpoint index and remaining active-play time.
- Timed story stages store a remaining duration instead of a raw `performance.now()` deadline.
- World simulation pauses while modal minigames are open.
- The NVIDIA loading animation is intentionally non-saveable until dispatch completes.

## Validation

Run `node tests/static-checks.mjs` from the repository root. This checks syntax, expected script order and key runtime boundaries. It is **not** a replacement for browser smoke tests of movement, saving, retrying and campaign completion.

## Technical debt

`game.js` still owns physics, police, world update and rendering. Further extraction should be incremental and backed by browser tests. `claude_briefings.js` wraps global interactions and progression; changing those hooks requires care. Prefer stable state interfaces over additional wrappers.

## Controls

WASD/arrows move; E interacts/enters vehicle/activates checkpoints; Space boosts; B opens portfolio; G starts courier contracts; U opens garage; P saves; L loads; Shift+R requests restart confirmation.
