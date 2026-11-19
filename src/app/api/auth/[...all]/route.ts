import { NextResponse } from "next/server"

import { API_BASE_URL } from "@/lib/api"

const HOP_BY_HOP_HEADERS = [
  "connection",
  "content-encoding",
  "content-length",
  "expect",
  "host",
  "keep-alive",
  "transfer-encoding",
] as const

interface AuthRouteContext {
  params: Promise<{ all: string[] }>
}

/**
 * Proxies Better Auth requests from the Next.js origin to the Express auth
 * authority. Keeping the public auth URL on the Next.js origin means the
 * session cookie stays first-party and no CORS credentials dance is needed.
 */
async function proxyAuthRequest(request: Request, context: AuthRouteContext): Promise<Response> {
  const { all } = await context.params
  const search = new URL(request.url).search
  const target = `${API_BASE_URL}/api/auth/${all.map(encodeURIComponent).join("/")}${search}`

  const requestHeaders = new Headers(request.headers)
  for (const header of HOP_BY_HOP_HEADERS) {
    requestHeaders.delete(header)
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD"

  let upstream: Response
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers: requestHeaders,
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: "manual",
      cache: "no-store",
    })
  } catch (error) {
    console.error(
      "[wedplan-auth-proxy]",
      error instanceof Error ? error.message : "Upstream auth request failed",
      error instanceof Error ? error.cause : undefined,
    )
    return NextResponse.json(
      { error: "Authentication service is unavailable." },
      { status: 503 },
    )
  }

  const responseHeaders = new Headers(upstream.headers)
  for (const header of HOP_BY_HOP_HEADERS) {
    responseHeaders.delete(header)
  }

  // Preserve each Set-Cookie header separately; combining them breaks cookies.
  const setCookies =
    typeof upstream.headers.getSetCookie === "function" ? upstream.headers.getSetCookie() : []
  responseHeaders.delete("set-cookie")

  const response = new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  })

  for (const cookie of setCookies) {
    response.headers.append("set-cookie", cookie)
  }

  // The vendor sign-up intent is one-shot: whichever OAuth callback returns
  // (success, cancellation or error), the short-lived cookie is removed.
  if (all[0] === "callback") {
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : ""
    response.headers.append(
      "set-cookie",
      `wedplan_vendor_intent=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`,
    )
  }

  return response
}

export {
  proxyAuthRequest as GET,
  proxyAuthRequest as POST,
  proxyAuthRequest as PUT,
  proxyAuthRequest as PATCH,
  proxyAuthRequest as DELETE,
  proxyAuthRequest as HEAD,
  proxyAuthRequest as OPTIONS,
}
