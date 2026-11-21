"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import {
  Building2,
  Check,
  Globe2,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Store,
  X,
} from "lucide-react"
import { toast } from "sonner"

import {
  apiFetch,
  readApiFieldError,
  readApiMessage,
} from "@/lib/client-api"
import { parseVendorProfileResponse } from "@/lib/account-data"
import { cn } from "@/lib/utils"
import {
  VENDOR_BUSINESS_CATEGORIES,
  isVendorBusinessCategory,
  type VendorBusinessCategory,
  type VendorProfile,
} from "@/types/vendor"

interface VendorProfileClientProps {
  profile: VendorProfile | null
  vendorName: string
  vendorEmail: string
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

const fieldClass =
  "h-11 w-full rounded-xl border border-wine-100 bg-white px-3.5 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-wine-300 focus:ring-2 focus:ring-wine-100 aria-[invalid=true]:border-destructive/60"

const textareaClass = cn(fieldClass, "h-auto min-h-24 resize-y py-3 leading-relaxed")

const labelClass = "mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground"

const primaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full bg-wine-800 px-4 text-sm font-semibold text-cream-50 transition-colors hover:bg-wine-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-300 disabled:cursor-not-allowed disabled:opacity-60"

const secondaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-wine-200 bg-white px-4 text-sm font-semibold text-wine-800 transition-colors hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200 disabled:cursor-not-allowed disabled:opacity-60"

function valuesFrom(profile: VendorProfile | null): ProfileValues {
  if (!profile) {
    return {
      businessName: "",
      category: "Photography & Videography",
      phone: "",
      location: "",
      website: "",
      description: "",
    }
  }

  return {
    businessName: profile.businessName,
    category: profile.category,
    phone: profile.phone,
    location: profile.location,
    website: profile.website ?? "",
    description: profile.description,
  }
}

export function VendorProfileClient({
  profile,
  vendorName,
  vendorEmail,
  dataError,
}: VendorProfileClientProps) {
  const router = useRouter()
  const [current, setCurrent] = useState<VendorProfile | null>(profile)
  const [isEditing, setIsEditing] = useState(false)
  const [values, setValues] = useState<ProfileValues>(() => valuesFrom(profile))
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ProfileValues, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  function updateField<K extends keyof ProfileValues>(field: K, value: ProfileValues[K]) {
    setValues((previous) => ({ ...previous, [field]: value }))
    setFieldErrors((previous) => ({ ...previous, [field]: undefined }))
    setFormError(null)
  }

  function openEditor() {
    setValues(valuesFrom(current))
    setFieldErrors({})
    setFormError(null)
    setIsEditing(true)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSaving) return

    const errors: Partial<Record<keyof ProfileValues, string>> = {}

    if (values.businessName.trim().length < 2) {
      errors.businessName = "Enter your business name."
    }
    if (!isVendorBusinessCategory(values.category)) {
      errors.category = "Choose a business category."
    }
    if (values.phone.trim().length < 6) {
      errors.phone = "Enter a contact phone number."
    }
    if (values.location.trim().length < 2) {
      errors.location = "Enter your business location."
    }
    if (values.description.trim().length < 20) {
      errors.description = "Describe your business in at least 20 characters."
    }
    if (values.website.trim()) {
      try {
        const url = new URL(values.website.trim())
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          errors.website = "Enter a valid http(s) URL."
        }
      } catch {
        errors.website = "Enter a valid http(s) URL."
      }
    }

    setFieldErrors(errors)
    setFormError(null)
    if (Object.keys(errors).length > 0) return

    setIsSaving(true)

    try {
      const response = await apiFetch("/vendor/profile", {
        method: "PUT",
        body: JSON.stringify({
          businessName: values.businessName.trim(),
          category: values.category,
          phone: values.phone.trim(),
          location: values.location.trim(),
          website: values.website.trim(),
          description: values.description.trim(),
        }),
      })

      if (!response.ok) {
        const error =
          (await readApiFieldError(response)) ?? {
            message: await readApiMessage(response, "Your profile could not be saved."),
          }
        setFormError(error.message)
        if (error.field) {
          setFieldErrors((previous) => ({
            ...previous,
            [error.field as keyof ProfileValues]: error.message,
          }))
        }
        toast.error("Profile not saved", { description: error.message })
        return
      }

      const saved = parseVendorProfileResponse(await response.json())
      if (saved) setCurrent(saved)
      setIsEditing(false)
      toast.success("Business profile saved", {
        description: "Couples will see these details on your vendor profile.",
      })
      router.refresh()
    } catch {
      const message = "Something went wrong while saving your profile."
      setFormError(message)
      toast.error("Profile not saved", { description: message })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {dataError ? (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm text-destructive"
        >
          <p className="font-semibold">Your business profile could not be loaded.</p>
          <p className="mt-1 text-xs leading-relaxed">
            Refresh the page or sign in again before making changes.
          </p>
        </div>
      ) : null}

      <section className="rounded-[1.75rem] border border-wine-100 bg-white p-6 shadow-[0_26px_70px_-60px_rgba(112,19,47,0.7)] sm:p-7">
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
                {current?.businessName ?? "Complete your profile"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {current
                  ? `${current.category} · ${current.location}`
                  : "Add your business details so couples know who they are booking."}
              </p>
            </div>
          </div>

          {!isEditing ? (
            <button type="button" onClick={openEditor} className={secondaryButtonClass}>
              <Pencil aria-hidden="true" className="size-4" />
              {current ? "Edit profile" : "Add details"}
            </button>
          ) : null}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            {formError ? (
              <p
                role="alert"
                className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs text-destructive"
              >
                {formError}
              </p>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="vendor-settings-business" className={labelClass}>
                  <Building2 aria-hidden="true" className="size-3.5 text-wine-500" />
                  Business name
                </label>
                <input
                  id="vendor-settings-business"
                  value={values.businessName}
                  onChange={(event) => updateField("businessName", event.target.value)}
                  maxLength={120}
                  aria-invalid={Boolean(fieldErrors.businessName)}
                  className={fieldClass}
                />
                {fieldErrors.businessName ? (
                  <p role="alert" className="mt-1 text-xs text-destructive">
                    {fieldErrors.businessName}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="vendor-settings-category" className={labelClass}>
                  <Store aria-hidden="true" className="size-3.5 text-wine-500" />
                  Category
                </label>
                <select
                  id="vendor-settings-category"
                  value={values.category}
                  onChange={(event) =>
                    updateField(
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
                <label htmlFor="vendor-settings-phone" className={labelClass}>
                  <Phone aria-hidden="true" className="size-3.5 text-wine-500" />
                  Phone
                </label>
                <input
                  id="vendor-settings-phone"
                  value={values.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  maxLength={25}
                  aria-invalid={Boolean(fieldErrors.phone)}
                  className={fieldClass}
                />
                {fieldErrors.phone ? (
                  <p role="alert" className="mt-1 text-xs text-destructive">
                    {fieldErrors.phone}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="vendor-settings-location" className={labelClass}>
                  <MapPin aria-hidden="true" className="size-3.5 text-wine-500" />
                  Location
                </label>
                <input
                  id="vendor-settings-location"
                  value={values.location}
                  onChange={(event) => updateField("location", event.target.value)}
                  maxLength={180}
                  aria-invalid={Boolean(fieldErrors.location)}
                  className={fieldClass}
                />
                {fieldErrors.location ? (
                  <p role="alert" className="mt-1 text-xs text-destructive">
                    {fieldErrors.location}
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <label htmlFor="vendor-settings-website" className={labelClass}>
                <Globe2 aria-hidden="true" className="size-3.5 text-wine-500" />
                Website <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <input
                id="vendor-settings-website"
                value={values.website}
                onChange={(event) => updateField("website", event.target.value)}
                placeholder="https://your-studio.com"
                aria-invalid={Boolean(fieldErrors.website)}
                className={fieldClass}
              />
              {fieldErrors.website ? (
                <p role="alert" className="mt-1 text-xs text-destructive">
                  {fieldErrors.website}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="vendor-settings-description" className={labelClass}>
                About your business
              </label>
              <textarea
                id="vendor-settings-description"
                value={values.description}
                onChange={(event) => updateField("description", event.target.value)}
                rows={4}
                maxLength={2000}
                aria-invalid={Boolean(fieldErrors.description)}
                className={textareaClass}
              />
              <div className="mt-1 flex items-start justify-between gap-3">
                {fieldErrors.description ? (
                  <p role="alert" className="text-xs text-destructive">
                    {fieldErrors.description}
                  </p>
                ) : (
                  <span className="text-xs text-muted-foreground">At least 20 characters.</span>
                )}
                <span className="text-[0.7rem] text-muted-foreground">
                  {values.description.length}/2000
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={isSaving} className={primaryButtonClass}>
                {isSaving ? (
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                ) : (
                  <Check aria-hidden="true" className="size-4" />
                )}
                {isSaving ? "Saving…" : "Save profile"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className={secondaryButtonClass}
              >
                <X aria-hidden="true" className="size-4" />
                Cancel
              </button>
            </div>
          </form>
        ) : current ? (
          <dl className="mt-6 grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Phone aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-wine-500" />
              <div>
                <dt className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Phone
                </dt>
                <dd className="mt-0.5 text-foreground/80">{current.phone}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-wine-500" />
              <div>
                <dt className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Contact email
                </dt>
                <dd className="mt-0.5 break-all text-foreground/80">{current.contactEmail}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-wine-500" />
              <div>
                <dt className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Location
                </dt>
                <dd className="mt-0.5 text-foreground/80">{current.location}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-wine-500" />
              <div>
                <dt className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Website
                </dt>
                <dd className="mt-0.5 break-all text-foreground/80">
                  {current.website ? (
                    <a
                      href={current.website}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="font-semibold text-wine-700 underline decoration-wine-300 underline-offset-4"
                    >
                      {current.website}
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
                {current.description}
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

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-wine-100 bg-white p-5">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-wine-500">
            Account owner
          </p>
          <p className="mt-2 truncate text-sm font-semibold text-wine-900">{vendorName}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{vendorEmail}</p>
        </div>
        <div className="rounded-2xl border border-wine-100 bg-white p-5">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-wine-500">
            Business category
          </p>
          <p className="mt-2 text-sm font-semibold text-wine-900">
            {current?.category ?? "Not set"}
          </p>
        </div>
        <div className="rounded-2xl border border-gold-300/60 bg-cream-50 p-5">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-wine-700">
            Public profile
          </p>
          <p className="mt-2 text-xs leading-relaxed text-foreground/75">
            Business details are shown to couples on your public vendor page.
          </p>
        </div>
      </section>
    </div>
  )
}
