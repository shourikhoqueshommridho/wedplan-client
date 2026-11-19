"use client"

import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"

/**
 * Same-origin client: requests go to `/api/auth/*`, which the App Router
 * proxies to the Express Better Auth handler. No tokens are stored in
 * localStorage — Better Auth uses httpOnly cookies.
 */
export const authClient = createAuthClient({
  plugins: [
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
