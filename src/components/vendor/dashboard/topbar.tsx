"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  Bell,
  CalendarDays,
  CreditCard,
  Loader2,
  LogOut,
  Menu,
  Search,
  Settings,
  UserRound,
} from "lucide-react"

import { initialsFromName } from "@/lib/customer-dashboard"
import { useSignOut } from "@/lib/use-sign-out"
import type { VendorDashboardUser } from "@/components/vendor/dashboard/sidebar"

interface VendorTopbarProps {
  user: VendorDashboardUser
  pendingBookings: number
  onToggleSidebar: () => void
  onNavigate?: () => void
}

export function VendorTopbar({
  user,
  pendingBookings,
  onToggleSidebar,
  onNavigate,
}: VendorTopbarProps) {
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement>(null)
  const { isSigningOut, signOut } = useSignOut()
  const initials = initialsFromName(user.name)

  useEffect(() => {
    if (!isAccountOpen) return

    function handlePointerDown(event: PointerEvent) {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setIsAccountOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsAccountOpen(false)
    }

    document.addEventListener("pointerdown", handlePointerDown)
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isAccountOpen])

  const notificationLabel =
    pendingBookings === 0
      ? "No pending booking requests"
      : `${pendingBookings} pending booking ${pendingBookings === 1 ? "request" : "requests"}`

  return (
    <header className="sticky top-0 z-30 border-b border-wine-100 bg-blush-50/90 backdrop-blur-md supports-[backdrop-filter]:bg-blush-50/75">
      <div className="flex h-[72px] items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-7">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle vendor dashboard navigation"
          className="grid size-10 shrink-0 place-items-center rounded-full border border-wine-100 bg-white text-wine-800 transition-colors hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>

        <form
          action="/dashboard/vendor/services"
          method="get"
          role="search"
          className="relative mx-auto hidden w-full max-w-md flex-1 md:block"
        >
          <label htmlFor="vendor-dashboard-search" className="sr-only">
            Search services and bookings
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-wine-400"
          />
          <input
            id="vendor-dashboard-search"
            name="search"
            type="search"
            placeholder="Search services, bookings..."
            className="h-11 w-full rounded-full border border-wine-100 bg-white pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-wine-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
          />
        </form>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/dashboard/vendor/services"
            aria-label="Search your services"
            className="grid size-10 place-items-center rounded-full border border-wine-100 bg-white text-wine-700 transition-colors hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200 md:hidden"
          >
            <Search aria-hidden="true" className="size-[1.1rem]" />
          </Link>

          <Link
            href="/dashboard/vendor/bookings"
            aria-label={notificationLabel}
            title={notificationLabel}
            className="relative grid size-10 place-items-center rounded-full border border-wine-100 bg-white text-wine-700 transition-colors hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
          >
            <Bell aria-hidden="true" className="size-[1.1rem]" />
            {pendingBookings > 0 ? (
              <span
                aria-hidden="true"
                className="absolute -right-1 -top-1 grid min-w-[1.1rem] place-items-center rounded-full bg-[#e8455f] px-1 py-0.5 text-[0.58rem] font-bold leading-none text-white ring-2 ring-blush-50"
              >
                {pendingBookings > 9 ? "9+" : pendingBookings}
              </span>
            ) : null}
          </Link>

          <span aria-hidden="true" className="mx-1 hidden h-8 w-px bg-wine-100 sm:block" />

          <div ref={accountMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsAccountOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={isAccountOpen}
              aria-controls="vendor-account-menu"
              aria-label="Open account menu"
              className="flex size-10 items-center justify-center rounded-full border border-wine-100 bg-white p-0.5 transition-colors hover:border-wine-200 hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
            >
              <span
                aria-hidden="true"
                className="grid size-8 place-items-center rounded-full bg-wine-100 bg-cover bg-center text-[0.65rem] font-bold text-wine-800"
                style={
                  user.image
                    ? { backgroundImage: `url("${user.image.replace(/"/g, "%22")}")` }
                    : undefined
                }
              >
                {user.image ? null : initials}
              </span>
            </button>

            {isAccountOpen ? (
              <div
                id="vendor-account-menu"
                role="menu"
                aria-label="Vendor account"
                className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-wine-100 bg-white p-2 shadow-[0_28px_70px_-30px_rgba(80,16,38,0.5)]"
              >
                <div className="border-b border-wine-100 px-3 pb-2.5 pt-2">
                  <p className="truncate text-sm font-semibold text-wine-900">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>

                <div className="pt-1.5">
                  <Link
                    href="/dashboard/vendor/settings"
                    role="menuitem"
                    onClick={() => {
                      setIsAccountOpen(false)
                      onNavigate?.()
                    }}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-wine-50 hover:text-wine-800 focus-visible:bg-wine-50 focus-visible:text-wine-800 focus-visible:outline-none"
                  >
                    <Settings aria-hidden="true" className="size-4 text-wine-500" />
                    Profile Settings
                  </Link>
                  <Link
                    href="/dashboard/vendor/bookings"
                    role="menuitem"
                    onClick={() => {
                      setIsAccountOpen(false)
                      onNavigate?.()
                    }}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-wine-50 hover:text-wine-800 focus-visible:bg-wine-50 focus-visible:text-wine-800 focus-visible:outline-none"
                  >
                    <CalendarDays aria-hidden="true" className="size-4 text-wine-500" />
                    Booking Requests
                  </Link>
                  <Link
                    href="/dashboard/vendor/subscription"
                    role="menuitem"
                    onClick={() => {
                      setIsAccountOpen(false)
                      onNavigate?.()
                    }}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-wine-50 hover:text-wine-800 focus-visible:bg-wine-50 focus-visible:text-wine-800 focus-visible:outline-none"
                  >
                    <CreditCard aria-hidden="true" className="size-4 text-wine-500" />
                    Subscription
                  </Link>
                  <Link
                    href="/profile"
                    role="menuitem"
                    onClick={() => {
                      setIsAccountOpen(false)
                      onNavigate?.()
                    }}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-wine-50 hover:text-wine-800 focus-visible:bg-wine-50 focus-visible:text-wine-800 focus-visible:outline-none"
                  >
                    <UserRound aria-hidden="true" className="size-4 text-wine-500" />
                    Public profile page
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsAccountOpen(false)
                      void signOut(onNavigate)
                    }}
                    disabled={isSigningOut}
                    className="mt-0.5 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/5 focus-visible:bg-destructive/5 focus-visible:outline-none disabled:opacity-60"
                  >
                    {isSigningOut ? (
                      <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                    ) : (
                      <LogOut aria-hidden="true" className="size-4" />
                    )}
                    {isSigningOut ? "Signing out…" : "Logout"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
