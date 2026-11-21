"use client"

import { useMemo, useState } from "react"
import { ArrowUpRight, ChartNoAxesColumnIncreasing, TrendingDown, Wallet } from "lucide-react"

import {
  buildEarningsReport,
  formatVendorAmount,
  type EarningsRange,
} from "@/lib/vendor-dashboard"
import type { Booking } from "@/types/booking"

interface EarningsOverviewProps {
  bookings: readonly Booking[]
  /** ISO timestamp from the server so chart windows are deterministic. */
  now: string
}

const RANGES: readonly { value: EarningsRange; label: string }[] = [
  { value: "30d", label: "Last 30 Days" },
  { value: "6m", label: "Last 6 Months" },
  { value: "12m", label: "Last 12 Months" },
]

export function EarningsOverview({ bookings, now }: EarningsOverviewProps) {
  const [range, setRange] = useState<EarningsRange>("30d")

  const report = useMemo(
    () => buildEarningsReport(bookings, range, new Date(now)),
    [bookings, range, now],
  )

  const chartWidth = 620
  const chartHeight = 200
  const paddingLeft = 52
  const paddingRight = 14
  const paddingTop = 10
  const paddingBottom = 28

  const maxEarning = Math.max(
    1500,
    Math.ceil(Math.max(...report.points.map((point) => point.earnings), 1) / 500) * 500,
  )

  const plotWidth = chartWidth - paddingLeft - paddingRight
  const plotHeight = chartHeight - paddingTop - paddingBottom

  const coordinates = report.points.map((point, index) => ({
    x:
      report.points.length <= 1
        ? paddingLeft + plotWidth / 2
        : paddingLeft + (index / (report.points.length - 1)) * plotWidth,
    y: paddingTop + plotHeight - (point.earnings / maxEarning) * plotHeight,
  }))

  const trend = report.trendPercent
  const isUp = trend !== null && trend >= 0

  return (
    <section className="rounded-[1.15rem] border border-wine-100 bg-white p-5 shadow-[0_18px_45px_-42px_rgba(112,19,47,0.6)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-wine-50 text-wine-700">
            <ChartNoAxesColumnIncreasing aria-hidden="true" className="size-[1.05rem]" />
          </span>
          <h2 className="font-heading text-xl font-semibold text-wine-900">Earnings Overview</h2>
        </div>

        <label className="sr-only" htmlFor="vendor-earnings-range">
          Earnings date range
        </label>
        <select
          id="vendor-earnings-range"
          value={range}
          onChange={(event) => setRange(event.target.value as EarningsRange)}
          className="h-9 cursor-pointer rounded-full border border-wine-200 bg-white px-4 pr-8 text-[0.72rem] font-semibold text-wine-800 outline-none focus:ring-2 focus:ring-wine-200"
        >
          {RANGES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-stretch">
        <div className="min-w-0 flex-1">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="h-52 w-full overflow-visible sm:h-56"
            role="img"
            aria-label={`Estimated earnings for ${report.rangeLabel}`}
          >
            {[0, 1, 2, 3].map((line) => {
              const y = paddingTop + (line / 3) * plotHeight
              const value = maxEarning - (line / 3) * maxEarning

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
                    x={paddingLeft - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-wine-900/55 text-[11px] font-medium"
                  >
                    {formatVendorAmount(value)}
                  </text>
                </g>
              )
            })}

            {coordinates.length > 1 ? (
              <polyline
                points={coordinates.map((point) => `${point.x},${point.y}`).join(" ")}
                fill="none"
                stroke="#db2777"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}

            {report.points.map((point, index) => (
              <circle
                key={point.key}
                cx={coordinates[index].x}
                cy={coordinates[index].y}
                r="5"
                fill="#db2777"
                stroke="white"
                strokeWidth="2.5"
              />
            ))}

            {report.points.map((point, index) => (
              <text
                key={`label-${point.key}`}
                x={coordinates[index].x}
                y={chartHeight - 6}
                textAnchor="middle"
                className="fill-wine-900/55 text-[11px] font-medium"
              >
                {point.label}
              </text>
            ))}
          </svg>
        </div>

        <div className="flex w-full shrink-0 flex-col justify-center rounded-[1.1rem] border border-wine-100/70 bg-[linear-gradient(135deg,#fff1f6_0%,#fde4ed_100%)] p-5 lg:w-[228px]">
          <span
            aria-hidden="true"
            className="grid size-10 place-items-center rounded-xl bg-white/80 text-wine-700 shadow-sm"
          >
            <Wallet className="size-5" />
          </span>
          <p className="mt-4 text-sm font-semibold text-wine-800">Total Earnings</p>
          <p className="mt-1 font-heading text-[2rem] font-bold leading-tight text-wine-900">
            {formatVendorAmount(report.total)}
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            {trend === null ? (
              <span className="text-muted-foreground">No previous period data</span>
            ) : (
              <>
                <span
                  className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-bold ${
                    isUp
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {isUp ? (
                    <ArrowUpRight aria-hidden="true" className="size-3" />
                  ) : (
                    <TrendingDown aria-hidden="true" className="size-3" />
                  )}
                  {Math.abs(trend)}%
                </span>
                <span className="text-foreground/65">{report.comparisonLabel}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
