import type { Metadata } from "next"
import Link from "next/link"
import { AlertTriangle, ArrowRight, CheckCircle2, LayoutDashboard, Store } from "lucide-react"

import { AccountShell } from "@/components/account/account-shell"
import { RoleBadge } from "@/components/account/role-badge"
import { buttonVariants } from "@/components/ui/button"
import { parseVendorProfileResponse } from "@/lib/account-data"
import { fetchWithSession, requireServerSession } from "@/lib/auth-server"
import { dashboardPathForRole } from "@/lib/safe-redirect"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Vendor Welcome",
  robots: { index: false, follow: false },
}

export const instant = false

export default async function VendorWelcomePage() {
  const session = await requireServerSession("/vendor/welcome")
  const isVendor = session.user.role === "vendor"

  const profileResponse = isVendor ? await fetchWithSession("/api/vendor/profile") : null
  const profile = profileResponse?.ok
    ? parseVendorProfileResponse(await profileResponse.json())
    : null

  return (
    <AccountShell
      eyebrow="Vendor onboarding"
      title={isVendor ? "Your vendor account is ready" : "This account is not a vendor"}
      description={
        isVendor
          ? "You are signed in with the Vendor role. Complete your business profile and submit your first service for review."
          : "Google sign-up completed, but this email already belongs to an existing account. Existing accounts are never converted into vendor accounts automatically."
      }
      badge={<RoleBadge role={session.user.role} />}
      actions={
        <Link
          href={dashboardPathForRole(session.user.role)}
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
      {isVendor ? (
        <div className="grid gap-5 lg:grid-cols-[1.4fr_0.9fr]">
          <section className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50/60 p-6 sm:p-7">
            <span className="grid size-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 aria-hidden="true" className="size-6" />
            </span>
            <h2 className="mt-4 font-heading text-2xl font-semibold text-wine-900">
              Welcome to WedPlan, {session.user.name.split(/\s+/)[0] || "vendor"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground/75">
              Your Vendor role was assigned securely on the server and your account is ready to use.
              {profile
                ? ` We saved the business profile for ${profile.businessName}.`
                : " Add your business details from the vendor dashboard to finish onboarding."}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/dashboard/vendor"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "h-10 rounded-full bg-wine-800 px-5 text-cream-50 hover:bg-wine-900",
                )}
              >
                <Store aria-hidden="true" className="size-4" />
                Open vendor workspace
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                href="/profile"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-10 rounded-full border-wine-200 bg-white px-5 text-wine-800 hover:bg-wine-50",
                )}
              >
                View account profile
              </Link>
            </div>

            <div className="mt-6 rounded-2xl border border-wine-100 bg-white px-4 py-3.5 text-xs leading-relaxed text-foreground/75">
              <p className="font-semibold text-wine-900">What happens next?</p>
              <ol className="mt-2 list-decimal space-y-1 pl-4">
                <li>Review or complete your business profile.</li>
                <li>Submit each service listing for admin approval.</li>
                <li>Respond to customer booking requests from your dashboard.</li>
              </ol>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-wine-100 bg-white p-6">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-wine-500">
              Vendor account
            </p>
            <p className="mt-2 font-heading text-xl font-semibold text-wine-900">
              {profile?.businessName ?? session.user.name}
            </p>
            <p className="mt-1 break-all text-sm text-muted-foreground">{session.user.email}</p>
            <div className="mt-4 rounded-2xl bg-wine-50/70 px-4 py-3 text-xs leading-relaxed text-foreground/75">
              <p className="font-semibold text-wine-900">Role safety</p>
              <p className="mt-1">
                Roles are read from the verified server session. The browser can never choose or
                change its own role.
              </p>
            </div>
          </section>
        </div>
      ) : (
        <div className="space-y-5">
          <section className="rounded-[1.75rem] border border-gold-300/70 bg-cream-50 p-6 sm:p-7">
            <span className="grid size-12 place-items-center rounded-2xl bg-gold-300/30 text-wine-800">
              <AlertTriangle aria-hidden="true" className="size-6" />
            </span>
            <h2 className="mt-4 font-heading text-2xl font-semibold text-wine-900">
              You already have a {session.user.role} account
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-foreground/75">
              Google sign-in found an existing account for{" "}
              <span className="font-semibold text-wine-900">{session.user.email}</span>. To protect
              your data, WedPlan did not change its role or create a duplicate vendor profile.
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-foreground/75">
              You can keep using your current account, or sign out and create a vendor account with
              a different email address.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href={dashboardPathForRole(session.user.role)}
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "h-10 rounded-full bg-wine-800 px-5 text-cream-50 hover:bg-wine-900",
                )}
              >
                Continue to my dashboard
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                href="/vendor/sign-up"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-10 rounded-full border-wine-200 bg-white px-5 text-wine-800 hover:bg-wine-50",
                )}
              >
                Create a vendor account
              </Link>
            </div>
          </section>

          <div className="rounded-2xl border border-wine-100 bg-white px-5 py-4 text-xs leading-relaxed text-muted-foreground">
            New vendor accounts are created through the vendor sign-up form. Existing accounts keep
            their current role unless a trusted server-side process changes it.
          </div>
        </div>
      )}
    </AccountShell>
  )
}
