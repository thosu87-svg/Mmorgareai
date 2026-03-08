'use client';
/**
 * @fileOverview Axiom Frontier - Crafting & Recipe Manager
 * Handles resource transformation and item manifestation logic.
 */

import { Item, ItemRarity, ItemType } from '@/types';

export interface Recipe {
  id: string;
  name: string;
  requirements: Record<string, number>;
  skillRequired: string;
  minLevel: number;
  outputType: ItemType;
  outputRarity: ItemRarity;
}

const RECIPES: Recipe[] = [
  {
    id: 'iron_blade',
    name: 'Iron Logic Blade',
    requirements: { 'IRON_ORE': 5, 'LOGIC_NODE': 1 },
    skillRequired: 'smithing',
    minLevel: 1,
    outputType: 'WEAPON',
    outputRarity: 'COMMON'
  },
  {
    id: 'gold_cuirass',
    name: 'Gilded Protocol Armor',
    requirements: { 'GOLD_ORE': 10, 'LOGIC_NODE': 5 },
    skillRequired: 'smithing',
    minLevel: 10,
    outputType: 'CHEST',
    outputRarity: 'RARE'
  }
];

export class CraftingManager {
  static getRecipes(): Recipe[] {
    return RECIPES;
  }

  static canCraft(recipeId: string, resources: Record<string, number>, skillLevel: number): boolean {
    const recipe = RECIPES.find(r => r.id === recipeId);
    if (!recipe) return false;
    if (skillLevel < recipe.minLevel) return false;

    for (const [res, amt] of Object.entries(recipe.requirements)) {
      if ((resources[res] || 0) < amt) return false;
    }

    return true;
  }

  static generateOutput(recipe: Recipe): Partial<Item> {
    return {
      id: `crafted_${Date.now()}`,
      name: recipe.name,
      type: recipe.outputType,
      rarity: recipe.outputRarity,
      description: `A masterfully crafted ${recipe.name}.`,
      value: 100 * recipe.minLevel,
      stats: {
        atk: recipe.outputType === 'WEAPON' ? 10 * recipe.minLevel : 0,
        def: recipe.outputType === 'CHEST' ? 5 * recipe.minLevel : 0
      }
    };
  }
}