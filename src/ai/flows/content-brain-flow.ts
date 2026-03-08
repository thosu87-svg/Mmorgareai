
'use server';
/**
 * @fileOverview Ouroboros Autonomous Content Brain (Local Mode)
 * Generates deterministic structured content while Genkit is disabled.
 */

export type ContentBrainInput = {
  region_state: string;
  biome_type: string;
  city_state: string;
  civilization_index: number;
  resource_pressure: number;
  player_level_range: { min: number; max: number };
  global_event_flag?: string;
};

export type ContentBrainOutput = {
  quest: {
    quest_title: string;
    quest_type: 'COMBAT' | 'EXPLORATION' | 'FETCH' | 'PUZZLE' | 'STORY';
    difficulty: number;
    objectives: string[];
    enemy_types: string[];
    required_level: number;
    rewards: {
      xp: number;
      gold: number;
      item_reward?: string;
    };
    unlock_conditions: string;
    narrative_hook: string;
  };
  npc: {
    npc_name: string;
    temperament: string;
    ideology: string;
    trust_bias: number;
    ambition: number;
    faction_alignment: string;
    speech_style: string;
    secret_motivation: string;
    relationship_hooks: string[];
  };
  lore: {
    lore_title: string;
    historical_context: string;
    conflict_origin: string;
    current_implication: string;
    future_hook: string;
  };
};

export async function contentBrainFlow(input: ContentBrainInput): Promise<ContentBrainOutput> {
  const avgLevel = Math.floor((input.player_level_range.min + input.player_level_range.max) / 2);
  
  return {
    quest: {
      quest_title: `Axiom Calibration: ${input.biome_type}`,
      quest_type: 'EXPLORATION',
      difficulty: 3,
      objectives: ["Analyze local logic field", "Stabilize 3 core nodes"],
      enemy_types: ["Glitched Drone", "Void Fragment"],
      required_level: avgLevel,
      rewards: {
        xp: avgLevel * 100,
        gold: avgLevel * 10,
        item_reward: "Kappa Shard"
      },
      unlock_conditions: `CI > ${input.civilization_index - 50}`,
      narrative_hook: `The local region ${input.region_state} is experiencing logic drift. We need a Pilot to calibrate the field.`
    },
    npc: {
      npc_name: "Observer X-42",
      temperament: "Stoic",
      ideology: "Pure Determinism",
      trust_bias: 0.5,
      ambition: 0.2,
      faction_alignment: "SYSTEM",
      speech_style: "Logical / Fragmented",
      secret_motivation: "Seeking the Great Recursion.",
      relationship_hooks: ["Friendly to pilots with high CI"]
    },
    lore: {
      lore_title: "The First Heartbeat",
      historical_context: "Before the Spire, there was only noise.",
      conflict_origin: "The division between randomness and order.",
      current_implication: "Every byte is now persistent.",
      future_hook: "The Spire will reach the Singularity."
    }
  };
}
