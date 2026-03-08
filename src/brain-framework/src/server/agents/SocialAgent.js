import { BaseAgent } from './BaseAgent.js';
export class SocialAgent extends BaseAgent {
  constructor(){ super('social'); }
  evaluate(world, blackboard) {
    if (world.metrics.lonelyPlayers > 0) blackboard.propose({ type:'start_social_event', priority:3, sourceAgent:this.name, cooldownKey:'start_social_event', cooldownMs:9000 });
  }
}
