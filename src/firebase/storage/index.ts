'use client';
/**
 * @fileOverview Firebase Storage Utilities for Axiom Frontier
 */

import { ref, getDownloadURL } from 'firebase/storage';
import { initializeFirebase } from '@/firebase';

/**
 * storage_get_object_download_url
 * Retrieves a persistent signed URL for a storage object.
 * @param path The full path to the object in the storage bucket (e.g. 'textures/concrete.jpg')
 */
export async function storage_get_object_download_url(path: string): Promise<string> {
  const { storage } = initializeFirebase();
  const storageRef = ref(storage, path);
  try {
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error(`[STORAGE_ERROR] Failed to fetch URL for path: ${path}`, error);
    throw error;
  }
}
