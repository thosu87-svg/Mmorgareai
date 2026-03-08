import { BaseAgent } from './BaseAgent.js';
export class CombatAgent extends BaseAgent {
  constructor(){ super('combat'); }
  evaluate(world, blackboard) {
    if (world.metrics.threatLevel > 0.7) blackboard.propose({ type:'spawn_guards', priority:9, sourceAgent:this.name, cooldownKey:'spawn_guards', cooldownMs:5000 });
  }
}
