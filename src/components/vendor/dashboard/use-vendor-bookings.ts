"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { parseBookingResponse } from "@/lib/account-data"
import { apiFetch, readApiMessage } from "@/lib/client-api"
import type { Booking } from "@/types/booking"

export type VendorBookingDecision = "accepted" | "declined" | "completed"

interface PendingDecision {
  booking: Booking
  status: VendorBookingDecision
}

/**
 * Shared booking mutations for the overview list and the Booking Requests
 * page. The API enforces ownership and the allowed transitions; this hook only
 * mirrors the successful response locally and refreshes server-rendered stats.
 */
export function useVendorBookings(initial: readonly Booking[]) {
  const router = useRouter()
  // Server props stay authoritative; local writes are id-keyed overlays so a
  // refresh can never leave a stale booking behind.
  const [overrides, setOverrides] = useState<Record<string, Booking>>({})
  const [busyId, setBusyId] = useState<string | null>(null)
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null)
  const [pendingDecision, setPendingDecision] = useState<PendingDecision | null>(null)

  const items = initial.map((booking) => overrides[booking.id] ?? booking)
  const activeBooking = items.find((booking) => booking.id === activeBookingId) ?? null

  function setActiveBooking(booking: Booking | null) {
    setActiveBookingId(booking?.id ?? null)
  }

  async function updateStatus(booking: Booking, status: VendorBookingDecision) {
    if (busyId) return

    setPendingDecision(null)
    setBusyId(booking.id)

    try {
      const response = await apiFetch(`/bookings/${booking.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const message = await readApiMessage(response, "The booking could not be updated.")
        toast.error("Booking not updated", { description: message })
        return
      }

      const updated = parseBookingResponse(await response.json())
      if (updated) {
        setOverrides((current) => ({ ...current, [updated.id]: updated }))
      }

      const copy: Record<VendorBookingDecision, { title: string; description: string }> = {
        accepted: {
          title: "Booking accepted",
          description: `${booking.customerName} will see the confirmation in their dashboard.`,
        },
        declined: {
          title: "Booking declined",
          description: "The request was closed and the customer will see the update.",
        },
        completed: {
          title: "Booking completed",
          description: "The event is now marked as completed.",
        },
      }

      toast.success(copy[status].title, { description: copy[status].description })
      router.refresh()
    } catch {
      toast.error("Booking not updated", {
        description: "Please check your connection and try again.",
      })
    } finally {
      setBusyId(null)
    }
  }

  /** Accepting is low-risk; declining and completing ask for confirmation. */
  function requestStatusChange(booking: Booking, status: VendorBookingDecision) {
    if (status === "accepted") {
      void updateStatus(booking, status)
      return
    }

    setPendingDecision({ booking, status })
  }

  function confirmPendingDecision() {
    if (!pendingDecision) return
    void updateStatus(pendingDecision.booking, pendingDecision.status)
  }

  return {
    items,
    busyId,
    activeBooking,
    setActiveBooking,
    pendingDecision,
    requestStatusChange,
    confirmPendingDecision,
    cancelPendingDecision: () => setPendingDecision(null),
  }
}
