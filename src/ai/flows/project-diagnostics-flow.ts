
'use server';
/**
 * @fileOverview Ouroboros Deep Debugger (Local Mode)
 * Returns deterministic health reports while Genkit is disabled.
 */

export type ProjectDiagnosticsInput = {
  context: string;
  errorLog?: string;
};

export type ProjectDiagnosticsOutput = {
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  summary: string;
  issues: Array<{
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    description: string;
    suggestedFix: string;
    file?: string;
  }>;
  recoverySteps: string[];
};

export async function projectDiagnosticsFlow(input: ProjectDiagnosticsInput): Promise<ProjectDiagnosticsOutput> {
  return {
    status: 'HEALTHY',
    summary: "Simulation core is operating in Local Deterministic Mode. External AI layers are currently in stasis.",
    issues: [
      {
        severity: 'LOW',
        description: "Genkit is currently disabled by administrative override.",
        suggestedFix: "Re-enable Genkit dependencies when cloud-sync is required.",
        file: "package.json"
      }
    ],
    recoverySteps: [
      "Verify Firestore real-time listeners",
      "Check 144Hz logic cycle consistency"
    ]
  };
}
