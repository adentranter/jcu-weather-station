export function SiteFooter() {
  return (
    <footer className="mt-24 border-t bg-navy-950/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 text-sm text-muted-foreground sm:px-8 md:grid-cols-2">
        <div className="space-y-3">
          <p className="text-foreground">cyclone testing station · prototype</p>
          <p>
            Observations, sea state, tides, warnings and river gauges come from the Bureau
            of Meteorology, Queensland Government open data and DataQuoll; any feed that is
            unavailable falls back to simulated values, marked in Data sources. Not for
            emergency decisions — follow official warnings. Data is generally under Creative
            Commons Attribution licences; check each dataset page for current terms.
          </p>
          <a
            href="https://www.jcu.edu.au/cyclone-testing-station"
            target="_blank"
            rel="noreferrer"
            className="inline-block text-foreground/80 underline-offset-4 hover:text-foreground hover:underline"
          >
            jcu.edu.au/cyclone-testing-station →
          </a>
        </div>
        <p className="leading-relaxed">
          We acknowledge Aboriginal People and Torres Strait Islander People as the first
          inhabitants of the nation, and acknowledge the Traditional Custodians of the
          lands where we live, learn and work.
        </p>
      </div>
    </footer>
  )
}
