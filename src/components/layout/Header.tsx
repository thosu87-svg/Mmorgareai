"use client"

import { useState } from "react"
import Link from "next/link"
import { Infinity, Menu, X, ArrowRight, Zap, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useUser } from "@/firebase"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user } = useUser()

  const publicItems = [
    { name: "HOME", href: "/" },
    { name: "ABOUT", href: "/about" },
    { name: "CONTACT", href: "/contact" }
  ]

  const secureItems = [
    { name: "NEXUS", href: "/dashboard" },
    { name: "WORLD", href: "/world-preview" },
    { name: "PILOT HUB", href: "/pilot-hub" }
  ]

  const navItems = user ? [...publicItems, ...secureItems] : publicItems

  return (
    <nav className="fixed top-0 w-full z-[100] bg-black/80 backdrop-blur-2xl border-b border-white/5 px-6 lg:px-12 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 group cursor-pointer">
          <div className="h-10 w-10 md:h-12 md:w-12 axiom-gradient rounded-2xl flex items-center justify-center shadow-2xl group-hover:rotate-180 transition-transform duration-1000">
            <Infinity className="h-6 w-6 md:h-7 md:w-7 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-black text-xl md:text-2xl tracking-tighter text-white uppercase italic leading-none">Ouroboros</span>
            <span className="text-[8px] md:text-[9px] text-accent font-black tracking-[0.5em] mt-1 uppercase">Axiom Nexus</span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-8 xl:gap-12">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href} 
              className="text-[10px] xl:text-[11px] font-black tracking-[0.3em] text-white/40 hover:text-accent transition-all uppercase hover:tracking-[0.4em]"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          {user ? (
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 border border-accent/20">
              <ShieldCheck className="h-3 w-3 text-accent" />
              <span className="text-[9px] font-black text-accent uppercase tracking-widest italic">Link Active</span>
            </div>
          ) : (
            <Button variant="ghost" className="hidden sm:flex text-[10px] font-black tracking-widest uppercase text-white/60 hover:text-white border border-white/5 hover:bg-white/5" asChild>
              <Link href="/dashboard">LOGIN_TERMINAL</Link>
            </Button>
          )}
          
          <Button className="axiom-gradient text-white border-0 px-6 md:px-8 h-10 md:h-12 font-black text-[10px] md:text-[11px] tracking-widest shadow-2xl rounded-xl uppercase italic group" asChild>
            <Link href={user ? "/world-preview" : "/character-creator"}>
              {user ? "ENTER_SIMULATION" : "START_JOURNEY"} <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <button className="lg:hidden p-2 text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed inset-0 z-[90] bg-black/98 backdrop-blur-3xl lg:hidden flex flex-col items-center justify-center gap-10"
          >
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                href={item.href} 
                onClick={() => setIsMenuOpen(false)} 
                className="text-3xl md:text-5xl font-heading font-black text-white italic uppercase tracking-widest hover:text-accent transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <Link 
              href="/dashboard"
              onClick={() => setIsMenuOpen(false)} 
              className="text-xs font-black tracking-[0.5em] uppercase text-accent/60 flex items-center gap-2"
            >
              <Zap className="h-4 w-4" /> System Console
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}