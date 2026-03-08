
'use client';
/**
 * @fileOverview Ouroboros AI Coordination Service - Local Fallback Mode
 * Orchestrates calls to deterministic logic while Genkit is disabled.
 */

import { Agent, AgentState, ResourceNode } from '@/types';
import { summarizeNeurologicChoice } from '@/lib/axiomatic-engine';

/**
 * Heuristic logic for when Genkit is offline.
 * Uses the Axiomatic Utility Engine (AUE) for deterministic logic.
 */
function getLocalHeuristicDecision(agent: Agent, nearbyAgents: Agent[], nearbyNodes: ResourceNode[]): any {
  const local = summarizeNeurologicChoice(agent, nearbyAgents, nearbyNodes, [], []);
  
  return {
    justification: local.reason,
    decision: "Local Protocol",
    newState: local.choice,
    message: local.logic
  };
}

export const AIService = {
  async generateDecision(agent: Agent, nearbyAgents: Agent[], nearbyNodes: ResourceNode[], logs: string[]) {
    return getLocalHeuristicDecision(agent, nearbyAgents, nearbyNodes);
  },

  async generateEmergentAction(agent: Agent, nearby: Agent[], logs: string[]) {
    return { 
      action: "Deterministic Sequence", 
      reasoning: "Local Axiom Core calculating next state based on nearby resonant signals.",
      message: `[KAPPA_${agent.displayName}]: Logic cycle finalized.`
    };
  },

  async importAgent(source: string, type: 'URL' | 'JSON') {
    return {
      name: "Imported_Entity",
      faction: "NPC",
      loreSnippet: "A ghost signature manifesting from an external source.",
      thinkingMatrix: {
        personality: "Neutral",
        currentLongTermGoal: "Stabilization",
        sociability: 0.5,
        aggression: 0.5,
        curiosity: 0.5,
        frugality: 0.5,
      },
      stats: { str: 10, agi: 10, int: 10, vit: 10 }
    };
  },

  async diagnose(context: string, logs?: string) {
    return {
      status: 'HEALTHY',
      summary: "Local systems operational. Genkit layer currently in stasis.",
      issues: [],
      recoverySteps: ["None required for local mode."]
    };
  }
};
