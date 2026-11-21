import { Heart, UserRound } from "lucide-react"

import { RoleBadge } from "@/components/account/role-badge"
import { initialsFromName } from "@/lib/customer-dashboard"
import type { UserRole } from "@/types/auth"

interface ProfileSummaryProps {
  name: string
  email: string
  image: string | null
  role: UserRole
}

export function ProfileSummary({ name, email, image, role }: ProfileSummaryProps) {
  return (
    <section
      aria-labelledby="profile-summary-title"
      className="flex h-full flex-col rounded-[1.5rem] border border-wine-100 bg-white p-5 shadow-[0_26px_70px_-60px_rgba(112,19,47,0.7)] sm:p-6"
    >
      <div className="flex items-center gap-2.5">
        <UserRound aria-hidden="true" className="size-5 text-wine-600" />
        <h2
          id="profile-summary-title"
          className="font-heading text-xl font-semibold text-wine-900"
        >
          Profile Summary
        </h2>
      </div>

      <div className="mt-5 flex flex-1 flex-col items-center gap-5 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
          <span
            aria-hidden="true"
            className="grid size-20 shrink-0 place-items-center rounded-full border-4 border-blush-50 bg-wine-100 bg-cover bg-center font-heading text-xl font-semibold text-wine-800"
            style={
              image ? { backgroundImage: `url("${image.replace(/"/g, "%22")}")` } : undefined
            }
          >
            {image ? null : initialsFromName(name)}
          </span>
          <div className="min-w-0 max-w-full">
            <p className="truncate font-heading text-xl font-semibold text-wine-900">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
            <div className="mt-2 flex justify-center sm:justify-start">
              <RoleBadge role={role} />
            </div>
          </div>
        </div>

        <span aria-hidden="true" className="h-px w-full bg-wine-100 sm:h-24 sm:w-px" />

        <blockquote className="flex w-full flex-col items-center justify-center px-2 text-center sm:w-44 sm:flex-none">
          <p className="font-script text-[1.65rem] leading-tight text-wine-800 sm:text-[1.9rem]">
            “Dream big,
            <br />
            Plan better!”
          </p>
          <Heart aria-hidden="true" className="mt-2 size-4 text-wine-400" strokeWidth={1.7} />
        </blockquote>
      </div>
    </section>
  )
}
