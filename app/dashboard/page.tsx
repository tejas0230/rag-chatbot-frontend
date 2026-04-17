"use client"

import { useState } from "react"
import { useProfile } from "@/components/profile-provider"
import { Button } from "@/components/ui/button"
import { RiRocketLine } from "@remixicon/react"
import { CreateProjectDialog } from "./create-project-dialog"

export default function DashboardPage() {
  const { profile, selectedProject } = useProfile()
  const projects = profile?.projects ?? []
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="flex h-full flex-col items-center  py-4 px-4">
      {projects.length === 0 ? (
        /* ── Empty state ── */
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <RiRocketLine className="size-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">No projects yet</h1>
            <p className="text-sm text-muted-foreground">
              Create your first project to start building your RAG-powered chatbot.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="h-10 px-6"
          >
            Create project
          </Button>
        </div>
      ) : (
        /* ── Project dashboard ── */
        <div className="w-full">
          <h1 className="text-2xl font-bold tracking-tight">
            {selectedProject?.name ?? "Dashboard"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {selectedProject?.description ?? "Select a section from the sidebar to get started."}
          </p>
        </div>
      )}

      <CreateProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
