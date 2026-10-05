import { BatteryMedium, FlaskConical, RadioTower } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { labQueue, swirlnet, type SwirlnetTower } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"

const towerTone: Record<SwirlnetTower["state"], string> = {
  ready: "bg-sea",
  deployed: "bg-wind",
  maintenance: "bg-gust",
}

export function ReadinessCard() {
  const ready = swirlnet.filter((t) => t.state === "ready").length

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Station readiness</CardTitle>
        <CardDescription>SWIRLnet towers and the materials lab</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <RadioTower className="size-4 text-wind" aria-hidden />
              SWIRLnet towers
            </span>
            <span className="tabular-nums">
              {ready}/{swirlnet.length} ready
            </span>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {swirlnet.map((tower) => (
              <Tooltip key={tower.id}>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      className="group flex flex-col items-center gap-1.5 rounded-md py-2 outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  }
                >
                  <span className={cn("size-2 rounded-full", towerTone[tower.state])} />
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {tower.id.slice(3)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <span className="flex items-center gap-1.5">
                    {tower.id} · {tower.state} · {tower.location}
                    <BatteryMedium className="size-3" aria-hidden />
                    {tower.battery}%
                  </span>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
          <div className="flex gap-3 text-[11px] text-muted-foreground">
            {(Object.keys(towerTone) as SwirlnetTower["state"][]).map((state) => (
              <span key={state} className="flex items-center gap-1.5 capitalize">
                <span className={cn("size-1.5 rounded-full", towerTone[state])} />
                {state}
              </span>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <FlaskConical className="size-4 text-wind" aria-hidden />
              Lab queue
            </span>
            <Badge variant="outline" className="text-[10px] text-muted-foreground">
              NATA accredited
            </Badge>
          </div>
          {labQueue.map((test) => (
            <Progress key={test.specimen} value={test.progress} className="gap-1.5">
              <ProgressLabel className="text-sm font-normal">{test.specimen}</ProgressLabel>
              <ProgressValue className="text-xs" />
              <p className="-mt-1 w-full text-xs text-muted-foreground">{test.method}</p>
            </Progress>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
