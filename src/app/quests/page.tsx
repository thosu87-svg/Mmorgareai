"use client"

import { useState } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Loader2, ScrollText, Code, Copy, Check, Database } from "lucide-react"
import { generateDynamicQuest, type GenerateDynamicQuestOutput } from "@/ai/flows/generate-dynamic-quest"
import { QuestManager } from "@/services/QuestManager"
import { useUser } from "@/firebase"
import { useToast } from "@/hooks/use-toast"

export default function QuestsPage() {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [committing, setCommitting] = useState(false)
  const [quest, setQuest] = useState<GenerateDynamicQuestOutput | null>(null)
  const [copied, setCopied] = useState(false)
  const [questType, setQuestType] = useState("exploration")
  const { toast } = useToast()

  const handleGenerateQuest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const levelVal = parseInt(formData.get("level") as string) || 10;
    
    try {
      const result = await generateDynamicQuest({
        civilizationIndex: 1842,
        playerLevel: levelVal,
        availableRegions: ["Nebula Edge", "Iron Reach", "Void Sanctum", "Chrome Citadel", "The Glass Desert", "Neural Peak"],
        availableNpcs: ["Elder Thorne", "Silo-X", "Commander Vane", "Axiom Prophet", "Oracle-7", "Matrix Watcher"],
        questType: questType,
        currentGameLore: "The simulation has stabilized at Phase 0.9.4. Collective yield is at peak capacity.",
      })
      setQuest(result)
      toast({ title: "Synthesis Complete", description: `Manifested "${result.title}" for Level ${levelVal}.` })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "The AI was unable to synthesize the quest parameters."
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCommitQuest = async () => {
    if (!quest || !user) {
      toast({ variant: "destructive", title: "Authentication Required", description: "You must establish a neural link to commit data." })
      return
    }
    setCommitting(true)
    try {
      await QuestManager.createQuest({
        title: quest.title,
        description: quest.description,
        requiredLevel: quest.difficulty === 'easy' ? 1 : quest.difficulty === 'medium' ? 10 : quest.difficulty === 'hard' ? 25 : 50,
        xpReward: parseInt(quest.rewards[0]) || 500,
        goldReward: parseInt(quest.rewards[1]) || 50,
        status: 'active',
        npc_id: quest.giverNpc.toLowerCase().replace(/\s+/g, '_'),
        quest_steps: quest.objectives.map(obj => ({ type: 'task', description: obj }))
      }, user.uid)
      
      toast({
        title: "Quest Manifested",
        description: "The objective has been committed to the neural ledger."
      })
      setQuest(null)
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Commit Error",
        description: e.message
      })
    } finally {
      setCommitting(false)
    }
  }

  const copyToGodot = () => {
    if (!quest) return
    const godotJson = JSON.stringify({
      quest_id: quest.title.toLowerCase().replace(/\s+/g, '_'),
      display_name: quest.title,
      lore_description: quest.description,
      objectives: quest.objectives,
      rewards: quest.rewards,
      meta_data: {
        giver: quest.giverNpc,
        region: quest.region,
        difficulty: quest.difficulty
      }
    }, null, 2)
    
    navigator.clipboard.writeText(godotJson)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Exported to Clipboard",
      description: "Godot-ready JSON is ready for your .gd scripts."
    })
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-auto">
        <header className="flex h-16 items-center border-b border-border px-6 gap-4 shrink-0 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <SidebarTrigger />
          <h1 className="text-xl font-headline font-semibold italic uppercase tracking-tight text-white">Quest Engine</h1>
        </header>

        <main className="p-6 grid gap-6 lg:grid-cols-12 max-w-7xl mx-auto w-full">
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-border bg-card shadow-2xl">
              <CardHeader className="bg-secondary/10 border-b border-border/50">
                <CardTitle className="font-headline flex items-center gap-2 font-black uppercase italic text-sm tracking-widest text-accent">
                  <Sparkles className="h-4 w-4" />
                  Quest Synthesis
                </CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold tracking-tight mt-1">Configure parameters to manifest dynamic simulation objectives.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleGenerateQuest} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-[10px] uppercase font-black text-muted-foreground">Quest Archetype</Label>
                    <Select value={questType} onValueChange={setQuestType}>
                      <SelectTrigger className="bg-secondary/20 border-border italic text-xs">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="combat">Combat Engagement</SelectItem>
                        <SelectItem value="exploration">Reconnaissance</SelectItem>
                        <SelectItem value="fetch">Resource Acquisition</SelectItem>
                        <SelectItem value="puzzle">Data Decryption</SelectItem>
                        <SelectItem value="story">Lore Revelation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="level" className="text-[10px] uppercase font-black text-muted-foreground">Recommended Level</Label>
                    <Input id="level" name="level" type="number" defaultValue="25" min="1" max="100" className="bg-secondary/20 border-border italic text-xs" />
                  </div>

                  <Button type="submit" className="w-full axiom-gradient text-white border-0 font-black italic uppercase tracking-widest h-12 shadow-xl" disabled={loading}>
                    {loading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Synthesizing...</>
                    ) : (
                      <><Sparkles className="h-4 w-4 mr-2" /> Generate Dynamic Quest</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8">
            {quest ? (
              <Card className="border-accent/30 bg-card overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="bg-accent/5 border-b border-border p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className="mb-2 bg-accent/20 text-accent border-accent/40 uppercase text-[9px] font-black tracking-widest italic">{quest.difficulty} QUEST</Badge>
                      <CardTitle className="text-2xl font-headline font-black uppercase italic tracking-tighter text-white">{quest.title}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={copyToGodot} className="gap-2 text-[10px] font-black uppercase tracking-widest text-axiom-cyan hover:bg-axiom-cyan/10">
                        {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Code className="h-4 w-4" />}
                        Export to Godot
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <section className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-accent tracking-[0.3em] italic">Intelligence Briefing</Label>
                    <p className="text-xs text-white/80 leading-relaxed italic border-l-2 border-accent pl-4">{quest.description}</p>
                  </section>

                  <div className="grid md:grid-cols-2 gap-8 pt-4 border-t border-border/50">
                    <section className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-accent tracking-[0.3em] italic">Operational Objectives</Label>
                      <ul className="space-y-2">
                        {quest.objectives.map((obj, i) => (
                          <li key={i} className="flex gap-3 text-[11px] text-white/70 italic">
                            <span className="text-accent font-black">0{i+1}.</span> {obj}
                          </li>
                        ))}
                      </ul>
                    </section>
                    <section className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.3em] italic">Allocation of Rewards</Label>
                      <ul className="space-y-2">
                        {quest.rewards.map((reward, i) => (
                          <li key={i} className="flex gap-3 text-[11px] text-emerald-400 font-bold uppercase tracking-tight">
                            <Database className="h-3 w-3 text-emerald-500 shrink-0" /> {reward}
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>

                  <div className="flex flex-wrap gap-6 pt-6 border-t border-border">
                    <div className="flex-1 p-4 rounded-xl bg-secondary/20 border border-border">
                      <Label className="text-[8px] uppercase font-black text-muted-foreground tracking-widest block mb-1">Quest Giver</Label>
                      <span className="text-xs font-headline font-bold text-white uppercase italic">{quest.giverNpc}</span>
                    </div>
                    <div className="flex-1 p-4 rounded-xl bg-secondary/20 border border-border">
                      <Label className="text-[8px] uppercase font-black text-muted-foreground tracking-widest block mb-1">Region Location</Label>
                      <span className="text-xs font-headline font-bold text-white uppercase italic">{quest.region}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-secondary/10 border-t border-border flex justify-end gap-4 p-6">
                  <Button variant="outline" onClick={() => setQuest(null)} className="h-12 px-8 text-[10px] font-black uppercase tracking-widest border-white/10 text-white/60 hover:bg-white/5">Discard</Button>
                  <Button onClick={handleCommitQuest} disabled={committing} className="h-12 px-8 axiom-gradient text-white border-0 font-black italic uppercase tracking-widest shadow-xl flex-1 md:flex-none">
                    {committing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
                    Commit to Firestore
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-border rounded-[2.5rem] opacity-40">
                <ScrollText className="h-20 w-20 text-muted-foreground/20 mb-6" />
                <h3 className="text-xl font-headline font-bold uppercase italic text-white">Chamber Empty</h3>
                <p className="text-xs text-muted-foreground max-w-sm mt-2 uppercase tracking-tighter">
                  Configure the synthesis parameters on the left to generate a new dynamic quest for the Godot client.
                </p>
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </div>
  )
}