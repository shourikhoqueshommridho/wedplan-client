import type { Metadata } from "next"

import { AdminServicesClient } from "@/components/admin/admin-services-client"
import { loadAdminServices } from "@/lib/admin-server"
import { requireServerRole } from "@/lib/auth-server"
import type { AdminServiceFilterStatus } from "@/lib/admin-dashboard"

export const metadata: Metadata = {
  title: "Manage Services - Admin Dashboard",
  robots: { index: false, follow: false },
}

export const instant = false

interface PageProps {
  searchParams: Promise<{
    search?: string
    service?: string
    status?: string
  }>
}

const VALID_STATUSES: readonly AdminServiceFilterStatus[] = [
  "all",
  "pending",
  "approved",
  "rejected",
  "inactive",
]

export default async function AdminServicesPage({ searchParams }: PageProps) {
  await requireServerRole("admin", "/dashboard/admin/services")

  const query = await searchParams
  const result = await loadAdminServices()
  const status = VALID_STATUSES.includes(query.status as AdminServiceFilterStatus)
    ? (query.status as AdminServiceFilterStatus)
    : "all"

  return (
    <AdminServicesClient
      key={`${query.service ?? ""}:${status}:${query.search ?? ""}`}
      services={result.items}
      dataError={!result.ok}
      initialServiceId={query.service ?? null}
      initialStatus={status}
      initialSearch={query.search ?? ""}
    />
  )
}
