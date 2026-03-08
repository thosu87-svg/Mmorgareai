'use client';
/**
 * @fileOverview Axiom Frontier - Combat Resolution Service
 * Handles damage calculation and atomic resolution of combat encounters in Firestore.
 */

import { 
  doc, 
  runTransaction, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { CombatResult } from '@/types';

const { firestore: db } = initializeFirebase();

/**
 * Calculates damage based on attacker and defender attributes
 */
function calculateDamage(
  attackerStats: { str: number; agi: number; int: number; level: number },
  defenderStats: { str: number; agi: number; vit: number; level: number }
): { damage: number; isCrit: boolean } {
  const baseDamage = attackerStats.str * 2 + attackerStats.level * 1.5;
  const defense = defenderStats.vit * 1.5 + defenderStats.level;
  const agilityModifier = 1 + (attackerStats.agi - defenderStats.agi) * 0.01;
  const critChance = Math.min(0.3, attackerStats.agi * 0.005);
  const isCrit = Math.random() < critChance;
  const critMultiplier = isCrit ? 2.0 : 1.0;
  const rawDamage = Math.max(1, (baseDamage - defense * 0.5) * agilityModifier * critMultiplier);
  return { damage: Math.floor(rawDamage), isCrit };
}

/**
 * AI logic to determine the best combat action
 */
function determineCombatAction(
  hp: number, maxHp: number, enemyThreat: number
): 'ATTACK' | 'DEFEND' | 'RETREAT' {
  const hpRatio = hp / maxHp;
  if (hpRatio < 0.2) return 'RETREAT';
  if (hpRatio < 0.4 && enemyThreat > 0.6) return 'DEFEND';
  return 'ATTACK';
}

/**
 * Atomically resolves a combat encounter between two entities
 */
export async function resolveCombat(
  attackerUid: string,
  defenderUid: string,
  defenderType: 'AGENT' | 'MONSTER',
  tickNumber: number
): Promise<CombatResult | null> {
  if (!db) return null;

  try {
    return await runTransaction(db, async (transaction) => {
      const attackerRef = doc(db, 'players', attackerUid);
      const attackerSnap = await transaction.get(attackerRef);
      
      if (!attackerSnap.exists()) return null;
      const attacker = attackerSnap.data();

      let defender: any;
      let defenderRef: any;

      if (defenderType === 'AGENT') {
        defenderRef = doc(db, 'players', defenderUid);
        const defenderSnap = await transaction.get(defenderRef);
        if (!defenderSnap.exists()) return null;
        defender = defenderSnap.data();
      } else {
        // Mock generic monster stats
        defender = {
          id: defenderUid,
          level: 1,
          hp: 50,
          maxHp: 50,
          str: 5, agi: 5, int: 3, vit: 5
        };
      }

      const attackerStats = {
        str: (attacker.str || 10) + attacker.level * 2,
        agi: (attacker.agi || 8) + attacker.level,
        int: (attacker.int || 6) + attacker.level,
        level: attacker.level
      };

      const defenderStats = {
        str: defender.str || (8 + defender.level * 2),
        agi: defender.agi || (6 + defender.level),
        int: defender.int || (5 + defender.level),
        vit: defender.vit || (8 + defender.level),
        level: defender.level
      };

      const action = determineCombatAction(
        attacker.hp, 
        attacker.maxHp, 
        defender.level / (attacker.level + 1)
      );

      let damageDealt = 0;
      let damageReceived = 0;
      let result = 'CONTINUE';
      const skillUsed = action;

      if (action === 'ATTACK') {
        const { damage } = calculateDamage(attackerStats, defenderStats);
        damageDealt = damage;

        const counterDamage = calculateDamage(defenderStats, {
          str: attackerStats.str, agi: attackerStats.agi,
          vit: 8 + attacker.level, level: attacker.level
        });
        damageReceived = Math.floor(counterDamage.damage * 0.6);
      } else if (action === 'DEFEND') {
        const counterDamage = calculateDamage(defenderStats, {
          str: attackerStats.str, agi: attackerStats.agi,
          vit: 8 + attacker.level, level: attacker.level
        });
        damageReceived = Math.floor(counterDamage.damage * 0.3);
      } else {
        result = 'RETREAT';
      }

      const newAttackerHp = Math.max(0, attacker.hp - damageReceived);
      const newDefenderHp = Math.max(0, (defender.hp || 50) - damageDealt);

      if (newDefenderHp <= 0) result = 'VICTORY';
      else if (newAttackerHp <= 0) result = 'DEFEAT';

      // Apply updates
      transaction.update(attackerRef, { 
        hp: newAttackerHp, 
        lastUpdate: serverTimestamp() 
      });

      if (defenderType === 'AGENT' && defenderRef) {
        transaction.update(defenderRef, { 
          hp: newDefenderHp, 
          lastUpdate: serverTimestamp() 
        });
      }

      const combatResult: CombatResult = {
        attackerUid,
        defenderUid,
        defenderType,
        damageDealt,
        damageReceived,
        skillUsed,
        result,
        lootDropped: []
      };

      // Log the combat event
      const logRef = doc(collection(db, 'combatLogs'));
      transaction.set(logRef, {
        ...combatResult,
        tickNumber,
        createdAt: serverTimestamp()
      });

      return combatResult;
    });
  } catch (error) {
    console.error("Combat resolution failed:", error);
    return null;
  }
}

/**
 * Retrieves the most recent combat logs
 */
export async function getCombatLogs(logsLimit = 50): Promise<any[]> {
  if (!db) return [];
  const logsQuery = query(
    collection(db, 'combatLogs'), 
    orderBy('createdAt', 'desc'), 
    limit(logsLimit)
  );
  const snap = await getDocs(logsQuery);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
