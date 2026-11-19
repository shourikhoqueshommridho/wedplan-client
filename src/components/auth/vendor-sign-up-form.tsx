"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  AlignLeft,
  ArrowRight,
  Building2,
  Check,
  Globe2,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Store,
  UserRound,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { AuthPasswordField, AuthTextField } from "@/components/auth/auth-fields"
import {
  authInputPlainClass,
  authLabelClass,
  authPrimaryButtonClass,
  authSecondaryButtonClass,
} from "@/components/auth/auth-styles"
import { GoogleIcon } from "@/components/auth/google-icon"
import { authClient } from "@/lib/auth-client"
import { apiFetch, readApiFieldError } from "@/lib/client-api"
import { cn } from "@/lib/utils"
import {
  VENDOR_BUSINESS_CATEGORIES,
  isVendorBusinessCategory,
  type VendorBusinessCategory,
} from "@/types/vendor"

interface VendorSignUpFormProps {
  next: string
  oauthError?: string
}

interface VendorSignUpValues {
  name: string
  email: string
  password: string
  confirmPassword: string
  businessName: string
  category: VendorBusinessCategory
  phone: string
  location: string
  website: string
  description: string
}

type VendorSignUpErrors = Partial<Record<keyof VendorSignUpValues | "terms", string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_PATTERN = /^[+()\d\s-]+$/
const NAME_MAX = 80
const BUSINESS_MAX = 120

function passwordChecks(password: string) {
  return {
    length: password.length >= 8,
    letter: /[a-zA-Z]/.test(password),
    number: /\d/.test(password),
  }
}

function isOptionalUrl(value: string): boolean {
  if (!value.trim()) return true

  try {
    const url = new URL(value.trim())
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

function validateBusiness(values: VendorSignUpValues): VendorSignUpErrors {
  const errors: VendorSignUpErrors = {}

  if (values.businessName.trim().length < 2) {
    errors.businessName = "Enter your business name."
  } else if (values.businessName.trim().length > BUSINESS_MAX) {
    errors.businessName = `Keep the business name under ${BUSINESS_MAX} characters.`
  }

  if (!isVendorBusinessCategory(values.category)) {
    errors.category = "Choose a business category."
  }

  if (!values.phone.trim()) {
    errors.phone = "Enter a contact phone number."
  } else if (values.phone.trim().length < 6 || !PHONE_PATTERN.test(values.phone.trim())) {
    errors.phone = "Enter a valid phone number."
  }

  if (values.location.trim().length < 2) {
    errors.location = "Enter your business location."
  } else if (values.location.trim().length > 180) {
    errors.location = "Keep the location under 180 characters."
  }

  if (!isOptionalUrl(values.website)) {
    errors.website = "Enter a valid http(s) URL, or leave this blank."
  }

  if (values.description.trim().length < 20) {
    errors.description = "Describe your business in at least 20 characters."
  } else if (values.description.trim().length > 2000) {
    errors.description = "Keep the description under 2,000 characters."
  }

  return errors
}

function validateAccount(values: VendorSignUpValues): VendorSignUpErrors {
  const errors: VendorSignUpErrors = {}
  const checks = passwordChecks(values.password)

  if (values.name.trim().length < 2) {
    errors.name = "Enter your full name."
  } else if (values.name.trim().length > NAME_MAX) {
    errors.name = `Keep your name under ${NAME_MAX} characters.`
  }

  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Enter a valid email address."
  }

  if (!checks.length) {
    errors.password = "Use at least 8 characters."
  } else if (!checks.letter) {
    errors.password = "Include at least one letter."
  } else if (!checks.number) {
    errors.password = "Include at least one number."
  }

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords do not match."
  }

  return errors
}

function businessPayload(values: VendorSignUpValues) {
  return {
    businessName: values.businessName.trim(),
    category: values.category,
    phone: values.phone.trim(),
    location: values.location.trim(),
    website: values.website.trim(),
    description: values.description.trim(),
  }
}

const FIELD_KEYS = new Set<string>([
  "name",
  "email",
  "password",
  "confirmPassword",
  "businessName",
  "category",
  "phone",
  "location",
  "website",
  "description",
])

export function VendorSignUpForm({ next, oauthError }: VendorSignUpFormProps) {
  const router = useRouter()
  const [values, setValues] = useState<VendorSignUpValues>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    category: "Photography & Videography",
    phone: "",
    location: "",
    website: "",
    description: "",
  })
  const [errors, setErrors] = useState<VendorSignUpErrors>({})
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [formError, setFormError] = useState<string | null>(
    oauthError
      ? "Google vendor sign-up was cancelled or could not be completed. If you already have a customer account with that email, sign in instead of creating a vendor account."
      : null,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const checks = passwordChecks(values.password)

  function updateField<K extends keyof VendorSignUpValues>(field: K, value: VendorSignUpValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setFormError(null)
  }

  function validateField(field: keyof VendorSignUpValues) {
    const nextErrors = { ...validateBusiness(values), ...validateAccount(values) }
    setErrors((current) => ({ ...current, [field]: nextErrors[field] }))
  }

  function applyServerError(error: { field?: string; message: string }) {
    setFormError(error.message)

    if (error.field && FIELD_KEYS.has(error.field)) {
      setErrors((current) => ({ ...current, [error.field as keyof VendorSignUpValues]: error.message }))
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting || isGoogleLoading) return

    const nextErrors = { ...validateBusiness(values), ...validateAccount(values) }
    if (!acceptedTerms) nextErrors.terms = "Please accept the terms to create a vendor account."

    setErrors(nextErrors)
    setFormError(null)

    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)

    try {
      const response = await apiFetch("/account/vendor/register", {
        method: "POST",
        body: JSON.stringify({
          ...businessPayload(values),
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          password: values.password,
        }),
      })

      if (!response.ok) {
        const error =
          (await readApiFieldError(response)) ?? {
            message: "We could not create your vendor account. Please try again.",
          }
        applyServerError(error)
        toast.error("Vendor registration failed", { description: error.message })
        return
      }

      toast.success("Vendor account created", {
        description: "You are signed in and can start adding your services.",
      })
      router.replace(next)
      router.refresh()
    } catch {
      const message = "Something went wrong while creating your vendor account."
      setFormError(message)
      toast.error("Vendor registration failed", { description: message })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleGoogleSignUp() {
    if (isSubmitting || isGoogleLoading) return

    const nextErrors = validateBusiness(values)
    if (!acceptedTerms) nextErrors.terms = "Please accept the terms to create a vendor account."

    setErrors(nextErrors)
    setFormError(null)

    if (Object.keys(nextErrors).length > 0) {
      toast.info("Complete your business details", {
        description: "Add your business information before continuing with Google.",
      })
      return
    }

    setIsGoogleLoading(true)

    try {
      const intentResponse = await apiFetch("/account/vendor/intent", {
        method: "POST",
        body: JSON.stringify(businessPayload(values)),
      })

      if (!intentResponse.ok) {
        const error =
          (await readApiFieldError(intentResponse)) ?? {
            message: "The vendor details could not be prepared for Google sign-up.",
          }
        applyServerError(error)
        toast.error("Google sign-up could not start", { description: error.message })
        setIsGoogleLoading(false)
        return
      }

      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/vendor/welcome",
        newUserCallbackURL: "/vendor/welcome",
        errorCallbackURL: "/vendor/sign-up?error=google",
      })

      if (error) {
        toast.error("Google sign-up could not be started", {
          description:
            error.message || "Google authentication is not configured correctly on this server.",
        })
        setIsGoogleLoading(false)
      }
    } catch {
      toast.error("Google sign-up is unavailable", {
        description: "Please try again in a moment or use your email address.",
      })
      setIsGoogleLoading(false)
    }
  }

  const selectClass = cn(authInputPlainClass, "appearance-none pr-4")

  return (
    <div>
      {formError ? (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs leading-relaxed text-destructive"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{formError}</span>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="flex items-start gap-2.5 rounded-2xl border border-gold-300/60 bg-cream-50 px-4 py-3 text-[0.7rem] leading-relaxed text-foreground/75">
          <Store aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-wine-600" />
          <p>
            <span className="font-semibold text-wine-900">Vendor accounts are free to create.</span>{" "}
            Your account is approved instantly; each service listing is reviewed separately before
            it appears publicly.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <AuthTextField
            id="vendor-name"
            label="Your full name"
            type="text"
            value={values.name}
            onChange={(event) => updateField("name", event.target.value)}
            onBlur={() => validateField("name")}
            error={errors.name}
            placeholder="Your full name"
            autoComplete="name"
            icon={UserRound}
            requiredMark
            maxLength={NAME_MAX}
          />

          <AuthTextField
            id="vendor-business-name"
            label="Business name"
            type="text"
            value={values.businessName}
            onChange={(event) => updateField("businessName", event.target.value)}
            onBlur={() => validateField("businessName")}
            error={errors.businessName}
            placeholder="e.g. Dream Lens Studio"
            autoComplete="organization"
            icon={Building2}
            requiredMark
            maxLength={BUSINESS_MAX}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <AuthTextField
            id="vendor-email"
            label="Email address"
            type="email"
            value={values.email}
            onChange={(event) => updateField("email", event.target.value)}
            onBlur={() => validateField("email")}
            error={errors.email}
            placeholder="name@example.com"
            autoComplete="email"
            inputMode="email"
            icon={Mail}
            requiredMark
          />

          <AuthTextField
            id="vendor-phone"
            label="Business phone"
            type="tel"
            value={values.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            onBlur={() => validateField("phone")}
            error={errors.phone}
            placeholder="+880 1700 000000"
            autoComplete="tel"
            inputMode="tel"
            icon={Phone}
            requiredMark
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="vendor-category" className={authLabelClass}>
              Business category <span className="ml-0.5 text-wine-500">*</span>
            </label>
            <div className="relative">
              <Store
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 size-[1.05rem] -translate-y-1/2 text-wine-400"
              />
              <select
                id="vendor-category"
                value={values.category}
                onChange={(event) =>
                  updateField(
                    "category",
                    isVendorBusinessCategory(event.target.value)
                      ? event.target.value
                      : "Photography & Videography",
                  )
                }
                onBlur={() => validateField("category")}
                aria-invalid={Boolean(errors.category)}
                className={selectClass}
              >
                {VENDOR_BUSINESS_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            {errors.category ? (
              <p role="alert" className="mt-1.5 text-xs font-medium text-destructive">
                {errors.category}
              </p>
            ) : null}
          </div>

          <AuthTextField
            id="vendor-location"
            label="Business location"
            type="text"
            value={values.location}
            onChange={(event) => updateField("location", event.target.value)}
            onBlur={() => validateField("location")}
            error={errors.location}
            placeholder="City, country"
            autoComplete="address-level2"
            icon={MapPin}
            requiredMark
            maxLength={180}
          />
        </div>

        <AuthTextField
          id="vendor-website"
          label="Website"
          type="url"
          value={values.website}
          onChange={(event) => updateField("website", event.target.value)}
          onBlur={() => validateField("website")}
          error={errors.website}
          placeholder="https://your-studio.com"
          autoComplete="url"
          icon={Globe2}
          hint="Optional. Add a portfolio or business website."
        />

        <div>
          <label htmlFor="vendor-description" className={authLabelClass}>
            About your business <span className="ml-0.5 text-wine-500">*</span>
          </label>
          <div className="relative">
            <AlignLeft
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-3.5 size-[1.05rem] text-wine-400"
            />
            <textarea
              id="vendor-description"
              rows={4}
              value={values.description}
              onChange={(event) => updateField("description", event.target.value)}
              onBlur={() => validateField("description")}
              placeholder="Tell couples about your style, experience and the services you offer."
              aria-invalid={Boolean(errors.description)}
              maxLength={2000}
              className={cn(
                authInputPlainClass,
                "h-auto min-h-28 resize-y py-3 leading-relaxed",
              )}
            />
          </div>
          <div className="mt-1.5 flex items-start justify-between gap-3">
            {errors.description ? (
              <p role="alert" className="text-xs font-medium text-destructive">
                {errors.description}
              </p>
            ) : (
              <span className="text-xs text-muted-foreground">
                At least 20 characters. This appears on your vendor profile.
              </span>
            )}
            <span className="shrink-0 text-[0.7rem] text-muted-foreground">
              {values.description.length}/2000
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <AuthPasswordField
            id="vendor-password"
            label="Password"
            value={values.password}
            onChange={(value) => updateField("password", value)}
            onBlur={() => validateField("password")}
            error={errors.password}
            placeholder="Create a password"
            autoComplete="new-password"
            icon={LockKeyhole}
            requiredMark
          />

          <AuthPasswordField
            id="vendor-confirm-password"
            label="Confirm password"
            value={values.confirmPassword}
            onChange={(value) => updateField("confirmPassword", value)}
            onBlur={() => validateField("confirmPassword")}
            error={errors.confirmPassword}
            placeholder="Repeat your password"
            autoComplete="new-password"
            icon={LockKeyhole}
            requiredMark
          />
        </div>

        <ul className="grid gap-1.5 text-[0.68rem] text-muted-foreground sm:grid-cols-3">
          {[
            { key: "length", label: "8+ characters", met: checks.length },
            { key: "letter", label: "One letter", met: checks.letter },
            { key: "number", label: "One number", met: checks.number },
          ].map((rule) => (
            <li key={rule.key} className="flex items-center gap-1.5">
              {rule.met ? (
                <Check aria-hidden="true" className="size-3 text-emerald-600" />
              ) : (
                <X aria-hidden="true" className="size-3 text-wine-300" />
              )}
              <span className={rule.met ? "text-emerald-700" : undefined}>{rule.label}</span>
            </li>
          ))}
        </ul>

        <div>
          <label className="flex cursor-pointer items-start gap-2.5 text-[0.72rem] leading-relaxed text-foreground/80">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => {
                setAcceptedTerms(event.target.checked)
                setErrors((current) => ({ ...current, terms: undefined }))
              }}
              aria-invalid={Boolean(errors.terms)}
              className="mt-0.5 size-4 shrink-0 rounded border-wine-200 accent-wine-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-300 focus-visible:ring-offset-2"
            />
            <span>
              I agree to WedPlan&apos;s vendor terms and confirm that the business information above
              is accurate.
            </span>
          </label>
          {errors.terms ? (
            <p role="alert" className="mt-1.5 text-xs font-medium text-destructive">
              {errors.terms}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isGoogleLoading}
          className={authPrimaryButtonClass}
        >
          {isSubmitting ? (
            <>
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              Creating your vendor account...
            </>
          ) : (
            <>
              Create Vendor Account
              <ArrowRight aria-hidden="true" className="size-4" />
            </>
          )}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-wine-100" />
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          or sign up with
        </span>
        <span className="h-px flex-1 bg-wine-100" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={isGoogleLoading || isSubmitting}
        className={authSecondaryButtonClass}
      >
        {isGoogleLoading ? (
          <Loader2 aria-hidden="true" className="size-[1.1rem] animate-spin text-wine-600" />
        ) : (
          <GoogleIcon className="size-[1.1rem]" />
        )}
        {isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}
      </button>

      <p className="mt-2 text-center text-[0.68rem] leading-relaxed text-muted-foreground">
        Google sign-up uses the business details above. An existing customer account is never
        converted into a vendor account automatically.
      </p>

      <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-gold-300/60 bg-cream-50 px-4 py-3 text-[0.7rem] leading-relaxed text-foreground/75">
        <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-wine-600" />
        <p>
          <span className="font-semibold text-wine-900">Secure by design.</span> Vendor roles are
          assigned on the server only. The browser cannot choose its own role.
        </p>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Already registered as a vendor?{" "}
        <Link
          href="/vendor/sign-in"
          className="font-semibold text-wine-800 underline decoration-wine-300 underline-offset-4 transition-colors hover:text-wine-900"
        >
          Vendor sign in
        </Link>
      </p>
    </div>
  )
}
