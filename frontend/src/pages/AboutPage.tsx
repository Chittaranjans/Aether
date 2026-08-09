import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'

export function AboutPage() {
  return (
    <div className="fade-in">
      <PageHeader
        eyebrow="Product"
        title="About Aether"
        description="A focused weather intelligence MVP for ingesting historical climate signals, storing raw archives, and exploring temperature risk patterns."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface rounded-2xl p-6">
          <h2 className="font-display text-2xl font-semibold text-text">What it does</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-text-muted">
            <li>Fetches Open-Meteo daily historical weather for a location and date range.</li>
            <li>Persists the complete API JSON to object storage for auditability.</li>
            <li>Surfaces dashboards, charts, and paginated daily tables from stored files.</li>
            <li>Keeps analysis off live API chatter by working from archives you’ve already saved.</li>
          </ul>
        </section>

        <section className="surface rounded-2xl p-6">
          <h2 className="font-display text-2xl font-semibold text-text">Platform stack</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-text-muted">
            <li>Backend: FastAPI, validation layer, Open-Meteo client, storage abstraction.</li>
            <li>Storage: local filesystem for development, Google Cloud Storage for cloud.</li>
            <li>Frontend: React, Tailwind, Recharts, light/dark product themes.</li>
            <li>Deploy path: container-ready API for Cloud Run or equivalent.</li>
          </ul>
        </section>
      </div>

      <div className="mt-6 surface rounded-2xl p-6 md:flex md:items-center md:justify-between md:gap-6">
        <div>
          <h2 className="font-display text-2xl font-semibold text-text">Start exploring</h2>
          <p className="mt-2 max-w-xl text-sm text-text-muted">
            Ingest a location, review archives, and open Insights for temperature deep-dives.
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 md:mt-0">
          <Link to="/explore" className="btn-primary">
            Explore data
          </Link>
          <Link to="/dashboard" className="btn-secondary">
            View dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
