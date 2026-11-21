"use client"

import { useMemo, useState } from "react"
import { ChartNoAxesColumnIncreasing, Star } from "lucide-react"

import { buildAdminActivity } from "@/lib/admin-dashboard"
import type { Booking } from "@/types/booking"

interface AdminAnalyticsProps {
  bookings: readonly Booking[]
  now: string
  totalBookings: number
}

type ActivityRange = "30d" | "6m"

const RANGES: readonly { value: ActivityRange; label: string }[] = [
  { value: "30d", label: "Last 30 Days" },
  { value: "6m", label: "Last 6 Months" },
]

export function AdminAnalytics({ bookings, now, totalBookings }: AdminAnalyticsProps) {
  const [range, setRange] = useState<ActivityRange>("30d")

  const points = useMemo(
    () => buildAdminActivity(bookings, new Date(now), range),
    [bookings, now, range],
  )

  const chartWidth = 600
  const chartHeight = 190
  const paddingLeft = 42
  const paddingRight = 12
  const paddingTop = 10
  const paddingBottom = 26
  const plotWidth = chartWidth - paddingLeft - paddingRight
  const plotHeight = chartHeight - paddingTop - paddingBottom

  const maxCount = Math.max(4, Math.ceil(Math.max(...points.map((point) => point.count), 1) / 2) * 2)
  const coordinates = points.map((point, index) => ({
    x:
      points.length <= 1
        ? paddingLeft + plotWidth / 2
        : paddingLeft + (index / (points.length - 1)) * plotWidth,
    y: paddingTop + plotHeight - (point.count / maxCount) * plotHeight,
  }))

  return (
    <section className="rounded-[1.15rem] border border-wine-100 bg-white p-5 shadow-[0_18px_45px_-42px_rgba(112,19,47,0.6)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-wine-50 text-wine-700">
            <ChartNoAxesColumnIncreasing aria-hidden="true" className="size-[1.05rem]" />
          </span>
          <h2 className="font-heading text-xl font-semibold text-wine-900">Analytics Overview</h2>
        </div>

        <label className="sr-only" htmlFor="admin-analytics-range">
          Analytics date range
        </label>
        <select
          id="admin-analytics-range"
          value={range}
          onChange={(event) => setRange(event.target.value as ActivityRange)}
          className="h-9 cursor-pointer rounded-full border border-wine-200 bg-white px-4 pr-8 text-[0.72rem] font-semibold text-wine-800 outline-none focus:ring-2 focus:ring-wine-200"
        >
          {RANGES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="mt-4 h-48 w-full"
        role="img"
        aria-label="Booking activity chart"
      >
        <defs>
          <linearGradient id="admin-chart-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f9a8c8" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#f9a8c8" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0, 1, 2, 3].map((line) => {
          const y = paddingTop + (line / 3) * plotHeight
          const value = Math.round(maxCount - (line / 3) * maxCount)

          return (
            <g key={line}>
              <line
                x1={paddingLeft}
                x2={chartWidth - paddingRight}
                y1={y}
                y2={y}
                stroke="#f6dfe9"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 9}
                y={y + 4}
                textAnchor="end"
                className="fill-wine-900/55 text-[11px]"
              >
                {value}
              </text>
            </g>
          )
        })}

        {coordinates.length > 1 ? (
          <>
            <polygon
              points={`${paddingLeft},${chartHeight - paddingBottom} ${coordinates
                .map((point) => `${point.x},${point.y}`)
                .join(" ")} ${chartWidth - paddingRight},${chartHeight - paddingBottom}`}
              fill="url(#admin-chart-fill)"
            />
            <polyline
              points={coordinates.map((point) => `${point.x},${point.y}`).join(" ")}
              fill="none"
              stroke="#db2777"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        ) : null}

        {points.map((point, index) => (
          <circle
            key={point.key}
            cx={coordinates[index].x}
            cy={coordinates[index].y}
            r="4.5"
            fill="#db2777"
            stroke="white"
            strokeWidth="2"
          />
        ))}

        {points.map((point, index) => (
          <text
            key={`label-${point.key}`}
            x={coordinates[index].x}
            y={chartHeight - 5}
            textAnchor="middle"
            className="fill-wine-900/55 text-[11px]"
          >
            {point.label}
          </text>
        ))}
      </svg>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-wine-100 bg-white px-4 py-3">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-wine-900/60">
            Total Bookings
          </p>
          <p className="mt-1 font-heading text-2xl font-semibold text-wine-900">{totalBookings}</p>
        </div>
        <div className="rounded-xl border border-wine-100 bg-[#fff1f6] px-4 py-3">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-wine-900/60">
            Total Revenue
          </p>
          <p className="mt-1 font-heading text-2xl font-semibold text-wine-900" title="No transaction API is available">
            —
          </p>
        </div>
        <div className="rounded-xl border border-wine-100 bg-white px-4 py-3">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-wine-900/60">
            Avg Rating
          </p>
          <p className="mt-1 flex items-center gap-1.5 font-heading text-2xl font-semibold text-wine-900">
            —
            <Star aria-hidden="true" className="size-4 text-gold-500" />
          </p>
        </div>
      </div>
    </section>
  )
}
