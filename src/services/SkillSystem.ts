'use client';
/**
 * SkillSystem - Axiom Frontier Progression Logic
 * Implements exponential scaling and high-tier (level 100+) multiplier logic.
 */

export type SkillType = 'mining' | 'smithing' | 'combat' | 'reflection';

export interface SkillDefinition {
  name: string;
  icon: string;
  category: 'GATHERING' | 'CRAFTING' | 'COMBAT' | 'UTILITY';
}

export const SKILL_DEFINITIONS: Record<SkillType, SkillDefinition> = {
  mining: { name: 'Axiom Mining', icon: 'Pickaxe', category: 'GATHERING' },
  smithing: { name: 'Logic Forging', icon: 'Hammer', category: 'CRAFTING' },
  combat: { name: 'Neural Combat', icon: 'Swords', category: 'COMBAT' },
  reflection: { name: 'Deep Thinking', icon: 'Brain', category: 'UTILITY' }
};

export const XP_FORMULAS = {
  base: 100,
  growth: 1.5,
  highTierGrowth: 3.25
};

export function xpForLevel(level: number): number {
  if (level < 100) {
    return Math.floor(XP_FORMULAS.base * Math.pow(XP_FORMULAS.growth, level - 1));
  } else {
    const xpAt99 = Math.floor(XP_FORMULAS.base * Math.pow(XP_FORMULAS.growth, 98));
    const levelsOver99 = level - 99;
    return Math.floor(xpAt99 * Math.pow(XP_FORMULAS.highTierGrowth, levelsOver99));
  }
}

export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += xpForLevel(i);
  }
  return total;
}

export function levelFromTotalXp(totalXp: number): number {
  let level = 1;
  let accumulated = 0;
  while (accumulated + xpForLevel(level) <= totalXp) {
    accumulated += xpForLevel(level);
    level++;
  }
  return level;
}

export const skillSystem = {
  xpForLevel,
  totalXpForLevel,
  levelFromTotalXp,
  SKILL_DEFINITIONS
};