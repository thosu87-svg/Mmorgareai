
'use client';
/**
 * @fileOverview Ouroboros Interaction Manager
 * Handles peer-to-peer interactions between agents using deterministic logic.
 */

import { Agent, ChatChannel } from '@/types';
import { generateDialogue, RobustnessEngine } from '@/lib/axiomatic-engine';

export interface Interaction {
  type: 'talk' | 'trade' | 'combat' | 'social';
  senderId: string;
  receiverId: string;
  payload?: any;
}

export class InteractionManager {
  private agents: Agent[];

  constructor(agents: Agent[]) {
    this.agents = agents;
  }

  /**
   * Processes an interaction between two agents and returns the resulting dialogue/event log.
   */
  processInteraction(interaction: Interaction): string {
    return RobustnessEngine.wrap(() => {
      const sender = this.agents.find(a => a.id === interaction.senderId);
      const receiver = this.agents.find(a => a.id === interaction.receiverId);

      if (!sender || !receiver) {
        return "[system] Interaction failed: Neural signatures not found in local sector.";
      }

      const intent = interaction.type === 'talk' ? 'social' : interaction.type as any;
      const dialogue = generateDialogue(sender, receiver, intent);

      return dialogue;
    }, "[neutral] ...", "InteractionProcessing");
  }
}
