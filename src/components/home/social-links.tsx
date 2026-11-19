import { cn } from "@/lib/utils"

function InstagramMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-4"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FacebookMark() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-4">
      <path d="M15.5 3h-2.2A4.3 4.3 0 0 0 9 7.3V10H6v3.8h3V21h3.9v-7.2h3l.6-3.8h-3.6V7.5c0-.5.3-.8.8-.8h2.8V3z" />
    </svg>
  )
}

function XMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      aria-hidden="true"
      className="size-4"
    >
      <path d="M4 4l16 16" />
      <path d="M20 4L4 20" />
    </svg>
  )
}

function YouTubeMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <rect
        x="2.5"
        y="5.5"
        width="19"
        height="13"
        rx="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M10.2 9.4l4.8 2.6-4.8 2.6V9.4z" fill="currentColor" />
    </svg>
  )
}

const socialLinks = [
  { label: "WedPlan on Instagram", href: "https://www.instagram.com/", icon: InstagramMark },
  { label: "WedPlan on Facebook", href: "https://www.facebook.com/", icon: FacebookMark },
  { label: "WedPlan on X", href: "https://x.com/", icon: XMark },
  { label: "WedPlan on YouTube", href: "https://www.youtube.com/", icon: YouTubeMark },
] as const

interface SocialLinksProps {
  className?: string
}

export function SocialLinks({ className }: SocialLinksProps) {
  return (
    <ul className={cn("flex items-center gap-2", className)}>
      {socialLinks.map(({ label, href, icon: Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={label}
            className="grid size-9 place-items-center rounded-full border border-white/15 bg-white/5 text-cream-100 transition-colors hover:border-white/30 hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-100/70 focus-visible:ring-offset-2 focus-visible:ring-offset-wine-900"
          >
            <Icon />
          </a>
        </li>
      ))}
    </ul>
  )
}
