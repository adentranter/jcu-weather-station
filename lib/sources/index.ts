import "server-only"

import { datasets, type Dataset, type DataStatus, type Snapshot } from "@/lib/dashboard-data"
import { getObservations } from "./bom"
import { getAlerts } from "./dataquoll"
import { TIME_ZONE } from "./http"
import { getTides } from "./tides"
import { getWaves } from "./waves"

const DAY = 86_400_000

const takenAtFormat = new Intl.DateTimeFormat("en-AU", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: TIME_ZONE,
})

const timeFormat = new Intl.DateTimeFormat("en-AU", {
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: TIME_ZONE,
})

export const formatTime = (iso: string | null) => (iso ? timeFormat.format(new Date(iso)) : null)

// Season runs 1 Nov – 30 Apr; Queensland has no daylight saving, so AEST is UTC+10 all year.
function season(now: number) {
  const local = new Date(now + 10 * 3_600_000)
  const year = local.getUTCFullYear()
  const month = local.getUTCMonth()
  const inSeason = month >= 10 || month <= 3
  const start = Date.UTC(month <= 3 ? year - 1 : year, 10, 1)
  const today = Date.UTC(year, month, local.getUTCDate())
  return {
    seasonStart: `1 Nov ${new Date(start).getUTCFullYear()}`,
    daysToSeason: inSeason ? 0 : Math.round((start - today) / DAY),
  }
}

const live = (ok: boolean, whenDown: DataStatus = "simulated"): DataStatus => (ok ? "live" : whenDown)

export async function getDashboardData() {
  const [observations, waves, tides, alerts] = await Promise.all([
    getObservations(),
    getWaves(),
    getTides(),
    getAlerts(),
  ])

  const observedAt = observations.data.observedAt
  const snapshot: Snapshot = {
    label: observations.live ? "Live" : "Simulated snapshot",
    live: observations.live,
    takenAt: observedAt
      ? `${takenAtFormat.format(new Date(observedAt))} AEST`
      : "Simulated values",
    ...season(Date.now()),
  }

  const statuses: Record<string, DataStatus> = {
    bom_townsville_observations: live(observations.live),
    qld_waves_townsville: live(waves.live),
    townsville_tide_gauge: live(tides.live),
    townsville_tides: live(tides.live),
    dataquoll: live(alerts.live, "offline"),
  }

  const datasetsWithStatus: Dataset[] = datasets.map((d) => ({
    ...d,
    status: statuses[d.id] ?? d.status,
  }))

  return {
    snapshot,
    observations,
    waves,
    tides,
    alerts,
    conditions: [...observations.data.conditions, waves.data.condition],
    datasets: datasetsWithStatus,
  }
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>
