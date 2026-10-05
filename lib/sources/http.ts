import "server-only"

export type SourceResult<T> = {
  data: T
  live: boolean
  fetchedAt: string | null
  error?: string
}

export const TIME_ZONE = "Australia/Brisbane"

// BOM returns 403 for descriptive bot UAs (e.g. "compatible; ...; +url") but accepts this.
const USER_AGENT = "Mozilla/5.0"

type FetchOptions = {
  revalidate: number
  headers?: Record<string, string>
  timeoutMs?: number
}

async function request(url: string, { revalidate, headers, timeoutMs = 10_000 }: FetchOptions) {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, ...headers },
    next: { revalidate },
    signal: AbortSignal.timeout(timeoutMs),
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} from ${new URL(url).host}`)
  return res
}

export async function fetchText(url: string, options: FetchOptions) {
  return (await request(url, options)).text()
}

export async function fetchJson<T>(url: string, options: FetchOptions): Promise<T> {
  return (await request(url, options)).json() as Promise<T>
}

export async function withFallback<T>(
  name: string,
  fallback: T,
  load: () => Promise<T>,
): Promise<SourceResult<T>> {
  try {
    const data = await load()
    return { data, live: true, fetchedAt: new Date().toISOString() }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    console.warn(`[sources] ${name} unavailable, using fallback: ${error}`)
    return { data: fallback, live: false, fetchedAt: null, error }
  }
}

export const COMPASS = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
] as const

export const compassDegrees = (label: string) => {
  const i = COMPASS.indexOf(label as (typeof COMPASS)[number])
  return i < 0 ? null : i * 22.5
}

export const compassLabel = (degrees: number) =>
  COMPASS[Math.round((((degrees % 360) + 360) % 360) / 22.5) % 16]

export const round = (n: number, d = 1) => Math.round(n * 10 ** d) / 10 ** d

export const trendOf = (now: number, before: number | undefined, threshold: number) => {
  if (before === undefined) return "steady" as const
  const delta = now - before
  if (delta > threshold) return "up" as const
  if (delta < -threshold) return "down" as const
  return "steady" as const
}
