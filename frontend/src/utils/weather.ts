import { format, parseISO } from 'date-fns'
import type { DailyRow, OpenMeteoDaily, StoredWeatherFile } from '../types/weather'

export function extractDaily(payload: StoredWeatherFile | null): OpenMeteoDaily | null {
  if (!payload) return null
  return payload.data?.daily ?? payload.daily ?? null
}

export function extractMeta(payload: StoredWeatherFile | null) {
  if (!payload) return null
  return {
    latitude: payload.request?.latitude ?? payload.data?.latitude ?? payload.latitude,
    longitude: payload.request?.longitude ?? payload.data?.longitude ?? payload.longitude,
    start_date: payload.request?.start_date,
    end_date: payload.request?.end_date,
    timezone: payload.data?.timezone ?? payload.timezone,
    elevation: payload.data?.elevation,
    source: payload.source ?? 'open-meteo',
  }
}

export function toDailyRows(daily: OpenMeteoDaily | null): DailyRow[] {
  if (!daily?.time?.length) return []
  return daily.time.map((date, index) => ({
    date,
    temperature_2m_max: daily.temperature_2m_max?.[index] ?? null,
    temperature_2m_min: daily.temperature_2m_min?.[index] ?? null,
    apparent_temperature_max: daily.apparent_temperature_max?.[index] ?? null,
    apparent_temperature_min: daily.apparent_temperature_min?.[index] ?? null,
  }))
}

export function formatDisplayDate(isoDate: string): string {
  try {
    return format(parseISO(isoDate), 'MMM d, yyyy')
  } catch {
    return isoDate
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function formatTemp(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return `${value.toFixed(1)}°`
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function daysAgoISO(days: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - days)
  return date.toISOString().slice(0, 10)
}

export function clampDateRange(start: string, end: string): string | null {
  if (!start || !end) return 'Both start and end dates are required'
  if (start > end) return 'Start date must be on or before end date'
  const startDate = new Date(`${start}T00:00:00Z`)
  const endDate = new Date(`${end}T00:00:00Z`)
  const span =
    Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  if (span > 31) return 'Date range must be at most 31 days'
  return null
}
