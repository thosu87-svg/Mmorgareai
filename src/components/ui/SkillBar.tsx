"use client"

import React from 'react'
import { useStore } from '@/store'
import { Pickaxe, Hammer, Swords, Brain, Shield, Crosshair, Zap, Package, Compass, Activity, LifeBuoy } from 'lucide-react'

const ACTIONS = [
  { id: 'attack', label: 'ATTACK', icon: Crosshair, color: 'text-red-500', key: '1' },
  { id: 'block', label: 'BLOCK', icon: Shield, color: 'text-blue-500', key: '2' },
  { id: 'mine', label: 'MINE', icon: Pickaxe, color: 'text-axiom-gold', key: '3' },
  { id: 'forge', label: 'FORGE', icon: Hammer, color: 'text-orange-500', key: '4' },
  { id: 'reflect', label: 'REFLECT', icon: Brain, color: 'text-axiom-purple', key: '5' },
  { id: 'gather', label: 'GATHER', icon: Package, color: 'text-emerald-500', key: '6' },
  { id: 'scan', label: 'SCAN', icon: Compass, color: 'text-axiom-cyan', key: '7' },
  { id: 'burst', label: 'BURST', icon: Zap, color: 'text-yellow-400', key: '8' },
  { id: 'unstuck', label: 'UNSTUCK', icon: LifeBuoy, color: 'text-white', key: 'U' },
]

export const SkillBar = () => {
  const { agents, selectedAgentId, addLog, unstuckPlayer } = useStore()
  const agent = agents.find(a => a.id === selectedAgentId)

  if (!agent) return null

  const handleAction = (id: string) => {
    if (id === 'unstuck') {
      unstuckPlayer(agent.id);
      addLog(`Teleporting consciousness to safe coordinate matrix...`, 'SYSTEM');
      return;
    }
    addLog(`Axiomatic action triggered: ${id.toUpperCase()}`, 'SYSTEM');
  }

  return (
    <div className="bg-black/80 backdrop-blur-2xl border border-white/10 p-3 rounded-[2rem] flex items-center gap-3 pointer-events-auto shadow-2xl overflow-hidden max-w-full">
      <div className="flex gap-2 items-center overflow-x-auto scrollbar-hide px-2">
        {ACTIONS.map((action, i) => (
          <button
            key={action.id}
            onClick={() => handleAction(action.id)}
            className="group relative flex flex-col items-center justify-center min-w-[60px] h-16 md:min-w-[70px] md:h-20 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all active:scale-90"
          >
            <action.icon className={`w-6 h-6 md:w-7 md:h-7 ${action.color} group-hover:scale-110 transition-transform`} />
            <span className="text-[7px] md:text-[8px] font-black text-white/40 tracking-widest mt-1 uppercase group-hover:text-white/80">{action.label}</span>
            <div className="absolute top-1 right-2 text-[8px] font-mono text-white/20">{action.key}</div>
            
            {/* Slot Highlight */}
            <div className={`absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/10 pointer-events-none`} />
          </button>
        ))}
      </div>
    </div>
  )
}