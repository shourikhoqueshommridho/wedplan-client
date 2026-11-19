import type { Metadata } from "next"
import Link from "next/link"
import {
  CalendarDays,
  Globe2,
  LayoutDashboard,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react"

import { AccountShell } from "@/components/account/account-shell"
import { RoleBadge } from "@/components/account/role-badge"
import { buttonVariants } from "@/components/ui/button"
import { parseVendorProfileResponse } from "@/lib/account-data"
import { fetchWithSession, requireServerSession } from "@/lib/auth-server"
import { dashboardPathForRole } from "@/lib/safe-redirect"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Your Profile",
  description: "Your WedPlan account details and role.",
  robots: { index: false, follow: false },
}

export const instant = false

function formatDate(value: string | null): string {
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

export default async function ProfilePage() {
  const session = await requireServerSession("/profile")
  const { user } = session
  const dashboardHref = dashboardPathForRole(user.role)
  const initial = user.name.trim().charAt(0).toUpperCase()

  const vendorProfileResponse =
    user.role === "vendor" ? await fetchWithSession("/api/vendor/profile") : null
  const vendorProfile = vendorProfileResponse?.ok
    ? parseVendorProfileResponse(await vendorProfileResponse.json())
    : null

  return (
    <AccountShell
      eyebrow="Your account"
      title="Profile"
      description="Your verified WedPlan identity. Your role is assigned by the server and cannot be changed from the browser."
      badge={<RoleBadge role={user.role} />}
      actions={
        <Link
          href={dashboardHref}
          className={cn(
            buttonVariants({ variant: "default" }),
            "h-10 rounded-full bg-wine-800 px-5 text-cream-50 hover:bg-wine-900",
          )}
        >
          <LayoutDashboard aria-hidden="true" className="size-4" />
          Go to dashboard
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
        <section className="rounded-[1.75rem] border border-wine-100 bg-white p-6 text-center shadow-[0_24px_60px_-55px_rgba(79,14,37,0.5)]">
          <span
            aria-hidden="true"
            className="mx-auto grid size-24 place-items-center rounded-full border-4 border-cream-100 bg-wine-100 bg-cover bg-center font-heading text-3xl font-semibold text-wine-800"
            style={user.image ? { backgroundImage: `url("${user.image.replace(/"/g, "%22")}")` } : undefined}
          >
            {user.image ? null : initial || <UserRound className="size-8" />}
          </span>

          <h2 className="mt-4 font-heading text-2xl font-semibold text-wine-900">{user.name}</h2>
          <p className="mt-1 truncate text-sm text-muted-foreground">{user.email}</p>
          <div className="mt-3 flex justify-center">
            <RoleBadge role={user.role} />
          </div>

          <div className="mt-6 rounded-2xl border border-gold-300/60 bg-cream-50 px-4 py-3 text-left text-[0.7rem] leading-relaxed text-foreground/75">
            <p className="flex items-start gap-2">
              <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-wine-600" />
              <span>
                This session is verified with Better Auth using an httpOnly cookie. Signing out
                revokes it on this device.
              </span>
            </p>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-wine-100 bg-white p-6 shadow-[0_24px_60px_-55px_rgba(79,14,37,0.5)] sm:p-7">
          <h2 className="font-heading text-xl font-semibold text-wine-900">Account details</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Information stored with your Better Auth account.
          </p>

          <dl className="mt-5 divide-y divide-wine-100">
            <div className="flex items-start justify-between gap-4 py-3.5">
              <dt className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                <UserRound aria-hidden="true" className="size-4 text-wine-500" />
                Full name
              </dt>
              <dd className="max-w-[60%] break-words text-right text-sm text-foreground">
                {user.name}
              </dd>
            </div>

            <div className="flex items-start justify-between gap-4 py-3.5">
              <dt className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                <Mail aria-hidden="true" className="size-4 text-wine-500" />
                Email
              </dt>
              <dd className="max-w-[60%] break-words text-right text-sm text-foreground">
                {user.email}
              </dd>
            </div>

            <div className="flex items-start justify-between gap-4 py-3.5">
              <dt className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                <ShieldCheck aria-hidden="true" className="size-4 text-wine-500" />
                Role
              </dt>
              <dd className="text-right text-sm capitalize text-foreground">{user.role}</dd>
            </div>

            <div className="flex items-start justify-between gap-4 py-3.5">
              <dt className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                <CalendarDays aria-hidden="true" className="size-4 text-wine-500" />
                Member since
              </dt>
              <dd className="text-right text-sm text-foreground">{formatDate(user.createdAt)}</dd>
            </div>
          </dl>

          <div className="mt-6 rounded-2xl bg-wine-50/70 px-4 py-3.5 text-xs leading-relaxed text-foreground/75">
            <p className="font-semibold text-wine-900">Role changes</p>
            <p className="mt-1">
              Customer accounts are created through public sign-up. Vendor access requires
              onboarding, and Admin access is assigned only through a trusted server-side process.
            </p>
          </div>
        </section>
      </div>

      {user.role === "vendor" ? (
        <section className="mt-6 rounded-[1.75rem] border border-wine-100 bg-white p-6 shadow-[0_24px_60px_-55px_rgba(79,14,37,0.5)] sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-wine-50 text-wine-700">
                <Store aria-hidden="true" className="size-5" />
              </span>
              <div>
                <h2 className="font-heading text-xl font-semibold text-wine-900">
                  Vendor business details
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  These details appear on your public vendor profile.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/vendor"
              className="inline-flex h-10 items-center gap-2 self-start rounded-full border border-wine-200 px-4 text-sm font-semibold text-wine-800 transition-colors hover:bg-wine-50"
            >
              <LayoutDashboard aria-hidden="true" className="size-4" />
              Manage in dashboard
            </Link>
          </div>

          {vendorProfile ? (
            <dl className="mt-5 grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Business name
                </dt>
                <dd className="mt-0.5 flex items-center gap-2 font-semibold text-wine-900">
                  <Store aria-hidden="true" className="size-4 text-wine-500" />
                  {vendorProfile.businessName}
                </dd>
              </div>
              <div>
                <dt className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Category
                </dt>
                <dd className="mt-0.5 text-foreground/80">{vendorProfile.category}</dd>
              </div>
              <div>
                <dt className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Phone
                </dt>
                <dd className="mt-0.5 flex items-center gap-2 text-foreground/80">
                  <Phone aria-hidden="true" className="size-4 text-wine-500" />
                  {vendorProfile.phone}
                </dd>
              </div>
              <div>
                <dt className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Location
                </dt>
                <dd className="mt-0.5 flex items-center gap-2 text-foreground/80">
                  <MapPin aria-hidden="true" className="size-4 text-wine-500" />
                  {vendorProfile.location}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Contact email
                </dt>
                <dd className="mt-0.5 flex items-center gap-2 break-all text-foreground/80">
                  <Mail aria-hidden="true" className="size-4 text-wine-500" />
                  {vendorProfile.contactEmail}
                </dd>
              </div>
              {vendorProfile.website ? (
                <div className="sm:col-span-2">
                  <dt className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Website
                  </dt>
                  <dd className="mt-0.5 flex items-center gap-2 break-all text-foreground/80">
                    <Globe2 aria-hidden="true" className="size-4 text-wine-500" />
                    <a
                      href={vendorProfile.website}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="font-semibold text-wine-700 underline decoration-wine-300 underline-offset-4"
                    >
                      {vendorProfile.website}
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : (
            <div className="mt-5 rounded-2xl border border-gold-300/60 bg-cream-50 px-4 py-3.5 text-xs leading-relaxed text-foreground/75">
              No business profile was found for this vendor account. Add your details from the
              vendor dashboard to complete onboarding.
            </div>
          )}
        </section>
      ) : null}
    </AccountShell>
  )
}
