
'use client';
/**
 * @fileOverview Axiom Frontier - Matrix Transaction Service
 * Handles energy transfers, balance calculation, and immutable ledger recording.
 */

import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { MatrixTransaction } from '@/types';

const { firestore: db } = initializeFirebase();

/**
 * Records a new transaction in the matrix ledger
 */
export async function recordTransaction(
  fromUid: string | null,
  toUid: string | null,
  txType: string,
  amount: number,
  currency: string,
  description: string,
  tickNumber: number
): Promise<any> {
  if (!db) return null;

  const txData = {
    fromUid,
    toUid,
    txType,
    amount,
    currency,
    description,
    tickNumber,
    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, 'matrixTransactions'), txData);
  return { id: docRef.id, ...txData };
}

/**
 * Calculates the current energy balance for a UID by summing the ledger
 */
export async function getBalance(uid: string): Promise<number> {
  if (!db) return 0;

  // Query incoming transactions
  const qIncoming = query(
    collection(db, 'matrixTransactions'), 
    where('toUid', '==', uid),
    where('currency', '==', 'MATRIX_ENERGY')
  );
  const snapIncoming = await getDocs(qIncoming);
  const inTotal = snapIncoming.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

  // Query outgoing transactions
  const qOutgoing = query(
    collection(db, 'matrixTransactions'), 
    where('fromUid', '==', uid),
    where('currency', '==', 'MATRIX_ENERGY')
  );
  const snapOutgoing = await getDocs(qOutgoing);
  const outTotal = snapOutgoing.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

  // Initial energy grant is 100
  return inTotal - outTotal + 100;
}

/**
 * Transfers matrix energy between two UIDs
 */
export async function transferEnergy(
  fromUid: string, 
  toUid: string,
  amount: number, 
  tickNumber: number
): Promise<{ success: boolean; message: string }> {
  if (!db) return { success: false, message: 'Simulation disconnected' };

  const balance = await getBalance(fromUid);
  if (balance < amount) {
    return { success: false, message: 'Insufficient matrix energy' };
  }

  await recordTransaction(
    fromUid, 
    toUid, 
    'TRANSFER', 
    amount, 
    'MATRIX_ENERGY',
    `Neural transfer: ${fromUid} -> ${toUid}`, 
    tickNumber
  );

  return { success: true, message: `Transferred ${amount} matrix energy` };
}

/**
 * Grants energy rewards to an agent
 */
export async function rewardEnergy(
  toUid: string, 
  amount: number,
  reason: string, 
  tickNumber: number
): Promise<void> {
  await recordTransaction(
    null, 
    toUid, 
    'REWARD', 
    amount, 
    'MATRIX_ENERGY', 
    reason, 
    tickNumber
  );
}

/**
 * Retrieves the transaction history for a specific UID
 */
export async function getTransactionHistory(uid: string, limitCount = 50): Promise<any[]> {
  if (!db) return [];
  
  // Note: Firestore doesn't support 'OR' queries well across fields without multiple indices or client merging
  // For this prototype, we'll fetch incoming and outgoing and merge/sort
  
  const qTo = query(
    collection(db, 'matrixTransactions'), 
    where('toUid', '==', uid), 
    orderBy('createdAt', 'desc'), 
    limit(limitCount)
  );
  const qFrom = query(
    collection(db, 'matrixTransactions'), 
    where('fromUid', '==', uid), 
    orderBy('createdAt', 'desc'), 
    limit(limitCount)
  );

  const [toSnap, fromSnap] = await Promise.all([getDocs(qTo), getDocs(qFrom)]);
  
  const history = [
    ...toSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    ...fromSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  ].sort((a: any, b: any) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));

  return history.slice(0, limitCount);
}
