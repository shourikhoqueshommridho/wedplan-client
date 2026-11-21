"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ChevronDown,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Search,
  UserRound,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { Logo } from "@/components/brand/logo"
import { buttonVariants } from "@/components/ui/button"
import { serviceCategories } from "@/data/categories"
import { authClient } from "@/lib/auth-client"
import { dashboardPathForRole } from "@/lib/safe-redirect"
import { cn } from "@/lib/utils"
import { normalizeUserRole, type UserRole } from "@/types/auth"

const desktopLinkClass =
  "relative inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-wine-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2"

const activeLinkClass =
  "text-wine-800 after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-wine-700"

const dashboardLabels: Record<UserRole, string> = {
  customer: "Customer Dashboard",
  vendor: "Vendor Dashboard",
  admin: "Admin Dashboard",
}

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement>(null)

  const user = session?.user
  const role = normalizeUserRole(user?.role)
  const firstName = user?.name?.trim().split(/\s+/)[0] ?? "Account"
  const dashboardHref = dashboardPathForRole(role)
  const initial = user?.name?.trim().charAt(0).toUpperCase() ?? ""

  useEffect(() => {
    if (!isMenuOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsMenuOpen(false)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isMenuOpen])

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

  async function handleSignOut() {
    if (isSigningOut) return
    setIsSigningOut(true)

    try {
      const { error } = await authClient.signOut()

      if (error) {
        toast.error("Could not sign out", {
          description: error.message || "Please try again.",
        })
        return
      }

      setIsAccountOpen(false)
      setIsMenuOpen(false)
      toast.success("Signed out", { description: "You have been signed out safely." })
      router.push("/")
      router.refresh()
    } catch {
      toast.error("Could not sign out", { description: "Please try again." })
    } finally {
      setIsSigningOut(false)
    }
  }

  const isHomeActive = pathname === "/"
  const isServicesActive = pathname === "/services" || pathname.startsWith("/services/")
  const isVendorsActive = pathname.startsWith("/vendor")
  const isSignInPage = pathname === "/sign-in"
  const isSignUpPage = pathname === "/sign-up"
  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-wine-100/80 bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <Logo />

        <nav aria-label="Primary" className="ml-4 hidden items-center gap-1 lg:flex">
          <Link
            href="/"
            aria-current={isHomeActive ? "page" : undefined}
            className={cn(desktopLinkClass, isHomeActive && activeLinkClass)}
          >
            Home
          </Link>

          <div className="group relative">
            <Link
              href="/services"
              aria-current={isServicesActive ? "page" : undefined}
              className={cn(desktopLinkClass, isServicesActive && activeLinkClass)}
            >
              Browse Services
              <ChevronDown
                aria-hidden="true"
                className="size-3.5 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
              />
            </Link>

            <div className="invisible absolute left-0 top-full z-50 w-72 translate-y-1 pt-2 opacity-0 transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <div className="overflow-hidden rounded-2xl border border-wine-100 bg-white p-2 shadow-[0_24px_60px_-30px_rgba(80,16,38,0.45)]">
                <p className="px-3 pb-1 pt-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-wine-500">
                  Browse by category
                </p>
                <ul>
                  {serviceCategories.map((category) => (
                    <li key={category.slug}>
                      <Link
                        href={category.href}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-wine-50 hover:text-wine-800 focus-visible:bg-wine-50 focus-visible:text-wine-800 focus-visible:outline-none"
                      >
                        <category.icon aria-hidden="true" className="size-4 text-wine-500" />
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/services"
                  className="mt-1 block rounded-xl bg-wine-50 px-3 py-2 text-center text-xs font-semibold text-wine-800 transition-colors hover:bg-wine-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  View all services
                </Link>
              </div>
            </div>
          </div>

          <Link
            href="/vendor/sign-up"
            aria-current={isVendorsActive ? "page" : undefined}
            className={cn(desktopLinkClass, isVendorsActive && activeLinkClass)}
          >
            For Vendors
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <form action="/services" role="search" className="relative hidden md:block">
            <label htmlFor="site-search" className="sr-only">
              Search wedding services
            </label>
            <input
              id="site-search"
              name="search"
              type="search"
              placeholder="Search services..."
              className="h-10 w-44 rounded-full border border-wine-100 bg-wine-50/70 pl-4 pr-10 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-wine-300 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-wine-200 lg:w-56"
            />
            <button
              type="submit"
              className="absolute right-0.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-wine-700 transition-colors hover:bg-wine-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <Search aria-hidden="true" className="size-4" />
              <span className="sr-only">Search</span>
            </button>
          </form>

          {isPending ? (
            <div
              aria-hidden="true"
              className="size-10 animate-pulse rounded-full border border-wine-100 bg-wine-50"
            />
          ) : user ? (
            <div ref={accountMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsAccountOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={isAccountOpen}
                aria-controls="account-menu"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-wine-100 bg-white py-1 pl-1 pr-2.5 text-left transition-colors hover:border-wine-200 hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
              >
                <span
                  aria-hidden="true"
                  className="grid size-8 place-items-center rounded-full bg-wine-100 bg-cover bg-center text-xs font-bold text-wine-800"
                  style={
                    user.image
                      ? { backgroundImage: `url("${user.image.replace(/"/g, "%22")}")` }
                      : undefined
                  }
                >
                  {user.image ? null : initial || <UserRound className="size-4" />}
                </span>
                <span className="hidden max-w-28 truncate text-sm font-semibold text-wine-900 sm:block">
                  {firstName}
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
                  id="account-menu"
                  role="menu"
                  aria-label="Account"
                  className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-wine-100 bg-white p-2 shadow-[0_28px_70px_-30px_rgba(80,16,38,0.5)]"
                >
                  <div className="border-b border-wine-100 px-3 pb-2.5 pt-2">
                    <p className="truncate text-sm font-semibold text-wine-900">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    <p className="mt-1.5 inline-flex rounded-full bg-wine-50 px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.14em] text-wine-700">
                      {role}
                    </p>
                  </div>

                  <div className="pt-1.5">
                    <Link
                      href="/profile"
                      role="menuitem"
                      onClick={() => setIsAccountOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-wine-50 hover:text-wine-800 focus-visible:bg-wine-50 focus-visible:text-wine-800 focus-visible:outline-none"
                    >
                      <UserRound aria-hidden="true" className="size-4 text-wine-500" />
                      Profile
                    </Link>
                    <Link
                      href={dashboardHref}
                      role="menuitem"
                      onClick={() => setIsAccountOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-wine-50 hover:text-wine-800 focus-visible:bg-wine-50 focus-visible:text-wine-800 focus-visible:outline-none"
                    >
                      <LayoutDashboard aria-hidden="true" className="size-4 text-wine-500" />
                      {dashboardLabels[role]}
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleSignOut}
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
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              {isSignInPage ? (
                <Link
                  href="/sign-up"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-wine-800 transition-colors hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
                >
                  Sign Up
                </Link>
              ) : isSignUpPage ? (
                <Link
                  href="/sign-in"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-wine-800 transition-colors hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
                >
                  Sign In
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-wine-800 transition-colors hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
                >
                  Sign In
                </Link>
              )}
              <Link
                href="/sign-up"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "h-10 rounded-full bg-wine-800 px-5 text-cream-50 hover:bg-wine-900",
                )}
              >
                Sign Up
              </Link>
            </div>
          )}

          <Link
            href={user ? "/profile" : "/sign-in"}
            aria-label={user ? "Your profile" : "Sign in to your account"}
            className="grid size-10 place-items-center rounded-full border border-wine-100 bg-white text-wine-700 transition-colors hover:border-wine-200 hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 lg:hidden"
          >
            <UserRound aria-hidden="true" className="size-[1.15rem]" />
          </Link>

          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="grid size-10 place-items-center rounded-full border border-wine-100 bg-white text-wine-800 transition-colors hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 lg:hidden"
          >
            {isMenuOpen ? (
              <X aria-hidden="true" className="size-5" />
            ) : (
              <Menu aria-hidden="true" className="size-5" />
            )}
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div
          id="mobile-navigation"
          className="animate-in fade-in slide-in-from-top-2 border-t border-wine-100 bg-white duration-200 lg:hidden"
        >
          <div className="mx-auto w-full max-w-[1440px] px-4 py-4 sm:px-6">
            <form action="/services" role="search" className="relative mb-3 md:hidden">
              <label htmlFor="mobile-site-search" className="sr-only">
                Search wedding services
              </label>
              <input
                id="mobile-site-search"
                name="search"
                type="search"
                placeholder="Search services..."
                className="h-11 w-full rounded-full border border-wine-100 bg-wine-50/70 pl-4 pr-11 text-sm placeholder:text-muted-foreground/70 focus:border-wine-300 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-wine-700 transition-colors hover:bg-wine-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <Search aria-hidden="true" className="size-4" />
                <span className="sr-only">Search</span>
              </button>
            </form>

            <nav aria-label="Mobile" className="flex flex-col gap-0.5">
              <Link
                href="/"
                onClick={closeMenu}
                aria-current={isHomeActive ? "page" : undefined}
                className={cn(
                  "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-wine-50 hover:text-wine-800",
                  isHomeActive ? "bg-wine-50 text-wine-800" : "text-foreground/80",
                )}
              >
                Home
              </Link>
              <Link
                href="/services"
                onClick={closeMenu}
                aria-current={isServicesActive ? "page" : undefined}
                className={cn(
                  "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-wine-50 hover:text-wine-800",
                  isServicesActive ? "bg-wine-50 text-wine-800" : "text-foreground/80",
                )}
              >
                Browse Services
              </Link>
              <Link
                href="/vendor/sign-up"
                onClick={closeMenu}
                aria-current={isVendorsActive ? "page" : undefined}
                className={cn(
                  "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-wine-50 hover:text-wine-800",
                  isVendorsActive ? "bg-wine-50 text-wine-800" : "text-foreground/80",
                )}
              >
                For Vendors
              </Link>
            </nav>

            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {serviceCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={category.href}
                  onClick={closeMenu}
                  className="flex items-center gap-2 rounded-xl bg-wine-50/80 px-3 py-2 text-xs font-medium text-wine-800 transition-colors hover:bg-wine-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <category.icon aria-hidden="true" className="size-3.5 shrink-0 text-wine-500" />
                  {category.name}
                </Link>
              ))}
            </div>

            {user ? (
              <div className="mt-4 border-t border-wine-100 pt-4">
                <div className="mb-3 flex items-center gap-3 rounded-2xl bg-wine-50/70 p-3">
                  <span
                    aria-hidden="true"
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-wine-100 bg-cover bg-center text-sm font-bold text-wine-800"
                    style={
                      user.image
                        ? { backgroundImage: `url("${user.image.replace(/"/g, "%22")}")` }
                        : undefined
                    }
                  >
                    {user.image ? null : initial || <UserRound className="size-4" />}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-wine-900">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <div className="grid gap-1">
                  <Link
                    href="/profile"
                    onClick={closeMenu}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-wine-50 hover:text-wine-800"
                  >
                    <UserRound aria-hidden="true" className="size-4 text-wine-500" />
                    Profile
                  </Link>
                  <Link
                    href={dashboardHref}
                    onClick={closeMenu}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-wine-50 hover:text-wine-800"
                  >
                    <LayoutDashboard aria-hidden="true" className="size-4 text-wine-500" />
                    {dashboardLabels[role]}
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/5 disabled:opacity-60"
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
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-wine-100 pt-4">
                <Link
                  href={isSignInPage ? "/sign-up" : "/sign-in"}
                  onClick={closeMenu}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-10 rounded-full border-wine-200 text-wine-800 hover:bg-wine-50",
                  )}
                >
                  {isSignInPage ? "Sign Up" : "Sign In"}
                </Link>
                <Link
                  href="/sign-up"
                  onClick={closeMenu}
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "h-10 rounded-full bg-wine-800 text-cream-50 hover:bg-wine-900",
                  )}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  )
}
