"use client"

import { useState } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  UserPlus, 
  Loader2, 
  Sparkles, 
  BrainCircuit, 
  History,
  Tag,
  Target,
  Code,
  Check
} from "lucide-react"
import { generateNpcPersonality, type GenerateNpcPersonalityOutput } from "@/ai/flows/generate-npc-personality-flow"
import { useToast } from "@/hooks/use-toast"

export default function NpcArchitectPage() {
  const [loading, setLoading] = useState(false)
  const [npc, setNpc] = useState<GenerateNpcPersonalityOutput | null>(null)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleGenerateNpc = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await generateNpcPersonality({
        npcName: formData.get("name") as string || undefined,
        gameWorldSetting: "Axiom Frontier - A sprawling space civilization built around the mysterious Axiom energy source.",
        role: formData.get("role") as string || "Trader",
        additionalContext: formData.get("context") as string || "",
      })
      setNpc(result)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Architecture Error",
        description: "The neural network failed to construct the NPC personality."
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToGodot = () => {
    if (!npc) return
    const godotJson = JSON.stringify({
      npc_id: npc.name.toLowerCase().replace(/\s+/g, '_'),
      name: npc.name,
      traits: npc.personalityTraits,
      backstory: npc.backstory,
      motivations: npc.motivations,
      quirks: npc.quirks || []
    }, null, 2)
    
    navigator.clipboard.writeText(godotJson)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "NPC Data Copied",
      description: "Godot-ready character profile is on your clipboard."
    })
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-auto">
        <header className="flex h-16 items-center border-b border-border px-6 gap-4 shrink-0 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <SidebarTrigger />
          <h1 className="text-xl font-headline font-semibold">NPC Architect</h1>
        </header>

        <main className="p-6 grid gap-6 lg:grid-cols-12 max-w-7xl mx-auto w-full">
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-accent" />
                  Neural Profile Configuration
                </CardTitle>
                <CardDescription>Define core parameters for character synthesis.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerateNpc} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name (Optional)</Label>
                    <Input id="name" name="name" placeholder="Leave blank for AI choice" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Primary Occupation</Label>
                    <Input id="role" name="role" placeholder="e.g. Rogue Merchant, Data Broker, Drifter" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="context">Specific Context / Hidden Motivation</Label>
                    <Textarea id="context" name="context" placeholder="e.g. Secretly working for the Chrome Insurgency, loves ancient tech..." className="min-h-[100px]" />
                  </div>
                  <Button type="submit" className="w-full axiom-gradient text-white border-0" disabled={loading}>
                    {loading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Synthesizing Persona...</>
                    ) : (
                      "Forge Personality"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-7">
            {npc ? (
              <Card className="border-accent/30 bg-card">
                <CardHeader className="bg-secondary/20 border-b border-border">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <CardTitle className="text-3xl font-headline text-accent">{npc.name}</CardTitle>
                      <Badge variant="outline" className="text-accent border-accent">SYNTHESIZED</Badge>
                    </div>
                    <Button variant="ghost" size="sm" onClick={copyToGodot} className="gap-2">
                      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Code className="h-4 w-4" />}
                      Godot JSON
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-8">
                  <section>
                    <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground tracking-widest mb-3">
                      <Tag className="h-3 w-3" />
                      Personality Matrix
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {npc.personalityTraits.map((trait, i) => (
                        <Badge key={i} variant="secondary" className="px-3 py-1">{trait}</Badge>
                      ))}
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground tracking-widest mb-3">
                      <History className="h-3 w-3" />
                      Backstory Archive
                    </div>
                    <p className="text-foreground/90 leading-relaxed bg-secondary/10 p-4 rounded-lg border border-border">
                      {npc.backstory}
                    </p>
                  </section>

                  <div className="grid md:grid-cols-2 gap-6">
                    <section>
                      <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground tracking-widest mb-3">
                        <Target className="h-3 w-3" />
                        Core Motivations
                      </div>
                      <ul className="space-y-2">
                        {npc.motivations.map((m, i) => (
                          <li key={i} className="flex gap-2 text-sm text-foreground/80">
                            <span className="text-accent">›</span> {m}
                          </li>
                        ))}
                      </ul>
                    </section>
                    {npc.quirks && (
                      <section>
                        <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground tracking-widest mb-3">
                          <Sparkles className="h-3 w-3" />
                          Behavioral Quirks
                        </div>
                        <ul className="space-y-2">
                          {npc.quirks.map((q, i) => (
                            <li key={i} className="flex gap-2 text-sm text-foreground/80">
                              <span className="text-muted-foreground">◦</span> {q}
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t border-border flex justify-end gap-3 p-4">
                  <Button variant="outline" onClick={() => setNpc(null)}>Discard</Button>
                  <Button className="bg-accent hover:bg-accent/80 text-accent-foreground">Deploy to Game Engine</Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-border rounded-xl">
                <UserPlus className="h-12 w-12 text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-headline font-medium text-muted-foreground">Neural Chamber Empty</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                  Input the character archetype on the left to synthesize a unique NPC personality and backstory.
                </p>
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </div>
  )
}
