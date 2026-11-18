import type { ReactNode } from "react"

import { Footer } from "@/components/home/footer"
import { Navbar } from "@/components/home/navbar"

interface ServiceDetailShellProps {
  children: ReactNode
}

/** Shared chrome for the details route, its loading skeleton, and its 404 UI. */
export function ServiceDetailShell({ children }: ServiceDetailShellProps) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-cream-50">
      <Navbar />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
