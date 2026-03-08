'use client';
/**
 * @fileOverview Ouroboros Neural Texture Engine - Pro Edition
 * Handles unlimited active texture pools with deterministic selection.
 * Includes Internal Emergency Protocols (Baked-in textures).
 */

import * as THREE from 'three';
import { collection, onSnapshot } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const { firestore: db } = initializeFirebase();

// Emergency Protocols: High-quality tech-grid patterns (Data URIs for instant visibility)
const INTERNAL_TECH_GRID = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAQMAAACQX01BAAAABlBMVEUAAAD///+l2Z/dAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5wgKCQYdBZ8yFAAAADFJREFUKM9jYGBgYWBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGAEAAChAFH/v8MAAAAASUVORK5CYII=";
const INTERNAL_BIO_PATTERN = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAQMAAACQX01BAAAABlBMVEUAAAD///+l2Z/dAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5wgKCQYdBZ8yFAAAADFJREFUKM9jYGBgYWBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGAEAAChAFH/v8MAAAAASUVORK5CYII=";

export type TextureCategory = 'TERRAIN' | 'ARCHITECTURE' | 'CHARACTER' | 'UI' | 'VFX' | 'UNKNOWN';

export interface TextureSignature {
  id: string;
  name: string;
  url: string;
  category: TextureCategory;
  tags: string[];
  isActive: boolean;
  lastUpdate: number;
}

class TextureEngine {
  private loader = new THREE.TextureLoader();
  private registry: Map<string, TextureSignature> = new Map();
  private cache: Map<string, THREE.Texture> = new Map();
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  private async init() {
    if (typeof window === 'undefined') return;

    // Load internal fallbacks first to ensure the world is never empty/black
    this.addInternalTexture('INTERNAL_TERRAIN_GRID', 'Axiom Grid', INTERNAL_TECH_GRID, 'TERRAIN');
    this.addInternalTexture('INTERNAL_ARCH_CORE', 'Axiom Core', INTERNAL_BIO_PATTERN, 'ARCHITECTURE');

    if (db) {
      onSnapshot(collection(db, 'worldAssets'), (snap) => {
        snap.docs.forEach(doc => {
          const data = doc.data();
          this.registry.set(doc.id, {
            id: doc.id,
            name: data.name || 'Unnamed_Asset',
            url: data.url || '',
            category: data.category as TextureCategory,
            tags: data.tags || [],
            isActive: data.isActive || false,
            lastUpdate: data.createdAt?.toMillis() || Date.now()
          });
        });
        this.notify();
      });
    }
  }

  private addInternalTexture(id: string, name: string, url: string, category: TextureCategory) {
    this.registry.set(id, {
      id, name, url, category, tags: ['INTERNAL'], isActive: true, lastUpdate: Date.now()
    });
  }

  async getTexture(id: string): Promise<THREE.Texture | null> {
    const sig = this.registry.get(id);
    if (!sig) return null;
    if (this.cache.has(sig.url)) return this.cache.get(sig.url)!;

    return new Promise((resolve) => {
      this.loader.load(sig.url, (tex) => {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.anisotropy = 16;
        this.cache.set(sig.url, tex);
        resolve(tex);
      }, undefined, () => resolve(null));
    });
  }

  /**
   * Returns a deterministically picked texture from the active pool.
   * Prioritizes internal fallbacks if no assets are found in DB.
   */
  async getProceduralTexture(cat: TextureCategory, seed: number): Promise<THREE.Texture | null> {
    let pool = Array.from(this.registry.values()).filter(s => s.category === cat && s.isActive);
    
    // If empty pool, force internal fallbacks
    if (pool.length === 0) {
      pool = Array.from(this.registry.values()).filter(s => s.tags.includes('INTERNAL') && s.category === cat);
    }

    if (pool.length === 0) return null;
    
    const index = Math.abs(seed) % pool.length;
    return this.getTexture(pool[index].id);
  }

  getSortedRegistry(): Record<TextureCategory, TextureSignature[]> {
    const res: Record<TextureCategory, TextureSignature[]> = {
      TERRAIN: [], ARCHITECTURE: [], CHARACTER: [], UI: [], VFX: [], UNKNOWN: []
    };
    this.registry.forEach(s => res[s.category]?.push(s));
    return res;
  }

  subscribe(cb: () => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }
}

export const textureEngine = new TextureEngine();