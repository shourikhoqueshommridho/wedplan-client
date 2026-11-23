import type { UserRole } from "@/types/auth"

export interface AdminUser {
  id: string
  name: string
  email: string
  image: string | null
  role: UserRole
  createdAt: string | null
  blocked: boolean
  blockedAt: string | null
}

export interface AdminService {
  id: string
  name: string
  category: string
  description: string
  price: number
  location: string
  images: string[]
  vendorId: string
  vendorName: string
  status: string
  isActive: boolean
  createdAt: string | null
  updatedAt: string | null
}

export interface AdminTransaction {
  id: string
  vendorId: string
  vendorName: string
  plan: "free" | "premium"
  amount: number
  currency: string
  status: string
  stripeSessionId: string | null
  stripeSubscriptionId: string | null
  createdAt: string | null
}
