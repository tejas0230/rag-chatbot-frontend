"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useProfile } from "@/components/profile-provider"
import { useEffect, useMemo, useState } from "react"

const WIDGET_SRC = process.env.NEXT_PUBLIC_WIDGET_SRC ?? ""
const WIDGET_SCRIPT_ID = "chatbot-widget-script"
const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL + "/chat"

export default function DeploymentPage() {
  const { selectedProjectId } = useProfile()
  const [copied, setCopied] = useState(false)

  const embedSnippet = useMemo(() => {
    const params = new URLSearchParams({
      apiUrl: DEFAULT_API_URL,
      projectId: selectedProjectId ?? "YOUR_PROJECT_ID",
      botName: "Chatbot",
      greeting: "Hi! How can I help you today?",
      placeholder: "Type your message…",
      primaryColor: "#7c3aed",
      accentColor: "#22c55e",
      position: "bottom-right",
    })
    return `<script src="${WIDGET_SRC}?${params.toString()}" async></script>`
  }, [selectedProjectId])

  useEffect(() => {
    if (document.getElementById(WIDGET_SCRIPT_ID)) return
    const s = document.createElement("script")
    s.id = WIDGET_SCRIPT_ID
    s.src = WIDGET_SRC ?? ""
    s.async = true
    document.body.appendChild(s)
  }, [])

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Deployment</h1>
        <p className="text-sm text-muted-foreground">
          Add the snippet below to your site to show the chatbot widget.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">Embed snippet</CardTitle>
            <Button
              type="button"
              variant="outline"
              className="ml-auto h-8 px-3 text-xs"
              onClick={async () => {
                await navigator.clipboard.writeText(embedSnippet)
                setCopied(true)
                window.setTimeout(() => setCopied(false), 1200)
              }}
            >
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-3 text-xs">
            <code>{embedSnippet}</code>
          </pre>
          {!selectedProjectId && (
            <p className="mt-2 text-xs text-muted-foreground">
              Select a project to auto-fill the <span className="font-medium text-foreground">projectId</span>.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}