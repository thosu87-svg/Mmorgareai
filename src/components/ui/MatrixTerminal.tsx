"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Terminal, Cpu, Activity, Zap } from 'lucide-react';

const MOCK_EVENTS = [
  "Axiom pulse detected in Sector 0_0",
  "Neural entity 'Ghost_42' initialized reflection cycle",
  "Economic variance: AXM liquidity increased by 0.2%",
  "Chunk 4_12 stability index updated: 0.98",
  "Anomaly detected: Logic drift in deep matrix",
  "Persistence ledger committed: Tick 1842",
  "New guild 'The Weavers' manifesting in Nebula Edge",
  "Resource node 'Iron_Alpha' exhausted",
  "Pilot connection established: Node_77",
  "Engine status: Nominal. Synchronization active.",
];

export const MatrixTerminal = () => {
  const [logs, setLogs] = useState<{id: string, text: string, type: string}[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const event = MOCK_EVENTS[Math.floor(Math.random() * MOCK_EVENTS.length)];
      setLogs(prev => [
        { id: Math.random().toString(), text: event, type: 'INFO' },
        ...prev
      ].slice(0, 20));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs]);

  return (
    <div className="bg-[#050508] border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative group">
      <div className="matrix-terminal-overlay absolute inset-0 z-10" />
      <div className="scanline" />
      
      <div className="bg-secondary/20 p-4 border-b border-white/5 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-3">
          <Terminal className="h-4 w-4 text-accent" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80 italic">Simulation_Ledger_v1.0.6</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Cpu className="h-3 w-3 text-emerald-500" />
            <span className="text-[8px] font-bold text-emerald-500 uppercase">Load: 12%</span>
          </div>
          <div className="h-2 w-2 rounded-full bg-accent heartbeat-pulse" />
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="h-[300px] overflow-y-auto p-6 font-code space-y-3 relative z-20 custom-scrollbar"
      >
        {logs.map((log) => (
          <div key={log.id} className="flex gap-4 animate-in fade-in slide-in-from-left-2 duration-500">
            <span className="text-accent/40 text-[9px] shrink-0">[{new Date().toLocaleTimeString()}]</span>
            <p className="text-white/60 text-[10px] leading-relaxed uppercase tracking-tight">
              <span className="text-accent mr-2">»</span>
              {log.text}
            </p>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-20">
            <Activity className="h-8 w-8 text-white mb-2 animate-pulse" />
            <p className="text-[8px] font-black uppercase tracking-widest">Awaiting Data Stream...</p>
          </div>
        )}
      </div>

      <div className="bg-black/40 p-3 text-center border-t border-white/5 relative z-20">
        <span className="text-[7px] text-gray-600 font-mono uppercase tracking-[0.5em]">Deterministic Logic Chain Alpha-9</span>
      </div>
    </div>
  );
};