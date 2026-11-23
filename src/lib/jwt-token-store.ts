"use client"

import { authClient } from "@/lib/auth-client"

/**
 * In-memory only. Tokens are never written to localStorage, sessionStorage,
 * document cookies, or any other persistent browser storage.
 */
let token: string | null = null
let pending: Promise<string | null> | null = null

/** Short cache so a stale JWKS proxy does not add a request to every API call. */
let jwksAvailable: boolean | null = null
let jwksCheckedAt = 0
const JWKS_CACHE_MS = 60_000

const EXPIRY_SKEW_MS = 30_000

async function isJwksAvailable(): Promise<boolean> {
  const now = Date.now()
  if (jwksAvailable !== null && now - jwksCheckedAt < JWKS_CACHE_MS) {
    return jwksAvailable
  }

  try {
    const { data, error } = await authClient.jwks()
    jwksAvailable = !error && Array.isArray(data?.keys) && data.keys.length > 0
  } catch {
    jwksAvailable = false
  }

  jwksCheckedAt = now
  return jwksAvailable
}

/**
 * Decodes `exp` for refresh scheduling only. This value is NOT used for any
 * authorization decision — the Express verifier validates the signature and
 * all claims independently.
 */
function isExpiringSoon(value: string): boolean {
  const segment = value.split(".")[1]
  if (!segment) return true

  try {
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4)
    const payload = JSON.parse(atob(padded)) as { exp?: unknown }
    if (typeof payload.exp !== "number") return true
    return payload.exp * 1000 - Date.now() < EXPIRY_SKEW_MS
  } catch {
    return true
  }
}

async function fetchToken(): Promise<string | null> {
  // If JWKS is not reachable (for example a stale local proxy), skip Bearer
  // entirely so the existing httpOnly-cookie flow keeps working. The backend
  // still verifies every token it actually receives.
  if (!(await isJwksAvailable())) {
    token = null
    return null
  }

  try {
    const { data, error } = await authClient.token()
    if (error || !data?.token) {
      token = null
      return null
    }
    token = data.token
    return token
  } catch {
    token = null
    return null
  }
}

/** Returns a usable in-memory JWT, or null when cookie auth should be used. */
export function getJwtToken(): Promise<string | null> {
  if (token && !isExpiringSoon(token)) return Promise.resolve(token)

  pending ??= fetchToken().finally(() => {
    pending = null
  })
  return pending
}

/** Forces a fresh token (and a fresh JWKS check) after a 401 response. */
export async function refreshJwtToken(): Promise<string | null> {
  token = null
  pending = null
  jwksCheckedAt = 0
  return getJwtToken()
}

/** Called on sign-out and whenever the authenticated session disappears. */
export function clearJwtToken(): void {
  token = null
  pending = null
  jwksCheckedAt = 0
  jwksAvailable = null
}
