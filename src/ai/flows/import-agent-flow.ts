
'use server';
/**
 * @fileOverview Ouroboros Entity Manifestation Engine (Local Mode)
 * Returns deterministic mock character imports while Genkit is disabled.
 */

export type ImportAgentInput = {
  source: string;
  type: 'URL' | 'JSON';
};

export type ImportAgentOutput = {
  name: string;
  faction: string;
  loreSnippet: string;
  thinkingMatrix: {
    personality: string;
    currentLongTermGoal: string;
    sociability: number;
    aggression: number;
    curiosity: number;
    frugality: number;
  };
  stats: {
    str: number;
    agi: number;
    int: number;
    vit: number;
  };
};

export async function importAgentFlow(input: ImportAgentInput): Promise<ImportAgentOutput> {
  return {
    name: "Ghost_Manifest",
    faction: "NPC",
    loreSnippet: "A neural signature captured from an external data stream. Its origin is fragmented.",
    thinkingMatrix: {
      personality: "Analytical",
      currentLongTermGoal: "Find the root origin",
      sociability: 0.4,
      aggression: 0.1,
      curiosity: 0.9,
      frugality: 0.5
    },
    stats: {
      str: 10,
      agi: 15,
      int: 20,
      vit: 10
    }
  };
}
