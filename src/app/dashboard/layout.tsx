"use client"

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Badge } from "@/components/ui/badge"
import { useDoc, useFirestore, useMemoFirebase, useUser } from "@/firebase"
import { doc } from "firebase/firestore"
import { AxiomHandshakeModal } from "@/components/game/AxiomHandshakeModal"
import { useState } from "react"
import { useStore } from "@/store"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const db = useFirestore()
  const { user } = useUser()
  const worldRef = useMemoFirebase(() => (db && user) ? doc(db, "worldState", "global") : null, [db, user])
  const { data: worldState } = useDoc(worldRef)
  const isAxiomAuthenticated = useStore(state => state.isAxiomAuthenticated)
  const [handshakeOpen, setHandshakeOpen] = useState(!isAxiomAuthenticated)

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-auto">
        <header className="flex h-16 items-center border-b border-border px-6 justify-between shrink-0 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-headline font-semibold italic uppercase tracking-tight text-white">Ouroboros Oversight</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-[10px] font-black border border-border tracking-widest">
              <div className={`h-2 w-2 rounded-full ${worldState?.tick ? 'bg-accent heartbeat-pulse shadow-[0_0_10px_rgba(96,212,255,0.8)]' : 'bg-muted-foreground'}`} />
              <span>{worldState?.tick ? 'ENGINE_LIVE' : 'ENGINE_STANDBY'}</span>
            </div>
            <Badge variant="outline" className="text-accent border-accent font-black text-[10px] tracking-widest">v0.9.4_STABLE</Badge>
          </div>
        </header>
        {children}
      </SidebarInset>
      
      {handshakeOpen && <AxiomHandshakeModal onClose={() => setHandshakeOpen(false)} />}
    </div>
  )
}