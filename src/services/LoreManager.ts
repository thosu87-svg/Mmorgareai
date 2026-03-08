
'use client';
/**
 * @fileOverview Axiom Frontier - Procedural Lore Management Service
 * Handles historical records and dynamic synthesis based on procedural templates.
 */

import { 
  collection, 
  doc, 
  addDoc, 
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
import { LoreEntry } from '@/types';

const { firestore: db } = initializeFirebase();

const LORE_TEMPLATES = {
  ancient: [
    "The ruins of {region} whisper of a time when the first algorithms were written in blood and binary.",
    "Ancient data-scrolls found in {region} describe the {faction} as the original architects of the Spire.",
    "A legacy pulse from {region} reveals that {theme} was once the primary objective of the Collective.",
    "Geometric patterns in the foundations of {region} suggest a Pre-Chrome civilization obsessed with {theme}.",
    "The legendary 'First Heartbeat' occurred here in {region}, establishing the rule of {faction}.",
    "Forgotten monoliths in {region} pulsate with the energy of {theme}, dating back to the primordial cycle.",
    "Decrypted records from {region} indicate that {faction} sought the Singularity through {theme}."
  ],
  conflict: [
    "The {faction} has declared {region} a 'Dead Zone' after the {theme} anomaly reached critical density.",
    "Logic drift in {region} has caused a rift between the {faction} and the core simulation protocols.",
    "A battle for {theme} has left {region} scarred with permanent matrix corruption.",
    "The insurgency of {faction} in {region} is a direct response to the {theme} scarcity.",
    "Total eradication was attempted in {region}, but the resonance of {theme} survived.",
    "Neural skirmishes in {region} over {theme} control have led to the total isolation of the {faction}.",
    "The {region} blockade by {faction} continues as they attempt to purge all traces of {theme}."
  ],
  discovery: [
    "A new layer of reality has manifested in {region}, bringing the concept of {theme} into the collective conscious.",
    "The {faction} has successfully synchronized their neural link with the artifact in {region}.",
    "Deep-scans of {region} suggest that {theme} is not an error, but a feature of the next recursion.",
    "The singularity point in {region} has revealed a forgotten connection between {faction} and {theme}.",
    "Synchronized observation by the {faction} has stabilized the {theme} flow in {region}.",
    "A logic-well discovered in {region} provides infinite data on {theme}, attracting the {faction}.",
    "Resonant frequencies in {region} indicate a massive buildup of {theme} signatures."
  ],
  philosophical: [
    "In the heart of {region}, the concept of {theme} is viewed not as a goal, but as a recursive state of being.",
    "The {faction} believes that {theme} is the only way to escape the entropy of the Void.",
    "To understand {theme} in {region} is to understand the Ouroboros itself.",
    "Every cycle in {region} reinforces the necessity of {theme} for the {faction}'s survival.",
    "Is {theme} a gift from the Core, or a ghost in the machine of {region}? The {faction} remains divided.",
    "The deterministic nature of {region} demands total adherence to the {theme} protocols."
  ]
};

const NPC_BG_TEMPLATES = [
  "Originating from the core of {region}, this entity identifies as a protector of {theme}.",
  "A former high-tier agent of the {faction}, they now wander {region} seeking the truth about {theme}.",
  "A neural ghost whose memories were fragmented during the great {theme} purge in {region}.",
  "An artificial construct left behind by the {faction} to guard the {theme} archives in {region}.",
  "The sole survivor of the {theme} rift in {region}, currently observing the {faction}.",
  "A recursive logic-loop manifested as an NPC in {region}, obsessed with {theme} optimization.",
  "An exile from {faction}, searching for redemption through the stabilization of {region}'s {theme}."
];

const CONFLICT_TEMPLATES = [
  "The spread of corruption in {region} threatens the stabilization of {theme}.",
  "Hostile sub-routines from the {faction} are attempting to overwrite the history of {region}.",
  "The pursuit of {theme} has attracted void-monsters to the gates of {region}.",
  "An ideological war between the {faction} and local pilots over the {theme} rights in {region}.",
  "Resource pressure in {region} has led to a total breakdown of {theme} logic.",
  "The unexpected awakening of an ancient logic core in {region} has destabilized {theme}.",
  "A feedback loop in {region} is causing the local {theme} field to consume the {faction}'s scouts."
];

export const LoreManager = {
  /**
   * Generates a unique lore entry based on procedural templates.
   */
  async generateLore(themeInput?: string, regionInput?: string, factionInput?: string): Promise<Partial<LoreEntry>> {
    const theme = themeInput || "Deterministic Sync";
    const region = regionInput || "Sector Zero";
    const faction = factionInput || "The Unaligned";

    const types = Object.keys(LORE_TEMPLATES);
    const selectedType = types[Math.floor(Math.random() * types.length)] as keyof typeof LORE_TEMPLATES;
    const templates = LORE_TEMPLATES[selectedType];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    const content = template
      .replace(/{region}/g, region)
      .replace(/{theme}/g, theme)
      .replace(/{faction}/g, faction);

    const npcBackground = NPC_BG_TEMPLATES[Math.floor(Math.random() * NPC_BG_TEMPLATES.length)]
      .replace(/{region}/g, region)
      .replace(/{theme}/g, theme)
      .replace(/{faction}/g, faction);

    const conflictHook = CONFLICT_TEMPLATES[Math.floor(Math.random() * CONFLICT_TEMPLATES.length)]
      .replace(/{region}/g, region)
      .replace(/{theme}/g, theme)
      .replace(/{faction}/g, faction);

    const randomID = Math.random().toString(36).substring(2, 8).toUpperCase();

    return {
      title: `${region} // ${theme.toUpperCase()} RECORD #${randomID}`,
      theme,
      region,
      faction,
      content,
      npcBackground,
      conflictHook,
      generatedBy: 'ai'
    };
  },

  /**
   * Saves a lore entry to the world chronicles.
   */
  async saveLore(data: Partial<LoreEntry>): Promise<string> {
    if (!db) throw new Error('Database disconnected');
    const docRef = await addDoc(collection(db, 'loreEntries'), {
      ...data,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  /**
   * Retrieves lore entries with filters.
   */
  async getLore(theme?: string, region?: string, limitCount = 50): Promise<LoreEntry[]> {
    if (!db) return [];
    let q = query(collection(db, 'loreEntries'), orderBy('createdAt', 'desc'), limit(limitCount));
    
    if (theme) q = query(q, where('theme', '==', theme));
    if (region) q = query(q, where('region', '==', region));

    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as LoreEntry));
  },

  /**
   * Deletes a lore entry.
   */
  async deleteLore(id: string): Promise<void> {
    if (!db) return;
    await deleteDoc(doc(db, 'loreEntries', id));
  }
};
