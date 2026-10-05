import { cn } from "@/lib/utils"

export function SectionHeading({
  id,
  title,
  description,
  className,
}: {
  id?: string
  title: string
  description?: string
  className?: string
}) {
  return (
    <div id={id} className={cn("scroll-mt-24 space-y-1.5", className)}>
      <h2 className="eyebrow">{title}</h2>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}
