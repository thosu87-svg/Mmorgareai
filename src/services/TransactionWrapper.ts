
'use client';
/**
 * @fileOverview Axiom Frontier - Firestore Transaction Wrapper
 * Provides an atomic wrapper for multi-document operations, mirroring the pg withTransaction pattern.
 */

import { runTransaction, Transaction, Firestore } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const { firestore: db } = initializeFirebase();

/**
 * Executes a function within a Firestore transaction.
 * @template T The return type of the function.
 * @param fn The function to execute within the transaction.
 * @returns A promise that resolves with the result of the function.
 */
export async function withFirestoreTransaction<T>(
  fn: (transaction: Transaction) => Promise<T>
): Promise<T> {
  if (!db) {
    throw new Error('Simulation disconnected: Firestore not available.');
  }

  try {
    return await runTransaction(db, async (transaction) => {
      return await fn(transaction);
    });
  } catch (error: any) {
    console.error('[TRANSACTION_FAILURE] Rolling back simulation cycle:', error.message);
    throw error;
  }
}
