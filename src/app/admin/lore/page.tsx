
"use client"

import { useState, useEffect } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { 
  BookOpen, 
  Sparkles, 
  Loader2, 
  Trash2, 
  History,
  MapPin,
  Users,
  ShieldCheck,
  Save
} from "lucide-react"
import { LoreManager } from "@/services/LoreManager"
import { LoreEntry } from "@/types"
import { useToast } from "@/hooks/use-toast"

export default function AdminLorePage() {
  const [loading, setLoading] = useState(false)
  const [entries, setEntries] = useState<LoreEntry[]>([])
  const [form, setParams] = useState({ theme: "", region: "", faction: "" })
  const [generated, setGenerated] = useState<Partial<LoreEntry> | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadLore()
  }, [])

  const loadLore = async () => {
    const data = await LoreManager.getLore()
    setEntries(data)
  }

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const result = await LoreManager.generateLore(form.theme, form.region, form.faction)
      setGenerated(result)
      toast({ title: "Neural Synthesis Complete", description: "Lore fragment manifested from the Axiom Core." })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Synthesis Error", description: e.message })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!generated) return
    setLoading(true)
    try {
      await LoreManager.saveLore(generated)
      setGenerated(null)
      loadLore()
      toast({ title: "Lore Committed", description: "The chronicle has been updated permanently." })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Save Error", description: e.message })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await LoreManager.deleteLore(id)
      loadLore()
      toast({ title: "Fragment Deleted", description: "Entry purged from the world memory." })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Delete Error", description: e.message })
    }
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-auto">
        <header className="flex h-16 items-center border-b border-border px-6 justify-between shrink-0 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-headline font-semibold italic uppercase tracking-tight text-white">Lore Architect</h1>
          </div>
          <Badge variant="outline" className="text-accent border-accent font-black text-[10px] tracking-widest italic">CHRONICLE_V1_ACTIVE</Badge>
        </header>

        <main className="p-6 space-y-8 max-w-7xl mx-auto w-full">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Configuration */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="border-border bg-card shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent" /> Neural Synthesis
                  </CardTitle>
                  <CardDescription>Synthesize world history using the Axiom LLM layer.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black text-muted-foreground">Theme</Label>
                    <Input 
                      placeholder="e.g. Ancient Algorithms" 
                      value={form.theme} 
                      onChange={(e) => setParams(p => ({...p, theme: e.target.value}))}
                      className="bg-secondary/20 border-border italic text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black text-muted-foreground">Region</Label>
                    <Input 
                      placeholder="e.g. Nebula Edge" 
                      value={form.region} 
                      onChange={(e) => setParams(p => ({...p, region: e.target.value}))}
                      className="bg-secondary/20 border-border italic text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black text-muted-foreground">Faction</Label>
                    <Input 
                      placeholder="e.g. Collective" 
                      value={form.faction} 
                      onChange={(e) => setParams(p => ({...p, faction: e.target.value}))}
                      className="bg-secondary/20 border-border italic text-xs"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleGenerate} disabled={loading} className="w-full axiom-gradient text-white font-black italic uppercase tracking-widest h-12 shadow-xl">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    Synthesize Fragment
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Workspace / Result */}
            <div className="lg:col-span-8">
              {generated ? (
                <Card className="border-accent/30 bg-card overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <CardHeader className="bg-accent/5 border-b border-border p-6 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-headline font-black uppercase italic text-accent">{generated.title}</CardTitle>
                      <CardDescription className="text-[10px] uppercase font-bold tracking-tight mt-1">Generated Neural Signature: AI_SYNC</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setGenerated(null)} className="h-8 text-[9px] font-black uppercase border-white/10">Discard</Button>
                      <Button size="sm" onClick={handleSave} className="h-8 text-[9px] font-black uppercase axiom-gradient border-0 text-white"><Save className="h-3 w-3 mr-1" /> Commit to Ledger</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-accent tracking-[0.3em] italic">Historical Context</Label>
                      <p className="text-xs text-white/80 leading-relaxed italic border-l-2 border-accent pl-4">{generated.content}</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-accent tracking-[0.3em] italic">NPC Background</Label>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{generated.npcBackground}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-accent tracking-[0.3em] italic">Conflict Hook</Label>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{generated.conflictHook}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl p-12 text-center opacity-40">
                  <BookOpen className="h-16 w-16 mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-headline font-bold uppercase italic text-white">Chamber Empty</h3>
                  <p className="text-xs max-w-xs mt-2 uppercase tracking-tighter">Trigger the Neural Core to manifest a new world fragment.</p>
                </div>
              )}
            </div>
          </div>

          {/* Chronicle History */}
          <div className="space-y-4 pt-8 border-t border-border">
            <h2 className="text-sm font-black uppercase tracking-widest italic flex items-center gap-2">
              <History className="h-4 w-4 text-accent" /> Manifested Chronicles
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {entries.map((entry) => (
                <Card key={entry.id} className="border-border bg-secondary/5 axiom-card-hover group">
                  <CardHeader className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="text-[8px] border-accent/20 text-accent uppercase">{entry.theme}</Badge>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <CardTitle className="text-xs font-black uppercase tracking-widest truncate">{entry.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-[10px] text-muted-foreground italic line-clamp-3 mb-4">{entry.content}</p>
                    <div className="flex items-center gap-3 text-[8px] font-black text-white/40 uppercase italic">
                      {entry.region && <span className="flex items-center gap-1"><MapPin className="h-2 w-2" /> {entry.region}</span>}
                      {entry.faction && <span className="flex items-center gap-1"><Users className="h-2 w-2" /> {entry.faction}</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </SidebarInset>
    </div>
  )
}
