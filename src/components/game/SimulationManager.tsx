'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/store';
import { InteractionManager } from '@/services/InteractionManager';
import { WorldController } from '@/lib/world-controller';
import { syncAgentsBatch } from '@/services/AgentManager';
import { DungeonGenerator } from '@/services/DungeonGenerator';

/**
 * WorldEngine / SimulationManager - Phase 2
 * Orchestrates all high-level MMORPG systems including AI, Economy, and Dungeons.
 */
export const SimulationManager = () => {
  const addLog = useStore(state => state.addLog);
  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const cleanup = () => {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    };

    cleanup();

    tickIntervalRef.current = setInterval(async () => {
      const state = useStore.getState();
      const currentAgents = state.agents;
      
      if (currentAgents.length === 0) return;

      // 1. World Logic Tick
      const worldController = new WorldController(currentAgents);
      const updatedAgents = worldController.tick();

      // 2. Interaction & Social System
      const interactionManager = new InteractionManager(updatedAgents);
      updatedAgents.forEach(agent => {
        if (Math.random() > 0.95 && updatedAgents.length > 1) {
          const target = updatedAgents.find(a => a.id !== agent.id);
          if (target) {
            const result = interactionManager.processInteraction({
              type: 'social',
              senderId: agent.id,
              receiverId: target.id
            });
            addLog(`${agent.displayName}: ${result}`, 'LOCAL');
          }
        }
      });

      // 3. Dungeon Manifestation (Rare event)
      if (Math.random() > 0.99) {
        const dungeon = DungeonGenerator.generate(Date.now(), 5);
        state.addDungeon(dungeon);
        addLog(`[DUNGEON_PROTO]: A logic rift has manifested at [${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}]`, 'SYSTEM');
      }

      // 4. Persistence Sync
      state.setAgents(updatedAgents);
      if (Math.random() > 0.98) {
        try {
          await syncAgentsBatch(updatedAgents);
        } catch (e) {}
      }

    }, 2000); // Higher frequency for Phase 2

    return cleanup;
  }, [addLog]);

  return null;
};