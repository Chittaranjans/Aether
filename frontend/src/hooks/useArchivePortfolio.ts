import { useCallback, useEffect, useMemo, useState } from 'react'
import { getWeatherFileContent, listWeatherFiles } from '../api/client'
import type { WeatherFileMeta } from '../types/weather'
import { parseCoordsFromFileName } from '../utils/analytics'
import {
  buildArchiveInsights,
  toLocationPortfolio,
  type ArchiveInsight,
  type LocationPortfolio,
} from '../utils/portfolio'
import { extractDaily, extractMeta, toDailyRows } from '../utils/weather'

export function useArchivePortfolio() {
  const [files, setFiles] = useState<WeatherFileMeta[]>([])
  const [archives, setArchives] = useState<ArchiveInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const reload = useCallback(() => setReloadToken((token) => token + 1), [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const listed = await listWeatherFiles()
        if (cancelled) return
        setFiles(listed.files)

        const loaded = await Promise.all(
          listed.files.slice(0, 24).map(async (file) => {
            try {
              const payload = await getWeatherFileContent(file.name)
              const rows = toDailyRows(extractDaily(payload))
              const meta = extractMeta(payload)
              const coords = parseCoordsFromFileName(file.name)
              return {
                name: file.name,
                created_at: file.created_at,
                size: file.size,
                lat: meta?.latitude ?? coords.lat,
                lon: meta?.longitude ?? coords.lon,
                start_date: meta?.start_date,
                end_date: meta?.end_date,
                timezone: meta?.timezone,
                rows,
              }
            } catch {
              return null
            }
          }),
        )

        if (!cancelled) {
          setArchives(
            buildArchiveInsights(
              loaded.filter((item): item is NonNullable<typeof item> => item !== null),
            ),
          )
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load archives')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [reloadToken])

  const locations: LocationPortfolio[] = useMemo(
    () => toLocationPortfolio(archives),
    [archives],
  )

  return { files, archives, locations, loading, error, reload }
}
