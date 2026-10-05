// Values marked `simulated` are placeholders shaped like the public feeds in
// breakdown.json. Swap them for real BOM / data.qld.gov.au pulls later.

export type DataStatus = "simulated" | "historical" | "planned"

export type Station = {
  name: string
  bomNumber: string
  latitude: number
  longitude: number
  elevationM: number
  dataStart: number
  status: "Open" | "Closed"
}

export type Condition = {
  id: string
  label: string
  value: number
  decimals: number
  unit: string
  detail: string
  trend: "up" | "down" | "steady"
  icon: "wind" | "gauge" | "thermometer" | "droplets" | "cloud-rain" | "waves"
}

export type HourlyReading = {
  time: string
  wind: number
  gust: number
  pressure: number
  rain: number
}

export type WindRosePetal = {
  direction: string
  degrees: number
  frequency: number
}

export type CoastalReading = {
  label: string
  value: number
  decimals: number
  unit: string
  max: number
}

export type TidePoint = {
  time: string
  level: number
}

export type CycloneEvent = {
  name: string
  year: number
  date: string
  category: 1 | 2 | 3 | 4 | 5
  landfall: string
  note: string
}

export type SwirlnetTower = {
  id: string
  location: string
  state: "ready" | "deployed" | "maintenance"
  battery: number
}

export type LabTest = {
  specimen: string
  method: string
  progress: number
}

export type Dataset = {
  id: string
  name: string
  provider: string
  description: string
  variables: string[]
  coverage: string
  url: string
  status: DataStatus
}

export const snapshot = {
  label: "Simulated snapshot",
  takenAt: "Tue 6 Oct 2026, 06:00 AEST",
  seasonStart: "1 Nov 2026",
  daysToSeason: 26,
}

export const station: Station = {
  name: "Townsville Aero",
  bomNumber: "032040",
  latitude: -19.25,
  longitude: 146.77,
  elevationM: 4,
  dataStart: 1940,
  status: "Open",
}

export const currentWind = {
  speed: 28,
  gust: 41,
  direction: "ESE",
  degrees: 112,
}

export const conditions: Condition[] = [
  {
    id: "wind",
    label: "Wind",
    value: currentWind.speed,
    decimals: 0,
    unit: "km/h",
    detail: `${currentWind.direction} · gusting ${currentWind.gust}`,
    trend: "up",
    icon: "wind",
  },
  {
    id: "pressure",
    label: "MSL pressure",
    value: 1009.2,
    decimals: 1,
    unit: "hPa",
    detail: "−1.4 hPa over 3 h",
    trend: "down",
    icon: "gauge",
  },
  {
    id: "temperature",
    label: "Temperature",
    value: 27.4,
    decimals: 1,
    unit: "°C",
    detail: "Max 31.2 · Min 22.8",
    trend: "steady",
    icon: "thermometer",
  },
  {
    id: "humidity",
    label: "Humidity",
    value: 68,
    decimals: 0,
    unit: "%",
    detail: "Dew point 21.0 °C",
    trend: "steady",
    icon: "droplets",
  },
  {
    id: "rain",
    label: "Rain (24 h)",
    value: 2.4,
    decimals: 1,
    unit: "mm",
    detail: "Month to date 6.0 mm",
    trend: "up",
    icon: "cloud-rain",
  },
  {
    id: "waves",
    label: "Waves (Hs)",
    value: 0.9,
    decimals: 1,
    unit: "m",
    detail: "Tp 6.8 s · from ESE",
    trend: "steady",
    icon: "waves",
  },
]

const round = (n: number, d = 1) => Math.round(n * 10 ** d) / 10 ** d

// Deterministic so server and client renders match.
export const hourly: HourlyReading[] = Array.from({ length: 24 }, (_, i) => {
  const hour = (i + 7) % 24
  const diurnal = Math.sin(((hour - 9) / 24) * Math.PI * 2)
  const wind = 20 + diurnal * 8 + Math.sin(i * 1.7) * 2.5
  const gust = wind * 1.42 + Math.cos(i * 1.3) * 3
  const pressure = 1010.4 + Math.cos((hour / 12) * Math.PI * 2) * 1.1 - i * 0.05
  const rain = hour >= 14 && hour <= 18 ? round(Math.abs(Math.sin(i)) * 0.9, 1) : 0
  return {
    time: `${String(hour).padStart(2, "0")}:00`,
    wind: round(wind),
    gust: round(gust),
    pressure: round(pressure),
    rain,
  }
})

export const windRose: WindRosePetal[] = [
  ["N", 3.1],
  ["NNE", 4.2],
  ["NE", 6.8],
  ["ENE", 9.4],
  ["E", 14.6],
  ["ESE", 16.2],
  ["SE", 12.9],
  ["SSE", 6.1],
  ["S", 3.4],
  ["SSW", 2.2],
  ["SW", 2.6],
  ["WSW", 2.1],
  ["W", 2.4],
  ["WNW", 2.9],
  ["NW", 4.8],
  ["NNW", 6.3],
].map(([direction, frequency], i) => ({
  direction: direction as string,
  degrees: i * 22.5,
  frequency: frequency as number,
}))

export const coastal: CoastalReading[] = [
  { label: "Significant height (Hs)", value: 0.9, decimals: 1, unit: "m", max: 4 },
  { label: "Maximum height (Hmax)", value: 1.6, decimals: 1, unit: "m", max: 6 },
  { label: "Peak period (Tp)", value: 6.8, decimals: 1, unit: "s", max: 16 },
  { label: "Sea surface temp", value: 26.1, decimals: 1, unit: "°C", max: 32 },
]

export const waveDirection = { label: "ESE", degrees: 115 }

export const waveHistory = Array.from({ length: 24 }, (_, i) => ({
  hour: i,
  hs: round(0.75 + Math.sin(i / 4) * 0.12 + i * 0.006, 2),
}))

export const tide: TidePoint[] = Array.from({ length: 25 }, (_, i) => ({
  time: `${String(i % 24).padStart(2, "0")}:00`,
  level: round(1.9 + Math.sin(((i - 3) / 12.4) * Math.PI * 2) * 1.2, 2),
}))

export const nextTides = [
  { type: "High", time: "09:12", level: 3.1 },
  { type: "Low", time: "15:28", level: 0.8 },
  { type: "High", time: "21:40", level: 2.9 },
]

export const cyclones: CycloneEvent[] = [
  {
    name: "Kirrily",
    year: 2024,
    date: "25 Jan",
    category: 3,
    landfall: "Townsville",
    note: "Crossed near Toomulla, north of the city.",
  },
  {
    name: "Debbie",
    year: 2017,
    date: "28 Mar",
    category: 4,
    landfall: "Airlie Beach",
    note: "Slow-moving system with prolonged damaging winds.",
  },
  {
    name: "Yasi",
    year: 2011,
    date: "3 Feb",
    category: 5,
    landfall: "Mission Beach",
    note: "Large system; damaging winds reached Townsville.",
  },
  {
    name: "Larry",
    year: 2006,
    date: "20 Mar",
    category: 4,
    landfall: "Innisfail",
    note: "Major damage to housing across the Cassowary Coast.",
  },
  {
    name: "Tessi",
    year: 2000,
    date: "3 Apr",
    category: 2,
    landfall: "Townsville",
    note: "Landslides and widespread power outages in the city.",
  },
  {
    name: "Althea",
    year: 1971,
    date: "24 Dec",
    category: 4,
    landfall: "Townsville",
    note: "Its housing damage helped lead to the Cyclone Testing Station.",
  },
]

export const swirlnet: SwirlnetTower[] = [
  { id: "SW-01", location: "Douglas depot", state: "ready", battery: 100 },
  { id: "SW-02", location: "Douglas depot", state: "ready", battery: 98 },
  { id: "SW-03", location: "Douglas depot", state: "ready", battery: 96 },
  { id: "SW-04", location: "Bowen (trial)", state: "deployed", battery: 82 },
  { id: "SW-05", location: "Workshop", state: "maintenance", battery: 41 },
  { id: "SW-06", location: "Douglas depot", state: "ready", battery: 100 },
]

export const labQueue: LabTest[] = [
  { specimen: "Roof batten connection", method: "Cyclic pressure (LIRA)", progress: 72 },
  { specimen: "Window assembly", method: "Water penetration", progress: 35 },
  { specimen: "Garage door", method: "Static pressure", progress: 10 },
]

export const datasets: Dataset[] = [
  {
    id: "bom_townsville_aero",
    name: "Townsville Aero climate data",
    provider: "Bureau of Meteorology",
    description: "Daily and monthly observations from the official airport station.",
    variables: ["wind", "gusts", "temperature", "rainfall", "pressure", "humidity"],
    coverage: "1940 – present",
    url: "https://www.bom.gov.au/climate/averages/tables/cw_032040.shtml",
    status: "simulated",
  },
  {
    id: "bom_tropical_cyclone_database",
    name: "Australian Tropical Cyclone Database",
    provider: "Bureau of Meteorology",
    description: "Best-track positions, intensity and category for the Australian region.",
    variables: ["tracks", "central pressure", "max wind", "category"],
    coverage: "1906 – present",
    url: "https://www.bom.gov.au/cyclone/tropical-cyclone-knowledge-centre/databases/",
    status: "historical",
  },
  {
    id: "bom_objective_tc_reanalysis",
    name: "Objective TC reanalysis",
    provider: "Bureau of Meteorology",
    description: "Consistent, research-grade intensity estimates for Australian cyclones.",
    variables: ["track", "intensity", "position"],
    coverage: "1981 – 2016",
    url: "https://www.bom.gov.au/cyclone/tropical-cyclone-knowledge-centre/databases/",
    status: "planned",
  },
  {
    id: "qld_waves_townsville",
    name: "Coastal Data System – Waves (Townsville)",
    provider: "Queensland Government",
    description: "Wave buoy heights, periods, direction and sea surface temperature.",
    variables: ["Hs", "Hmax", "Tz", "Tp", "direction", "SST"],
    coverage: "2013 – present",
    url: "https://www.data.qld.gov.au/dataset/coastal-data-system-waves-townsville",
    status: "simulated",
  },
  {
    id: "townsville_tides",
    name: "Townsville tide predictions",
    provider: "Queensland Government",
    description: "Predicted interval and high/low water levels for storm surge context.",
    variables: ["water level", "high/low tides"],
    coverage: "Rolling predictions",
    url: "https://www.data.qld.gov.au/dataset?q=townsville+tide",
    status: "simulated",
  },
  {
    id: "swirlnet",
    name: "SWIRLnet anemometer network",
    provider: "JCU Cyclone Testing Station",
    description: "Portable towers measuring near-ground winds during landfalling cyclones.",
    variables: ["wind speed", "gusts", "direction"],
    coverage: "Event-based",
    url: "https://www.jcu.edu.au/cyclone-testing-station",
    status: "planned",
  },
]
