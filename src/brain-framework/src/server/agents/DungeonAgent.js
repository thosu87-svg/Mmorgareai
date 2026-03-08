import { BaseAgent } from './BaseAgent.js';
export class DungeonAgent extends BaseAgent {
  constructor(){ super('dungeon'); }
  evaluate(world, blackboard) {
    if (world.metrics.playerEngagement > 0.55) blackboard.propose({ type:'open_micro_dungeon', priority:4, sourceAgent:this.name, cooldownKey:'open_micro_dungeon', cooldownMs:12000 });
  }
}
