"use client"

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase"
import { collection, query, limit, orderBy } from "firebase/firestore"
import { Users, Search, MoreHorizontal, UserCheck, Shield, Loader2, AlertCircle, Sparkles, Zap } from "lucide-react"
import { useState } from "react"

export default function PlayersPage() {
  const { user } = useUser()
  const db = useFirestore()
  const [searchQuery, setSearchQuery] = useState("")

  const playersQuery = useMemoFirebase(() => {
    // SECURITY: Prevent unauthorized queries
    if (!db || !user) return null;
    return query(
      collection(db, "players"), 
      orderBy("level", "desc"),
      limit(50)
    );
  }, [db, user]);

  const { data: livePlayers, isLoading, error } = useCollection(playersQuery);

  const filteredPlayers = livePlayers?.filter(player => 
    player.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.id?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-auto">
        <header className="flex h-16 items-center border-b border-border px-6 justify-between shrink-0 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-headline font-semibold italic uppercase tracking-tight">Pilot Directory</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 font-black text-[10px] tracking-widest uppercase italic">
              <UserCheck className="h-3 w-3" />
              Live Nodes: {livePlayers?.length || 0}
            </Button>
          </div>
        </header>

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search pilot signatures..." 
                className="pl-10 bg-secondary/30 border-border" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="secondary" className="gap-2 font-black text-[10px] tracking-widest uppercase italic border border-border">
              <Shield className="h-4 w-4" />
              Security Oversight
            </Button>
          </div>

          <Card className="border-border bg-card overflow-hidden shadow-2xl">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin mb-4 text-accent" />
                <p className="text-xs font-black uppercase tracking-[0.3em] italic">Accessing Neural Database...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-24 text-destructive">
                <AlertCircle className="h-10 w-10 mb-4" />
                <p className="text-xs font-black uppercase tracking-[0.3em] italic">Protocol Error: {error.message}</p>
                <p className="text-[10px] mt-2 opacity-50 uppercase font-bold tracking-widest">Verify Security Rule Sync</p>
              </div>
            ) : !user ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                <Zap className="h-12 w-12 text-accent mb-4" />
                <p className="text-xs font-black uppercase tracking-widest italic">Neural Link Required to access Directory.</p>
              </div>
            ) : filteredPlayers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                <Users className="h-12 w-12 opacity-10 mb-4" />
                <p className="text-xs font-black uppercase tracking-[0.3em] italic">No Active Signatures Found</p>
                <p className="text-[10px] mt-2 opacity-50 uppercase font-bold tracking-widest">Awaiting First Pilot Enrollment</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-secondary/20 border-b border-border">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest italic text-accent">Status</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest italic">Pilot Name</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest italic">Class</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest italic">Level</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest italic">Position</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest italic">Control</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlayers.map((player) => (
                    <TableRow key={player.id} className="border-border/30 axiom-card-hover group">
                      <TableCell>
                        {player.awakened ? (
                          <Badge className="bg-accent/20 text-accent border-accent/40 text-[9px] font-black uppercase tracking-tighter italic">
                            <Sparkles className="h-2 w-2 mr-1" /> Awakened
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-tighter italic opacity-40">
                            Dormant
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-accent heartbeat-pulse" />
                          <span className="font-headline font-bold text-sm tracking-tight">{player.displayName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">{player.npcClass || "PILOT"}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-black text-[10px] border-accent/20 text-accent bg-accent/5">
                          LVL {player.level || 1}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-[10px] text-muted-foreground">
                        {player.position ? `X:${player.position.x?.toFixed(1)} Y:${player.position.y?.toFixed(1)}` : 'NULL_POS'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-50 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </main>
      </SidebarInset>
    </div>
  )
}