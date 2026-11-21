import type { Metadata } from "next"
import Link from "next/link"
import { CalendarDays, Info, Mail, ShieldCheck, UserRound } from "lucide-react"

import { ProfileSummary } from "@/components/customer/dashboard/profile-summary"
import { requireServerRole } from "@/lib/auth-server"

export const metadata: Metadata = {
  title: "Profile Settings",
  description: "Your WedPlan account details and role.",
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

export default async function CustomerProfileSettingsPage() {
  const session = await requireServerRole("customer", "/dashboard/customer/settings")
  const { user } = session

  return (
    <div className="space-y-6">
      <header className="rounded-[1.5rem] border border-wine-100 bg-white p-6 shadow-[0_26px_70px_-60px_rgba(112,19,47,0.7)]">
        <p className="text-[0.62rem] font-bold uppercase tracking-[0.24em] text-wine-500">
          Account
        </p>
        <h1 className="mt-1.5 font-heading text-3xl font-semibold text-wine-900">
          Profile Settings
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Your verified WedPlan identity. Your role is assigned by the server and can never be
          changed from the browser.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <ProfileSummary
          name={user.name}
          email={user.email}
          image={user.image}
          role={user.role}
        />

        <section
          aria-labelledby="account-details-title"
          className="rounded-[1.5rem] border border-wine-100 bg-white p-5 shadow-[0_26px_70px_-60px_rgba(112,19,47,0.7)] sm:p-6"
        >
          <h2
            id="account-details-title"
            className="flex items-center gap-2 font-heading text-xl font-semibold text-wine-900"
          >
            <ShieldCheck aria-hidden="true" className="size-5 text-wine-600" />
            Account details
          </h2>

          <dl className="mt-4 divide-y divide-wine-100">
            <div className="flex items-start justify-between gap-4 py-3">
              <dt className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                <UserRound aria-hidden="true" className="size-4 text-wine-500" />
                Full name
              </dt>
              <dd className="max-w-[60%] break-words text-right text-sm text-foreground">
                {user.name}
              </dd>
            </div>

            <div className="flex items-start justify-between gap-4 py-3">
              <dt className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                <Mail aria-hidden="true" className="size-4 text-wine-500" />
                Email
              </dt>
              <dd className="max-w-[60%] break-words text-right text-sm text-foreground">
                {user.email}
              </dd>
            </div>

            <div className="flex items-start justify-between gap-4 py-3">
              <dt className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                <ShieldCheck aria-hidden="true" className="size-4 text-wine-500" />
                Role
              </dt>
              <dd className="text-right text-sm capitalize text-foreground">{user.role}</dd>
            </div>

            <div className="flex items-start justify-between gap-4 py-3">
              <dt className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                <CalendarDays aria-hidden="true" className="size-4 text-wine-500" />
                Member since
              </dt>
              <dd className="text-right text-sm text-foreground">
                {formatMemberSince(user.createdAt)}
              </dd>
            </div>
          </dl>

          <div className="mt-5 rounded-2xl border border-gold-300/60 bg-cream-50 px-4 py-3.5">
            <p className="flex items-start gap-2 text-xs leading-relaxed text-foreground/75">
              <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-wine-600" />
              <span>
                <span className="font-semibold text-wine-900">Editing is not available yet.</span>{" "}
                The current API does not expose a profile update endpoint, so your name, email and
                photo stay exactly as provided by sign-up or Google. This page is read-only rather
                than pretending an update was saved.
              </span>
            </p>
          </div>

          <Link
            href="/profile"
            className="mt-4 inline-flex h-9 items-center rounded-full border border-wine-200 bg-white px-4 text-xs font-semibold text-wine-800 transition-colors hover:bg-wine-50"
          >
            Open public profile page
          </Link>
        </section>
      </div>
    </div>
  )
}
