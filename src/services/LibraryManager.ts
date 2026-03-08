'use client';
/**
 * @fileOverview Axiom Asset Library (AAL) Manager
 * Implements the Model-First Workflow using JSON-driven library assets.
 */

import { initializeFirebase } from '@/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const { firestore: db } = initializeFirebase();

export type AssetType = 'model' | 'audio' | 'image';

export interface LibraryAsset {
  id: string;
  name: string;
  description: string;
  type: AssetType;
  asset: {
    type?: string;
    url?: string | null;
    assetId?: string | null;
    isSolid?: boolean;
    isTrigger?: boolean;
    animations?: {
      list: Array<{ id: string; name: string; glb: string; speed: number }>;
      defaultState: string;
      fadeTime: number;
    } | null;
    offset: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    tags: string[];
    audio?: string;
    image?: string;
  };
}

class LibraryManager {
  private assets: Map<string, LibraryAsset> = new Map();
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined' || !db) return;

    // Real-time synchronization with the library registry
    onSnapshot(collection(db, 'libraryAssets'), (snap) => {
      snap.docs.forEach(doc => {
        this.assets.set(doc.id, { id: doc.id, ...doc.data() } as LibraryAsset);
      });
      this.notify();
    });
  }

  getAsset(id: string): LibraryAsset | undefined {
    return this.assets.get(id);
  }

  getAssetsByType(type: AssetType): LibraryAsset[] {
    return Array.from(this.assets.values()).filter(a => a.type === type);
  }

  subscribe(cb: () => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }
}

export const libraryManager = new LibraryManager();