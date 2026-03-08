"use client"

import { useEffect, useRef } from "react"
import { useStore } from "@/store"
import { useFirestore, useDoc, useMemoFirebase, useUser } from "@/firebase"
import { doc } from "firebase/firestore"
import dynamic from 'next/dynamic'
import { AgentState } from "@/types"
import { AgentHUD } from "@/components/ui/AgentHUD"
import { MobileControls } from "@/components/game/MobileControls"
import { ChatConsole } from "@/components/ui/ChatConsole"
import { AxiomaticOverlay } from "@/components/ui/AxiomaticOverlay"
import { CharacterSheet } from "@/components/ui/CharacterSheet"
import { AuctionHouseOverlay } from "@/components/ui/AuctionHouseOverlay"
import { QuestBoardOverlay } from "@/components/ui/QuestBoardOverlay"
import { SkillBar } from "@/components/ui/SkillBar"
import { ShaderController } from "@/components/ui/ShaderController"

const World3D = dynamic(() => import('@/components/game/World3D'), { 
  ssr: false,
  loading: () => <div className="w-full h-screen bg-black flex items-center justify-center text-axiom-cyan font-headline animate-pulse uppercase tracking-[0.5em] text-xl">LOADING WORLD ENGINE...</div>
})

export default function WorldPreviewPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { setChunks, setAgents, agents, setIsMobile, windowStates } = useStore()
  const initializedRef = useRef(false)
  
  const worldRef = useMemoFirebase(() => db ? doc(db, "worldState", "global") : null, [db])
  const { data: worldState } = useDoc(worldRef)

  useEffect(() => {
    const checkMobile = () => {
      // Force mobile controls if touch capability detected or screen small
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024;
      setIsMobile(isTouch);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobile]);

  useEffect(() => {
    if (initializedRef.current || !user) return;
    initializedRef.current = true;

    const mockChunk = {
      id: "0_0", 
      x: 0, 
      z: 0, 
      seed: 1337, 
      biome: 'CITY' as const,
      entropy: 0.05, 
      stabilityIndex: 0.95, 
      corruptionLevel: 0.01, 
      resourceData: {},
      logicField: [],
      lastUpdate: new Date(),
      logicString: "AXIOM_PRIME_NODE"
    };
    
    setChunks([mockChunk]);

    const existingPlayer = agents.find(a => a.id === user.uid);
    if (!existingPlayer) {
      setAgents([{
        id: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || "Pilot",
        npcClass: "PILOT",
        level: 1,
        hp: 100,
        maxHp: 100,
        exp: 0,
        str: 10,
        agi: 10,
        int: 10,
        vit: 10,
        // Spawn offset to avoid getting stuck in Spire center
        position: { x: 20, y: 0, z: 20 },
        visionRange: 100,
        state: AgentState.IDLE,
        inventory: Array(10).fill(null),
        bank: Array(50).fill(null),
        equipment: {
          head: null,
          chest: null,
          legs: null,
          mainHand: null,
          offHand: null
        },
        dnaHistory: [],
        memoryCache: [],
        thinkingMatrix: {
          personality: "Standard Axiomatic",
          currentLongTermGoal: "Establishing Foundation",
          alignment: 0.5,
          languagePreference: "EN",
          sociability: 0.5,
          aggression: 0.5,
          curiosity: 0.5,
          frugality: 0.5
        },
        awakened: true,
        lastUpdate: new Date(),
        appearance: {
          skinTone: '#c68642',
          hairStyle: 'short',
          bodyScale: 1.0
        },
        skills: {
          mining: { level: 1, xp: 0 },
          smithing: { level: 1, xp: 0 },
          combat: { level: 1, xp: 0 },
          reflection: { level: 1, xp: 0 }
        }
      }]);
    }
    
    useStore.getState().setUserApiKey(user.uid); 
  }, [user, setChunks, setAgents, agents]);

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative touch-none select-none">
      <World3D 
        tick={worldState?.tick || 0} 
        civilizationIndex={worldState?.civilizationIndex || 0} 
        localPlayerId={user?.uid} 
      />
      
      {/* Input Overlays */}
      <MobileControls />

      {/* World HUD */}
      <div className="absolute top-0 left-0 w-full p-6 pointer-events-none flex justify-between items-start z-40">
        <div className="flex flex-col gap-4 pointer-events-auto">
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl space-y-1 shadow-2xl">
            <div className="text-[8px] font-black text-axiom-cyan uppercase tracking-[0.3em] italic">Axiom Frontier Core</div>
            <div className="text-xl font-headline font-black text-white italic tracking-tighter uppercase leading-none">
              CI: {worldState?.civilizationIndex?.toFixed(2) || "0.00"}
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] font-bold text-white/60 uppercase">Sync: Tick {worldState?.tick || 0}</span>
            </div>
          </div>
          
          <ShaderController />
        </div>
      </div>

      <div className="absolute top-0 right-0 p-6 pointer-events-none z-40">
        <AgentHUD />
      </div>

      {/* Bottom UI Row */}
      <div className="absolute bottom-6 left-0 w-full px-6 flex justify-between items-end pointer-events-none z-40 gap-6">
        <div className="flex-1 max-w-2xl">
          <SkillBar />
        </div>
        <div className="w-[450px] hidden lg:block">
          <ChatConsole />
        </div>
      </div>

      {/* Logic Overlays */}
      <AxiomaticOverlay />

      {/* Modals & Overlays - MOUNTING CHECKS */}
      {windowStates.CHARACTER.isOpen && <CharacterSheet />}
      {windowStates.AUCTION.isOpen && <AuctionHouseOverlay />}
      {windowStates.QUESTS.isOpen && <QuestBoardOverlay />}
    </div>
  )
}