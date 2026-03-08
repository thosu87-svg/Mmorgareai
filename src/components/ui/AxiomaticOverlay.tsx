
"use client";

import { useStore } from '@/store';

export const AxiomaticOverlay = () => {
    const settings = useStore(state => state.emergenceSettings);
    const chunks = useStore(state => state.loadedChunks);

    if (!settings.showAxiomaticOverlay) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[45] overflow-hidden">
            {chunks.map(chunk => (
                <div 
                    key={`chunk-overlay-${chunk.id}`}
                    className="absolute pointer-events-none"
                    style={{
                        left: `${(chunk.x * 400 + 2000) / 40}%`,
                        top: `${(chunk.z * 400 + 2000) / 40}%`,
                        transform: 'translate(-50%, -50%)'
                    }}
                >
                    <div className="flex flex-col items-center">
                        {chunk.logicString && (
                            <div className="text-[10px] font-mono text-axiom-cyan font-black bg-black/60 px-2 py-1 rounded border border-axiom-cyan/20 whitespace-nowrap mb-2 animate-pulse">
                                NODE_{chunk.id} // {chunk.biome}
                            </div>
                        )}
                        
                        {/* Logic Field Grid Visualization */}
                        <div className="grid grid-cols-4 gap-4 p-4 border border-axiom-cyan/10 bg-axiom-cyan/[0.02] rounded-xl backdrop-blur-sm">
                            {(chunk.logicField || Array(16).fill({vx: 0, vz: 0})).map((force, i) => {
                                const angle = Math.atan2(force.vz || 0, force.vx || 0) * (180 / Math.PI);
                                const magnitude = Math.hypot(force.vx || 0, force.vz || 0) * 20;
                                return (
                                    <div 
                                        key={`f-${chunk.id}-${i}`} 
                                        className="w-4 h-4 flex items-center justify-center"
                                    >
                                        <div 
                                            className="relative w-full h-[1.5px] bg-axiom-cyan origin-center transition-all duration-1000"
                                            style={{ 
                                                transform: `rotate(${angle}deg) scaleX(${Math.max(0.5, magnitude)})`,
                                                opacity: Math.max(0.1, magnitude / 10)
                                            }}
                                        >
                                            <div 
                                                className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t border-r border-axiom-cyan rotate-45"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="mt-2 flex gap-2">
                            <div className="text-[7px] font-mono text-gray-500 bg-black/40 px-1 uppercase">ENTROPY: {chunk.entropy?.toFixed(2)}</div>
                            <div className="text-[7px] font-mono text-emerald-500/60 bg-black/40 px-1 uppercase">STABILITY: {chunk.stabilityIndex?.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Axiom Rules HUD */}
            <div className="absolute top-1/2 left-8 -translate-y-1/2 space-y-4">
                {['PERSISTENCE', 'SACREDNESS', 'ANTI-ENTROPY', 'CONNECTIVITY', 'EMERGENCE'].map((rule, i) => (
                    <div key={rule} className="flex items-center gap-3 group">
                        <div className="w-1 h-8 bg-axiom-cyan/20 group-hover:bg-axiom-cyan transition-all" />
                        <div className="flex flex-col">
                            <span className="text-[8px] text-gray-600 font-black">RULE 0{i+1}</span>
                            <span className="text-[10px] text-white font-black uppercase tracking-widest group-hover:text-axiom-cyan transition-colors">{rule}</span>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Ambient Matrix Rain Effect (Simple) */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-screen">
                <div className="w-full h-full bg-[linear-gradient(to_bottom,transparent_0%,#06b6d4_50%,transparent_100%)] bg-[length:100%_4px] animate-matrix-scan" />
            </div>
        </div>
    );
};
