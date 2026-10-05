import { Badge } from "@/components/ui/badge"
import { snapshot } from "@/lib/dashboard-data"

const links = [
  { href: "#conditions", label: "conditions" },
  { href: "#coastal", label: "coastal" },
  { href: "#cyclones", label: "cyclones" },
  { href: "#data", label: "data" },
]

export function SiteHeader() {
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
        <Badge variant="outline" className="gap-1.5 border-gust/40 text-gust">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-gust opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex size-1.5 rounded-full bg-gust" />
          </span>
          {snapshot.label.toLowerCase()}
        </Badge>
      </div>
    </header>
  )
}
