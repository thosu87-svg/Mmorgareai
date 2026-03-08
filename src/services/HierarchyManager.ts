
'use client';
/**
 * @fileOverview Axiom Frontier - Hierarchy & Faction Management Service
 * Handles faction creation, member scaling, and infrastructure progression.
 */

import { 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  serverTimestamp, 
  runTransaction 
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { Faction } from '@/types';

const { firestore: db } = initializeFirebase();

const INFRASTRUCTURE_UNLOCKS: Record<number, string[]> = {
  1: ['CAMPFIRE', 'TENT'],
  3: ['WORKSHOP', 'WATCHTOWER'],
  5: ['FORGE', 'MARKET_STALL'],
  8: ['BARRACKS', 'LIBRARY'],
  10: ['CASTLE', 'CATHEDRAL'],
  15: ['ACADEMY', 'GRAND_MARKET'],
  20: ['CITADEL', 'PORTAL_GATE']
};

/**
 * Calculates hierarchy level based on member count
 */
function calculateHierarchyLevel(memberCount: number): number {
  if (memberCount >= 50) return 20;
  if (memberCount >= 30) return 15;
  if (memberCount >= 20) return 10;
  if (memberCount >= 12) return 8;
  if (memberCount >= 8) return 5;
  if (memberCount >= 5) return 3;
  return 1;
}

/**
 * Gets building unlocks for a specific faction level
 */
export function getUnlockedInfrastructure(level: number): string[] {
  const unlocked: string[] = [];
  for (const [reqLevel, items] of Object.entries(INFRASTRUCTURE_UNLOCKS)) {
    if (level >= parseInt(reqLevel)) {
      unlocked.push(...items);
    }
  }
  return unlocked;
}

/**
 * Creates a new player faction
 */
export async function createHierarchyEntity(
  name: string, 
  entityType: 'GUILD' | 'NATION' | 'CULT', 
  leaderUid: string
): Promise<any> {
  if (!db) return null;

  const factionRef = doc(collection(db, 'factions'));
  const initialData = {
    name,
    entityType,
    leaderUid,
    members: [leaderUid],
    level: 1,
    influence: 10,
    territory: [],
    infrastructure: getUnlockedInfrastructure(1),
    createdAt: serverTimestamp(),
    lastUpdate: serverTimestamp()
  };

  await setDoc(factionRef, initialData);
  return { id: factionRef.id, ...initialData };
}

/**
 * Adds a member to a faction atomically
 */
export async function addMember(factionId: string, memberUid: string): Promise<boolean> {
  if (!db) return false;

  try {
    return await runTransaction(db, async (transaction) => {
      const factionRef = doc(db, 'factions', factionId);
      const snap = await transaction.get(factionRef);
      
      if (!snap.exists()) return false;
      const data = snap.data() as Faction;

      const members = data.members || [];
      if (members.includes(memberUid)) return true;

      const newMembers = [...members, memberUid];
      const newLevel = calculateHierarchyLevel(newMembers.length);
      const newInfluence = newMembers.length * 10 + newLevel * 25;
      const newInfra = getUnlockedInfrastructure(newLevel);

      transaction.update(factionRef, {
        members: newMembers,
        level: newLevel,
        influence: newInfluence,
        infrastructure: newInfra,
        lastUpdate: serverTimestamp()
      });

      return true;
    });
  } catch (e) {
    console.error("Failed to add faction member:", e);
    return false;
  }
}

/**
 * Retrieves all factions ordered by global influence
 */
export async function getHierarchyEntities(): Promise<any[]> {
  if (!db) return [];
  const q = query(collection(db, 'factions'), orderBy('influence', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Validates hierarchy status and unlocks
 */
export async function validateHierarchy(factionId: string): Promise<{
  valid: boolean;
  level: number;
  infrastructure: string[];
  memberCount: number;
}> {
  if (!db) return { valid: false, level: 0, infrastructure: [], memberCount: 0 };

  const factionRef = doc(db, 'factions', factionId);
  const snap = await getDoc(factionRef);

  if (!snap.exists()) {
    return { valid: false, level: 0, infrastructure: [], memberCount: 0 };
  }

  const data = snap.data() as Faction;
  return {
    valid: true,
    level: data.level,
    infrastructure: data.infrastructure || [],
    memberCount: (data.members || []).length
  };
}
