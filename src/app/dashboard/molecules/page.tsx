
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Dna, 
  Atom, 
  Zap, 
  Activity, 
  BrainCircuit, 
  Microscope,
  Cpu,
  Infinity
} from "lucide-react"

export default function MoleculeExplorerPage() {
  const molecules = [
    { id: "M-AXM-01", type: "Axiomatic", density: 84, stability: 92, status: "VIBRANT" },
    { id: "M-NEU-42", type: "Neural", density: 62, stability: 78, status: "STABLE" },
    { id: "M-COR-09", type: "Corruption", density: 12, stability: 15, status: "MUTATING" },
    { id: "M-SIN-00", type: "Singularity", density: 99, stability: 99, status: "ABSOLUTE" },
  ]

  return (
    <main className="p-6 space-y-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-headline font-black uppercase italic tracking-tighter flex items-center gap-3">
          <Microscope className="h-8 w-8 text-accent" />
          Neural Molecule Explorer
        </h2>
        <p className="text-muted-foreground text-sm uppercase font-bold tracking-widest">Axiom-level data granularity analysis.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {molecules.map((m) => (
          <Card key={m.id} className="axiom-card-hover border-border bg-card overflow-hidden group">
            <CardHeader className="p-4 bg-secondary/10 border-b border-border/50">
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="text-[8px] font-black tracking-widest uppercase italic border-accent/30 text-accent">
                  {m.type}_FRAGMENT
                </Badge>
                <div className="h-2 w-2 rounded-full bg-accent heartbeat-pulse" />
              </div>
              <CardTitle className="text-lg font-headline font-bold mt-2">{m.id}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                  <span>Logic Density</span>
                  <span className="text-white">{m.density}%</span>
                </div>
                <Progress value={m.density} className="h-1" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                  <span>Structural Stability</span>
                  <span className="text-white">{m.stability}%</span>
                </div>
                <Progress value={m.stability} className="h-1 bg-secondary" />
              </div>
              <div className="pt-4 border-t border-border/50 flex justify-between items-center">
                <span className="text-[10px] font-black text-accent uppercase tracking-tighter italic">{m.status}</span>
                <Atom className="h-4 w-4 text-muted-foreground opacity-20 group-hover:opacity-100 transition-opacity" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8 border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-accent" /> Axiomatic Composition
            </CardTitle>
            <CardDescription className="text-xs">Real-time breakdown of simulation logic fragments.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed border-border rounded-2xl m-6">
            <div className="text-center space-y-4">
              <Infinity className="h-12 w-12 text-accent mx-auto animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Synthesizing Fractal Data...</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border-border bg-card overflow-hidden">
          <CardHeader className="bg-axiom-purple/5">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Cpu className="h-4 w-4 text-axiom-purple" /> Processing Logic
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/20 border border-border">
                <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center">
                  <Zap className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1">
                  <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${Math.random() * 100}%` }} />
                  </div>
                  <div className="text-[8px] font-black text-muted-foreground uppercase mt-1">Core_Link_0{i}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
