import type { Metadata } from "next"
import Link from "next/link"

import { AuthShell } from "@/components/auth/auth-shell"
import { SignInForm } from "@/components/auth/sign-in-form"
import { redirectIfAuthenticated } from "@/lib/auth-server"
import { sanitizeNextPath } from "@/lib/safe-redirect"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your WedPlan account to manage bookings and save your favourite vendors.",
}

export const instant = false

interface SignInPageProps {
  searchParams: Promise<{
    next?: string | string[]
    error?: string | string[]
  }>
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const query = await searchParams
  const next = sanitizeNextPath(firstValue(query.next))
  const error = firstValue(query.error)

  await redirectIfAuthenticated(next)

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Welcome Back!"
      subtitle="Sign in to continue planning your perfect day, save your favourite vendors and manage your bookings."
      footer={
        <p>
          New to WedPlan?{" "}
          <Link
            href={`/sign-up?next=${encodeURIComponent(next)}`}
            className="font-semibold text-wine-800 underline decoration-wine-300 underline-offset-4 transition-colors hover:text-wine-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
          >
            Create an account
          </Link>
        </p>
      }
    >
      <SignInForm next={next} oauthError={error === "google" ? "google" : undefined} />
    </AuthShell>
  )
}
