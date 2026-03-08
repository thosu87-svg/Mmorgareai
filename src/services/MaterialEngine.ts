'use client';
/**
 * @fileOverview Axiom Frontier - JSON-driven Material Engine (Three.js)
 * Handles texture presets, UV scaling based on mesh size, and box UV correction.
 */

import * as THREE from 'three';
import { resolveToLocal } from './AssetResolver';

interface MaterialPreset {
  diffuseTexture: string;
  bumpTexture?: string;
  diffuseColor?: string;
  specularColor?: string;
  tilesPerUnit: number;
}

const PRESETS: Record<string, MaterialPreset> = {
  'BRICK': {
    diffuseTexture: 'https://picsum.photos/seed/brick/512/512',
    diffuseColor: '#ffffff',
    specularColor: '#333333',
    tilesPerUnit: 0.5
  },
  'GRASS': {
    diffuseTexture: 'https://picsum.photos/seed/grass/512/512',
    diffuseColor: '#ffffff',
    tilesPerUnit: 0.2
  },
  'TECH_PANEL': {
    diffuseTexture: 'https://picsum.photos/seed/tech/512/512',
    diffuseColor: '#8888ff',
    tilesPerUnit: 1.0
  }
};

export class MaterialEngine {
  private loader = new THREE.TextureLoader();
  private cache = new Map<string, THREE.Texture>();

  /**
   * Applies a material preset to a Three.js mesh.
   */
  async applyPreset(presetId: string, mesh: THREE.Mesh, options: { width?: number, height?: number } = {}) {
    const preset = PRESETS[presetId];
    if (!preset) return;

    const textureUrl = resolveToLocal(preset.diffuseTexture, 'textures') || preset.diffuseTexture;
    const texture = await this.loadTexture(textureUrl);
    
    // Auto UV Scaling
    if (mesh.geometry.boundingBox === null) mesh.geometry.computeBoundingBox();
    const box = mesh.geometry.boundingBox!;
    const width = options.width || (box.max.x - box.min.x);
    const height = options.height || (box.max.z - box.min.z);
    
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(width * preset.tilesPerUnit, height * preset.tilesPerUnit);

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      color: preset.diffuseColor ? new THREE.Color(preset.diffuseColor) : undefined,
      roughness: 0.7,
      metalness: 0.2
    });

    mesh.material = material;
  }

  private loadTexture(url: string): Promise<THREE.Texture> {
    if (this.cache.has(url)) return Promise.resolve(this.cache.get(url)!);
    return new Promise((resolve) => {
      this.loader.load(url, (tex) => {
        this.cache.set(url, tex);
        resolve(tex);
      });
    });
  }
}

export const materialEngine = new MaterialEngine();