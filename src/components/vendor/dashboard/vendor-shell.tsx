"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { X } from "lucide-react"

import { SidebarPanel, type VendorDashboardUser } from "@/components/vendor/dashboard/sidebar"
import { VendorTopbar } from "@/components/vendor/dashboard/topbar"
import { cn } from "@/lib/utils"

interface VendorShellProps {
  user: VendorDashboardUser
  pendingBookings: number
  children: ReactNode
}

/**
 * Dashboard chrome matching the supplied UI reference: narrow burgundy
 * sidebar, sticky light top bar and a scrollable content column. The mobile
 * drawer renders the same sidebar panel so navigation and the pending badge
 * stay in one place.
 */
export function VendorShell({ user, pendingBookings, children }: VendorShellProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isDrawerOpen) return

    closeButtonRef.current?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsDrawerOpen(false)
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isDrawerOpen])

  function handleToggleSidebar() {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches) {
      setIsSidebarCollapsed((collapsed) => !collapsed)
      return
    }

    setIsDrawerOpen(true)
  }

  const closeDrawer = () => setIsDrawerOpen(false)

  return (
    <div className="min-h-screen bg-blush-50">
      <a
        href="#vendor-dashboard-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-burgundy-600 focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:outline-none focus:ring-2 focus:ring-wine-300"
      >
        Skip to dashboard content
      </a>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden w-[216px] flex-col",
          !isSidebarCollapsed && "lg:flex",
        )}
      >
        <SidebarPanel user={user} pendingBookings={pendingBookings} />
      </aside>

      {isDrawerOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={closeDrawer}
            className="absolute inset-0 h-full w-full cursor-default bg-wine-900/55 backdrop-blur-sm"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Vendor dashboard navigation"
            className="relative flex h-full w-[280px] max-w-[86vw] flex-col bg-burgundy-700 shadow-[0_30px_80px_-20px_rgba(53,19,34,0.75)] animate-in fade-in slide-in-from-left-4 duration-200"
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeDrawer}
              aria-label="Close vendor dashboard navigation"
              className="absolute right-3 top-4 z-10 grid size-9 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
            <SidebarPanel
              user={user}
              pendingBookings={pendingBookings}
              onNavigate={closeDrawer}
            />
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding-left] duration-300",
          isSidebarCollapsed ? "lg:pl-0" : "lg:pl-[216px]",
        )}
      >
        <VendorTopbar
          user={user}
          pendingBookings={pendingBookings}
          onToggleSidebar={handleToggleSidebar}
          onNavigate={closeDrawer}
        />

        <main
          id="vendor-dashboard-content"
          className="mx-auto w-full max-w-[1320px] flex-1 px-4 py-5 sm:px-6 lg:px-7 lg:py-6"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
