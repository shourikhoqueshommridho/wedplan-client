import { apiFetch } from "@/lib/client-api"
import { isRecord } from "@/lib/service-listing"

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

/** Immediate client feedback only; the server performs the authoritative check. */
export function validateImageFile(file: File): string | null {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return "Only JPEG, PNG, WebP and GIF images are supported."
  }
  if (file.size === 0) return "The image file is empty."
  if (file.size > MAX_IMAGE_BYTES) return "Images must be 5 MB or smaller."
  return null
}

export async function uploadServiceImage(file: File): Promise<string> {
  const form = new FormData()
  form.append("image", file, file.name || "service-image")

  const response = await apiFetch("/vendor/uploads/image", {
    method: "POST",
    body: form,
  })

  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      isRecord(payload) && typeof payload.message === "string" && payload.message.trim()
        ? payload.message
        : "The image could not be uploaded. Please try again.",
    )
  }

  const url = isRecord(payload) && isRecord(payload.data) ? payload.data.url : null
  if (typeof url !== "string" || !url.trim()) {
    throw new Error("The image host did not return a usable URL.")
  }

  return url
}

