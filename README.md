# JCU Weather Station

A prototype dashboard for the [JCU Cyclone Testing Station](https://www.jcu.edu.au/cyclone-testing-station) in Townsville: wind, pressure, sea state, tides, cyclone history and the public datasets behind them.

Conditions, coastal, tide, alert and flood values are fetched server-side from public feeds (see `lib/sources/`) and cached for 10–30 minutes. If a feed is unreachable, that section falls back to the simulated values in `lib/dashboard-data.ts` and its dataset badge says so.

| Feed | Source | Key |
| --- | --- | --- |
| Townsville observations | BOM `IDQ60801.94294.json` | none |
| Wave buoy | QLD Coastal Data System near real-time CSV | none |
| Tide gauge + predicted high/low | Maritime Safety Queensland via data.qld.gov.au | none |
| Incidents + river gauges | [DataQuoll](https://dataquoll.io) | `DATAQUOLL_API_KEY` |
| Cyclone history | BOM Tropical Cyclone Database, pre-filtered into `data/townsville-cyclones.json` | none |

Built with Next.js, Tailwind CSS, shadcn/ui, Framer Motion and Recharts.

## Development

```bash
npm install
echo "DATAQUOLL_API_KEY=eak_live_..." > .env.local
npm run dev
```

Without `DATAQUOLL_API_KEY` the alerts section shows its fallback; everything else still loads.

Regenerate the cyclone history from the latest BOM database:

```bash
npm run build:cyclones
```

Production build (make sure `NODE_ENV` is not set to `development` in your shell):

```bash
NODE_ENV=production npm run build
```

## Docker

Pushes to `main` build a `linux/amd64` image and publish it to GHCR via `.github/workflows/docker-publish.yml`:

```
ghcr.io/adentranter/jcu-weather-station:latest
```

The container serves on port `3000`. Set `DATAQUOLL_API_KEY` as a runtime environment variable (in Coolify, not as a build arg); the page renders at request time, so the key never needs to be in the image. If the `COOLIFY_WEBHOOK` and `COOLIFY_TOKEN` repository secrets are set, the workflow also triggers a Coolify deployment.
