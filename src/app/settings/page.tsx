
"use client"

import { useState, useEffect } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Save, Power, Loader2, UserPlus, Pause, Play, Download, Terminal, Globe } from "lucide-react"
import { useFirestore, useDoc, useMemoFirebase, useAuth, useUser } from "@/firebase"
import { doc, setDoc, serverTimestamp, collection, addDoc, updateDoc } from "firebase/firestore"
import { signInAnonymously } from "firebase/auth"
import { useToast } from "@/hooks/use-toast"
import { useStore } from "@/store"
import { Language } from "@/types"

export default function SettingsPage() {
  const db = useFirestore()
  const auth = useAuth()
  const { user } = useUser()
  const { toast } = useToast()
  
  const language = useStore(state => state.language);
  const setLanguage = useStore(state => state.setLanguage);

  const worldRef = useMemoFirebase(() => db ? doc(db, "worldState", "global") : null, [db])
  const { data: worldState, isLoading: isDocLoading } = useDoc(worldRef)

  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [params, setParams] = useState({
    economy: 500,
    military: 500,
    stability: 500,
    knowledge: 500,
    culture: 500,
    corruption: 100
  })

  useEffect(() => {
    if (worldState) {
      setParams({
        economy: worldState.economy || 500,
        military: worldState.military || 500,
        stability: worldState.stability || 500,
        knowledge: worldState.knowledge || 500,
        culture: worldState.culture || 500,
        corruption: worldState.corruption || 100
      })
    }
  }, [worldState])

  const calculateCI = () => {
    const { economy, military, stability, knowledge, culture, corruption } = params
    return (0.2 * economy) + (0.2 * military) + (0.15 * stability) + (0.15 * knowledge) + (0.15 * culture) - (0.15 * corruption)
  }

  const handleToggleEngine = async () => {
    if (!worldRef) return
    setToggling(true)
    try {
      const newState = !worldState?.paused
      await updateDoc(worldRef, { paused: newState, updatedAt: serverTimestamp() })
      toast({ 
        title: newState ? "Engine Paused" : "Engine Resumed", 
        description: newState ? "Deterministic cycles suspended." : "Logic flow restored." 
      })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Control Error", description: e.message })
    } finally {
      setToggling(false)
    }
  }

  const handleSave = async () => {
    if (!worldRef) return
    setSaving(true)
    const ci = calculateCI()
    try {
      if (!user && auth) await signInAnonymously(auth)
      await setDoc(worldRef, { 
        ...params, 
        civilizationIndex: ci, 
        updatedAt: serverTimestamp()
      }, { merge: true })
      toast({ title: "Settings Saved", description: `Civilization Index updated to ${ci.toFixed(2)}` })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Save Error", description: e.message || "Failed to update world state." })
    } finally {
      setSaving(false)
    }
  }

  const languages = [
    { code: 'EN', name: 'English' },
    { code: 'DE', name: 'Deutsch (German)' },
    { code: 'RU', name: 'Русский (Russian)' },
    { code: 'TR', name: 'Türkçe (Turkish)' },
    { code: 'FR', name: 'Français (French)' },
    { code: 'ES', name: 'Español (Spanish)' },
    { code: 'ZH', name: '中文 (Chinese)' },
    { code: 'GR', name: 'Ελληνικά (Greek)' },
    { code: 'AR', name: 'العربية (Arabic)' },
  ];

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-auto">
        <header className="flex h-16 items-center border-b border-border px-6 justify-between shrink-0 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-headline font-semibold italic uppercase tracking-tight text-white">World Configuration</h1>
          </div>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={handleToggleEngine} 
              disabled={toggling || !worldState?.tick}
              className="border-accent/20 text-accent hover:bg-accent/10 gap-3 font-black text-xs uppercase italic tracking-widest"
            >
              {toggling ? <Loader2 className="h-4 w-4 animate-spin" /> : worldState?.paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              {worldState?.paused ? "Resume Engine" : "Pause Engine"}
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="axiom-gradient text-white gap-3 font-black text-xs uppercase italic tracking-widest shadow-xl"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Commit Config
            </Button>
          </div>
        </header>

        <main className="p-6 space-y-6 max-w-4xl mx-auto w-full">
          <Card className="border-border bg-card shadow-2xl">
            <CardHeader className="bg-secondary/10 border-b border-border/50">
              <CardTitle className="font-headline flex items-center gap-3 font-black uppercase italic text-sm tracking-[0.3em] text-accent">
                <Globe className="h-5 w-5" />
                Localization Matrix
              </CardTitle>
              <CardDescription className="text-xs uppercase font-bold text-muted-foreground/60">Select the primary language for simulation data and user interface.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center gap-6 p-6 rounded-2xl bg-secondary/20 border border-border">
                <Label className="text-[10px] uppercase font-black tracking-widest text-white/60">Language Stream</Label>
                <Select value={language} onValueChange={(val) => setLanguage(val as Language)}>
                  <SelectTrigger className="w-[240px] bg-black/40 border-border text-white font-bold italic">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-border">
                    {languages.map(lang => (
                      <SelectItem key={lang.code} value={lang.code} className="text-white hover:bg-accent/20">
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex-1 text-right">
                  <Badge variant="outline" className="border-accent/30 text-accent font-black tracking-widest uppercase italic">{language}_SYNC_ACTIVE</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-2xl">
            <CardHeader className="bg-secondary/10 border-b border-border/50">
              <CardTitle className="font-headline flex items-center gap-3 font-black uppercase italic text-sm tracking-[0.3em] text-accent">
                <Shield className="h-5 w-5" />
                Civilization Parameters
              </CardTitle>
              <CardDescription className="text-xs uppercase font-bold text-muted-foreground/60">Adjust core deterministic variables. Affects Godot and React clients real-time.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-10 pt-8">
              <div className="p-12 bg-secondary/20 rounded-[2rem] border border-border/50 text-center relative overflow-hidden axiom-card-hover">
                <div className="absolute top-6 right-8 flex items-center gap-3">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Global Tick</span>
                  <Badge variant="secondary" className="font-black text-[12px] bg-accent/20 text-accent border-accent/20 px-3 py-1 italic">{worldState?.tick || 0}</Badge>
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-[0.5em] font-black mb-4 italic">Projected Civilization Index</div>
                <div className="text-7xl font-black font-headline text-accent drop-shadow-[0_0_30px_rgba(96,212,255,0.4)] italic">
                  {calculateCI().toFixed(2)}
                </div>
              </div>

              <div className="grid gap-10 md:grid-cols-2">
                {Object.entries(params).map(([key, value]) => (
                  <div key={key} className="space-y-5 p-6 border border-border/30 rounded-2xl bg-background/50 axiom-card-hover transition-all duration-500">
                    <div className="flex justify-between items-center">
                      <Label className="capitalize font-black text-xs tracking-[0.2em] italic text-white/80">{key}</Label>
                      <span className="text-[10px] font-black text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">{value}</span>
                    </div>
                    <Slider
                      value={[value]}
                      min={0}
                      max={1000}
                      step={1}
                      onValueChange={([v]) => setParams(p => ({ ...p, [key]: v }))}
                      className="cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </div>
  )
}
