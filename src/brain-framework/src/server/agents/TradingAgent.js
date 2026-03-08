import { BaseAgent } from './BaseAgent.js';
export class TradingAgent extends BaseAgent {
  constructor(){ super('trading'); }
  evaluate(world, blackboard) {
    if (world.metrics.tradeFlow < 0.35) blackboard.propose({ type:'open_market_bonus', priority:4, sourceAgent:this.name, cooldownKey:'open_market_bonus', cooldownMs:7000 });
  }
}
