import { BaseAgent } from './BaseAgent.js';
export class EconomyAgent extends BaseAgent {
  constructor(){ super('economy'); }
  evaluate(world, blackboard) {
    if (world.metrics.marketInflation > 0.7) blackboard.propose({ type:'spawn_traders', priority:8, sourceAgent:this.name, cooldownKey:'spawn_traders', cooldownMs:4500 });
  }
}
