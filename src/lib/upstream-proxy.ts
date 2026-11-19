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

/**
 * Forwards a same-origin `/api/backend/*` request to the Express API while
 * preserving cookies in both directions. Browser code never talks to the API
 * origin directly, so the Better Auth session cookie stays first-party.
 */
export async function proxyApiRequest(request: Request, path: string[]): Promise<Response> {
  const { search } = new URL(request.url)
  const safePath = path.map((segment) => encodeURIComponent(segment)).join("/")
  const target = `${API_BASE_URL}/api/${safePath}${search}`

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
      "[wedplan-api-proxy]",
      error instanceof Error ? error.message : "Upstream API request failed",
    )
    return NextResponse.json(
      { success: false, message: "The WedPlan API is unavailable. Please try again." },
      { status: 503 },
    )
  }

  const responseHeaders = new Headers(upstream.headers)
  for (const header of HOP_BY_HOP_HEADERS) {
    responseHeaders.delete(header)
  }

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

  return response
}
