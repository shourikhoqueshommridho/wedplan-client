export type BookingStatus = "pending" | "accepted" | "declined" | "cancelled" | "completed"

export interface Booking {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  vendorId: string
  vendorName: string
  serviceId: string
  serviceName: string
  serviceImage: string | null
  price: number
  eventDate: string
  eventLocation: string
  message: string
  status: BookingStatus
  paymentStatus: string
  createdAt: string | null
  updatedAt: string | null
}

export function isBookingStatus(value: unknown): value is BookingStatus {
  return (
    value === "pending" ||
    value === "accepted" ||
    value === "declined" ||
    value === "cancelled" ||
    value === "completed"
  )
}
