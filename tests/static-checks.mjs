// Run: node tests/static-checks.mjs
// Dependency-free structural checks; browser gameplay still needs manual E2E testing.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { Script } from 'node:vm';

const root = new URL('../', import.meta.url);
const read = (name) => readFileSync(new URL(name, root), 'utf8');
const html = read('index.html');
const scripts = [...html.matchAll(/<script\s+src="([^"]+)"\s*><\/script>/g)].map(m => m[1].split('?')[0]);
const requiredOrder = [
  'map.js','story.js','properties.js','asset_missions.js','story_missions.js',
  'game.js','game_persistence.js','game_contracts.js','game_assets.js',
  'hq_defense.js','mission_arcade.js','puzzle_missions.js',
  'claude_briefings.js','cinematic_dialogue.js'
];
for (const name of requiredOrder) assert(scripts.includes(name), `Missing script: ${name}`);
for (let i=1;i<requiredOrder.length;i++) {
  assert(scripts.indexOf(requiredOrder[i-1]) < scripts.indexOf(requiredOrder[i]),
    `Incorrect script order: ${requiredOrder[i-1]} before ${requiredOrder[i]}`);
}
for (const name of scripts) new Script(read(name), { filename: name });
for (const name of readdirSync(root).filter(x => x.endsWith('.js'))) {
  assert(scripts.includes(name), `Orphaned root JavaScript file: ${name}`);
}
const engine = read('game.js');
assert(engine.includes('loadButton.onclick=()=>loadGame()'), 'Load callback must be deferred until persistence script initializes');
const persistence = read('game_persistence.js');
const contracts = read('game_contracts.js');
const assets = read('game_assets.js');
for (const fn of ['saveGame','loadGame']) {
  assert(persistence.includes(`function ${fn}(`), `Missing persistence function ${fn}`);
  assert(!engine.includes(`function ${fn}(`), `Duplicate function ${fn} in engine`);
}
for (const fn of ['gigStep','gigTarget','sideGig','finishGig','failGig']) {
  assert(contracts.includes(`function ${fn}(`), `Missing contract function ${fn}`);
  assert(!engine.includes(`function ${fn}(`), `Duplicate function ${fn} in engine`);
}
for (const fn of ['propertyMenu','propertyIncome','assetInteract','startAssetMission']) {
  assert(assets.includes(`function ${fn}(`), `Missing asset function ${fn}`);
  assert(!engine.includes(`function ${fn}(`), `Duplicate function ${fn} in engine`);
}
assert(persistence.includes('version:14'), 'Save schema changed unexpectedly');
assert(persistence.includes('deadlineRemaining'), 'Missing relative story deadline');
assert(engine.includes('if(running&&!locked)'), 'Missing simulation pause guard');
console.log(`OK: ${scripts.length} scripts parse; dependency order, module boundaries and save schema verified.`);
