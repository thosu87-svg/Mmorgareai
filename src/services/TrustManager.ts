
'use client';
/**
 * @fileOverview Axiom Frontier - Trust & Relationship Management Service
 * Implements peer-to-peer relationship tracking with deterministic decay.
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
  runTransaction,
  orderBy,
  limit
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { trustScore, getEffectiveKappa } from '@/lib/math-engine';
import { TrustContext, TrustRecord, TrustEffect } from '@/types';

const { firestore: db } = initializeFirebase();

const TRUST_DELTAS: Record<TrustContext, { positive: number; negative: number }> = {
  COMBAT_ATTACK:   { positive: 0, negative: 1 },
  COMBAT_KILL:     { positive: 0, negative: 3 },
  TRADE:           { positive: 1, negative: 0 },
  QUEST_TOGETHER:  { positive: 2, negative: 0 },
  GUILD_JOIN:      { positive: 3, negative: 0 },
  BETRAYAL:        { positive: 0, negative: 5 },
  HEAL:            { positive: 2, negative: 0 },
  GIFT:            { positive: 1, negative: 0 },
};

/**
 * Calculates behavioral modifiers based on current trust score.
 */
export function applyTrustEffects(score: number): TrustEffect {
  const kappa = getEffectiveKappa();
  // Normalise score against a fraction of Kappa
  const normalised = Math.max(-1, Math.min(1, score / (kappa * 0.01)));

  if (normalised >= 0.6) {
    return { tradePriceModifier: 0.85, combatAggressionModifier: 0.5, questRewardModifier: 1.2, label: 'TRUSTED_ALLY' };
  } else if (normalised >= 0.2) {
    return { tradePriceModifier: 0.95, combatAggressionModifier: 0.8, questRewardModifier: 1.1, label: 'FRIENDLY' };
  } else if (normalised >= -0.2) {
    return { tradePriceModifier: 1.0, combatAggressionModifier: 1.0, questRewardModifier: 1.0, label: 'NEUTRAL' };
  } else if (normalised >= -0.6) {
    return { tradePriceModifier: 1.15, combatAggressionModifier: 1.3, questRewardModifier: 0.9, label: 'DISTRUSTED' };
  } else {
    return { tradePriceModifier: 1.3, combatAggressionModifier: 1.6, questRewardModifier: 0.75, label: 'ENEMY' };
  }
}

/**
 * Updates the trust relationship between two agents atomically.
 */
export async function updateTrust(
  agentAId: string,
  agentBId: string,
  context: TrustContext,
  currentTick: number
): Promise<{ trustScore: number; effect: TrustEffect } | null> {
  if (!db) return null;

  const delta = TRUST_DELTAS[context];
  const relationshipId = `${agentAId}_${agentBId}`;
  const trustRef = doc(db, 'trustRelationships', relationshipId);

  try {
    return await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(trustRef);
      const data = snap.exists() ? snap.data() as TrustRecord : {
        agentAId,
        agentBId,
        positiveInteractions: 0,
        negativeInteractions: 0,
        lastInteractionTick: currentTick,
        lastInteractionType: 'NEUTRAL' as const,
        trustScore: 0,
        reputationWeight: 0
      };

      const newPos = data.positiveInteractions + delta.positive;
      const newNeg = data.negativeInteractions + delta.negative;
      const ticksSinceLast = Math.max(0, currentTick - data.lastInteractionTick);

      const score = trustScore(
        newPos,
        newNeg,
        ticksSinceLast,
        data.reputationWeight
      );

      const updatedRecord: TrustRecord = {
        ...data,
        positiveInteractions: newPos,
        negativeInteractions: newNeg,
        lastInteractionTick: currentTick,
        lastInteractionType: context,
        trustScore: score,
        updatedAt: serverTimestamp()
      };

      transaction.set(trustRef, updatedRecord, { merge: true });

      return { trustScore: score, effect: applyTrustEffects(score) };
    });
  } catch (e) {
    console.error('[TRUST_ERROR] Atomic update failed:', e);
    return null;
  }
}

/**
 * Fetches the current trust score and effects for a pair of agents.
 */
export async function getTrustScore(
  agentAId: string,
  agentBId: string,
  currentTick: number
): Promise<{ score: number; effect: TrustEffect }> {
  if (!db) return { score: 0, effect: applyTrustEffects(0) };

  const relationshipId = `${agentAId}_${agentBId}`;
  const snap = await getDoc(doc(db, 'trustRelationships', relationshipId));

  if (!snap.exists()) {
    return { score: 0, effect: applyTrustEffects(0) };
  }

  const data = snap.data() as TrustRecord;
  const ticksSinceLast = Math.max(0, currentTick - data.lastInteractionTick);
  
  const score = trustScore(
    data.positiveInteractions,
    data.negativeInteractions,
    ticksSinceLast,
    data.reputationWeight
  );

  return { score, effect: applyTrustEffects(score) };
}

/**
 * Retrieves the full trust matrix for a specific agent.
 */
export async function getTrustMap(
  agentId: string,
  currentTick: number
): Promise<Array<TrustRecord & { effect: TrustEffect }>> {
  if (!db) return [];

  // Query relationships where agentId is participant A
  const q = query(
    collection(db, 'trustRelationships'),
    where('agentAId', '==', agentId),
    orderBy('trustScore', 'desc'),
    limit(100)
  );

  const snap = await getDocs(q);
  return snap.docs.map(doc => {
    const data = doc.data() as TrustRecord;
    const ticksSinceLast = Math.max(0, currentTick - data.lastInteractionTick);
    const score = trustScore(
      data.positiveInteractions,
      data.negativeInteractions,
      ticksSinceLast,
      data.reputationWeight
    );
    return {
      ...data,
      trustScore: score,
      effect: applyTrustEffects(score)
    };
  });
}

/**
 * Sets a manual reputation weight (e.g. from faction status).
 */
export async function setReputationWeight(
  agentAId: string,
  agentBId: string,
  weight: number
): Promise<void> {
  if (!db) return;
  const relationshipId = `${agentAId}_${agentBId}`;
  await setDoc(doc(db, 'trustRelationships', relationshipId), {
    agentAId,
    agentBId,
    reputationWeight: weight,
    updatedAt: serverTimestamp()
  }, { merge: true });
}
