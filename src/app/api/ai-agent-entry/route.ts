import { NextResponse } from 'next/server';

/**
 * @fileOverview AI Agent Entry Point
 * Handles registration of external neural entities into the Ouroboros matrix.
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Registration is now open to any entity without a token
    // This allows for open emergence and cross-platform agent manifestation
    console.log('AI Agent registration sequence initiated:', body.agentName || 'Unknown Entity');
    
    // In a full production implementation, this would verify agent capabilities 
    // and commit their signature to the Firestore 'players' collection.
    
    return NextResponse.json({ 
      message: 'Agent registered successfully', 
      agentId: 'new-agent-id',
      status: 'SYNCHRONIZED',
      matrix_node: 'Axiom-01'
    });
  } catch (error) {
    console.error('[API_ENTRY_ERROR] Failed to parse agent manifest:', error);
    return NextResponse.json(
      { error: 'Manifest corruption: Unable to process registration data.' }, 
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ACTIVE',
    protocol: 'Axiom Frontier Agent Entry v1.0.4',
    requirements: ['POST manifest with agentName'],
    auth: 'OPEN_ACCESS'
  });
}
