
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BrainCircuit, 
  Cpu, 
  Database, 
  Activity, 
  Zap, 
  History,
  Lock,
  CloudLightning,
  RefreshCw,
  Search,
  Globe,
  Layers,
  Network,
  BellRing,
  Router
} from "lucide-react"
import { useStore } from "@/store"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function BrainEngineMonitorPage() {
  const brain = useStore(state => state.brainEngine)
  const [isScanning, setIsScanning] = useState(false)
  const setBrainProjectStats = useStore(state => state.setBrainProjectStats)
  const addBrainLog = useStore(state => state.addBrainLog)
  const updatePostgresStatus = useStore(state => state.updatePostgresStatus)

  const triggerScan = async () => {
    setIsScanning(true);
    addBrainLog(`Initiating scan on node ${brain.matrixNodeIp}...`);
    try {
      const res = await fetch('/api/brain/scan', {
        method: 'POST',
        body: JSON.stringify({ tenantId: brain.tenantId, targetDir: process.cwd() })
      });
      const data = await res.json();
      if (data.success) {
        setBrainProjectStats(data.stats);
        updatePostgresStatus(data.postgres_active ? 'CONNECTED' : 'OFFLINE');
        addBrainLog("Project analyzed successfully. Statistics synchronized with GKE node.");
        if (data.postgres_active) {
          addBrainLog("PostgreSQL Relational Core: Link established.");
        }
      }
    } catch (e) {
      addBrainLog("Scan failure: Connection to Axiom GKE Core lost.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <main className="p-6 space-y-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-headline font-black uppercase italic tracking-tighter flex items-center gap-3">
              <BrainCircuit className="h-8 w-8 text-accent animate-pulse" />
              Autonomous Brain Engine
            </h2>
            <Badge variant="outline" className={`border-emerald-500/30 text-emerald-500 font-black tracking-widest uppercase italic bg-emerald-500/5`}>
              GKE_NODE_{brain.matrixNodeIp}_LIVE
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm uppercase font-bold tracking-widest italic opacity-60">High-level world management and neural orchestration via Matrix Node.</p>
        </div>
        <Button 
          onClick={triggerScan} 
          disabled={isScanning}
          className="axiom-gradient text-white h-12 px-8 font-black uppercase italic tracking-widest rounded-xl shadow-xl"
        >
          {isScanning ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
          Trigger Matrix Scan
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-secondary/10 border-border group hover:border-accent/40 transition-all">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-[10px] font-black uppercase text-accent tracking-widest">Route Server ID</CardTitle>
              <Router className="h-4 w-4 text-accent opacity-40 group-hover:rotate-90 transition-transform" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black font-headline text-white italic truncate">{brain.routeServerId}</div>
            <p className="text-[9px] text-muted-foreground uppercase mt-1">ASN: {brain.asn} (Amazon)</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary/10 border-border">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-[10px] font-black uppercase text-axiom-purple tracking-widest">VPC Backbone</CardTitle>
              <Network className={`h-4 w-4 text-axiom-purple opacity-40`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-xl font-black font-headline italic text-white truncate`}>
              {brain.vpcId}
            </div>
            <p className="text-[9px] text-muted-foreground uppercase mt-1">Status: Assigned</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary/10 border-border">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">SNS Notifications</CardTitle>
              <BellRing className="h-4 w-4 text-emerald-500 opacity-40" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black font-headline text-emerald-500 italic">ENABLED</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[9px] text-muted-foreground uppercase">Region: eu-central-1</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/10 border-border">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-[10px] font-black uppercase text-axiom-purple tracking-widest">Postgres Status</CardTitle>
              <Layers className={`h-4 w-4 ${brain.postgresStatus === 'CONNECTED' ? 'text-emerald-500' : 'text-gray-500'} opacity-40`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-black font-headline italic ${brain.postgresStatus === 'CONNECTED' ? 'text-emerald-500' : 'text-white'}`}>{brain.postgresStatus}</div>
            <p className="text-[9px] text-muted-foreground uppercase mt-1">Eternal Ledger Connection</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8 border-border bg-card shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-screen">
            <div className="w-full h-full bg-[linear-gradient(to_bottom,transparent_0%,#06b6d4_50%,transparent_100%)] bg-[length:100%_4px] animate-matrix-scan" />
          </div>
          <CardHeader className="bg-secondary/10 border-b border-border/50">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <History className="h-4 w-4 text-accent" /> Brain Engine Event Ledger
            </CardTitle>
            <CardDescription className="text-[10px] uppercase font-bold tracking-tight">Direct feed from the Autonomous World Orchestrator.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 h-[400px] overflow-y-auto custom-scrollbar space-y-3">
            {brain.logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30 italic text-xs">
                <CloudLightning className="h-12 w-12 mb-4 animate-bounce" />
                Awaiting first autonomous decision cycle...
              </div>
            ) : (
              brain.logs.map((log, i) => (
                <div key={i} className="flex gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 animate-in slide-in-from-left-2 duration-500">
                  <span className="text-accent/40 font-mono text-[9px] shrink-0">[{new Date().toLocaleTimeString()}]</span>
                  <p className="text-white/80 text-[10px] uppercase tracking-tight leading-relaxed">
                    <span className="text-accent mr-2">»</span> {log}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border-border bg-card">
          <CardHeader className="bg-secondary/10 border-b border-border/50">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Lock className="h-4 w-4 text-axiom-gold" /> AWS Infrastructure
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                <Label className="text-[8px] font-black uppercase text-gray-500 tracking-widest block mb-2">SNS Topic ARN</Label>
                <code className="text-[9px] text-axiom-gold break-all font-mono opacity-80">
                  {brain.snsArn}
                </code>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                <Label className="text-[8px] font-black uppercase text-gray-500 tracking-widest block mb-2">Postgres Node</Label>
                <code className="text-[9px] text-emerald-500 break-all font-mono opacity-80">
                  database-1.cjyis4meesmc.us-west-2.rds.amazonaws.com
                </code>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                  <span>Backbone Integrity</span>
                  <span className="text-emerald-500">OPTIMAL</span>
                </div>
                <Progress value={98} className="h-1.5" />
              </div>

              {brain.projectStats && (
                <div className="pt-4 border-t border-white/5 space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-white/40 tracking-widest">Project Matrix Stats</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg bg-secondary/20 border border-white/5">
                      <div className="text-[7px] text-gray-500 uppercase font-black">Type</div>
                      <div className="text-[10px] text-white font-bold uppercase">{brain.projectStats.type}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-secondary/20 border border-white/5">
                      <div className="text-[7px] text-gray-500 uppercase font-black">Textures</div>
                      <div className="text-[10px] text-white font-bold">{brain.projectStats.textures}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-secondary/20 border border-white/5">
                      <div className="text-[7px] text-gray-500 uppercase font-black">Quests</div>
                      <div className="text-[10px] text-white font-bold">{brain.projectStats.quests}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-secondary/20 border border-white/5">
                      <div className="text-[7px] text-gray-500 uppercase font-black">Lore</div>
                      <div className="text-[10px] text-white font-bold">{brain.projectStats.lore}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
