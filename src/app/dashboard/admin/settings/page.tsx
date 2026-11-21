import type { Metadata } from "next"
import { CalendarDays, Info, Mail, ShieldCheck, UserRound } from "lucide-react"

import { RoleBadge } from "@/components/account/role-badge"
import { ProfileSummary } from "@/components/customer/dashboard/profile-summary"
import { requireServerRole } from "@/lib/auth-server"

export const metadata: Metadata = {
  title: "Profile Settings - Admin Dashboard",
  robots: { index: false, follow: false },
}

export const instant = false

function formatMemberSince(value: string | null): string {
  if (!value) return "Not available"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Not available"
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

export default async function AdminSettingsPage() {
  const session = await requireServerRole("admin", "/dashboard/admin/settings")
  const { user } = session

  return (
    <div className="space-y-5">
      <section className="rounded-[1.25rem] border border-wine-100 bg-white p-6 shadow-[0_18px_45px_-42px_rgba(112,19,47,0.6)]">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-wine-500">Account</p>
        <h1 className="mt-1.5 font-heading text-3xl font-semibold text-wine-900">Profile Settings</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Your verified WedPlan identity. Your role is assigned by the server and cannot be changed
          from the browser.
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <ProfileSummary name={user.name} email={user.email} image={user.image} role={user.role} />

        <section className="rounded-[1.5rem] border border-wine-100 bg-white p-5 shadow-[0_18px_45px_-42px_rgba(112,19,47,0.6)] sm:p-6">
          <h2 className="flex items-center gap-2 font-heading text-xl font-semibold text-wine-900">
            <ShieldCheck aria-hidden="true" className="size-5 text-wine-600" />
            Account details
          </h2>

          <dl className="mt-4 divide-y divide-wine-100">
            <div className="flex items-start justify-between gap-4 py-3">
              <dt className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                <UserRound aria-hidden="true" className="size-4 text-wine-500" />
                Full name
              </dt>
              <dd className="max-w-[60%] break-words text-right text-sm text-foreground">{user.name}</dd>
            </div>
            <div className="flex items-start justify-between gap-4 py-3">
              <dt className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                <Mail aria-hidden="true" className="size-4 text-wine-500" />
                Email
              </dt>
              <dd className="max-w-[60%] break-words text-right text-sm text-foreground">{user.email}</dd>
            </div>
            <div className="flex items-start justify-between gap-4 py-3">
              <dt className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                <ShieldCheck aria-hidden="true" className="size-4 text-wine-500" />
                Role
              </dt>
              <dd><RoleBadge role={user.role} /></dd>
            </div>
            <div className="flex items-start justify-between gap-4 py-3">
              <dt className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                <CalendarDays aria-hidden="true" className="size-4 text-wine-500" />
                Member since
              </dt>
              <dd className="text-right text-sm text-foreground">{formatMemberSince(user.createdAt)}</dd>
            </div>
          </dl>

          <div className="mt-5 rounded-2xl border border-gold-300/60 bg-cream-50 px-4 py-3.5 text-xs leading-relaxed text-foreground/75">
            <p className="flex items-start gap-2">
              <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-wine-600" />
              <span>
                Administrator privileges are assigned server-side. This page is read-only by
                design so role changes can never be requested from the browser.
              </span>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
