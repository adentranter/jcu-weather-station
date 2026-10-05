import { ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HoverLift, Stagger, StaggerItem } from "@/components/dashboard/motion"
import { datasets, type DataStatus } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"

const statusTone: Record<DataStatus, { label: string; className: string }> = {
  simulated: { label: "Simulated", className: "border-gust/40 text-gust" },
  historical: { label: "Historical", className: "border-sea/40 text-sea" },
  planned: { label: "Planned", className: "border-border text-muted-foreground" },
}

export function DatasetGrid() {
  return (
    <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {datasets.map((dataset) => {
        const status = statusTone[dataset.status]
        return (
          <StaggerItem key={dataset.id}>
            <HoverLift>
              <a
                href={dataset.url}
                target="_blank"
                rel="noreferrer"
                className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card className="h-full transition-colors group-hover:ring-foreground/20">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className={cn("text-[10px]", status.className)}>
                        {status.label}
                      </Badge>
                      <ArrowUpRight
                        className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
                        aria-hidden
                      />
                    </div>
                    <CardTitle className="pt-2">{dataset.name}</CardTitle>
                    <CardDescription>
                      {dataset.provider} · {dataset.coverage}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-foreground/75">{dataset.description}</p>
                    <ul className="flex flex-wrap gap-1.5">
                      {dataset.variables.map((variable) => (
                        <li
                          key={variable}
                          className="rounded-full bg-muted/60 px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {variable}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </a>
            </HoverLift>
          </StaggerItem>
        )
      })}
    </Stagger>
  )
}
