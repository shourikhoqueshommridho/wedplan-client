"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CreditCard,
  LayoutDashboard,
  Loader2,
  LogOut,
  Settings,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react"

import { Logo } from "@/components/brand/logo"
import { weddingImages } from "@/data/images"
import { initialsFromName } from "@/lib/customer-dashboard"
import { useSignOut } from "@/lib/use-sign-out"
import { cn } from "@/lib/utils"
import type { UserRole } from "@/types/auth"

export interface AdminDashboardUser {
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
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/admin/users", label: "Manage Users", icon: Users },
  { href: "/dashboard/admin/services", label: "Manage Services", icon: Wrench },
  { href: "/dashboard/admin/transactions", label: "Transactions", icon: CreditCard },
  { href: "/dashboard/admin/settings", label: "Profile Settings", icon: Settings },
]

function isActivePath(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

interface AdminSidebarProps {
  user: AdminDashboardUser
  className?: string
  onNavigate?: () => void
}

export function AdminSidebar({ user, className, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname()
  const { isSigningOut, signOut } = useSignOut()

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-y-auto bg-burgundy-700 text-blush-100",
        className,
      )}
    >
      <div className="px-5 pb-3 pt-6">
        <Logo tone="light" />
        <p className="mt-1.5 pl-[42px] text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-blush-100/70">
          Admin Panel
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
        <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-gold-300/40 bg-gold-300/20 px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-gold-300">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-gold-300" />
          Super Admin
        </span>
      </div>

      <div className="mx-5 border-t border-white/10" />

      <nav aria-label="Admin dashboard" className="flex flex-col gap-0.5 px-3 py-3.5">
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
          className="absolute inset-0 bg-cover bg-center opacity-45"
          style={{ backgroundImage: `url("${weddingImages.floral.src}")` }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-burgundy-700/95 via-burgundy-700/55 to-burgundy-700/15"
        />
        <div className="relative text-center">
          <p className="font-script text-[1.15rem] leading-snug text-blush-100">
            Wedding Dreams
            <br />
            Made Easy
          </p>
          <span aria-hidden="true" className="mt-1 inline-block text-wine-200">
            ♡
          </span>
        </div>
      </div>
    </div>
  )
}
