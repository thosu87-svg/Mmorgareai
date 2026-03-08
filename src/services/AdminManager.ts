
'use client';
/**
 * @fileOverview Axiom Frontier - Administrative Event & World Management
 * Handles global simulation events, engine control, and world manipulation.
 */

import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp, 
  deleteDoc,
  writeBatch,
  limit,
  orderBy
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { getEffectiveKappa } from '@/lib/math-engine';
import { logAuditAction } from './AdminSecurityManager';

const { firestore: db } = initializeFirebase();

/**
 * Triggers a global economic shock, manipulating all active marketplace listings.
 */
export async function applyEconomicShock(
  adminId: string, 
  magnitude: number, 
  resourceType?: string,
  ipAddress?: string
): Promise<{ affected: number; formula: string }> {
  if (!db) throw new Error('Database unavailable');

  const kappa = getEffectiveKappa();
  const shockMagnitude = Math.max(-0.9, Math.min(10, magnitude || 0.5));
  
  let listingsQuery = query(collection(db, 'marketplace'), where('status', '==', 'ACTIVE'));
  if (resourceType) {
    listingsQuery = query(listingsQuery, where('resourceType', '==', resourceType));
  }

  const snap = await getDocs(listingsQuery);
  const batch = writeBatch(db);
  let affected = 0;

  for (const listingDoc of snap.docs) {
    const data = listingDoc.data();
    const oldPrice = data.pricePerUnit;
    const newPrice = oldPrice * (1 + shockMagnitude / kappa);
    
    batch.update(listingDoc.ref, { pricePerUnit: newPrice });
    
    // Log effect
    const effectRef = doc(collection(db, 'eventEffects'));
    batch.set(effectRef, {
      eventType: 'ECONOMIC_SHOCK',
      targetId: listingDoc.id,
      before: { price: oldPrice },
      after: { price: newPrice },
      timestamp: serverTimestamp()
    });
    
    affected++;
  }

  await batch.commit();
  await logAuditAction(adminId, 'ECONOMIC_SHOCK', 'MARKETPLACE', 'global', 
    { magnitude: shockMagnitude, resourceType, affected }, ipAddress || 'internal');

  return { 
    affected, 
    formula: `Price * (1 + ${shockMagnitude}/${kappa})` 
  };
}

/**
 * Triggers a biome shift in a specific region of the world.
 */
export async function applyBiomeShift(
  adminId: string,
  targetBiome: string,
  eventWeight: number,
  regionX: number,
  regionZ: number,
  radius: number,
  ipAddress?: string
): Promise<{ affected: number }> {
  if (!db) throw new Error('Database unavailable');

  const kappa = getEffectiveKappa();
  const weight = eventWeight || 1.0;

  // Manual radius filter for Firestore (server-side range query approximation)
  const snap = await getDocs(collection(db, 'chunks'));
  const batch = writeBatch(db);
  let affected = 0;

  for (const chunkDoc of snap.docs) {
    const data = chunkDoc.data();
    const dx = Math.abs(data.x - regionX);
    const dz = Math.abs(data.z - regionZ);

    if (dx <= radius && dz <= radius) {
      const oldStability = data.stabilityIndex || 1.0;
      const newStability = Math.min(2.0, oldStability * Math.exp(weight / kappa));
      
      batch.update(chunkDoc.ref, {
        biome: targetBiome,
        stabilityIndex: newStability,
        lastUpdate: serverTimestamp()
      });
      affected++;
    }
  }

  await batch.commit();
  await logAuditAction(adminId, 'BIOME_SHIFT', 'CHUNKS', `region_${regionX}_${regionZ}`, 
    { targetBiome, weight, affected }, ipAddress || 'internal');

  return { affected };
}

/**
 * Creates a new live invasion event.
 */
export async function spawnInvasion(
  adminId: string,
  name: string,
  severity: number,
  targetX: number,
  targetZ: number,
  monsterCount: number,
  ipAddress?: string
): Promise<string> {
  if (!db) throw new Error('Database unavailable');

  const eventRef = doc(collection(db, 'liveEvents'));
  const eventId = eventRef.id;

  await setDoc(eventRef, {
    adminId,
    eventType: 'INVASION',
    name: name || 'Dark Invasion',
    severity: severity || 5,
    parameters: { targetX, targetZ, monsterCount },
    status: 'ACTIVE',
    createdAt: serverTimestamp()
  });

  await logAuditAction(adminId, 'SPAWN_INVASION', 'WORLD', eventId, 
    { severity, targetX, targetZ, monsterCount }, ipAddress || 'internal');

  return eventId;
}

/**
 * Performs an emergency rollback of the simulation to a specific tick.
 */
export async function emergencyRollback(
  adminId: string,
  targetTick: number,
  ipAddress?: string
): Promise<{ success: boolean; message: string }> {
  if (!db) throw new Error('Database unavailable');

  const worldRef = doc(db, 'worldState', 'global');
  const worldSnap = await getDoc(worldRef);
  const currentTick = worldSnap.data()?.tick || 0;

  if (targetTick >= currentTick) {
    throw new Error('Target tick must be in the past');
  }

  // Pause the engine first
  await updateDoc(worldRef, { paused: true, updatedAt: serverTimestamp() });

  // Cleanup future states (Limited to TickState and CombatLogs for MVP)
  const ticksQuery = query(collection(db, 'tickState'), where('tickNumber', '>', targetTick));
  const tickSnap = await getDocs(ticksQuery);
  const batch = writeBatch(db);
  
  tickSnap.forEach(d => batch.delete(d.ref));
  
  // Set world state back to target tick
  batch.update(worldRef, { tick: targetTick });

  await batch.commit();
  await logAuditAction(adminId, 'EMERGENCY_ROLLBACK', 'ENGINE', 'global', 
    { fromTick: currentTick, toTick: targetTick }, ipAddress || 'internal');

  return { success: true, message: `Engine paused and rolled back to tick ${targetTick}.` };
}

/**
 * Injects new lore entries into the world chronicles.
 */
export async function injectLore(
  adminId: string,
  title: string,
  content: string,
  ipAddress?: string
): Promise<void> {
  if (!db) throw new Error('Database unavailable');

  const chronicleRef = doc(collection(db, 'chronicles'));
  await setDoc(chronicleRef, {
    title,
    content,
    notarySeal: true,
    createdAt: serverTimestamp()
  });

  await logAuditAction(adminId, 'INJECT_LORE', 'CHRONICLES', chronicleRef.id, { title }, ipAddress || 'internal');
}
