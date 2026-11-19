import "server-only"

import { cache } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { API_BASE_URL } from "@/lib/api"
import { dashboardPathForRole } from "@/lib/safe-redirect"
import { parseAuthSession, type AuthSessionData, type UserRole } from "@/types/auth"

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies()
  return cookieStore.toString()
}

/**
 * Reads the Better Auth session through the Express auth authority, forwarding
 * the httpOnly cookie. Returns null for missing, expired or malformed sessions.
 */
export const getServerSession = cache(async (): Promise<AuthSessionData | null> => {
  const cookieHeader = await getCookieHeader()
  if (!cookieHeader) return null

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/get-session`, {
      headers: { cookie: cookieHeader, accept: "application/json" },
      cache: "no-store",
    })

    if (!response.ok) return null

    return parseAuthSession(await response.json())
  } catch {
    return null
  }
})

export async function redirectIfAuthenticated(nextPath: string): Promise<void> {
  const session = await getServerSession()
  if (session) redirect(nextPath)
}

export async function requireServerSession(nextPath: string): Promise<AuthSessionData> {
  const session = await getServerSession()

  if (!session) {
    redirect(`/sign-in?next=${encodeURIComponent(nextPath)}`)
  }

  return session
}

export async function requireServerRole(
  role: UserRole,
  nextPath: string,
): Promise<AuthSessionData> {
  const session = await requireServerSession(nextPath)

  if (session.user.role !== role) {
    redirect(dashboardPathForRole(session.user.role))
  }

  return session
}

/** Server-side authenticated fetch for protected API routes. */
export async function fetchWithSession(path: string): Promise<Response | null> {
  const cookieHeader = await getCookieHeader()
  if (!cookieHeader) return null

  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      headers: { cookie: cookieHeader, accept: "application/json" },
      cache: "no-store",
    })
  } catch {
    return null
  }
}
