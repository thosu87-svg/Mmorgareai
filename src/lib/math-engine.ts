/**
 * @fileOverview Axiom Frontier - Deterministic Math Engine
 * Based on KAPPA = 1000 and the 5 Core Axioms.
 */

export const KAPPA = 1000;

export interface ChunkData {
  id: string;
  x: number;
  z: number;
  seed: number;
  biome: string;
  resources: Record<string, number>;
  fieldString: string;
}

export const Axioms = {
  Continuity: (x: number, z: number) => Math.sin(x / KAPPA) + Math.cos(z / KAPPA),
  ResourceDensity: (x: number, z: number) => (Math.abs(x) + Math.abs(z)) % 100,
  Connectivity: (x: number, z: number) => (x + z) % 2 === 0 ? "path" : "wall",
  Complexity: (x: number, z: number) => Math.sqrt(x * x + z * z) / KAPPA,
  Determinism: (seed: number, x: number, z: number) => (x * 31 + z * 37 + seed) % 1000,
};

export function generateChunk(x: number, z: number, seed: number): ChunkData {
  const continuity = Axioms.Continuity(x, z);
  const resourceDensity = Axioms.ResourceDensity(x, z);
  const connectivity = Axioms.Connectivity(x, z);
  const complexity = Axioms.Complexity(x, z);
  const determinism = Axioms.Determinism(seed, x, z);

  // Field Theory Logic: Constructing the logical chunk string
  const fieldString = `F:${continuity.toFixed(2)}|R:${resourceDensity}|C:${connectivity}|X:${complexity.toFixed(2)}|D:${determinism}`;

  return {
    id: `${x}:${z}`,
    x,
    z,
    seed,
    biome: continuity > 0 ? "forest" : "desert",
    resources: {
      gold: resourceDensity > 80 ? 10 : 0,
      wood: continuity > 0 ? 5 : 1,
    },
    fieldString,
  };
}
