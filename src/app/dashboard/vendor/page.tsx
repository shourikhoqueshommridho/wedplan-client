import type { Metadata } from "next"
import Link from "next/link"
import { UserRound } from "lucide-react"

import { AccountShell } from "@/components/account/account-shell"
import { RoleBadge } from "@/components/account/role-badge"
import { VendorWorkspace } from "@/components/vendor/vendor-workspace"
import { buttonVariants } from "@/components/ui/button"
import {
  parseBooking,
  parseList,
  parseVendorProfileResponse,
  parseVendorService,
} from "@/lib/account-data"
import { fetchWithSession, requireServerRole } from "@/lib/auth-server"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Vendor Dashboard",
  robots: { index: false, follow: false },
}

export const instant = false

export default async function VendorDashboardPage() {
  const session = await requireServerRole("vendor", "/dashboard/vendor")

  const [profileResponse, servicesResponse, bookingsResponse] = await Promise.all([
    fetchWithSession("/api/vendor/profile"),
    fetchWithSession("/api/vendor/services"),
    fetchWithSession("/api/bookings"),
  ])

  const profile =
    profileResponse?.ok ? parseVendorProfileResponse(await profileResponse.json()) : null
  const services =
    servicesResponse?.ok
      ? parseList(
          await servicesResponse.json(),
          "services",
          parseVendorService,
        )
      : []
  const bookings =
    bookingsResponse?.ok
      ? parseList(await bookingsResponse.json(), "bookings", parseBooking)
      : []

  const dataError = !profileResponse?.ok || !servicesResponse?.ok || !bookingsResponse?.ok

  return (
    <AccountShell
      eyebrow="Vendor dashboard"
      title="Vendor workspace"
      description="Manage your business profile, submit services for review and respond to customer booking requests."
      badge={<RoleBadge role="vendor" />}
      actions={
        <Link
          href="/profile"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-10 rounded-full border-wine-200 bg-white px-5 text-wine-800 hover:bg-wine-50",
          )}
        >
          <UserRound aria-hidden="true" className="size-4" />
          Account profile
        </Link>
      }
    >
      <VendorWorkspace
        vendorName={session.user.name}
        vendorEmail={session.user.email}
        initialProfile={profile}
        initialServices={services}
        initialBookings={bookings}
        dataError={dataError}
      />
    </AccountShell>
  )
}
