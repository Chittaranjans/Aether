import { type FormEvent, type ReactNode, useMemo, useState } from 'react'
import { storeWeatherData } from '../api/client'
import { clampDateRange, daysAgoISO, todayISO } from '../utils/weather'
import { LoadingDots } from './LoadingDots'

interface InputPanelProps {
  onStored: (fileName: string) => void
  compact?: boolean
}

const PRESETS = [
  { label: 'Mumbai', latitude: 19.076, longitude: 72.8777 },
  { label: 'London', latitude: 51.5074, longitude: -0.1278 },
  { label: 'New York', latitude: 40.7128, longitude: -74.006 },
  { label: 'Tokyo', latitude: 35.6762, longitude: 139.6503 },
  { label: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
]

export function InputPanel({ onStored, compact = false }: InputPanelProps) {
  const [latitude, setLatitude] = useState('19.0760')
  const [longitude, setLongitude] = useState('72.8777')
  const [startDate, setStartDate] = useState(daysAgoISO(21))
  const [endDate, setEndDate] = useState(daysAgoISO(7))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successFile, setSuccessFile] = useState<string | null>(null)

  const clientHint = useMemo(
    () => clampDateRange(startDate, endDate),
    [startDate, endDate],
  )

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccessFile(null)

    const lat = Number(latitude)
    const lon = Number(longitude)

    if (Number.isNaN(lat) || lat < -90 || lat > 90) {
      setError('Latitude must be a number between -90 and 90')
      return
    }
    if (Number.isNaN(lon) || lon < -180 || lon > 180) {
      setError('Longitude must be a number between -180 and 180')
      return
    }
    if (clientHint) {
      setError(clientHint)
      return
    }

    setLoading(true)
    try {
      const result = await storeWeatherData({
        latitude: lat,
        longitude: lon,
        start_date: startDate,
        end_date: endDate,
      })
      setSuccessFile(result.file)
      onStored(result.file)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to store weather data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className={`surface rounded-2xl ${compact ? 'p-5' : 'p-5 md:p-6'}`}>
      {!compact ? (
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            Ingest
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-text md:text-3xl">
            Pull historical weather
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
            Choose a location and up to 31 days. Aether fetches Open-Meteo archive data and
            stores the full JSON response for later review.
          </p>
        </div>
      ) : null}

      <div className="mb-5 flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              setLatitude(preset.latitude.toFixed(4))
              setLongitude(preset.longitude.toFixed(4))
            }}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text transition hover:border-accent hover:bg-accent-soft"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Latitude" htmlFor="latitude">
            <input
              id="latitude"
              type="number"
              step="any"
              min={-90}
              max={90}
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="field-input"
              required
            />
          </Field>
          <Field label="Longitude" htmlFor="longitude">
            <input
              id="longitude"
              type="number"
              step="any"
              min={-180}
              max={180}
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="field-input"
              required
            />
          </Field>
          <Field label="Start date" htmlFor="start_date">
            <input
              id="start_date"
              type="date"
              max={todayISO()}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="field-input"
              required
            />
          </Field>
          <Field label="End date" htmlFor="end_date">
            <input
              id="end_date"
              type="date"
              max={todayISO()}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="field-input"
              required
            />
          </Field>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <LoadingDots label="Fetching & storing" /> : 'Fetch & Store Data'}
          </button>
          <p className="text-xs text-text-muted">
            Max range: 31 days · Archive data only (no future dates)
          </p>
        </div>
      </form>

      {error ? (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {error}
        </div>
      ) : null}

      {successFile ? (
        <div className="mt-4 rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-text">
          Stored as{' '}
          <span className="break-all font-semibold text-accent">{successFile}</span>
        </div>
      ) : null}
    </section>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: ReactNode
}) {
  return (
    <label htmlFor={htmlFor} className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
        {label}
      </span>
      {children}
    </label>
  )
}
