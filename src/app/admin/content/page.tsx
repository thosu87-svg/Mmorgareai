
"use client"

import { useState } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { 
  BrainCircuit, 
  Youtube, 
  ScrollText, 
  Loader2, 
  Zap,
  TrendingUp,
  Database
} from "lucide-react"
import { ContentAutomationManager } from "@/services/ContentAutomationManager"
import { useToast } from "@/hooks/use-toast"

export default function ContentBrainAdminPage() {
  const [loading, setLoading] = useState(false)
  const [lastResult, setLastContent] = useState<any>(null)
  const [socialResult, setSocialResult] = useState<any>(null)
  const { toast } = useToast()

  const runContentBrain = async () => {
    setLoading(true)
    try {
      const result = await ContentAutomationManager.generateWorldContent(25, 1842)
      setLastContent(result)
      toast({ title: "Neural Synthesis Complete", description: "Quest, NPC, and Lore committed to ledger." })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Synthesis Error", description: e.message })
    } finally {
      setLoading(false)
    }
  }

  const runSocialAutomation = async () => {
    setLoading(true)
    try {
      const result = await ContentAutomationManager.generateSocialPackage()
      setSocialResult(result)
      toast({ title: "Social Package Ready", description: "YouTube script and SEO package drafted." })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Automation Error", description: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-auto">
        <header className="flex h-16 items-center border-b border-border px-6 justify-between shrink-0 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-headline font-semibold italic uppercase tracking-tight text-white">Autonomous Content Brain</h1>
          </div>
          <Badge variant="outline" className="text-accent border-accent font-black text-[10px] tracking-widest italic">VERTEX_AI_CONNECTED</Badge>
        </header>

        <main className="p-6 space-y-8 max-w-7xl mx-auto w-full">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border bg-card shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <BrainCircuit className="h-32 w-32" />
              </div>
              <CardHeader>
                <CardTitle className="text-2xl font-headline font-black uppercase italic text-accent">Neural World Synthesis</CardTitle>
                <CardDescription>Generate Quest, NPC, and Lore batches based on live World State.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-secondary/20 border border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Token Efficiency</span>
                    <span className="text-[10px] font-black text-emerald-500">OPTIMAL</span>
                  </div>
                  <Progress value={42} className="h-1.5" />
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase italic">
                  <TrendingUp className="h-3 w-3 text-accent" />
                  Cost: ~$0.002 / Generation (Flash 1.5)
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={runContentBrain} disabled={loading} className="w-full h-12 axiom-gradient text-white font-black italic uppercase tracking-widest shadow-xl">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                  Trigger World Batch
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-border bg-card shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Youtube className="h-32 w-32" />
              </div>
              <CardHeader>
                <CardTitle className="text-2xl font-headline font-black uppercase italic text-red-500">Social Automation Engine</CardTitle>
                <CardDescription>Synthesize YouTube packages from weekly simulation milestones.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-secondary/20 border border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Queue Status</span>
                    <span className="text-[10px] font-black text-accent">READY</span>
                  </div>
                  <Progress value={100} className="h-1.5" />
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase italic">
                  <Database className="h-3 w-3 text-red-500" />
                  Target: 1 Long-form / 5 Shorts weekly
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={runSocialAutomation} disabled={loading} variant="outline" className="w-full h-12 border-red-500/20 text-red-500 hover:bg-red-500/10 font-black italic uppercase tracking-widest">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Youtube className="h-4 w-4 mr-2" />}
                  Generate YouTube Package
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              {lastResult ? (
                <Card className="border-accent/30 bg-card overflow-hidden">
                  <CardHeader className="bg-accent/5 border-b border-border p-6">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl font-headline font-black uppercase italic text-accent flex items-center gap-2">
                        <ScrollText className="h-5 w-5" /> Batch_Result: {lastResult.quest.quest_title}
                      </CardTitle>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40">COMMITTED</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <section className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-accent tracking-[0.3em] italic">Quest Briefing</Label>
                      <p className="text-xs text-white/80 border-l-2 border-accent pl-4">{lastResult.quest.narrative_hook}</p>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="p-3 rounded-lg bg-secondary/20 border border-border">
                          <div className="text-[8px] font-black text-muted-foreground uppercase mb-1">XP Reward</div>
                          <div className="text-sm font-headline font-bold text-emerald-500">+{lastResult.quest.rewards.xp}</div>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/20 border border-border">
                          <div className="text-[8px] font-black text-muted-foreground uppercase mb-1">Gold Reward</div>
                          <div className="text-sm font-headline font-bold text-axiom-gold">+10 AXM</div>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-3 pt-6 border-t border-border/50">
                      <Label className="text-[10px] font-black uppercase text-accent tracking-[0.3em] italic">NPC Manifestation: {lastResult.npc.npc_name}</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase block mb-1">Temperament</span>
                          <Badge variant="outline" className="text-[10px] text-white">{lastResult.npc.temperament}</Badge>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase block mb-1">Ideology</span>
                          <Badge variant="outline" className="text-[10px] text-white">{lastResult.npc.ideology}</Badge>
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground italic leading-relaxed">Motivation: {lastResult.npc.secret_motivation}</p>
                    </section>
                  </CardContent>
                </Card>
              ) : (
                <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl p-12 text-center opacity-40">
                  <BrainCircuit className="h-16 w-16 mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-headline font-bold uppercase italic">Awaiting Synthesis</h3>
                  <p className="text-xs max-w-xs mt-2 uppercase tracking-tighter">Trigger the Content Brain to manifest new world data.</p>
                </div>
              )}
            </div>

            <div className="lg:col-span-5">
              {socialResult ? (
                <Card className="border-red-500/30 bg-card overflow-hidden h-full">
                  <CardHeader className="bg-red-500/5 border-b border-border p-6">
                    <CardTitle className="text-xl font-headline font-black uppercase italic text-red-500 flex items-center gap-2">
                      <Youtube className="h-5 w-5" /> Video_Package
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-red-500 tracking-[0.3em] italic">Hook (0:00 - 0:05)</Label>
                      <p className="text-sm font-bold text-white leading-tight">"{socialResult.hook_5_seconds}"</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-red-500 tracking-[0.3em] italic">Short-form Script</Label>
                      <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-[11px] text-white/60 leading-relaxed font-mono">
                        {socialResult.short_script_60s}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-red-500 tracking-[0.3em] italic">Thumbnail Prompt</Label>
                      <p className="text-[10px] text-muted-foreground italic">"{socialResult.thumbnail_prompt}"</p>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-red-500/5 border-t border-border p-6">
                    <Button variant="ghost" className="w-full text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10">Export to Buffer</Button>
                  </CardFooter>
                </Card>
              ) : (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl p-12 text-center opacity-40">
                  <Youtube className="h-16 w-16 mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-headline font-bold uppercase italic">No Active Campaigns</h3>
                  <p className="text-xs max-w-xs mt-2 uppercase tracking-tighter">Social packages manifest weekly from simulation milestones.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </SidebarInset>
    </div>
  )
}
