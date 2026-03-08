
'use server';
/**
 * @fileOverview Ouroboros Procedural Quest Synthesis
 * Generates varied quests based on archetype and player level.
 */

export type GenerateDynamicQuestInput = {
  civilizationIndex: number;
  playerLevel: number;
  availableRegions: string[];
  availableNpcs: string[];
  questType: string;
  currentGameLore: string;
};

export type GenerateDynamicQuestOutput = {
  title: string;
  description: string;
  objectives: string[];
  rewards: string[];
  giverNpc: string;
  region: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
};

export async function generateDynamicQuest(input: GenerateDynamicQuestInput): Promise<GenerateDynamicQuestOutput> {
  const type = input.questType?.toLowerCase().trim() || 'exploration';
  const level = input.playerLevel;
  const region = input.availableRegions[Math.floor(Math.random() * input.availableRegions.length)] || "Unknown Sector";
  const giver = input.availableNpcs[Math.floor(Math.random() * input.availableNpcs.length)] || "Axiom Core";

  let title = `Quest: ${type.toUpperCase()}`;
  let description = `Mission briefing at CI ${input.civilizationIndex}.`;
  let objectives: string[] = [];
  let difficulty: GenerateDynamicQuestOutput['difficulty'] = level < 10 ? 'easy' : level < 30 ? 'medium' : level < 60 ? 'hard' : 'epic';

  // Procedural Branching Logic
  switch (type) {
    case 'combat':
      title = `Elimination Cycle: ${region}`;
      description = `Neural anomalies have manifested in ${region}. Total eradication is required to maintain the Axiom.`;
      objectives = [
        `Purge ${Math.floor(level / 5) + 5} Glitched Signatures`,
        `Locate and stabilize the rift at [${(Math.random() * 100).toFixed(1)}, ${(Math.random() * 100).toFixed(1)}]`
      ];
      break;
    case 'fetch':
    case 'resource':
      title = `Material Acquisition: ${region}`;
      description = `The Spire requires high-purity logic fragments for the next recursion phase.`;
      objectives = [
        `Gather ${Math.floor(level / 2) + 10} Axiom Shards`,
        `Deliver payload to ${giver} at the extraction node`
      ];
      break;
    case 'puzzle':
    case 'decryption':
      title = `Logic Decryption: ${region}`;
      description = `An encrypted sequence from the Pre-Chrome Era has surfaced. We need your neural link to decode it.`;
      objectives = [
        `Access 3 Legacy Terminals in the ruins`,
        `Reconstruct the corrupted data packet`
      ];
      break;
    case 'story':
    case 'lore':
      title = `Echoes of the Spire: ${region}`;
      description = `Resonance from the Deep Matrix suggests a historical fragment is buried in ${region}.`;
      objectives = [
        `Locate the historical marker near the monolith`,
        `Scribe the memory into the collective ledger`
      ];
      break;
    case 'exploration':
    case 'recon':
      title = `Reconnaissance: ${region}`;
      description = `A logic drift has been detected in ${region}. We need a visual scan of the local nodes.`;
      objectives = [
        `Map 3 undiscovered sectors in ${region}`,
        `Ping the Axiom Beacon at high elevation`
      ];
      break;
    default:
      title = `Calibration: ${region}`;
      description = `Routine synchronization of the local logic field at CI ${input.civilizationIndex}.`;
      objectives = [
        `Travel to the target sector in ${region}`,
        `Stabilize 3 core logic nodes using your neural link`
      ];
  }

  const rewards = [
    `${level * 150} XP`,
    `${level * 20} AXM Energy`,
    difficulty === 'epic' ? "Legendary Memory Fragment" : "Standard Data-Pak"
  ];

  return {
    title,
    description,
    objectives,
    rewards,
    giverNpc: giver,
    region,
    difficulty
  };
}
