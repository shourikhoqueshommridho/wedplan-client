import type { Metadata } from "next"
import Link from "next/link"

import { AuthShell } from "@/components/auth/auth-shell"
import { SignUpForm } from "@/components/auth/sign-up-form"
import { redirectIfAuthenticated } from "@/lib/auth-server"
import { sanitizeNextPath } from "@/lib/safe-redirect"

export const metadata: Metadata = {
  title: "Create an Account",
  description:
    "Create your free WedPlan account to discover trusted wedding venues, photographers, florists and more.",
}

export const instant = false

interface SignUpPageProps {
  searchParams: Promise<{
    next?: string | string[]
    error?: string | string[]
  }>
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const query = await searchParams
  const next = sanitizeNextPath(firstValue(query.next))
  const error = firstValue(query.error)

  await redirectIfAuthenticated(next)

  return (
    <AuthShell
      eyebrow="Begin your journey"
      title="Create Your Account"
      subtitle="Join WedPlan to discover trusted wedding professionals and bring your celebration to life."
      footer={
        <p>
          Already have an account?{" "}
          <Link
            href={`/sign-in?next=${encodeURIComponent(next)}`}
            className="font-semibold text-wine-800 underline decoration-wine-300 underline-offset-4 transition-colors hover:text-wine-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <SignUpForm next={next} oauthError={error === "google" ? "google" : undefined} />
    </AuthShell>
  )
}
