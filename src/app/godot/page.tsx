"use client"

import { useState } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  HardDriveDownload, 
  Terminal, 
  Wifi, 
  ShieldCheck, 
  Copy,
  FileCode,
  Zap
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { firebaseConfig } from "@/firebase/config"

export default function GodotBridgePage() {
  const { toast } = useToast()

  const downloadOneFileBridge = () => {
    const link = document.createElement('a')
    link.href = '/godot/AxiomBridge.gd'
    link.download = 'AxiomBridge.gd'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({ title: "Bridge Downloaded", description: "Just drop AxiomBridge.gd into your Godot project." })
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-auto">
        <header className="flex h-16 items-center border-b border-border px-6 justify-between shrink-0 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-headline font-semibold italic uppercase tracking-tight text-white">Godot Bridge Protocol</h1>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 gap-2 font-black italic text-[10px]">
            <Wifi className="h-3 w-3 animate-pulse" /> SIMPLICITY_V1_ACTIVE
          </Badge>
        </header>

        <main className="p-6 space-y-8 max-w-4xl mx-auto w-full">
          <section className="text-center space-y-4 mb-12">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">No more plugin chaos.</h2>
            <p className="text-muted-foreground text-sm max-w-2xl mx-auto uppercase font-bold tracking-widest italic">
              Forget complicated configurations. Download the <b>AxiomBridge.gd</b>, 
              add it as an Autoload, and your game is live.
            </p>
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-accent/30 bg-card shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap className="h-32 w-32 text-accent" />
              </div>
              <CardHeader>
                <CardTitle className="text-2xl font-headline font-black uppercase italic text-accent">The One-File Bridge</CardTitle>
                <CardDescription>Everything you need in a single class.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="text-[10px] space-y-2 text-white/60 font-black uppercase italic tracking-widest">
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-accent" /> NO PLUGINS REQUIRED</li>
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-accent" /> INTEGRATED AUTH MANAGER</li>
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-accent" /> FIRESTORE REST SYNC</li>
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-accent" /> PURE GDSCRIPT</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button onClick={downloadOneFileBridge} className="w-full h-16 axiom-gradient text-white font-black italic uppercase tracking-widest shadow-xl text-lg hover:scale-[1.02] transition-transform">
                  <HardDriveDownload className="h-6 w-6 mr-2" /> Download AxiomBridge.gd
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-border bg-card shadow-2xl">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-accent" /> Manifest Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-xl bg-secondary/20 border border-border space-y-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-muted-foreground block mb-1">Project ID</span>
                    <code className="text-xs text-axiom-cyan">{firebaseConfig.projectId}</code>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-muted-foreground block mb-1">API Key</span>
                    <code className="text-[10px] text-axiom-cyan truncate block">{firebaseConfig.apiKey}</code>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/10">
                  <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                  <p className="text-[10px] text-muted-foreground leading-relaxed uppercase font-bold italic">
                    The bridge file is pre-baked with these credentials. Simply drag and drop.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-card">
            <CardHeader className="p-6 border-b border-border">
              <CardTitle className="text-sm font-black uppercase tracking-widest italic flex items-center gap-2">
                <FileCode className="h-4 w-4 text-accent" /> Integration Blueprint
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid gap-8 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="h-8 w-8 rounded-lg bg-accent/20 text-accent flex items-center justify-center font-black">1</div>
                  <h4 className="text-xs font-black uppercase tracking-tighter">Import</h4>
                  <p className="text-[9px] text-muted-foreground uppercase leading-tight font-bold italic">Move the file to your Godot "res://" folder.</p>
                </div>
                <div className="space-y-2">
                  <div className="h-8 w-8 rounded-lg bg-accent/20 text-accent flex items-center justify-center font-black">2</div>
                  <h4 className="text-xs font-black uppercase tracking-tighter">Autoload</h4>
                  <p className="text-[9px] text-muted-foreground uppercase leading-tight font-bold italic">Project Settings -> Autoload. Add as 'AxiomBridge'.</p>
                </div>
                <div className="space-y-2">
                  <div className="h-8 w-8 rounded-lg bg-accent/20 text-accent flex items-center justify-center font-black">3</div>
                  <h4 className="text-xs font-black uppercase tracking-tighter">Initialize</h4>
                  <p className="text-[9px] text-muted-foreground uppercase leading-tight font-bold italic">Call AxiomBridge.connect_to_matrix(email, pass).</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </div>
  )
}