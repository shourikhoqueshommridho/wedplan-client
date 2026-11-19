import type { Metadata } from "next"
import Link from "next/link"

import { AuthShell } from "@/components/auth/auth-shell"
import { SignInForm } from "@/components/auth/sign-in-form"
import { redirectIfAuthenticated } from "@/lib/auth-server"

export const metadata: Metadata = {
  title: "Vendor Sign In",
  description: "Sign in to your WedPlan vendor account to manage listings and booking requests.",
  robots: { index: false, follow: false },
}

export const instant = false

interface VendorSignInPageProps {
  searchParams: Promise<{ error?: string | string[] }>
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export default async function VendorSignInPage({ searchParams }: VendorSignInPageProps) {
  const query = await searchParams
  const error = firstValue(query.error)

  await redirectIfAuthenticated("/dashboard")

  return (
    <AuthShell
      eyebrow="Vendor access"
      title="Vendor Sign In"
      subtitle="Sign in to manage your business profile, service listings and incoming booking requests."
      footer={
        <p>
          New to WedPlan as a vendor?{" "}
          <Link
            href="/vendor/sign-up"
            className="font-semibold text-wine-800 underline decoration-wine-300 underline-offset-4 transition-colors hover:text-wine-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
          >
            Create a vendor account
          </Link>
        </p>
      }
    >
      <SignInForm next="/dashboard" oauthError={error === "google" ? "google" : undefined} />

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Customer account?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-wine-800 underline decoration-wine-300 underline-offset-4 transition-colors hover:text-wine-900"
        >
          Use customer sign in
        </Link>
      </p>
    </AuthShell>
  )
}
