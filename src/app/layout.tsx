import type { Metadata } from "next"
import { Geist_Mono, Great_Vibes, Manrope, Playfair_Display } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
})

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
})

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "WedPlan | Your Dream Wedding, Our Priority",
    template: "%s | WedPlan",
  },
  description:
    "Discover and book trusted wedding photographers, venues, florists, caterers, stylists, and fashion vendors — all in one beautifully curated place.",
  applicationName: "WedPlan",
  keywords: [
    "wedding planning",
    "wedding vendors",
    "wedding services",
    "wedding photographer",
    "wedding venue",
    "bridal makeup",
  ],
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${playfair.variable} ${greatVibes.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  )
}
