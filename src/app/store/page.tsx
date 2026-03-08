"use client"

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ShoppingCart, Zap, CreditCard, ShieldCheck } from "lucide-react"
import Image from "next/image"
import { PlaceHolderImages } from "@/lib/placeholder-images"

const products = [
  { id: 1, name: "Axiom Cyber Deck", price: "24.99", category: "Hardware", image: PlaceHolderImages[0], rarity: "Epic" },
  { id: 2, name: "Ionized Plasma Core", price: "12.50", category: "Components", image: PlaceHolderImages[1], rarity: "Rare" },
  { id: 3, name: "Void-Forged Armor", price: "45.00", category: "Apparel", image: PlaceHolderImages[2], rarity: "Legendary" },
  { id: 4, name: "Nebula Pass", price: "9.99", category: "Service", image: PlaceHolderImages[3], rarity: "Uncommon" },
]

export default function StorePage() {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-auto">
        <header className="flex h-16 items-center border-b border-border px-6 gap-4 shrink-0 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <SidebarTrigger />
          <h1 className="text-xl font-headline font-semibold">Axiom Storefront</h1>
          <div className="ml-auto flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 axiom-gradient">0</Badge>
            </Button>
          </div>
        </header>

        <main className="p-6 max-w-7xl mx-auto w-full space-y-8">
          <div className="axiom-gradient p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 text-white overflow-hidden relative">
            <div className="relative z-10 space-y-4 max-w-md">
              <Badge className="bg-white/20 text-white border-0 hover:bg-white/30">LIMITED OFFER</Badge>
              <h2 className="text-4xl font-headline font-bold">Secure Your Axiom Gear</h2>
              <p className="text-blue-100">All transactions are processed through Firebase Cloud Functions and PayPal for maximum security.</p>
              <Button variant="secondary" className="font-semibold px-8">Upgrade Now</Button>
            </div>
            <Zap className="h-64 w-64 text-white/10 absolute -right-10 -bottom-10" />
            <div className="relative z-10 bg-black/20 backdrop-blur-sm p-6 rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium">AxiomEnforcer Protected</span>
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center text-[8px]">VISA</div>
                <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center text-[8px]">MC</div>
                <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center text-[8px]">PAYPAL</div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="bg-secondary/50 border border-border">
                <TabsTrigger value="all">All Items</TabsTrigger>
                <TabsTrigger value="hardware">Hardware</TabsTrigger>
                <TabsTrigger value="apparel">Apparel</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                <span>Balance: 14,500 AXM</span>
              </div>
            </div>

            <TabsContent value="all" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-0">
              {products.map((product) => (
                <Card key={product.id} className="axiom-card-hover border-border bg-card overflow-hidden flex flex-col">
                  <div className="aspect-square relative overflow-hidden bg-secondary/20">
                    <Image 
                      src={product.image.imageUrl} 
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-110"
                      data-ai-hint={product.image.imageHint}
                    />
                    <Badge className={`absolute top-2 left-2 ${
                      product.rarity === 'Legendary' ? 'bg-orange-500' :
                      product.rarity === 'Epic' ? 'bg-purple-500' :
                      'bg-accent text-accent-foreground'
                    }`}>
                      {product.rarity}
                    </Badge>
                  </div>
                  <CardHeader className="p-4 space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{product.category}</span>
                    <CardTitle className="text-lg font-headline">{product.name}</CardTitle>
                  </CardHeader>
                  <CardFooter className="p-4 pt-0 mt-auto flex items-center justify-between gap-4">
                    <span className="text-xl font-bold font-headline">${product.price}</span>
                    <Button size="sm" className="axiom-gradient text-white border-0">Buy Now</Button>
                  </CardFooter>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </div>
  )
}