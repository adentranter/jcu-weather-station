import { MapPin, Radio, CalendarClock } from "lucide-react"
import { Reveal } from "@/components/dashboard/motion"
import { station, type Snapshot } from "@/lib/dashboard-data"

export function Hero({ snapshot }: { snapshot: Snapshot }) {
  const meta = [
    {
      icon: MapPin,
      label: `${station.name} · BOM ${station.bomNumber}`,
    },
    {
      icon: Radio,
      label: `${Math.abs(station.latitude)}°S ${station.longitude}°E · ${station.elevationM} m`,
    },
    {
      icon: CalendarClock,
      label:
        snapshot.daysToSeason > 0
          ? `Season opens ${snapshot.seasonStart} · ${snapshot.daysToSeason} days`
          : `Cyclone season under way since ${snapshot.seasonStart}`,
    },
  ]

  return (
    <section id="top" className="mx-auto max-w-3xl px-5 pt-16 pb-12 text-center sm:pt-24 sm:pb-16">
      <Reveal className="space-y-6">
        <p className="eyebrow">Townsville, Queensland</p>
        <h1 className="text-4xl font-light tracking-tight text-balance sm:text-5xl">
          Weather on the built environment
        </h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-pretty text-foreground/75">
          A quiet view of the conditions that matter to the Cyclone Testing Station
          — wind, pressure, sea state and cyclone history — so we can keep minimising
          loss and suffering for homes and low-rise buildings across the north.
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
          {meta.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2">
              <Icon className="size-4 text-wind" aria-hidden />
              {label}
            </li>
          ))}
        </ul>
      </Reveal>
      <div className="mt-14 h-px bg-foreground/25" />
    </section>
  )
}
