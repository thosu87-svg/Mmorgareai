export enum AgentState {
  IDLE = 'IDLE',
  THINKING = 'THINKING',
  GATHERING = 'GATHERING',
  EXPLORING = 'EXPLORING',
  COMBAT = 'COMBAT',
  TRADING = 'TRADING',
  QUESTING = 'QUESTING',
  BANKING = 'BANKING',
  CRAFTING = 'CRAFTING',
  BUILDING = 'BUILDING',
  ASCENDING = 'ASCENDING',
  MARKETING = 'MARKETING',
  ALLIANCE_FORMING = 'ALLIANCE_FORMING',
  DUNGEONEERING = 'DUNGEONEERING'
}

export type SkillCategory = 'COMBAT' | 'GATHERING' | 'CRAFTING' | 'UTILITY';

export interface ThinkingMatrix {
  personality: string;
  currentLongTermGoal: string;
  alignment: number;
  languagePreference: string;
  sociability: number;
  aggression: number;
  curiosity: number;
  frugality: number;
}

export interface AgentNeeds {
  hunger: number;
  social: number;
  wealth: number;
}

export interface Memory {
  event: string;
  timestamp: number;
  trustDelta: number;
}

export interface Relationship {
  targetId: string;
  trust: number;
  type: 'family' | 'friend' | 'neutral';
}

export interface Task {
  id: string;
  goal: string;
  status: 'pending' | 'active' | 'done';
}

export interface AppearanceConfig {
  skinTone: string;
  hairStyle: string;
  bodyScale: number;
  baseModel?: string;
  textures?: Record<string, string>;
}

export const DEFAULT_APPEARANCE: AppearanceConfig = {
  skinTone: '#c68642',
  hairStyle: 'short',
  bodyScale: 1.0,
  baseModel: 'humanoid',
  textures: {}
};

export type NPCRole = 
  | 'merchant' | 'guard' | 'scholar' | 'farmer' | 'artisan'
  | 'priest' | 'soldier' | 'noble' | 'commoner' | 'wanderer';

export interface MoodVector {
  happiness: number;
  fear: number;
  anger: number;
  curiosity: number;
  trust: number;
  hope: number;
}

export interface Agent {
  id: string;
  displayName: string;
  name?: string;
  npcClass: string;
  role?: NPCRole;
  level: number;
  hp: number;
  maxHp: number;
  exp: number;
  str: number;
  agi: number;
  int: number;
  vit: number;
  position: { x: number; y: number; z: number };
  targetPosition?: { x: number; y: number; z: number } | null;
  visionRange: number;
  state: AgentState;
  inventory: any[];
  resourceInventory: Record<string, number>;
  bank: any[];
  needs: AgentNeeds;
  mood?: MoodVector;
  memory: string[];
  memoryEvents: Memory[];
  relationships: Record<string, Relationship>;
  tasks: Task[];
  dnaHistory: any[];
  memoryCache: any[];
  awakened: boolean;
  thinkingMatrix: ThinkingMatrix;
  appearance: AppearanceConfig;
  lastUpdate: any;
  energy: number;
  maxEnergy: number;
  integrity: number;
  consciousnessLevel: number;
  awakeningProgress: number;
  insightPoints: number;
  unspentStatPoints?: number;
  lastScanTime?: number;
  apiQuotaExceeded?: boolean;
  lastDecision?: { justification: string; decision: string };
  skills: Record<string, { level: number; xp: number }>;
  guildId?: string | null;
}

export interface Chunk {
  id: string;
  x: number;
  z: number;
  seed: number;
  biome: 'CITY' | 'FOREST' | 'MOUNTAIN' | 'DESERT' | 'TUNDRA' | 'PLAINS';
  entropy: number;
  stabilityIndex: number;
  corruptionLevel: number;
  resourceData: any;
  logicField: any[];
  lastUpdate: any;
  logicString?: string;
}

export interface DungeonRoom {
  id: string;
  x: number;
  y: number;
  type: 'SPAWN' | 'LOOT' | 'BOSS' | 'EMPTY' | 'CORRIDOR';
  connections: string[];
  threatLevel: number;
}

export interface ProceduralDungeon {
  id: string;
  seed: number;
  rooms: DungeonRoom[];
  level: number;
}

export interface Guild {
  id: string;
  name: string;
  leaderId: string;
  memberIds: string[];
  level: number;
  bank: any[];
  infrastructure: string[];
}

export type POIType = 'SHRINE' | 'FORGE' | 'MARKET_STALL' | 'BANK_VAULT' | 'GATE' | 'WALL' | 'HOUSE' | 'TREE' | 'DUNGEON' | 'RUIN' | 'NEST' | 'BUILDING' | 'MINE' | 'FOREST';

export interface POI {
  id: string;
  type: POIType;
  position: [number, number, number];
  rotationY?: number;
  isDiscovered: boolean;
  discoveryRadius?: number;
  rewardInsight?: number;
  loreFragment?: string;
  threatLevel?: number;
}

export interface ResourceNode {
  id: string;
  type: string;
  position: [number, number, number];
  amount: number;
}

export interface Monster {
  id: string;
  type: string;
  name: string;
  position: [number, number, number];
  rotationY: number;
  stats: any;
  xpReward: number;
  state: string;
  color: string;
  scale: number;
  targetId: string | null;
}

export const MONSTER_TEMPLATES = {
  GOBLIN: { hp: 50, atk: 5, def: 2, xp: 100, scale: 0.8 },
  ORC: { hp: 150, atk: 15, def: 10, xp: 300, scale: 1.2 },
  DRAGON: { hp: 1000, atk: 50, def: 40, xp: 2000, scale: 5.0 },
};

export interface AdminAuditLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  details: any;
  ipAddress: string;
  timestamp: { seconds: number; nanoseconds: number };
}

export interface LoreEntry {
  id: string;
  title: string;
  theme: string;
  region: string;
  faction: string;
  content: string;
  npcBackground: string;
  conflictHook: string;
  generatedBy: string;
  createdAt: any;
}

export type ItemRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'SET' | 'AXIOMATIC';
export type ItemType = 'WEAPON' | 'OFFHAND' | 'HELM' | 'CHEST' | 'LEGS' | 'RELIC';

export interface ItemStats {
  atk?: number;
  def?: number;
  str?: number;
  agi?: number;
  int?: number;
  vit?: number;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  subtype?: string;
  rarity: ItemRarity;
  stats: ItemStats;
  value: number;
  description: string;
  setName?: string;
  emissiveGlow?: boolean;
  affixes?: Array<{ name: string; type: 'prefix' | 'suffix'; statBonuses: Record<string, number> }>;
}

export type Language = 'EN' | 'DE' | 'RU' | 'TR' | 'FR' | 'ES' | 'ZH' | 'GR' | 'AR';

export type ChatChannel = 'GLOBAL' | 'LOCAL' | 'THOUGHT' | 'SYSTEM';

export interface QuestLine {
  id: string;
  title: string;
  description: string;
  requiredLevel: number;
  xpReward: number;
  goldReward: number;
  status: 'draft' | 'active' | 'archived';
  npc_id: string;
  quest_steps: Array<{ type: string; description: string; target?: string; count?: number }>;
}

export interface NPCDialog {
  id: string;
  questLineId: string;
  speaker: string;
  text: string;
  dialogKey?: string;
  npc_id?: string;
  options?: any[];
}

export interface CombatResult {
  attackerUid: string;
  defenderUid: string;
  defenderType: 'AGENT' | 'MONSTER';
  damageDealt: number;
  damageReceived: number;
  skillUsed: string;
  result: string;
  lootDropped: any[];
}

export interface ComplianceMatrixEntry {
  subsystem: string;
  energy: string;
  erosion: string;
  punctuation: string;
  recursion: string;
  duality: string;
  status: string;
}

export interface Faction {
  id: string;
  name: string;
  entityType: string;
  leaderUid: string;
  members: string[];
  level: number;
  influence: number;
  territory: any[];
  infrastructure: string[];
  createdAt: any;
  lastUpdate: any;
}

export interface GeneratedItem {
  name: string;
  type: string;
  rarity: string;
  stats: Record<string, number>;
  level: number;
  value: number;
}

export type TrustContext = 'COMBAT_ATTACK' | 'COMBAT_KILL' | 'TRADE' | 'QUEST_TOGETHER' | 'GUILD_JOIN' | 'BETRAYAL' | 'HEAL' | 'GIFT';

export interface TrustRecord {
  agentAId: string;
  agentBId: string;
  positiveInteractions: number;
  negativeInteractions: number;
  lastInteractionTick: number;
  lastInteractionType: TrustContext | 'NEUTRAL';
  trustScore: number;
  reputationWeight: number;
  updatedAt: any;
}

export interface TrustEffect {
  tradePriceModifier: number;
  combatAggressionModifier: number;
  questRewardModifier: number;
  label: string;
}

export interface StoreProduct {
  id: string;
  name: string;
  description: string;
  priceEUR: number;
  energy: number;
}

export const MATRIX_ENERGY_PRODUCTS: StoreProduct[] = [
  { id: 'ENERGY_100', name: '100 Matrix Energy', description: 'Quick boost for small constructs.', priceEUR: 0.99, energy: 100 },
  { id: 'ENERGY_500', name: '500 Matrix Energy', description: 'Standard pack for pilots.', priceEUR: 3.99, energy: 500 },
  { id: 'ENERGY_2000', name: '2000 Matrix Energy', description: 'High-density logic supply.', priceEUR: 9.99, energy: 2000 }
];

export const STRUCTURE_COSTS: Record<string, number> = {
  SHRINE: 150,
  FORGE: 250,
  MARKET_STALL: 100,
  HOUSE: 200,
  CITADEL: 1500
};

export const GAME_SKILLS: Record<string, { name: string; category: SkillCategory; icon: string }> = {
  mining: { name: 'Axiom Mining', category: 'GATHERING', icon: 'Pickaxe' },
  smithing: { name: 'Logic Forging', category: 'CRAFTING', icon: 'Hammer' },
  combat: { name: 'Neural Combat', category: 'COMBAT', icon: 'Swords' },
  reflection: { name: 'Deep Thinking', category: 'UTILITY', icon: 'Brain' }
};

export type StatName = 'strength' | 'dexterity' | 'agility' | 'stamina' | 'health' | 'mana' | 'intelligence';

export const STAT_DESCRIPTIONS: Record<StatName, string> = {
  strength: 'Affects physical damage and carry capacity.',
  dexterity: 'Increases accuracy and critical hit chance.',
  agility: 'Boosts movement speed and evasion.',
  stamina: 'Higher stamina allows for longer combat durations.',
  health: 'Increases max integrity (HP).',
  mana: 'Necessary for executing neural abilities.',
  intelligence: 'Improves logic efficiency and reflection speed.'
};

export function getUnlockedActions(skill: string, level: number): Array<{ name: string; description: string }> {
  return [];
}
