import type { Metadata } from "next"
import Link from "next/link"
import { LayoutDashboard, Search } from "lucide-react"

import { AccountShell } from "@/components/account/account-shell"
import { RoleBadge } from "@/components/account/role-badge"
import { AdminWorkspace } from "@/components/admin/admin-workspace"
import { buttonVariants } from "@/components/ui/button"
import {
  parseAdminService,
  parseAdminUser,
  parseBooking,
  parseList,
  parseVendorProfile,
} from "@/lib/account-data"
import { fetchWithSession, requireServerRole } from "@/lib/auth-server"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
}

export const instant = false

export default async function AdminDashboardPage() {
  await requireServerRole("admin", "/dashboard/admin")

  const [usersResponse, vendorsResponse, servicesResponse, bookingsResponse] = await Promise.all([
    fetchWithSession("/api/account/admin/users"),
    fetchWithSession("/api/admin/vendors"),
    fetchWithSession("/api/admin/services"),
    fetchWithSession("/api/admin/bookings"),
  ])

  const users = usersResponse?.ok
    ? parseList(await usersResponse.json(), "users", parseAdminUser)
    : []
  const vendors = vendorsResponse?.ok
    ? parseList(await vendorsResponse.json(), "vendors", parseVendorProfile)
    : []
  const services = servicesResponse?.ok
    ? parseList(await servicesResponse.json(), "services", parseAdminService)
    : []
  const bookings = bookingsResponse?.ok
    ? parseList(await bookingsResponse.json(), "bookings", parseBooking)
    : []

  const dataError =
    !usersResponse?.ok ||
    !vendorsResponse?.ok ||
    !servicesResponse?.ok ||
    !bookingsResponse?.ok

  return (
    <AccountShell
      eyebrow="Admin dashboard"
      title="Platform administration"
      description="Review accounts, vendor businesses, service listings and booking activity across WedPlan."
      badge={<RoleBadge role="admin" />}
      actions={
        <>
          <Link
            href="/services"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-10 rounded-full border-wine-200 bg-white px-5 text-wine-800 hover:bg-wine-50",
            )}
          >
            <Search aria-hidden="true" className="size-4" />
            Public site
          </Link>
          <Link
            href="/profile"
            className={cn(
              buttonVariants({ variant: "default" }),
              "h-10 rounded-full bg-wine-800 px-5 text-cream-50 hover:bg-wine-900",
            )}
          >
            <LayoutDashboard aria-hidden="true" className="size-4" />
            Profile
          </Link>
        </>
      }
    >
      <AdminWorkspace
        users={users}
        vendors={vendors}
        initialServices={services}
        initialBookings={bookings}
        dataError={dataError}
      />
    </AccountShell>
  )
}
