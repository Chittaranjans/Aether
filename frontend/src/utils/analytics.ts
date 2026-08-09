import type { DailyRow, WeatherFileMeta } from '../types/weather'
import { formatDisplayDate } from './weather'

export interface SeriesStats {
  avgMax: number | null
  avgMin: number | null
  peakMax: number | null
  lowestMin: number | null
  avgDiurnalRange: number | null
  avgApparentGap: number | null
  hotDays: number
  coldDays: number
  days: number
}

function avg(values: number[]): number | null {
  if (!values.length) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function computeSeriesStats(rows: DailyRow[]): SeriesStats {
  const maxValues = rows
    .map((row) => row.temperature_2m_max)
    .filter((value): value is number => value !== null)
  const minValues = rows
    .map((row) => row.temperature_2m_min)
    .filter((value): value is number => value !== null)

  const diurnal = rows
    .map((row) => {
      if (row.temperature_2m_max === null || row.temperature_2m_min === null) return null
      return row.temperature_2m_max - row.temperature_2m_min
    })
    .filter((value): value is number => value !== null)

  const apparentGaps = rows
    .map((row) => {
      if (
        row.apparent_temperature_max === null ||
        row.temperature_2m_max === null
      ) {
        return null
      }
      return row.apparent_temperature_max - row.temperature_2m_max
    })
    .filter((value): value is number => value !== null)

  return {
    avgMax: avg(maxValues),
    avgMin: avg(minValues),
    peakMax: maxValues.length ? Math.max(...maxValues) : null,
    lowestMin: minValues.length ? Math.min(...minValues) : null,
    avgDiurnalRange: avg(diurnal),
    avgApparentGap: avg(apparentGaps),
    hotDays: maxValues.filter((value) => value >= 32).length,
    coldDays: minValues.filter((value) => value <= 10).length,
    days: rows.length,
  }
}

export function toDiurnalRows(rows: DailyRow[]) {
  return rows.map((row) => ({
    date: row.date,
    label: formatDisplayDate(row.date),
    range:
      row.temperature_2m_max !== null && row.temperature_2m_min !== null
        ? Number((row.temperature_2m_max - row.temperature_2m_min).toFixed(2))
        : null,
    max: row.temperature_2m_max,
    min: row.temperature_2m_min,
  }))
}

export function toApparentGapRows(rows: DailyRow[]) {
  return rows.map((row) => ({
    date: row.date,
    label: formatDisplayDate(row.date),
    maxGap:
      row.apparent_temperature_max !== null && row.temperature_2m_max !== null
        ? Number(
            (row.apparent_temperature_max - row.temperature_2m_max).toFixed(2),
          )
        : null,
    minGap:
      row.apparent_temperature_min !== null && row.temperature_2m_min !== null
        ? Number(
            (row.apparent_temperature_min - row.temperature_2m_min).toFixed(2),
          )
        : null,
  }))
}

export function temperatureBuckets(rows: DailyRow[]) {
  const buckets = [
    { label: '<10°', min: -100, max: 10, count: 0 },
    { label: '10–20°', min: 10, max: 20, count: 0 },
    { label: '20–28°', min: 20, max: 28, count: 0 },
    { label: '28–35°', min: 28, max: 35, count: 0 },
    { label: '35°+', min: 35, max: 100, count: 0 },
  ]

  for (const row of rows) {
    const value = row.temperature_2m_max
    if (value === null) continue
    const bucket = buckets.find((item) => value >= item.min && value < item.max)
    if (bucket) bucket.count += 1
  }

  return buckets.map(({ label, count }) => ({ label, count }))
}

export function parseCoordsFromFileName(name: string): {
  lat: number | null
  lon: number | null
} {
  // weather_<lat>_<lon>_YYYY-MM-DD_YYYY-MM-DD_<timestamp>.json
  const match = name.match(/^weather_([m\d.]+)_([m\d.]+)_/)
  if (!match) return { lat: null, lon: null }
  const parse = (raw: string) => {
    const normalized = raw.startsWith('m') ? `-${raw.slice(1)}` : raw
    const value = Number(normalized)
    return Number.isFinite(value) ? value : null
  }
  return { lat: parse(match[1]), lon: parse(match[2]) }
}

export function filesByDay(files: WeatherFileMeta[]) {
  const map = new Map<string, number>()
  for (const file of files) {
    const day = file.created_at.slice(0, 10)
    map.set(day, (map.get(day) ?? 0) + 1)
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({
      date,
      label: formatDisplayDate(date),
      count,
    }))
}

export function storageByDay(files: WeatherFileMeta[]) {
  const sorted = [...files].sort((a, b) =>
    a.created_at.localeCompare(b.created_at),
  )
  let running = 0
  return sorted.map((file) => {
    running += file.size
    return {
      date: file.created_at.slice(0, 10),
      label: formatDisplayDate(file.created_at.slice(0, 10)),
      bytes: running,
      kb: Number((running / 1024).toFixed(1)),
      name: file.name,
    }
  })
}
