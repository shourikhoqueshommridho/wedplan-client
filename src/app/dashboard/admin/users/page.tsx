import type { Metadata } from "next"

import { AdminUsersClient } from "@/components/admin/admin-users-client"
import { loadAdminUsers } from "@/lib/admin-server"
import { requireServerRole } from "@/lib/auth-server"

export const metadata: Metadata = {
  title: "Manage Users - Admin Dashboard",
  robots: { index: false, follow: false },
}

export const instant = false

interface PageProps {
  searchParams: Promise<{ search?: string }>
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const session = await requireServerRole("admin", "/dashboard/admin/users")

  const { search } = await searchParams
  const result = await loadAdminUsers()

  return (
    <AdminUsersClient
      users={result.items}
      dataError={!result.ok}
      initialSearch={search ?? ""}
      currentUserId={session.user.id}
    />
  )
}
