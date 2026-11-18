import type { ServiceListing } from "@/types/service"

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

/**
 * Runtime validation for a presentation-ready service returned by the Express
 * API. Shared by the Browse listing and the dynamic details route so both
 * consume exactly the same response contract.
 */
export function parseServiceListing(value: unknown): ServiceListing | null {
  if (!isRecord(value)) return null

  const price = value.price
  const location = value.location
  const vendor = value.vendor
  const image = value.image

  if (!isRecord(price) || !isRecord(location) || !isRecord(vendor) || !isRecord(image)) {
    return null
  }

  const id = value.id
  const name = value.name
  const category = value.category
  const categoryLabel = value.categoryLabel
  const shortDescription = value.shortDescription
  const amount = price.amount
  const currency = price.currency
  const unit = price.unit
  const city = location.city
  const country = location.country
  const vendorId = vendor.id
  const vendorName = vendor.name
  const vendorInitials = vendor.initials
  const vendorImage = vendor.image
  const isVerified = vendor.isVerified
  const imageSrc = image.src
  const imageAlt = image.alt
  const rating = value.rating
  const reviewCount = value.reviewCount

  if (
    !hasText(id) ||
    !hasText(name) ||
    !hasText(category) ||
    !hasText(categoryLabel) ||
    !hasText(shortDescription) ||
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount < 0 ||
    (currency !== "BDT" && currency !== "USD") ||
    (unit !== "package" && unit !== "event" && unit !== "person" && unit !== "hour") ||
    !hasText(city) ||
    typeof country !== "string" ||
    !hasText(vendorId) ||
    !hasText(vendorName) ||
    !hasText(vendorInitials) ||
    !hasText(imageSrc) ||
    !hasText(imageAlt)
  ) {
    return null
  }

  if (
    (rating !== undefined &&
      (typeof rating !== "number" || !Number.isFinite(rating) || rating < 0 || rating > 5)) ||
    (reviewCount !== undefined &&
      (typeof reviewCount !== "number" ||
        !Number.isInteger(reviewCount) ||
        reviewCount < 0))
  ) {
    return null
  }

  const parsedImages = Array.isArray(value.images) ? value.images.filter(hasText) : []
  const images = parsedImages.length > 0 ? parsedImages : [imageSrc]

  return {
    id,
    name,
    category,
    categoryLabel,
    shortDescription,
    price: {
      amount,
      currency,
      unit,
    },
    location: { city, country },
    vendor: {
      id: vendorId,
      name: vendorName,
      initials: vendorInitials,
      ...(hasText(vendorImage) ? { image: vendorImage } : {}),
      ...(typeof isVerified === "boolean" ? { isVerified } : {}),
    },
    image: { src: imageSrc, alt: imageAlt },
    images,
    ...(typeof rating === "number" ? { rating } : {}),
    ...(typeof reviewCount === "number" ? { reviewCount } : {}),
  }
}

export function parseServiceLocations(meta: unknown): string[] {
  if (!isRecord(meta) || !Array.isArray(meta.locations)) return []
  return meta.locations.filter(hasText)
}
