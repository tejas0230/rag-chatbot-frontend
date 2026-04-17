"use client"

import { useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { api } from "@/lib/api"
import { useProfile } from "@/components/profile-provider"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProjectDialog({ open, onOpenChange }: Props) {
  const { refresh } = useProfile()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [slug, setSlug] = useState("")
  const [aiMode, setAiMode] = useState<"platform" | "byok">("platform")
  const [isCreating, setIsCreating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const suggestedSlug = useMemo(
    () =>
      name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    [name],
  )

  const reset = () => {
    setName("")
    setDescription("")
    setSlug("")
    setAiMode("platform")
    setErrorMessage(null)
  }

  const handleOpenChange = (v: boolean) => {
    if (!v) reset()
    onOpenChange(v)
  }

  const handleCreate = async () => {
    if (isCreating) return
    setErrorMessage(null)

    const finalSlug = (slug || suggestedSlug).trim()
    if (!name.trim()) { setErrorMessage("Project name is required."); return }
    if (!finalSlug) { setErrorMessage("Slug is required."); return }

    setIsCreating(true)
    try {
      const response = await api.post("/projects", {
        name: name.trim(),
        description: description.trim() || undefined,
        slug: finalSlug,
        aiMode,
      })
      console.log(response)
      await refresh()
      handleOpenChange(false)
    } catch (err: any) {
      const apiError =
        err?.response?.data?.error ??
        err?.response?.data?.message ??
        err?.message ??
        "Failed to create project."
      setErrorMessage(apiError)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-base font-semibold">New project</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new RAG project.
          </DialogDescription>
        </DialogHeader>

        {/* Project info */}
        <div className="space-y-4 px-6 py-4">
          <Field>
            <FieldLabel>Project name</FieldLabel>
            <Input
              className="h-9"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My awesome project"
            />
          </Field>

          <Field>
            <FieldLabel>Description <span className="text-muted-foreground font-normal">(optional)</span></FieldLabel>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
              rows={2}
              className="w-full resize-none rounded-md border border-input bg-input/20 px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 dark:bg-input/30 md:text-xs/relaxed"
            />
          </Field>

          <Field>
            <FieldLabel>Slug</FieldLabel>
            <Input
              className="h-9 font-mono text-xs"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={suggestedSlug || "my-project"}
            />
            <FieldDescription>
              Auto-generated from the name. Used in URLs.
            </FieldDescription>
          </Field>
        </div>

        <Separator />

        {/* BYOK */}
        <div className="px-6 py-4">
          <div className="flex items-start justify-between gap-4 rounded-xl border bg-muted/30 p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">
                Bring Your Own Key{" "}
                <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary">
                  BYOK
                </span>
              </p>
              <p className="max-w-xs text-xs text-muted-foreground">
                When <strong className="text-foreground">on</strong>, AI calls use your own API key.
                When <strong className="text-foreground">off</strong>, the platform's built-in key is used.
              </p>
            </div>
            <Switch
              checked={aiMode === "byok"}
              onCheckedChange={(v) => setAiMode(v ? "byok" : "platform")}
              aria-label="Bring Your Own Key"
            />
          </div>
        </div>

        <Separator />

        <DialogFooter className="flex-col gap-2 px-6 py-4" showCloseButton>
          {errorMessage && (
            <p className="text-xs text-destructive">{errorMessage}</p>
          )}
          <Button
            type="button"
            onClick={handleCreate}
            disabled={isCreating}
            className="h-9 w-full sm:w-auto disabled:opacity-60"
          >
            {isCreating ? "Creating…" : "Create project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
