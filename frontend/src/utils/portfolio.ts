import type { DailyRow } from '../types/weather'
import { computeSeriesStats, type SeriesStats } from './analytics'
import { LOCATION_PALETTE, resolvePlaceLabel } from './locations'
import { formatDisplayDate } from './weather'

export interface ArchiveInsight {
  name: string
  created_at: string
  size: number
  lat: number | null
  lon: number | null
  start_date?: string
  end_date?: string
  timezone?: string
  rows: DailyRow[]
  stats: SeriesStats
  place: string
  region: string
  color: string
}

export interface LocationPortfolio {
  key: string
  place: string
  region: string
  lat: number
  lon: number
  color: string
  archiveCount: number
  latestName: string
  rows: DailyRow[]
  stats: SeriesStats
}

function locationKey(lat: number, lon: number): string {
  return `${lat.toFixed(2)},${lon.toFixed(2)}`
}

export function buildArchiveInsights(
  items: Array<{
    name: string
    created_at: string
    size: number
    lat: number | null
    lon: number | null
    start_date?: string
    end_date?: string
    timezone?: string
    rows: DailyRow[]
  }>,
): ArchiveInsight[] {
  return items.map((item, index) => {
    const place = resolvePlaceLabel(item.lat, item.lon)
    return {
      ...item,
      stats: computeSeriesStats(item.rows),
      place: place.label,
      region: place.region,
      color: LOCATION_PALETTE[index % LOCATION_PALETTE.length],
    }
  })
}

/** Keep the newest archive per coordinate cluster. */
export function toLocationPortfolio(archives: ArchiveInsight[]): LocationPortfolio[] {
  const sorted = [...archives].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  )
  const map = new Map<string, LocationPortfolio>()

  for (const archive of sorted) {
    if (archive.lat === null || archive.lon === null) continue
    const key = locationKey(archive.lat, archive.lon)
    const existing = map.get(key)
    if (!existing) {
      map.set(key, {
        key,
        place: archive.place,
        region: archive.region,
        lat: archive.lat,
        lon: archive.lon,
        color: LOCATION_PALETTE[map.size % LOCATION_PALETTE.length],
        archiveCount: 1,
        latestName: archive.name,
        rows: archive.rows,
        stats: archive.stats,
      })
    } else {
      existing.archiveCount += 1
    }
  }

  return [...map.values()].sort((a, b) => a.place.localeCompare(b.place))
}

export function locationComparisonRows(locations: LocationPortfolio[]) {
  return locations.map((location) => ({
    place: location.place,
    region: location.region,
    avgMax: Number((location.stats.avgMax ?? 0).toFixed(1)),
    avgMin: Number((location.stats.avgMin ?? 0).toFixed(1)),
    peakMax: Number((location.stats.peakMax ?? 0).toFixed(1)),
    diurnal: Number((location.stats.avgDiurnalRange ?? 0).toFixed(1)),
    hotDays: location.stats.hotDays,
    coldDays: location.stats.coldDays,
    apparentGap: Number((location.stats.avgApparentGap ?? 0).toFixed(1)),
    days: location.stats.days,
    color: location.color,
    file: location.latestName,
  }))
}

/** Align locations on shared calendar dates for overlay charts. */
export function multiLocationDailyMax(locations: LocationPortfolio[]) {
  const dateSet = new Set<string>()
  for (const location of locations) {
    for (const row of location.rows) dateSet.add(row.date)
  }

  const dates = [...dateSet].sort()
  return dates.map((date) => {
    const point: Record<string, string | number | null> = {
      date,
      label: formatDisplayDate(date),
    }
    for (const location of locations) {
      const row = location.rows.find((item) => item.date === date)
      point[location.place] = row?.temperature_2m_max ?? null
    }
    return point
  })
}

export function riskProfileRows(locations: LocationPortfolio[]) {
  return locations.map((location) => {
    const days = Math.max(location.stats.days, 1)
    return {
      place: location.place,
      hotShare: Number(((location.stats.hotDays / days) * 100).toFixed(1)),
      coldShare: Number(((location.stats.coldDays / days) * 100).toFixed(1)),
      diurnal: Number((location.stats.avgDiurnalRange ?? 0).toFixed(1)),
      apparentGap: Number((location.stats.avgApparentGap ?? 0).toFixed(1)),
      color: location.color,
      file: location.latestName,
    }
  })
}

export function regionRollup(locations: LocationPortfolio[]) {
  const map = new Map<string, { region: string; count: number; avgMaxSum: number; n: number }>()
  for (const location of locations) {
    const current = map.get(location.region) ?? {
      region: location.region,
      count: 0,
      avgMaxSum: 0,
      n: 0,
    }
    current.count += 1
    if (location.stats.avgMax !== null) {
      current.avgMaxSum += location.stats.avgMax
      current.n += 1
    }
    map.set(location.region, current)
  }

  return [...map.values()]
    .map((item) => ({
      region: item.region,
      locations: item.count,
      avgMax: item.n ? Number((item.avgMaxSum / item.n).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.avgMax - a.avgMax)
}
