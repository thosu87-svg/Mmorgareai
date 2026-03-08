import { BaseAgent } from './BaseAgent.js';
export class EventReactionAgent extends BaseAgent {
  constructor(){ super('event-reaction'); }
  evaluate(world, blackboard) {
    if (world.metrics.weatherPhase === 'storm') blackboard.propose({ type:'boost_storm_loot', priority:2, sourceAgent:this.name, cooldownKey:'boost_storm_loot', cooldownMs:5000 });
  }
}
