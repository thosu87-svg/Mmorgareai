
'use server';
/**
 * @fileOverview Ouroboros Local NPC Synthesis
 * Returns deterministic mock personalities while Genkit is disabled.
 */

export type GenerateNpcPersonalityInput = {
  npcName?: string;
  gameWorldSetting: string;
  role: string;
  additionalContext?: string;
};

export type GenerateNpcPersonalityOutput = {
  name: string;
  personalityTraits: string[];
  backstory: string;
  motivations: string[];
  quirks?: string[];
};

export async function generateNpcPersonality(input: GenerateNpcPersonalityInput): Promise<GenerateNpcPersonalityOutput> {
  const name = input.npcName || "AxiomSentinel_" + Math.floor(Math.random() * 1000);
  return {
    name,
    personalityTraits: ["Deterministic", "Logical", "Observant"],
    backstory: `A neural manifestation originating from the ${input.gameWorldSetting}. It identifies as a ${input.role}.`,
    motivations: ["Stability Maintenance", "Data Collection"],
    quirks: ["Speaks in binary-adjacent metaphors", "Rarely blinks"]
  };
}
