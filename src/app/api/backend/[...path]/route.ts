import { randomUUID } from "node:crypto"

import { proxyApiRequest } from "@/lib/upstream-proxy"

interface BackendRouteContext {
  params: Promise<{ path: string[] }>
}

function diagnosticsEnabled(): boolean {
  return process.env.STRIPE_CHECKOUT_DIAGNOSTICS === "1"
}

async function handler(request: Request, context: BackendRouteContext): Promise<Response> {
  const { path } = await context.params
  const isCheckout = path.join("/") === "stripe/checkout"

  if (!diagnosticsEnabled() || !isCheckout) {
    return proxyApiRequest(request, path)
  }

  // Temporary, opt-in diagnostics. Only paths, status codes and Stripe error
  // type/code are logged — never headers, tokens, cookies or payment data.
  const requestId = randomUUID()
  console.warn(
    "[checkout-diag] frontend-arrival",
    JSON.stringify({ requestId, method: request.method, path: `/api/backend/${path.join("/")}` }),
  )

  // Do not reconstruct the Request: the framework-provided object may come from
  // a different realm on Vercel, and `new Request(request, ...)` then coerces it
  // to "[object Request]" which fails URL parsing. The helper adds the
  // correlation header to the existing Headers object instead.
  return proxyApiRequest(request, path, requestId)
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as HEAD,
  handler as OPTIONS,
}
