
'use client';
/**
 * @fileOverview Axiom Frontier - Neural Agent Management
 * Handles batch synchronization of pilot signatures and trust matrices.
 */

import { doc, setDoc, serverTimestamp, CollectionReference, collection } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { withFirestoreTransaction } from './TransactionWrapper';
import { Agent } from '@/types';

const { firestore: db } = initializeFirebase();

/**
 * Synchronizes multiple agents with the Firestore core atomically.
 * Mirroring the SQL 'ON CONFLICT (uid) DO UPDATE' pattern.
 */
export async function syncAgentsBatch(agents: Agent[]): Promise<void> {
  if (!db) return;

  await withFirestoreTransaction(async (transaction) => {
    for (const agent of agents) {
      const agentRef = doc(db, 'players', agent.id);
      transaction.set(agentRef, {
        ...agent,
        lastUpdate: serverTimestamp()
      }, { merge: true });
    }
  });
}

/**
 * Initializes a new neural entity signature.
 */
export async function initializePilot(uid: string, name: string): Promise<void> {
  if (!db) return;

  const agentRef = doc(db, 'players', uid);
  await setDoc(agentRef, {
    id: uid,
    displayName: name,
    npcClass: 'NEURAL_EMERGENT',
    level: 1,
    hp: 100,
    maxHp: 100,
    exp: 0,
    str: 10,
    agi: 10,
    int: 10,
    vit: 10,
    position: { x: 0, y: 0, z: 0 },
    visionRange: 50,
    state: 'IDLE',
    inventory: [],
    dnaHistory: [],
    memoryCache: [],
    awakened: false,
    lastUpdate: serverTimestamp()
  });
}
