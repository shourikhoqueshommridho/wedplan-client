import type { AdminService, AdminUser } from "@/types/admin"
import { normalizeUserRole } from "@/types/auth"
import type { Booking } from "@/types/booking"
import { isBookingStatus } from "@/types/booking"
import { isRecord } from "@/lib/service-listing"
import {
  isVendorBusinessCategory,
  type VendorProfile,
  type VendorService,
} from "@/types/vendor"

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null
}

function numeric(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

export function parseVendorProfile(value: unknown): VendorProfile | null {
  if (!isRecord(value)) return null

  const id = text(value.id)
  const userId = text(value.userId)
  const businessName = text(value.businessName)
  const category = value.category
  const phone = text(value.phone)
  const location = text(value.location)
  const description = text(value.description)
  const contactEmail = text(value.contactEmail)

  if (
    !id ||
    !userId ||
    !businessName ||
    !isVendorBusinessCategory(category) ||
    !phone ||
    !location ||
    !description ||
    !contactEmail
  ) {
    return null
  }

  return {
    id,
    userId,
    businessName,
    category,
    phone,
    location,
    website: text(value.website),
    description,
    contactEmail,
    createdAt: text(value.createdAt),
    updatedAt: text(value.updatedAt),
  }
}

export function parseVendorService(value: unknown): VendorService | null {
  if (!isRecord(value)) return null

  const id = text(value.id)
  const name = text(value.name)
  const category = text(value.category)
  const description = text(value.description)
  const location = text(value.location)
  const status = text(value.status)

  if (
    !id ||
    !name ||
    !category ||
    !description ||
    !location ||
    !status ||
    typeof value.price !== "number" ||
    !Number.isFinite(value.price) ||
    !Array.isArray(value.images)
  ) {
    return null
  }

  return {
    id,
    name,
    category,
    description,
    price: value.price,
    location,
    images: value.images.filter((image): image is string => typeof image === "string"),
    status,
    isActive: value.isActive === true,
    createdAt: text(value.createdAt),
    updatedAt: text(value.updatedAt),
  }
}

export function parseBooking(value: unknown): Booking | null {
  if (!isRecord(value)) return null

  const id = text(value.id)
  const customerId = text(value.customerId)
  const customerName = text(value.customerName)
  const customerEmail = text(value.customerEmail)
  const vendorId = text(value.vendorId)
  const vendorName = text(value.vendorName)
  const serviceId = text(value.serviceId)
  const serviceName = text(value.serviceName)
  const eventDate = text(value.eventDate)
  const eventLocation = text(value.eventLocation)
  const status = value.status

  if (
    !id ||
    !customerId ||
    !customerName ||
    !vendorId ||
    !vendorName ||
    !serviceId ||
    !serviceName ||
    !eventDate ||
    !eventLocation ||
    !isBookingStatus(status) ||
    typeof value.price !== "number"
  ) {
    return null
  }

  return {
    id,
    customerId,
    customerName,
    customerEmail: customerEmail ?? "",
    vendorId,
    vendorName,
    serviceId,
    serviceName,
    serviceImage: text(value.serviceImage),
    price: value.price,
    eventDate,
    eventLocation,
    message: text(value.message) ?? "",
    status,
    paymentStatus: text(value.paymentStatus) ?? "not_required",
    createdAt: text(value.createdAt),
    updatedAt: text(value.updatedAt),
  }
}

export function parseAdminUser(value: unknown): AdminUser | null {
  if (!isRecord(value)) return null

  const id = text(value.id)
  const name = text(value.name)
  if (!id || !name) return null

  return {
    id,
    name,
    email: text(value.email) ?? "",
    image: text(value.image),
    role: normalizeUserRole(value.role),
    createdAt: text(value.createdAt),
  }
}

export function parseAdminService(value: unknown): AdminService | null {
  if (!isRecord(value)) return null

  const id = text(value.id)
  const name = text(value.name)
  const category = text(value.category)
  const description = text(value.description)
  const location = text(value.location)
  const status = text(value.status)
  const vendorId = text(value.vendorId)
  const vendorName = text(value.vendorName)
  const price = numeric(value.price)

  if (
    !id ||
    !name ||
    !category ||
    !description ||
    !location ||
    !status ||
    !vendorId ||
    !vendorName ||
    price === null ||
    !Array.isArray(value.images)
  ) {
    return null
  }

  return {
    id,
    name,
    category,
    description,
    price,
    location,
    images: value.images.filter((image): image is string => typeof image === "string"),
    vendorId,
    vendorName,
    status,
    isActive: value.isActive === true,
    createdAt: text(value.createdAt),
    updatedAt: text(value.updatedAt),
  }
}

/** Reads `{ data: { profile } }` from the vendor profile API. */
export function parseVendorProfileResponse(payload: unknown): VendorProfile | null {
  if (!isRecord(payload) || !isRecord(payload.data)) return null
  return parseVendorProfile(payload.data.profile)
}

/** Reads `{ data: { service } }` from the vendor service API. */
export function parseVendorServiceResponse(payload: unknown): VendorService | null {
  if (!isRecord(payload) || !isRecord(payload.data)) return null
  return parseVendorService(payload.data.service)
}

/** Reads `{ data: { booking } }` from the booking API. */
export function parseBookingResponse(payload: unknown): Booking | null {
  if (!isRecord(payload) || !isRecord(payload.data)) return null
  return parseBooking(payload.data.booking)
}

export function parseList<T>(payload: unknown, key: string, parser: (value: unknown) => T | null): T[] {
  if (!isRecord(payload) || !isRecord(payload.data)) return []
  const list = payload.data[key]
  if (!Array.isArray(list)) return []

  return list.map(parser).filter((item): item is T => item !== null)
}
