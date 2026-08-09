import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { storeWeatherData } from '../api/client'
import { LoadingDots } from '../components/LoadingDots'
import { MetricCard } from '../components/MetricCard'
import { RevealOnScroll } from '../components/motion/primitives'
import { PageHeader } from '../components/PageHeader'
import { useArchivePortfolio } from '../hooks/useArchivePortfolio'
import { useChartTheme } from '../hooks/useChartTheme'
import { computeSeriesStats } from '../utils/analytics'
import { KNOWN_PLACES } from '../utils/locations'
import {
  locationComparisonRows,
  multiLocationDailyMax,
  regionRollup,
  riskProfileRows,
} from '../utils/portfolio'
import { daysAgoISO, formatBytes } from '../utils/weather'

const SEED_CITIES = KNOWN_PLACES.slice(0, 6)

export function DashboardPage() {
  const theme = useChartTheme()
  const { files, archives, locations, loading, error, reload } = useArchivePortfolio()
  const [seeding, setSeeding] = useState(false)
  const [seedMessage, setSeedMessage] = useState<string | null>(null)
  const [seedError, setSeedError] = useState<string | null>(null)

  const comparison = useMemo(() => locationComparisonRows(locations), [locations])
  const overlay = useMemo(() => multiLocationDailyMax(locations), [locations])
  const risk = useMemo(() => riskProfileRows(locations), [locations])
  const regions = useMemo(() => regionRollup(locations), [locations])

  const portfolio = useMemo(() => {
    const allRows = locations.flatMap((item) => item.rows)
    return computeSeriesStats(allRows)
  }, [locations])

  const hottest = useMemo(() => {
    if (!comparison.length) return null
    return [...comparison].sort((a, b) => b.avgMax - a.avgMax)[0]
  }, [comparison])

  const coolest = useMemo(() => {
    if (!comparison.length) return null
    return [...comparison].sort((a, b) => a.avgMin - b.avgMin)[0]
  }, [comparison])

  async function seedSampleCities() {
    setSeeding(true)
    setSeedError(null)
    setSeedMessage(null)
    const start_date = daysAgoISO(21)
    const end_date = daysAgoISO(7)

    try {
      const results = await Promise.allSettled(
        SEED_CITIES.map((city) =>
          storeWeatherData({
            latitude: city.latitude,
            longitude: city.longitude,
            start_date,
            end_date,
          }),
        ),
      )
      const ok = results.filter((item) => item.status === 'fulfilled').length
      const failed = results.length - ok
      setSeedMessage(
        failed
          ? `Seeded ${ok}/${results.length} cities (${failed} failed). Charts refreshed.`
          : `Seeded ${ok} cities for ${start_date} → ${end_date}. Charts refreshed.`,
      )
      reload()
    } catch (err) {
      setSeedError(err instanceof Error ? err.message : 'Failed to seed sample cities')
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="fade-in">
      <PageHeader
        eyebrow="Climate portfolio"
        title="Dashboard"
        description="Compare temperature signals across every location in your archives — city-level extremes, shared daily trends, and heat-risk profiles from stored data only."
        actions={
          <>
            <button
              type="button"
              className="btn-primary"
              disabled={seeding}
              onClick={() => void seedSampleCities()}
            >
              {seeding ? <LoadingDots label="Seeding cities" /> : 'Seed sample cities'}
            </button>
            <Link to="/explore" className="btn-secondary">
              Custom ingest
            </Link>
          </>
        }
      />

      {seedMessage ? (
        <div className="mb-4 rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-text">
          {seedMessage}
        </div>
      ) : null}
      {seedError ? (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {seedError}
        </div>
      ) : null}

      {loading ? (
        <div className="surface flex h-64 items-center justify-center rounded-2xl">
          <LoadingDots label="Building multi-location dashboard" />
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

      {!loading && !error ? (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              index={0}
              label="Locations"
              value={String(locations.length)}
              hint={`${files.length} archives · ${archives.length} loaded`}
            />
            <MetricCard
              index={1}
              label="Portfolio avg max"
              value={
                portfolio.avgMax !== null ? `${portfolio.avgMax.toFixed(1)}°C` : '—'
              }
              hint={
                portfolio.avgMin !== null
                  ? `Avg min ${portfolio.avgMin.toFixed(1)}°C`
                  : 'Ingest cities to populate'
              }
            />
            <MetricCard
              index={2}
              label="Hottest city"
              value={hottest ? `${hottest.place}` : '—'}
              hint={hottest ? `Avg max ${hottest.avgMax.toFixed(1)}°C` : 'No data yet'}
            />
            <MetricCard
              index={3}
              label="Coolest nights"
              value={coolest ? `${coolest.place}` : '—'}
              hint={coolest ? `Avg min ${coolest.avgMin.toFixed(1)}°C` : 'No data yet'}
            />
          </div>

          {!locations.length ? (
            <div className="surface rounded-2xl px-6 py-14 text-center">
              <p className="font-display text-3xl text-text">No location portfolio yet</p>
              <p className="mx-auto mt-2 max-w-lg text-sm text-text-muted">
                Seed sample cities (Mumbai, London, New York, Tokyo, Singapore, Sydney) or
                ingest custom coordinates from Explore. The dashboard aggregates all stored
                archives into comparative climate views.
              </p>
              <button
                type="button"
                className="btn-primary mt-6"
                disabled={seeding}
                onClick={() => void seedSampleCities()}
              >
                {seeding ? <LoadingDots label="Seeding" /> : 'Seed sample cities'}
              </button>
            </div>
          ) : (
            <>
              <RevealOnScroll className="surface rounded-2xl p-5 md:p-6">
                <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-text">
                      City temperature comparison
                    </h2>
                    <p className="mt-1 text-sm text-text-muted">
                      Average max vs average min across each unique location in storage.
                    </p>
                  </div>
                  <p className="text-xs text-text-muted">
                    Storage footprint {formatBytes(files.reduce((s, f) => s + f.size, 0))}
                  </p>
                </div>
                <div className="h-[22rem]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={comparison}
                      margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
                      barGap={6}
                    >
                      <CartesianGrid stroke={theme.grid} vertical={false} />
                      <XAxis
                        dataKey="place"
                        tick={{ fill: theme.axis, fontSize: 12 }}
                        tickLine={false}
                        axisLine={{ stroke: theme.grid }}
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
                      <Legend />
                      <Bar
                        dataKey="avgMax"
                        name="Avg max"
                        fill={theme.warm}
                        radius={[6, 6, 0, 0]}
                        maxBarSize={42}
                      />
                      <Bar
                        dataKey="avgMin"
                        name="Avg min"
                        fill={theme.accent}
                        radius={[6, 6, 0, 0]}
                        maxBarSize={42}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </RevealOnScroll>

              <RevealOnScroll className="surface rounded-2xl p-5 md:p-6">
                <div className="mb-4">
                  <h2 className="font-display text-2xl font-semibold text-text">
                    Daily max overlay by city
                  </h2>
                  <p className="mt-1 text-sm text-text-muted">
                    Shared calendar view of daily maximum temperatures for every location
                    currently in your portfolio.
                  </p>
                </div>
                <div className="h-[24rem]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={overlay} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke={theme.grid} vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: theme.axis, fontSize: 11 }}
                        tickLine={false}
                        axisLine={{ stroke: theme.grid }}
                        minTickGap={24}
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
                      <Legend />
                      {locations.map((location) => (
                        <Line
                          key={location.key}
                          type="monotone"
                          dataKey={location.place}
                          name={location.place}
                          stroke={location.color}
                          strokeWidth={2.2}
                          dot={false}
                          connectNulls
                          animationDuration={800}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </RevealOnScroll>

              <div className="grid gap-5 lg:grid-cols-2">
                <RevealOnScroll className="surface rounded-2xl p-5 md:p-6">
                  <h2 className="font-display text-2xl font-semibold text-text">
                    Heat-risk profile
                  </h2>
                  <p className="mt-1 mb-4 text-sm text-text-muted">
                    Share of hot days (≥32°C) and average diurnal swing by city.
                  </p>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={risk}
                        layout="vertical"
                        margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
                      >
                        <CartesianGrid stroke={theme.grid} horizontal={false} />
                        <XAxis
                          type="number"
                          tick={{ fill: theme.axis, fontSize: 11 }}
                          tickLine={false}
                          axisLine={{ stroke: theme.grid }}
                        />
                        <YAxis
                          type="category"
                          dataKey="place"
                          width={88}
                          tick={{ fill: theme.axis, fontSize: 12 }}
                          tickLine={false}
                          axisLine={{ stroke: theme.grid }}
                        />
                        <Tooltip
                          contentStyle={{
                            background: theme.tooltipBg,
                            border: `1px solid ${theme.tooltipBorder}`,
                            borderRadius: 12,
                            color: theme.text,
                          }}
                        />
                        <Legend />
                        <Bar
                          dataKey="hotShare"
                          name="Hot days %"
                          fill={theme.warm}
                          radius={[0, 6, 6, 0]}
                          maxBarSize={18}
                        />
                        <Bar
                          dataKey="diurnal"
                          name="Avg diurnal °"
                          fill={theme.accent}
                          radius={[0, 6, 6, 0]}
                          maxBarSize={18}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </RevealOnScroll>

                <RevealOnScroll className="surface rounded-2xl p-5 md:p-6">
                  <h2 className="font-display text-2xl font-semibold text-text">
                    Regional warmth
                  </h2>
                  <p className="mt-1 mb-4 text-sm text-text-muted">
                    Average maximum temperature rolled up by region from your stored cities.
                  </p>
                  {regions.length ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={regions} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                          <CartesianGrid stroke={theme.grid} vertical={false} />
                          <XAxis
                            dataKey="region"
                            tick={{ fill: theme.axis, fontSize: 11 }}
                            tickLine={false}
                            axisLine={{ stroke: theme.grid }}
                            interval={0}
                            angle={-18}
                            textAnchor="end"
                            height={60}
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
                            formatter={(value, _name, item) => [
                              `${value}°`,
                              `${item?.payload?.locations ?? 0} location(s)`,
                            ]}
                          />
                          <Bar dataKey="avgMax" name="Avg max" radius={[6, 6, 0, 0]} maxBarSize={48}>
                            {regions.map((entry, index) => (
                              <Cell
                                key={entry.region}
                                fill={
                                  locations[index % Math.max(locations.length, 1)]?.color ??
                                  theme.accent
                                }
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyState />
                  )}
                </RevealOnScroll>
              </div>

              <RevealOnScroll className="surface rounded-2xl p-5 md:p-6">
                <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-text">
                      Location leaderboard
                    </h2>
                    <p className="mt-1 text-sm text-text-muted">
                      Latest archive per city with key climate metrics — open Insights for a
                      full deep dive.
                    </p>
                  </div>
                  <button type="button" className="btn-secondary !py-2" onClick={reload}>
                    Refresh
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-2 text-xs uppercase tracking-[0.12em] text-text-muted">
                      <tr>
                        <th className="px-3 py-3 font-semibold">City</th>
                        <th className="px-3 py-3 font-semibold">Region</th>
                        <th className="px-3 py-3 font-semibold">Avg max</th>
                        <th className="px-3 py-3 font-semibold">Avg min</th>
                        <th className="px-3 py-3 font-semibold">Peak</th>
                        <th className="px-3 py-3 font-semibold">Diurnal</th>
                        <th className="px-3 py-3 font-semibold">Hot days</th>
                        <th className="px-3 py-3 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparison.map((row) => (
                        <tr key={row.file} className="border-t border-border">
                          <td className="px-3 py-3 font-semibold text-text">
                            <span
                              className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                              style={{ background: row.color }}
                              aria-hidden
                            />
                            {row.place}
                          </td>
                          <td className="px-3 py-3 text-text-muted">{row.region}</td>
                          <td className="px-3 py-3 text-warm">{row.avgMax.toFixed(1)}°</td>
                          <td className="px-3 py-3 text-accent">{row.avgMin.toFixed(1)}°</td>
                          <td className="px-3 py-3 text-text">{row.peakMax.toFixed(1)}°</td>
                          <td className="px-3 py-3 text-text">{row.diurnal.toFixed(1)}°</td>
                          <td className="px-3 py-3 text-text">{row.hotDays}</td>
                          <td className="px-3 py-3">
                            <Link
                              to={`/insights/${encodeURIComponent(row.file)}`}
                              className="font-semibold text-accent hover:underline"
                            >
                              Insights
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </RevealOnScroll>
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-border text-sm text-text-muted">
      No regional rollup yet.
    </div>
  )
}
