"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CalendarDays,
  Heart,
  LayoutDashboard,
  Loader2,
  LogOut,
  Settings,
  type LucideIcon,
} from "lucide-react"

import { RoleBadge } from "@/components/account/role-badge"
import { Logo } from "@/components/brand/logo"
import { weddingImages } from "@/data/images"
import { initialsFromName } from "@/lib/customer-dashboard"
import { useSignOut } from "@/lib/use-sign-out"
import { cn } from "@/lib/utils"
import type { UserRole } from "@/types/auth"

export interface DashboardUser {
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
}

const navigation: readonly NavItem[] = [
  { href: "/dashboard/customer", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/customer/bookings", label: "My Bookings", icon: CalendarDays },
  { href: "/dashboard/customer/settings", label: "Profile Settings", icon: Settings },
]

function isActivePath(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

interface SidebarPanelProps {
  user: DashboardUser
  className?: string
  /** Called after a navigation link is clicked so the mobile drawer can close. */
  onNavigate?: () => void
}

export function SidebarPanel({ user, className, onNavigate }: SidebarPanelProps) {
  const pathname = usePathname()
  const { isSigningOut, signOut } = useSignOut()

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-y-auto bg-burgundy-700 text-blush-100",
        className,
      )}
    >
      <div className="px-6 pb-5 pt-7">
        <Logo tone="light" />
        <p className="mt-2 pl-[46px] text-[0.58rem] font-semibold uppercase tracking-[0.26em] text-blush-100/60">
          Plan · Book · Celebrate
        </p>
      </div>

      <div className="flex flex-col items-center px-6 pb-7">
        <span
          aria-hidden="true"
          className="grid size-20 place-items-center rounded-full border-2 border-white/25 bg-wine-800 bg-cover bg-center font-heading text-xl font-semibold text-blush-100 shadow-[0_16px_40px_-18px_rgba(0,0,0,0.65)]"
          style={
            user.image
              ? { backgroundImage: `url("${user.image.replace(/"/g, "%22")}")` }
              : undefined
          }
        >
          {user.image ? null : initialsFromName(user.name)}
        </span>
        <p className="mt-3 max-w-full truncate font-heading text-lg font-semibold text-white">
          {user.name}
        </p>
        <div className="mt-2">
          <RoleBadge role={user.role} tone="onDark" />
        </div>
      </div>

      <div className="mx-6 border-t border-white/10" />

      <nav aria-label="Customer dashboard" className="flex flex-col gap-1 px-4 py-5">
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
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
                active
                  ? "bg-gradient-to-r from-wine-500 to-burgundy-600 text-white shadow-[0_14px_30px_-16px_rgba(0,0,0,0.7)]"
                  : "text-blush-100/75 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon aria-hidden="true" className="size-[1.15rem] shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mx-6 border-t border-white/10" />

      <div className="px-4 py-5">
        <button
          type="button"
          onClick={() => void signOut(onNavigate)}
          disabled={isSigningOut}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold text-blush-100/75 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSigningOut ? (
            <Loader2 aria-hidden="true" className="size-[1.15rem] shrink-0 animate-spin" />
          ) : (
            <LogOut aria-hidden="true" className="size-[1.15rem] shrink-0" />
          )}
          {isSigningOut ? "Signing out…" : "Logout"}
        </button>
      </div>

      <div className="relative mt-auto overflow-hidden px-6 pb-8 pt-12">
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
          <p className="font-script text-2xl leading-tight text-blush-100">
            Happy Wedding Planning!
          </p>
          <Heart aria-hidden="true" className="mx-auto mt-2 size-4 text-wine-300" />
        </div>
      </div>
    </div>
  )
}
