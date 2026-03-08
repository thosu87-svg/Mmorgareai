
'use client';
/**
 * @fileOverview Axiom Frontier - Compliance & System Health Service
 * Implements the deterministic compliance matrix from the routes definition.
 */

import { ComplianceMatrixEntry } from '@/types';

export function getAxiomCompliance(dbAvailable: boolean, isTickRunning: boolean): {
  success: boolean;
  timestamp: string;
  overallStatus: 'COMPLIANT' | 'PARTIAL';
  matrix: ComplianceMatrixEntry[];
} {
  const subsystems = [
    'MathEngine', 'ChunkEngine', 'TickEngine', 'CombatSystem',
    'LootGenerator', 'EconomicAggregator', 'HierarchyValidator',
    'MatrixAccounting', 'TransactionWrapper', 'Routes', 'Database'
  ];

  const matrix: ComplianceMatrixEntry[] = subsystems.map(sub => {
    const entry: ComplianceMatrixEntry = {
      subsystem: sub,
      energy: 'PASS',
      erosion: 'PASS',
      punctuation: 'PASS',
      recursion: ['MathEngine', 'ChunkEngine', 'EconomicAggregator', 'TickEngine'].includes(sub) ? 'PASS' : 'N/A',
      duality: 'PASS',
      status: 'COMPLIANT'
    };

    if (sub === 'Database') {
      entry.energy = dbAvailable ? 'PASS' : 'WARN';
      entry.status = dbAvailable ? 'COMPLIANT' : 'DEGRADED';
    }

    if (sub === 'TickEngine') {
      entry.punctuation = isTickRunning ? 'PASS' : 'WARN';
      entry.status = isTickRunning ? 'COMPLIANT' : 'IDLE';
    }

    return entry;
  });

  const allCompliant = matrix.every(m => m.status === 'COMPLIANT' || m.status === 'IDLE');

  return {
    success: true,
    timestamp: new Date().toISOString(),
    overallStatus: allCompliant ? 'COMPLIANT' : 'PARTIAL',
    matrix
  };
}
