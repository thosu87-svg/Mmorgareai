'use client';
/**
 * @fileOverview Axiom Frontier - Autonome Wirtschafts-Engine (Master Plan)
 * Implementiert Preisbildung basierend auf Lagerbeständen und Nachfrage.
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp, 
  runTransaction
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const { firestore: db } = initializeFirebase();

/**
 * Wirtschafts-Formel (Autonom laut Master Plan):
 * Preis = Basispreis * (Nachfrage / Lagerbestand)
 */
export async function calculateMarketPrice(item: string, basePrice: number = 10): Promise<number> {
  if (!db) return basePrice;

  const econRef = doc(db, 'worldState', 'economy');
  const snap = await getDoc(econRef);
  const data = snap.exists() ? snap.data() : { stock: {}, demand: {} };

  const stock = data.stock?.[item] || 100;
  const demand = data.demand?.[item] || 100;

  // Formel: Preis = 10 * (demand / stock)
  const price = basePrice * (demand / stock);
  return Math.max(1, Math.round(price * 100) / 100);
}

/**
 * Aktualisiert die globalen Marktbestände
 */
export async function updateMarketStock(item: string, delta: number) {
  if (!db) return;

  await runTransaction(db, async (transaction) => {
    const econRef = doc(db, 'worldState', 'economy');
    const snap = await transaction.get(econRef);
    const data = snap.exists() ? snap.data() : { stock: {}, demand: {} };

    const currentStock = data.stock?.[item] || 100;
    const newStock = Math.max(1, currentStock + delta);

    transaction.set(econRef, {
      stock: { ...data.stock, [item]: newStock },
      updatedAt: serverTimestamp()
    }, { merge: true });
  });
}

export const EconomyManager = {
  calculateMarketPrice,
  updateMarketStock
};
