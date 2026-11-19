import type { Metadata } from "next"
import Link from "next/link"
import { KeyRound, Mail, ShieldAlert } from "lucide-react"

import { AuthShell } from "@/components/auth/auth-shell"

export const metadata: Metadata = {
  title: "Password Help",
  description: "Password reset information for WedPlan accounts.",
  robots: { index: false, follow: false },
}

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account help"
      title="Password reset"
      subtitle="We would rather be honest than send you a reset email that never arrives."
      footer={
        <p>
          Remembered your password?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-wine-800 underline decoration-wine-300 underline-offset-4 transition-colors hover:text-wine-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
          >
            Back to sign in
          </Link>
        </p>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-2xl border border-gold-300/70 bg-cream-50 px-4 py-4 text-sm leading-relaxed text-foreground/80">
          <ShieldAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-wine-600" />
          <div>
            <p className="font-semibold text-wine-900">Email recovery is not configured yet.</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              WedPlan does not have a transactional email provider connected to this build, so no
              reset link can be generated. We have not built a fake form that only appears to work.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-wine-100 bg-white px-4 py-4 text-sm leading-relaxed text-foreground/80">
          <p className="flex items-center gap-2 font-semibold text-wine-900">
            <KeyRound aria-hidden="true" className="size-4 text-wine-600" />
            What you can do now
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs text-muted-foreground">
            <li>Use Google sign-in if your account was created with Google.</li>
            <li>
              If you still have an active session, sign in on that device before it expires.
            </li>
            <li>Contact support and the team can verify your account manually.</li>
          </ul>
        </div>

        <a
          href="mailto:hello@wedplan.com"
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-wine-800 px-5 text-sm font-semibold text-cream-50 transition-colors hover:bg-wine-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-wine-200"
        >
          <Mail aria-hidden="true" className="size-4" />
          Contact support
        </a>
      </div>
    </AuthShell>
  )
}
