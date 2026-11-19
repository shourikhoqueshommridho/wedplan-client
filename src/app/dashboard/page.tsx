import { redirect } from "next/navigation"

import { requireServerSession } from "@/lib/auth-server"
import { dashboardPathForRole } from "@/lib/safe-redirect"

export const instant = false

export default async function DashboardIndexPage() {
  const session = await requireServerSession("/dashboard")
  redirect(dashboardPathForRole(session.user.role))
}
