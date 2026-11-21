"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  Bell,
  CalendarDays,
  ChevronDown,
  Loader2,
  LogOut,
  Menu,
  Search,
  Settings,
  UserRound,
} from "lucide-react"

import { initialsFromName } from "@/lib/customer-dashboard"
import { useSignOut } from "@/lib/use-sign-out"
import { cn } from "@/lib/utils"
import type { DashboardUser } from "@/components/customer/dashboard/sidebar"

interface TopbarProps {
  user: DashboardUser
  onToggleSidebar: () => void
  onNavigate?: () => void
}

export function Topbar({ user, onToggleSidebar, onNavigate }: TopbarProps) {
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

  return (
    <header className="sticky top-0 z-30 border-b border-wine-100 bg-blush-50/90 backdrop-blur-md supports-[backdrop-filter]:bg-blush-50/75">
      <div className="flex h-[72px] items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle dashboard navigation"
          className="grid size-10 shrink-0 place-items-center rounded-full border border-wine-100 bg-white text-wine-800 transition-colors hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>

        <form
          action="/services"
          method="get"
          role="search"
          className="relative mx-auto hidden w-full max-w-2xl flex-1 md:block"
        >
          <label htmlFor="dashboard-search" className="sr-only">
            Search services and vendors
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-wine-400"
          />
          <input
            id="dashboard-search"
            name="search"
            type="search"
            placeholder="Search services, vendors..."
            className="h-11 w-full rounded-full border border-wine-100 bg-white pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-wine-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
          />
        </form>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/services"
            aria-label="Search services"
            className="grid size-10 place-items-center rounded-full border border-wine-100 bg-white text-wine-700 transition-colors hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200 md:hidden"
          >
            <Search aria-hidden="true" className="size-[1.1rem]" />
          </Link>

          <span
            role="img"
            aria-label="Notifications are not available yet"
            title="Notifications aren't available yet"
            className="hidden size-10 place-items-center rounded-full border border-wine-100 bg-white text-wine-700 sm:grid"
          >
            <Bell aria-hidden="true" className="size-[1.1rem]" />
          </span>

          <span aria-hidden="true" className="mx-1 hidden h-8 w-px bg-wine-100 sm:block" />

          <div ref={accountMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsAccountOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={isAccountOpen}
              aria-controls="customer-account-menu"
              className="flex items-center gap-2 rounded-full border border-wine-100 bg-white p-1 pr-2 transition-colors hover:border-wine-200 hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
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
              <span className="hidden max-w-28 truncate text-sm font-semibold text-wine-900 sm:block">
                {user.name}
              </span>
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  "size-3.5 text-wine-500 transition-transform duration-200",
                  isAccountOpen && "rotate-180",
                )}
              />
            </button>

            {isAccountOpen ? (
              <div
                id="customer-account-menu"
                role="menu"
                aria-label="Account"
                className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-wine-100 bg-white p-2 shadow-[0_28px_70px_-30px_rgba(80,16,38,0.5)]"
              >
                <div className="border-b border-wine-100 px-3 pb-2.5 pt-2">
                  <p className="truncate text-sm font-semibold text-wine-900">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>

                <div className="pt-1.5">
                  <Link
                    href="/dashboard/customer/settings"
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
                    href="/dashboard/customer/bookings"
                    role="menuitem"
                    onClick={() => {
                      setIsAccountOpen(false)
                      onNavigate?.()
                    }}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-wine-50 hover:text-wine-800 focus-visible:bg-wine-50 focus-visible:text-wine-800 focus-visible:outline-none"
                  >
                    <CalendarDays aria-hidden="true" className="size-4 text-wine-500" />
                    My Bookings
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
