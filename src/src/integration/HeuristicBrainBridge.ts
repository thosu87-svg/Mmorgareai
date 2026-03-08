import { ServiceFieldAdapter } from './ServiceFieldAdapter';

export type BrainAction = {
  type: string;
  priority: number;
  sourceAgent: string;
};

export class HeuristicBrainBridge {
  private cooldowns = new Map<string, number>();

  tick(snapshot: Awaited<ReturnType<typeof ServiceFieldAdapter.buildSnapshot>>): BrainAction[] {
    const actions: BrainAction[] = [];
    const now = Date.now();

    if (snapshot.marketInflation > 0.7 && this.ready("spawn_traders", now, 5000)) {
      actions.push({ type: "spawn_traders", priority: 8, sourceAgent: "economy" });
    }

    if (snapshot.threatLevel > 0.7 && this.ready("spawn_guards", now, 5000)) {
      actions.push({ type: "spawn_guards", priority: 9, sourceAgent: "combat" });
    }

    if (snapshot.resourceScarcity > 0.6 && this.ready("boost_resource_nodes", now, 6000)) {
      actions.push({ type: "boost_resource_nodes", priority: 7, sourceAgent: "resource" });
    }

    if (snapshot.guildActivity < 0.3 && this.ready("trigger_guild_call", now, 8000)) {
      actions.push({ type: "trigger_guild_call", priority: 5, sourceAgent: "guild" });
    }

    if (snapshot.activeQuestHooks < 4 && this.ready("seed_quest_hooks", now, 6000)) {
      actions.push({ type: "seed_quest_hooks", priority: 6, sourceAgent: "quest" });
    }

    if (snapshot.suspiciousMovementCount > 0 && this.ready("freeze_suspicious_player", now, 1500)) {
      actions.push({ type: "freeze_suspicious_player", priority: 10, sourceAgent: "anti-exploit" });
    }

    return actions.sort((a, b) => b.priority - a.priority);
  }

  private ready(key: string, now: number, cooldownMs: number) {
    const next = this.cooldowns.get(key) ?? 0;
    if (now < next) return false
    this.cooldowns.set(key, now + cooldownMs);
    return true;
  }
}
