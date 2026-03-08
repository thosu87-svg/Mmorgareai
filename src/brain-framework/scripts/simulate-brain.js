import { GameWorld } from '../src/server/world/GameWorld.js';
import { WorldBrain } from '../src/server/brain/WorldBrain.js';
const world = new GameWorld();
const brain = new WorldBrain();
world.upsertPlayer('p1', { x: 10, z: 5 });
world.upsertPlayer('p2', { x: 15, z: 6 });
let ticks = 0;
const timer = setInterval(() => {
  ticks++;
  world.simulate();
  const actions = brain.tick(world);
  world.applyActions(actions);
  console.log(`tick=${ticks}`, actions.map(a=>a.type));
  if (ticks >= 15) { clearInterval(timer); console.log('done'); }
}, 400);
