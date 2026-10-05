# JCU Weather Station

A prototype dashboard for the [JCU Cyclone Testing Station](https://www.jcu.edu.au/cyclone-testing-station) in Townsville: wind, pressure, sea state, tides, cyclone history and the public datasets behind them.

Live-looking values are simulated (see `lib/dashboard-data.ts`); dataset references are in `breakdown.json`.

Built with Next.js, Tailwind CSS, shadcn/ui, Framer Motion and Recharts.

## Development

```bash
npm install
npm run dev
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

The container serves on port `3000`. If the `COOLIFY_WEBHOOK` and `COOLIFY_TOKEN` repository secrets are set, the workflow also triggers a Coolify deployment.
