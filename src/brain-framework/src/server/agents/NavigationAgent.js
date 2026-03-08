import { BaseAgent } from './BaseAgent.js';
export class NavigationAgent extends BaseAgent {
  constructor(){ super('navigation'); }
  evaluate(world, blackboard) {
    if (world.players.size > 5) blackboard.propose({ type:'expand_chunk_interest', priority:4, sourceAgent:this.name, cooldownKey:'expand_chunk_interest', cooldownMs:4000 });
  }
}
