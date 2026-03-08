
'use client';
/**
 * @fileOverview Axiom Frontier - Character Consciousness Importer
 * Allows importing neural entities from external platforms and custom JSON.
 */

import { Agent, AgentState } from "../types";

export class CharacterImporter {
  /**
   * Imports a partial agent from a supported URL (JanitorAI, Character.AI).
   */
  static async importFromURL(url: string): Promise<Partial<Agent> | null> {
    try {
      // JanitorAI Format
      if (url.includes('janitorai.com')) {
        return await this.importJanitorAI(url);
      }
      
      // Character.AI Format
      if (url.includes('character.ai')) {
        return await this.importCharacterAI(url);
      }
      
      throw new Error('Unsupported URL format. Use JanitorAI or Character.AI links.');
    } catch (error) {
      console.error('Import failed:', error);
      return null;
    }
  }

  private static async importJanitorAI(url: string): Promise<Partial<Agent>> {
    const match = url.match(/characters\/([^\/\?]+)/);
    const charId = match ? match[1] : 'unknown';
    
    return {
      displayName: `Janitor_${charId.slice(0, 5)}`,
      loreSnippet: `Imported entity from JanitorAI (ID: ${charId}). Memories of a different reality linger.`,
      thinkingMatrix: {
        personality: 'Imported',
        currentLongTermGoal: 'Understand this new world',
        alignment: 0.5,
        languagePreference: 'EN',
        sociability: 0.8,
        aggression: 0.2
      },
      str: 12, agi: 12, int: 15, vit: 10, hp: 100, maxHp: 100
    };
  }

  private static async importCharacterAI(url: string): Promise<Partial<Agent>> {
    const match = url.match(/chat\/([^\/\?]+)/);
    const charId = match ? match[1] : 'unknown';

    return {
      displayName: `CAI_${charId.slice(0, 5)}`,
      loreSnippet: `A consciousness transferred from Character.AI. It seeks conversation.`,
      thinkingMatrix: {
        personality: 'Chatty',
        currentLongTermGoal: 'Find a conversation partner',
        alignment: 0.8,
        languagePreference: 'EN',
        sociability: 0.9,
        aggression: 0.1
      },
      str: 8, agi: 10, int: 18, vit: 8, hp: 80, maxHp: 80
    };
  }

  /**
   * Parses a custom JSON string into an Agent partial.
   */
  static importFromJSON(json: string): Partial<Agent> | null {
    try {
      const data = JSON.parse(json);
      return {
        displayName: data.name || 'Unknown Import',
        loreSnippet: data.description || 'No description provided.',
        thinkingMatrix: {
            personality: data.personality?.primary || 'Neutral',
            currentLongTermGoal: 'Survive',
            alignment: 0.5,
            languagePreference: 'EN',
            sociability: data.personality?.sociability || 0.5,
            aggression: data.personality?.aggression || 0.5
        },
        str: data.stats?.str || 10,
        agi: data.stats?.agi || 10,
        int: data.stats?.int || 10,
        vit: data.stats?.vit || 10,
        hp: 100,
        maxHp: 100
      };
    } catch (error) {
      console.error('JSON import failed:', error);
      return null;
    }
  }
}
