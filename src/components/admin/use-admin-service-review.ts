"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { apiFetch, readApiMessage } from "@/lib/client-api"
import type { AdminService } from "@/types/admin"

export type AdminApprovalStatus = "approved" | "rejected"

/** Shared approve/reject mutation for every admin surface. */
export function useAdminServiceReview() {
  const router = useRouter()
  const [busyId, setBusyId] = useState<string | null>(null)

  async function review(service: AdminService, status: AdminApprovalStatus): Promise<boolean> {
    if (busyId) return false
    setBusyId(service.id)

    try {
      const response = await apiFetch(`/admin/services/${service.id}/approval`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const message = await readApiMessage(response, "The service status could not be updated.")
        toast.error("Review not saved", { description: message })
        return false
      }

      toast.success(status === "approved" ? "Service approved" : "Service rejected", {
        description:
          status === "approved"
            ? `${service.name} is now visible to customers.`
            : `${service.name} was rejected and is not publicly visible.`,
      })
      router.refresh()
      return true
    } catch {
      toast.error("Review not saved", {
        description: "Please check your connection and try again.",
      })
      return false
    } finally {
      setBusyId(null)
    }
  }

  return { busyId, review }
}
