
"use client"

import React from 'react'
import { useStore } from '@/store'
import { X, Book, Scroll, CheckCircle2, ChevronRight, Minus } from 'lucide-react'

export const QuestBoardOverlay = () => {
  const toggleWindow = useStore(state => state.toggleWindow)
  const minimizeWindow = useStore(state => state.minimizeWindow)

  const mockQuests = [
    { id: 1, title: "Axiom Stabilization", status: "Active", progress: 60, desc: "Analyze the logic field at the central Spire." },
    { id: 2, title: "Neural Imprinting", status: "Completed", progress: 100, desc: "Synchronize your consciousness with the core." },
    { id: 3, title: "Shard Extraction", status: "Available", progress: 0, desc: "Gather 5 Axiom shards from the Crystal Peaks." },
  ]

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 pointer-events-none">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={() => toggleWindow('QUESTS', false)} />
      
      <div className="w-full max-w-2xl bg-axiom-dark/95 border border-axiom-cyan/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto animate-in zoom-in-95 duration-300">
        <div className="bg-gradient-to-r from-axiom-cyan/20 to-transparent p-6 flex justify-between items-center border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-axiom-cyan/10 rounded-lg border border-axiom-cyan/30">
              <Book className="w-6 h-6 text-axiom-cyan" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-black text-white tracking-widest uppercase">Chronicle of Deeds</h2>
              <p className="text-[10px] text-axiom-cyan font-mono tracking-widest uppercase opacity-60">Quest Log // ACTIVE_DIRECTORY</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => minimizeWindow('QUESTS')} className="p-2 text-gray-500 hover:text-white"><Minus size={20} /></button>
            <button onClick={() => toggleWindow('QUESTS', false)} className="p-2 text-gray-500 hover:text-red-400"><X size={20} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {mockQuests.map((quest) => (
            <div key={quest.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-axiom-cyan/40 transition-all group flex items-center gap-4">
              <div className={`p-3 rounded-lg ${quest.status === 'Completed' ? 'bg-emerald-500/20' : 'bg-axiom-cyan/10'}`}>
                {quest.status === 'Completed' ? <CheckCircle2 className="text-emerald-500" /> : <Scroll className="text-axiom-cyan" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-white font-bold">{quest.title}</h3>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                    quest.status === 'Completed' ? 'border-emerald-500/30 text-emerald-500' : 'border-axiom-cyan/30 text-axiom-cyan'
                  }`}>
                    {quest.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{quest.desc}</p>
                <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${quest.status === 'Completed' ? 'bg-emerald-500' : 'bg-axiom-cyan'}`} style={{ width: `${quest.progress}%` }} />
                </div>
              </div>
              <ChevronRight className="text-gray-700 group-hover:text-white transition-colors" />
            </div>
          ))}
        </div>

        <div className="p-4 bg-black/40 border-t border-white/5 text-center text-[9px] text-gray-600 font-mono uppercase tracking-[0.3em]">
          End of Local Directory // Persistent Sync Enabled
        </div>
      </div>
    </div>
  )
}
