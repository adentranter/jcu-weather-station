import "server-only"

import { fetchJson, withFallback } from "./http"

const BASE = "https://dataquoll.io/api/v1"
// North Queensland around Townsville: Ingham to Bowen, inland to Charters Towers.
const BBOX = "144.5,-21.5,149,-17.5"

export type Incident = {
  id: string
  title: string
  eventType: string
  status: string
  warningLevel: string
  severity: string
  place: string
  updatedAt: string | null
}

export type FloodClass = "major" | "moderate" | "minor" | "below_minor" | "unclassified" | "stale"

export type RiverGauge = {
  id: string
  name: string
  river: string
  lga: string | null
  level: number | null
  observedAt: string | null
  floodClass: FloodClass
  thresholds: { minor: number | null; moderate: number | null; major: number | null } | null
}

export type AlertData = {
  incidents: Incident[]
  gauges: RiverGauge[]
  disclaimer: string
}

type IncidentFeature = {
  id: string
  properties: {
    title: string
    eventType: string
    status: string
    warningLevel: string
    severity: string
    location?: { suburb?: string; address?: string }
    timestamps?: { updated?: string; reported?: string }
  }
}

type GaugeResponse = {
  gauges: {
    id: string
    name: string
    river: string
    lga?: { name: string } | null
    latest?: { value: number; observedAt: string } | null
    readingStatus?: string
    floodClass?: string | null
    thresholds?: { minor: number | null; moderate: number | null; major: number | null } | null
  }[]
  disclaimer?: string
}

const warningRank: Record<string, number> = {
  emergency: 0,
  watch_and_act: 1,
  advice: 2,
  none: 3,
}

const classRank: Record<FloodClass, number> = {
  major: 0,
  moderate: 1,
  minor: 2,
  below_minor: 3,
  stale: 4,
  unclassified: 5,
}

const DISCLAIMER =
  "Status reporting from official feeds via DataQuoll, not a forecast and not a substitute for official warnings."

async function load(apiKey: string): Promise<AlertData> {
  const options = { revalidate: 300, headers: { Authorization: `Bearer ${apiKey}` } }
  const [incidents, gauges] = await Promise.all([
    fetchJson<{ features: IncidentFeature[] }>(
      `${BASE}/incidents?state=qld&bbox=${BBOX}&limit=50`,
      options,
    ),
    fetchJson<GaugeResponse>(`${BASE}/gauges?state=qld&bbox=${BBOX}&limit=50`, options),
  ])

  return {
    incidents: incidents.features
      .map(({ id, properties: p }) => ({
        id,
        title: p.title,
        eventType: p.eventType,
        status: p.status,
        warningLevel: p.warningLevel,
        severity: p.severity,
        place: p.location?.suburb ?? p.location?.address ?? "",
        updatedAt: p.timestamps?.updated ?? p.timestamps?.reported ?? null,
      }))
      .sort(
        (a, b) =>
          (warningRank[a.warningLevel] ?? 9) - (warningRank[b.warningLevel] ?? 9) ||
          (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""),
      ),
    gauges: gauges.gauges
      .map((g) => {
        const floodClass: FloodClass =
          g.readingStatus === "stale"
            ? "stale"
            : ((g.floodClass as FloodClass | null) ?? "unclassified")
        return {
          id: g.id,
          name: g.name.replace(/\s+/g, " ").trim(),
          river: g.river,
          lga: g.lga?.name ?? null,
          level: g.latest?.value ?? null,
          observedAt: g.latest?.observedAt ?? null,
          floodClass: floodClass in classRank ? floodClass : "unclassified",
          thresholds: g.thresholds ?? null,
        }
      })
      .sort((a, b) => classRank[a.floodClass] - classRank[b.floodClass] || a.name.localeCompare(b.name)),
    disclaimer: gauges.disclaimer ?? DISCLAIMER,
  }
}

const fallback: AlertData = { incidents: [], gauges: [], disclaimer: DISCLAIMER }

export const getAlerts = () =>
  withFallback("DataQuoll", fallback, async () => {
    const apiKey = process.env.DATAQUOLL_API_KEY
    if (!apiKey) throw new Error("DATAQUOLL_API_KEY is not set")
    return load(apiKey)
  })
