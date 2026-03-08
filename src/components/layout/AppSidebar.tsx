"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  ShieldAlert, 
  ScrollText, 
  UserPlus, 
  Database, 
  Settings,
  Zap,
  MonitorPlay,
  BrainCircuit,
  BookOpen,
  LogIn,
  LogOut,
  User as UserIcon,
  ClipboardList,
  ShieldCheck,
  Github,
  Cpu
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useUser, useAuth } from "@/firebase"
import { AuthModal } from "@/components/auth/AuthModal"
import { signOut } from "firebase/auth"
import { useStore } from "@/store"

const mainItems = [
  { title: "Oversight", icon: LayoutDashboard, url: "/dashboard" },
  { title: "World Preview", icon: MonitorPlay, url: "/world-preview" },
  { title: "Players", icon: Users, url: "/players" },
  { title: "Agent Oversight", icon: ShieldAlert, url: "/agents" },
  { title: "Audit Logs", icon: ClipboardList, url: "/admin/audit-logs" },
]

const contentItems = [
  { title: "Brain Engine", icon: Cpu, url: "/dashboard/brain" },
  { title: "Content Brain", icon: BrainCircuit, url: "/admin/content" },
  { title: "Quest Engine", icon: ScrollText, url: "/quests" },
  { title: "NPC Architect", icon: UserPlus, url: "/npcs" },
  { title: "Lore Archives", icon: BookOpen, url: "/admin/lore" },
  { title: "Asset Hub", icon: Database, url: "/assets" },
]

const ADMIN_EMAIL = 'pleyelp2@gmail.com';

export function AppSidebar() {
  const pathname = usePathname()
  const { user } = useUser()
  const auth = useAuth()
  const [authModalOpen, setAuthModalOpen] = React.useState(false)

  const handleLogout = () => {
    if (auth) signOut(auth)
  }

  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-border">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg axiom-gradient shadow-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-lg font-display font-bold leading-none text-white uppercase italic">AXIOM</span>
              <span className="text-[10px] text-accent tracking-[0.2em] font-black">CORE_FRONTIER</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          {isAdmin && (
            <SidebarGroup>
              <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-emerald-500 font-black tracking-widest italic uppercase flex items-center gap-2 mb-2">
                <ShieldCheck className="h-3 w-3" /> Master Control
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => useStore.getState().setMatrixOverseerOpen(true)}
                      className="text-white bg-emerald-600 hover:bg-emerald-500 border-0 h-16 shadow-xl group hover:scale-[1.02] transition-all rounded-xl relative overflow-hidden mb-2"
                      tooltip="SYNC TO GITHUB"
                    >
                      <Github className="h-6 w-6 shrink-0" />
                      <div className="flex flex-col items-start ml-2 group-data-[collapsible=icon]:hidden">
                        <span className="font-black text-[11px] tracking-widest uppercase italic">SYNC TO GITHUB</span>
                        <span className="text-[8px] font-bold text-white/60 uppercase">Manual Snapshot v1.0.6</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Session</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {user ? (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname === '/profile'} tooltip="Profile">
                        <Link href="/profile">
                          <UserIcon className="h-4 w-4" />
                          <span>{user.displayName || user.email?.split('@')[0]}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton onClick={handleLogout} tooltip="Sign Out">
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                ) : (
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setAuthModalOpen(true)} tooltip="Sign In">
                      <LogIn className="h-4 w-4" />
                      <span>Sign In</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Assets & Logic</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {contentItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings" isActive={pathname === '/settings'}>
                <Link href="/settings">
                  <Settings className="h-4 w-4" />
                  <span>Global Config</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  )
}