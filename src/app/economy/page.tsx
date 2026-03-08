"use client"

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Activity, TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const ecoData = [
  { day: "Mon", circulating: 4500, burnt: 1200 },
  { day: "Tue", circulating: 4800, burnt: 1500 },
  { day: "Wed", circulating: 5200, burnt: 1100 },
  { day: "Thu", circulating: 5000, burnt: 1800 },
  { day: "Fri", circulating: 6100, burnt: 2100 },
  { day: "Sat", circulating: 7200, burnt: 2500 },
  { day: "Sun", circulating: 6800, burnt: 1900 },
]

export default function EconomyPage() {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-auto">
        <header className="flex h-16 items-center border-b border-border px-6 justify-between shrink-0 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-headline font-semibold">Economy Hub</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-500">
            <TrendingUp className="h-4 w-4" />
            <span>Inflation Rate: -0.4% (Deflationary)</span>
          </div>
        </header>

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Total Axiom (AXM)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-headline">24.5M</div>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span>+2.1% supply increase</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Average Wallet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-headline">12.4k</div>
                <div className="text-[10px] text-muted-foreground">AXM per active player</div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Market Velocity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-headline">0.82</div>
                <div className="text-[10px] text-muted-foreground">Trades per second</div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Sink/Faucet Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-headline">1.12</div>
                <div className="text-[10px] text-muted-foreground text-emerald-500">Positive balance</div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="font-headline">Currency Lifecycle</CardTitle>
              <CardDescription>Visualizing circulating supply vs. total currency burnt through game sinks.</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ChartContainer config={{
                circulating: { label: "Circulating Supply", color: "hsl(var(--accent))" },
                burnt: { label: "Currency Burnt", color: "hsl(var(--destructive))" }
              }}>
                <AreaChart data={ecoData}>
                  <defs>
                    <linearGradient id="colorCirc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="4 4" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={12} tickMargin={10} />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} tickMargin={10} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="circulating" stroke="hsl(var(--accent))" fill="url(#colorCirc)" strokeWidth={2} />
                  <Area type="monotone" dataKey="burnt" stroke="hsl(var(--destructive))" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </div>
  )
}
