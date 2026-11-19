"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { GoogleIcon } from "@/components/auth/google-icon"
import { authSecondaryButtonClass } from "@/components/auth/auth-styles"
import { authClient } from "@/lib/auth-client"
import { apiFetch } from "@/lib/client-api"

interface GoogleAuthButtonProps {
  /** Safe internal destination after the OAuth callback. */
  next: string
  mode: "sign-in" | "sign-up"
}

export function GoogleAuthButton({ next, mode }: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleGoogleAuth() {
    if (isLoading) return
    setIsLoading(true)

    try {
      // Customer sign-in/sign-up must never inherit a vendor sign-up intent
      // left behind by an abandoned vendor OAuth attempt.
      await apiFetch("/account/vendor/intent", { method: "DELETE" }).catch(() => undefined)

      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: next,
        newUserCallbackURL: next,
        errorCallbackURL: `/${mode}?error=google`,
      })

      if (error) {
        toast.error("Google sign-in could not be started", {
          description:
            error.message || "Google authentication is not configured correctly on this server.",
        })
        setIsLoading(false)
      }
    } catch {
      toast.error("Google sign-in is unavailable", {
        description: "Please try again in a moment or use your email address.",
      })
      setIsLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleGoogleAuth}
      disabled={isLoading}
      className={authSecondaryButtonClass}
    >
      {isLoading ? (
        <Loader2 aria-hidden="true" className="size-[1.1rem] animate-spin text-wine-600" />
      ) : (
        <GoogleIcon className="size-[1.1rem]" />
      )}
      {isLoading ? "Connecting to Google…" : "Continue with Google"}
    </button>
  )
}
