import { Droplets, Flame, TriangleAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Reveal } from "@/components/dashboard/motion"
import type { AlertData, FloodClass, Incident } from "@/lib/sources/dataquoll"
import { cn } from "@/lib/utils"

const MAX_INCIDENTS = 8

const warningTone: Record<string, { label: string; className: string }> = {
  emergency: { label: "Emergency", className: "border-chart-5 bg-chart-5/15 text-chart-5" },
  emergency_warning: { label: "Emergency", className: "border-chart-5 bg-chart-5/15 text-chart-5" },
  watch_and_act: { label: "Watch and act", className: "border-gust/60 text-gust" },
  advice: { label: "Advice", className: "border-wind/40 text-wind" },
  none: { label: "Info", className: "border-border text-muted-foreground" },
}

const floodTone: Record<FloodClass, { label: string; className: string }> = {
  major: { label: "Major", className: "border-chart-5 bg-chart-5/15 text-chart-5" },
  moderate: { label: "Moderate", className: "border-gust/60 text-gust" },
  minor: { label: "Minor", className: "border-wind/40 text-wind" },
  below_minor: { label: "Below minor", className: "border-sea/40 text-sea" },
  stale: { label: "Stale", className: "border-border text-muted-foreground" },
  unclassified: { label: "No class", className: "border-border text-muted-foreground" },
}

const updatedFormat = new Intl.DateTimeFormat("en-AU", {
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "Australia/Brisbane",
})

const when = (iso: string | null) => (iso ? updatedFormat.format(new Date(iso)) : null)

const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())

function IncidentRow({ incident }: { incident: Incident }) {
  const tone = warningTone[incident.warningLevel] ?? warningTone.none
  const Icon = incident.eventType === "bushfire" ? Flame : TriangleAlert
  return (
    <li className="flex gap-3 py-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm leading-snug">{incident.title}</p>
        <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className={cn("text-[10px]", tone.className)}>
            {tone.label}
          </Badge>
          <span className="capitalize">{incident.status}</span>
          {incident.place ? <span>{titleCase(incident.place)}</span> : null}
          {when(incident.updatedAt) ? <span>Updated {when(incident.updatedAt)}</span> : null}
        </p>
      </div>
    </li>
  )
}

function Unavailable({ message }: { message: string }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{message}</p>
}

export function AlertsPanel({
  alerts,
  live,
  error,
  updated,
}: {
  alerts: AlertData
  live: boolean
  error?: string
  updated: string | null
}) {
  const offline = !live
    ? error?.includes("DATAQUOLL_API_KEY")
      ? "Set DATAQUOLL_API_KEY to load live warnings and river gauges."
      : "DataQuoll is unreachable right now. Check official warnings at qld.gov.au/alerts."
    : null
  const shown = alerts.incidents.slice(0, MAX_INCIDENTS)
  const hidden = alerts.incidents.length - shown.length

  return (
    <div className="space-y-3">
      <div className="grid gap-4 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Warnings and incidents</CardTitle>
              <CardDescription>
                Ingham to Bowen, inland to Charters Towers
                {updated ? ` · checked ${updated}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {offline ? (
                <Unavailable message={offline} />
              ) : shown.length === 0 ? (
                <Unavailable message="No active warnings or incidents in the region." />
              ) : (
                <ul className="divide-y divide-border">
                  {shown.map((incident) => (
                    <IncidentRow key={incident.id} incident={incident} />
                  ))}
                </ul>
              )}
              {hidden > 0 ? (
                <p className="pt-2 text-xs text-muted-foreground">and {hidden} more lower-priority items</p>
              ) : null}
            </CardContent>
          </Card>
        </Reveal>

        <Reveal className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>River gauges</CardTitle>
              <CardDescription>Latest level against BOM flood classes</CardDescription>
            </CardHeader>
            <CardContent>
              {offline ? (
                <Unavailable message={offline} />
              ) : alerts.gauges.length === 0 ? (
                <Unavailable message="No classified river gauges reporting in the region." />
              ) : (
                <ul className="divide-y divide-border">
                  {alerts.gauges.map((gauge) => {
                    const tone = floodTone[gauge.floodClass]
                    return (
                      <li key={gauge.id} className="flex items-start gap-3 py-2.5">
                        <Droplets className="mt-0.5 size-4 shrink-0 text-sea" aria-hidden />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm leading-snug">{gauge.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {gauge.river}
                            {gauge.lga ? ` · ${gauge.lga}` : ""}
                            {when(gauge.observedAt) ? ` · ${when(gauge.observedAt)}` : ""}
                          </p>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-sm tabular-nums">
                            {gauge.level !== null ? `${gauge.level.toFixed(2)} m` : "—"}
                          </p>
                          <Badge variant="outline" className={cn("text-[10px]", tone.className)}>
                            {tone.label}
                          </Badge>
                          {typeof gauge.thresholds?.minor === "number" ? (
                            <p className="text-[10px] text-muted-foreground tabular-nums">
                              minor {gauge.thresholds?.minor} m
                            </p>
                          ) : null}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </Reveal>
      </div>
      <p className="text-xs text-muted-foreground">{alerts.disclaimer}</p>
    </div>
  )
}
