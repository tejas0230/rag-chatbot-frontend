"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ProjectSelector } from "./project-selector"
import {
  RiApps2Line,
  RiServerLine,
  RiBarChartLine,
  RiMessageLine,
  RiKeyLine,
  RiMoneyDollarCircleLine,
  RiLogoutBoxRLine,
  RiHomeLine,
} from "@remixicon/react"
import { useAuth } from "@/components/auth-provider"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
export function DashboardSidebar() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const pathname = usePathname()
  const handleSignOut = async () => {
    if (isSigningOut) return
    setIsSigningOut(true)
    try {
      const response = await authClient.signOut()
      if (!response.error) {
        router.push("/sign-in")
        router.refresh()
      }
    } finally {
      setIsSigningOut(false)
    }
  }
  const sidebarItems = [
    {
      label: "Knowledge Base",
      icon: RiApps2Line,
      href: "/dashboard/knowledge-base",
    },
    {
      label: "Deployment",
      icon: RiServerLine,
      href: "/dashboard/deployment",
    },
    {
      label: "Analytics",
      icon: RiBarChartLine,
      href: "/dashboard/analytics",
    },
    {
      label: "Conversations",
      icon: RiMessageLine,
      href: "/dashboard/conversations",
    }
  ]

  const sidebarSettingsItems = [
    {
      label: "API Keys",
      icon: RiKeyLine,
      href: "/dashboard/api-keys",
    }
  ]

  const sidebarAccountItems = [
    {
      label: "Billing",
      icon: RiMoneyDollarCircleLine,
      href: "/dashboard/billing",
    }
  ]

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="p-2">
        <ProjectSelector />
      </SidebarHeader>


      <SidebarContent>

        <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-between gap-2 px-4">
            <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
              <Link href="/dashboard">
                <RiHomeLine className="size-4" />
                <span className="text-sm relative top-[-1px]">Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>  
        </SidebarMenu>

        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.href} className="flex items-center justify-between gap-2 pl-4">
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href} className="flex items-center gap-2 justify-start">
                      <item.icon />
                      <span className="text-sm relative top-[-1px] font-light">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarSettingsItems.map((item) => (
                <SidebarMenuItem key={item.href} className="flex items-center justify-between gap-2 pl-4">
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon />
                      <span className="text-sm relative top-[-1px]">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarAccountItems.map((item) => (
                <SidebarMenuItem key={item.href} className="flex items-center justify-between gap-2 pl-4">
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon />
                      <span className="text-sm relative top-[-1px]">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>


      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-between gap-2 p-2">
            <button
              type="button"
              onClick={() => router.push("/dashboard/account")}
              className="flex min-w-0 flex-1 items-center gap-2 rounded-md p-1 text-left transition hover:bg-sidebar-accent"
            >
              <Image
                src={user?.image || ""}
                alt="User avatar"
                width={40}
                height={40}
                className="size-9 rounded-full bg-muted"
              />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium font-heading">{user?.name}</div>
                <div className="truncate text-xs text-muted-foreground font-sans">{user?.email}</div>
              </div>
            </button>

            <SidebarMenuButton
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="h-9 w-9 justify-center text-red-500 hover:text-red-500 disabled:opacity-60"
              aria-label="Sign out"
              title="Sign out"
            >
              <RiLogoutBoxRLine className="size-4" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

