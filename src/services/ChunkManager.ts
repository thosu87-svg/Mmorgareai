'use client';
/**
 * @fileOverview Axiom Frontier - Chunk Management Service
 * Handles the loading and persistence of world chunks in Firestore.
 */

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { generateChunk, ChunkData } from '@/lib/math-engine';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const { firestore: db } = initializeFirebase();

/**
 * Retrieves a chunk from Firestore or generates it locally if missing.
 */
export async function getChunk(x: number, z: number, seed: number): Promise<ChunkData> {
  const chunkId = `${x}_${z}`;
  
  if (!db) {
    console.warn("Firebase unavailable, falling back to local generation.");
    return generateChunk(x, z, seed);
  }

  const docRef = doc(db, 'chunks', chunkId);

  try {
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as ChunkData;
    } else {
      const newChunk = generateChunk(x, z, seed);
      
      // Non-blocking save
      setDoc(docRef, {
        ...newChunk,
        lastUpdate: serverTimestamp()
      }, { merge: true }).catch(err => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'create',
          requestResourceData: newChunk
        }));
      });

      return newChunk;
    }
  } catch (error) {
    console.warn("Error accessing Firestore, falling back to local generation.");
    return generateChunk(x, z, seed);
  }
}
