import { AuthProvider } from "@/components/auth-provider"
import { getServerSession } from "@/lib/auth-server"
import { redirect } from "next/navigation"

type AuthWrapperProps = {
  children: React.ReactNode
  redirectTo?: string
}

export async function AuthWrapper({ children, redirectTo = "/sign-in" }: AuthWrapperProps) {
  const { data: session, error } = await getServerSession()

  if (error || !session) {
    redirect(redirectTo)
  }

  return <AuthProvider session={session}>{children}</AuthProvider>
}

