"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import {
  Building2,
  CalendarDays,
  Check,
  Globe2,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Store,
  Trash2,
  UserRound,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { StatusBadge } from "@/components/account/status-badge"
import {
  apiFetch,
  readApiFieldError,
  readApiMessage,
} from "@/lib/client-api"
import {
  parseBookingResponse,
  parseVendorProfileResponse,
  parseVendorServiceResponse,
} from "@/lib/account-data"
import { formatAmount } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Booking } from "@/types/booking"
import {
  VENDOR_BUSINESS_CATEGORIES,
  isVendorBusinessCategory,
  type VendorBusinessCategory,
  type VendorProfile,
  type VendorService,
} from "@/types/vendor"

interface VendorWorkspaceProps {
  vendorName: string
  vendorEmail: string
  initialProfile: VendorProfile | null
  initialServices: VendorService[]
  initialBookings: Booking[]
  dataError: boolean
}

interface ProfileValues {
  businessName: string
  category: VendorBusinessCategory
  phone: string
  location: string
  website: string
  description: string
}

interface ServiceValues {
  serviceName: string
  category: VendorBusinessCategory
  description: string
  price: string
  location: string
  images: string
}

const fieldClass =
  "h-11 w-full rounded-xl border border-wine-100 bg-white px-3.5 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-wine-300 focus:ring-2 focus:ring-wine-100 aria-[invalid=true]:border-destructive/60"

const textareaClass = cn(fieldClass, "h-auto min-h-24 resize-y py-3 leading-relaxed")

const labelClass = "mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground"

const primaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full bg-wine-800 px-4 text-sm font-semibold text-cream-50 transition-colors hover:bg-wine-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-300 disabled:cursor-not-allowed disabled:opacity-60"

const secondaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-wine-200 bg-white px-4 text-sm font-semibold text-wine-800 transition-colors hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200 disabled:cursor-not-allowed disabled:opacity-60"

function emptyProfileValues(): ProfileValues {
  return {
    businessName: "",
    category: "Photography & Videography",
    phone: "",
    location: "",
    website: "",
    description: "",
  }
}

function profileValuesFrom(profile: VendorProfile | null): ProfileValues {
  if (!profile) return emptyProfileValues()

  return {
    businessName: profile.businessName,
    category: profile.category,
    phone: profile.phone,
    location: profile.location,
    website: profile.website ?? "",
    description: profile.description,
  }
}

function emptyServiceValues(): ServiceValues {
  return {
    serviceName: "",
    category: "Photography & Videography",
    description: "",
    price: "",
    location: "",
    images: "",
  }
}

function serviceValuesFrom(service: VendorService): ServiceValues {
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

function formatEventDate(value: string): string {
  const date = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

export function VendorWorkspace({
  vendorName,
  vendorEmail,
  initialProfile,
  initialServices,
  initialBookings,
  dataError,
}: VendorWorkspaceProps) {
  const router = useRouter()
  const [profile, setProfile] = useState<VendorProfile | null>(initialProfile)
  const [services, setServices] = useState<VendorService[]>(initialServices)
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileValues, setProfileValues] = useState<ProfileValues>(
    profileValuesFrom(initialProfile),
  )
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileFieldErrors, setProfileFieldErrors] = useState<Partial<Record<keyof ProfileValues, string>>>({})
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [serviceValues, setServiceValues] = useState<ServiceValues>(emptyServiceValues())
  const [serviceError, setServiceError] = useState<string | null>(null)
  const [serviceFieldErrors, setServiceFieldErrors] = useState<Partial<Record<keyof ServiceValues, string>>>({})
  const [isSavingService, setIsSavingService] = useState(false)
  const [busyServiceId, setBusyServiceId] = useState<string | null>(null)

  const [busyBookingId, setBusyBookingId] = useState<string | null>(null)

  const pendingBookings = bookings.filter((booking) => booking.status === "pending").length
  const approvedServices = services.filter((service) => service.status === "approved").length

  function openProfileEditor() {
    setProfileValues(profileValuesFrom(profile))
    setProfileFieldErrors({})
    setProfileError(null)
    setIsEditingProfile(true)
  }

  function updateProfileField<K extends keyof ProfileValues>(field: K, value: ProfileValues[K]) {
    setProfileValues((current) => ({ ...current, [field]: value }))
    setProfileFieldErrors((current) => ({ ...current, [field]: undefined }))
    setProfileError(null)
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSavingProfile) return

    const errors: Partial<Record<keyof ProfileValues, string>> = {}

    if (profileValues.businessName.trim().length < 2) {
      errors.businessName = "Enter your business name."
    }
    if (!isVendorBusinessCategory(profileValues.category)) {
      errors.category = "Choose a business category."
    }
    if (profileValues.phone.trim().length < 6) {
      errors.phone = "Enter a contact phone number."
    }
    if (profileValues.location.trim().length < 2) {
      errors.location = "Enter your business location."
    }
    if (profileValues.description.trim().length < 20) {
      errors.description = "Describe your business in at least 20 characters."
    }
    if (profileValues.website.trim()) {
      try {
        const url = new URL(profileValues.website.trim())
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          errors.website = "Enter a valid http(s) URL."
        }
      } catch {
        errors.website = "Enter a valid http(s) URL."
      }
    }

    setProfileFieldErrors(errors)
    setProfileError(null)

    if (Object.keys(errors).length > 0) return

    setIsSavingProfile(true)

    try {
      const response = await apiFetch("/vendor/profile", {
        method: "PUT",
        body: JSON.stringify({
          businessName: profileValues.businessName.trim(),
          category: profileValues.category,
          phone: profileValues.phone.trim(),
          location: profileValues.location.trim(),
          website: profileValues.website.trim(),
          description: profileValues.description.trim(),
        }),
      })

      if (!response.ok) {
        const error =
          (await readApiFieldError(response)) ?? {
            message: await readApiMessage(response, "Your profile could not be saved."),
          }
        setProfileError(error.message)
        if (error.field) {
          setProfileFieldErrors((current) => ({ ...current, [error.field as keyof ProfileValues]: error.message }))
        }
        toast.error("Profile not saved", { description: error.message })
        return
      }

      const saved = parseVendorProfileResponse(await response.json())
      if (saved) setProfile(saved)
      setIsEditingProfile(false)
      toast.success("Business profile saved", {
        description: "Couples will see these details on your vendor profile.",
      })
      router.refresh()
    } catch {
      const message = "Something went wrong while saving your profile."
      setProfileError(message)
      toast.error("Profile not saved", { description: message })
    } finally {
      setIsSavingProfile(false)
    }
  }

  function openCreateService() {
    setEditorMode("create")
    setEditingServiceId(null)
    setServiceValues(emptyServiceValues())
    setServiceFieldErrors({})
    setServiceError(null)
  }

  function openEditService(service: VendorService) {
    setEditorMode("edit")
    setEditingServiceId(service.id)
    setServiceValues(serviceValuesFrom(service))
    setServiceFieldErrors({})
    setServiceError(null)
  }

  function closeServiceEditor() {
    setEditorMode(null)
    setEditingServiceId(null)
    setServiceError(null)
    setServiceFieldErrors({})
  }

  function updateServiceField<K extends keyof ServiceValues>(field: K, value: ServiceValues[K]) {
    setServiceValues((current) => ({ ...current, [field]: value }))
    setServiceFieldErrors((current) => ({ ...current, [field]: undefined }))
    setServiceError(null)
  }

  async function handleServiceSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSavingService || !editorMode) return

    const errors: Partial<Record<keyof ServiceValues, string>> = {}
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
            [error.field as keyof ServiceValues]: error.message,
          }))
        }
        toast.error("Service not saved", { description: error.message })
        return
      }

      const saved = parseVendorServiceResponse(await response.json())
      if (saved) {
        setServices((current) =>
          isEdit
            ? current.map((service) => (service.id === saved.id ? saved : service))
            : [saved, ...current],
        )
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
    if (!window.confirm(`Remove "${service.name}" from your public listings?`)) return

    setBusyServiceId(service.id)

    try {
      const response = await apiFetch(`/vendor/services/${service.id}`, { method: "DELETE" })

      if (!response.ok) {
        const message = await readApiMessage(response, "The service could not be removed.")
        toast.error("Service not removed", { description: message })
        return
      }

      setServices((current) =>
        current.map((entry) =>
          entry.id === service.id
            ? { ...entry, isActive: false, status: "inactive" }
            : entry,
        ),
      )
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

  async function updateBookingStatus(booking: Booking, status: "accepted" | "declined" | "completed") {
    if (busyBookingId) return
    setBusyBookingId(booking.id)

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
        setBookings((current) =>
          current.map((entry) => (entry.id === updated.id ? updated : entry)),
        )
      }

      toast.success(`Booking ${status}`, {
        description: `${booking.customerName} will see the updated status in their dashboard.`,
      })
      router.refresh()
    } catch {
      toast.error("Booking not updated", {
        description: "Please check your connection and try again.",
      })
    } finally {
      setBusyBookingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {dataError ? (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm text-destructive"
        >
          <p className="font-semibold">Some vendor data could not be loaded.</p>
          <p className="mt-1 text-xs leading-relaxed">
            The protected API rejected part of this request. Refresh the page or sign in again.
          </p>
        </div>
      ) : null}

      <section className="rounded-[1.75rem] border border-wine-100 bg-white p-6 shadow-[0_24px_60px_-55px_rgba(79,14,37,0.5)] sm:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex min-w-0 items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-wine-50 text-wine-700">
              <Store aria-hidden="true" className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-wine-500">
                Business profile
              </p>
              <h2 className="mt-1 font-heading text-2xl font-semibold text-wine-900">
                {profile?.businessName ?? "Complete your profile"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {profile
                  ? `${profile.category} · ${profile.location}`
                  : "Add your business details so couples know who they are booking."}
              </p>
            </div>
          </div>

          {!isEditingProfile ? (
            <button type="button" onClick={openProfileEditor} className={secondaryButtonClass}>
              <Pencil aria-hidden="true" className="size-4" />
              {profile ? "Edit profile" : "Add details"}
            </button>
          ) : null}
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleProfileSubmit} noValidate className="mt-6 space-y-4">
            {profileError ? (
              <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs text-destructive">
                {profileError}
              </p>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="vendor-profile-business" className={labelClass}>
                  <Building2 aria-hidden="true" className="size-3.5 text-wine-500" />
                  Business name
                </label>
                <input
                  id="vendor-profile-business"
                  value={profileValues.businessName}
                  onChange={(event) => updateProfileField("businessName", event.target.value)}
                  maxLength={120}
                  aria-invalid={Boolean(profileFieldErrors.businessName)}
                  className={fieldClass}
                />
                {profileFieldErrors.businessName ? (
                  <p role="alert" className="mt-1 text-xs text-destructive">
                    {profileFieldErrors.businessName}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="vendor-profile-category" className={labelClass}>
                  <Store aria-hidden="true" className="size-3.5 text-wine-500" />
                  Category
                </label>
                <select
                  id="vendor-profile-category"
                  value={profileValues.category}
                  onChange={(event) =>
                    updateProfileField(
                      "category",
                      isVendorBusinessCategory(event.target.value)
                        ? event.target.value
                        : "Photography & Videography",
                    )
                  }
                  className={fieldClass}
                >
                  {VENDOR_BUSINESS_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="vendor-profile-phone" className={labelClass}>
                  <Phone aria-hidden="true" className="size-3.5 text-wine-500" />
                  Phone
                </label>
                <input
                  id="vendor-profile-phone"
                  value={profileValues.phone}
                  onChange={(event) => updateProfileField("phone", event.target.value)}
                  maxLength={25}
                  aria-invalid={Boolean(profileFieldErrors.phone)}
                  className={fieldClass}
                />
                {profileFieldErrors.phone ? (
                  <p role="alert" className="mt-1 text-xs text-destructive">
                    {profileFieldErrors.phone}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="vendor-profile-location" className={labelClass}>
                  <MapPin aria-hidden="true" className="size-3.5 text-wine-500" />
                  Location
                </label>
                <input
                  id="vendor-profile-location"
                  value={profileValues.location}
                  onChange={(event) => updateProfileField("location", event.target.value)}
                  maxLength={180}
                  aria-invalid={Boolean(profileFieldErrors.location)}
                  className={fieldClass}
                />
                {profileFieldErrors.location ? (
                  <p role="alert" className="mt-1 text-xs text-destructive">
                    {profileFieldErrors.location}
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <label htmlFor="vendor-profile-website" className={labelClass}>
                <Globe2 aria-hidden="true" className="size-3.5 text-wine-500" />
                Website <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <input
                id="vendor-profile-website"
                value={profileValues.website}
                onChange={(event) => updateProfileField("website", event.target.value)}
                placeholder="https://your-studio.com"
                aria-invalid={Boolean(profileFieldErrors.website)}
                className={fieldClass}
              />
              {profileFieldErrors.website ? (
                <p role="alert" className="mt-1 text-xs text-destructive">
                  {profileFieldErrors.website}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="vendor-profile-description" className={labelClass}>
                About your business
              </label>
              <textarea
                id="vendor-profile-description"
                value={profileValues.description}
                onChange={(event) => updateProfileField("description", event.target.value)}
                rows={4}
                maxLength={2000}
                aria-invalid={Boolean(profileFieldErrors.description)}
                className={textareaClass}
              />
              <div className="mt-1 flex items-start justify-between gap-3">
                {profileFieldErrors.description ? (
                  <p role="alert" className="text-xs text-destructive">
                    {profileFieldErrors.description}
                  </p>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    At least 20 characters.
                  </span>
                )}
                <span className="text-[0.7rem] text-muted-foreground">
                  {profileValues.description.length}/2000
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={isSavingProfile} className={primaryButtonClass}>
                {isSavingProfile ? (
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                ) : (
                  <Check aria-hidden="true" className="size-4" />
                )}
                {isSavingProfile ? "Saving…" : "Save profile"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                disabled={isSavingProfile}
                className={secondaryButtonClass}
              >
                <X aria-hidden="true" className="size-4" />
                Cancel
              </button>
            </div>
          </form>
        ) : profile ? (
          <dl className="mt-6 grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Phone aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-wine-500" />
              <div>
                <dt className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Phone
                </dt>
                <dd className="mt-0.5 text-foreground/80">{profile.phone}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-wine-500" />
              <div>
                <dt className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Contact email
                </dt>
                <dd className="mt-0.5 break-all text-foreground/80">{profile.contactEmail}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-wine-500" />
              <div>
                <dt className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Location
                </dt>
                <dd className="mt-0.5 text-foreground/80">{profile.location}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-wine-500" />
              <div>
                <dt className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Website
                </dt>
                <dd className="mt-0.5 break-all text-foreground/80">
                  {profile.website ? (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="font-semibold text-wine-700 underline decoration-wine-300 underline-offset-4"
                    >
                      {profile.website}
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </dd>
              </div>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                About
              </dt>
              <dd className="mt-1 whitespace-pre-line leading-relaxed text-foreground/80">
                {profile.description}
              </dd>
            </div>
          </dl>
        ) : (
          <div className="mt-6 rounded-2xl border border-gold-300/60 bg-cream-50 px-4 py-3.5 text-xs leading-relaxed text-foreground/75">
            <p className="font-semibold text-wine-900">Signed in as {vendorName}</p>
            <p className="mt-1">
              Your account exists but no business profile was found. Add your details to complete
              vendor onboarding. Account email: {vendorEmail}.
            </p>
          </div>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-wine-100 bg-white p-5">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-wine-500">
            Listings
          </p>
          <p className="mt-2 font-heading text-3xl font-semibold text-wine-900">{services.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">{approvedServices} approved</p>
        </div>
        <div className="rounded-2xl border border-wine-100 bg-white p-5">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-wine-500">
            Booking requests
          </p>
          <p className="mt-2 font-heading text-3xl font-semibold text-wine-900">{bookings.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">{pendingBookings} awaiting your reply</p>
        </div>
        <div className="rounded-2xl border border-gold-300/60 bg-cream-50 p-5">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-wine-700">
            Account owner
          </p>
          <p className="mt-2 flex items-center gap-2 truncate text-sm font-semibold text-wine-900">
            <UserRound aria-hidden="true" className="size-4 shrink-0" />
            {vendorName}
          </p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{vendorEmail}</p>
        </div>
      </div>

      <section className="overflow-hidden rounded-[1.75rem] border border-wine-100 bg-white">
        <div className="flex flex-col justify-between gap-3 border-b border-wine-100 px-6 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 font-heading text-xl font-semibold text-wine-900">
              <Store aria-hidden="true" className="size-4 text-wine-600" />
              Your services
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Every new or edited listing is reviewed by an admin before it appears publicly.
            </p>
          </div>
          {!editorMode ? (
            <button type="button" onClick={openCreateService} className={primaryButtonClass}>
              <Plus aria-hidden="true" className="size-4" />
              Add service
            </button>
          ) : null}
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
                  onChange={(event) => updateServiceField("serviceName", event.target.value)}
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
                  onChange={(event) =>
                    updateServiceField(
                      "category",
                      isVendorBusinessCategory(event.target.value)
                        ? event.target.value
                        : "Photography & Videography",
                    )
                  }
                  className={fieldClass}
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
                  onChange={(event) => updateServiceField("price", event.target.value)}
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
                  onChange={(event) => updateServiceField("location", event.target.value)}
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
                onChange={(event) => updateServiceField("description", event.target.value)}
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
                onChange={(event) => updateServiceField("images", event.target.value)}
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

        {services.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">
            You have not added any services yet. Create your first listing to start receiving
            booking requests.
          </p>
        ) : (
          <ul role="list" className="divide-y divide-wine-100">
            {services.map((service) => (
              <li key={service.id} className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div
                    aria-hidden="true"
                    className="size-14 shrink-0 rounded-2xl border border-wine-100 bg-wine-50 bg-cover bg-center"
                    style={
                      service.images[0]
                        ? { backgroundImage: `url("${service.images[0].replace(/"/g, "%22")}")` }
                        : undefined
                    }
                  />
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
                    <p className="mt-2 text-sm font-semibold text-wine-800">
                      {formatAmount(service.price)}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openEditService(service)}
                    className={secondaryButtonClass}
                  >
                    <Pencil aria-hidden="true" className="size-3.5" />
                    Edit
                  </button>
                  {service.isActive ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteService(service)}
                      disabled={busyServiceId === service.id}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-destructive/20 bg-white px-4 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busyServiceId === service.id ? (
                        <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 aria-hidden="true" className="size-3.5" />
                      )}
                      Remove
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-wine-100 bg-white">
        <div className="border-b border-wine-100 px-6 py-4">
          <h2 className="flex items-center gap-2 font-heading text-xl font-semibold text-wine-900">
            <CalendarDays aria-hidden="true" className="size-4 text-wine-600" />
            Incoming booking requests
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Accept or decline requests, then mark the booking completed once the event is done.
          </p>
        </div>

        {bookings.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">
            No booking requests yet. Once a customer requests one of your approved services, it
            will appear here.
          </p>
        ) : (
          <ul role="list" className="divide-y divide-wine-100">
            {bookings.map((booking) => (
              <li key={booking.id} className="px-6 py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading text-lg font-semibold text-wine-900">
                        {booking.serviceName}
                      </h3>
                      <StatusBadge status={booking.status} />
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays aria-hidden="true" className="size-3.5" />
                        {formatEventDate(booking.eventDate)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin aria-hidden="true" className="size-3.5" />
                        {booking.eventLocation}
                      </span>
                    </p>
                    <p className="mt-2 text-sm text-foreground/75">
                      <span className="font-semibold text-wine-900">{booking.customerName}</span>
                      {booking.customerEmail ? ` · ${booking.customerEmail}` : ""}
                    </p>
                    {booking.message ? (
                      <p className="mt-2 max-w-2xl whitespace-pre-line rounded-xl bg-wine-50/70 px-3.5 py-2.5 text-xs leading-relaxed text-foreground/70">
                        {booking.message}
                      </p>
                    ) : null}
                    <p className="mt-2 text-sm font-semibold text-wine-800">
                      {formatAmount(booking.price)}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    {booking.status === "pending" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => updateBookingStatus(booking, "accepted")}
                          disabled={busyBookingId === booking.id}
                          className={primaryButtonClass}
                        >
                          {busyBookingId === booking.id ? (
                            <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
                          ) : (
                            <Check aria-hidden="true" className="size-3.5" />
                          )}
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => updateBookingStatus(booking, "declined")}
                          disabled={busyBookingId === booking.id}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-destructive/20 bg-white px-4 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/5 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <X aria-hidden="true" className="size-3.5" />
                          Decline
                        </button>
                      </>
                    ) : null}

                    {booking.status === "accepted" ? (
                      <button
                        type="button"
                        onClick={() => updateBookingStatus(booking, "completed")}
                        disabled={busyBookingId === booking.id}
                        className={secondaryButtonClass}
                      >
                        {busyBookingId === booking.id ? (
                          <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
                        ) : (
                          <Check aria-hidden="true" className="size-3.5" />
                        )}
                        Mark completed
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
