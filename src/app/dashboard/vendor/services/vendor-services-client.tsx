"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, type FormEvent, type ChangeEvent } from "react"
import {
  Check,
  ChevronDown,
  Filter,
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Power,
  Search,
  Store,
  Trash2,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { StatusBadge } from "@/components/account/status-badge"
import { ConfirmDialog } from "@/components/vendor/dashboard/confirm-dialog"
import {
  apiFetch,
  readApiFieldError,
  readApiMessage,
} from "@/lib/client-api"
import { parseVendorServiceResponse } from "@/lib/account-data"
import { formatAmount } from "@/lib/format"
import {
  SERVICE_STATUS_FILTERS,
  filterVendorServices,
  serviceAvailabilityLabel,
  serviceCategoryOptions,
  type ServiceFilterStatus,
} from "@/lib/vendor-dashboard"
import { cn } from "@/lib/utils"
import {
  VENDOR_BUSINESS_CATEGORIES,
  isVendorBusinessCategory,
  type VendorBusinessCategory,
  type VendorService,
} from "@/types/vendor"

interface VendorServicesClientProps {
  initialServices: VendorService[]
  dataError: boolean
  initialEditId: string | null
  initialCreate?: boolean
  searchParams: {
    search?: string
    category?: string
    status?: string
  }
}

interface ServiceFormValues {
  serviceName: string
  category: VendorBusinessCategory
  description: string
  price: string
  location: string
  images: string
}

interface ServiceFilters {
  search: string
  category: string
  status: ServiceFilterStatus
}

const fieldClass =
  "h-11 w-full rounded-xl border border-wine-100 bg-white px-3.5 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-wine-300 focus:ring-2 focus:ring-wine-100 aria-[invalid=true]:border-destructive/60"

const textareaClass = cn(fieldClass, "h-auto min-h-24 resize-y py-3 leading-relaxed")

const labelClass = "mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground"

const primaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full bg-wine-800 px-4 text-sm font-semibold text-cream-50 transition-colors hover:bg-wine-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-300 disabled:cursor-not-allowed disabled:opacity-60"

const secondaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-wine-200 bg-white px-4 text-sm font-semibold text-wine-800 transition-colors hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200 disabled:cursor-not-allowed disabled:opacity-60"

const selectClass = cn(fieldClass, "appearance-none pr-10")

function emptyServiceValues(): ServiceFormValues {
  return {
    serviceName: "",
    category: "Photography & Videography",
    description: "",
    price: "",
    location: "",
    images: "",
  }
}

function serviceValuesFrom(service: VendorService): ServiceFormValues {
  return {
    serviceName: service.name,
    category: isVendorBusinessCategory(service.category)
      ? service.category
      : "Photography & Videography",
    description: service.description,
    price: String(service.price),
    location: service.location,
    images: service.images.join("\n"),
  }
}

function splitImageUrls(value: string): string[] {
  return value
    .split(/[\r\n,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function imageStyle(image: string | undefined): { backgroundImage: string } | undefined {
  if (!image) return undefined
  return { backgroundImage: `url("${image.replace(/"/g, "%22")}")` }
}

function availabilityTone(service: VendorService): string {
  const label = serviceAvailabilityLabel(service)
  if (label === "Publicly listed") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (label === "Not public yet") return "border-gold-300/70 bg-[#fff8ec] text-[#8a5a12]"
  return "border-wine-200 bg-white text-muted-foreground"
}

export function VendorServicesClient({
  initialServices,
  dataError,
  initialEditId,
  initialCreate = false,
  searchParams,
}: VendorServicesClientProps) {
  const router = useRouter()
  const searchParamsHook = useSearchParams()

  // The server response is the source of truth. Local writes are kept as
  // overlays keyed by id so a `router.refresh()` can never leave stale rows.
  const [overrides, setOverrides] = useState<Record<string, VendorService>>({})
  const [created, setCreated] = useState<VendorService[]>([])

  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(() => {
    if (initialEditId) return "edit"
    return initialCreate ? "create" : null
  })
  const [editingServiceId, setEditingServiceId] = useState<string | null>(initialEditId)
  const [serviceValues, setServiceValues] = useState<ServiceFormValues>(() => {
    if (initialEditId) {
      const service = initialServices.find((s) => s.id === initialEditId)
      if (service) return serviceValuesFrom(service)
    }
    return emptyServiceValues()
  })
  const [serviceError, setServiceError] = useState<string | null>(null)
  const [serviceFieldErrors, setServiceFieldErrors] = useState<
    Partial<Record<keyof ServiceFormValues, string>>
  >({})
  const [isSavingService, setIsSavingService] = useState(false)
  const [busyServiceId, setBusyServiceId] = useState<string | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<VendorService | null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<VendorService | null>(null)

  const [filters, setFilters] = useState<ServiceFilters>({
    search: searchParams.search ?? "",
    category: searchParams.category ?? "all",
    status: (searchParams.status as ServiceFilterStatus) ?? "all",
  })

  // Once the refresh brings the new listing back from the API, prefer the
  // server copy so later admin moderation changes are never masked locally.
  const services = [
    ...created.filter((draft) => !initialServices.some((entry) => entry.id === draft.id)),
    ...initialServices,
  ].map((service) => overrides[service.id] ?? service)

  const filteredServices = filterVendorServices(services, filters)
  const categories = serviceCategoryOptions(services)

  function updateUrlFilters(newFilters: Partial<ServiceFilters>) {
    const params = new URLSearchParams(searchParamsHook.toString())
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    router.push(`/dashboard/vendor/services?${params.toString()}`, { scroll: false })
  }

  function handleSearchChange(value: string) {
    setFilters((prev) => ({ ...prev, search: value }))
    updateUrlFilters({ search: value })
  }

  function handleCategoryChange(value: string) {
    setFilters((prev) => ({ ...prev, category: value }))
    updateUrlFilters({ category: value })
  }

  function handleStatusChange(value: ServiceFilterStatus) {
    setFilters((prev) => ({ ...prev, status: value }))
    updateUrlFilters({ status: value })
  }

  function clearFilters() {
    setFilters({ search: "", category: "all", status: "all" })
    router.push("/dashboard/vendor/services", { scroll: false })
  }

  function openCreateService() {
    setEditorMode("create")
    setEditingServiceId(null)
    setServiceValues(emptyServiceValues())
    setServiceFieldErrors({})
    setServiceError(null)
    router.push("/dashboard/vendor/services", { scroll: false })
  }

  function openEditService(service: VendorService) {
    setEditorMode("edit")
    setEditingServiceId(service.id)
    setServiceValues(serviceValuesFrom(service))
    setServiceFieldErrors({})
    setServiceError(null)
    router.push(`/dashboard/vendor/services?edit=${service.id}`, { scroll: false })
  }

  function closeServiceEditor() {
    setEditorMode(null)
    setEditingServiceId(null)
    setServiceError(null)
    setServiceFieldErrors({})
    router.push("/dashboard/vendor/services", { scroll: false })
  }

  function updateServiceField<K extends keyof ServiceFormValues>(
    field: K,
    value: ServiceFormValues[K],
  ) {
    setServiceValues((current) => ({ ...current, [field]: value }))
    setServiceFieldErrors((current) => ({ ...current, [field]: undefined }))
    setServiceError(null)
  }

  async function handleServiceSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSavingService || !editorMode) return

    const errors: Partial<Record<keyof ServiceFormValues, string>> = {}
    const images = splitImageUrls(serviceValues.images)
    const price = Number(serviceValues.price)

    if (serviceValues.serviceName.trim().length < 3) {
      errors.serviceName = "Enter a service name with at least 3 characters."
    }
    if (!isVendorBusinessCategory(serviceValues.category)) {
      errors.category = "Choose a service category."
    }
    if (serviceValues.description.trim().length < 20) {
      errors.description = "Describe the service in at least 20 characters."
    }
    if (!serviceValues.price.trim() || !Number.isFinite(price) || price < 0) {
      errors.price = "Enter a valid price."
    }
    if (serviceValues.location.trim().length < 2) {
      errors.location = "Enter the service location."
    }
    if (images.length === 0) {
      errors.images = "Add at least one image URL."
    } else if (images.length > 8) {
      errors.images = "Add no more than 8 image URLs."
    } else if (
      images.some((image) => {
        try {
          const url = new URL(image)
          return url.protocol !== "http:" && url.protocol !== "https:"
        } catch {
          return true
        }
      })
    ) {
      errors.images = "Every image must be a valid http(s) URL."
    }

    setServiceFieldErrors(errors)
    setServiceError(null)

    if (Object.keys(errors).length > 0) return

    setIsSavingService(true)

    const isEdit = editorMode === "edit" && editingServiceId
    const path = isEdit ? `/vendor/services/${editingServiceId}` : "/vendor/services"

    try {
      const response = await apiFetch(path, {
        method: isEdit ? "PATCH" : "POST",
        body: JSON.stringify({
          serviceName: serviceValues.serviceName.trim(),
          category: serviceValues.category,
          description: serviceValues.description.trim(),
          price,
          location: serviceValues.location.trim(),
          images,
        }),
      })

      if (!response.ok) {
        const error =
          (await readApiFieldError(response)) ?? {
            message: await readApiMessage(response, "The service could not be saved."),
          }
        setServiceError(error.message)
        if (error.field) {
          setServiceFieldErrors((current) => ({
            ...current,
            [error.field as keyof ServiceFormValues]: error.message,
          }))
        }
        toast.error("Service not saved", { description: error.message })
        return
      }

      const saved = parseVendorServiceResponse(await response.json())
      if (saved) {
        if (isEdit) {
          setOverrides((current) => ({ ...current, [saved.id]: saved }))
        } else {
          setCreated((current) => [saved, ...current])
        }
      }

      closeServiceEditor()
      toast.success(isEdit ? "Service updated" : "Service submitted", {
        description: "New and edited listings are reviewed by an admin before they go public.",
      })
      router.refresh()
    } catch {
      const message = "Something went wrong while saving the service."
      setServiceError(message)
      toast.error("Service not saved", { description: message })
    } finally {
      setIsSavingService(false)
    }
  }

  async function handleDeleteService(service: VendorService) {
    if (busyServiceId) return
    setDeleteTarget(service)
  }

  async function confirmDelete() {
    if (!deleteTarget || busyServiceId) return

    setBusyServiceId(deleteTarget.id)
    setDeleteTarget(null)

    try {
      const response = await apiFetch(`/vendor/services/${deleteTarget.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const message = await readApiMessage(response, "The service could not be removed.")
        toast.error("Service not removed", { description: message })
        return
      }

      setOverrides((current) => ({
        ...current,
        [deleteTarget.id]: { ...deleteTarget, isActive: false, status: "inactive" },
      }))
      toast.success("Service removed", {
        description: "It no longer appears in public listings.",
      })
      router.refresh()
    } catch {
      toast.error("Service not removed", {
        description: "Please check your connection and try again.",
      })
    } finally {
      setBusyServiceId(null)
    }
  }

  async function handleToggleActive(service: VendorService) {
    if (busyServiceId) return

    const activating = !service.isActive

    setBusyServiceId(service.id)

    try {
      let response: Response
      if (activating) {
         response = await apiFetch(`/vendor/services/${service.id}`, {
           method: "PATCH",
           body: JSON.stringify({ isActive: true }),
         })
      } else {
        response = await apiFetch(`/vendor/services/${service.id}`, {
          method: "DELETE",
        })
      }

      if (!response.ok) {
        const message = await readApiMessage(
          response,
          activating ? "Could not activate service." : "Could not deactivate service.",
        )
        toast.error(activating ? "Service not activated" : "Service not deactivated", {
          description: message,
        })
        return
      }

      const updated = parseVendorServiceResponse(await response.json())
      if (updated) {
        setOverrides((current) => ({ ...current, [updated.id]: updated }))
      }

      toast.success(
        activating ? "Service activated" : "Service deactivated",
        {
          description: activating
            ? "It has been resubmitted for admin approval."
            : "It no longer appears in public listings. You can reactivate it later.",
        },
      )
      router.refresh()
    } catch {
      toast.error(activating ? "Service not activated" : "Service not deactivated", {
        description: "Please check your connection and try again.",
      })
     } finally {
       setBusyServiceId(null)
     }
   }

   const hasActiveFilters =
    filters.search || filters.category !== "all" || filters.status !== "all"

  return (
    <div className="space-y-6">
      {dataError ? (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm text-destructive"
        >
          <p className="font-semibold">Your services could not be loaded.</p>
          <p className="mt-1 text-xs leading-relaxed">
            The protected API rejected the request. Refresh the page or sign in again.
          </p>
        </div>
      ) : null}

      <section className="rounded-[1.75rem] border border-wine-100 bg-white">
        <div className="flex flex-col gap-4 border-b border-wine-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-heading text-xl font-semibold text-wine-900">
              <Store aria-hidden="true" className="size-4 text-wine-600" />
              Your services
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Every new or edited listing is reviewed by an admin before it appears publicly.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!editorMode ? (
              <button type="button" onClick={openCreateService} className={primaryButtonClass}>
                <Plus aria-hidden="true" className="size-4" />
                Add service
              </button>
            ) : null}
          </div>
        </div>

        {editorMode ? (
          <form onSubmit={handleServiceSubmit} noValidate className="space-y-4 border-b border-wine-100 bg-wine-50/40 px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-heading text-lg font-semibold text-wine-900">
                {editorMode === "edit" ? "Edit service" : "New service"}
              </h3>
              <button
                type="button"
                onClick={closeServiceEditor}
                className="rounded-full p-1.5 text-wine-600 transition-colors hover:bg-wine-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
                aria-label="Close service editor"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>

            {serviceError ? (
              <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs text-destructive">
                {serviceError}
              </p>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="vendor-service-name" className={labelClass}>
                  Service name
                </label>
                <input
                  id="vendor-service-name"
                  value={serviceValues.serviceName}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    updateServiceField("serviceName", event.target.value)
                  }
                  maxLength={120}
                  aria-invalid={Boolean(serviceFieldErrors.serviceName)}
                  className={fieldClass}
                />
                {serviceFieldErrors.serviceName ? (
                  <p role="alert" className="mt-1 text-xs text-destructive">
                    {serviceFieldErrors.serviceName}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="vendor-service-category" className={labelClass}>
                  Category
                </label>
                <select
                  id="vendor-service-category"
                  value={serviceValues.category}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                    updateServiceField(
                      "category",
                      isVendorBusinessCategory(event.target.value)
                        ? event.target.value
                        : "Photography & Videography",
                    )
                  }
                  className={selectClass}
                >
                  {VENDOR_BUSINESS_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="vendor-service-price" className={labelClass}>
                  Price (BDT)
                </label>
                <input
                  id="vendor-service-price"
                  type="number"
                  min={0}
                  step="1"
                  value={serviceValues.price}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    updateServiceField("price", event.target.value)
                  }
                  aria-invalid={Boolean(serviceFieldErrors.price)}
                  className={fieldClass}
                />
                {serviceFieldErrors.price ? (
                  <p role="alert" className="mt-1 text-xs text-destructive">
                    {serviceFieldErrors.price}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="vendor-service-location" className={labelClass}>
                  Service location
                </label>
                <input
                  id="vendor-service-location"
                  value={serviceValues.location}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    updateServiceField("location", event.target.value)
                  }
                  maxLength={180}
                  aria-invalid={Boolean(serviceFieldErrors.location)}
                  className={fieldClass}
                />
                {serviceFieldErrors.location ? (
                  <p role="alert" className="mt-1 text-xs text-destructive">
                    {serviceFieldErrors.location}
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <label htmlFor="vendor-service-description" className={labelClass}>
                Description
              </label>
              <textarea
                id="vendor-service-description"
                value={serviceValues.description}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                  updateServiceField("description", event.target.value)
                }
                rows={4}
                maxLength={2000}
                aria-invalid={Boolean(serviceFieldErrors.description)}
                className={textareaClass}
              />
              <div className="mt-1 flex items-start justify-between gap-3">
                {serviceFieldErrors.description ? (
                  <p role="alert" className="text-xs text-destructive">
                    {serviceFieldErrors.description}
                  </p>
                ) : (
                  <span className="text-xs text-muted-foreground">At least 20 characters.</span>
                )}
                <span className="text-[0.7rem] text-muted-foreground">
                  {serviceValues.description.length}/2000
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="vendor-service-images" className={labelClass}>
                Image URLs
              </label>
              <textarea
                id="vendor-service-images"
                value={serviceValues.images}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                  updateServiceField("images", event.target.value)
                }
                rows={3}
                placeholder={"https://example.com/photo-1.jpg\nhttps://example.com/photo-2.jpg"}
                aria-invalid={Boolean(serviceFieldErrors.images)}
                className={textareaClass}
              />
              <div className="mt-1 flex items-start justify-between gap-3">
                {serviceFieldErrors.images ? (
                  <p role="alert" className="text-xs text-destructive">
                    {serviceFieldErrors.images}
                  </p>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    One URL per line. At least one, up to eight.
                  </span>
                )}
                <span className="text-[0.7rem] text-muted-foreground">
                  {splitImageUrls(serviceValues.images).length}/8
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={isSavingService} className={primaryButtonClass}>
                {isSavingService ? (
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                ) : (
                  <Check aria-hidden="true" className="size-4" />
                )}
                {isSavingService
                  ? "Saving…"
                  : editorMode === "edit"
                    ? "Save and resubmit"
                    : "Submit for approval"}
              </button>
              <button
                type="button"
                onClick={closeServiceEditor}
                disabled={isSavingService}
                className={secondaryButtonClass}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        <div className="border-b border-wine-100 px-6 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="services-search" className="sr-only">
                Search services
              </label>
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-wine-400"
                />
                <input
                  id="services-search"
                  type="search"
                  placeholder="Search your services..."
                  value={filters.search}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    handleSearchChange(event.target.value)
                  }
                  className="h-10 w-full sm:w-[280px] rounded-full border border-wine-100 bg-white pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-wine-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
                />
              </div>

              <div className="relative">
                <Filter
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-wine-400"
                />
                <select
                  id="services-category-filter"
                  value={filters.category}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                    handleCategoryChange(event.target.value)
                  }
                  className="h-10 w-[200px] rounded-full border border-wine-100 bg-white pl-10 pr-10 text-sm text-foreground appearance-none focus:border-wine-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
                >
                  <option value="all">All categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-wine-400 pointer-events-none"
                />
              </div>

              <div className="relative">
                <Filter
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-wine-400"
                />
                <select
                  id="services-status-filter"
                  value={filters.status}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                    handleStatusChange(event.target.value as ServiceFilterStatus)
                  }
                  className="h-10 w-[180px] rounded-full border border-wine-100 bg-white pl-10 pr-10 text-sm text-foreground appearance-none focus:border-wine-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
                >
                  {SERVICE_STATUS_FILTERS.map((filter) => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-wine-400 pointer-events-none"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-wine-200 bg-white px-4 text-xs font-semibold text-wine-800 transition-colors hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
              >
                <X aria-hidden="true" className="size-3.5" />
                Clear filters
              </button>
            )}
          </div>
        </div>

        {filteredServices.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-wine-50 text-wine-600 mx-auto">
              <Store aria-hidden="true" className="size-5" />
            </span>
            <p className="mt-3 font-heading text-lg font-semibold text-wine-900">
              {dataError
                ? "Services unavailable"
                : services.length === 0
                  ? "No services yet"
                  : "No services match your filters"}
            </p>
            <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
              {dataError
                ? "Refresh the page or sign in again to reload your catalogue."
                : services.length === 0
                  ? "Create your first listing to start receiving booking requests."
                  : "Try adjusting your search or filters."}
            </p>
            {services.length === 0 && !dataError ? (
              <button
                type="button"
                onClick={openCreateService}
                className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-full bg-burgundy-600 px-4 text-xs font-semibold text-white transition-colors hover:bg-burgundy-700"
              >
                <Plus aria-hidden="true" className="size-3.5" />
                Add Service
              </button>
            ) : null}
          </div>
        ) : (
          <ul role="list" className="divide-y divide-wine-100">
            {filteredServices.map((service) => {
              const isBusy = busyServiceId === service.id
              const canToggle = service.status !== "inactive"

              return (
                <li
                  key={service.id}
                  className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <div
                      aria-hidden="true"
                      className="size-14 shrink-0 rounded-2xl border border-wine-100 bg-wine-50 bg-cover bg-center"
                      style={imageStyle(service.images[0])}
                    >
                      {service.images[0] ? null : (
                        <span className="grid h-full w-full place-items-center text-wine-300">
                          <ImageIcon aria-hidden="true" className="size-5" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-heading text-lg font-semibold text-wine-900">
                          {service.name}
                        </h3>
                        <StatusBadge status={service.status} />
                        {!service.isActive && service.status !== "inactive" ? (
                          <StatusBadge status="inactive" />
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {service.category} · {service.location}
                      </p>
                      <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-relaxed text-foreground/70">
                        {service.description}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <p className="text-sm font-semibold text-wine-800">
                          {formatAmount(service.price)}
                        </p>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-[0.1em] shadow-sm",
                            availabilityTone(service),
                          )}
                        >
                          {serviceAvailabilityLabel(service)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openEditService(service)}
                      disabled={isBusy}
                      className={secondaryButtonClass}
                    >
                      <Pencil aria-hidden="true" className="size-3.5" />
                      Edit
                    </button>
                    {canToggle ? (
                      <button
                        type="button"
                        onClick={() => handleToggleActive(service)}
                        disabled={isBusy}
                        className={cn(
                          "inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                          service.isActive
                            ? "border border-wine-100 bg-[#fdf1f2] text-[#a13a44] hover:bg-[#fbe8ea]"
                            : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                        )}
                      >
                        {isBusy ? (
                          <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
                        ) : (
                          <Power aria-hidden="true" className="size-3.5" />
                        )}
                        {service.isActive ? "Deactivate" : "Activate"}
                      </button>
                    ) : null}
                    {service.isActive ? (
                      <button
                        type="button"
                        onClick={() => handleDeleteService(service)}
                        disabled={isBusy}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-destructive/20 bg-white px-4 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/5 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isBusy ? (
                          <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
                        ) : (
                          <Trash2 aria-hidden="true" className="size-3.5" />
                        )}
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openEditService(service)}
                        disabled={isBusy}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-wine-100 bg-[#fdf1f2] px-4 text-sm font-semibold text-[#a13a44] transition-colors hover:bg-[#fbe8ea] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Power aria-hidden="true" className="size-3.5" />
                        Reactivate
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remove this service?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be removed from your listings. This action cannot be undone.`
            : ""
        }
        confirmLabel="Remove"
        tone="destructive"
        busy={busyServiceId !== null}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={deactivateTarget !== null}
        title="Deactivate this service?"
        description={
          deactivateTarget
            ? `"${deactivateTarget.name}" will stop appearing in public listings. You can reactivate it later by resubmitting it for review.`
            : ""
        }
        confirmLabel="Deactivate"
        tone="destructive"
        busy={busyServiceId !== null}
        onConfirm={() => {
          if (deactivateTarget) void handleToggleActive(deactivateTarget)
        }}
        onCancel={() => setDeactivateTarget(null)}
      />
    </div>
  )
}