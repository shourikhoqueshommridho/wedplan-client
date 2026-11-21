"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, ImageIcon, Loader2, MapPin, Pencil, Store, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { StatusBadge } from "@/components/account/status-badge"
import { ConfirmDialog } from "@/components/vendor/dashboard/confirm-dialog"
import { apiFetch, readApiMessage } from "@/lib/client-api"
import { formatVendorAmount } from "@/lib/vendor-dashboard"
import type { VendorService } from "@/types/vendor"

interface ServicesPreviewProps {
  services: readonly VendorService[]
  dataError?: boolean
  limit?: number
}

function imageStyle(image: string | undefined): { backgroundImage: string } | undefined {
  if (!image) return undefined
  return { backgroundImage: `url("${image.replace(/"/g, "%22")}")` }
}

function statusLabel(service: VendorService): string | undefined {
  if (service.status === "approved") return "Active"
  return undefined
}

export function ServicesPreview({
  services,
  dataError = false,
  limit = 3,
}: ServicesPreviewProps) {
  const router = useRouter()
  const [overrides, setOverrides] = useState<Record<string, VendorService>>({})
  const [deleteTarget, setDeleteTarget] = useState<VendorService | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const items = services.map((service) => overrides[service.id] ?? service)
  const visible = items.slice(0, limit)

  async function removeService() {
    if (!deleteTarget || busyId) return

    const target = deleteTarget
    setDeleteTarget(null)
    setBusyId(target.id)

    try {
      const response = await apiFetch(`/vendor/services/${target.id}`, { method: "DELETE" })

      if (!response.ok) {
        const message = await readApiMessage(response, "The service could not be removed.")
        toast.error("Service not removed", { description: message })
        return
      }

      setOverrides((current) => ({
        ...current,
        [target.id]: { ...target, isActive: false, status: "inactive" },
      }))
      toast.success("Service removed", {
        description: "It no longer appears in your public listings.",
      })
      router.refresh()
    } catch {
      toast.error("Service not removed", {
        description: "Please check your connection and try again.",
      })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section
      aria-labelledby="overview-services-title"
      className="flex h-full flex-col overflow-hidden rounded-[1.15rem] border border-wine-100 bg-white shadow-[0_18px_45px_-42px_rgba(112,19,47,0.6)]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-wine-100 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-wine-50 text-wine-700">
            <Store aria-hidden="true" className="size-[1.05rem]" />
          </span>
          <h2
            id="overview-services-title"
            className="font-heading text-xl font-semibold text-wine-900"
          >
            My Services
          </h2>
        </div>

        <Link
          href="/dashboard/vendor/services"
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-wine-200 bg-white px-3.5 text-[0.7rem] font-semibold text-wine-800 transition-colors hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
        >
          View All
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>

      {dataError ? (
        <div
          role="alert"
          className="border-b border-destructive/10 bg-destructive/5 px-5 py-3 text-xs leading-relaxed text-destructive"
        >
          Your services could not be loaded. Nothing was changed.
        </div>
      ) : null}

      {visible.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-wine-50 text-wine-600">
            <Store aria-hidden="true" className="size-5" />
          </span>
          <p className="mt-3 font-heading text-lg font-semibold text-wine-900">
            {dataError ? "Services unavailable" : "Add your first service"}
          </p>
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
            {dataError
              ? "Refresh the page or sign in again to reload your catalogue."
              : "Describe what you offer, add photos and submit it for admin approval."}
          </p>
        </div>
      ) : (
        <ul className="grid flex-1 content-start gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((service) => {
            const isBusy = busyId === service.id

            return (
              <li
                key={service.id}
                className="flex flex-col overflow-hidden rounded-[1.1rem] border border-wine-100 bg-white shadow-[0_12px_30px_-28px_rgba(112,19,47,0.7)]"
              >
                <div className="relative h-28 bg-wine-50 bg-cover bg-center" style={imageStyle(service.images[0])}>
                  {service.images[0] ? null : (
                    <span className="grid h-full w-full place-items-center text-wine-300">
                      <ImageIcon aria-hidden="true" className="size-6" />
                    </span>
                  )}
                  <span className="absolute right-2.5 top-2.5 rounded-full bg-white/95 shadow-sm">
                    <StatusBadge status={service.status} label={statusLabel(service)} />
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-3.5">
                  <h3 className="line-clamp-2 min-h-[2.6rem] font-heading text-[0.95rem] font-semibold leading-snug text-wine-900">
                    {service.name}
                  </h3>
                  <p className="mt-1 font-heading text-lg font-semibold text-burgundy-600">
                    {formatVendorAmount(service.price)}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-[0.7rem] text-muted-foreground">
                    <MapPin aria-hidden="true" className="size-3 shrink-0 text-wine-400" />
                    <span className="truncate">{service.location}</span>
                  </p>

                  <div className="mt-auto flex items-center gap-2 pt-3.5">
                    <Link
                      href={`/dashboard/vendor/services?edit=${service.id}`}
                      className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-wine-100 bg-[#fdf1f5] text-[0.72rem] font-semibold text-wine-800 transition-colors hover:bg-wine-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
                    >
                      <Pencil aria-hidden="true" className="size-3" />
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(service)}
                      disabled={isBusy}
                      className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-wine-100 bg-[#fdf1f5] text-[0.72rem] font-semibold text-[#a13a44] transition-colors hover:bg-[#fbe8ea] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isBusy ? (
                        <Loader2 aria-hidden="true" className="size-3 animate-spin" />
                      ) : (
                        <Trash2 aria-hidden="true" className="size-3" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this service?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be removed from your public listings. You can submit it again later.`
            : ""
        }
        confirmLabel="Delete"
        tone="destructive"
        busy={busyId !== null}
        onConfirm={() => void removeService()}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  )
}
