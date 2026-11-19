"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle, ArrowRight, Loader2, LockKeyhole, Mail, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

import { AuthPasswordField, AuthTextField } from "@/components/auth/auth-fields"
import { authPrimaryButtonClass } from "@/components/auth/auth-styles"
import { GoogleAuthButton } from "@/components/auth/google-button"
import { authClient } from "@/lib/auth-client"

interface SignInFormProps {
  next: string
  oauthError?: string
}

interface SignInValues {
  email: string
  password: string
}

type SignInErrors = Partial<Record<keyof SignInValues, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validateSignIn(values: SignInValues): SignInErrors {
  const errors: SignInErrors = {}

  if (!values.email.trim()) {
    errors.email = "Please enter your email address."
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Enter a valid email address, like name@example.com."
  }

  if (!values.password) {
    errors.password = "Please enter your password."
  }

  return errors
}

function friendlySignInError(error: { code?: string; message?: string; status?: number }): string {
  const code = error.code?.toUpperCase() ?? ""
  const message = error.message?.toLowerCase() ?? ""

  if (code.includes("INVALID_EMAIL_OR_PASSWORD") || message.includes("invalid email or password")) {
    return "Email or password is incorrect. Please try again."
  }

  if (code.includes("EMAIL_NOT_VERIFIED") || message.includes("not verified")) {
    return "This email address has not been verified yet."
  }

  if (error.status === 429 || code.includes("TOO_MANY_REQUESTS")) {
    return "Too many attempts. Please wait a moment and try again."
  }

  return "We could not sign you in. Please check your details and try again."
}

export function SignInForm({ next, oauthError }: SignInFormProps) {
  const router = useRouter()
  const [values, setValues] = useState<SignInValues>({ email: "", password: "" })
  const [errors, setErrors] = useState<SignInErrors>({})
  const [rememberMe, setRememberMe] = useState(true)
  const [formError, setFormError] = useState<string | null>(
    oauthError ? "Google sign-in was cancelled or could not be completed. Please try again." : null,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(field: keyof SignInValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setFormError(null)
  }

  function validateField(field: keyof SignInValues) {
    const nextErrors = validateSignIn(values)
    setErrors((current) => ({ ...current, [field]: nextErrors[field] }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    const nextErrors = validateSignIn(values)
    setErrors(nextErrors)
    setFormError(null)

    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)

    try {
      const { error } = await authClient.signIn.email({
        email: values.email.trim().toLowerCase(),
        password: values.password,
        rememberMe,
      })

      if (error) {
        const message = friendlySignInError(error)
        setFormError(message)
        toast.error("Sign in failed", { description: message })
        return
      }

      toast.success("Welcome back!", {
        description: "You are signed in. Taking you to your account.",
      })

      router.replace(next)
      router.refresh()
    } catch {
      const message = "Something went wrong while signing in. Please try again."
      setFormError(message)
      toast.error("Sign in failed", { description: message })
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
        <AuthTextField
          id="sign-in-email"
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
          autoFocus
        />

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <label htmlFor="sign-in-password" className="text-[0.8rem] font-semibold text-foreground">
              Password <span className="text-wine-500">*</span>
            </label>
            <Link
              href="/forgot-password"
              className="rounded text-xs font-semibold text-wine-700 underline-offset-4 transition-colors hover:text-wine-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
            >
              Forgot password?
            </Link>
          </div>

          <AuthPasswordField
            id="sign-in-password"
            label="Password"
            value={values.password}
            onChange={(value) => updateField("password", value)}
            onBlur={() => validateField("password")}
            error={errors.password}
            placeholder="Enter your password"
            autoComplete="current-password"
            icon={LockKeyhole}
          />
        </div>

        <label className="flex w-fit cursor-pointer items-center gap-2.5 rounded py-0.5 text-sm text-foreground/80">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="size-4 rounded border-wine-200 accent-wine-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-300 focus-visible:ring-offset-2"
          />
          Keep me signed in on this device
        </label>

        <button type="submit" disabled={isSubmitting} className={authPrimaryButtonClass}>
          {isSubmitting ? (
            <>
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Sign In
              <ArrowRight aria-hidden="true" className="size-4" />
            </>
          )}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-wine-100" />
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          or continue with
        </span>
        <span className="h-px flex-1 bg-wine-100" />
      </div>

      <GoogleAuthButton next={next} mode="sign-in" />

      <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-gold-300/60 bg-cream-50 px-4 py-3 text-[0.7rem] leading-relaxed text-foreground/75">
        <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-wine-600" />
        <p>
          <span className="font-semibold text-wine-900">Your information is safe with us.</span>{" "}
          Sessions use secure, httpOnly cookies and your password is never stored in plain text.
        </p>
      </div>
    </div>
  )
}
