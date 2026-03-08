
'use client';
/**
 * @fileOverview Axiom Frontier - Seeded Loot Generation Service
 * Handles deterministic item generation based on source level and event seeds.
 */

import { collection, addDoc, serverTimestamp, Firestore } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { GeneratedItem, ItemRarity } from '@/types';

const { firestore: db } = initializeFirebase();

const RARITIES = [
  { name: 'COMMON', weight: 50, statMultiplier: 1.0 },
  { name: 'UNCOMMON', weight: 25, statMultiplier: 1.3 },
  { name: 'RARE', weight: 15, statMultiplier: 1.8 },
  { name: 'EPIC', weight: 7, statMultiplier: 2.5 },
  { name: 'LEGENDARY', weight: 2.5, statMultiplier: 4.0 },
  { name: 'AXIOMATIC', weight: 0.5, statMultiplier: 7.0 }
];

const ITEM_TEMPLATES = [
  { name: 'Iron Sword', type: 'WEAPON', baseStats: { attack: 10, speed: 1.2 } },
  { name: 'Steel Shield', type: 'SHIELD', baseStats: { defense: 15, block: 0.2 } },
  { name: 'Leather Armor', type: 'ARMOR', baseStats: { defense: 8, agility: 2 } },
  { name: 'Mystic Ring', type: 'ACCESSORY', baseStats: { intelligence: 5, mana: 20 } },
  { name: 'Health Potion', type: 'CONSUMABLE', baseStats: { heal: 50 } },
  { name: 'Mana Crystal', type: 'CONSUMABLE', baseStats: { mana_restore: 30 } },
  { name: 'Voidweaver Blade', type: 'WEAPON', baseStats: { attack: 25, critChance: 0.15 } },
  { name: 'Axiom Staff', type: 'WEAPON', baseStats: { attack: 18, intelligence: 12 } },
  { name: 'Dragon Scale Mail', type: 'ARMOR', baseStats: { defense: 30, fireResist: 0.3 } },
  { name: 'Neural Crown', type: 'ACCESSORY', baseStats: { intelligence: 15, memoryBoost: 0.2 } }
];

/**
 * Deterministic pseudo-random roll based on a seed
 */
function seededRoll(seed: number): number {
  const s = (seed * 1664525 + 1013904223) & 0xFFFFFFFF;
  return (s >>> 0) / 0xFFFFFFFF;
}

/**
 * Selects a rarity based on a seeded roll
 */
function selectRarity(seed: number): typeof RARITIES[0] {
  const roll = seededRoll(seed) * 100;
  let cumulative = 0;
  for (const rarity of RARITIES) {
    cumulative += rarity.weight;
    if (roll <= cumulative) return rarity;
  }
  return RARITIES[0];
}

/**
 * Generates a list of items based on source level and seed
 */
export function generateLoot(
  sourceLevel: number,
  seed: number,
  dropCount = 1
): GeneratedItem[] {
  const items: GeneratedItem[] = [];

  for (let i = 0; i < dropCount; i++) {
    const itemSeed = seed + i * 7919;
    const rarity = selectRarity(itemSeed);
    const templateIdx = Math.floor(seededRoll(itemSeed + 1) * ITEM_TEMPLATES.length);
    const template = ITEM_TEMPLATES[templateIdx];

    const levelScale = 1 + sourceLevel * 0.1;
    const stats: Record<string, number> = {};
    for (const [key, val] of Object.entries(template.baseStats)) {
      stats[key] = Math.floor((val as number) * rarity.statMultiplier * levelScale);
    }

    const value = Math.floor(
      Object.values(stats).reduce((s, v) => s + v, 0) * rarity.statMultiplier * sourceLevel * 0.5
    );

    const prefixes: Record<string, string> = {
      COMMON: '', 
      UNCOMMON: 'Fine ', 
      RARE: 'Superior ',
      EPIC: 'Exalted ', 
      LEGENDARY: 'Mythic ', 
      AXIOMATIC: 'Axiomatic '
    };

    items.push({
      name: `${prefixes[rarity.name]}${template.name}`,
      type: template.type,
      rarity: rarity.name,
      stats,
      level: sourceLevel,
      value
    });
  }

  return items;
}

/**
 * Records a loot drop event to Firestore
 */
export async function recordLootDrop(
  items: GeneratedItem[],
  combatLogId?: string
): Promise<void> {
  if (!db) return;

  const lootCol = collection(db, 'lootTable');
  for (const item of items) {
    addDoc(lootCol, {
      ...item,
      combatLogId: combatLogId || null,
      createdAt: serverTimestamp()
    });
  }
}
