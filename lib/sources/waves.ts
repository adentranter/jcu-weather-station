import "server-only"

import {
  coastal as simulatedCoastal,
  conditions as simulatedConditions,
  waveDirection as simulatedDirection,
  waveHistory as simulatedHistory,
  type CoastalReading,
  type Condition,
} from "@/lib/dashboard-data"
import { compassLabel, fetchText, round, trendOf, withFallback } from "./http"

const URL = "https://apps.des.qld.gov.au/data-sets/waves/wave-7dayopdata.csv"
const SITE = "Townsville"
const MISSING = -99

export type WaveData = {
  observedAt: string | null
  coastal: CoastalReading[]
  direction: { label: string; degrees: number }
  history: { hour: string; hs: number }[]
  condition: Condition
}

type Row = {
  at: number
  time: string
  hs: number | null
  hmax: number | null
  tp: number | null
  sst: number | null
  dir: number | null
}

const value = (s: string | undefined) => {
  const n = Number.parseFloat(s ?? "")
  return Number.isFinite(n) && n > MISSING ? n : null
}

function parse(csv: string): WaveData {
  const lines = csv.split(/\r?\n/)
  const headerIndex = lines.findIndex((l) => l.startsWith("Site,"))
  if (headerIndex < 0) throw new Error("Wave CSV header not found")
  const header = lines[headerIndex].split(",").map((h) => h.trim())
  const col = (name: string) => header.indexOf(name)
  const [iSite, iSeconds, iTime, iHs, iHmax, iTp, iSst, iDir] = [
    "Site", "Seconds", "DateTime", "Hsig", "Hmax", "Tp", "SST", "Direction",
  ].map(col)

  const rows: Row[] = lines
    .slice(headerIndex + 1)
    .map((l) => l.split(","))
    .filter((c) => c[iSite]?.trim() === SITE)
    .map((c) => ({
      at: Number(c[iSeconds]) * 1000,
      time: c[iTime]?.slice(11, 16) ?? "",
      hs: value(c[iHs]),
      hmax: value(c[iHmax]),
      tp: value(c[iTp]),
      sst: value(c[iSst]),
      dir: value(c[iDir]),
    }))
    .filter((r) => Number.isFinite(r.at))
    .sort((a, b) => a.at - b.at)

  const withHs = rows.filter((r) => r.hs !== null)
  if (withHs.length === 0) throw new Error(`No ${SITE} rows in wave feed`)

  const newest = withHs[withHs.length - 1]
  const latest = (key: "hmax" | "tp" | "sst" | "dir") => {
    for (let i = rows.length - 1; i >= 0; i--) if (rows[i][key] !== null) return rows[i][key]!
    return null
  }
  const hs = newest.hs!
  const hmax = latest("hmax")
  const tp = latest("tp")
  const sst = latest("sst")
  const dir = latest("dir")
  const direction = dir === null ? simulatedDirection : { label: compassLabel(dir), degrees: Math.round(dir) }

  const threeHoursAgo = withHs.find((r) => r.at >= newest.at - 3 * 3_600_000)

  return {
    observedAt: new Date(newest.at).toISOString(),
    coastal: [
      { label: "Significant height (Hs)", value: hs, decimals: 2, unit: "m", max: 4 },
      { label: "Maximum height (Hmax)", value: hmax ?? 0, decimals: 2, unit: "m", max: 6 },
      { label: "Peak period (Tp)", value: tp ?? 0, decimals: 1, unit: "s", max: 16 },
      { label: "Sea surface temp", value: sst ?? 0, decimals: 1, unit: "°C", max: 32 },
    ],
    direction,
    history: withHs
      .filter((r) => r.at >= newest.at - 24 * 3_600_000)
      .map((r) => ({ hour: r.time, hs: round(r.hs!, 2) })),
    condition: {
      id: "waves",
      label: "Waves (Hs)",
      value: hs,
      decimals: 2,
      unit: "m",
      detail: `${tp !== null ? `Tp ${tp.toFixed(1)} s · ` : ""}from ${direction.label}`,
      trend: trendOf(hs, threeHoursAgo?.hs ?? undefined, 0.1),
      icon: "waves",
    },
  }
}

const fallback: WaveData = {
  observedAt: null,
  coastal: simulatedCoastal,
  direction: simulatedDirection,
  history: simulatedHistory.map((h) => ({ hour: String(h.hour), hs: h.hs })),
  condition: simulatedConditions.find((c) => c.id === "waves")!,
}

export const getWaves = () =>
  withFallback("QLD wave buoy", fallback, async () =>
    parse(await fetchText(URL, { revalidate: 900 })),
  )
