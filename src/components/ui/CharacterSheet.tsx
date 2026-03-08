"use client";

import React, { useState } from 'react';
import { useStore } from '@/store';
import { Agent, Item, GAME_SKILLS, SkillCategory, StatName, STAT_DESCRIPTIONS, getUnlockedActions } from '@/types';
import { ITEM_SETS, getXPForNextLevel } from '@/lib/axiomatic-engine';
import { AgentMemoryDisplay } from './AgentMemoryDisplay';
import { Minus, X, Plus, ChevronRight, Pickaxe, Hammer, Swords, Brain } from 'lucide-react';

type EquipmentSlotType = keyof Agent['equipment'];

const RARITY_COLORS: Record<string, string> = {
    'COMMON': 'border-gray-500',
    'UNCOMMON': 'border-green-500',
    'RARE': 'border-blue-500',
    'EPIC': 'border-purple-500',
    'LEGENDARY': 'border-yellow-500',
    'SET': 'border-cyan-400',
    'AXIOMATIC': 'border-pink-500',
};

const RARITY_TEXT_COLORS: Record<string, string> = {
    'COMMON': 'text-gray-400',
    'UNCOMMON': 'text-green-400',
    'RARE': 'text-blue-400',
    'EPIC': 'text-purple-400',
    'LEGENDARY': 'text-yellow-400',
    'SET': 'text-cyan-400',
    'AXIOMATIC': 'text-pink-400',
};

const RARITY_BG_COLORS: Record<string, string> = {
    'COMMON': 'bg-gray-500/10',
    'UNCOMMON': 'bg-green-500/10',
    'RARE': 'bg-blue-500/10',
    'EPIC': 'bg-purple-500/10',
    'LEGENDARY': 'bg-yellow-500/10',
    'SET': 'bg-cyan-400/10',
    'AXIOMATIC': 'bg-pink-500/10',
};

const getSlotForItemType = (type: Item['type']): EquipmentSlotType | null => {
    switch (type) {
        case 'WEAPON': return 'mainHand';
        case 'OFFHAND': return 'offHand';
        case 'HELM': return 'head';
        case 'CHEST': return 'chest';
        case 'LEGS': return 'legs';
        default: return null;
    }
}

const StatComparison: React.FC<{ newItem: Item, equippedItem: Item | null }> = ({ newItem, equippedItem }) => {
    if (!equippedItem) {
        return (
            <>
                {Object.entries(newItem.stats || {}).map(([stat, value]) => (
                    <div key={stat} className="flex justify-between">
                        <span>{String(stat).toUpperCase()}</span>
                        <span className="text-green-400">+{String(value)}</span>
                    </div>
                ))}
            </>
        );
    }

    const allStats = [...new Set([...Object.keys(newItem.stats || {}), ...Object.keys(equippedItem.stats || {})])];

    return (
        <>
            {allStats.map(stat => {
                const newVal = (newItem.stats as any)[stat] || 0;
                const oldVal = (equippedItem?.stats as any)[stat] || 0;
                const diff = newVal - oldVal;

                return (
                    <div key={stat} className={`flex justify-between ${diff === 0 ? 'text-gray-500' : ''}`}>
                        <span>{String(stat).toUpperCase()}</span>
                        <span className={diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-500' : ''}>
                            {diff > 0 ? '+' : ''}{diff !== 0 ? `${diff} (${newVal})` : newVal}
                        </span>
                    </div>
                );
            })}
        </>
    );
};

const ItemTooltip: React.FC<{ item: Item, agent: Agent, position: {x: number, y: number} }> = ({ item, agent, position }) => {
    const slot = getSlotForItemType(item.type);
    const equippedItem = slot ? agent.equipment[slot] : null;
    const rarityTextColor = RARITY_TEXT_COLORS[item.rarity] || 'text-gray-400';
    const rarityBgColor = RARITY_BG_COLORS[item.rarity] || 'bg-gray-500/10';
    const rarityBorderColor = RARITY_COLORS[item.rarity] || 'border-gray-500';

    return (
        <div 
            className={`fixed z-[100] w-56 bg-black/95 border-2 ${rarityBorderColor} rounded-lg p-3 text-xs shadow-2xl pointer-events-none backdrop-blur-sm`}
            style={{ left: position.x + 15, top: position.y + 15 }}
        >
            <h4 className={`font-bold text-sm ${rarityTextColor}`}>{String(item.name)}</h4>
            <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${rarityBgColor} ${rarityTextColor}`}>{String(item.rarity)}</span>
                <span className="text-gray-500 text-[10px] capitalize">{String(item.type).toLowerCase()}</span>
                {item.emissiveGlow && <span className="text-[9px] text-yellow-300 animate-pulse">✦ Glowing</span>}
            </div>
            {item.setName && (
                <div className="mt-1 text-[10px] text-cyan-400 font-bold">Set: {String(item.setName)}</div>
            )}
            <hr className="border-white/10 my-1.5"/>
            <div className="space-y-0.5">
                <StatComparison newItem={item} equippedItem={equippedItem} />
            </div>
            {item.affixes && item.affixes.length > 0 && (
                <>
                    <hr className="border-white/10 my-1.5"/>
                    <div className="text-[9px] text-gray-500 uppercase font-black tracking-wider mb-1">Affixes</div>
                    <div className="space-y-0.5">
                        {item.affixes.map((affix, i) => (
                            <div key={`${String(affix.name)}-${i}`} className="flex items-center gap-1.5">
                                <span className={`text-[8px] px-1 py-0.5 rounded ${affix.type === 'prefix' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'}`}>
                                    {affix.type === 'prefix' ? 'P' : 'S'}
                                </span>
                                <span className="text-[10px] text-gray-300">{String(affix.name)}</span>
                                <span className="text-[9px] text-green-400 ml-auto">
                                    {Object.entries(affix.statBonuses).map(([k, v]) => `+${String(v)} ${String(k).toUpperCase()}`).join(', ')}
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}
            {item.value !== undefined && (
                <div className="mt-1.5 text-[10px] text-axiom-gold flex justify-between">
                    <span>Value</span>
                    <span className="font-bold">{String(item.value)}g</span>
                </div>
            )}
            <p className="text-gray-500 italic mt-1.5 text-[10px] leading-relaxed">"{String(item.description)}"</p>
        </div>
    );
}

const EquipmentSlot: React.FC<{ agent: Agent, slot: EquipmentSlotType, onUnequip: (slot: EquipmentSlotType) => void }> = ({ agent, slot, onUnequip }) => {
    const item = agent.equipment[slot];
    const label = String(slot).replace(/([A-Z])/g, ' $1').toUpperCase();
    
    return (
        <div className="text-center">
            <div
                onClick={() => item && onUnequip(slot)}
                className={`relative w-16 h-16 md:w-20 md:h-20 mx-auto bg-black/50 border-2 border-dashed border-white/10 rounded-lg flex items-center justify-center cursor-pointer hover:border-axiom-cyan ${item ? RARITY_COLORS[item.rarity] : ''}`}
            >
                {item ? <span className="text-3xl">⚔️</span> : <span className="text-gray-600 text-2xl">+</span>}
                {item?.setName && <div className="absolute top-1 right-1 w-2 h-2 bg-axiom-cyan rounded-full border border-black" title={`Set: ${String(item.setName)}`}></div>}
            </div>
            <p className="text-[10px] text-gray-500 mt-1">{String(label)}</p>
            {item && <p className="text-xs font-bold text-white truncate">{String(item.name)}</p>}
        </div>
    );
};

const InventoryItem: React.FC<{ 
    item: Item | null, 
    index: number, 
    onEquip: (item: Item, index: number) => void,
    onDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void,
    onMouseEnter: (item: Item, e: React.MouseEvent) => void,
    onMouseLeave: () => void,
}> = ({ item, index, onEquip, onDragStart, onMouseEnter, onMouseLeave }) => {
    if (!item) {
        return <div className="w-16 h-16 bg-black/30 border border-white/5 rounded"></div>;
    }

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, index)}
            onClick={() => onEquip(item, index)}
            onMouseEnter={(e) => onMouseEnter(item, e)}
            onMouseLeave={onMouseLeave}
            className={`relative w-16 h-16 bg-black/50 border-2 ${RARITY_COLORS[item.rarity]} rounded flex items-center justify-center cursor-pointer hover:bg-axiom-cyan/20 transition-colors`}
        >
             <span className="text-2xl">⚔️</span>
             {item.setName && <div className="absolute top-1 right-1 w-2 h-2 bg-axiom-cyan rounded-full border border-black" title={`Set: ${String(item.setName)}`}></div>}
        </div>
    );
};

const ActiveSetBonuses: React.FC<{ agent: Agent }> = ({ agent }) => {
    const setCounts: Record<string, number> = {};
    
    const equipment = agent.equipment;
    (Object.keys(equipment) as (keyof typeof equipment)[]).forEach(slot => {
        const item = equipment[slot];
        if (item?.setName) {
            setCounts[item.setName] = (setCounts[item.setName] || 0) + 1;
        }
    });

    const activeBonuses: any[] = [];
    Object.entries(setCounts).forEach(([setName, count]) => {
        const setDef = ITEM_SETS[setName];
        if (!setDef) return;

        Object.keys(setDef).forEach((thresholdStr) => {
            const threshold = Number(thresholdStr);
            const effects = (setDef as any)[threshold];
            if (count >= threshold && Array.isArray(effects)) {
                activeBonuses.push(...effects);
            }
        });
    });

    if (activeBonuses.length === 0) return null;

    return (
        <div className="mt-4">
            <h3 className="text-green-400 text-xs font-bold uppercase mb-2 tracking-widest">Set Bonuses</h3>
            <div className="space-y-1 text-sm bg-black/20 p-2 rounded">
                {activeBonuses.map((effect, i) => (
                    <div key={`${String(effect.description)}-${i}`} className="text-green-300 text-xs text-gray-400">
                        {String(effect.description)}
                    </div>
                ))}
            </div>
        </div>
    );
};

const CATEGORY_COLORS: Record<SkillCategory, string> = {
    COMBAT: 'text-red-400',
    GATHERING: 'text-green-400',
    CRAFTING: 'text-yellow-400',
    UTILITY: 'text-purple-400',
};

const SkillIcon = ({ iconName, className }: { iconName: string, className: string }) => {
  switch (iconName) {
    case 'Pickaxe': return <Pickaxe className={className} />;
    case 'Hammer': return <Hammer className={className} />;
    case 'Swords': return <Swords className={className} />;
    case 'Brain': return <Brain className={className} />;
    default: return null;
  }
};

export const CharacterSheet = () => {
    const selectedAgentId = useStore(state => state.selectedAgentId);
    const agents = useStore(state => state.agents);
    const toggleWindow = useStore(state => state.toggleWindow);
    const minimizeWindow = useStore(state => state.minimizeWindow);
    const equipItem = useStore(state => state.equipItem);
    const unequipItem = useStore(state => state.unequipItem);
    const moveInventoryItem = useStore(state => state.moveInventoryItem);
    const allocateStatPoint = useStore(state => state.allocateStatPoint);
    
    const agent = agents.find(a => a.id === selectedAgentId);
    
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [tooltip, setTooltip] = useState<{item: Item, pos: {x: number, y: number}} | null>(null);
    const [activeTab, setActiveTab] = useState<'GEAR' | 'SKILLS' | 'MEMORY'>('GEAR');
    const [expandedCategory, setExpandedCategory] = useState<SkillCategory | null>('COMBAT');

    if (!agent) return null;

    const handleEquip = (item: Item, index: number) => {
        equipItem(agent.id, item, index);
    };

    const handleUnequip = (slot: EquipmentSlotType) => {
        unequipItem(agent.id, slot);
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, toIndex: number) => {
        e.preventDefault();
        if (draggedIndex !== null && draggedIndex !== toIndex) {
            moveInventoryItem(agent.id, draggedIndex, toIndex);
        }
        setDraggedIndex(null);
    };

    const statNames: StatName[] = ['strength', 'dexterity', 'agility', 'stamina', 'health', 'mana', 'intelligence'];

    const groupedSkills = Object.entries(GAME_SKILLS).reduce((acc, [key, def]) => {
        if (!acc[def.category]) acc[def.category] = [];
        acc[def.category].push({ key, ...def });
        return acc;
    }, {} as Record<SkillCategory, Array<{key: string; name: string; category: SkillCategory; icon: string}>>);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4 md:p-10">
            <div className="w-full max-w-[900px] h-full max-h-[750px] bg-axiom-dark border border-axiom-purple/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl pointer-events-auto shadow-[0_0_50px_rgba(79,70,229,0.3)]">
                {tooltip && <ItemTooltip item={tooltip.item} agent={agent} position={tooltip.pos} />}
                
                <div className="p-1 bg-axiom-purple/20 border-b border-axiom-purple/30 flex items-center">
                    <div className="flex-1 flex gap-1 px-4">
                        <button 
                            onClick={() => setActiveTab('GEAR')}
                            className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'GEAR' ? 'text-white border-b-2 border-axiom-cyan' : 'text-gray-500 hover:text-white'}`}
                        >
                            Neural Gear
                        </button>
                        <button 
                            onClick={() => setActiveTab('SKILLS')}
                            className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'SKILLS' ? 'text-white border-b-2 border-axiom-cyan' : 'text-gray-500 hover:text-white'}`}
                        >
                            Skills & Stats
                        </button>
                        <button 
                            onClick={() => setActiveTab('MEMORY')}
                            className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'MEMORY' ? 'text-white border-b-2 border-axiom-cyan' : 'text-gray-500 hover:text-white'}`}
                        >
                            Axiom Memory
                        </button>
                    </div>
                    <div className="flex items-center">
                        <button 
                            onClick={() => minimizeWindow('CHARACTER')} 
                            className="text-gray-500 hover:text-white p-4 transition-colors"
                            title="Minimize"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => toggleWindow('CHARACTER', false)} 
                            className="text-gray-500 hover:text-white p-4 transition-colors"
                            title="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden p-6">
                    {activeTab === 'GEAR' ? (
                        <div className="flex flex-col md:flex-row h-full gap-6">
                            <div className="w-full md:w-1/2 border-r border-white/5 pr-6 flex flex-col justify-between">
                                 <div>
                                    <h3 className="text-axiom-cyan text-[10px] font-bold uppercase mb-4 tracking-widest">Equipment Grid</h3>
                                    <div className="grid grid-cols-3 gap-y-4">
                                        <div></div><EquipmentSlot agent={agent} slot="head" onUnequip={handleUnequip} /><div />
                                        <EquipmentSlot agent={agent} slot="mainHand" onUnequip={handleUnequip} />
                                        <EquipmentSlot agent={agent} slot="chest" onUnequip={handleUnequip} />
                                        <EquipmentSlot agent={agent} slot="offHand" onUnequip={handleUnequip} />
                                        <div></div><EquipmentSlot agent={agent} slot="legs" onUnequip={handleUnequip} /><div />
                                    </div>
                                 </div>
                                 <ActiveSetBonuses agent={agent} />
                            </div>

                            <div className="flex-1 flex flex-col overflow-hidden">
                                <h3 className="text-axiom-cyan text-[10px] font-bold uppercase mb-4 tracking-widest">Neural Inventory ({String(agent.inventory.filter(i => i).length)}/{String(agent.inventory.length)})</h3>
                                <div className="grid grid-cols-4 gap-2 overflow-y-auto pr-2 custom-scrollbar">
                                    {agent.inventory.map((item, index) => (
                                         <div 
                                            key={index} 
                                            onDrop={(e) => handleDrop(e, index)}
                                            onDragOver={(e) => e.preventDefault()}
                                        >
                                            <InventoryItem 
                                                item={item} 
                                                index={index} 
                                                onEquip={handleEquip}
                                                onDragStart={handleDragStart}
                                                onMouseEnter={(item, e) => setTooltip({item, pos: {x: e.clientX, y: e.clientY}})}
                                                onMouseLeave={() => setTooltip(null)}
                                            />
                                        </div>
                                    ))}
                                </div>
                                 <section className="mt-6 bg-axiom-purple/10 p-4 rounded-xl border border-axiom-purple/20 italic text-[11px] text-gray-400 leading-relaxed shadow-inner">
                                  <h4 className="text-[10px] text-axiom-purple not-italic font-black mb-2 uppercase tracking-widest">Neural Monologue</h4>
                                  "{String(agent.loreSnippet || "The consciousness is still forming, grasping at fragmented data streams...")}"
                                </section>
                            </div>
                        </div>
                    ) : activeTab === 'SKILLS' ? (
                        <div className="flex flex-col md:flex-row h-full gap-6 overflow-y-auto">
                            <div className="w-full md:w-1/2 pr-4 overflow-y-auto custom-scrollbar">
                                <h3 className="text-axiom-cyan text-[10px] font-bold uppercase mb-3 tracking-widest">Skill Matrix</h3>
                                {(['COMBAT', 'GATHERING', 'CRAFTING', 'UTILITY'] as SkillCategory[]).map(cat => (
                                    <div key={cat} className="mb-3">
                                        <button 
                                            onClick={() => setExpandedCategory(expandedCategory === cat ? null : cat)}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg bg-black/30 border border-white/5 hover:border-white/20 transition-all ${CATEGORY_COLORS[cat]}`}
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-widest">{cat}</span>
                                            <ChevronRight className={`w-3 h-3 transition-transform ${expandedCategory === cat ? 'rotate-90' : ''}`} />
                                        </button>
                                        {expandedCategory === cat && groupedSkills[cat]?.map(skill => {
                                            const entry = agent.skills?.[skill.key] || { level: 1, xp: 0 };
                                            const xpNeeded = getXPForNextLevel(entry.level);
                                            return (
                                                <div key={skill.key} className="mt-1 bg-black/20 p-3 rounded-lg border border-white/5">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                          <SkillIcon iconName={skill.icon} className="w-3 h-3 text-white/40" />
                                                          <span className="text-xs text-white font-bold">{skill.name}</span>
                                                        </div>
                                                        <span className="text-[10px] text-axiom-cyan font-mono">Lv.{entry.level}</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden mb-1 border border-white/5 shadow-inner">
                                                        <div 
                                                          className={`h-full axiom-gradient transition-all duration-1000 ease-out`} 
                                                          style={{ width: `${Math.min(100, (entry.xp / xpNeeded) * 100)}%` }} 
                                                        />
                                                    </div>
                                                    <div className="flex justify-between text-[8px] text-gray-500 uppercase font-black">
                                                      <span>Exp Tracker</span>
                                                      <span>{entry.xp} / {xpNeeded} XP</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                            <div className="w-full md:w-1/2 pl-4 border-l border-white/5">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-axiom-gold text-[10px] font-bold uppercase tracking-widest">Stat Allocation</h3>
                                    {(agent.unspentStatPoints || 0) > 0 && (
                                        <span className="bg-axiom-gold/20 text-axiom-gold text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">
                                            {agent.unspentStatPoints} points available
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {statNames.map(stat => (
                                        <div key={stat} className="flex items-center gap-3 bg-black/30 p-2.5 rounded-lg border border-white/5">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-white font-bold capitalize">{stat}</span>
                                                    <span className="text-sm text-axiom-cyan font-mono font-bold">{(agent as any)[stat] ?? 10}</span>
                                                </div>
                                                <span className="text-[8px] text-gray-500">{STAT_DESCRIPTIONS[stat]}</span>
                                            </div>
                                            {(agent.unspentStatPoints || 0) > 0 && (
                                                <button
                                                    onClick={() => allocateStatPoint(agent.id, stat)}
                                                    className="w-8 h-8 bg-axiom-gold/20 hover:bg-axiom-gold/40 border border-axiom-gold/50 rounded-lg text-axiom-gold font-bold transition-all active:scale-90 flex items-center justify-center"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 bg-black/20 p-3 rounded-xl border border-white/5">
                                    <h4 className="text-[10px] text-gray-400 font-black uppercase mb-2">Combat Stats</h4>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="flex justify-between"><span className="text-gray-500">HP</span> <span className="text-red-400">{Math.floor(agent.hp)}/{agent.maxHp}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">STR</span> <span className="text-white">{agent.str}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">AGI</span> <span className="text-white">{agent.agi}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">INT</span> <span className="text-white">{agent.int}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">VIT</span> <span className="text-white">{agent.vit}</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <AgentMemoryDisplay agentId={agent.id} />
                    )}
                </div>
            </div>
        </div>
    );
};
