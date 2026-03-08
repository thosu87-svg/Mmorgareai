
'use client';
/**
 * @fileOverview Axiom Frontier - Quest Management Service
 * Handles persistence for quest lines and NPC dialog trees in Firestore.
 */

import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { QuestLine, NPCDialog } from '@/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

const { firestore: db } = initializeFirebase();

export const QuestManager = {
  /**
   * Creates a new quest line.
   */
  async createQuest(data: Partial<QuestLine>, adminId: string): Promise<void> {
    if (!db) throw new Error('Database disconnected');
    const questRef = collection(db, 'questLines');
    
    try {
      await addDoc(questRef, {
        ...data,
        createdBy: adminId,
        createdAt: serverTimestamp(),
        status: data.status || 'draft'
      });
    } catch (serverError: any) {
      const permissionError = new FirestorePermissionError({
        path: 'questLines',
        operation: 'create',
        requestResourceData: data,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    }
  },

  /**
   * Retrieves quest lines based on status.
   */
  async getQuests(status?: string, limitCount = 50): Promise<QuestLine[]> {
    if (!db) return [];
    let q = query(collection(db, 'questLines'), orderBy('createdAt', 'desc'), limit(limitCount));
    if (status) {
      q = query(q, where('status', '==', status));
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as QuestLine));
  },

  /**
   * Updates an existing quest line.
   */
  async updateQuest(id: string, data: Partial<QuestLine>): Promise<void> {
    if (!db) return;
    const docRef = doc(db, 'questLines', id);
    try {
      await updateDoc(docRef, { ...data, lastUpdate: serverTimestamp() });
    } catch (serverError: any) {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: data,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    }
  },

  /**
   * Deletes a quest line.
   */
  async deleteQuest(id: string): Promise<void> {
    if (!db) return;
    const docRef = doc(db, 'questLines', id);
    try {
      await deleteDoc(docRef);
    } catch (serverError: any) {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    }
  },

  /**
   * Adds a dialog entry to a quest.
   */
  async createDialog(questId: string, data: Partial<NPCDialog>): Promise<void> {
    if (!db) throw new Error('Database disconnected');
    const dialogRef = collection(db, 'npcDialogs');
    try {
      await addDoc(dialogRef, {
        ...data,
        questLineId: questId,
        createdAt: serverTimestamp()
      });
    } catch (serverError: any) {
      const permissionError = new FirestorePermissionError({
        path: 'npcDialogs',
        operation: 'create',
        requestResourceData: data,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    }
  },

  /**
   * Retrieves all dialogs for a specific quest.
   */
  async getDialogs(questId: string): Promise<NPCDialog[]> {
    if (!db) return [];
    const q = query(
      collection(db, 'npcDialogs'), 
      where('questLineId', '==', questId),
      orderBy('createdAt', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as NPCDialog));
  },

  /**
   * Returns quests available for a specific player level.
   */
  async getAvailableQuests(playerLevel: number): Promise<QuestLine[]> {
    if (!db) return [];
    const q = query(
      collection(db, 'questLines'),
      where('status', '==', 'active'),
      where('requiredLevel', '<=', playerLevel),
      orderBy('requiredLevel', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as QuestLine));
  }
};
