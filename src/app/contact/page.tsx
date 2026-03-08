"use client"

import { Mail, MessageSquare, Zap } from "lucide-react"
import { motion } from "framer-motion"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#020203] text-[#e8dfc8] font-body relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(123,79,212,0.1),transparent_70%)] pointer-events-none" />
      
      <main className="relative z-10 pt-32 px-6 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full text-center space-y-12"
        >
          <div className="space-y-4">
            <h1 className="font-heading font-black text-5xl md:text-7xl italic uppercase tracking-tighter text-white">
              Signal established.
            </h1>
            <p className="text-accent font-black tracking-[0.5em] uppercase text-xs">
              Direct link to the Ouroboros Collective
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-8 rounded-[2.5rem] bg-secondary/10 border border-white/10 backdrop-blur-sm group hover:border-accent/40 transition-all text-left">
              <Mail className="h-8 w-8 text-axiom-cyan mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-2 italic">Neural Mail</h3>
              <p className="text-white/40 text-xs font-bold uppercase tracking-tight mb-4">Inquiries regarding simulation protocols.</p>
              <a href="mailto:collective@ouroboros.frontier" className="text-axiom-cyan font-mono text-sm hover:underline">collective@ouroboros.frontier</a>
            </div>
            
            <div className="p-8 rounded-[2.5rem] bg-secondary/10 border border-white/10 backdrop-blur-sm group hover:border-accent/40 transition-all text-left">
              <MessageSquare className="h-8 w-8 text-axiom-purple mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-2 italic">Matrix Support</h3>
              <p className="text-white/40 text-xs font-bold uppercase tracking-tight mb-4">Immediate assistance for corrupted Wesenheiten.</p>
              <button className="text-axiom-purple font-mono text-sm hover:underline">Open Encrypted Channel</button>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 opacity-30 flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] italic">
            <Zap className="h-3 w-3" /> Secure Node v1.0.6 // Port 9002
          </div>
        </motion.div>
      </main>

      <footer className="absolute bottom-8 w-full text-[8px] font-black text-white/10 tracking-[0.5em] uppercase italic text-center">
        Ouroboros Collective // 2025 // No resets. No voids.
      </footer>
    </div>
  )
}
