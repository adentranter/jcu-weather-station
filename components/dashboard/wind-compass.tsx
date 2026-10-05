"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { currentWind, windRose } from "@/lib/dashboard-data"

const size = 220
const c = size / 2
const inner = 18
const outer = 92
const maxFrequency = Math.max(...windRose.map((p) => p.frequency))

const point = (deg: number, r: number) => {
  const rad = (deg * Math.PI) / 180
  return `${(c + r * Math.sin(rad)).toFixed(2)} ${(c - r * Math.cos(rad)).toFixed(2)}`
}

const petals = windRose.map((petal) => {
  const r = inner + (petal.frequency / maxFrequency) * (outer - inner)
  const half = 8
  return {
    ...petal,
    d: `M ${point(petal.degrees - half, inner)} L ${point(petal.degrees - half, r)} A ${r} ${r} 0 0 1 ${point(petal.degrees + half, r)} L ${point(petal.degrees + half, inner)} A ${inner} ${inner} 0 0 0 ${point(petal.degrees - half, inner)} Z`,
  }
})

const cardinals = [
  { label: "N", deg: 0 },
  { label: "E", deg: 90 },
  { label: "S", deg: 180 },
  { label: "W", deg: 270 },
]

export function WindCompass() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Wind direction</CardTitle>
        <CardDescription>30-day rose with current bearing</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-4">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full max-w-60"
          role="img"
          aria-label={`Wind from ${currentWind.direction} at ${currentWind.speed} km/h. Prevailing winds from the east-south-east.`}
        >
          {[0.33, 0.66, 1].map((f) => (
            <circle
              key={f}
              cx={c}
              cy={c}
              r={inner + f * (outer - inner)}
              fill="none"
              stroke="var(--border)"
            />
          ))}
          {petals.map((petal, i) => (
            <Tooltip key={petal.direction}>
              <TooltipTrigger
                render={
                  <motion.path
                    d={petal.d}
                    fill="var(--color-wind)"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 0.18 + (petal.frequency / maxFrequency) * 0.5 }}
                    whileHover={{ opacity: 0.9 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.03, duration: 0.5 }}
                    className="cursor-default outline-none"
                  />
                }
              />
              <TooltipContent>
                {petal.direction} · {petal.frequency}% of hours
              </TooltipContent>
            </Tooltip>
          ))}
          {cardinals.map(({ label, deg }) => {
            const [x, y] = point(deg, outer + 12).split(" ")
            return (
              <text
                key={label}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-muted-foreground text-[10px] tracking-widest"
              >
                {label}
              </text>
            )
          })}
          <motion.g
            style={{ originX: `${c}px`, originY: `${c}px` }}
            initial={{ rotate: currentWind.degrees - 90 }}
            whileInView={{ rotate: currentWind.degrees }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 40, damping: 9, delay: 0.4 }}
          >
            <path
              d={`M ${c} ${c - outer + 6} L ${c + 5} ${c} L ${c} ${c + 10} L ${c - 5} ${c} Z`}
              fill="var(--color-gust)"
            />
          </motion.g>
          <circle cx={c} cy={c} r={4} fill="var(--foreground)" />
        </svg>
        <div className="grid w-full grid-cols-3 text-center text-xs text-muted-foreground">
          <div>
            <p className="text-lg font-light text-foreground">{currentWind.direction}</p>
            from
          </div>
          <div>
            <p className="text-lg font-light text-foreground tabular-nums">{currentWind.degrees}°</p>
            bearing
          </div>
          <div>
            <p className="text-lg font-light text-foreground tabular-nums">{currentWind.gust}</p>
            gust km/h
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
