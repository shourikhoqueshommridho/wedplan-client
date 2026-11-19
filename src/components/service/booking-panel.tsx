"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useSyncExternalStore, type FormEvent } from "react"
import {
  ArrowRight,
  CalendarDays,
  Info,
  Loader2,
  MapPin,
  MessageSquare,
} from "lucide-react"
import { toast } from "sonner"

import { authClient } from "@/lib/auth-client"
import { apiFetch, readApiMessage } from "@/lib/client-api"
import { formatServicePrice } from "@/lib/format"
import { dashboardPathForRole } from "@/lib/safe-redirect"
import { cn } from "@/lib/utils"
import { normalizeUserRole } from "@/types/auth"
import type { ServiceListing } from "@/types/service"

interface BookingPanelProps {
  service: ServiceListing
}

interface BookingValues {
  eventDate: string
  eventLocation: string
  message: string
}

type BookingField = keyof BookingValues
type BookingErrors = Partial<Record<BookingField, string>>

const inputClass =
  "h-11 w-full rounded-xl border border-wine-100 bg-white px-3.5 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-wine-300 focus:ring-2 focus:ring-wine-100 aria-[invalid=true]:border-destructive/60 aria-[invalid=true]:ring-destructive/10"

function pad(value: number): string {
  return String(value).padStart(2, "0")
}

function toDateInputValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function subscribeToNothing(): () => void {
  return () => {}
}

/**
 * Today's date is read without an effect so the server-rendered markup stays
 * stable: the empty server snapshot hydrates, then React swaps in the real
 * date on the client. The value only changes when the component re-renders.
 */
function useTodayInputValue(): string {
  return useSyncExternalStore(
    subscribeToNothing,
    () => toDateInputValue(new Date()),
    () => "",
  )
}

function validateBooking(values: BookingValues, minimumDate: string): BookingErrors {
  const errors: BookingErrors = {}

  if (!values.eventDate) {
    errors.eventDate = "Please choose your event date."
  } else if (minimumDate && values.eventDate < minimumDate) {
    errors.eventDate = "The event date cannot be in the past."
  }

  if (!values.eventLocation.trim()) {
    errors.eventLocation = "Please enter the event location."
  } else if (values.eventLocation.trim().length > 180) {
    errors.eventLocation = "Please keep the location under 180 characters."
  }

  if (values.message.trim().length > 1000) {
    errors.message = "Please keep your message under 1,000 characters."
  }

  return errors
}

export function BookingPanel({ service }: BookingPanelProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, isPending: isSessionPending } = authClient.useSession()
  const sessionRole = session?.user ? normalizeUserRole(session.user.role) : null
  const listedLocation = [service.location.city, service.location.country]
    .filter((part) => part.trim().length > 0)
    .join(", ")
  const minimumDate = useTodayInputValue()
  const [values, setValues] = useState<BookingValues>({
    eventDate: "",
    eventLocation: listedLocation,
    message: "",
  })
  const [errors, setErrors] = useState<BookingErrors>({})
  const [notice, setNotice] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(field: BookingField, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setNotice(null)
  }

  function validateField(field: BookingField) {
    const nextErrors = validateBooking(values, minimumDate)
    setErrors((current) => ({ ...current, [field]: nextErrors[field] }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    const nextErrors = validateBooking(values, minimumDate)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setNotice(null)
      return
    }

    if (isSessionPending) {
      toast.info("Checking your session", {
        description: "Please try again in a moment.",
      })
      return
    }

    if (!session?.user) {
      const returnTo = `${pathname}#booking`
      toast.info("Please sign in to continue", {
        description: "Your booking details stay on this page and we will bring you right back.",
      })
      router.push(`/sign-in?next=${encodeURIComponent(returnTo)}`)
      return
    }

    if (sessionRole !== "customer") {
      const message =
        "Only customer accounts can send booking requests. Vendors manage their own services and admins have a separate dashboard."
      setNotice(message)
      toast.info("Customer account required", { description: message })
      return
    }

    setIsSubmitting(true)
    setNotice(null)

    try {
      const response = await apiFetch("/bookings", {
        method: "POST",
        body: JSON.stringify({
          serviceId: service.id,
          eventDate: values.eventDate,
          eventLocation: values.eventLocation.trim(),
          message: values.message.trim(),
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          const returnTo = `${pathname}#booking`
          toast.info("Please sign in again", {
            description: "Your session expired. Sign in and your details stay on this page.",
          })
          router.push(`/sign-in?next=${encodeURIComponent(returnTo)}`)
          return
        }

        const message = await readApiMessage(
          response,
          "Your booking request could not be sent. Please try again.",
        )
        setNotice(message)
        toast.error("Booking request not sent", { description: message })
        return
      }

      setNotice(
        `Your request was sent to ${service.vendor.name}. You can track and cancel it from your customer dashboard.`,
      )
      toast.success("Booking request sent", {
        description: `${service.vendor.name} will review your request. No payment was taken.`,
      })
      setValues((current) => ({ ...current, message: "" }))
      router.refresh()
    } catch {
      const message = "Something went wrong while sending your request. Please try again."
      setNotice(message)
      toast.error("Booking request not sent", { description: message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      id="booking"
      aria-labelledby="booking-title"
      className="scroll-mt-24 rounded-[1.75rem] border border-wine-100 bg-white p-5 shadow-[0_28px_70px_-55px_rgba(80,16,38,0.6)] sm:p-6"
    >
      <div className="flex items-start justify-between gap-4 border-b border-wine-100 pb-5">
        <div className="min-w-0">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-wine-500">
            Booking request
          </p>
          <h2 id="booking-title" className="mt-1.5 font-heading text-2xl font-semibold text-wine-900">
            Request this service
          </h2>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Listed price
          </p>
          <p className="mt-1 font-heading text-2xl font-semibold text-wine-800">
            {formatServicePrice(service.price)}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Share a few details with {service.vendor.name} and we&apos;ll help you start the conversation.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
        <div>
          <label htmlFor="booking-event-date" className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <CalendarDays aria-hidden="true" className="size-4 text-wine-600" />
            Event date <span className="text-wine-500">*</span>
          </label>
          <input
            id="booking-event-date"
            name="eventDate"
            type="date"
            value={values.eventDate}
            min={minimumDate || undefined}
            onChange={(event) => updateField("eventDate", event.target.value)}
            onBlur={() => validateField("eventDate")}
            aria-invalid={Boolean(errors.eventDate)}
            aria-describedby={errors.eventDate ? "booking-event-date-error" : undefined}
            className={inputClass}
          />
          {errors.eventDate ? (
            <p id="booking-event-date-error" role="alert" className="mt-1.5 text-xs font-medium text-destructive">
              {errors.eventDate}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="booking-event-location" className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <MapPin aria-hidden="true" className="size-4 text-wine-600" />
            Event location <span className="text-wine-500">*</span>
          </label>
          <input
            id="booking-event-location"
            name="eventLocation"
            type="text"
            value={values.eventLocation}
            onChange={(event) => updateField("eventLocation", event.target.value)}
            onBlur={() => validateField("eventLocation")}
            placeholder="Venue name, city, or full address"
            aria-invalid={Boolean(errors.eventLocation)}
            aria-describedby={errors.eventLocation ? "booking-event-location-error" : undefined}
            className={inputClass}
          />
          {errors.eventLocation ? (
            <p id="booking-event-location-error" role="alert" className="mt-1.5 text-xs font-medium text-destructive">
              {errors.eventLocation}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="booking-message" className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <MessageSquare aria-hidden="true" className="size-4 text-wine-600" />
            Additional message <span className="text-xs font-normal text-muted-foreground">(optional)</span>
          </label>
          <textarea
            id="booking-message"
            name="message"
            rows={4}
            value={values.message}
            onChange={(event) => updateField("message", event.target.value)}
            onBlur={() => validateField("message")}
            placeholder="Guest count, preferred time, or anything the vendor should know..."
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "booking-message-error" : undefined}
            className={cn(inputClass, "h-auto min-h-28 resize-y py-3 leading-relaxed")}
          />
          <div className="mt-1.5 flex items-start justify-between gap-3">
            {errors.message ? (
              <p id="booking-message-error" role="alert" className="text-xs font-medium text-destructive">
                {errors.message}
              </p>
            ) : (
              <span className="text-xs text-muted-foreground">Optional — add anything useful for the vendor.</span>
            )}
            <span className="shrink-0 text-[0.7rem] text-muted-foreground">
              {values.message.length}/1000
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-wine-800 px-5 text-sm font-semibold text-cream-50 transition-colors hover:bg-wine-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              Sending request…
            </>
          ) : (
            <>
              Send Booking Request
              <ArrowRight aria-hidden="true" className="size-4" />
            </>
          )}
        </button>

        {notice ? (
          <p
            role="status"
            className="flex items-start gap-2 rounded-xl border border-gold-300/70 bg-cream-50 px-3.5 py-3 text-xs leading-relaxed text-wine-900"
          >
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-wine-600" />
            {notice}
          </p>
        ) : null}
      </form>

      <div className="mt-4 rounded-xl border border-wine-100 bg-wine-50/60 px-3.5 py-3 text-xs leading-relaxed text-foreground/75">
        {session?.user ? (
          <>
            <p>
              <span className="font-semibold text-wine-900">
                Signed in as {session.user.name}.
              </span>{" "}
              {sessionRole === "customer"
                ? "Every request is attached to your account so you can track or cancel it later."
                : "Only customer accounts can send booking requests. You are signed in as a vendor or admin."}
            </p>
            <Link
              href={dashboardPathForRole(sessionRole ?? "customer")}
              className="mt-2 inline-flex rounded font-semibold text-wine-800 underline decoration-wine-300 underline-offset-4 hover:text-wine-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-300"
            >
              {sessionRole === "customer" ? "View my booking requests" : "Go to my dashboard"}
            </Link>
          </>
        ) : (
          <>
            <p>
              <span className="font-semibold text-wine-900">Sign in required.</span> Customer
              booking requests need a signed-in customer account so vendors can reply to you.
            </p>
            <Link
              href={`/sign-in?next=${encodeURIComponent(`${pathname}#booking`)}`}
              className="mt-2 inline-flex rounded font-semibold text-wine-800 underline decoration-wine-300 underline-offset-4 hover:text-wine-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-300"
            >
              Go to Sign In
            </Link>
          </>
        )}
      </div>

      <p className="mt-3 text-center text-[0.68rem] text-muted-foreground">
        You will not be charged by submitting this form.
      </p>
    </section>
  )
}
