import { Blackboard } from './Blackboard.js';
import { Orchestrator } from './Orchestrator.js';
import { NavigationAgent } from '../agents/NavigationAgent.js';
import { ChunkStreamingAgent } from '../agents/ChunkStreamingAgent.js';
import { CombatAgent } from '../agents/CombatAgent.js';
import { EconomyAgent } from '../agents/EconomyAgent.js';
import { SocialAgent } from '../agents/SocialAgent.js';
import { QuestAgent } from '../agents/QuestAgent.js';
import { ThreatAgent } from '../agents/ThreatAgent.js';
import { ResourceAgent } from '../agents/ResourceAgent.js';
import { DungeonAgent } from '../agents/DungeonAgent.js';
import { AntiExploitAgent } from '../agents/AntiExploitAgent.js';
import { TradingAgent } from '../agents/TradingAgent.js';
import { GuildAgent } from '../agents/GuildAgent.js';
import { EventReactionAgent } from '../agents/EventReactionAgent.js';
export class WorldBrain {
  constructor() {
    this.blackboard = new Blackboard();
    this.lastActions = [];
    this.agents = [new NavigationAgent(), new ChunkStreamingAgent(), new CombatAgent(), new EconomyAgent(), new SocialAgent(), new QuestAgent(), new ThreatAgent(), new ResourceAgent(), new DungeonAgent(), new AntiExploitAgent(), new TradingAgent(), new GuildAgent(), new EventReactionAgent()];
    this.orchestrator = new Orchestrator(this.agents, { maxActionsPerTick: 20 });
  }
  tick(world) {
    const actions = this.orchestrator.process(world, this.blackboard);
    this.lastActions = actions;
    return actions;
  }
}
