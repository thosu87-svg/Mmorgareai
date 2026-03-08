'use client';
/**
 * @fileOverview Axiom Frontier - Procedural Dungeon Generator
 * Generates room-based layouts with deterministic seeds for instanced exploration.
 */

import { DungeonRoom, ProceduralDungeon } from '@/types';

export class DungeonGenerator {
  /**
   * Generates a dungeon based on a seed and target level.
   */
  static generate(seed: number, level: number): ProceduralDungeon {
    const roomCount = 5 + Math.floor(level / 5) + (seed % 5);
    const rooms: DungeonRoom[] = [];
    
    // Start room
    rooms.push({
      id: 'spawn',
      x: 0,
      y: 0,
      type: 'SPAWN',
      connections: [],
      threatLevel: 0
    });

    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    let currentPos = { x: 0, y: 0 };

    for (let i = 1; i < roomCount; i++) {
      const dir = directions[Math.floor(this.pseudoRandom(seed + i) * directions.length)];
      currentPos = { x: currentPos.x + dir[0], y: currentPos.y + dir[1] };
      
      const isBoss = i === roomCount - 1;
      const isLoot = !isBoss && this.pseudoRandom(seed * i) > 0.7;

      rooms.push({
        id: `room_${i}`,
        x: currentPos.x,
        y: currentPos.y,
        type: isBoss ? 'BOSS' : (isLoot ? 'LOOT' : 'EMPTY'),
        connections: [],
        threatLevel: Math.floor(level * (1 + i / roomCount))
      });
    }

    // Connect rooms
    for (let i = 0; i < rooms.length - 1; i++) {
      rooms[i].connections.push(rooms[i+1].id);
      rooms[i+1].connections.push(rooms[i].id);
    }

    return { id: `dungeon_${seed}`, seed, rooms, level };
  }

  private static pseudoRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }
}