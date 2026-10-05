"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { HourlyReading } from "@/lib/dashboard-data"

type View = "wind" | "pressure" | "rain"

const views: Record<View, { label: string; description: string }> = {
  wind: { label: "Wind", description: "Mean wind and gusts, km/h" },
  pressure: { label: "Pressure", description: "Mean sea level pressure, hPa" },
  rain: { label: "Rain", description: "Hourly rainfall, mm" },
}

const axis = {
  stroke: "var(--muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { name?: string | number; value?: number | string; color?: string }[]
  label?: string | number
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-popover/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      <p className="mb-1 text-muted-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={String(entry.name)} className="flex items-center gap-2 tabular-nums">
          <span className="size-2 rounded-full" style={{ background: entry.color }} />
          <span className="capitalize">{entry.name}</span>
          <span className="ml-auto pl-3 font-medium">{entry.value}</span>
        </p>
      ))}
    </div>
  )
}

function Chart({ view, hourly }: { view: View; hourly: HourlyReading[] }) {
  if (view === "rain") {
    return (
      <BarChart data={hourly} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="time" {...axis} interval={3} />
        <YAxis {...axis} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--border)" }} />
        <Bar dataKey="rain" name="rain" fill="var(--color-sea)" radius={[4, 4, 0, 0]} />
      </BarChart>
    )
  }

  if (view === "pressure") {
    return (
      <AreaChart data={hourly} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="fill-pressure" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="time" {...axis} interval={3} />
        <YAxis {...axis} domain={["dataMin - 0.5", "dataMax + 0.5"]} tickFormatter={(v: number) => v.toFixed(0)} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border)" }} />
        <Area
          type="monotone"
          dataKey="pressure"
          name="pressure"
          stroke="var(--chart-4)"
          strokeWidth={2}
          fill="url(#fill-pressure)"
        />
      </AreaChart>
    )
  }

  return (
    <AreaChart data={hourly} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
      <defs>
        <linearGradient id="fill-wind" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-wind)" stopOpacity={0.35} />
          <stop offset="100%" stopColor="var(--color-wind)" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid vertical={false} stroke="var(--border)" />
      <XAxis dataKey="time" {...axis} interval={3} />
      <YAxis {...axis} />
      <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border)" }} />
      <Area
        type="monotone"
        dataKey="gust"
        name="gust"
        stroke="var(--color-gust)"
        strokeWidth={1.5}
        strokeDasharray="4 4"
        fill="transparent"
      />
      <Area
        type="monotone"
        dataKey="wind"
        name="wind"
        stroke="var(--color-wind)"
        strokeWidth={2}
        fill="url(#fill-wind)"
      />
    </AreaChart>
  )
}

export function TrendChart({ hourly }: { hourly: HourlyReading[] }) {
  const [view, setView] = useState<View>("wind")

  return (
    <Card className="h-full">
      <CardHeader className="grid-cols-[1fr_auto] items-center gap-3">
        <div className="space-y-1">
          <CardTitle>Last 24 hours</CardTitle>
          <CardDescription>{views[view].description}</CardDescription>
        </div>
        <Tabs value={view} onValueChange={(value) => setView(value as View)}>
          <TabsList>
            {(Object.keys(views) as View[]).map((key) => (
              <TabsTrigger key={key} value={key} className="px-2.5 text-xs">
                {views[key].label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="relative h-64 sm:h-72">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={view}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 600, height: 280 }}>
                <Chart view={view} hourly={hourly} />
              </ResponsiveContainer>
            </motion.div>
          </AnimatePresence>
        </div>
        {view === "wind" ? (
          <div className="mt-3 flex gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="h-0.5 w-4 rounded bg-wind" /> Mean wind
            </span>
            <span className="flex items-center gap-2">
              <span className="h-0 w-4 border-t-2 border-dashed border-gust" /> Gusts
            </span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
