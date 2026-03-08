import { BaseAgent } from './BaseAgent.js';
export class ResourceAgent extends BaseAgent {
  constructor(){ super('resource'); }
  evaluate(world, blackboard) {
    if (world.metrics.resourceScarcity > 0.6) blackboard.propose({ type:'boost_resource_nodes', priority:7, sourceAgent:this.name, cooldownKey:'boost_resource_nodes', cooldownMs:5000 });
  }
}
