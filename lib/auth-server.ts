import { authClient } from "@/lib/auth-client"
import { headers } from "next/headers"

export async function getServerSession() {
  const cookie = (await headers()).get("cookie") ?? ""
  return await authClient.getSession({
    fetchOptions: {
      headers: {
        cookie,
      },
    },
  })
}

