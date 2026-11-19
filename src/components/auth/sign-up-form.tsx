"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  ArrowRight,
  Check,
  HeartHandshake,
  ImageIcon,
  Loader2,
  Lock,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Store,
  UserRound,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { AuthPasswordField, AuthTextField } from "@/components/auth/auth-fields"
import { authPrimaryButtonClass } from "@/components/auth/auth-styles"
import { GoogleAuthButton } from "@/components/auth/google-button"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

interface SignUpFormProps {
  next: string
  oauthError?: string
}

interface SignUpValues {
  name: string
  email: string
  password: string
  confirmPassword: string
  image: string
}

type SignUpErrors = Partial<Record<keyof SignUpValues | "terms", string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const NAME_MAX = 80
const IMAGE_MAX = 500

function passwordChecks(password: string) {
  return {
    length: password.length >= 8,
    letter: /[a-zA-Z]/.test(password),
    number: /\d/.test(password),
  }
}

function isValidImageUrl(value: string): boolean {
  if (!value.trim()) return true
  try {
    const url = new URL(value.trim())
    return (url.protocol === "http:" || url.protocol === "https:") && value.trim().length <= IMAGE_MAX
  } catch {
    return false
  }
}

function validateSignUp(values: SignUpValues, acceptedTerms: boolean): SignUpErrors {
  const errors: SignUpErrors = {}
  const checks = passwordChecks(values.password)

  if (!values.name.trim()) {
    errors.name = "Please enter your full name."
  } else if (values.name.trim().length < 2) {
    errors.name = "Your name must be at least 2 characters."
  } else if (values.name.trim().length > NAME_MAX) {
    errors.name = `Please keep your name under ${NAME_MAX} characters.`
  }

  if (!values.email.trim()) {
    errors.email = "Please enter your email address."
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Enter a valid email address, like name@example.com."
  }

  if (!values.password) {
    errors.password = "Please create a password."
  } else if (!checks.length) {
    errors.password = "Use at least 8 characters."
  } else if (!checks.letter) {
    errors.password = "Include at least one letter."
  } else if (!checks.number) {
    errors.password = "Include at least one number."
  } else if (values.password.length > 128) {
    errors.password = "Please keep your password under 128 characters."
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Please confirm your password."
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords do not match."
  }

  if (!isValidImageUrl(values.image)) {
    errors.image = "Enter a valid http(s) image URL, or leave this blank."
  }

  if (!acceptedTerms) {
    errors.terms = "Please accept the terms to create an account."
  }

  return errors
}

function friendlySignUpError(error: { code?: string; message?: string; status?: number }): {
  field?: "email" | "password"
  message: string
} {
  const code = error.code?.toUpperCase() ?? ""
  const message = error.message?.toLowerCase() ?? ""

  if (code.includes("USER_ALREADY_EXISTS") || message.includes("already exists")) {
    return {
      field: "email",
      message: "An account with this email already exists. Try signing in instead.",
    }
  }

  if (code.includes("PASSWORD_TOO_SHORT") || message.includes("password too short")) {
    return { field: "password", message: "Your password is too short. Use at least 8 characters." }
  }

  if (code.includes("PASSWORD_TOO_LONG") || message.includes("password too long")) {
    return { field: "password", message: "Your password is too long." }
  }

  if (code.includes("INVALID_EMAIL") || message.includes("invalid email")) {
    return { field: "email", message: "Enter a valid email address." }
  }

  return { message: "We could not create your account. Please check your details and try again." }
}

interface RoleCard {
  value: string
  label: string
  description: string
  icon: typeof HeartHandshake
  available: boolean
  href?: string
}

const roleCards: RoleCard[] = [
  {
    value: "customer",
    label: "Customer",
    description: "Plan, discover and book trusted wedding professionals.",
    icon: HeartHandshake,
    available: true,
  },
  {
    value: "vendor",
    label: "Vendor",
    description: "Create a vendor account with your business details.",
    icon: Store,
    available: true,
    href: "/vendor/sign-up",
  },
  {
    value: "admin",
    label: "Admin",
    description: "Admin accounts are invite-only and assigned by WedPlan staff.",
    icon: Lock,
    available: false,
  },
]

export function SignUpForm({ next, oauthError }: SignUpFormProps) {
  const router = useRouter()
  const [values, setValues] = useState<SignUpValues>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    image: "",
  })
  const [errors, setErrors] = useState<SignUpErrors>({})
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [formError, setFormError] = useState<string | null>(
    oauthError ? "Google sign-up was cancelled or could not be completed. Please try again." : null,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const checks = passwordChecks(values.password)
  const imagePreview = isValidImageUrl(values.image) ? values.image.trim() : ""
  const initial = values.name.trim().charAt(0).toUpperCase()

  function updateField(field: keyof SignUpValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined, terms: current.terms }))
    setFormError(null)
  }

  function validateField(field: keyof SignUpValues) {
    const nextErrors = validateSignUp(values, acceptedTerms)
    setErrors((current) => ({ ...current, [field]: nextErrors[field] }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    const nextErrors = validateSignUp(values, acceptedTerms)
    setErrors(nextErrors)
    setFormError(null)

    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)

    try {
      const { error } = await authClient.signUp.email({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        image: values.image.trim() || undefined,
      })

      if (error) {
        const friendly = friendlySignUpError(error)
        setFormError(friendly.message)
        if (friendly.field === "email") {
          setErrors((current) => ({ ...current, email: friendly.message }))
        }
        if (friendly.field === "password") {
          setErrors((current) => ({ ...current, password: friendly.message }))
        }
        toast.error("Account creation failed", { description: friendly.message })
        return
      }

      toast.success("Welcome to WedPlan!", {
        description: "Your customer account is ready and you are signed in.",
      })

      router.replace(next)
      router.refresh()
    } catch {
      const message = "Something went wrong while creating your account. Please try again."
      setFormError(message)
      toast.error("Account creation failed", { description: message })
    } finally {
      setIsSubmitting(false)
    }
  }

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
        <fieldset>
          <legend className="mb-2 text-[0.8rem] font-semibold text-foreground">
            I&apos;m joining as
          </legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {roleCards.map((role) => {
              const Icon = role.icon
              const isSelected = role.value === "customer"
              const cardClass = cn(
                "rounded-2xl border p-3 transition-colors",
                isSelected
                  ? "border-wine-300 bg-wine-50/80 shadow-[0_12px_30px_-24px_rgba(79,14,37,0.8)]"
                  : role.href
                    ? "border-wine-100 bg-white hover:border-wine-300 hover:bg-wine-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
                    : "border-wine-100 bg-white/60 opacity-70",
              )
              const content = (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <Icon
                      aria-hidden="true"
                      className={cn("size-4", isSelected ? "text-wine-700" : "text-muted-foreground")}
                    />
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-wine-800 px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.12em] text-cream-50">
                        <Check aria-hidden="true" className="size-2.5" />
                        Selected
                      </span>
                    ) : role.href ? (
                      <ArrowRight aria-hidden="true" className="size-3 text-wine-500" />
                    ) : (
                      <Lock aria-hidden="true" className="size-3 text-muted-foreground/70" />
                    )}
                  </div>
                  <p className="mt-2 text-xs font-bold text-wine-900">{role.label}</p>
                  <p className="mt-0.5 text-[0.65rem] leading-relaxed text-muted-foreground">
                    {isSelected
                      ? "Plan your celebration"
                      : role.href
                        ? "Create a vendor account"
                        : "Assigned by WedPlan staff"}
                  </p>
                </>
              )

              if (role.href) {
                return (
                  <Link key={role.value} href={role.href} title={role.description} className={cardClass}>
                    {content}
                  </Link>
                )
              }

              return (
                <div
                  key={role.value}
                  aria-disabled={!role.available}
                  title={role.available ? undefined : role.description}
                  className={cardClass}
                >
                  {content}
                </div>
              )
            })}
          </div>
          <p className="mt-2 text-[0.68rem] leading-relaxed text-muted-foreground">
            Accounts created on this page are Customers. The Vendor card opens the dedicated vendor
            sign-up form, and Admins are assigned only through a trusted server-side process.
          </p>
        </fieldset>

        <AuthTextField
          id="sign-up-name"
          label="Full name"
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
          id="sign-up-email"
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

        <div className="grid gap-4 sm:grid-cols-2">
          <AuthPasswordField
            id="sign-up-password"
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
            id="sign-up-confirm-password"
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
          <label htmlFor="sign-up-image" className="mb-1.5 block text-[0.8rem] font-semibold text-foreground">
            Profile image URL{" "}
            <span className="text-[0.68rem] font-normal text-muted-foreground">(optional)</span>
          </label>

          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              style={
                imagePreview
                  ? { backgroundImage: `url("${imagePreview.replace(/"/g, "%22")}")` }
                  : undefined
              }
              className="grid size-12 shrink-0 place-items-center rounded-full border border-wine-100 bg-wine-50 bg-cover bg-center text-sm font-bold text-wine-700"
            >
              {imagePreview ? null : initial || <ImageIcon className="size-4 text-wine-400" />}
            </div>

            <div className="relative min-w-0 flex-1">
              <ImageIcon
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 size-[1.05rem] -translate-y-1/2 text-wine-400"
              />
              <input
                id="sign-up-image"
                type="url"
                value={values.image}
                onChange={(event) => updateField("image", event.target.value)}
                onBlur={() => validateField("image")}
                placeholder="https://example.com/photo.jpg"
                autoComplete="url"
                aria-invalid={Boolean(errors.image)}
                aria-describedby={errors.image ? "sign-up-image-error" : "sign-up-image-hint"}
                className="h-12 w-full rounded-full border border-wine-100 bg-white/90 pl-11 pr-4 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-wine-300 focus:ring-4 focus:ring-wine-100 aria-[invalid=true]:border-destructive/60 aria-[invalid=true]:ring-destructive/10"
              />
            </div>
          </div>

          {errors.image ? (
            <p id="sign-up-image-error" role="alert" className="mt-1.5 text-xs font-medium text-destructive">
              {errors.image}
            </p>
          ) : (
            <p id="sign-up-image-hint" className="mt-1.5 text-xs text-muted-foreground">
              Paste a hosted image link. You can add one later from your profile.
            </p>
          )}
        </div>

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
              aria-describedby={errors.terms ? "sign-up-terms-error" : undefined}
              className="mt-0.5 size-4 shrink-0 rounded border-wine-200 accent-wine-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-300 focus-visible:ring-offset-2"
            />
            <span>
              I agree to WedPlan&apos;s <span className="font-semibold text-wine-800">Terms of Service</span>{" "}
              and <span className="font-semibold text-wine-800">Privacy Policy</span>, and to receive
              essential account emails.
            </span>
          </label>
          {errors.terms ? (
            <p id="sign-up-terms-error" role="alert" className="mt-1.5 text-xs font-medium text-destructive">
              {errors.terms}
            </p>
          ) : null}
        </div>

        <button type="submit" disabled={isSubmitting} className={authPrimaryButtonClass}>
          {isSubmitting ? (
            <>
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              Creating your account…
            </>
          ) : (
            <>
              Create Account
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

      <GoogleAuthButton next={next} mode="sign-up" />

      <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-gold-300/60 bg-cream-50 px-4 py-3 text-[0.7rem] leading-relaxed text-foreground/75">
        <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-wine-600" />
        <p>
          <span className="font-semibold text-wine-900">Your privacy matters.</span> Google profile
          details are used only for your account. Google sign-in can never grant Vendor or Admin
          access.
        </p>
      </div>
    </div>
  )
}
