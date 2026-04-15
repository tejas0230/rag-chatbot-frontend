"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

export function SignOutButton() {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

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

  return (
    <Button type="button" onClick={handleSignOut} disabled={isSigningOut}>
      Sign Out
    </Button>
  )
}

