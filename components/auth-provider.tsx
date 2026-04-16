"use client"

import { createContext, useContext } from "react"

type AuthUser = {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
}

type AuthSession = {
  user?: AuthUser | null
}

type AuthContextValue = {
  session: AuthSession
  user: AuthUser | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({
  session,
  children,
}: {
  session: AuthSession
  children: React.ReactNode
}) {
  return (
    <AuthContext.Provider value={{ session, user: session.user ?? null }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

