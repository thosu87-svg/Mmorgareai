
'use client';
/**
 * @fileOverview Axiom Frontier - Admin Security & Threat Mitigation
 * Implements password verification, session management, and brute-force protection.
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp, 
  orderBy, 
  limit,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const { firestore: db } = initializeFirebase();

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

function getJwtSecret(): string {
  return process.env.NEXT_PUBLIC_ADMIN_JWT_SECRET || 'OUROBOROS_EMERGENCY_BLUEPRINT_DEFAULT';
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateAccessToken(adminId: string, email: string, role: string): string {
  return jwt.sign(
    { adminId, email, role, type: 'access' },
    getJwtSecret(),
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

export function generateRefreshToken(adminId: string): string {
  return jwt.sign(
    { adminId, type: 'refresh' },
    getJwtSecret(),
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

export function verifyToken(token: string): any {
  return jwt.verify(token, getJwtSecret());
}

/**
 * Checks if an identifier is currently locked due to brute force protection.
 */
export async function checkBruteForce(identifier: string): Promise<{ locked: boolean; attemptsLeft: number }> {
  if (!db) return { locked: false, attemptsLeft: MAX_LOGIN_ATTEMPTS };

  const q = query(
    collection(db, 'securityLockouts'),
    where('identifier', '==', identifier),
    where('lockoutType', '==', 'LOGIN'),
    orderBy('createdAt', 'desc'),
    limit(1)
  );
  
  const snap = await getDocs(q);
  if (snap.empty) return { locked: false, attemptsLeft: MAX_LOGIN_ATTEMPTS };

  const lockout = snap.docs[0].data();
  const lockedUntil = lockout.lockedUntil?.toMillis() || 0;

  if (lockedUntil > Date.now()) {
    return { locked: true, attemptsLeft: 0 };
  }

  if (lockout.attempts >= MAX_LOGIN_ATTEMPTS) {
    const docRef = snap.docs[0].ref;
    await updateDoc(docRef, {
      lockedUntil: Timestamp.fromMillis(Date.now() + LOCKOUT_DURATION_MS)
    });
    return { locked: true, attemptsLeft: 0 };
  }

  return { locked: false, attemptsLeft: MAX_LOGIN_ATTEMPTS - (lockout.attempts || 0) };
}

/**
 * Records a login attempt and updates lockout status if necessary.
 */
export async function recordLoginAttempt(identifier: string, success: boolean): Promise<void> {
  if (!db) return;

  const q = query(
    collection(db, 'securityLockouts'),
    where('identifier', '==', identifier),
    where('lockoutType', '==', 'LOGIN'),
    limit(1)
  );
  
  const snap = await getDocs(q);

  if (success) {
    if (!snap.empty) {
      await deleteDoc(snap.docs[0].ref);
    }
    return;
  }

  if (!snap.empty) {
    const data = snap.docs[0].data();
    const newAttempts = (data.attempts || 0) + 1;
    const lockedUntil = newAttempts >= MAX_LOGIN_ATTEMPTS ? Timestamp.fromMillis(Date.now() + LOCKOUT_DURATION_MS) : null;
    
    await updateDoc(snap.docs[0].ref, {
      attempts: newAttempts,
      lockedUntil,
      updatedAt: serverTimestamp()
    });
  } else {
    await addDoc(collection(db, 'securityLockouts'), {
      identifier,
      lockoutType: 'LOGIN',
      attempts: 1,
      lockedUntil: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
}

/**
 * Logs a sensitive administrative action.
 */
export async function logAuditAction(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  details: any,
  ipAddress: string
): Promise<void> {
  if (!db) return;

  await addDoc(collection(db, 'adminAuditLogs'), {
    adminId,
    action,
    targetType,
    targetId,
    details,
    ipAddress,
    timestamp: serverTimestamp()
  });
}

/**
 * Records a security anomaly detected by the system.
 */
export async function logAnomaly(sourceIp: string, pattern: string, severity: string, details: any): Promise<void> {
  if (!db) return;

  await addDoc(collection(db, 'anomalyLogs'), {
    sourceIp,
    pattern,
    severity,
    details,
    timestamp: serverTimestamp()
  });
}

/**
 * Creates a persistent admin session.
 */
export async function createAdminSession(
  adminId: string,
  accessToken: string,
  refreshToken: string,
  ipAddress: string,
  userAgent: string
): Promise<void> {
  if (!db) return;

  const expiresAt = Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await addDoc(collection(db, 'adminSessions'), {
    adminId,
    accessToken,
    refreshToken,
    ipAddress,
    userAgent,
    createdAt: serverTimestamp(),
    expiresAt,
    revoked: false
  });
}

/**
 * Revokes all sessions for a specific administrator.
 */
export async function revokeAllSessions(adminId: string): Promise<void> {
  if (!db) return;

  const q = query(
    collection(db, 'adminSessions'),
    where('adminId', '==', adminId),
    where('revoked', '==', false)
  );

  const snap = await getDocs(q);
  const batch = writeBatch(db);
  for (const sessionDoc of snap.docs) {
    batch.update(sessionDoc.ref, {
      revoked: true,
      updatedAt: serverTimestamp()
    });
  }
  await batch.commit();
}
