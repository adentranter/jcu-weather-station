"use client"

import { motion } from "framer-motion"
import { ArrowUp } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { CoastalReading, TidePoint } from "@/lib/dashboard-data"

type NextTide = { type: string; time: string; day: string; level: number }

export function CoastalCard({
  coastal,
  waveDirection,
  waveHistory,
  updated,
}: {
  coastal: CoastalReading[]
  waveDirection: { label: string; degrees: number }
  waveHistory: { hour: string; hs: number }[]
  updated: string | null
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Sea state</CardTitle>
        <CardDescription>
          Townsville wave buoy · {updated ? `as at ${updated}` : "simulated"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-5">
        {coastal.map((reading, i) => (
          <div key={reading.label} className="space-y-2">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-muted-foreground">{reading.label}</span>
              <span className="tabular-nums">
                {reading.value.toFixed(reading.decimals)}
                <span className="ml-1 text-xs text-muted-foreground">{reading.unit}</span>
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full origin-left rounded-full bg-sea"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: Math.min(1, reading.value / reading.max) }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        ))}
        <Separator />
        <div className="flex min-h-24 flex-1 flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Hs, last 24 h</span>
            <span className="flex items-center gap-1.5">
              <ArrowUp
                className="size-3.5 text-sea"
                style={{ transform: `rotate(${waveDirection.degrees + 180}deg)` }}
                aria-hidden
              />
              from {waveDirection.label} · {waveDirection.degrees}°
            </span>
          </div>
          <div className="min-h-20 flex-1">
            <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 300, height: 80 }}>
              <AreaChart data={waveHistory} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fill-hs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-sea)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--color-sea)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis hide domain={["dataMin - 0.1", "dataMax + 0.1"]} />
                <Area
                  type="monotone"
                  dataKey="hs"
                  stroke="var(--color-sea)"
                  strokeWidth={1.5}
                  fill="url(#fill-hs)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TideTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value?: number | string }[]
  label?: string | number
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-popover/95 px-2.5 py-1.5 text-xs tabular-nums shadow-lg backdrop-blur">
      {label} · {Number(payload[0].value).toFixed(2)} m
    </div>
  )
}

export function TideCard({
  tide,
  nextTides,
  latestLevel,
}: {
  tide: TidePoint[]
  nextTides: NextTide[]
  latestLevel: number | null
}) {
  const observed = latestLevel !== null
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Tide</CardTitle>
        <CardDescription>
          {observed
            ? `Observed, last 24 h · now ${latestLevel.toFixed(2)} m above LAT`
            : "Predicted water level, metres above LAT"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="min-h-36 flex-1">
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 400, height: 144 }}>
            <AreaChart data={tide} margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fill-tide" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-sea)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-sea)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" hide />
              <YAxis hide domain={[0, "dataMax + 0.3"]} />
              <Tooltip content={<TideTooltip />} cursor={{ stroke: "var(--border)" }} />
              <Area
                type="monotone"
                dataKey="level"
                stroke="var(--color-sea)"
                strokeWidth={2}
                fill="url(#fill-tide)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <Separator />
        <ul className="grid grid-cols-3 gap-2 text-center">
          {nextTides.map((t) => (
            <li key={`${t.day}-${t.time}`} className="space-y-1">
              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                {t.type}
              </Badge>
              <p className="text-lg font-light tabular-nums">{t.time}</p>
              <p className="text-xs text-muted-foreground tabular-nums">
                {t.day ? `${t.day} · ` : ""}
                {t.level.toFixed(1)} m
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
