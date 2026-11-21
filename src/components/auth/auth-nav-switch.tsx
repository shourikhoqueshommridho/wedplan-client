"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

/**
 * Route-aware Sign In / Sign Up toggle for the auth shell header.
 * Extracted into a client component so AuthShell stays a Server Component.
 */
export function AuthNavSwitch() {
  const pathname = usePathname()
  const isSignInPage = pathname === "/sign-in"
  const isSignUpPage = pathname === "/sign-up"

  if (isSignInPage) {
    return (
      <Link
        href="/sign-up"
        className="hidden rounded-full border border-wine-100 px-3.5 py-2 text-sm font-semibold text-wine-800 transition-colors hover:border-wine-200 hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200 sm:inline-flex"
      >
        Sign Up
      </Link>
    )
  }

  if (isSignUpPage) {
    return (
      <Link
        href="/sign-in"
        className="hidden rounded-full border border-wine-100 px-3.5 py-2 text-sm font-semibold text-wine-800 transition-colors hover:border-wine-200 hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200 sm:inline-flex"
      >
        Sign In
      </Link>
    )
  }

  return (
    <Link
      href="/sign-in"
      className="hidden rounded-full border border-wine-100 px-3.5 py-2 text-sm font-semibold text-wine-800 transition-colors hover:border-wine-200 hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200 sm:inline-flex"
    >
      Sign In
    </Link>
  )
}