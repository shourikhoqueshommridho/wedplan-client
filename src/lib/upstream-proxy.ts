import { NextResponse } from "next/server"

import { API_BASE_URL } from "@/lib/api"
import { isRecord } from "@/lib/service-listing"

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
export async function proxyApiRequest(
  request: Request,
  path: string[],
  diagnosticId?: string,
): Promise<Response> {
  const { search } = new URL(request.url)
  const safePath = path.map((segment) => encodeURIComponent(segment)).join("/")
  const target = `${API_BASE_URL}/api/${safePath}${search}`
  const diagnostics = Boolean(
    diagnosticId &&
      process.env.STRIPE_CHECKOUT_DIAGNOSTICS === "1" &&
      path.join("/") === "stripe/checkout",
  )

  if (diagnostics) {
    console.warn(
      "[checkout-diag] frontend-target",
      JSON.stringify({ requestId: diagnosticId, targetHost: new URL(target).host }),
    )
  }

  const requestHeaders = new Headers(request.headers)
  for (const header of HOP_BY_HOP_HEADERS) {
    requestHeaders.delete(header)
  }

  // Add correlation without replacing the incoming Request, so method, body,
  // query string, cookies and Authorization are forwarded unchanged.
  if (diagnosticId) {
    requestHeaders.set("x-checkout-diagnostic-id", diagnosticId)
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

  if (diagnostics) {
    let errorType: string | null = null
    let errorCode: string | null = null

    try {
      // Clone so the response body sent to the browser is not consumed.
      const payload: unknown = await upstream.clone().json()
      if (isRecord(payload) && isRecord(payload.error)) {
        if (typeof payload.error.type === "string") errorType = payload.error.type
        if (typeof payload.error.code === "string") errorCode = payload.error.code
      }
    } catch {
      // Non-JSON bodies are expected on some failures; nothing else is logged.
    }

    console.warn(
      "[checkout-diag] frontend-response",
      JSON.stringify({ requestId: diagnosticId, status: upstream.status, errorType, errorCode }),
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
