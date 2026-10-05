import "server-only"

import {
  conditions as simulatedConditions,
  currentWind as simulatedWind,
  hourly as simulatedHourly,
  windRose as simulatedWindRose,
  type Condition,
  type HourlyReading,
  type WindRosePetal,
} from "@/lib/dashboard-data"
import { COMPASS, compassDegrees, fetchJson, round, trendOf, withFallback } from "./http"

const URL = "https://www.bom.gov.au/fwo/IDQ60801/IDQ60801.94294.json"

type BomObservation = {
  local_date_time_full: string
  wind_spd_kmh: number | null
  gust_kmh: number | null
  wind_dir: string | null
  air_temp: number | null
  dewpt: number | null
  rel_hum: number | null
  press_msl: number | null
  rain_trace: string | null
}

type BomResponse = { observations: { data: BomObservation[] } }

export type CurrentWind = { speed: number; gust: number; direction: string; degrees: number }

export type Observations = {
  observedAt: string | null
  current: CurrentWind
  conditions: Condition[]
  hourly: HourlyReading[]
  windRose: WindRosePetal[]
  windRoseHours: number
}

type Obs = {
  at: number
  hhmm: string
  wind: number | null
  gust: number | null
  dir: string | null
  temp: number | null
  dew: number | null
  hum: number | null
  pressure: number | null
  rainSince9: number | null
}

// local_date_time_full is AEST wall-clock time, e.g. "20261006063000".
const parseLocal = (s: string) => {
  const iso = `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T${s.slice(8, 10)}:${s.slice(10, 12)}:00+10:00`
  return { at: Date.parse(iso), hhmm: `${s.slice(8, 10)}:${s.slice(10, 12)}` }
}

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null)

const latest = <K extends keyof Obs>(obs: Obs[], key: K) => {
  for (let i = obs.length - 1; i >= 0; i--) {
    const v = obs[i][key]
    if (v !== null) return v as NonNullable<Obs[K]>
  }
  return null
}

// Value of `key` from the reading closest to `hours` before the newest one.
const hoursAgo = (obs: Obs[], key: "wind" | "pressure" | "temp" | "hum", hours: number) => {
  const target = obs[obs.length - 1].at - hours * 3_600_000
  let best: Obs | undefined
  for (const o of obs) {
    if (o[key] === null) continue
    if (!best || Math.abs(o.at - target) < Math.abs(best.at - target)) best = o
  }
  return best?.[key] ?? undefined
}

// rain_trace accumulates from 9am and resets, so diff consecutive readings.
const rainIncrements = (obs: Obs[]) => {
  let prev: number | null = null
  return obs.map((o) => {
    if (o.rainSince9 === null) return 0
    const inc = prev === null ? 0 : o.rainSince9 >= prev ? o.rainSince9 - prev : o.rainSince9
    prev = o.rainSince9
    return inc
  })
}

function parse(raw: BomResponse): Observations {
  const obs: Obs[] = raw.observations.data
    .map((o) => {
      const t = parseLocal(o.local_date_time_full)
      const rain = o.rain_trace === null ? NaN : Number.parseFloat(o.rain_trace)
      return {
        at: t.at,
        hhmm: t.hhmm,
        wind: num(o.wind_spd_kmh),
        gust: num(o.gust_kmh),
        dir: o.wind_dir && o.wind_dir !== "-" ? o.wind_dir : null,
        temp: num(o.air_temp),
        dew: num(o.dewpt),
        hum: num(o.rel_hum),
        pressure: num(o.press_msl),
        rainSince9: Number.isFinite(rain) ? rain : null,
      }
    })
    .filter((o) => Number.isFinite(o.at))
    .sort((a, b) => a.at - b.at)

  if (obs.length === 0) throw new Error("BOM returned no observations")

  const newest = obs[obs.length - 1]
  const increments = rainIncrements(obs)
  const last24 = obs.filter((o) => o.at >= newest.at - 24 * 3_600_000)

  const hourly: HourlyReading[] = []
  for (let i = 0; i < obs.length; i++) {
    const o = obs[i]
    if (o.at < newest.at - 24 * 3_600_000 || !o.hhmm.endsWith(":00")) continue
    const windowStart = o.at - 3_600_000
    const rain = obs.reduce((sum, p, j) => (p.at > windowStart && p.at <= o.at ? sum + increments[j] : sum), 0)
    hourly.push({
      time: o.hhmm,
      wind: o.wind ?? 0,
      gust: o.gust ?? o.wind ?? 0,
      pressure: o.pressure ?? 0,
      rain: round(rain, 1),
    })
  }

  const counts = new Map<string, number>()
  let directional = 0
  for (const o of obs) {
    if (!o.dir || compassDegrees(o.dir) === null) continue
    counts.set(o.dir, (counts.get(o.dir) ?? 0) + 1)
    directional++
  }
  const windRose: WindRosePetal[] = COMPASS.map((direction, i) => ({
    direction,
    degrees: i * 22.5,
    frequency: directional ? round(((counts.get(direction) ?? 0) / directional) * 100, 1) : 0,
  }))

  const dir = latest(obs, "dir") ?? "CALM"
  const current: CurrentWind = {
    speed: latest(obs, "wind") ?? 0,
    gust: latest(obs, "gust") ?? 0,
    direction: dir,
    degrees: compassDegrees(dir) ?? 0,
  }

  const pressure = latest(obs, "pressure")
  const pressure3h = hoursAgo(obs, "pressure", 3)
  const temp = latest(obs, "temp")
  const temps = last24.map((o) => o.temp).filter((t): t is number => t !== null)
  const hum = latest(obs, "hum")
  const dew = latest(obs, "dew")
  const rainSince9 = latest(obs, "rainSince9") ?? 0
  const rain72 = increments.reduce((a, b) => a + b, 0)

  const conditions: Condition[] = [
    {
      id: "wind",
      label: "Wind",
      value: current.speed,
      decimals: 0,
      unit: "km/h",
      detail: `${current.direction === "CALM" ? "Calm" : current.direction} · gusting ${current.gust}`,
      trend: trendOf(current.speed, hoursAgo(obs, "wind", 3), 3),
      icon: "wind",
    },
    {
      id: "pressure",
      label: "MSL pressure",
      value: pressure ?? 0,
      decimals: 1,
      unit: "hPa",
      detail:
        pressure !== null && pressure3h !== undefined
          ? `${pressure - pressure3h >= 0 ? "+" : "−"}${Math.abs(pressure - pressure3h).toFixed(1)} hPa over 3 h`
          : "No 3 h trend",
      trend: pressure !== null ? trendOf(pressure, pressure3h, 0.5) : "steady",
      icon: "gauge",
    },
    {
      id: "temperature",
      label: "Temperature",
      value: temp ?? 0,
      decimals: 1,
      unit: "°C",
      detail: temps.length
        ? `24 h max ${Math.max(...temps).toFixed(1)} · min ${Math.min(...temps).toFixed(1)}`
        : "No 24 h range",
      trend: temp !== null ? trendOf(temp, hoursAgo(obs, "temp", 3), 0.5) : "steady",
      icon: "thermometer",
    },
    {
      id: "humidity",
      label: "Humidity",
      value: hum ?? 0,
      decimals: 0,
      unit: "%",
      detail: dew !== null ? `Dew point ${dew.toFixed(1)} °C` : "Dew point n/a",
      trend: hum !== null ? trendOf(hum, hoursAgo(obs, "hum", 3), 3) : "steady",
      icon: "droplets",
    },
    {
      id: "rain",
      label: "Rain since 9am",
      value: rainSince9,
      decimals: 1,
      unit: "mm",
      detail: `72 h total ${round(rain72, 1).toFixed(1)} mm`,
      trend: increments[increments.length - 1] > 0 ? "up" : "steady",
      icon: "cloud-rain",
    },
  ]

  return {
    observedAt: new Date(newest.at).toISOString(),
    current,
    conditions,
    hourly,
    windRose,
    windRoseHours: Math.round((newest.at - obs[0].at) / 3_600_000),
  }
}

const fallback: Observations = {
  observedAt: null,
  current: simulatedWind,
  conditions: simulatedConditions.filter((c) => c.id !== "waves"),
  hourly: simulatedHourly,
  windRose: simulatedWindRose,
  windRoseHours: 30 * 24,
}

export const getObservations = () =>
  withFallback("BOM observations", fallback, async () =>
    parse(await fetchJson<BomResponse>(URL, { revalidate: 600 })),
  )
