import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { InputPanel } from '../components/InputPanel'
import { PageHeader } from '../components/PageHeader'

export function ExplorePage() {
  const navigate = useNavigate()
  const [lastFile, setLastFile] = useState<string | null>(null)

  return (
    <div className="fade-in">
      <PageHeader
        eyebrow="Data pipeline"
        title="Explore & ingest"
        description="Fetch historical daily weather for a location, validate the range, and persist the raw archive to object storage."
        actions={
          lastFile ? (
            <Link to={`/insights/${encodeURIComponent(lastFile)}`} className="btn-primary">
              Open insights
            </Link>
          ) : (
            <Link to="/files" className="btn-secondary">
              Browse archives
            </Link>
          )
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <InputPanel
          onStored={(fileName) => {
            setLastFile(fileName)
          }}
        />

        <aside className="surface rounded-2xl p-5 md:p-6">
          <h2 className="font-display text-2xl font-semibold text-text">How ingest works</h2>
          <ol className="mt-4 space-y-4 text-sm text-text-muted">
            <li>
              <span className="font-semibold text-text">1. Validate</span>
              <p className="mt-1">
                Latitude, longitude, and a date window of at most 31 days are checked before
                any upstream call.
              </p>
            </li>
            <li>
              <span className="font-semibold text-text">2. Fetch</span>
              <p className="mt-1">
                Open-Meteo returns daily max/min and apparent temperature series for the
                requested range.
              </p>
            </li>
            <li>
              <span className="font-semibold text-text">3. Store</span>
              <p className="mt-1">
                The full JSON lands in object storage with a timestamped filename for later
                dashboard and insight views.
              </p>
            </li>
          </ol>

          {lastFile ? (
            <div className="mt-6 rounded-xl border border-accent/30 bg-accent-soft p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                Latest ingest
              </p>
              <p className="mt-2 break-all text-sm font-semibold text-text">{lastFile}</p>
              <button
                type="button"
                className="btn-primary mt-4 w-full"
                onClick={() => navigate(`/insights/${encodeURIComponent(lastFile)}`)}
              >
                Analyze this archive
              </button>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
