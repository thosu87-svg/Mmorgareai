import { CHUNK_SIZE, VIEW_RADIUS } from '../../shared/constants.js';
export class ChunkManager {
  constructor(){ this.loaded = new Map(); }
  key(cx, cz){ return `${cx},${cz}`; }
  toChunkCoord(v){ return Math.floor(v / CHUNK_SIZE); }
  ensureAround(x, z, extraRadius = 0) {
    const cx = this.toChunkCoord(x), cz = this.toChunkCoord(z), radius = VIEW_RADIUS + extraRadius;
    for (let dz=-radius; dz<=radius; dz++) for (let dx=-radius; dx<=radius; dx++) {
      const k = this.key(cx+dx, cz+dz);
      if (!this.loaded.has(k)) this.loaded.set(k, { x: cx+dx, z: cz+dz, biome: (Math.abs(cx+dx+cz+dz)%3===0)?'grass':((Math.abs(cx+dx)%2===0)?'sand':'forest') });
    }
  }
  get count(){ return this.loaded.size; }
}
