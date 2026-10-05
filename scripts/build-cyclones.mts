// Builds data/townsville-cyclones.json from the BOM Australian Tropical Cyclone Database.
// Usage: npm run build:cyclones [-- path/to/IDCKMSTM0S.csv]

import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

const SOURCE = "https://www.bom.gov.au/clim_data/IDCKMSTM0S.csv"
const TOWNSVILLE = { lat: -19.25, lon: 146.77 }
const RADIUS_KM = 250
const OUT = path.join(import.meta.dirname, "..", "data", "townsville-cyclones.json")

type Track = {
  name: string
  id: string
  closestKm: number
  closestAt: string
  bearing: string
  minPressure: number | null
  maxWindKmh: number | null
  maxGustKmh: number | null
  category: 1 | 2 | 3 | 4 | 5 | null
}

const COMPASS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]

const rad = (d: number) => (d * Math.PI) / 180

function distanceKm(lat: number, lon: number) {
  const dLat = rad(lat - TOWNSVILLE.lat)
  const dLon = rad(lon - TOWNSVILLE.lon)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(TOWNSVILLE.lat)) * Math.cos(rad(lat)) * Math.sin(dLon / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(a))
}

function bearingFromTownsville(lat: number, lon: number) {
  const y = Math.sin(rad(lon - TOWNSVILLE.lon)) * Math.cos(rad(lat))
  const x =
    Math.cos(rad(TOWNSVILLE.lat)) * Math.sin(rad(lat)) -
    Math.sin(rad(TOWNSVILLE.lat)) * Math.cos(rad(lat)) * Math.cos(rad(lon - TOWNSVILLE.lon))
  const deg = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
  return COMPASS[Math.round(deg / 22.5) % 16]
}

// Australian scale is defined on the strongest gust; fall back to central pressure.
function category(gustKmh: number | null, pressure: number | null): Track["category"] {
  if (gustKmh) {
    if (gustKmh >= 280) return 5
    if (gustKmh >= 225) return 4
    if (gustKmh >= 165) return 3
    if (gustKmh >= 125) return 2
    if (gustKmh >= 90) return 1
    return null
  }
  if (pressure) {
    if (pressure < 930) return 5
    if (pressure < 955) return 4
    if (pressure < 970) return 3
    if (pressure < 985) return 2
    if (pressure < 995) return 1
  }
  return null
}

const num = (s: string | undefined) => {
  const n = Number.parseFloat(s ?? "")
  return Number.isFinite(n) && n > 0 ? n : null
}

async function loadCsv() {
  const local = process.argv[2]
  if (local) return readFile(local, "utf8")
  const res = await fetch(SOURCE, { headers: { "User-Agent": "Mozilla/5.0 (jcu-weather-station)" } })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} fetching ${SOURCE}`)
  return res.text()
}

const csv = await loadCsv()
const lines = csv.split(/\r?\n/)
const headerIndex = lines.findIndex((l) => l.startsWith("NAME,"))
if (headerIndex < 0) throw new Error("TC database header not found")
const header = lines[headerIndex].split(",").map((h) => h.trim())
const col = (name: string) => header.indexOf(name)
const c = {
  name: col("NAME"),
  id: col("DISTURBANCE_ID"),
  tm: col("TM"),
  lat: col("LAT"),
  lon: col("LON"),
  pressure: col("CENTRAL_PRES"),
  wind: col("MAX_WIND_SPD"),
  gust: col("MAX_WIND_GUST"),
}

const tracks = new Map<string, Track>()

for (const line of lines.slice(headerIndex + 1)) {
  const f = line.split(",")
  const lat = Number.parseFloat(f[c.lat] ?? "")
  const lon = Number.parseFloat(f[c.lon] ?? "")
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue
  const km = distanceKm(lat, lon)
  if (km > RADIUS_KM) continue

  const id = f[c.id].trim()
  const pressure = num(f[c.pressure])
  // BOM uses 999+ as a placeholder in older records.
  const validPressure = pressure !== null && pressure < 999 ? pressure : null
  const windKmh = num(f[c.wind]) === null ? null : Math.round(num(f[c.wind])! * 3.6)
  const gustKmh = num(f[c.gust]) === null ? null : Math.round(num(f[c.gust])! * 3.6)

  const t = tracks.get(id) ?? {
    name: f[c.name].trim(),
    id,
    closestKm: Infinity,
    closestAt: "",
    bearing: "",
    minPressure: null,
    maxWindKmh: null,
    maxGustKmh: null,
    category: null,
  }
  if (km < t.closestKm) {
    t.closestKm = Math.round(km)
    t.closestAt = f[c.tm].trim()
    t.bearing = bearingFromTownsville(lat, lon)
  }
  if (validPressure !== null && (t.minPressure === null || validPressure < t.minPressure)) t.minPressure = validPressure
  if (windKmh !== null && (t.maxWindKmh === null || windKmh > t.maxWindKmh)) t.maxWindKmh = windKmh
  if (gustKmh !== null && (t.maxGustKmh === null || gustKmh > t.maxGustKmh)) t.maxGustKmh = gustKmh
  tracks.set(id, t)
}

const result = [...tracks.values()]
  .map((t) => ({ ...t, category: category(t.maxGustKmh, t.minPressure) }))
  .sort((a, b) => b.closestAt.localeCompare(a.closestAt))

await mkdir(path.dirname(OUT), { recursive: true })
await writeFile(
  OUT,
  JSON.stringify(
    {
      source: SOURCE,
      generatedAt: new Date().toISOString(),
      radiusKm: RADIUS_KM,
      centre: TOWNSVILLE,
      cyclones: result,
    },
    null,
    2,
  ) + "\n",
)

console.log(`Wrote ${result.length} systems within ${RADIUS_KM} km of Townsville to ${path.relative(process.cwd(), OUT)}`)
