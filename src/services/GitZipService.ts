
'use client';
/**
 * @fileOverview Ouroboros Git ZIP Extraction Service
 * Fetches and extracts textures/models from remote ZIP archives (GitHub/GitLab).
 */

import JSZip from 'jszip';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const { firestore: db } = initializeFirebase();

export type ManifestResult = {
  successCount: number;
  errors: string[];
};

export class GitZipService {
  /**
   * Fetches a ZIP from a URL and manifests its contents into the Asset Hub.
   */
  static async manifestFromUrl(url: string, categorize: (name: string) => string): Promise<ManifestResult> {
    if (!db) throw new Error('Simulation database disconnected.');

    const result: ManifestResult = { successCount: 0, errors: [] };

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      
      const blob = await response.blob();
      const zip = new JSZip();
      const content = await zip.loadAsync(blob);

      for (const [filename, zipEntry] of Object.entries(content.files)) {
        if (zipEntry.dir) continue;
        
        const isImage = /\.(jpg|jpeg|png|webp)$/i.test(filename);
        if (isImage) {
          try {
            const fileBlob = await zipEntry.async("blob");
            const reader = new FileReader();
            
            await new Promise((resolve, reject) => {
              reader.onloadend = async () => {
                const base64 = reader.result as string;
                const name = filename.split('/').pop() || 'unnamed';
                
                try {
                  await addDoc(collection(db!, 'worldAssets'), {
                    name,
                    url: base64,
                    category: categorize(name),
                    tags: ['git_extract', url.includes('github') ? 'github' : 'remote'],
                    isActive: false,
                    createdAt: serverTimestamp()
                  });
                  result.successCount++;
                  resolve(null);
                } catch (err: any) {
                  result.errors.push(`Firestore Error [${name}]: ${err.message}`);
                  reject(err);
                }
              };
              reader.readAsDataURL(fileBlob);
            });
          } catch (e: any) {
            result.errors.push(`Extraction Error [${filename}]: ${e.message}`);
          }
        }
      }
    } catch (e: any) {
      result.errors.push(`Manifest Failure: ${e.message}`);
    }

    return result;
  }
}
