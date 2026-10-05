import { connection } from "next/server"
import { AlertsPanel } from "@/components/dashboard/alerts-panel"
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
import { formatTime, getDashboardData } from "@/lib/sources"

export default async function Home() {
  // Render per request so runtime env (DATAQUOLL_API_KEY) applies; fetches stay cached via revalidate.
  await connection()
  const { snapshot, observations, waves, tides, alerts, conditions, datasets } =
    await getDashboardData()

  return (
    <>
      <SiteHeader snapshot={snapshot} />
      <main className="flex-1">
        <Hero snapshot={snapshot} />

        <div className="mx-auto max-w-6xl space-y-20 px-5 sm:px-8">
          <section className="space-y-6">
            <SectionHeading
              id="conditions"
              title="Conditions"
              description={`Townsville Aero · ${snapshot.takenAt}`}
            />
            <ConditionCards conditions={conditions} />
            <div className="grid gap-4 lg:grid-cols-3">
              <Reveal className="lg:col-span-2">
                <TrendChart hourly={observations.data.hourly} />
              </Reveal>
              <Reveal>
                <WindCompass
                  current={observations.data.current}
                  windRose={observations.data.windRose}
                  windowHours={observations.data.windRoseHours}
                />
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
                <CoastalCard
                  coastal={waves.data.coastal}
                  waveDirection={waves.data.direction}
                  waveHistory={waves.data.history}
                  updated={formatTime(waves.data.observedAt)}
                />
              </Reveal>
              <Reveal>
                <TideCard
                  tide={tides.data.series}
                  nextTides={tides.data.next}
                  latestLevel={tides.data.latestLevel}
                />
              </Reveal>
              <Reveal className="md:col-span-2 lg:col-span-1">
                <ReadinessCard />
              </Reveal>
            </div>
          </section>

          <section className="space-y-6">
            <SectionHeading
              id="alerts"
              title="Alerts and flooding"
              description="Official warnings and river gauges across North Queensland."
            />
            <AlertsPanel
              alerts={alerts.data}
              live={alerts.live}
              error={alerts.error}
              updated={formatTime(alerts.fetchedAt)}
            />
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
              description="Public datasets behind this dashboard, and whether each one is live right now."
            />
            <DatasetGrid datasets={datasets} />
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
