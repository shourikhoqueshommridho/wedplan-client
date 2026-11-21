"use client"

import { useEffect, useRef } from "react"
import { Loader2, X } from "lucide-react"

import { cn } from "@/lib/utils"

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  busy?: boolean
  tone?: "default" | "destructive"
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Small accessible confirmation surface used for availability changes and
 * booking decisions. It mirrors the dashboard's visual language instead of the
 * browser's native confirm prompt.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  busy = false,
  tone = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    cancelRef.current?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) onCancel()
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, busy, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[85] flex items-end justify-center bg-wine-900/55 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vendor-confirm-title"
        className="relative w-full max-w-md rounded-t-[1.75rem] bg-white p-6 shadow-[0_40px_120px_-30px_rgba(53,19,34,0.7)] sm:rounded-[1.75rem]"
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          aria-label="Close confirmation"
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full text-wine-700 transition-colors hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200 disabled:opacity-50"
        >
          <X aria-hidden="true" className="size-4" />
        </button>

        <h2 id="vendor-confirm-title" className="pr-8 font-heading text-xl font-semibold text-wine-900">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="inline-flex h-10 items-center rounded-full border border-wine-200 bg-white px-4 text-sm font-semibold text-wine-800 transition-colors hover:bg-wine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-70",
              tone === "destructive"
                ? "bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive/40"
                : "bg-burgundy-600 hover:bg-burgundy-700 focus-visible:ring-wine-300",
            )}
          >
            {busy ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
