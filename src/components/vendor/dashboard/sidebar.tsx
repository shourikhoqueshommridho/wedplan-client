"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CalendarDays,
  CreditCard,
  Gem,
  Heart,
  LayoutDashboard,
  Loader2,
  LogOut,
  PlusCircle,
  Settings,
  Sparkles,
  Store,
  type LucideIcon,
} from "lucide-react"

import { RoleBadge } from "@/components/account/role-badge"
import { Logo } from "@/components/brand/logo"
import { weddingImages } from "@/data/images"
import { initialsFromName } from "@/lib/customer-dashboard"
import { useSignOut } from "@/lib/use-sign-out"
import { cn } from "@/lib/utils"
import type { UserRole } from "@/types/auth"

export interface VendorDashboardUser {
  name: string
  email: string
  image: string | null
  role: UserRole
}

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  exact?: boolean
  badge?: "pending-bookings"
}

const navigation: readonly NavItem[] = [
  { href: "/dashboard/vendor", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/vendor/services", label: "My Services", icon: Store },
  { href: "/dashboard/vendor/add-service", label: "Add Service", icon: PlusCircle, exact: true },
  {
    href: "/dashboard/vendor/bookings",
    label: "Booking Requests",
    icon: CalendarDays,
    badge: "pending-bookings",
  },
  { href: "/dashboard/vendor/subscription", label: "Subscription", icon: CreditCard },
  { href: "/dashboard/vendor/settings", label: "Profile Settings", icon: Settings },
]

function isActivePath(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

interface SidebarPanelProps {
  user: VendorDashboardUser
  pendingBookings: number
  className?: string
  /** Called after a navigation link is clicked so the mobile drawer can close. */
  onNavigate?: () => void
}

export function SidebarPanel({
  user,
  pendingBookings,
  className,
  onNavigate,
}: SidebarPanelProps) {
  const pathname = usePathname()
  const { isSigningOut, signOut } = useSignOut()

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-y-auto bg-burgundy-700 text-blush-100",
        className,
      )}
    >
      <div className="px-5 pb-4 pt-6">
        <Logo tone="light" />
        <p className="mt-1.5 pl-[42px] text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-blush-100/60">
          Plan · Book · Celebrate
        </p>
      </div>

      <div className="flex flex-col items-center px-4 pb-5">
        <span
          aria-hidden="true"
          className="grid size-[72px] place-items-center rounded-full border-2 border-white/25 bg-wine-800 bg-cover bg-center font-heading text-lg font-semibold text-blush-100 shadow-[0_16px_40px_-18px_rgba(0,0,0,0.65)]"
          style={
            user.image
              ? { backgroundImage: `url("${user.image.replace(/"/g, "%22")}")` }
              : undefined
          }
        >
          {user.image ? null : initialsFromName(user.name)}
        </span>
        <p className="mt-2.5 max-w-full truncate font-heading text-base font-semibold text-white">
          {user.name}
        </p>
        <div className="mt-1.5">
          <RoleBadge role={user.role} tone="onDark" />
        </div>
      </div>

      <div className="mx-5 border-t border-white/10" />

      <nav aria-label="Vendor dashboard" className="flex flex-col gap-0.5 px-3 py-3.5">
        {navigation.map((item) => {
          const active = isActivePath(pathname, item)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[0.82rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
                active
                  ? "bg-gradient-to-r from-wine-500 to-burgundy-600 text-white shadow-[0_14px_30px_-16px_rgba(0,0,0,0.7)]"
                  : "text-blush-100/75 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon aria-hidden="true" className="size-[1.05rem] shrink-0" />
              <span className="min-w-0 truncate">{item.label}</span>
              {item.badge === "pending-bookings" && pendingBookings > 0 ? (
                <span
                  aria-label={`${pendingBookings} pending booking ${
                    pendingBookings === 1 ? "request" : "requests"
                  }`}
                  className="ml-auto grid min-w-5 shrink-0 place-items-center rounded-full bg-[#e8455f] px-1.5 py-0.5 text-[0.62rem] font-bold leading-none text-white shadow-[0_4px_12px_-4px_rgba(0,0,0,0.6)]"
                >
                  {pendingBookings > 99 ? "99+" : pendingBookings}
                </span>
              ) : null}
            </Link>
          )
        })}
      </nav>

      <div className="mx-5 border-t border-white/10" />

      <div className="px-3 py-3.5">
        <button
          type="button"
          onClick={() => void signOut(onNavigate)}
          disabled={isSigningOut}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[0.82rem] font-semibold text-blush-100/75 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSigningOut ? (
            <Loader2 aria-hidden="true" className="size-[1.05rem] shrink-0 animate-spin" />
          ) : (
            <LogOut aria-hidden="true" className="size-[1.05rem] shrink-0" />
          )}
          {isSigningOut ? "Signing out…" : "Logout"}
        </button>
      </div>

      <div className="relative mt-auto overflow-hidden px-4 pb-6 pt-10">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url("${weddingImages.floral.src}")` }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-burgundy-700/95 via-burgundy-700/55 to-burgundy-700/15"
        />
        <div className="relative text-center">
          <p className="font-script text-xl leading-tight text-blush-100">Grow with WedPlan</p>
          <div className="mt-1.5 flex items-center justify-center gap-1.5">
            <Sparkles aria-hidden="true" className="size-3 text-gold-300" />
            <Heart aria-hidden="true" className="size-3.5 text-wine-300" />
            <Gem aria-hidden="true" className="size-3 text-gold-300" />
          </div>
        </div>
      </div>
    </div>
  )
}
