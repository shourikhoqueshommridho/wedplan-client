import type { ReactNode } from "react"

import { AdminShell } from "@/components/admin/admin-shell"
import { requireServerRole } from "@/lib/auth-server"
import { loadAdminServices } from "@/lib/admin-server"

export const metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
}

export const instant = false

/** Server-side gate and chrome shared by every admin dashboard route. */
export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireServerRole("admin", "/dashboard/admin")

  const servicesResult = await loadAdminServices()
  const pendingCount = servicesResult.items.filter((service) => service.status === "pending").length

  return (
    <AdminShell
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
        role: session.user.role,
      }}
      pendingCount={pendingCount}
    >
      {children}
    </AdminShell>
  )
}
