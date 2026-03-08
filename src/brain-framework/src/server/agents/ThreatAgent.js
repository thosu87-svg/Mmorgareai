import { BaseAgent } from './BaseAgent.js';
export class ThreatAgent extends BaseAgent {
  constructor(){ super('threat'); }
  evaluate(world, blackboard) {
    if (world.metrics.threatLevel > 0.85) blackboard.propose({ type:'lock_hot_zone', priority:10, sourceAgent:this.name, cooldownKey:'lock_hot_zone', cooldownMs:3500 });
  }
}
