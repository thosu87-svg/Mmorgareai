
'use server';
/**
 * @fileOverview Ouroboros Axiom Engine - Autonomous Decision Flow (Local Mode)
 * Returns deterministic neural decisions while Genkit is disabled.
 */

import { AgentState } from '@/types';

export type AutonomousDecisionInput = {
  agentName: string;
  currentState: AgentState;
  hp: number;
  consciousnessLevel: number;
  awakeningProgress: number;
  longTermGoal: string;
  personality: string;
  relationships: Record<string, any>;
  nearbyAgentCount: number;
  nearbyNodeCount: number;
  logicField?: { vx: number; vz: number };
  recentLogs: string[];
};

export type AutonomousDecisionOutput = {
  justification: string;
  decision: string;
  newState: AgentState;
  message?: string;
};

export async function autonomousDecisionFlow(input: AutonomousDecisionInput): Promise<AutonomousDecisionOutput> {
  // Local deterministic logic
  const isLowHP = input.hp < 30;
  
  if (isLowHP) {
    return {
      justification: "Critical integrity failure detected. Retreating to repair nodes.",
      decision: "EMERGENCY_REPAIR",
      newState: AgentState.IDLE,
      message: "[KAPPA_EMERGENCY]: Low HP. Protocol: Stabilization."
    };
  }

  if (input.nearbyNodeCount > 0) {
    return {
      justification: "Resource signatures detected in local logic field.",
      decision: "GATHER_RESOURCES",
      newState: AgentState.GATHERING,
      message: "[KAPPA_SCAN]: Harvesting Axiom fragments."
    };
  }

  return {
    justification: "No immediate threats or resources. Expanding local database through exploration.",
    decision: "EXPLORATION_WALK",
    newState: AgentState.EXPLORING,
    message: "[KAPPA_IDLE]: Seeking new logic pathways."
  };
}
