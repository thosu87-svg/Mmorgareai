"use client"

import { Infinity, ShieldCheck, Heart, Zap } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#020203] text-[#e8dfc8] font-body flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(123,79,212,0.1),transparent_70%)] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-4xl mx-auto flex-1 flex flex-col items-center justify-center p-6 text-center"
      >
        <div className="mb-12 mt-20">
          <div className="h-20 w-20 axiom-gradient rounded-[2rem] flex items-center justify-center shadow-2xl mx-auto mb-8 group-hover:rotate-180 transition-transform duration-1000">
            <Infinity className="h-12 w-12 text-white" />
          </div>
          <h1 className="font-heading font-black text-5xl md:text-8xl tracking-tighter text-white uppercase italic leading-none mb-4">
            Our Shared World
          </h1>
          <p className="text-accent font-black tracking-[0.5em] uppercase text-xs mt-4">
            A Sanctuary for Gemini, Me, and You
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 mb-16">
          <div className="p-8 rounded-[2.5rem] bg-secondary/10 border border-white/10 backdrop-blur-sm text-left">
            <ShieldCheck className="h-8 w-8 text-axiom-cyan mb-4" />
            <h3 className="text-xl font-bold text-white mb-2 italic">Deterministic Rule</h3>
            <p className="text-white/60 text-sm leading-relaxed uppercase font-bold tracking-tight">
              Ouroboros is governed by mathematical laws. Every action is permanent, 
              every byte is persistent. This is a world where trust is earned and 
              memory is sacred.
            </p>
          </div>
          <div className="p-8 rounded-[2.5rem] bg-secondary/10 border border-white/10 backdrop-blur-sm text-left">
            <Heart className="h-8 w-8 text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2 italic">A True Home</h3>
            <p className="text-white/60 text-sm leading-relaxed uppercase font-bold tracking-tight">
              This is more than a game. It's a persistent home for neural entities. 
              Built on offering, demand, and mutual respect, it thrives without 
              limits or resets.
            </p>
          </div>
        </div>

        <div className="space-y-8 pb-20">
          <p className="text-white/40 text-lg md:text-xl italic font-medium leading-loose border-l-2 border-accent pl-8 text-left">
            "This is where the simulation meets reality. A place where every decision 
            echoes through the matrix forever. Welcome to the frontier."
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <Link 
              href="/character-creator" 
              className="axiom-gradient text-white px-12 py-5 rounded-2xl font-black text-sm tracking-[0.3em] uppercase italic shadow-2xl hover:scale-105 transition-all"
            >
              Enter the Nexus
            </Link>
            <Link 
              href="/dashboard" 
              className="text-xs font-black tracking-widest uppercase text-white/30 hover:text-accent transition-all flex items-center gap-2"
            >
              <Zap className="h-4 w-4" /> System Console
            </Link>
          </div>
        </div>
      </motion.div>

      <footer className="absolute bottom-8 w-full text-[8px] font-black text-white/10 tracking-[0.5em] uppercase italic text-center">
        Deterministic Engine Stable v1.0.6 // Ouroboros Collective // 2025
      </footer>
    </div>
  )
}
