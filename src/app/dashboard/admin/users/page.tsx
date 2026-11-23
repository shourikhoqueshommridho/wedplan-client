import type { Metadata } from "next"

import { AdminUsersClient } from "@/components/admin/admin-users-client"
import { loadAdminUsers } from "@/lib/admin-server"
import { requireServerRole } from "@/lib/auth-server"
import type { UserRole } from "@/types/auth"

export const metadata: Metadata = {
  title: "Manage Users - Admin Dashboard",
  robots: { index: false, follow: false },
}

export const instant = false

interface PageProps {
  searchParams: Promise<{
    search?: string
    role?: string
    status?: string
    page?: string
  }>
}

function first(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : ""
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const session = await requireServerRole("admin", "/dashboard/admin/users")

  const params = await searchParams
  const search = first(params.search).slice(0, 120)
  const roleValue = first(params.role)
  const role = (["all", "customer", "vendor", "admin"].includes(roleValue)
    ? roleValue
    : "all") as UserRole | "all"
  const statusValue = first(params.status)
  const status = (["all", "active", "blocked"].includes(statusValue)
    ? statusValue
    : "all") as "all" | "active" | "blocked"
  const requestedPage = Number(first(params.page))
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1

  const query = new URLSearchParams({
    search,
    role,
    status,
    page: String(page),
    pageSize: "8",
  })
  const result = await loadAdminUsers(`?${query.toString()}`)

  return (
    <AdminUsersClient
      users={result.items}
      dataError={!result.ok}
      initialSearch={search}
      currentUserId={session.user.id}
      initialMeta={result.meta}
      initialRole={role}
      initialStatus={status}
      initialPage={page}
    />
  )
}
