
"use client"

import { useUser, useDoc, useMemoFirebase, useFirestore } from "@/firebase"
import { doc } from "firebase/firestore"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { User as UserIcon, Calendar, Mail, Shield, Zap } from "lucide-react"

export default function ProfilePage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()

  const userDocRef = useMemoFirebase(() => 
    user ? doc(db, "users", user.uid) : null, 
    [db, user]
  )
  const { data: userData, isLoading: isDataLoading } = useDoc(userDocRef)

  const playerDocRef = useMemoFirebase(() => 
    user ? doc(db, "players", user.uid) : null, 
    [db, user]
  )
  const { data: playerData } = useDoc(playerDocRef)

  if (isUserLoading || isDataLoading) {
    return (
      <div className="flex h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="p-8">
          <Skeleton className="h-12 w-48 mb-8" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </SidebarInset>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <p className="text-muted-foreground italic">Please sign in to view your profile.</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-auto">
        <header className="flex h-16 items-center border-b border-border px-6 justify-between shrink-0 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-headline font-semibold italic uppercase tracking-tight text-white">Pilot Profile</h1>
          </div>
        </header>

        <main className="p-6 space-y-8 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border-2 border-accent shadow-xl">
              <AvatarImage src={user.photoURL || ""} />
              <AvatarFallback className="bg-secondary text-2xl font-bold">
                {user.displayName?.[0] || user.email?.[0] || "P"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-3xl font-headline font-black italic uppercase tracking-tighter text-white">
                {user.displayName || "Unknown Pilot"}
              </h2>
              <div className="flex items-center gap-4 text-muted-foreground text-sm">
                <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {user.email}</span>
                <span className="flex items-center gap-1.5"><Shield className="h-4 w-4" /> ID: {user.uid.slice(0, 8)}...</span>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border bg-card shadow-2xl">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-accent" /> Account Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Joined</span>
                  <span className="text-sm font-mono text-white">
                    {userData?.createdAt ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString() : "Recently"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">Verified</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-2xl">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <Zap className="h-4 w-4 text-accent" /> Neural Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Current Level</span>
                  <span className="text-sm font-headline font-bold text-white">
                    {playerData?.level || 1}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Total XP</span>
                  <span className="text-sm font-mono text-white">
                    {playerData?.exp || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </div>
  )
}
