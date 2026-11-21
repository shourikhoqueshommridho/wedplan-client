"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { authClient } from "@/lib/auth-client"

/**
 * Shared sign-out behaviour for the dashboard chrome. Uses the same Better Auth
 * client call as the public navbar, so no second logout path is introduced.
 */
export function useSignOut() {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function signOut(onSuccess?: () => void): Promise<void> {
    if (isSigningOut) return
    setIsSigningOut(true)

    try {
      const { error } = await authClient.signOut()

      if (error) {
        toast.error("Could not sign out", {
          description: error.message || "Please try again.",
        })
        return
      }

      onSuccess?.()
      toast.success("Signed out", { description: "You have been signed out safely." })
      router.push("/")
      router.refresh()
    } catch {
      toast.error("Could not sign out", { description: "Please try again." })
    } finally {
      setIsSigningOut(false)
    }
  }

  return { isSigningOut, signOut }
}
