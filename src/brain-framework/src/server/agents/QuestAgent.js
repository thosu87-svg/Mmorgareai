import { BaseAgent } from './BaseAgent.js';
export class QuestAgent extends BaseAgent {
  constructor(){ super('quest'); }
  evaluate(world, blackboard) {
    if (world.metrics.activeQuestHooks < 4) blackboard.propose({ type:'seed_quest_hooks', priority:5, sourceAgent:this.name, cooldownKey:'seed_quest_hooks', cooldownMs:6000 });
  }
}
