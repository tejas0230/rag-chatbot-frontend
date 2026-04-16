"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { RiAddLine, RiArrowDownSLine, RiBuildingLine } from "@remixicon/react"
export function ProjectSelector() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="h-12">
              <span className="flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <RiBuildingLine className="size-4" />
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold tracking-tight">Project 1</span>
                  <span className="text-xs text-muted-foreground">Enterprise</span>
                </span>
              </span>
              <RiArrowDownSLine className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="w-72">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Teams</DropdownMenuLabel>
            <DropdownMenuItem>
              <span className="mr-2 grid size-7 place-items-center rounded-md bg-muted text-foreground">
                <RiBuildingLine className="size-4" />
              </span>
              <span className="flex-1">Acme Inc</span>
              <span className="text-xs text-muted-foreground">⌘1</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span className="mr-2 grid size-7 place-items-center rounded-md bg-muted text-foreground">
                <RiBuildingLine className="size-4" />
              </span>
              <span className="flex-1">Acme Corp.</span>
              <span className="text-xs text-muted-foreground">⌘2</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span className="mr-2 grid size-7 place-items-center rounded-md bg-muted text-foreground">
                <RiBuildingLine className="size-4" />
              </span>
              <span className="flex-1">Evil Corp.</span>
              <span className="text-xs text-muted-foreground">⌘3</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <span className="mr-2 grid size-7 place-items-center rounded-md bg-muted text-foreground">
                <RiAddLine className="size-4" />
              </span>
              Add team
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}