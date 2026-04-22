"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useProfile } from "@/components/profile-provider"
import { RiCloseLine, RiDeleteBinLine, RiFileTextLine, RiGlobalLine, RiUploadLine } from "@remixicon/react"
import { api } from "@/lib/api"
import axios from "axios"

type ListedSource = { id: string; label: string; category: "url" | "file" }

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : null
}

function classifySourceRow(r: Record<string, unknown>): ListedSource | null {
  const id = r.id ?? r.sourceId ?? r._id
  if (id == null) return null
  const idStr = String(id)
  const typeStr = String(r.type ?? r.kind ?? r.sourceType ?? "").toLowerCase()
  const urlVal =
    typeof r.url === "string"
      ? r.url
      : typeof r.href === "string"
        ? r.href
        : typeof r.value === "string"
          ? r.value
          : ""
  const fileLabel = r.fileName ?? r.filename ?? r.originalFilename ?? (typeof r.name === "string" ? r.name : undefined)

  let category: "url" | "file"
  // Prefer the backend's `src.type` (or equivalent) over heuristics.
  // If the backend says "url/web", show under Websites; otherwise, treat as Files
  // even if a public download URL exists (e.g. PDFs).
  if (typeStr) {
    if (typeStr === "url" || typeStr === "web" || typeStr === "website" || typeStr === "link") category = "url"
    else category = "file"
  } else if (fileLabel && !urlVal) {
    category = "file"
  } else if (urlVal) {
    category = "url"
  } else {
    category = "file"
  }

  let label: string
  if (category === "url") {
    label = urlVal || String(fileLabel ?? idStr)
  } else {
    const fallbackFromUrl = (() => {
      if (!urlVal) return null
      try {
        const u = new URL(urlVal)
        const last = u.pathname.split("/").filter(Boolean).at(-1)
        return last ? decodeURIComponent(last) : null
      } catch {
        const last = urlVal.split("/").filter(Boolean).at(-1)
        return last ?? null
      }
    })()
    label = String(fileLabel ?? fallbackFromUrl ?? idStr)
  }

  return { id: idStr, label, category }
}

function parseSourcesPayload(data: unknown): ListedSource[] {
  if (Array.isArray(data)) {
    return data
      .map((item) => classifySourceRow(asRecord(item) ?? {}))
      .filter((row): row is ListedSource => row != null)
  }
  const root = asRecord(data)
  if (!root) return []

  const fromSplit: ListedSource[] = []
  if (Array.isArray(root.urls)) {
    for (const item of root.urls) {
      const r = asRecord(item)
      if (!r) continue
      const id = r.id ?? r.sourceId ?? r._id
      if (id == null) continue
      fromSplit.push({
        id: String(id),
        label: String(r.url ?? r.href ?? r.value ?? r.name ?? id),
        category: "url",
      })
    }
  }
  if (Array.isArray(root.files)) {
    for (const item of root.files) {
      const r = asRecord(item)
      if (!r) continue
      const id = r.id ?? r.sourceId ?? r._id
      if (id == null) continue
      fromSplit.push({
        id: String(id),
        label: String(r.fileName ?? r.filename ?? r.originalFilename ?? r.name ?? r.url ?? id),
        category: "file",
      })
    }
  }
  if (fromSplit.length > 0) return fromSplit

  const nested = Array.isArray(root.sources) ? root.sources : Array.isArray(root.data) ? root.data : []
  return nested
    .map((item) => classifySourceRow(asRecord(item) ?? {}))
    .filter((row): row is ListedSource => row != null)
}

async function postSources(formData: FormData) {
  const res = await api.post("/sources", formData, {
    transformRequest: [(data: any) => data],
    headers: { "Content-Type": undefined },
  })
  return res.data
}

/** Response shape: URL create 201: { sources: [newSource], jobId } — files: { sources, jobIds } */
type IngestionSeed = { jobId: string; sourceId: string; label: string; category: "url" | "file" }

function parseCreateSourcesResponse(data: unknown): IngestionSeed[] {
  const root = asRecord(data)
  if (!root) return []
  const jobIdSingle = root.jobId
  const jobIdsMulti = root.jobIds
  const jobIds: string[] = []
  if (typeof jobIdSingle === "string" && jobIdSingle) jobIds.push(jobIdSingle)
  if (Array.isArray(jobIdsMulti)) for (const j of jobIdsMulti) jobIds.push(String(j))
  const rawSources = Array.isArray(root.sources) ? root.sources : []
  const sources = rawSources
    .map((item) => classifySourceRow(asRecord(item) ?? {}))
    .filter((row): row is ListedSource => row != null)
  if (jobIds.length === 0) return []
  const pairs: IngestionSeed[] = []
  for (let i = 0; i < jobIds.length; i++) {
    const s = sources[i]
    if (!s) continue
    pairs.push({ jobId: jobIds[i], sourceId: s.id, label: s.label, category: s.category })
  }
  return pairs
}

type JobProgressRow = {
  id: string
  status: string
  pagesTotal: number | null
  pagesDone: number | null
  errorMessage: string | null
  sourceId: string
  sourceStatus: string
}

type IngestionState = {
  jobId: string
  sourceId: string
  label: string
  category: "url" | "file"
  pagesTotal: number
  pagesDone: number
  jobStatus: string
  sourceStatus: string
  errorMessage: string | null
}

function isIngestionComplete(jobStatus: string, sourceStatus: string) {
  const j = jobStatus.toLowerCase()
  const s = (sourceStatus || "").toLowerCase()
  const jobDone = j === "done" || j === "completed" || j === "success"
  return jobDone && s === "ready"
}

function isJobFailed(jobStatus: string) {
  const j = jobStatus.toLowerCase()
  return j === "failed" || j === "error" || j === "cancelled"
}

function IngestionProgress({ ing }: { ing: IngestionState }) {
  const total = ing.pagesTotal
  const done = ing.pagesDone
  const pct =
    total > 0
      ? Math.min(100, Math.round((done / Math.max(total, 1)) * 100))
      : null
  return (
    <div className="mt-1.5 w-full space-y-1">
      {ing.errorMessage && <p className="text-xs text-destructive">{ing.errorMessage}</p>}
      <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span className="min-w-0 truncate">
          Indexing
          {ing.jobStatus && ing.jobStatus !== "pending" ? ` · job ${ing.jobStatus}` : ""}
          {ing.sourceStatus && ing.sourceStatus !== "pending" ? ` · source ${ing.sourceStatus}` : ""}
        </span>
        {total > 0 && (
          <span className="shrink-0 tabular-nums">
            {done}/{total} pages
          </span>
        )}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: pct != null ? `${pct}%` : "40%" }}
        />
      </div>
    </div>
  )
}

function apiErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const d = err.response?.data as { message?: string } | undefined
    if (d && typeof d.message === "string") return d.message
    if (typeof err.message === "string" && err.message) return err.message
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
}

export default function KnowledgeBasePage() {
  const { selectedProjectId } = useProfile()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [remoteSources, setRemoteSources] = useState<ListedSource[]>([])
  const [sourcesLoading, setSourcesLoading] = useState(false)
  const [sourcesListError, setSourcesListError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const [url, setUrl] = useState("")
  const [urlLoading, setUrlLoading] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)
  const [urlSuccess, setUrlSuccess] = useState(false)

  const [files, setFiles] = useState<File[]>([])
  const [filesLoading, setFilesLoading] = useState(false)
  const [filesError, setFilesError] = useState<string | null>(null)
  const [filesSuccess, setFilesSuccess] = useState(false)

  const [pendingJobIds, setPendingJobIds] = useState<string[]>([])
  const [ingestionBySourceId, setIngestionBySourceId] = useState<Record<string, IngestionState>>({})
  const pendingJobIdsRef = useRef(pendingJobIds)
  pendingJobIdsRef.current = pendingJobIds
  const pendingKey = useMemo(() => [...pendingJobIds].sort().join(","), [pendingJobIds])

  const seedIngestionFromResponse = useCallback((data: unknown) => {
    const pairs = parseCreateSourcesResponse(data)
    if (pairs.length === 0) return false
    setIngestionBySourceId((prev) => {
      const next = { ...prev }
      for (const p of pairs) {
        next[p.sourceId] = {
          jobId: p.jobId,
          sourceId: p.sourceId,
          label: p.label,
          category: p.category,
          pagesTotal: 0,
          pagesDone: 0,
          jobStatus: "pending",
          sourceStatus: "pending",
          errorMessage: null,
        }
      }
      return next
    })
    setPendingJobIds((prev) => {
      const s = new Set(prev)
      for (const p of pairs) s.add(p.jobId)
      return Array.from(s)
    })
    return true
  }, [])

  const loadSources = useCallback(async (projectId: string) => {
    setSourcesLoading(true)
    setSourcesListError(null)
    try {
      const { data } = await api.get<unknown>(`/sources/${projectId}`)
      setRemoteSources(parseSourcesPayload(data))
    } catch (err) {
      setRemoteSources([])
      setSourcesListError(apiErrorMessage(err, "Failed to load sources."))
    } finally {
      setSourcesLoading(false)
    }
  }, [])

  useEffect(() => {
    setDeleteError(null)
    setDeletingId(null)
    if (!selectedProjectId) {
      setRemoteSources([])
      setSourcesListError(null)
      setPendingJobIds([])
      setIngestionBySourceId({})
      return
    }
    void loadSources(selectedProjectId)
  }, [selectedProjectId, loadSources])

  useEffect(() => {
    if (!selectedProjectId) return
    if (pendingJobIds.length === 0) return
    let cancelled = false
    const run = async () => {
      const jobIds = pendingJobIdsRef.current
      if (jobIds.length === 0) return
      try {
        const { data } = await api.post("/jobs/progress", {
          data: { jobIds },
        })
        if (cancelled) return
        const rows = Array.isArray(data) ? data : []
        setIngestionBySourceId((prev) => {
          const next = { ...prev }
          for (const row of rows) {
            const hit = Object.values(next).find((i) => i.jobId === row.id)
            if (!hit) continue
            next[hit.sourceId] = {
              ...hit,
              pagesTotal: row.pagesTotal ?? 0,
              pagesDone: row.pagesDone ?? 0,
              jobStatus: row.status,
              sourceStatus: row.sourceStatus,
              errorMessage: row.errorMessage,
            }
          }
          return next
        })
        const doneJobIds = new Set<string>()
        const successSourceIds = new Set<string>()
        for (const row of rows) {
          if (isIngestionComplete(row.status, row.sourceStatus)) {
            doneJobIds.add(row.id)
            successSourceIds.add(row.sourceId)
          } else if (isJobFailed(row.status)) {
            doneJobIds.add(row.id)
          }
        }
        if (doneJobIds.size > 0) {
          setPendingJobIds((p) => p.filter((id) => !doneJobIds.has(id)))
          if (successSourceIds.size > 0) {
            setIngestionBySourceId((prev) => {
              const n = { ...prev }
              for (const sid of successSourceIds) delete n[sid]
              return n
            })
          }
          void loadSources(selectedProjectId)
        }
      } catch {
        // keep polling; transient errors
      }
    }
    void run()
    const id = window.setInterval(() => void run(), 2000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [selectedProjectId, pendingKey, loadSources])

  const savedUrlSources = remoteSources.filter((s) => s.category === "url")
  const savedFileSources = remoteSources.filter((s) => s.category === "file")

  async function handleDeleteSource(id: string) {
    if (!selectedProjectId) return
    setDeletingId(id)
    setDeleteError(null)
    const jobId = ingestionBySourceId[id]?.jobId
    setIngestionBySourceId((prev) => {
      if (!prev[id]) return prev
      const next = { ...prev }
      delete next[id]
      return next
    })
    if (jobId) setPendingJobIds((p) => p.filter((j) => j !== jobId))
    try {
      await api.delete(`/sources/${id}/project/${selectedProjectId}`)
      await loadSources(selectedProjectId)
    } catch (err) {
      setDeleteError(apiErrorMessage(err, "Failed to delete source."))
    } finally {
      setDeletingId(null)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? [])
    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name))
      return [...prev, ...picked.filter((f) => !names.has(f.name))]
    })
    e.target.value = ""
    setFilesSuccess(false)
    setFilesError(null)
  }

  function removeFile(name: string) {
    setFiles((prev) => prev.filter((f) => f.name !== name))
  }

  async function handleSaveUrl() {
    if (!url.trim()) return
    if (!selectedProjectId) {
      setUrlError("No project selected.")
      return
    }
    setUrlLoading(true)
    setUrlError(null)
    setUrlSuccess(false)
    try {
      const fd = new FormData()
      fd.append("url", url.trim())
      fd.append("projectId", selectedProjectId)
      const resData = await postSources(fd)
      const started = seedIngestionFromResponse(resData)
      setUrlSuccess(!started)
      setUrl("")
      await loadSources(selectedProjectId)
    } catch (err: any) {
      setUrlError(err.message ?? "Failed to save URL.")
    } finally {
      setUrlLoading(false)
    }
  }

  async function handleSaveFiles() {
    if (files.length === 0) return
    if (!selectedProjectId) {
      setFilesError("No project selected.")
      return
    }
    setFilesLoading(true)
    setFilesError(null)
    setFilesSuccess(false)
    try {
      const fd = new FormData()
      fd.append("projectId", selectedProjectId)
      files.forEach((f) => fd.append("files", f))
      const resData = await postSources(fd)
      const started = seedIngestionFromResponse(resData)
      setFilesSuccess(!started)
      setFiles([])
      await loadSources(selectedProjectId)
    } catch (err: any) {
      setFilesError(err.message ?? "Failed to save files.")
    } finally {
      setFilesLoading(false)
    }
  }

  const isLoading = sourcesLoading

  return (
    <div className="flex flex-col gap-6 mx-auto max-w-3xl">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Knowledge Base</h1>
        <p className="text-sm text-muted-foreground">Add websites and files your chatbot can learn from.</p>
      </div>

      {(sourcesListError || deleteError) && (
        <p className="text-sm text-destructive">{sourcesListError ?? deleteError}</p>
      )}

      {/* Websites card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <RiGlobalLine className="size-4 text-muted-foreground" />
            <CardTitle className="text-base font-semibold">Websites</CardTitle>
            {savedUrlSources.length > 0 && (
              <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {savedUrlSources.length}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Saved URL list */}
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : savedUrlSources.length > 0 ? (
            <ul className="divide-y rounded-md border border-border">
              {savedUrlSources.map((s) => {
                const ing = ingestionBySourceId[s.id]
                return (
                  <li key={s.id} className="px-3 py-2.5 text-sm">
                    <div className="flex items-start gap-3">
                      <RiGlobalLine className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="min-w-0 flex-1 truncate text-foreground" title={s.label}>
                            {s.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => void handleDeleteSource(s.id)}
                            disabled={deletingId === s.id}
                            className="shrink-0 text-muted-foreground transition-colors hover:text-destructive disabled:opacity-40"
                            aria-label={`Remove ${s.label}`}
                          >
                            {deletingId === s.id ? (
                              <span className="text-xs">…</span>
                            ) : (
                              <RiDeleteBinLine className="size-4" />
                            )}
                          </button>
                        </div>
                        {ing && <IngestionProgress ing={ing} />}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            !isLoading && selectedProjectId && (
              <p className="text-sm text-muted-foreground">No websites added yet.</p>
            )
          )}

          {/* Add URL input */}
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setUrlSuccess(false); setUrlError(null) }}
              disabled={urlLoading}
              className="h-9 text-sm"
            />
            <Button
              type="button"
              onClick={handleSaveUrl}
              disabled={urlLoading || !url.trim()}
              className="h-9 shrink-0 px-4 text-sm"
            >
              {urlLoading ? "Adding…" : "Add URL"}
            </Button>
          </div>
          {urlError && <p className="text-sm text-destructive">{urlError}</p>}
          {urlSuccess && <p className="text-sm text-green-600">URL added successfully.</p>}
        </CardContent>
      </Card>

      {/* Files card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <RiFileTextLine className="size-4 text-muted-foreground" />
            <CardTitle className="text-base font-semibold">Files</CardTitle>
            {savedFileSources.length > 0 && (
              <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {savedFileSources.length}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Saved file list */}
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : savedFileSources.length > 0 ? (
            <ul className="divide-y rounded-md border border-border">
              {savedFileSources.map((s) => {
                const ing = ingestionBySourceId[s.id]
                return (
                  <li key={s.id} className="px-3 py-2.5 text-sm">
                    <div className="flex items-start gap-3">
                      <RiFileTextLine className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="min-w-0 flex-1 truncate text-foreground" title={s.label}>
                            {s.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => void handleDeleteSource(s.id)}
                            disabled={deletingId === s.id}
                            className="shrink-0 text-muted-foreground transition-colors hover:text-destructive disabled:opacity-40"
                            aria-label={`Remove ${s.label}`}
                          >
                            {deletingId === s.id ? (
                              <span className="text-xs">…</span>
                            ) : (
                              <RiDeleteBinLine className="size-4" />
                            )}
                          </button>
                        </div>
                        {ing && <IngestionProgress ing={ing} />}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            !isLoading && selectedProjectId && (
              <p className="text-sm text-muted-foreground">No files uploaded yet.</p>
            )
          )}

          {/* Staged files (not yet uploaded) */}
          {files.length > 0 && (
            <ul className="divide-y rounded-md border border-dashed border-border">
              {files.map((file) => (
                <li key={file.name} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                  <RiFileTextLine className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate text-foreground">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(file.name)}
                    className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                    aria-label={`Remove ${file.name}`}
                  >
                    <RiCloseLine className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {filesError && <p className="text-sm text-destructive">{filesError}</p>}
          {filesSuccess && <p className="text-sm text-green-600">Files uploaded successfully.</p>}

          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={filesLoading}
              className="h-9 gap-1.5 px-4 text-sm"
            >
              <RiUploadLine className="size-3.5" />
              Choose Files
            </Button>
            {files.length > 0 && (
              <Button
                type="button"
                onClick={handleSaveFiles}
                disabled={filesLoading}
                className="h-9 px-4 text-sm"
              >
                {filesLoading ? "Uploading…" : `Upload ${files.length} file${files.length !== 1 ? "s" : ""}`}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}