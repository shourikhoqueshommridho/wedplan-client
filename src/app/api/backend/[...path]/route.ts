import { proxyApiRequest } from "@/lib/upstream-proxy"

interface BackendRouteContext {
  params: Promise<{ path: string[] }>
}

async function handler(request: Request, context: BackendRouteContext): Promise<Response> {
  const { path } = await context.params
  return proxyApiRequest(request, path)
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
