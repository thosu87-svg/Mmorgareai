
"use client"

import { useState, useEffect, useRef } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { 
  Upload, 
  Zap, 
  ArrowRight, 
  Loader2, 
  FileArchive,
  ImageIcon,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Save,
  X,
  Globe,
  Plus
} from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { textureEngine, TextureSignature, TextureCategory } from "@/services/TextureEngine"
import { collection, addDoc, serverTimestamp, updateDoc, doc, deleteDoc } from "firebase/firestore"
import { initializeFirebase } from "@/firebase"
import JSZip from "jszip"
import { GitZipService } from "@/services/GitZipService"

const { firestore: db } = initializeFirebase();

async function optimizeTexture(base64: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 512;
      const MAX_HEIGHT = 512;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Canvas context failure');
      
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = reject;
    img.src = base64;
  });
}

export default function AssetHubPage() {
  const [loading, setLoading] = useState(false)
  const [manifesting, setManifesting] = useState(false)
  const [remoteUrl, setRemoteUrl] = useState("")
  const [injecting, setInjecting] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newName, setNewName] = useState("")
  const [registry, setRegistry] = useState<Record<TextureCategory, TextureSignature[]>>({
    TERRAIN: [], ARCHITECTURE: [], CHARACTER: [], UI: [], VFX: [], UNKNOWN: []
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const unsub = textureEngine.subscribe(() => {
      setRegistry(textureEngine.getSortedRegistry());
    });
    return unsub;
  }, []);

  const autoCategorize = (name: string): TextureCategory => {
    const combined = name.toLowerCase();
    if (combined.match(/grass|dirt|soil|sand|rock|terrain|ground|snow|biome|floor_g/)) return 'TERRAIN';
    if (combined.match(/wall|metal|architecture|structure|neon|door|concrete|tech_panel/)) return 'ARCHITECTURE';
    if (combined.match(/skin|eye|hair|clothes|armor|ghost|pilot|npc/)) return 'CHARACTER';
    if (combined.match(/icon|button|panel|border|hud|gui/)) return 'UI';
    if (combined.match(/particle|glow|fire|smoke|pulse|laser|magic/)) return 'VFX';
    return 'UNKNOWN';
  }

  const handleRemoteManifest = async () => {
    if (!remoteUrl.trim()) return;
    setManifesting(true);
    toast({ title: "Connecting to Git Node", description: "Fetching remote archive..." });
    
    try {
      const result = await GitZipService.manifestFromUrl(remoteUrl, autoCategorize);
      if (result.errors.length > 0) {
        toast({ variant: "destructive", title: "Partial Manifest failure", description: `${result.errors.length} assets failed.` });
      } else {
        toast({ title: "Axiomatic Success", description: `Manifested ${result.successCount} assets from remote source.` });
        setRemoteUrl("");
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Manifest Error", description: e.message });
    } finally {
      setManifesting(false);
    }
  }

  const processFile = async (file: File) => {
    if (!db) return;
    setLoading(true);

    if (file.name.endsWith('.zip')) {
      try {
        toast({ title: "Extracting Archive", description: "Ouroboros is parsing your texture pack..." });
        const zip = new JSZip();
        const content = await zip.loadAsync(file);
        let extractedCount = 0;

        for (const [filename, zipEntry] of Object.entries(content.files)) {
          if (zipEntry.dir) continue;
          const isImage = /\.(jpg|jpeg|png|webp)$/i.test(filename);
          if (isImage) {
            const blob = await zipEntry.async("blob");
            const reader = new FileReader();
            await new Promise((resolve) => {
              reader.onloadend = async () => {
                const base64 = reader.result as string;
                const name = filename.split('/').pop() || 'unnamed';
                try {
                  const optimizedUrl = await optimizeTexture(base64);
                  await addDoc(collection(db!, 'worldAssets'), {
                    name,
                    url: optimizedUrl,
                    category: autoCategorize(name),
                    tags: [filename.includes('terrain') ? 'terrain' : 'architecture', 'extracted'],
                    isActive: false,
                    createdAt: serverTimestamp()
                  });
                  extractedCount++;
                } catch (err) {}
                resolve(null);
              };
              reader.readAsDataURL(blob);
            });
          }
        }
        toast({ title: "Archive Deciphered", description: `Successfully extracted ${extractedCount} neural textures.` });
      } catch (e: any) {
        toast({ variant: "destructive", title: "Extraction Failed", description: e.message });
      } finally {
        setLoading(false);
      }
      return;
    }

    const isImage = /\.(jpg|jpeg|png|webp)$/i.test(file.name);
    if (isImage) {
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          try {
            const optimizedUrl = await optimizeTexture(base64);
            await addDoc(collection(db!, 'worldAssets'), {
              name: file.name,
              url: optimizedUrl,
              category: autoCategorize(file.name),
              tags: ['direct_upload'],
              isActive: false,
              createdAt: serverTimestamp()
            });
            toast({ title: "Texture Manifested", description: "Optimized asset synchronized." });
          } catch (err: any) {
            toast({ variant: "destructive", title: "Optimization Error", description: "Texture exceeds neural capacity." });
          }
          setLoading(false);
        };
        reader.readAsDataURL(file);
      } catch (e: any) {
        toast({ variant: "destructive", title: "Upload Failed", description: e.message });
        setLoading(false);
      }
    }
  }

  const handleToggleActive = async (asset: TextureSignature) => {
    if (!db) return;
    setInjecting(asset.id);
    try {
      const newState = !asset.isActive;
      await updateDoc(doc(db, 'worldAssets', asset.id), { isActive: newState });
      toast({ 
        title: newState ? "Signature Injected" : "Signature Withdrawn", 
        description: `${asset.name} status updated in the procedural pool.` 
      });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Injection Error", description: e.message });
    } finally {
      setInjecting(null);
    }
  }

  const handleRename = async (id: string) => {
    if (!db || !newName.trim()) return;
    try {
      await updateDoc(doc(db, 'worldAssets', id), { name: newName });
      setEditingId(null);
      toast({ title: "Identity Re-Imprinted", description: "Texture name updated in neural ledger." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Rename Error", description: e.message });
    }
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-auto">
        <header className="flex h-16 items-center border-b border-border px-6 justify-between shrink-0 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-headline font-semibold italic uppercase tracking-tight text-white">Neural Asset Engine</h1>
          </div>
          <div className="flex items-center gap-4">
            <input type="file" ref={fileInputRef} className="hidden" accept=".zip,image/*" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />
            <div className="flex gap-2">
              <Button onClick={() => fileInputRef.current?.click()} disabled={loading} variant="outline" className="border-border text-white h-10 px-4 font-black italic uppercase text-[10px] tracking-widest shadow-lg">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                Upload
              </Button>
              <Badge variant="outline" className="text-accent border-accent font-black text-[10px] tracking-widest italic">SYNC_STABLE</Badge>
            </div>
          </div>
        </header>

        <main className="p-6 space-y-8 max-w-7xl mx-auto w-full">
          {/* Git ZIP Manifest Section */}
          <Card className="bg-secondary/10 border-accent/20 shadow-2xl relative overflow-hidden group">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-2 text-accent">
                <Globe className="h-4 w-4" /> Git ZIP Manifest
              </CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold tracking-tight">Extract textures directly from GitHub releases or ZIP endpoints.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input 
                  placeholder="https://github.com/user/repo/archive/refs/heads/main.zip" 
                  value={remoteUrl}
                  onChange={(e) => setRemoteUrl(e.target.value)}
                  className="bg-black/40 border-border italic text-xs h-12"
                />
                <Button 
                  onClick={handleRemoteManifest} 
                  disabled={manifesting || !remoteUrl}
                  className="axiom-gradient text-white h-12 px-8 font-black italic uppercase text-[10px] tracking-widest shadow-xl"
                >
                  {manifesting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Manifest URL
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-secondary/10 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black uppercase text-accent tracking-widest">Active Pool</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black font-headline text-white">
                  {Object.values(registry).flat().filter(a => a.isActive).length}
                </div>
                <p className="text-[9px] text-muted-foreground uppercase mt-1">Signatures in procedural cycle</p>
              </CardContent>
            </Card>
            <Card className="bg-secondary/10 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black uppercase text-axiom-purple tracking-widest">Procedural Mode</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black font-headline text-white">ADDITIVE</div>
                <p className="text-[9px] text-muted-foreground uppercase mt-1">Multi-texture mixing enabled</p>
              </CardContent>
            </Card>
            <Card className="bg-secondary/10 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Engine Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black font-headline text-emerald-500">LIVE</div>
                <p className="text-[9px] text-muted-foreground uppercase mt-1">Determinism active</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="TERRAIN" className="w-full">
            <TabsList className="bg-secondary/50 border border-border mb-6 flex-wrap h-auto p-1">
              {Object.keys(registry).map(cat => (
                <TabsTrigger key={cat} value={cat} className="text-[9px] font-black tracking-widest uppercase italic px-4 py-2">
                  {cat} ({registry[cat as TextureCategory].length})
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(registry).map(([cat, assets]) => (
              <TabsContent key={cat} value={cat} className="mt-0">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {assets.map((asset) => (
                    <Card key={asset.id} className={`axiom-card-hover border-border bg-card overflow-hidden flex flex-col group relative ${asset.isActive ? 'ring-2 ring-accent' : ''}`}>
                      <div className="aspect-square relative overflow-hidden bg-secondary/20">
                        <Image src={asset.url} alt={asset.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className={`absolute inset-0 bg-black/60 transition-opacity flex flex-col items-center justify-center gap-2 ${asset.isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          <Button 
                            size="sm" 
                            variant={asset.isActive ? "destructive" : "secondary"} 
                            disabled={injecting === asset.id}
                            onClick={() => handleToggleActive(asset)}
                            className="rounded-full axiom-gradient border-0 text-white font-black italic uppercase text-[9px] tracking-widest"
                          >
                            {injecting === asset.id ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Zap className="h-3 w-3 mr-2" />}
                            {asset.isActive ? 'Withdraw' : 'Inject to Pool'}
                          </Button>
                        </div>
                      </div>
                      <CardHeader className="p-4 space-y-1">
                        {editingId === asset.id ? (
                          <div className="flex gap-2">
                            <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="h-7 text-[10px] bg-black/40" />
                            <Button size="icon" className="h-7 w-7" onClick={() => handleRename(asset.id)}><Save className="h-3 w-3" /></Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}><X className="h-3 w-3" /></Button>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center group/title">
                            <CardTitle className="text-[11px] font-black truncate uppercase italic text-white">{asset.name}</CardTitle>
                            <button onClick={() => { setEditingId(asset.id); setNewName(asset.name); }} className="opacity-0 group-hover/title:opacity-100 transition-opacity"><Edit2 className="h-3 w-3 text-muted-foreground" /></button>
                          </div>
                        )}
                      </CardHeader>
                      <CardFooter className="p-4 pt-0 mt-auto border-t border-white/5 flex justify-between items-center bg-white/[0.02]">
                        <div className="flex items-center gap-1.5">
                          <div className={`h-1.5 w-1.5 rounded-full ${asset.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-white/20'}`} />
                          <span className="text-[8px] font-black text-muted-foreground uppercase">{asset.isActive ? 'In Pool' : 'Idle'}</span>
                        </div>
                        <button onClick={async () => { if(confirm('Delete texture?')) await deleteDoc(doc(db!, 'worldAssets', asset.id)) }} className="text-[8px] font-black text-red-500/40 hover:text-red-500 uppercase">Delete</button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </main>
      </SidebarInset>
    </div>
  )
}
