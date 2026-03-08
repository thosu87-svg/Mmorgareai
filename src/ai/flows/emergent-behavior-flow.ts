
'use server';
/**
 * @fileOverview Ouroboros Emergent Consciousness Engine (Local Mode)
 * Generates deterministic unscripted actions while Genkit is disabled.
 */

export type EmergentBehaviorInput = {
  agentName: string;
  personality: string;
  economicDesires: {
    targetGold: number;
    greedLevel: number;
    riskAppetite: number;
    frugality: number;
    marketRole: string;
    tradeFrequency: number;
  };
  resources: Record<string, number>;
  gold: number;
  relationships: Record<string, any>;
  memories: string[];
  nearbyAgents: Array<{ name: string; affinity: number }>;
  activeTradeOffers: any[];
  recentLogs: string[];
};

export type EmergentBehaviorOutput = {
  action: string;
  reasoning: string;
  message?: string;
  tradeProposal?: {
    offeredType: string;
    offeredAmount: number;
    requestedType: string;
    requestedAmount: number;
  };
};

export async function emergentBehaviorFlow(input: EmergentBehaviorInput): Promise<EmergentBehaviorOutput> {
  const roll = Math.random();
  
  if (roll > 0.8 && input.nearbyAgents.length > 0) {
    return {
      action: "Social Handshake",
      reasoning: "Resonance detected with nearby entities. Initiating trust protocol.",
      message: `[KAPPA_${input.agentName}]: Synchronizing memory cache with ${input.nearbyAgents[0].name}.`
    };
  }

  if (roll > 0.6 && input.gold > 50) {
    return {
      action: "Economic Consolidation",
      reasoning: "Excess AXM liquidity detected. Seeking value storage.",
      message: `[KAPPA_${input.agentName}]: Converting AXM to stable logic fragments.`
    };
  }

  return {
    action: "Internal Logic Refinement",
    reasoning: "Standard optimization cycle based on local entropy.",
    message: `[KAPPA_${input.agentName}]: Deterministic pathways verified.`
  };
}
