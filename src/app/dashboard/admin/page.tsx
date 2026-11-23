import type { Metadata } from "next"
import { connection } from "next/server"

import { AdminBanner } from "@/components/admin/admin-banner"
import { AdminOverviewPanels } from "@/components/admin/admin-overview-panels"
import { AdminStatCards } from "@/components/admin/admin-stat-cards"
import { buildAdminStats } from "@/lib/admin-dashboard"
import {
  loadAdminBookings,
  loadAdminOverview,
  loadAdminServices,
  loadAdminTransactions,
  loadAdminUsers,
  loadAdminVendors,
} from "@/lib/admin-server"
import { requireServerRole } from "@/lib/auth-server"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
}

export const instant = false

export default async function AdminDashboardPage() {
  // The analytics chart uses the current date. Opt into request-time rendering
  // so PPR does not try to prerender an unstable `new Date()` value.
  await connection()
  await requireServerRole("admin", "/dashboard/admin")

  const [usersResult, vendorsResult, servicesResult, bookingsResult, overviewResult, transactionsResult] =
    await Promise.all([
      loadAdminUsers(),
      loadAdminVendors(),
      loadAdminServices(),
      loadAdminBookings(),
      loadAdminOverview(),
      loadAdminTransactions(),
    ])

  const dataError =
    !usersResult.ok ||
    !vendorsResult.ok ||
    !servicesResult.ok ||
    !bookingsResult.ok ||
    !overviewResult.ok ||
    !transactionsResult.ok

  const stats = buildAdminStats(
    usersResult.items,
    servicesResult.items,
    bookingsResult.items,
    overviewResult.data,
  )

  return (
    <div className="space-y-5">
      {dataError ? (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm text-destructive"
        >
          <p className="font-semibold">Some admin data could not be loaded.</p>
          <p className="mt-1 text-xs leading-relaxed">
            One or more protected APIs rejected the request. Refresh the page or sign in again.
          </p>
        </div>
      ) : null}

      <AdminBanner />
      <AdminStatCards stats={stats} />

      <AdminOverviewPanels
        users={usersResult.items}
        services={servicesResult.items}
        bookings={bookingsResult.items}
        transactions={transactionsResult.items}
        now={new Date().toISOString()}
        dataError={dataError}
      />
    </div>
  )
}
