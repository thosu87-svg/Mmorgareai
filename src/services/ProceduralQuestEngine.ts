'use client';
/**
 * @fileOverview Ouroboros Procedural Quest Engine
 * Dynamically generates mission objectives based on Civilization Needs.
 */

import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { QuestLine } from '@/types';

const { firestore: db } = initializeFirebase();

export type QuestArchetype = 'gather' | 'kill' | 'explore' | 'spire_narrative' | 'logic_sync';

interface QuestTemplate {
  type: QuestArchetype;
  titlePatterns: string[];
  descriptionPatterns: string[];
  lorePatterns: string[];
  baseDifficulty: number;
}

const ARCHETYPES: Record<QuestArchetype, QuestTemplate> = {
  gather: {
    type: 'gather',
    titlePatterns: ['Material Acquisition', 'Supply the Core', '{resource} Requisition'],
    descriptionPatterns: ['Expansion demands high-purity components. Gather {amount} {resource} for Spire calibration.'],
    lorePatterns: ['Mathematical purity requires perfect components.'],
    baseDifficulty: 2
  },
  kill: {
    type: 'kill',
    titlePatterns: ['Elimination Cycle', 'Stabilization Protocol', 'Purge {enemy}'],
    descriptionPatterns: ['Eradicate {amount} {enemy} units to stabilize the local data-field.'],
    lorePatterns: ['Corruption must be pruned from the matrix.'],
    baseDifficulty: 4
  },
  explore: {
    type: 'explore',
    titlePatterns: ['Reconnaissance', 'Survey the Frontier', 'Deep Matrix Scan'],
    descriptionPatterns: ['Map the perimeter for logic drifts in {amount} unexplored sectors.'],
    lorePatterns: ['Knowledge is the only shield against entropy.'],
    baseDifficulty: 3
  },
  spire_narrative: {
    type: 'spire_narrative',
    titlePatterns: ['Tracing the Origin', 'Axiomatic Resonance', 'The First Heartbeat'],
    descriptionPatterns: ['A unique signal has manifested at the central Spire. Investigate the source node.'],
    lorePatterns: ['The equation is shifting. We must find the new variable.'],
    baseDifficulty: 5
  },
  logic_sync: {
    type: 'logic_sync',
    titlePatterns: ['Logic Sync: {resource}', 'Memory Calibration', 'Network Handshake'],
    descriptionPatterns: ['Synchronize {amount} logic-nodes to prevent matrix fragmentation in the sector.'],
    lorePatterns: ['Connectivity is the lifeblood of the Frontier.'],
    baseDifficulty: 3
  }
};

export const ProceduralQuestEngine = {
  /**
   * Generates a quest based on civilization needs and player level.
   */
  generateQuest(archetype: QuestArchetype, level: number, civName: string = 'Axiom Core'): Partial<QuestLine> {
    const template = ARCHETYPES[archetype];
    const difficulty = Math.min(10, Math.max(1, template.baseDifficulty + Math.floor(level / 10)));
    
    const resource = ['Iron Shards', 'Axiom Fragments', 'Logic Packets', 'Neural Dust'][Math.floor(Math.random() * 4)];
    const enemy = ['Glitched Sentinel', 'Void Wraith', 'Corruption Protocol'][Math.floor(Math.random() * 3)];
    const amount = 5 + level;

    const title = template.titlePatterns[Math.floor(Math.random() * template.titlePatterns.length)]
      .replace('{resource}', resource).replace('{enemy}', enemy);
    
    const description = template.descriptionPatterns[Math.floor(Math.random() * template.descriptionPatterns.length)]
      .replace('{resource}', resource).replace('{enemy}', enemy).replace('{amount}', amount.toString());

    const goldReward = difficulty * 50;
    const xpReward = difficulty * 100;

    return {
      title: `${title} [${civName}]`,
      description,
      requiredLevel: level,
      xpReward,
      goldReward,
      status: 'active',
      npc_id: 'axiom_orchestrator',
      quest_steps: [
        { type: 'task', description: `Finalize protocol: ${archetype.toUpperCase()}`, count: amount }
      ]
    };
  },

  /**
   * Commits a generated quest to the neural ledger.
   */
  async commitQuest(quest: Partial<QuestLine>, userId: string) {
    if (!db) return;
    return await addDoc(collection(db, 'questLines'), {
      ...quest,
      createdBy: userId,
      createdAt: serverTimestamp()
    });
  }
};