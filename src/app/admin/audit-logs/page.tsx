
"use client"

import { useState } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase"
import { collection, query, limit, orderBy } from "firebase/firestore"
import { ClipboardList, Search, Filter, ShieldAlert, Loader2 } from "lucide-react"
import { AdminAuditLog } from "@/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const ADMIN_EMAIL = 'pleyelp2@gmail.com';

export default function AuditLogsPage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const [searchQuery, setSearchQuery] = useState("")

  const logsQuery = useMemoFirebase(() => {
    // SECURITY: Only request logs if user is definitively the admin and logged in
    if (!db || !user || user.email !== ADMIN_EMAIL) return null;
    return query(
      collection(db, "adminAuditLogs"), 
      orderBy("timestamp", "desc"),
      limit(50)
    );
  }, [db, user]);

  const { data: logs, isLoading: isLogsLoading, error } = useCollection(logsQuery);

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full bg-background overflow-hidden items-center justify-center">
        <Loader2 className="h-12 w-12 text-accent animate-spin" />
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex flex-col items-center justify-center p-12 text-center">
          <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-headline font-bold uppercase italic">Restricted Access</h2>
          <p className="text-muted-foreground mt-2 max-w-sm">
            Only authorized administrators may access the system audit ledger.
          </p>
        </SidebarInset>
      </div>
    );
  }

  const filteredLogs = (logs || []).filter(log => 
    log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.adminId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-auto">
        <header className="flex h-16 items-center border-b border-border px-6 justify-between shrink-0 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-headline font-semibold italic uppercase tracking-tight text-white">System Audit Logs</h1>
          </div>
          <Badge variant="outline" className="text-accent border-accent font-black text-[10px] tracking-widest italic">SECURITY_MONITORING_ON</Badge>
        </header>

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search audit trail..." 
                className="pl-10 bg-secondary/30 border-border italic text-xs text-white" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="secondary" className="gap-2 font-black text-[10px] tracking-widest uppercase italic border border-border">
              <Filter className="h-3 w-3" />
              Filter
            </Button>
          </div>

          <Card className="border-border bg-card overflow-hidden shadow-2xl">
            <CardHeader className="bg-secondary/10 border-b border-border/50">
              <CardTitle className="font-headline font-black italic uppercase text-sm tracking-widest flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-accent" /> Immutable Event Ledger
              </CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold tracking-tight">System-wide administrative and automated actions.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLogsLoading ? (
                <div className="p-12 text-center text-xs font-mono uppercase tracking-widest text-muted-foreground animate-pulse">
                  Decrypting Ledger...
                </div>
              ) : error ? (
                <div className="p-12 text-center text-xs font-mono uppercase text-destructive">
                  Protocol Failure: {error.message}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/5 hover:bg-transparent border-none">
                      <TableHead className="text-[10px] font-black uppercase tracking-widest italic text-accent w-[200px]">Timestamp</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest italic">Action / Method</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest italic">Principal</TableHead>
                      <TableHead className="text-right text-[10px] font-black uppercase tracking-widest italic">IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id} className="border-border/30 hover:bg-accent/5">
                        <TableCell className="font-mono text-[10px] text-muted-foreground">
                          {log.timestamp?.seconds ? new Date(log.timestamp.seconds * 1000).toLocaleString() : 'PENDING'}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-white uppercase tracking-tight">{log.action?.split('.').pop()}</span>
                            <span className="text-[9px] text-muted-foreground font-mono">{log.action}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-white">{log.adminId}</span>
                            {log.details?.principal_email && (
                              <span className="text-[9px] text-accent font-mono">{log.details.principal_email}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-[10px] text-muted-foreground">
                          {log.ipAddress}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </div>
  )
}
