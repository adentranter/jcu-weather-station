import { Badge } from "@/components/ui/badge"
import type { Snapshot } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"

const links = [
  { href: "#conditions", label: "conditions" },
  { href: "#coastal", label: "coastal" },
  { href: "#alerts", label: "alerts" },
  { href: "#cyclones", label: "cyclones" },
  { href: "#data", label: "data" },
]

export function SiteHeader({ snapshot }: { snapshot: Snapshot }) {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-foreground/90 bg-navy-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <a href="#top" className="text-lg font-semibold tracking-tight sm:text-xl">
          cyclone testing station
        </a>
        <nav aria-label="Sections" className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-foreground/70 transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <Badge
          variant="outline"
          className={cn("gap-1.5", snapshot.live ? "border-sea/40 text-sea" : "border-gust/40 text-gust")}
        >
          <span className="relative flex size-1.5">
            <span
              className={cn(
                "absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:hidden",
                snapshot.live ? "bg-sea" : "bg-gust",
              )}
            />
            <span
              className={cn("relative inline-flex size-1.5 rounded-full", snapshot.live ? "bg-sea" : "bg-gust")}
            />
          </span>
          {snapshot.label.toLowerCase()}
        </Badge>
      </div>
    </header>
  )
}
