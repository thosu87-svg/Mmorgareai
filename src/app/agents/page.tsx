"use client"

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase"
import { collection, query, limit, orderBy } from "firebase/firestore"
import { Cpu, Activity, Loader2, AlertTriangle, UserCheck, Zap, Database } from "lucide-react"
import { Agent } from "@/types"
import { NeuralCacheManager } from "@/services/NeuralCacheManager"

export default function AgentsPage() {
  const { user } = useUser()
  const db = useFirestore()
  const cacheStatus = NeuralCacheManager.getStatus();

  const agentsQuery = useMemoFirebase(() => {
    // SECURITY: Prevent unauthorized queries
    if (!db || !user) return null;
    return query(collection(db, "players"), orderBy("lastUpdate", "desc"), limit(100));
  }, [db, user]);

  const { data: agents, isLoading, error } = useCollection<Agent>(agentsQuery);

  const getStatus = (agent: Agent) => {
    if (agent.hp <= 0) return 'Offline';
    if (agent.hp < agent.maxHp * 0.3) return 'Warning';
    return 'Active';
  };

  const getIntegrity = (agent: Agent) => {
    const max = agent.maxHp || 100;
    const current = agent.hp || 0;
    return Math.floor((current / max) * 100);
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-auto">
        <header className="flex h-16 items-center border-b border-border px-6 justify-between shrink-0 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-headline font-semibold italic uppercase tracking-tight text-white">Agent Oversight</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 gap-2 font-mono text-[9px]">
              <Database className="h-3 w-3" /> MEMORY_CACHE_CONNECTED
            </Badge>
            <Badge variant="outline" className="text-accent border-accent font-black text-[10px] tracking-widest italic">NEURAL_MONITORING_ACTIVE</Badge>
          </div>
        </header>

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="border-border bg-card shadow-2xl relative overflow-hidden group">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Agents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black font-headline text-white italic">
                  {isLoading ? "..." : (agents?.length || 0)}
                </div>
                <p className="text-[9px] text-muted-foreground uppercase mt-1">Live Neural Signatures</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card shadow-2xl relative overflow-hidden group">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Thinking Cache</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black font-headline text-emerald-500 italic">
                  {cacheStatus.latencyMs}ms
                </div>
                <p className="text-[9px] text-muted-foreground uppercase mt-1">AWS ElastiCache Latency</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card shadow-2xl relative overflow-hidden group">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Global Integrity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black font-headline text-axiom-cyan italic">
                  99.9%
                </div>
                <p className="text-[9px] text-muted-foreground uppercase mt-1">Matrix Stability</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card shadow-2xl relative overflow-hidden group text-axiom-gold">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-60">Engine Protocol</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black font-headline italic">
                  HIGH_SCIENCE
                </div>
                <p className="text-[9px] uppercase mt-1 opacity-60">Level Cap: REMOVED</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Cpu className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-headline font-black uppercase italic tracking-widest text-white">Live Intelligence Stream</h2>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 opacity-40">
                <Loader2 className="h-12 w-12 animate-spin text-accent mb-4" />
                <p className="text-xs font-black uppercase tracking-[0.4em]">Decrypting Ledger...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-24 text-destructive border border-destructive/20 rounded-3xl bg-destructive/5">
                <AlertTriangle className="h-12 w-12 mb-4" />
                <p className="text-xs font-black uppercase tracking-widest">Access Refused</p>
                <p className="text-[10px] mt-2 font-mono uppercase opacity-60">{error.message}</p>
              </div>
            ) : !user ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground border-2 border-dashed border-border rounded-3xl opacity-40">
                <Zap className="h-12 w-12 mb-4 text-accent" />
                <p className="text-xs font-black uppercase tracking-widest italic">Neural Link Required to view Active Agents.</p>
              </div>
            ) : agents?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground border-2 border-dashed border-border rounded-3xl opacity-40">
                <UserCheck className="h-12 w-12 mb-4" />
                <p className="text-xs font-black uppercase tracking-widest italic">No neural signatures detected.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {agents?.map((agent) => {
                  const status = getStatus(agent);
                  const integrity = getIntegrity(agent);
                  return (
                    <Card key={agent.id} className="axiom-card-hover border-border bg-card overflow-hidden group">
                      <CardHeader className="p-4 flex flex-row items-center justify-between bg-secondary/10 border-b border-border/50">
                        <div className="min-w-0">
                          <CardTitle className="text-xs font-black uppercase tracking-widest truncate text-white">{agent.displayName || agent.name || "Pilot"}</CardTitle>
                          <CardDescription className="text-[8px] font-mono uppercase tracking-tighter text-muted-foreground">{agent.id.slice(0, 8)}</CardDescription>
                        </div>
                        <Badge 
                          variant={status === 'Active' ? 'default' : status === 'Warning' ? 'destructive' : 'secondary'} 
                          className="text-[8px] font-black uppercase px-1.5 py-0 italic"
                        >
                          {status}
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                            <span>Matrix Integrity</span>
                            <span className={integrity < 30 ? 'text-destructive animate-pulse' : 'text-white'}>{integrity}%</span>
                          </div>
                          <Progress value={integrity} className={`h-1 ${integrity < 30 ? 'bg-destructive/20' : 'bg-secondary'}`} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 rounded-lg bg-black/40 border border-white/5 text-center">
                            <div className="text-[7px] font-black text-muted-foreground uppercase">Level</div>
                            <div className="text-xs font-headline font-bold text-accent italic">{agent.level || 1}</div>
                          </div>
                          <div className="p-2 rounded-lg bg-black/40 border border-white/5 text-center">
                            <div className="text-[7px] font-black text-muted-foreground uppercase">EP Multi</div>
                            <div className="text-[8px] font-mono font-bold text-white truncate">{agent.level >= 100 ? "3.25x (EXP)" : "1.5x"}</div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-white/5">
                          <span className="text-[8px] font-black text-muted-foreground uppercase">Last Pulse</span>
                          <span className="text-[8px] font-mono text-accent">
                            {agent.lastUpdate?.seconds ? new Date(agent.lastUpdate.seconds * 1000).toLocaleTimeString() : 'NOW'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </div>
  )
}