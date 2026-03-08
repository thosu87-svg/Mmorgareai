
/**
 * @fileOverview Axiom Frontier - Serverless Heartbeat & Game Logic
 * This code is intended for Firebase Cloud Functions v2.
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

/**
 * World Heartbeat - Runs every 1 minute
 * Updates Civilization Index and deterministic world parameters.
 */
export const worldHeartbeat = onSchedule("every 1 minutes", async (event) => {
    const start = Date.now();
    const worldRef = db.collection("worldState").doc("global");
    const snap = await worldRef.get();
    const data = snap.data();

    if (!data || data.paused) {
        console.log("Engine paused or missing state. Skipping heartbeat.");
        return;
    }

    // Formula: CI = (0.2*econ) + (0.2*mil) + (0.15*stab) + (0.15*know) + (0.15*cult) - (0.15*corr)
    const ci = (0.2 * (data.economy || 0)) + 
               (0.2 * (data.military || 0)) + 
               (0.15 * (data.stability || 0)) + 
               (0.15 * (data.knowledge || 0)) + 
               (0.15 * (data.culture || 0)) - 
               (0.15 * (data.corruption || 0));

    const newTick = (data.tick || 0) + 1;

    await worldRef.update({
        civilizationIndex: ci,
        tick: newTick,
        lastHeartbeat: admin.firestore.Timestamp.now()
    });

    // Record Tick State for auditing (mirroring tick_state table)
    await db.collection("tickState").add({
        tickNumber: newTick,
        durationMs: Date.now() - start,
        status: "COMMITTED",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        civilizationIndex: ci
    });

    console.log(`Heartbeat processed. Tick: ${newTick}, CI: ${ci}`);
});

/**
 * AxiomEnforcer - Validates critical game state changes
 */
export const enforceAxiom = onDocumentUpdated("players/{playerId}", async (event) => {
    const newValue = event.data?.after.data();
    const oldValue = event.data?.before.data();

    if (!newValue || !oldValue) return;

    // Prevent impossible level jumps
    if (newValue.level > (oldValue.level || 0) + 1) {
        console.warn(`Suspicious level jump detected for player ${event.params.playerId}`);
        // Log as anomaly
        await db.collection("anomalyLogs").add({
            sourceIp: "enforcer",
            pattern: "LEVEL_JUMP",
            severity: "HIGH",
            details: { playerId: event.params.playerId, old: oldValue.level, new: newValue.level },
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
    }
});
