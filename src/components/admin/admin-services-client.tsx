"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Loader2, MoreHorizontal, Search, Trash2, X } from "lucide-react"
import { toast } from "sonner"

import { StatusBadge } from "@/components/account/status-badge"
import { ConfirmDialog } from "@/components/vendor/dashboard/confirm-dialog"
import { useAdminServiceReview } from "@/components/admin/use-admin-service-review"
import { apiFetch, readApiMessage } from "@/lib/client-api"
import {
  adminServiceCategories,
  filterAdminServices,
  paginate,
  type AdminServiceFilterStatus,
} from "@/lib/admin-dashboard"
import { formatAmount } from "@/lib/format"
import type { AdminService } from "@/types/admin"

interface AdminServicesClientProps {
  services: AdminService[]
  dataError: boolean
  initialServiceId: string | null
  initialStatus: AdminServiceFilterStatus
  initialSearch: string
}

const PAGE_SIZE = 8

const STATUS_FILTERS: readonly { value: AdminServiceFilterStatus; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "inactive", label: "Inactive" },
]

interface PendingReview {
  service: AdminService
  status: "approved" | "rejected"
}

function ServiceDetailsDialog({
  service,
  onClose,
}: {
  service: AdminService | null
  onClose: () => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!service) return
    closeRef.current?.focus()
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("keydown", onKey)
    }
  }, [service, onClose])

  if (!service) return null

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-wine-900/55 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-service-details-title"
        className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-[1.5rem] bg-white p-6 shadow-[0_40px_120px_-30px_rgba(53,19,34,0.7)] sm:rounded-[1.5rem]"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close service details"
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full text-wine-700 hover:bg-wine-50"
        >
          <X aria-hidden="true" className="size-4" />
        </button>

        <div
          aria-hidden="true"
          className="h-36 rounded-xl bg-wine-50 bg-cover bg-center"
          style={
            service.images[0]
              ? { backgroundImage: `url("${service.images[0].replace(/"/g, "%22")}")` }
              : undefined
          }
        />

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <h2 id="admin-service-details-title" className="font-heading text-2xl font-semibold text-wine-900">
            {service.name}
          </h2>
          <StatusBadge status={service.status} />
        </div>

        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-wine-50/70 px-3.5 py-2.5">
            <dt className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-wine-800/60">Vendor</dt>
            <dd className="mt-1 font-semibold text-wine-900">{service.vendorName}</dd>
          </div>
          <div className="rounded-xl bg-wine-50/70 px-3.5 py-2.5">
            <dt className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-wine-800/60">Category</dt>
            <dd className="mt-1 font-semibold text-wine-900">{service.category}</dd>
          </div>
          <div className="rounded-xl bg-wine-50/70 px-3.5 py-2.5">
            <dt className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-wine-800/60">Price</dt>
            <dd className="mt-1 font-semibold text-wine-900">{formatAmount(service.price, "USD")}</dd>
          </div>
          <div className="rounded-xl bg-wine-50/70 px-3.5 py-2.5">
            <dt className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-wine-800/60">Location</dt>
            <dd className="mt-1 font-semibold text-wine-900">{service.location}</dd>
          </div>
        </dl>

        <p className="mt-4 text-sm leading-relaxed text-foreground/75">{service.description}</p>
      </div>
    </div>
  )
}

export function AdminServicesClient({
  services,
  dataError,
  initialServiceId,
  initialStatus,
  initialSearch,
}: AdminServicesClientProps) {
  const router = useRouter()
  const { busyId, review } = useAdminServiceReview()
  const [overrides, setOverrides] = useState<Record<string, AdminService>>({})
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [search, setSearch] = useState(initialSearch)
  const [category, setCategory] = useState("all")
  const [status, setStatus] = useState<AdminServiceFilterStatus>(initialStatus)
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(initialServiceId)
  const [pendingReview, setPendingReview] = useState<PendingReview | null>(null)

  const items = services
    .filter((service) => !deletedIds.has(service.id))
    .map((service) => overrides[service.id] ?? service)
  const categories = adminServiceCategories(items)
  const filtered = filterAdminServices(items, { search, category, status })
  const result = paginate(filtered, page, PAGE_SIZE)

  const selected = items.find((service) => service.id === selectedId) ?? null

  async function confirmReview() {
    if (!pendingReview) return
    const { service, status: nextStatus } = pendingReview
    setPendingReview(null)
    const ok = await review(service, nextStatus)
    if (ok) {
      setOverrides((current) => ({
        ...current,
        [service.id]: { ...service, status: nextStatus, isActive: nextStatus === "approved" },
      }))
    }
  }

  async function confirmDelete() {
    if (!pendingDeleteId) return
    const service = items.find((item) => item.id === pendingDeleteId)
    setPendingDeleteId(null)
    if (!service) return

    setDeletingId(service.id)
    try {
      const response = await apiFetch(`/admin/services/${service.id}`, { method: "DELETE" })
      if (!response.ok) {
        const message = await readApiMessage(response, "The service could not be deleted.")
        toast.error("Delete failed", { description: message })
        return
      }

      setDeletedIds((current) => new Set(current).add(service.id))
      toast.success("Service deleted", { description: `${service.name} was removed.` })
      router.refresh()
    } catch {
      toast.error("Delete failed", {
        description: "Please check your connection and try again.",
      })
    } finally {
      setDeletingId(null)
    }
  }

  function clearFilters() {
    setSearch("")
    setCategory("all")
    setStatus("all")
    setPage(1)
  }

  return (
    <div className="space-y-5">
      {dataError ? (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm text-destructive"
        >
          Services could not be loaded. Refresh the page or sign in again.
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[1.15rem] border border-wine-100 bg-white shadow-[0_18px_45px_-42px_rgba(112,19,47,0.6)]">
        <div className="flex flex-col gap-3 border-b border-wine-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-heading text-xl font-semibold text-wine-900">Manage Services</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {filtered.length} of {items.length} listings
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-wine-400"
              />
              <label className="sr-only" htmlFor="admin-services-search">Search services</label>
              <input
                id="admin-services-search"
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder="Search service or vendor..."
                className="h-10 w-full rounded-full border border-wine-100 bg-white pl-10 pr-4 text-sm outline-none focus:border-wine-300 focus:ring-2 focus:ring-wine-100 lg:w-[230px]"
              />
            </div>
            <label className="sr-only" htmlFor="admin-services-category">Filter by category</label>
            <select
              id="admin-services-category"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value)
                setPage(1)
              }}
              className="h-10 rounded-full border border-wine-100 bg-white px-3 text-sm text-wine-800 outline-none focus:ring-2 focus:ring-wine-200"
            >
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <label className="sr-only" htmlFor="admin-services-status">Filter by status</label>
            <select
              id="admin-services-status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as AdminServiceFilterStatus)
                setPage(1)
              }}
              className="h-10 rounded-full border border-wine-100 bg-white px-3 text-sm text-wine-800 outline-none focus:ring-2 focus:ring-wine-200"
            >
              {STATUS_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {search || category !== "all" || status !== "all" ? (
              <button
                type="button"
                onClick={clearFilters}
                className="h-10 rounded-full border border-wine-200 bg-white px-4 text-xs font-semibold text-wine-800 hover:bg-wine-50"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>

        {result.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-wine-50 text-wine-600">
              <Search aria-hidden="true" className="size-5" />
            </span>
            <p className="mt-3 font-heading text-lg font-semibold text-wine-900">
              {dataError ? "Services unavailable" : items.length === 0 ? "No services yet" : "No matching services"}
            </p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              {dataError
                ? "Refresh the page or sign in again."
                : items.length === 0
                  ? "Vendor submissions will appear here."
                  : "Try a different search or filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#fdf1f5] text-[0.62rem] uppercase tracking-[0.11em] text-wine-700">
                  <th scope="col" className="px-4 py-2.5 font-bold">Image</th>
                  <th scope="col" className="px-4 py-2.5 font-bold">Service Name</th>
                  <th scope="col" className="px-4 py-2.5 font-bold">Vendor</th>
                  <th scope="col" className="px-4 py-2.5 font-bold">Category</th>
                  <th scope="col" className="px-4 py-2.5 font-bold">Price</th>
                  <th scope="col" className="px-4 py-2.5 font-bold">Status</th>
                  <th scope="col" className="px-4 py-2.5 font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wine-100">
                {result.items.map((service) => (
                  <tr key={service.id} className="transition-colors hover:bg-wine-50/40">
                    <td className="px-4 py-3">
                      <span
                        aria-hidden="true"
                        className="block size-11 rounded-lg border border-wine-100 bg-wine-50 bg-cover bg-center"
                        style={
                          service.images[0]
                            ? { backgroundImage: `url("${service.images[0].replace(/"/g, "%22")}")` }
                            : undefined
                        }
                      />
                    </td>
                    <td className="max-w-[180px] px-4 py-3 font-semibold text-wine-900">
                      <span className="line-clamp-2">{service.name}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{service.vendorName}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-wine-50 px-2 py-0.5 text-[0.62rem] font-semibold text-wine-700">
                        {service.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-wine-800">
                      {formatAmount(service.price, "USD")}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={service.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {service.status === "pending" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setPendingReview({ service, status: "approved" })}
                              disabled={busyId === service.id}
                              className="inline-flex h-8 items-center gap-1 rounded-full bg-burgundy-600 px-3 text-[0.65rem] font-semibold text-white hover:bg-burgundy-700 disabled:opacity-50"
                            >
                              <Check aria-hidden="true" className="size-3" />
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingReview({ service, status: "rejected" })}
                              disabled={busyId === service.id}
                              className="inline-flex h-8 items-center gap-1 rounded-full border border-wine-200 bg-white px-3 text-[0.65rem] font-semibold text-wine-800 hover:bg-wine-50 disabled:opacity-50"
                            >
                              <X aria-hidden="true" className="size-3" />
                              Reject
                            </button>
                          </>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => setSelectedId(service.id)}
                          aria-label={`View ${service.name}`}
                          className="grid size-8 place-items-center rounded-full border border-wine-100 bg-white text-wine-700 hover:bg-wine-50"
                        >
                          {busyId === service.id ? (
                            <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
                          ) : (
                            <MoreHorizontal aria-hidden="true" className="size-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDeleteId(service.id)}
                          disabled={deletingId === service.id}
                          aria-label={`Delete ${service.name}`}
                          className="grid size-8 place-items-center rounded-full border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 disabled:opacity-50"
                        >
                          {deletingId === service.id ? (
                            <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 aria-hidden="true" className="size-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {result.totalPages > 1 ? (
          <div className="flex items-center justify-between gap-3 border-t border-wine-100 px-5 py-3">
            <p className="text-xs text-muted-foreground">
              Page {result.page} of {result.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={result.page === 1}
                className="rounded-full border border-wine-200 bg-white px-4 py-1.5 text-xs font-semibold text-wine-800 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(result.totalPages, current + 1))}
                disabled={result.page === result.totalPages}
                className="rounded-full border border-wine-200 bg-white px-4 py-1.5 text-xs font-semibold text-wine-800 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <ServiceDetailsDialog service={selected} onClose={() => setSelectedId(null)} />

      <ConfirmDialog
        open={pendingReview !== null}
        title={pendingReview?.status === "approved" ? "Approve this service?" : "Reject this service?"}
        description={
          pendingReview
            ? pendingReview.status === "approved"
              ? `"${pendingReview.service.name}" will become publicly visible to customers.`
              : `"${pendingReview.service.name}" will be hidden from public listings. The vendor can resubmit after editing.`
            : ""
        }
        confirmLabel={pendingReview?.status === "approved" ? "Approve" : "Reject"}
        tone={pendingReview?.status === "approved" ? "default" : "destructive"}
        busy={busyId !== null}
        onConfirm={() => void confirmReview()}
        onCancel={() => setPendingReview(null)}
      />

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete this service?"
        description={
          pendingDeleteId
            ? `"${items.find((item) => item.id === pendingDeleteId)?.name ?? "This service"}" will be permanently removed from WedPlan.`
            : ""
        }
        confirmLabel="Delete"
        tone="destructive"
        busy={deletingId !== null}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  )
}
