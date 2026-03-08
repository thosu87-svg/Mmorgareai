import { TICK_RATE_MS } from '../shared/constants.js';
import { GameWorld } from './world/GameWorld.js';
import { WorldBrain } from './brain/WorldBrain.js';
import { GameServer } from './net/GameServer.js';
const port = Number(process.env.PORT || 3000);
const world = new GameWorld();
const brain = new WorldBrain();
const server = new GameServer(world, brain, port);
server.start();
setInterval(() => {
  world.simulate();
  const actions = brain.tick(world);
  world.applyActions(actions);
  server.broadcastState();
  if (actions.length) console.log(`[BRAIN] ${actions.map(a => a.type).join(', ')}`);
}, TICK_RATE_MS);
