import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import crypto from 'crypto';
export class GameServer {
  constructor(world, brain, port) { this.world=world; this.brain=brain; this.port=port; this.app=express(); this.http=createServer(this.app); this.wss=new WebSocketServer({ server:this.http }); }
  setupHttp() {
    this.app.use(express.static('public'));
    this.app.get('/health', (_req,res)=>res.json({ ok:true, players:this.world.players.size, npcs:this.world.npcs.length, tick:this.world.time }));
    this.app.get('/api/world', (_req,res)=>res.json(this.world.snapshot()));
  }
  setupWs() {
    this.wss.on('connection', socket => {
      const id = crypto.randomUUID();
      this.world.upsertPlayer(id, { x:0, z:0 });
      socket.send(JSON.stringify({ type:'welcome', id }));
      socket.on('message', raw => {
        try {
          const msg = JSON.parse(raw.toString());
          if (msg.type === 'move') {
            const suspicious = Math.abs(msg.x) > 1000 || Math.abs(msg.z) > 1000;
            this.world.upsertPlayer(id, { x:Number(msg.x)||0, z:Number(msg.z)||0, suspicious });
            if (suspicious) this.world.metrics.suspiciousMovementCount += 1;
          }
          if (msg.type === 'buy') this.world.handleBuy(id, msg.itemId);
          if (msg.type === 'sell') this.world.handleSell(id, msg.itemId);
          if (msg.type === 'use-item') this.world.handleUseItem(id, msg.itemId);
          if (msg.type === 'attack') this.world.handleAttack(id);
          if (msg.type === 'join-guild') this.world.handleJoinGuild(id, msg.guildName || 'Wanderers');
        } catch (err) { console.error('WS parse error', err); }
      });
      socket.on('close', ()=>this.world.removePlayer(id));
    });
  }
  broadcastState() {
    const payload = JSON.stringify({ type:'state', world:this.world.snapshot() });
    for (const client of this.wss.clients) if (client.readyState === 1) client.send(payload);
  }
  start() { this.setupHttp(); this.setupWs(); this.http.listen(this.port, ()=>console.log(`[HTTP] running on http://localhost:${this.port}`)); }
}
