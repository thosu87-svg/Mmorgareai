
/**
 * @fileOverview Axiom Frontier - AI Mock Bridge
 * Handles AI requests via local deterministic stubs while Genkit is disabled.
 * This file contains NO imports from 'genkit' to prevent module resolution errors.
 */
export const ai = {
  definePrompt: (config: any) => (input: any) => Promise.resolve({ output: null }),
  defineFlow: (config: any, fn: any) => fn,
  defineTool: (config: any, fn: any) => fn,
  defineSchema: (name: string, schema: any) => schema,
} as any;
