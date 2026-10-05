import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Stagger, StaggerItem } from "@/components/dashboard/motion"
import { cyclones, type CycloneEvent } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"

const categoryTone: Record<CycloneEvent["category"], string> = {
  1: "border-sea/40 text-sea",
  2: "border-wind/40 text-wind",
  3: "border-gust/40 text-gust",
  4: "border-chart-5/40 text-chart-5",
  5: "border-chart-5 bg-chart-5/15 text-chart-5",
}

export function CycloneHistory() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Notable North Queensland landfalls</CardTitle>
        <CardDescription>From BOM cyclone history · categories at landfall</CardDescription>
      </CardHeader>
      <CardContent>
        <Stagger className="relative space-y-1">
          <div className="absolute top-2 bottom-2 left-20 w-px bg-border" aria-hidden />
          {cyclones.map((event) => (
            <StaggerItem
              key={event.name}
              className="group relative grid grid-cols-[4rem_1fr] gap-4 rounded-lg py-2.5 pr-2"
            >
              <div className="text-right">
                <p className="text-sm tabular-nums">{event.year}</p>
                <p className="text-xs text-muted-foreground">{event.date}</p>
              </div>
              <div className="relative pl-4">
                <span
                  className="absolute top-1.5 -left-1 size-2 rounded-full bg-foreground/40 ring-4 ring-navy-900 transition-colors group-hover:bg-gust"
                  aria-hidden
                />
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{event.name}</p>
                  <Badge variant="outline" className={cn("text-[10px]", categoryTone[event.category])}>
                    Cat {event.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{event.landfall}</span>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{event.note}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </CardContent>
    </Card>
  )
}
