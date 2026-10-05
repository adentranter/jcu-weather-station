import { CoastalCard, TideCard } from "@/components/dashboard/coastal-card"
import { ConditionCards } from "@/components/dashboard/condition-cards"
import { CycloneHistory } from "@/components/dashboard/cyclone-history"
import { DatasetGrid } from "@/components/dashboard/dataset-grid"
import { Hero } from "@/components/dashboard/hero"
import { Reveal } from "@/components/dashboard/motion"
import { ReadinessCard } from "@/components/dashboard/readiness-card"
import { SectionHeading } from "@/components/dashboard/section-heading"
import { SiteFooter } from "@/components/dashboard/site-footer"
import { SiteHeader } from "@/components/dashboard/site-header"
import { TrendChart } from "@/components/dashboard/trend-chart"
import { WindCompass } from "@/components/dashboard/wind-compass"
import { snapshot } from "@/lib/dashboard-data"

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />

        <div className="mx-auto max-w-6xl space-y-20 px-5 sm:px-8">
          <section className="space-y-6">
            <SectionHeading
              id="conditions"
              title="Conditions"
              description={`Townsville Aero · ${snapshot.takenAt}`}
            />
            <ConditionCards />
            <div className="grid gap-4 lg:grid-cols-3">
              <Reveal className="lg:col-span-2">
                <TrendChart />
              </Reveal>
              <Reveal>
                <WindCompass />
              </Reveal>
            </div>
          </section>

          <section className="space-y-6">
            <SectionHeading
              id="coastal"
              title="Coastal"
              description="Wave climate and water level for surge context."
            />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Reveal>
                <CoastalCard />
              </Reveal>
              <Reveal>
                <TideCard />
              </Reveal>
              <Reveal className="md:col-span-2 lg:col-span-1">
                <ReadinessCard />
              </Reveal>
            </div>
          </section>

          <section className="space-y-6">
            <SectionHeading
              id="cyclones"
              title="Cyclones"
              description="The events that shaped how we build in the north."
            />
            <Reveal>
              <CycloneHistory />
            </Reveal>
          </section>

          <section className="space-y-6">
            <SectionHeading
              id="data"
              title="Data sources"
              description="Public datasets this dashboard is designed around."
            />
            <DatasetGrid />
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
