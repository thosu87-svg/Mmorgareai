export class Orchestrator {
  constructor(agents, config = {}) {
    this.agents = agents;
    this.maxActionsPerTick = config.maxActionsPerTick ?? 20;
    this.cooldowns = new Map();
  }
  process(world, blackboard) {
    blackboard.reset();
    for (const agent of this.agents) agent.evaluate(world, blackboard);
    const now = Date.now();
    const sorted = [...blackboard.proposals].sort((a,b)=>(b.priority??0)-(a.priority??0));
    const finalActions = [];
    const dedupe = new Set();
    for (const action of sorted) {
      if (finalActions.length >= this.maxActionsPerTick) break;
      const key = `${action.type}:${action.targetId ?? "global"}`;
      if (dedupe.has(key)) continue;
      if (action.cooldownKey) {
        const next = this.cooldowns.get(action.cooldownKey) ?? 0;
        if (now < next) continue;
        this.cooldowns.set(action.cooldownKey, now + (action.cooldownMs ?? 2500));
      }
      dedupe.add(key);
      finalActions.push(action);
    }
    return finalActions;
  }
}
