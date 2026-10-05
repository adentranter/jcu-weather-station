import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CloudRain,
  Droplets,
  Gauge,
  Thermometer,
  Waves,
  Wind,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  AnimatedNumber,
  HoverLift,
  Stagger,
  StaggerItem,
} from "@/components/dashboard/motion"
import { conditions, type Condition } from "@/lib/dashboard-data"

const icons: Record<Condition["icon"], typeof Wind> = {
  wind: Wind,
  gauge: Gauge,
  thermometer: Thermometer,
  droplets: Droplets,
  "cloud-rain": CloudRain,
  waves: Waves,
}

const trends = {
  up: { icon: ArrowUpRight, label: "Rising" },
  down: { icon: ArrowDownRight, label: "Falling" },
  steady: { icon: ArrowRight, label: "Steady" },
}

export function ConditionCards() {
  return (
    <Stagger className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {conditions.map((condition) => {
        const Icon = icons[condition.icon]
        const trend = trends[condition.trend]
        const TrendIcon = trend.icon
        return (
          <StaggerItem key={condition.id}>
            <HoverLift>
              <Card className="h-full transition-colors hover:ring-foreground/20">
                <CardContent className="flex h-full flex-col gap-3">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-2 text-xs tracking-wide uppercase">
                      <Icon className="size-3.5 text-wind" aria-hidden />
                      {condition.label}
                    </span>
                    <TrendIcon className="size-3.5" aria-label={trend.label} />
                  </div>
                  <p className="text-3xl font-light tracking-tight">
                    <AnimatedNumber value={condition.value} decimals={condition.decimals} />
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      {condition.unit}
                    </span>
                  </p>
                  <p className="mt-auto text-xs text-muted-foreground">{condition.detail}</p>
                </CardContent>
              </Card>
            </HoverLift>
          </StaggerItem>
        )
      })}
    </Stagger>
  )
}
