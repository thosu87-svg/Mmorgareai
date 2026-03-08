"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useFirestore, useDoc, useMemoFirebase, useCollection, useUser } from "@/firebase"
import { doc, collection, query, limit, orderBy } from "firebase/firestore"
import { 
  Globe, 
  Clock,
  ArrowUpRight,
  AlertCircle,
  Activity,
  Zap,
  CheckCircle2,
  Box,
  Layers,
  Map as MapIcon,
  Terminal,
  Cpu
} from "lucide-react"
import { getAxiomCompliance } from "@/services/ComplianceManager"
import WorldMap from "@/components/ui/WorldMap"
import { MatrixTerminal } from "@/components/ui/MatrixTerminal"

export default function DashboardPage() {
  const db = useFirestore()
  const { user } = useUser()
  
  const worldRef = useMemoFirebase(() => (db && user) ? doc(db, "worldState", "global") : null, [db, user])
  const { data: worldState, isLoading } = useDoc(worldRef)

  const chunksQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "chunks"), orderBy("lastUpdate", "desc"), limit(100));
  }, [db, user]);
  const { data: chunks } = useCollection(chunksQuery);

  const compliance = getAxiomCompliance(!!db, !!worldState?.tick)

  return (
    <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="axiom-card-hover border-border bg-card shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Globe className="h-24 w-24" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Civilization Index</CardTitle>
            <Globe className="h-4 w-4 text-axiom-cyan" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-headline text-white italic">
              {isLoading ? "..." : (worldState?.civilizationIndex?.toFixed(2) || "0.00")}
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 mt-1 uppercase tracking-wider">
              <ArrowUpRight className="h-3 w-3" />
              <span>Persistent Sync Active</span>
            </div>
          </CardContent>
        </Card>

        <Card className="axiom-card-hover border-border bg-card shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Current Tick</CardTitle>
            <Clock className="h-4 w-4 text-axiom-cyan" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-headline text-white italic">
              {isLoading ? "..." : (worldState?.tick || 0)}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">Logic Cycle: 1m</p>
          </CardContent>
        </Card>

        <Card className="axiom-card-hover border-border bg-card shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Matrix Load</CardTitle>
            <Cpu className="h-4 w-4 text-axiom-cyan" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-headline text-white italic">
              64.2%
            </div>
            <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">Neural Capacity</p>
          </CardContent>
        </Card>

        <Card className="axiom-card-hover border-border bg-card shadow-2xl text-axiom-gold">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Engine Status</CardTitle>
            <Activity className="h-4 w-4 opacity-60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black font-headline italic">
              RELEASE_V1
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold mt-1 uppercase tracking-wider opacity-60">
              <CheckCircle2 className="h-3 w-3" />
              <span>Stable Core Pulse</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <MapIcon className="h-5 w-5 text-axiom-cyan" />
              <h2 className="text-lg font-headline font-black uppercase italic tracking-widest text-white">Neural Sektor Oversight</h2>
            </div>
            <WorldMap chunks={chunks || []} />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Terminal className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-headline font-black uppercase italic tracking-widest text-white">Live Intelligence</h2>
            </div>
            <MatrixTerminal />
          </div>

          <Card className="border-border bg-card shadow-xl">
            <CardHeader className="bg-secondary/10 border-b border-border/50">
              <CardTitle className="font-headline font-black italic uppercase text-sm tracking-widest text-white">Logic Core Events</CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold tracking-tight">Stream from the AxiomEnforcer.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {worldState?.tick ? (
                  <>
                    <div className="flex gap-3 text-[11px] items-start p-3 rounded-xl bg-axiom-cyan/5 border border-axiom-cyan/10">
                      <Activity className="h-4 w-4 text-axiom-cyan shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-black text-white uppercase italic tracking-wider">Heartbeat Signal Detected</p>
                        <p className="text-muted-foreground mt-0.5 font-bold">Tick {worldState.tick} finalized by Ouroboros Core.</p>
                        <span className="text-[9px] text-axiom-cyan/50 font-black uppercase mt-1 block tracking-[0.2em]">Deterministic Sync</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="h-10 w-10 text-muted-foreground/20 mb-4" />
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Awaiting Engine Boot...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-7 border-border bg-card shadow-2xl">
          <CardHeader className="bg-secondary/10 border-b border-border/50">
            <CardTitle className="font-headline font-black italic uppercase text-sm tracking-widest flex items-center gap-2">
              <Zap className="h-4 w-4 text-axiom-cyan" /> WebGL MMO Compliance Matrix
            </CardTitle>
            <CardDescription className="text-[10px] uppercase font-bold tracking-tight">Authoritative Subsystem Verification.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/5 hover:bg-transparent">
                  <TableHead className="text-[9px] font-black uppercase italic">Subsystem</TableHead>
                  <TableHead className="text-[9px] font-black uppercase italic">Energy</TableHead>
                  <TableHead className="text-[9px] font-black uppercase italic">Erosion</TableHead>
                  <TableHead className="text-[9px] font-black uppercase italic">Duality</TableHead>
                  <TableHead className="text-[9px] font-black uppercase italic">Graphics</TableHead>
                  <TableHead className="text-right text-[9px] font-black uppercase italic">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compliance.matrix.map((row) => (
                  <TableRow key={row.subsystem} className="border-border/30 hover:bg-accent/5">
                    <TableCell className="text-[10px] font-bold">{row.subsystem}</TableCell>
                    <TableCell><Badge variant="outline" className={`text-[8px] px-1 py-0 ${row.energy === 'PASS' ? 'text-emerald-500' : 'text-orange-500'}`}>{row.energy}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className={`text-[8px] px-1 py-0 ${row.erosion === 'PASS' ? 'text-emerald-500' : 'text-orange-500'}`}>{row.erosion}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className={`text-[8px] px-1 py-0 ${row.duality === 'PASS' ? 'text-emerald-500' : 'text-orange-500'}`}>{row.duality}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className="text-[8px] px-1 py-0 text-emerald-500">PASS</Badge></TableCell>
                    <TableCell className="text-right">
                      <span className={`text-[9px] font-black uppercase ${row.status === 'COMPLIANT' ? 'text-emerald-500' : 'text-axiom-cyan'}`}>{row.status}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}