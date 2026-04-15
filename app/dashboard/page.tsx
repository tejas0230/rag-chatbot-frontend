import { authClient } from "@/lib/auth-client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignOutButton } from "./sign-out-button";
import Image from "next/image";

export default async function DashboardPage() {

    const cookie = (await headers()).get("cookie") ?? ""
    const { data: session, error } = await authClient.getSession({
      fetchOptions: {
        headers: {
          cookie,
        },
      },
    })

    if (error || !session) {
      redirect("/sign-in")
    }

    console.log(session.user);
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {session.user?.email}</p>
      <p>User ID: {session.user?.id}</p>
      <p>User Name: {session.user?.name}</p>
      <p>User Email: {session.user?.email}</p>
      {session.user?.image && (
        <Image src={session.user?.image} alt="User Image" width={100} height={100} />
      )}
      <SignOutButton />
    </div>
  )
}