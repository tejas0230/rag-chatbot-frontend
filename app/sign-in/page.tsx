
"use client"

import { useMemo, useState } from "react"
import { RiCloseLine, RiEyeLine, RiEyeOffLine, RiGoogleFill } from "@remixicon/react"
import { Card } from "@/components/ui/card"
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

export default function SignInPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const passwordType = useMemo(() => (showPassword ? "text" : "password"), [showPassword])

  const handleSignIn = async () => {
    if (isSigningIn) return
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!email.trim() || !password) {
      setErrorMessage("Please enter your email and password.")
      return
    }

    setIsSigningIn(true)
    try {
      const response = await authClient.signIn.email({ email, password })
      if (response.error) {
        setErrorMessage(response.error.message ?? "Sign in failed.")
      } else {
        setSuccessMessage("Signed in. Redirecting...")
        router.push("/dashboard")
      }
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleSignInWithGoogle = async () => {
    const response = await authClient.signIn.social({ provider: "google" })
    if (response.error) {
      setErrorMessage(response.error.message ?? "Sign in failed.")
    } else {
      setSuccessMessage("Signed in. Redirecting...")
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen w-full bg-black/95 px-4 py-10 flex items-center justify-center">
      <Card className="relative w-full max-w-md border-white/10 bg-neutral-950 text-white shadow-2xl shadow-black/40">

        <CardHeader className="space-y-2 pt-10 text-center">
          <CardTitle className="text-3xl font-semibold tracking-tight">Sign In</CardTitle>
          <CardDescription className="text-white/60">
            Enter your email and password to login
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6">
          <div className="grid gap-5">
            <Field className="grid gap-2">
              <FieldLabel className="text-sm font-medium text-white/80">Email</FieldLabel>
              <Input
                type="email"
                name="email"
                placeholder="m@example.com"
                autoComplete="email"
                required
                className="h-11 border-white/10 bg-black/40 text-white placeholder:text-white/35 focus-visible:ring-white/15"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>

            <Field className="grid gap-2">
              <div className="flex items-center justify-between gap-3">
                <FieldLabel className="text-sm font-medium text-white/80">Password</FieldLabel>
                <Link
                  href="/forgot-password"
                  className="text-xs text-white/55 underline-offset-4 transition hover:text-white hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={passwordType}
                  name="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="h-11 border-white/10 bg-black/40 pr-11 text-white placeholder:text-white/35 focus-visible:ring-white/15"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-white/60 transition hover:bg-white/5 hover:text-white"
                >
                  {showPassword ? (
                    <RiEyeLine className="h-[18px] w-[18px] opacity-90" />
                  ) : (
                    <RiEyeOffLine className="h-[18px] w-[18px] opacity-90" />
                  )}
                </button>
              </div>
            </Field>

            <Button
              type="button"
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="h-11 w-full bg-white text-black hover:bg-white/90 disabled:opacity-70"
            >
              Sign In
            </Button>

            <div className="flex items-center gap-4 py-1">
              <div className="h-px flex-1 bg-white/10" />
              <div className="text-xs font-medium tracking-[0.18em] text-white/50">
                OR CONTINUE WITH
              </div>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-11 w-full border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white"
              onClick={handleSignInWithGoogle}
            >
              <span className="mr-2 inline-flex h-5 w-5 items-center justify-center">
                <RiGoogleFill className="h-[18px] w-[18px]" />
              </span>
              Google
            </Button>

            {(errorMessage || successMessage) && (
              <div
                className={[
                  "rounded-lg border px-3 py-2 text-sm",
                  errorMessage
                    ? "border-red-500/20 bg-red-500/10 text-red-200"
                    : "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
                ].join(" ")}
                role={errorMessage ? "alert" : "status"}
              >
                {errorMessage ?? successMessage}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-center pb-8 pt-6 text-sm text-white/60">
          <span>
            Don't have an account?{" "}
            <Link href="/sign-up" className="text-white underline-offset-4 hover:underline">
              Sign Up
            </Link>
          </span>
        </CardFooter>
      </Card>
    </div>
  )
}