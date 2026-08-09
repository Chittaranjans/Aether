import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getWeatherFileContent, listWeatherFiles } from '../api/client'
import { ApparentGapChart } from '../components/charts/ApparentGapChart'
import { DiurnalRangeChart } from '../components/charts/DiurnalRangeChart'
import { TempDistributionChart } from '../components/charts/TempDistributionChart'
import { LoadingDots } from '../components/LoadingDots'
import { MetricCard } from '../components/MetricCard'
import { RevealOnScroll } from '../components/motion/primitives'
import { PageHeader } from '../components/PageHeader'
import { WeatherChart } from '../components/WeatherChart'
import { WeatherTable } from '../components/WeatherTable'
import { useChartTheme } from '../hooks/useChartTheme'
import type { StoredWeatherFile, WeatherFileMeta } from '../types/weather'
import { computeSeriesStats, parseCoordsFromFileName } from '../utils/analytics'
import { resolvePlaceLabel } from '../utils/locations'
import {
  extractDaily,
  extractMeta,
  formatDisplayDate,
  formatTemp,
  toDailyRows,
} from '../utils/weather'

export function InsightsPage() {
  const { fileName } = useParams()
  const navigate = useNavigate()
  const theme = useChartTheme()
  const decoded = fileName ? decodeURIComponent(fileName) : null

  const [files, setFiles] = useState<WeatherFileMeta[]>([])
  const [fileLabels, setFileLabels] = useState<Record<string, string>>({})
  const [payload, setPayload] = useState<StoredWeatherFile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void listWeatherFiles()
      .then((data) => {
        setFiles(data.files)
        const labels: Record<string, string> = {}
        for (const file of data.files) {
          const coords = parseCoordsFromFileName(file.name)
          const place = resolvePlaceLabel(coords.lat, coords.lon)
          const rangeMatch = file.name.match(
            /(\d{4}-\d{2}-\d{2})_(\d{4}-\d{2}-\d{2})_/,
          )
          const range = rangeMatch
            ? `${rangeMatch[1]} → ${rangeMatch[2]}`
            : 'archive'
          labels[file.name] = `${place.label} · ${range}`
        }
        setFileLabels(labels)
      })
      .catch(() => setFiles([]))
  }, [])

  useEffect(() => {
    if (!decoded) {
      setPayload(null)
      setError(null)
      return
    }

    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await getWeatherFileContent(decoded!)
        if (!cancelled) setPayload(data)
      } catch (err) {
        if (!cancelled) {
          setPayload(null)
          setError(err instanceof Error ? err.message : 'Failed to load file')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [decoded])

  const rows = useMemo(() => toDailyRows(extractDaily(payload)), [payload])
  const meta = useMemo(() => extractMeta(payload), [payload])
  const stats = useMemo(() => computeSeriesStats(rows), [rows])
  const place = useMemo(
    () => resolvePlaceLabel(meta?.latitude, meta?.longitude),
    [meta],
  )

  const bandSeries = useMemo(
    () =>
      rows.map((row) => ({
        label: formatDisplayDate(row.date),
        max: row.temperature_2m_max,
        min: row.temperature_2m_min,
        mid:
          row.temperature_2m_max !== null && row.temperature_2m_min !== null
            ? Number(((row.temperature_2m_max + row.temperature_2m_min) / 2).toFixed(1))
            : null,
      })),
    [rows],
  )

  const hotShare =
    stats.days > 0 ? Math.round((stats.hotDays / stats.days) * 100) : 0

  return (
    <div className="fade-in space-y-5">
      <PageHeader
        eyebrow="Insights"
        title={decoded ? `${place.label} temperature report` : 'Temperature deep dive'}
        description="Core temperature series stays front and center, with band context, diurnal volatility, apparent-temperature gaps, and a paginated daily table — all from the selected stored archive."
        actions={
          <Link to="/dashboard" className="btn-secondary">
            Back to dashboard
          </Link>
        }
      />

      <div className="surface rounded-2xl p-4 md:p-5">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
            Active archive
          </span>
          <select
            className="field-input"
            value={decoded ?? ''}
            onChange={(e) => {
              const value = e.target.value
              if (!value) navigate('/insights')
              else navigate(`/insights/${encodeURIComponent(value)}`)
            }}
          >
            <option value="">Select a stored file…</option>
            {files.map((file) => (
              <option key={file.name} value={file.name}>
                {fileLabels[file.name] ?? file.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <div className="surface flex h-64 items-center justify-center rounded-2xl">
          <LoadingDots label="Loading weather archive" />
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {error}
        </div>
      ) : null}

      {!loading && !error && !decoded ? (
        <div className="surface rounded-2xl px-6 py-16 text-center">
          <p className="font-display text-3xl text-text">No archive selected</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-muted">
            Pick a city archive above, from the Dashboard leaderboard, or from Archives.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link to="/dashboard" className="btn-primary">
              Open dashboard
            </Link>
            <Link to="/explore" className="btn-secondary">
              Ingest new data
            </Link>
          </div>
        </div>
      ) : null}

      {!loading && !error && decoded ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              index={0}
              label="Location"
              value={place.label}
              hint={
                meta?.latitude !== undefined && meta?.longitude !== undefined
                  ? `${Number(meta.latitude).toFixed(2)}, ${Number(meta.longitude).toFixed(2)} · ${place.region}`
                  : place.region
              }
            />
            <MetricCard
              index={1}
              label="Avg max / min"
              value={
                stats.avgMax !== null && stats.avgMin !== null
                  ? `${stats.avgMax.toFixed(1)}° / ${stats.avgMin.toFixed(1)}°`
                  : '—'
              }
              hint={`${stats.days} observation days`}
            />
            <MetricCard
              index={2}
              label="Peak / lowest"
              value={`${formatTemp(stats.peakMax)} / ${formatTemp(stats.lowestMin)}`}
              hint="Observed extremes in range"
            />
            <MetricCard
              index={3}
              label="Heat-stress share"
              value={`${hotShare}%`}
              hint={
                stats.avgDiurnalRange !== null
                  ? `Avg diurnal ${stats.avgDiurnalRange.toFixed(1)}° · hot days ${stats.hotDays}`
                  : `Hot days ${stats.hotDays}`
              }
            />
          </div>

          <RevealOnScroll className="surface rounded-2xl p-5 md:p-6">
            <div className="mb-4">
              <h2 className="font-display text-2xl font-semibold text-text">
                Daily temperature series
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                Max/min and apparent temperatures from the selected stored object.
              </p>
            </div>
            <WeatherChart rows={rows} />
          </RevealOnScroll>

          <RevealOnScroll className="surface rounded-2xl p-5 md:p-6">
            <div className="mb-4">
              <h2 className="font-display text-2xl font-semibold text-text">
                Daily band & midpoint
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                Max envelope with daily midpoint — useful for reading the comfort corridor
                across the archive window.
              </p>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={bandSeries} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={theme.grid} vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: theme.axis, fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: theme.grid }}
                    minTickGap={28}
                  />
                  <YAxis
                    tick={{ fill: theme.axis, fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: theme.grid }}
                    unit="°"
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      background: theme.tooltipBg,
                      border: `1px solid ${theme.tooltipBorder}`,
                      borderRadius: 12,
                      color: theme.text,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="max"
                    name="Daily max"
                    stroke={theme.warm}
                    fill={theme.warm}
                    fillOpacity={0.16}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="mid"
                    name="Midpoint"
                    stroke={theme.accent}
                    strokeWidth={2.2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="min"
                    name="Daily min"
                    stroke={theme.accentSoft}
                    strokeWidth={1.6}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </RevealOnScroll>

          <div className="grid gap-5 lg:grid-cols-3">
            <RevealOnScroll className="surface rounded-2xl p-5 lg:col-span-1">
              <h3 className="font-display text-xl font-semibold text-text">
                Max-temp distribution
              </h3>
              <p className="mt-1 mb-3 text-sm text-text-muted">
                How many days fell into each temperature band.
              </p>
              <TempDistributionChart rows={rows} />
            </RevealOnScroll>
            <RevealOnScroll className="surface rounded-2xl p-5 lg:col-span-2">
              <h3 className="font-display text-xl font-semibold text-text">Diurnal range</h3>
              <p className="mt-1 mb-3 text-sm text-text-muted">
                Daily max minus min — a simple volatility signal for heat stress windows.
              </p>
              <DiurnalRangeChart rows={rows} />
            </RevealOnScroll>
          </div>

          <RevealOnScroll className="surface rounded-2xl p-5 md:p-6">
            <h3 className="font-display text-xl font-semibold text-text">
              Apparent temperature gap
            </h3>
            <p className="mt-1 mb-3 text-sm text-text-muted">
              Difference between apparent and actual temperatures (feels-like offset).
            </p>
            <ApparentGapChart rows={rows} />
          </RevealOnScroll>

          <RevealOnScroll className="surface rounded-2xl p-5 md:p-6">
            <h3 className="mb-3 font-display text-2xl font-semibold text-text">
              Daily table
            </h3>
            <WeatherTable rows={rows} />
          </RevealOnScroll>
        </>
      ) : null}
    </div>
  )
}
