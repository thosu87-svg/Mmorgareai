
'use client';
/**
 * @fileOverview Ouroboros Database Export Service
 * Fetches all Firestore collections and bundles them into a ZIP file for download.
 */

import { collection, getDocs } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import JSZip from 'jszip';

const { firestore: db } = initializeFirebase();

const COLLECTIONS_TO_EXPORT = [
  'players',
  'worldState',
  'worldAssets',
  'questLines',
  'loreEntries',
  'npcDialogs',
  'matrixTransactions',
  'adminAuditLogs',
  'anomalyLogs',
  'tickState',
  'thoughtCache'
];

export const DatabaseExportService = {
  /**
   * Generates a ZIP file of all project data and triggers download.
   */
  async downloadFullExport() {
    if (!db) throw new Error('Database disconnected.');

    const zip = new JSZip();
    const folder = zip.folder("axiom_frontier_db_export");
    
    console.log('[EXPORT] Starting full matrix data fetch...');

    for (const colName of COLLECTIONS_TO_EXPORT) {
      try {
        const snap = await getDocs(collection(db, colName));
        const data = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Convert Firestore Timestamps to ISO strings for JSON readability
        const serializedData = JSON.stringify(data, (key, value) => {
          if (value && typeof value === 'object' && 'seconds' in value) {
            return new Date(value.seconds * 1000).toISOString();
          }
          return value;
        }, 2);

        folder?.file(`${colName}.json`, serializedData);
        console.log(`[EXPORT] Fetched ${data.length} records from ${colName}`);
      } catch (e) {
        console.warn(`[EXPORT_WARN] Failed to export collection ${colName}:`, e);
      }
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `axiom_frontier_export_${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('[EXPORT] Database ZIP successfully manifested and downloaded.');
  }
};
