import "server-only"

import { nextTides as simulatedNext, tide as simulatedTide, type TidePoint } from "@/lib/dashboard-data"
import { fetchJson, fetchText, withFallback } from "./http"

const OBSERVED_URL = "https://opendata.tmr.qld.gov.au/Townsville_tides.txt"
const HILO_PACKAGE =
  "https://www.data.qld.gov.au/api/3/action/package_show?id=townsville-tide-gauge-predicted-high-low-data"

export type NextTide = { type: "High" | "Low"; time: string; day: string; level: number }

export type TideData = {
  observedAt: string | null
  latestLevel: number | null
  series: TidePoint[]
  next: NextTide[]
}

// Both feeds use AEST wall-clock time.
const aest = (y: string, mo: string, d: string, h: string, mi: string) =>
  Date.parse(`${y}-${mo}-${d}T${h}:${mi}:00+10:00`)

function parseObserved(text: string) {
  const points = text
    .split(/\r?\n/)
    .map((l) => l.trim().match(/^(\d{2})(\d{2})(\d{4})(\d{2})(\d{2})\s+(-?\d+(?:\.\d+)?)$/))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map(([, d, mo, y, h, mi, level]) => ({
      at: aest(y, mo, d, h, mi),
      time: `${h}:${mi}`,
      level: Number(level),
    }))
    .sort((a, b) => a.at - b.at)

  if (points.length === 0) throw new Error("No readings in tide gauge feed")

  const newest = points[points.length - 1]
  const series = points
    .filter((p) => p.at >= newest.at - 24 * 3_600_000 && Number(p.time.slice(3)) % 10 === 0)
    .map(({ time, level }) => ({ time, level }))

  return { observedAt: new Date(newest.at).toISOString(), latestLevel: newest.level, series }
}

type CkanPackage = { result: { resources: { name: string; url: string }[] } }

async function loadPredictions(now: number) {
  const year = new Date(now + 10 * 3_600_000).getUTCFullYear()
  const pkg = await fetchJson<CkanPackage>(HILO_PACKAGE, { revalidate: 86_400 })
  const csvUrls = [year, year + 1]
    .map((y) => pkg.result.resources.find((r) => r.name.startsWith(String(y)) && r.url.endsWith(".csv"))?.url)
    .filter((u): u is string => Boolean(u))
  if (csvUrls.length === 0) throw new Error(`No ${year} high/low prediction file`)

  const files = await Promise.all(csvUrls.map((u) => fetchText(u, { revalidate: 86_400 })))
  const day = new Intl.DateTimeFormat("en-AU", { weekday: "short", timeZone: "Australia/Brisbane" })

  return files
    .flatMap((f) => f.split(/\r?\n/))
    .map((l) => l.match(/^(\d{2})\/(\d{2})\/(\d{4})\s*,\s*(\d{2}):(\d{2})\s*,\s*(-?1)\s*,\s*(-?\d+(?:\.\d+)?)/))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map(([, d, mo, y, h, mi, ind, level]) => {
      const at = aest(y, mo, d, h, mi)
      return {
        at,
        type: ind === "1" ? ("High" as const) : ("Low" as const),
        time: `${h}:${mi}`,
        day: day.format(at),
        level: Number(level),
      }
    })
    .filter((t) => t.at >= now)
    .sort((a, b) => a.at - b.at)
    .slice(0, 3)
    .map(({ type, time, day, level }) => ({ type, time, day, level }))
}

const fallback: TideData = {
  observedAt: null,
  latestLevel: null,
  series: simulatedTide,
  next: simulatedNext.map((t) => ({ ...t, type: t.type as NextTide["type"], day: "" })),
}

export const getTides = () =>
  withFallback("Townsville tides", fallback, async () => {
    const [observed, next] = await Promise.all([
      fetchText(OBSERVED_URL, { revalidate: 600 }).then(parseObserved),
      loadPredictions(Date.now()),
    ])
    return { ...observed, next }
  })
