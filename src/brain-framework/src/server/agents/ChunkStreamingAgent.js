import { BaseAgent } from './BaseAgent.js';
export class ChunkStreamingAgent extends BaseAgent {
  constructor(){ super('chunk-streaming'); }
  evaluate(world, blackboard) {
    if (world.loadedChunkCount < Math.max(9, world.players.size * 9)) blackboard.propose({ type:'warm_chunk_ring', priority:6, sourceAgent:this.name, cooldownKey:'warm_chunk_ring', cooldownMs:3000 });
  }
}
