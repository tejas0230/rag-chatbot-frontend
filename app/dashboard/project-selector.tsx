"use client"

import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { RiAddLine, RiArrowDownSLine, RiBuildingLine, RiCheckLine } from "@remixicon/react"
import { useProfile } from "@/components/profile-provider"
import { CreateProjectDialog } from "./create-project-dialog"

export function ProjectSelector() {
  const { profile, selectedProject, selectedProjectId, setSelectedProjectId } = useProfile()
  const [dialogOpen, setDialogOpen] = useState(false)

  const projects: any[] = profile?.projects ?? []
  const selectedId = selectedProjectId ?? (selectedProject?.id ? String(selectedProject.id) : null)

  const selectedName =
    selectedProject?.name ??
    selectedProject?.title ??
    selectedProject?.projectName ??
    "Select project"
  const selectedSubtitle =
    selectedProject?.workspace ??
    selectedProject?.type ??
    selectedProject?.description ??
    "Project"

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className="h-12 overflow-hidden">
                <span className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                    <RiBuildingLine className="size-4" />
                  </span>
                  <span className="flex min-w-0 flex-col leading-tight">
                    <span className="truncate text-sm font-semibold tracking-tight font-heading">
                      {selectedName}
                    </span>
                    <span className="truncate text-xs text-muted-foreground font-sans">{selectedSubtitle}</span>
                  </span>
                </span>
                <RiArrowDownSLine className="ml-2 size-4 shrink-0 text-muted-foreground" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-72">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Projects
              </DropdownMenuLabel>

              {projects.length === 0 && (
                <div className="px-2 py-3 text-center text-xs text-muted-foreground">
                  No projects yet
                </div>
              )}

              {projects.map((p: any) => {
                const id = String(p.id)
                const name = p.name ?? p.title ?? p.projectName ?? id
                const isSelected = id === selectedId
                return (
                  <DropdownMenuItem
                    key={id}
                    className="cursor-pointer"
                    onClick={() => setSelectedProjectId(id)}
                  >
                    <span className="mr-2 grid size-7 shrink-0 place-items-center rounded-md bg-muted text-foreground">
                      <RiBuildingLine className="size-4" />
                    </span>
                    <span className="flex-1 truncate text-sm font-heading">{name}</span>
                    {isSelected && (
                      <RiCheckLine className="ml-2 size-4 shrink-0 text-primary" />
                    )}
                  </DropdownMenuItem>
                )
              })}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="cursor-pointer font-medium " 
                onClick={() => setDialogOpen(true)}
              >
                <span className="mr-2 grid size-7 shrink-0 place-items-center rounded-md border border-dashed bg-muted text-foreground">
                  <RiAddLine className="size-4" />
                </span>
                <span className="text-sm font-heading">New project</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <CreateProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
