'use client';
/**
 * @fileOverview Axiom Frontier - Robustness Engine & Agent Core
 * Implementiert die Sicherheits-Wrapper und das Vertrauens-basierte Agentensystem.
 */

import { Agent, AgentState, ResourceNode, POI, Monster, Item, ItemRarity, ItemType, ItemStats } from '../types';

export const KAPPA = 1.000;

/**
 * ROBUSTNESS & FALLBACK ENGINE
 */
export class RobustnessEngine {
  static wrap<T>(operation: () => T, fallback: T, context: string): T {
    try {
      return operation();
    } catch (e) {
      console.error(`[CRITICAL FAILURE] in ${context}:`, e);
      return fallback;
    }
  }
}

export interface AxiomaticSummary {
    choice: AgentState;
    utility: number;
    logic: string;
    reason: string;
}

/**
 * Heuristische Utility-Berechnung basierend auf Agenten-Needs.
 */
export const calculateUtility = (agent: Agent, action: AgentState): number => {
  return RobustnessEngine.wrap(() => {
    const hunger = agent.needs?.hunger ?? 0;
    const social = agent.needs?.social ?? 50;
    const wealth = agent.needs?.wealth ?? 50;

    switch (action) {
      case AgentState.GATHERING:
      case AgentState.CRAFTING:
        return wealth < 30 ? 0.9 : 0.2;
      case AgentState.TRADING:
      case AgentState.BANKING:
        return hunger > 60 ? 0.95 : wealth > 80 ? 0.7 : 0.1;
      case AgentState.EXPLORING:
      case AgentState.QUESTING:
        return social < 40 ? 0.8 : 0.4;
      case AgentState.COMBAT:
        return (agent.thinkingMatrix?.aggression || 0.5) > 0.7 ? 0.85 : 0.2;
      case AgentState.IDLE:
        return 0.1;
      default:
        return 0.3;
    }
  }, 0.1, "UtilityCalculation");
};

/**
 * Generiert kontextabhängige Dialoge für Agenten-Interaktionen.
 */
export const generateDialogue = (sender: Agent, receiver: Agent, intent: 'social' | 'trade' | 'combat'): string => {
  const name = sender.displayName || sender.name || 'Pilot';
  const recName = receiver.displayName || receiver.name || 'Entity';
  
  const dialogues = {
    social: [
      `Greetings, ${recName}. The Axiom flows strong today.`,
      `Have you noticed the recent logic drifts in the Spire?`,
      `My neural matrix resonates with your signature.`,
      `The stability in Sector 0_0 seems to be increasing.`
    ],
    trade: [
      `I have logic fragments to offer. Any interest?`,
      `Trading AXM for energy. Let's update the ledger.`,
      `Market flow suggests a trade would be beneficial.`,
      `My stocks of iron-logic are high. Do you need anything?`
    ],
    combat: [
      `Your protocol is outdated. Termination initiated.`,
      `Target locked. Neural disruption sequence started.`,
      `The Matrix no longer requires your signature.`,
      `Erosion will turn you to binary dust.`
    ]
  };

  const pool = dialogues[intent as keyof typeof dialogues] || dialogues.social;
  return pool[Math.floor(Math.random() * pool.length)];
};

/**
 * NO LEVEL CAP LOGIC
 * Ab Level 100 kostet jedes Level 225% mehr als das vorherige.
 */
export const getXPForNextLevel = (currentLevel: number): number => {
    const baseXP = 100;
    if (currentLevel < 100) {
        return Math.floor(baseXP * Math.pow(1.5, currentLevel - 1));
    } else {
        const xpAt99 = Math.floor(baseXP * Math.pow(1.5, 98));
        const levelsOver99 = currentLevel - 99;
        return Math.floor(xpAt99 * Math.pow(3.25, levelsOver99));
    }
};

export const summarizeNeurologicChoice = (
    agent: Agent,
    nearbyAgents: Agent[],
    nearbyResources: ResourceNode[],
    nearbyPOIs: POI[] = [],
    nearbyMonsters: Monster[] = []
): AxiomaticSummary => {
    const choices = [
        AgentState.IDLE, 
        AgentState.GATHERING, 
        AgentState.EXPLORING,
        AgentState.QUESTING,
        AgentState.BANKING,
        AgentState.CRAFTING,
        AgentState.COMBAT,
        AgentState.TRADING
    ];

    const results = choices.map(c => {
        const utility = calculateUtility(agent, c);
        return { choice: c, utility, reason: `Utility: ${utility.toFixed(2)}` };
    }).sort((a, b) => b.utility - a.utility);

    const best = results[0];
    const logic = `[HEURISTIC_AI]: ${best.choice} - Needs: H:${Math.floor(agent.needs?.hunger || 0)} S:${Math.floor(agent.needs?.social || 0)} W:${Math.floor(agent.needs?.wealth || 0)}`;

    return { ...best, logic };
};

export const generateLoot = (monsterType: string): Item | null => {
    const roll = Math.random() * 100;
    let rarity: ItemRarity = 'COMMON';
    if (roll > 99.9) rarity = 'AXIOMATIC';
    else if (roll > 99) rarity = 'LEGENDARY';
    else if (roll > 95) rarity = 'EPIC';
    else if (roll > 85) rarity = 'RARE';
    else if (roll > 60) rarity = 'UNCOMMON';

    const types: ItemType[] = ['WEAPON', 'HELM', 'CHEST', 'LEGS'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const stats: ItemStats = {};
    const multiplier = rarity === 'AXIOMATIC' ? 10 : rarity === 'LEGENDARY' ? 5 : rarity === 'EPIC' ? 3 : rarity === 'RARE' ? 2 : rarity === 'UNCOMMON' ? 1.5 : 1;
    
    if (type === 'WEAPON') stats.atk = Math.floor((Math.random() * 10 + 5) * multiplier);
    else stats.def = Math.floor((Math.random() * 5 + 2) * multiplier);

    return {
        id: `item-${Date.now()}-${Math.random()}`,
        name: `${rarity} ${type}`,
        type,
        rarity,
        stats,
        value: Math.floor(10 * multiplier),
        description: `An item of ${rarity} quality dropped by a ${monsterType}.`
    };
};

export const ITEM_SETS: Record<string, Record<number, Array<{ description: string }>>> = {
  'Axiom Core': {
    2: [{ description: '+10% Logic Efficiency' }],
    4: [{ description: '+25% Neural Regeneration' }]
  }
};