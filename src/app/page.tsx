"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Pickaxe, 
  Hammer,
  Swords,
  Brain,
  Play,
  Monitor,
  Trophy,
  Infinity,
  Layers,
  Activity,
  Globe,
  Zap 
} from "lucide-react"
import { useFirestore, useDoc, useMemoFirebase, useUser } from "@/firebase"
import { doc } from "firebase/firestore"
import Image from "next/image"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { motion } from "framer-motion"

export default function MMORPGPortal() {
  const db = useFirestore()
  const { user } = useUser()
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape')
  
  // Publicly readable world state
  const worldRef = useMemoFirebase(() => db ? doc(db, "worldState", "global") : null, [db])
  const { data: worldState } = useDoc(worldRef)

  useEffect(() => {
    const handleResize = () => {
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait')
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const getImg = (id: string) => PlaceHolderImages.find(img => img.id === id)

  return (
    <div className="min-h-screen bg-[#020203] text-[#e8dfc8] selection:bg-accent selection:text-accent-foreground font-body overflow-x-hidden">
      <div className="fixed inset-0 z-0">
        <Image 
          src={getImg('world-chrome')?.imageUrl || "https://images.unsplash.com/photo-1605142859862-978be7eba909"} 
          alt="Ouroboros Nexus" 
          fill 
          className="object-cover opacity-40 scale-105"
          priority
          data-ai-hint="cyberpunk city"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-[#020203]/80 to-[#020203]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(123,79,212,0.15),transparent_70%)]" />
      </div>

      <main className="relative z-10 pt-24 md:pt-32 lg:pt-48">
        <section className={`px-6 lg:px-12 pb-20 flex flex-col items-center text-center max-w-7xl mx-auto ${orientation === 'portrait' ? 'pt-8' : 'pt-0'}`}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-4 px-4 md:px-6 py-2 rounded-full bg-accent/10 border border-accent/30 backdrop-blur-xl mb-8 md:mb-12"
          >
            <div className="flex gap-1.5">
              <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-accent heartbeat-pulse" />
              <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-accent heartbeat-pulse delay-75" />
              <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-accent heartbeat-pulse delay-150" />
            </div>
            <span className="text-[8px] md:text-[10px] font-black tracking-[0.4em] text-accent uppercase">
              Simulation Status: Online // Tick {worldState?.tick || 0} // Sync: Established
            </span>
          </motion.div>

          <h1 className={`font-heading font-black leading-[0.85] text-white italic tracking-tighter mb-8 md:mb-10 drop-shadow-[0_0_60px_rgba(96,212,255,0.4)] uppercase ${
            orientation === 'portrait' ? 'text-5xl md:text-8xl' : 'text-6xl md:text-9xl lg:text-[10rem]'
          }`}>
            Forge Your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-[#7b4fd4] animate-gradient">MASTERY.</span>
          </h1>

          <p className="text-sm md:text-xl lg:text-2xl text-white/60 max-w-4xl mx-auto font-medium leading-relaxed mb-12 md:mb-16 px-4 uppercase tracking-tight italic">
            No classes. No limits. A skill-based <span className="text-white font-black">AI-MMORPG</span> where your actions define your path. Level up unique skills, trade in a decentralized economy, and carve your legacy.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 md:gap-8 w-full max-w-2xl justify-center px-4">
            <Button size="lg" className="h-16 md:h-20 lg:h-24 px-8 md:px-12 axiom-gradient text-white text-lg md:text-xl font-black italic uppercase tracking-widest rounded-2xl shadow-[0_20px_50px_rgba(31,184,184,0.3)] hover:scale-105 transition-all group flex-1" asChild>
              <Link href="/character-creator">
                <Play className="mr-3 h-6 w-6 md:h-7 md:w-7 group-hover:scale-110 fill-current" />
                Play Now
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-16 md:h-20 lg:h-24 px-8 md:px-12 border-white/10 bg-white/5 backdrop-blur-xl text-white text-lg md:text-xl font-black italic uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all flex-1 shadow-2xl" asChild>
              <Link href="/world-preview">
                <Monitor className="mr-3 h-5 w-5 md:h-6 md:w-6" />
                World Preview
              </Link>
            </Button>
          </div>
        </section>

        <div className="w-full bg-accent/5 border-y border-accent/20 py-3 md:py-4 mb-16 md:mb-20 overflow-hidden whitespace-nowrap">
          <div className="flex animate-marquee gap-20">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-widest italic">
                  Axiomatic Load: 64.2% // Skill Persistence: Active // Collective Yield: +2.1% // Sector 0_0: Stable
                </span>
              </div>
            ))}
          </div>
        </div>

        <section id="skill-matrix" className="px-6 lg:px-12 py-20 md:py-32 bg-black/40">
          <div className="max-w-7xl auto">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 md:mb-24 gap-10">
              <div className="space-y-4">
                <Badge variant="outline" className="border-accent/30 text-accent font-black tracking-[0.5em] uppercase text-[10px] px-4 py-1">Classless Progression</Badge>
                <h3 className="text-4xl md:text-7xl lg:text-8xl font-heading font-black text-white italic uppercase tracking-tighter">The Mastery.</h3>
              </div>
              <p className="text-white/40 text-xs md:text-sm max-w-md uppercase font-bold tracking-[0.2em] leading-loose border-l-2 border-accent pl-8">
                Your character is a blank slate. Master individual skills through action. Your specialization is a reflection of your journey, not a choice at start.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                { name: 'MINING', icon: Pickaxe, color: 'text-axiom-gold', bg: 'bg-axiom-gold/5', desc: 'Extract raw logic shards from the world foundation.' },
                { name: 'FORGING', icon: Hammer, color: 'text-red-500', bg: 'bg-red-500/5', desc: 'Shape Axiom energy into permanent, high-fidelity equipment.' },
                { name: 'COMBAT', icon: Swords, color: 'text-accent', bg: 'bg-accent/5', desc: 'Purge corruption protocols through tactical neural engagement.' },
                { name: 'REFLECTION', icon: Brain, color: 'text-[#7b4fd4]', bg: 'bg-[#7b4fd4]/5', desc: 'Expand your neural capacity to unlock deeper world interactions.' }
              ].map((cls) => (
                <motion.div 
                  key={cls.name}
                  whileHover={{ y: -10 }}
                  className={`group p-8 md:p-10 rounded-[2.5rem] border border-white/5 ${cls.bg} hover:border-accent/40 transition-all duration-700 flex flex-col gap-8 shadow-2xl relative overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <cls.icon className="h-24 w-24 md:h-32 md:w-32" />
                  </div>
                  <div className={`h-16 w-16 md:h-20 md:w-20 rounded-2xl ${cls.bg} border border-white/10 flex items-center justify-center ${cls.color} group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 shadow-inner`}>
                    <cls.icon className="h-8 w-8 md:h-10 md:w-10" />
                  </div>
                  <div>
                    <h4 className="text-2xl md:text-3xl font-heading font-black text-white italic uppercase mb-3 tracking-tighter">{cls.name}</h4>
                    <p className="text-[10px] md:text-xs text-white/40 leading-relaxed font-bold uppercase tracking-tight">{cls.desc}</p>
                  </div>
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Tier 01 // Level 0</span>
                    <Trophy className="h-3 w-3 text-white/10" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 lg:px-12 py-20 md:py-32 border-y border-white/5 bg-black/20">
          <div className="max-w-7xl mx-auto grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Persistence", icon: Layers, val: "IMMUTABLE", desc: "Every trade, every kill, recorded forever.", color: "text-accent" },
              { title: "Neural NPC", icon: Zap, val: "AUTONOMOUS", desc: "Entities with unique memories and goals.", color: "text-[#7b4fd4]" },
              { title: "Economy", icon: Globe, val: "DECENTRALIZED", desc: "Player-driven trade and resource flow.", color: "text-[#c9a227]" },
              { title: "Latency", icon: Activity, val: "ZERO_LAG", desc: "Instant sync between React and Godot.", color: "text-emerald-500" }
            ].map((stat, i) => (
              <div key={i} className="p-8 md:p-10 rounded-[2.5rem] bg-secondary/10 border border-white/10 backdrop-blur-sm axiom-card-hover flex flex-col items-center text-center">
                <stat.icon className={`h-10 w-10 md:h-12 md:w-12 mb-6 md:mb-8 ${stat.color}`} />
                <div className="text-2xl md:text-3xl font-heading font-black text-white mb-2">{stat.val}</div>
                <div className="text-[9px] md:text-[10px] font-black text-accent tracking-[0.4em] uppercase mb-4 italic">{stat.title}</div>
                <p className="text-[10px] md:text-xs text-white/40 font-bold uppercase tracking-tight">{stat.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="py-24 md:py-48 px-6 lg:px-12 border-t border-white/5 bg-black relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-16 md:gap-20">
          <div className="flex items-center gap-6 md:gap-8 group cursor-pointer">
            <div className="h-16 w-16 md:h-20 md:w-20 axiom-gradient rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(31,184,184,0.4)] transition-all group-hover:rotate-180 duration-1000">
              <Infinity className="h-8 w-8 md:h-10 md:w-10 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-black text-4xl md:text-5xl tracking-tighter text-white uppercase italic leading-none">Ouroboros</span>
              <span className="text-[8px] md:text-[10px] text-accent font-black tracking-[0.6em] mt-2 uppercase">Axiom Frontier Core</span>
            </div>
          </div>
          
          <div className="text-[9px] md:text-[11px] font-black text-white/10 tracking-[0.4em] uppercase italic text-center lg:text-right space-y-2">
            <div>&copy; 2025 Ouroboros Collective</div>
            <div className="text-accent/20">Deterministic Engine Stable v1.0.6</div>
          </div>
        </div>
      </footer>
    </div>
  )
}