import { Chunk, POI, Monster, ResourceNode, MONSTER_TEMPLATES } from '../types';

/**
 * WorldBuildingService
 * Generates procedural content based on "Axiom Frontier" high-performance mathematical vision.
 * Supports Data Plains, Crystal Forest, Tech Ruins, and Energy Fields.
 */
export class WorldBuildingService {
  /**
   * Generates dense cities, active monsters, and resource fields based on biomes.
   */
  static generateAxiomaticContent(chunk: Chunk) {
    if (!chunk) return { pois: [], monsters: [], resources: [] };

    const pois: POI[] = [];
    const monsters: Monster[] = [];
    const resources: ResourceNode[] = [];

    const seed = chunk.seed || (chunk.x * 1337 + chunk.z * 7331);
    const chunkOffsetX = chunk.x * 400;
    const chunkOffsetZ = chunk.z * 400;

    const pseudoRandom = (offset: number) => {
      const x = Math.sin(seed + offset) * 10000;
      return x - Math.floor(x);
    };

    // 1. POI Manifestation based on vision
    if (chunk.biome === 'CITY' || chunk.biome === 'PLAINS') {
      // Main Spire
      pois.push({
        id: `spire-${chunk.id}`,
        type: 'BUILDING',
        position: [chunkOffsetX, 0, chunkOffsetZ],
        rotationY: 0,
        isDiscovered: true
      });

      // Data Pylons
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        pois.push({
          id: `pylon-${chunk.id}-${i}`,
          type: 'BUILDING',
          position: [
            chunkOffsetX + Math.cos(angle) * 100,
            0,
            chunkOffsetZ + Math.sin(angle) * 100
          ],
          rotationY: angle,
          isDiscovered: true
        });
      }
    } else if (chunk.biome === 'FOREST') {
      // Crystal Trees
      for (let i = 0; i < 15; i++) {
        const angle = pseudoRandom(i) * Math.PI * 2;
        const dist = 50 + pseudoRandom(i * 2) * 120;
        pois.push({
          id: `tree-${chunk.id}-${i}`,
          type: 'TREE',
          position: [
            chunkOffsetX + Math.cos(angle) * dist,
            0,
            chunkOffsetZ + Math.sin(angle) * dist
          ],
          rotationY: pseudoRandom(i * 3) * Math.PI,
          isDiscovered: true
        });
      }
    } else if (chunk.biome === 'MOUNTAIN') {
      // Iron Formations
      for (let i = 0; i < 8; i++) {
        const x = (pseudoRandom(i) - 0.5) * 300;
        const z = (pseudoRandom(i + 1) - 0.5) * 300;
        pois.push({
          id: `iron-${chunk.id}-${i}`,
          type: 'MINE',
          position: [chunkOffsetX + x, 0, chunkOffsetZ + z],
          isDiscovered: true
        });
      }
    }

    // 2. Resource Manifestation (Distance-based density)
    const distToCenter = Math.hypot(chunk.x, chunk.z);
    const densityMult = 1 + (distToCenter / 5); 
    
    const resTypes = ['IRON_ORE', 'GOLD_ORE', 'LOGIC_NODE'];
    const nodeCount = Math.floor((5 + pseudoRandom(10) * 10) * densityMult);
    
    for (let i = 0; i < nodeCount; i++) {
      const type = resTypes[Math.floor(pseudoRandom(i + 20) * resTypes.length)];
      resources.push({
        id: `res-${chunk.id}-${i}`,
        type,
        position: [
          chunkOffsetX + (pseudoRandom(i + 30) - 0.5) * 350,
          0.8,
          chunkOffsetZ + (pseudoRandom(i + 40) - 0.5) * 350
        ],
        amount: 100
      });
    }

    // 3. Autonomous Life
    const lifeCount = chunk.biome === 'CITY' ? 6 : 3;
    for (let i = 0; i < lifeCount; i++) {
      const type = pseudoRandom(i + 50) > 0.8 ? 'DRAGON' : (pseudoRandom(i + 51) > 0.5 ? 'ORC' : 'GOBLIN');
      monsters.push({
        id: `mob-${chunk.id}-${i}`,
        type,
        name: chunk.biome === 'CITY' ? `City Watch ${i+1}` : `${type} Stalker`,
        position: [
          chunkOffsetX + (pseudoRandom(i + 60) - 0.5) * 300,
          0,
          chunkOffsetZ + (pseudoRandom(i + 70) - 0.5) * 300
        ],
        rotationY: pseudoRandom(i + 80) * Math.PI * 2,
        stats: MONSTER_TEMPLATES[type as keyof typeof MONSTER_TEMPLATES],
        xpReward: 100,
        state: 'IDLE',
        color: type === 'DRAGON' ? '#ff4d4d' : '#7b4fd4',
        scale: type === 'DRAGON' ? 5.0 : 1.2,
        targetId: null
      });
    }

    return { pois, monsters, resources };
  }
}