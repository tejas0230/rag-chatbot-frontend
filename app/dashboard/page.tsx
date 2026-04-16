"use client"

import Image from "next/image"
import { useAuth } from "@/components/auth-provider"
import { SignOutButton } from "./sign-out-button"

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="px-4 py-2">
      <h1 className="text-2xl ">Dashboard</h1>
      <p>Welcome, {user?.email}</p>
      <p>User ID: {user?.id}</p>
      <p>User Name: {user?.name}</p>
      <p>User Email: {user?.email}</p>
      {user?.image && (
        <Image src={user.image} alt="User Image" width={100} height={100} />
      )}
      <SignOutButton />
    </div>
  )
}