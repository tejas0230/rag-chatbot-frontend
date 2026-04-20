"use client"

import { useMemo, useState } from "react"
import { RiCloseLine, RiEyeLine, RiEyeOffLine, RiGoogleFill } from "@remixicon/react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

export default function SignUpPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const passwordType = useMemo(() => (showPassword ? "text" : "password"), [showPassword])
  const confirmPasswordType = useMemo(
    () => (showConfirmPassword ? "text" : "password"),
    [showConfirmPassword],
  )

  const handleSignUp = async () => {
    if (isSigningUp) return
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!email.trim() || !password) {
      setErrorMessage("Please enter your email and password.")
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.")
      return
    }

    setIsSigningUp(true)
    try {
      const name = (email.includes("@") ? email.split("@")[0] : email) || "User"
      const response = await authClient.signUp.email({ email, name, password })
      if (response.error) {
        setErrorMessage(response.error.message ?? "Sign up failed.")
      } else {
        setSuccessMessage("Sign up successful. Redirecting to dashboard...")
        router.push("/dashboard")
      }
    } finally {
      setIsSigningUp(false)
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
    <div className="min-h-screen w-full bg-black/95 px-4 py-10 flex flex-col items-center justify-center">

        <h1 className="text-2xl font-semibold tracking-tight font-heading">Sign Up</h1>
        <p className="text-muted-foreground font-sans text-sm">
          Create an account to get started
        </p>

          <div className="grid gap-5 mt-4 w-full max-w-sm">
            <Field className="grid gap-1">
              <FieldLabel className="text-sm font-medium text-white/80 font-heading">Email</FieldLabel>
              <Input
                type="email"
                name="email"
                placeholder="m@example.com"
                autoComplete="email"
                required
                className="h-11 border-white/10 bg-black/40 text-white placeholder:text-white/35 focus-visible:ring-white/15 font-sans text-sm font-light"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>

            <Field className="grid gap-1">
              <FieldLabel className="text-sm font-medium text-white/80 font-heading">Password</FieldLabel>
              <div className="relative">
                <Input
                  type={passwordType}
                  name="password"
                  placeholder="Create a password"
                  autoComplete="new-password"
                  required
                  className="h-11 border-white/10 bg-black/40 pr-11 text-white placeholder:text-white/35 focus-visible:ring-white/15 font-sans text-sm font-light"
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

            <Field className="grid gap-2">
              <FieldLabel className="text-sm font-medium text-white/80 font-heading">Confirm password</FieldLabel>
              <div className="relative">
                <Input
                  type={confirmPasswordType}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  required
                  className="h-11 border-white/10 bg-black/40 pr-11 text-white placeholder:text-white/35 focus-visible:ring-white/15 font-sans text-sm font-light"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-white/60 transition hover:bg-white/5 hover:text-white font-heading"
                >
                  {showConfirmPassword ? (
                    <RiEyeLine className="h-[18px] w-[18px] opacity-90" />
                  ) : (
                    <RiEyeOffLine className="h-[18px] w-[18px] opacity-90" />
                  )}
                </button>
              </div>
            </Field>

            <Button
              type="button"
              onClick={handleSignUp}
              disabled={isSigningUp}
              className="h-11 w-full bg-white text-black hover:bg-white/90 disabled:opacity-70 font-heading text-[14px] hover:cursor-pointer hover:bg-white/90"
            >
              Sign Up
            </Button>

            <p className="text-center text-xs leading-relaxed text-white/55">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="text-white underline-offset-4 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-white underline-offset-4 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>

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
              className="h-11 w-full border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white font-heading text-[14px]"
              onClick={handleSignInWithGoogle}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center">
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
          <span className="text-sm font-sans text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-white underline-offset-4 hover:underline">
              Sign In
            </Link>
          </span>
    </div>
  )
}