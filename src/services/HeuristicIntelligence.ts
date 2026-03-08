'use client';
/**
 * @fileOverview HeuristicIntelligence - Deep NPC Intelligence with Bidirectional World Impact
 * Implementation of NPC networks and collective behavior for Axiom Frontier.
 */

import * as THREE from 'three';
import { Agent, NPCRole, MoodVector, ThinkingMatrix } from '../types';

export interface SharedMemory {
  id: string;
  originalSourceId: string;
  content: string;
  spreadCount: number;
  distortion: number;
  timestamp: number;
  credibility: number;
}

const GOSSIP_RANGE = 50;
const DISTORTION_RATE = 0.05;

export class HeuristicIntelligence {
  private static memories = new Map<string, SharedMemory>();

  /**
   * Processes information sharing (gossip) between nearby NPCs.
   */
  static async processGossip(agents: Agent[]): Promise<Agent[]> {
    const updatedAgents = [...agents];
    
    for (let i = 0; i < updatedAgents.length; i++) {
      const sender = updatedAgents[i];
      const nearby = updatedAgents.filter(a => 
        a.id !== sender.id && 
        new THREE.Vector3(a.position.x, 0, a.position.z).distanceTo(
          new THREE.Vector3(sender.position.x, 0, sender.position.z)
        ) < GOSSIP_RANGE
      );

      if (nearby.length > 0) {
        const receiver = nearby[Math.floor(Math.random() * nearby.length)];
        this.shareMemory(sender, receiver);
      }
    }

    return updatedAgents;
  }

  private static shareMemory(sender: Agent, receiver: Agent) {
    if (!sender.memoryCache || sender.memoryCache.length === 0) return;

    // Pick a random memory from sender's cache
    const memory = sender.memoryCache[Math.floor(Math.random() * sender.memoryCache.length)];
    const spreadProb = (sender.thinkingMatrix.sociability + receiver.thinkingMatrix.curiosity) / 2;

    if (Math.random() < spreadProb) {
      const isNew = !receiver.memoryCache.includes(memory);
      if (isNew) {
        // Apply distortion logic (simplified)
        const distortedMemory = Math.random() < DISTORTION_RATE ? `[CORRUPTED]: ${memory}` : memory;
        receiver.memoryCache.push(`[GOSSIP]: ${distortedMemory}`);
        
        // Impact mood vector
        if (receiver.mood) {
          receiver.mood.curiosity = Math.min(1, receiver.mood.curiosity + 0.05);
          receiver.mood.trust = Math.max(-1, receiver.mood.trust - 0.01); 
        }
      }
    }
  }

  /**
   * Calculates the collective impact of NPC roles on global world state.
   */
  static calculateCollectiveInfluence(agents: Agent[]) {
    const influence = {
      economicPressure: 0,
      culturalDrift: 0,
      safetyContribution: 0
    };

    agents.forEach(agent => {
      const power = agent.level * (agent.thinkingMatrix.sociability || 0.5);
      
      if (agent.role === 'merchant') influence.economicPressure += power;
      if (agent.role === 'scholar' || agent.role === 'priest') influence.culturalDrift += power;
      if (agent.role === 'guard' || agent.role === 'soldier') influence.safetyContribution += power;
    });

    return influence;
  }
}

export const heuristicIntelligence = new HeuristicIntelligence();