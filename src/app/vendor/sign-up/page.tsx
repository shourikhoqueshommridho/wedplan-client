import type { Metadata } from "next"
import Link from "next/link"

import { AuthShell } from "@/components/auth/auth-shell"
import { VendorSignUpForm } from "@/components/auth/vendor-sign-up-form"
import { redirectIfAuthenticated } from "@/lib/auth-server"
import { sanitizeNextPath } from "@/lib/safe-redirect"

export const metadata: Metadata = {
  title: "Vendor Sign Up",
  description:
    "Create a free WedPlan vendor account to showcase your wedding venue, photography, styling or catering business.",
}

export const instant = false

interface VendorSignUpPageProps {
  searchParams: Promise<{
    next?: string | string[]
    error?: string | string[]
  }>
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export default async function VendorSignUpPage({ searchParams }: VendorSignUpPageProps) {
  const query = await searchParams
  const next = sanitizeNextPath(firstValue(query.next) ?? "/dashboard")
  const error = firstValue(query.error)

  await redirectIfAuthenticated(next)

  return (
    <AuthShell
      eyebrow="Grow with WedPlan"
      title="Become a Vendor"
      subtitle="Create your free vendor account, tell couples about your business and publish services for review."
      footer={
        <p>
          Looking to plan a wedding instead?{" "}
          <Link
            href={`/sign-up?next=${encodeURIComponent(next)}`}
            className="font-semibold text-wine-800 underline decoration-wine-300 underline-offset-4 transition-colors hover:text-wine-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
          >
            Create a customer account
          </Link>
        </p>
      }
    >
      <VendorSignUpForm next={next} oauthError={error === "google" ? "google" : undefined} />
    </AuthShell>
  )
}
