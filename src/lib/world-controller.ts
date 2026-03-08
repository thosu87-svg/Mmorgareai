'use client';

import { Agent, AgentState } from '@/types';

/**
 * WorldController - Phase 2 Advanced
 * Handles intelligent steering and pathfinding towards dynamic targets.
 */
export class WorldController {
  private agents: Agent[];

  constructor(agents: Agent[]) {
    this.agents = agents;
  }

  /**
   * Calculates a world tick with pathfinding logic.
   */
  tick(): Agent[] {
    return this.agents.map(agent => {
      const newAgent = { ...agent };

      // 1. Movement & Pathfinding
      if (newAgent.targetPosition) {
        const dx = newAgent.targetPosition.x - newAgent.position.x;
        const dz = newAgent.targetPosition.z - newAgent.position.z;
        const dist = Math.hypot(dx, dz);

        if (dist > 0.5) {
          const speed = 0.5;
          newAgent.position = {
            ...newAgent.position,
            x: newAgent.position.x + (dx / dist) * speed,
            z: newAgent.position.z + (dz / dist) * speed
          };
          newAgent.state = AgentState.EXPLORING;
        } else {
          newAgent.targetPosition = null;
          newAgent.state = AgentState.IDLE;
        }
      } else if (Math.random() > 0.95 && newAgent.npcClass !== 'PILOT') {
        // NPC Wander logic
        newAgent.targetPosition = {
          x: newAgent.position.x + (Math.random() - 0.5) * 20,
          y: 0,
          z: newAgent.position.z + (Math.random() - 0.5) * 20
        };
      }

      // 2. Trust & Needs Decay
      if (newAgent.needs) {
        newAgent.needs = {
          ...newAgent.needs,
          hunger: Math.min(100, (newAgent.needs.hunger || 0) + 0.1),
          social: Math.max(0, (newAgent.needs.social || 50) - 0.05)
        };
      }

      return newAgent;
    });
  }
}