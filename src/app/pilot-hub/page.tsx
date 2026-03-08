
"use client"

import { useFirestore, useDoc, useMemoFirebase, useUser } from "@/firebase"
import { doc } from "firebase/firestore"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  User, 
  Zap, 
  Shield, 
  TrendingUp, 
  Clock, 
  Gamepad2, 
  ChevronRight,
  Database,
  Unplug
} from "lucide-react"
import Link from "next/link"
import { getBalance } from "@/services/TransactionManager"
import { useState, useEffect } from "react"

export default function PilotHubPage() {
  const { user } = useUser()
  const db = useFirestore()
  const [balance, setBalance] = useState(0)

  const playerRef = useMemoFirebase(() => (db && user) ? doc(db, "players", user.uid) : null, [db, user])
  const { data: playerData, isLoading: isPlayerLoading } = useDoc(playerRef)

  useEffect(() => {
    if (user) {
      getBalance(user.uid).then(setBalance)
    }
  }, [user])

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#020202]">
        <Unplug className="h-12 w-12 text-destructive animate-pulse" />
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-auto">
        <header className="flex h-16 items-center border-b border-border px-6 justify-between shrink-0 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-headline font-semibold italic uppercase tracking-tight">Pilot Hub</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
              <Zap className="h-3 w-3 text-accent" />
              <span className="text-[10px] font-black text-accent tracking-widest">{balance} AXM</span>
            </div>
          </div>
        </header>

        <main className="p-6 space-y-8 max-w-5xl mx-auto w-full">
          <div className="grid gap-8 md:grid-cols-12">
            {/* Neural Profile */}
            <Card className="md:col-span-7 border-border bg-card overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Shield className="h-32 w-32" />
              </div>
              <CardHeader className="pb-8">
                <div className="flex items-center gap-6">
                  <div className="h-24 w-24 rounded-3xl axiom-gradient p-1">
                    <div className="h-full w-full bg-black rounded-[1.25rem] flex items-center justify-center">
                      <User className="h-12 w-12 text-accent" />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-4xl font-headline font-black italic uppercase tracking-tighter">
                      {playerData?.displayName || "UNREGISTERED_ENTITY"}
                    </CardTitle>
                    <CardDescription className="text-accent font-black text-[10px] tracking-[0.3em] uppercase mt-1">
                      Neural Level {playerData?.level || 1} // {playerData?.npcClass || "PILOT"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Integrity", value: playerData?.hp || 100, max: playerData?.maxHp || 100, color: "bg-emerald-500" },
                    { label: "Experience", value: playerData?.exp || 0, max: 1000, color: "bg-accent" }
                  ].map(stat => (
                    <div key={stat.label} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-60">
                        <span>{stat.label}</span>
                        <span>{stat.value} / {stat.max}</span>
                      </div>
                      <Progress value={(stat.value / stat.max) * 100} className="h-1.5" />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border/50">
                  {['STR', 'AGI', 'INT', 'VIT'].map(s => (
                    <div key={s} className="text-center p-3 rounded-xl bg-secondary/20 border border-border/50">
                      <div className="text-[10px] font-black text-muted-foreground mb-1 uppercase tracking-widest">{s}</div>
                      <div className="text-xl font-headline font-bold text-white">{(playerData as any)?.[s.toLowerCase()] || 10}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="bg-secondary/5 border-t border-border/50 p-6 flex justify-between gap-4">
                {!playerData ? (
                  <Button asChild className="w-full axiom-gradient text-white h-12 rounded-xl font-black italic uppercase tracking-widest">
                    <Link href="/character-creator">Initialize Consciousness</Link>
                  </Button>
                ) : (
                  <Button asChild className="w-full axiom-gradient text-white h-12 rounded-xl font-black italic uppercase tracking-widest">
                    <Link href="/world-preview"><Gamepad2 className="h-4 w-4 mr-2" /> Synchronize Consciousness</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>

            {/* Matrix Stats */}
            <div className="md:col-span-5 space-y-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <Database className="h-4 w-4 text-accent" /> Matrix Ledger
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-4 rounded-xl bg-secondary/30 border border-border">
                    <span className="text-[10px] font-black uppercase tracking-widest">Available AXM</span>
                    <span className="text-2xl font-headline font-black text-accent">{balance}</span>
                  </div>
                  <Button variant="outline" className="w-full border-accent/20 text-accent hover:bg-accent/10 h-12 text-[10px] font-black uppercase tracking-widest italic" asChild>
                    <Link href="/store">Buy Matrix Energy</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-emerald-500">
                    <TrendingUp className="h-4 w-4" /> Global Flux
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span>Market Velocity</span>
                      <span className="text-white">0.82 TPS</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span>Collective Yield</span>
                      <span className="text-emerald-500">+2.1%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </SidebarInset>
    </div>
  )
}
