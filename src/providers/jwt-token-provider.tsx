"use client"

import { useEffect, type ReactNode } from "react"

import { authClient } from "@/lib/auth-client"
import { clearJwtToken } from "@/lib/jwt-token-store"

/**
 * Keeps the in-memory JWT aligned with the Better Auth session. Token
 * acquisition itself is lazy and lives in `jwt-token-store`; this provider
 * only discards it when the session is gone or becomes invalid.
 */
export function JwtTokenProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending, error } = authClient.useSession()

  useEffect(() => {
    if (isPending) return
    if (!session || error) clearJwtToken()
  }, [session, isPending, error])

  return <>{children}</>
}
