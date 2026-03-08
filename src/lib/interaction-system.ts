'use client';

import { Agent } from './agent';
import { Interaction } from './types';

export class InteractionManager {
  private agents: Map<string, Agent> = new Map();

  constructor(agents: Agent[]) {
    agents.forEach(agent => this.agents.set(agent.id, agent));
  }

  processInteraction(interaction: Interaction): string {
    const receiver = this.agents.get(interaction.receiverId);
    if (!receiver) {
      return "Target neural signature not found.";
    }
    return receiver.handleInteraction(interaction);
  }
}
