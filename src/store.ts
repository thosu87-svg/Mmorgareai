
import { create } from 'zustand';
import { Agent, Chunk, Language, AgentState, StoreProduct, Task, Guild, ProceduralDungeon } from './types';

export type TimeOfDay = 'day' | 'dusk' | 'night';

export interface GitHubSyncConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

interface AppState {
  agents: Agent[];
  loadedChunks: Chunk[];
  guilds: Guild[];
  activeDungeons: ProceduralDungeon[];
  user: { id: string; name: string; email: string } | null;
  isAxiomAuthenticated: boolean;
  isMatrixOverseerOpen: boolean;
  userApiKey: string | null;
  selectedAgentId: string | null;
  language: Language;
  timeOfDay: TimeOfDay;
  githubConfig: GitHubSyncConfig;
  device: {
    isMobile: boolean;
    width: number;
    height: number;
    orientation: 'portrait' | 'landscape';
  };
  controlMode: 'JOYSTICK' | 'PUSH_TO_WALK' | 'KEYBOARD';
  virtualInput: { x: number; z: number };
  targetPosition: { x: number; y: number; z: number } | null;
  chatMessages: any[];
  globalApiCooldown: number;
  windowStates: Record<string, { isOpen: boolean; isMinimized: boolean }>;
  controlledAgentId: string | null;
  auctionHouse: any[];
  emergenceSettings: {
    isEmergenceEnabled: boolean;
    useHeuristicsOnly: boolean;
    axiomaticWorldGeneration: boolean;
    physicsBasedActivation: boolean;
    showAxiomaticOverlay: boolean;
  };
  shaderSettings: {
    enableFog: boolean;
    enableSky: boolean;
    enableStars: boolean;
    enableAmbient: boolean;
    enableHemisphere: boolean;
    enableDirectional: boolean;
    enableEnvironment: boolean;
    forceEmissive: boolean;
  };
  brainEngine: {
    status: 'IDLE' | 'ACTIVE' | 'CALIBRATING' | 'ERROR';
    postgresStatus: 'OFFLINE' | 'CONNECTED' | 'ERROR';
    lastSync: number | null;
    activeNodes: string[];
    logs: string[];
    cacheHealth: number;
    tenantId: string | null;
    projectStats: any | null;
    matrixNodeIp: string;
    routeServerId: string;
    snsArn: string;
    vpcId: string;
    asn: number;
  };
  
  setUser: (user: { id: string; name: string; email: string } | null) => void;
  setAxiomAuthenticated: (isAuth: boolean) => void;
  setMatrixOverseerOpen: (isOpen: boolean) => void;
  setUserApiKey: (key: string | null) => void;
  selectAgent: (id: string | null) => void;
  setLanguage: (lang: Language) => void;
  setTimeOfDay: (time: TimeOfDay) => void;
  setGithubConfig: (config: Partial<GitHubSyncConfig>) => void;
  setIsMobile: (isMobile: boolean) => void;
  setControlMode: (mode: 'JOYSTICK' | 'PUSH_TO_WALK' | 'KEYBOARD') => void;
  setVirtualInput: (input: { x: number; z: number }) => void;
  setTargetPosition: (pos: { x: number; y: number; z: number } | null) => void;
  setAgents: (agents: Agent[]) => void;
  setChunks: (chunks: Chunk[]) => void;
  addLog: (message: string, logType: string) => void;
  clearChat: () => void;
  toggleWindow: (window: string, isOpen: boolean) => void;
  minimizeWindow: (window: string) => void;
  takeControl: (id: string) => void;
  releaseControl: () => void;
  bidOnAuction: (auctionId: string, bidderId: string, amount: number) => void;
  setEmergenceSetting: (key: string, value: boolean) => void;
  setShaderSetting: (key: keyof AppState['shaderSettings'], value: boolean) => void;
  
  updateBrainStatus: (status: AppState['brainEngine']['status']) => void;
  updatePostgresStatus: (status: AppState['brainEngine']['postgresStatus']) => void;
  addBrainLog: (log: string) => void;
  setCacheHealth: (health: number) => void;
  setBrainProjectStats: (stats: any) => void;

  updateTrust: (agentId: string, targetId: string, delta: number) => void;
  addAgentTask: (agentId: string, task: Task) => void;
  completeAgentTask: (agentId: string, taskId: string) => void;
  equipItem: (agentId: string, item: any, index: number) => void;
  unequipItem: (agentId: string, slot: string) => void;
  moveInventoryItem: (agentId: string, from: number, to: number) => void;
  allocateStatPoint: (agentId: string, stat: string) => void;
  unstuckPlayer: (agentId: string) => void;
  
  createGuild: (name: string, leaderId: string) => void;
  addDungeon: (dungeon: ProceduralDungeon) => void;
}

export const useStore = create<AppState>((set) => ({
  agents: [],
  loadedChunks: [],
  guilds: [],
  activeDungeons: [],
  user: null,
  isAxiomAuthenticated: false,
  isMatrixOverseerOpen: false,
  userApiKey: null,
  selectedAgentId: null,
  language: 'EN' as Language,
  timeOfDay: 'day',
  githubConfig: {
    token: "",
    owner: "pleyelp2",
    repo: "areclient",
    branch: "main"
  },
  device: {
    isMobile: false,
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
    orientation: 'landscape'
  },
  controlMode: 'JOYSTICK' as const,
  virtualInput: { x: 0, z: 0 },
  targetPosition: null,
  chatMessages: [],
  globalApiCooldown: 0,
  windowStates: {
    CHARACTER: { isOpen: false, isMinimized: false },
    CHAT: { isOpen: true, isMinimized: false },
    AUCTION: { isOpen: false, isMinimized: false },
    QUESTS: { isOpen: false, isMinimized: false },
  },
  controlledAgentId: null,
  auctionHouse: [
    { id: 'auc_1', item: { name: 'Void-Forged Plate', rarity: 'EPIC' }, sellerName: 'AxiomVendor', currentBid: 450, endTime: Date.now() + 3600000, status: 'ACTIVE' },
    { id: 'auc_2', item: { name: 'Axiom Shard x5', rarity: 'RARE' }, sellerName: 'GhostPilot', currentBid: 120, endTime: Date.now() + 1800000, status: 'ACTIVE' }
  ],
  emergenceSettings: {
    isEmergenceEnabled: true,
    useHeuristicsOnly: true,
    axiomaticWorldGeneration: true,
    physicsBasedActivation: true,
    showAxiomaticOverlay: false,
  },
  shaderSettings: {
    enableFog: false,
    enableSky: false,
    enableStars: true,
    enableAmbient: true,
    enableHemisphere: true,
    enableDirectional: false,
    enableEnvironment: true,
    forceEmissive: true,
  },
  brainEngine: {
    status: 'ACTIVE',
    postgresStatus: 'OFFLINE',
    lastSync: Date.now(),
    activeNodes: ['GKE-Cluster-Alpha', 'Matrix-Node-01'],
    logs: ['GKE Node Initialized: 35.232.7.105', 'Matrix link established.'],
    cacheHealth: 100,
    tenantId: 'OUROBOROS_CORE_01',
    projectStats: null,
    matrixNodeIp: '35.232.7.105',
    routeServerId: 'rs-06753044c47345444',
    snsArn: 'arn:aws:sns:eu-central-1:986523046654:VPC-Route-Server-Notifications-rs-06753044c47345444',
    vpcId: 'vpc-05ef546d881cca23344',
    asn: 885
  },

  setUser: (user) => set({ user }),
  setAxiomAuthenticated: (isAuth) => set({ isAxiomAuthenticated: isAuth }),
  setMatrixOverseerOpen: (isOpen) => set({ isMatrixOverseerOpen: isOpen }),
  setUserApiKey: (key) => set({ userApiKey: key, selectedAgentId: key }),
  selectAgent: (id) => set({ selectedAgentId: id }),
  setLanguage: (lang) => set({ language: lang }),
  setTimeOfDay: (timeOfDay) => set({ timeOfDay }),
  setGithubConfig: (config) => set((state) => ({ githubConfig: { ...state.githubConfig, ...config } })),
  setIsMobile: (isMobile) => set((state) => ({ device: { ...state.device, isMobile } })),
  setControlMode: (mode) => set({ controlMode: mode }),
  setVirtualInput: (input) => set({ virtualInput: input }),
  setTargetPosition: (pos) => set({ targetPosition: pos }),
  setAgents: (agents) => set({ agents }),
  setChunks: (chunks) => set({ loadedChunks: chunks }),
  addLog: (message, logType) => set((state) => ({ 
    chatMessages: [{ id: Math.random().toString(), senderName: 'SYSTEM', content: message, channel: logType, timestamp: Date.now() }, ...state.chatMessages].slice(0, 100) 
  })),
  clearChat: () => set({ chatMessages: [] }),
  toggleWindow: (window, isOpen) => set((state) => ({
    windowStates: { ...state.windowStates, [window]: { ...state.windowStates[window], isOpen } }
  })),
  minimizeWindow: (window) => set((state) => ({
    windowStates: { ...state.windowStates, [window]: { ...state.windowStates[window], isMinimized: !state.windowStates[window].isMinimized } }
  })),
  takeControl: (id) => set({ controlledAgentId: id }),
  releaseControl: () => set({ controlledAgentId: null }),
  bidOnAuction: (id, bidderId, amount) => set((state) => ({
    auctionHouse: state.auctionHouse.map(a => a.id === id ? { ...a, currentBid: amount } : a)
  })),
  setEmergenceSetting: (key, value) => set((state) => ({
    emergenceSettings: { ...state.emergenceSettings, [key]: value }
  })),
  setShaderSetting: (key, value) => set((state) => ({
    shaderSettings: { ...state.shaderSettings, [key]: value }
  })),

  updateBrainStatus: (status) => set((state) => ({ brainEngine: { ...state.brainEngine, status, lastSync: Date.now() } })),
  updatePostgresStatus: (status) => set((state) => ({ brainEngine: { ...state.brainEngine, postgresStatus: status } })),
  addBrainLog: (log) => set((state) => ({ brainEngine: { ...state.brainEngine, logs: [log, ...state.brainEngine.logs].slice(0, 50) } })),
  setCacheHealth: (cacheHealth) => set((state) => ({ brainEngine: { ...state.brainEngine, cacheHealth } })),
  setBrainProjectStats: (projectStats) => set((state) => ({ brainEngine: { ...state.brainEngine, projectStats } })),

  updateTrust: (agentId, targetId, delta) => set((state) => ({
    agents: state.agents.map(a => {
      if (a.id !== agentId) return a;
      const rels = { ...a.relationships };
      const current = rels[targetId] || { targetId, trust: 0, type: 'neutral' };
      rels[targetId] = { ...current, trust: Math.max(-100, Math.min(100, current.trust + delta)) };
      return { ...a, relationships: rels };
    })
  })),
  addAgentTask: (agentId, task) => set((state) => ({
    agents: state.agents.map(a => a.id === agentId ? { ...a, tasks: [...a.tasks, task] } : a)
  })),
  completeAgentTask: (agentId, taskId) => set((state) => ({
    agents: state.agents.map(a => a.id === agentId ? { ...a, tasks: a.tasks.map(t => t.id === taskId ? { ...t, status: 'done' } : t) } : a)
  })),
  equipItem: (agentId, item, index) => set((state) => ({
    agents: state.agents.map(a => {
      if (a.id !== agentId) return a;
      const inv = [...a.inventory];
      inv[index] = null;
      const slot = item.type === 'WEAPON' ? 'mainHand' : item.type === 'HELM' ? 'head' : item.type === 'CHEST' ? 'chest' : 'legs';
      return { ...a, inventory: inv, equipment: { ...a.equipment, [slot]: item } };
    })
  })),
  unequipItem: (agentId, slot) => set((state) => ({
    agents: state.agents.map(a => {
      if (a.id !== agentId) return a;
      const item = (a.equipment as any)[slot];
      if (!item) return a;
      const inv = [...a.inventory];
      const emptyIdx = inv.findIndex(i => i === null);
      if (emptyIdx === -1) return a;
      inv[emptyIdx] = item;
      return { ...a, inventory: inv, equipment: { ...a.equipment, [slot]: null } };
    })
  })),
  moveInventoryItem: (agentId, from, to) => set((state) => ({
    agents: state.agents.map(a => {
      if (a.id !== agentId) return a;
      const inv = [...a.inventory];
      [inv[from], inv[to]] = [inv[to], inv[from]];
      return { ...a, inventory: inv };
    })
  })),
  allocateStatPoint: (agentId, stat) => set((state) => ({
    agents: state.agents.map(a => {
      if (a.id !== agentId || (a.unspentStatPoints || 0) <= 0) return a;
      return { ...a, [stat]: ((a as any)[stat] || 10) + 1, unspentStatPoints: (a.unspentStatPoints || 0) - 1 };
    })
  })),
  unstuckPlayer: (agentId) => set((state) => ({
    agents: state.agents.map(a => a.id === agentId ? { ...a, position: { x: 20, y: 0, z: 20 }, state: AgentState.IDLE } : a)
  })),
  
  createGuild: (name, leaderId) => set((state) => ({
    guilds: [...state.guilds, { id: `guild_${Date.now()}`, name, leaderId, memberIds: [leaderId], level: 1, bank: [], infrastructure: [] }]
  })),
  addDungeon: (dungeon) => set((state) => ({
    activeDungeons: [...state.activeDungeons, dungeon]
  })),
}));
