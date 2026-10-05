import history from "@/data/townsville-cyclones.json"
import { cycloneNotes, type CycloneEvent } from "@/lib/dashboard-data"

const MIN_CATEGORY = 3
const MAX_DISTANCE_KM = 200

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()

const dateLabel = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", timeZone: "UTC" })

export function getCycloneHistory() {
  const events: CycloneEvent[] = history.cyclones
    .filter((t) => t.name.toLowerCase() !== "unnamed" && t.category !== null)
    .map((t) => ({ ...t, name: titleCase(t.name) }))
    .filter(
      (t) =>
        t.name in cycloneNotes ||
        ((t.category ?? 0) >= MIN_CATEGORY && t.closestKm <= MAX_DISTANCE_KM),
    )
    .map((t) => {
      const notes = cycloneNotes[t.name]
      const intensity = [
        t.minPressure ? `${t.minPressure} hPa` : null,
        t.maxGustKmh ? `gusts to ${t.maxGustKmh} km/h` : null,
      ]
        .filter(Boolean)
        .join(" · ")
      const note = [notes?.note ?? `Closest approach ${t.closestKm} km.`, intensity && `${intensity}.`]
        .filter(Boolean)
        .join(" ")
      return {
        name: t.name,
        year: Number(t.closestAt.slice(0, 4)),
        date: dateLabel.format(new Date(`${t.closestAt.slice(0, 10)}T00:00:00Z`)),
        category: t.category as CycloneEvent["category"],
        landfall: notes?.landfall ?? `${t.closestKm} km ${t.bearing} of Townsville`,
        note,
      }
    })

  return {
    events,
    total: history.cyclones.length,
    radiusKm: history.radiusKm,
    since: Math.min(...history.cyclones.map((t) => Number(t.closestAt.slice(0, 4)))),
  }
}
