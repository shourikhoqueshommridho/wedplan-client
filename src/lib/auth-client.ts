"use client"

import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields, jwtClient } from "better-auth/client/plugins"

/**
 * Same-origin client: requests go to `/api/auth/*`, which the App Router
 * proxies to the Express Better Auth handler. No tokens are stored in
 * localStorage — Better Auth uses httpOnly cookies.
 */
export const authClient = createAuthClient({
  plugins: [
    // Adds typed `authClient.token()` and `authClient.jwks()` helpers.
    // Sessions remain the primary authentication mechanism.
    jwtClient(),
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          required: false,
          defaultValue: "customer",
          input: false,
        },
      },
    }),
  ],
})
