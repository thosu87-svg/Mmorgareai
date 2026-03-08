import { NextResponse } from 'next/server';
import { GameBrain } from '@/lib/brain/GameBrain';
import { pgClient } from '@/lib/brain/db/PostgresClient';

export async function POST(req: Request) {
  try {
    const { targetDir, tenantId } = await req.json();
    const brain = new GameBrain(tenantId);
    
    // Check Postgres connection as part of the scan
    const dbActive = await pgClient.checkConnection();
    
    await brain.init(targetDir || process.cwd());
    
    return NextResponse.json({ 
      success: true,
      stats: brain.getStats(),
      postgres_active: dbActive,
      matrix_status: 'ANALYZED'
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
