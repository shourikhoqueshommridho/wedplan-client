import type { Metadata } from "next"
import type { ReactNode } from "react"

import { CustomerShell } from "@/components/customer/dashboard/customer-shell"
import { requireServerRole } from "@/lib/auth-server"

export const metadata: Metadata = {
  title: "Customer Dashboard",
  robots: { index: false, follow: false },
}

export const instant = false

/**
 * Server-side gate for every customer dashboard route. The role comes from the
 * verified Better Auth session, never from a client-supplied value, and the
 * page beneath repeats the check so the data fetch is protected as well.
 */
export default async function CustomerDashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireServerRole("customer", "/dashboard/customer")

  return (
    <CustomerShell
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role,
      }}
    >
      {children}
    </CustomerShell>
  )
}
