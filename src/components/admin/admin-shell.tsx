"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { X } from "lucide-react"

import { AdminSidebar, type AdminDashboardUser } from "@/components/admin/admin-sidebar"
import { AdminTopbar } from "@/components/admin/admin-topbar"
import { cn } from "@/lib/utils"

interface AdminShellProps {
  user: AdminDashboardUser
  pendingCount: number
  children: ReactNode
}

export function AdminShell({ user, pendingCount, children }: AdminShellProps) {
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

  return (
    <div className="min-h-screen bg-blush-50">
      <a
        href="#admin-dashboard-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-burgundy-600 focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:outline-none"
      >
        Skip to admin dashboard content
      </a>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden w-[216px] flex-col",
          !isSidebarCollapsed && "lg:flex",
        )}
      >
        <AdminSidebar user={user} />
      </aside>

      {isDrawerOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-wine-900/55 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Admin dashboard navigation"
            className="relative flex h-full w-[280px] max-w-[86vw] flex-col bg-burgundy-700 shadow-[0_30px_80px_-20px_rgba(53,19,34,0.75)] animate-in fade-in slide-in-from-left-4 duration-200"
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              aria-label="Close admin dashboard navigation"
              className="absolute right-3 top-4 z-10 grid size-9 place-items-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
            <AdminSidebar user={user} onNavigate={() => setIsDrawerOpen(false)} />
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding-left] duration-300",
          isSidebarCollapsed ? "lg:pl-0" : "lg:pl-[216px]",
        )}
      >
        <AdminTopbar
          user={user}
          pendingCount={pendingCount}
          onToggleSidebar={handleToggleSidebar}
        />
        <main
          id="admin-dashboard-content"
          className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-5 sm:px-6 lg:px-7 lg:py-6"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
