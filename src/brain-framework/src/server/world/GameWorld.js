import { START_GOLD, START_HP } from '../../shared/constants.js';
import { ChunkManager } from './ChunkManager.js';
export class GameWorld {
  constructor(seed = 'kriegstrommel') {
    this.seed = seed; this.players = new Map(); this.npcs = []; this.chunkManager = new ChunkManager(); this.time = 0; this.questHooks = 2; this.marketBonusActive = false; this.chunkBoost = 0; this.lastBrainActions = [];
    this.metrics = { threatLevel:0.2, marketInflation:0.2, lonelyPlayers:0, activeQuestHooks:2, resourceScarcity:0.2, playerEngagement:0.35, suspiciousMovementCount:0, tradeFlow:0.45, guildActivity:0.15, weatherPhase:'clear' };
    this.guilds = [{ name:'Wanderers', members:[], treasury:0, level:1 }];
    this.marketPrices = { potion:12, apple:3, ore:8, sword:35 };
  }
  createPlayer(id, name=null){ return { id, name:name??`P-${id.slice(0,4)}`, x:0, z:0, hp:START_HP, maxHp:START_HP, gold:START_GOLD, guild:null, inventory:[{id:'potion',name:'Potion',qty:3,type:'consumable'},{id:'apple',name:'Apple',qty:5,type:'food'},{id:'sword',name:'Rusty Sword',qty:1,type:'weapon',power:5}], suspicious:false }; }
  upsertPlayer(id, patch){ const current = this.players.get(id) ?? this.createPlayer(id, patch?.name); const next = { ...current, ...patch }; this.players.set(id, next); this.chunkManager.ensureAround(next.x, next.z, this.chunkBoost); return next; }
  removePlayer(id){ this.players.delete(id); }
  ensureNpc(type, x, z){ const id = `${type}-${Math.random().toString(36).slice(2,8)}`; const npc = { id, type, x, z, hp:40, maxHp:40 }; this.npcs.push(npc); return npc; }
  simulate() {
    this.time += 1;
    const playerCount = this.players.size;
    this.metrics.lonelyPlayers = playerCount > 0 ? Math.max(0, playerCount - Math.floor(playerCount / 2)) : 0;
    this.metrics.activeQuestHooks = this.questHooks;
    this.metrics.playerEngagement = Math.min(1, 0.25 + playerCount * 0.06 + this.npcs.length * 0.01);
    this.metrics.tradeFlow = this.marketBonusActive ? 0.72 : Math.max(0.1, 0.5 - this.metrics.marketInflation * 0.3);
    this.metrics.guildActivity = Math.min(1, Array.from(this.players.values()).filter(p => p.guild).length * 0.08);
    this.loadedChunkCount = this.chunkManager.count;
    if (this.time % 8 === 0) this.metrics.marketInflation = Math.min(1, this.metrics.marketInflation + 0.07);
    if (this.time % 10 === 0) this.metrics.resourceScarcity = Math.min(1, this.metrics.resourceScarcity + 0.05);
    if (this.time % 12 === 0) this.metrics.threatLevel = Math.min(1, this.metrics.threatLevel + 0.08);
    if (this.time % 15 === 0) this.metrics.weatherPhase = this.metrics.weatherPhase === 'clear' ? 'storm' : 'clear';
    for (const npc of this.npcs) { const p = Array.from(this.players.values())[0]; if (p) { npc.x += Math.sign(p.x - npc.x) * Math.min(1, Math.abs(p.x - npc.x)); npc.z += Math.sign(p.z - npc.z) * Math.min(1, Math.abs(p.z - npc.z)); } }
  }
  applyActions(actions) {
    this.lastBrainActions = actions;
    for (const action of actions) {
      switch (action.type) {
        case 'spawn_guards': this.ensureNpc('guard',0,0); this.metrics.threatLevel = Math.max(0, this.metrics.threatLevel - 0.18); break;
        case 'spawn_traders': this.ensureNpc('trader',4,4); this.metrics.marketInflation = Math.max(0, this.metrics.marketInflation - 0.22); break;
        case 'seed_quest_hooks': this.questHooks += 2; break;
        case 'boost_resource_nodes': this.metrics.resourceScarcity = Math.max(0, this.metrics.resourceScarcity - 0.16); break;
        case 'open_market_bonus': this.marketBonusActive = true; break;
        case 'trigger_guild_call': for (const p of this.players.values()) if (!p.guild) p.guild = 'Wanderers'; this.metrics.guildActivity = Math.min(1, this.metrics.guildActivity + 0.3); break;
        case 'boost_storm_loot': this.questHooks += 1; break;
        case 'freeze_suspicious_player': for (const p of this.players.values()) if (p.suspicious) { p.x = Math.max(-256, Math.min(256, p.x)); p.z = Math.max(-256, Math.min(256, p.z)); p.suspicious = false; } this.metrics.suspiciousMovementCount = 0; break;
        case 'expand_chunk_interest':
        case 'warm_chunk_ring': this.chunkBoost = Math.min(2, this.chunkBoost + 1); for (const p of this.players.values()) this.chunkManager.ensureAround(p.x, p.z, this.chunkBoost); break;
        case 'open_micro_dungeon': this.ensureNpc('dungeon_keeper',8,8); break;
        case 'lock_hot_zone': this.metrics.threatLevel = Math.max(0, this.metrics.threatLevel - 0.1); break;
        case 'start_social_event': for (const p of this.players.values()) p.gold += 1; break;
      }
    }
  }
  handleBuy(playerId, itemId){ const p = this.players.get(playerId); if (!p) return false; const prices = this.marketPrices; const price = prices[itemId]; if (!price || p.gold < price) return false; p.gold -= price; const item = p.inventory.find(i=>i.id===itemId); if (item) item.qty += 1; else p.inventory.push({id:itemId,name:itemId,qty:1,type:'misc'}); return { itemId, price }; }
  handleSell(playerId, itemId){ const p = this.players.get(playerId); if (!p) return false; const item = p.inventory.find(i=>i.id===itemId && i.qty>0); if (!item) return false; item.qty -= 1; const price = Math.max(1, Math.floor((this.marketPrices[itemId] ?? 1) * 0.5)); p.gold += price; return { itemId, price }; }
  handleUseItem(playerId, itemId){ const p = this.players.get(playerId); if (!p) return false; const item = p.inventory.find(i=>i.id===itemId && i.qty>0); if (!item) return false; item.qty -= 1; if (itemId === 'potion') p.hp = Math.min(p.maxHp, p.hp + 25); return true; }
  handleAttack(playerId){ const attacker = this.players.get(playerId); const target = this.npcs[0]; if (!attacker || !target || attacker.hp<=0 || target.hp<=0) return false; const weapon = attacker.inventory?.find(i=>i.type==='weapon'&&i.qty>0); const damage = 5 + (weapon?.power ?? 0); target.hp = Math.max(0, target.hp - damage); return { ok:true, damage, targetHp:target.hp }; }
  handleJoinGuild(playerId, guildName){ const p = this.players.get(playerId); if (!p) return false; p.guild = guildName || 'Wanderers'; return { name:p.guild }; }
  snapshot(){ return { seed:this.seed, time:this.time, players:Array.from(this.players.values()), npcs:this.npcs, metrics:this.metrics, guilds:this.guilds, marketPrices:this.marketPrices, loadedChunkCount:this.chunkManager.count, chunks:Array.from(this.chunkManager.loaded.values()).slice(0,100), brainActions:this.lastBrainActions }; }
}
