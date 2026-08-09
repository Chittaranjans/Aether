import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { listWeatherFiles } from '../api/client'
import type { WeatherFileMeta } from '../types/weather'
import { formatBytes } from '../utils/weather'
import { LoadingDots } from './LoadingDots'

interface StoredFilesProps {
  selectedFile: string | null
  refreshToken?: number
  onSelect: (fileName: string) => void
  title?: string
  description?: string
}

export function StoredFiles({
  selectedFile,
  refreshToken = 0,
  onSelect,
  title = 'Stored archives',
  description = 'Browse persisted Open-Meteo responses. Open one to analyze without re-calling the weather API.',
}: StoredFilesProps) {
  const [files, setFiles] = useState<WeatherFileMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadFiles() {
    setLoading(true)
    setError(null)
    try {
      const data = await listWeatherFiles()
      setFiles(data.files)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to list files')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadFiles()
  }, [refreshToken])

  return (
    <section className="surface flex h-full flex-col rounded-2xl p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            Object storage
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-text md:text-3xl">
            {title}
          </h2>
        </div>
        <button type="button" onClick={() => void loadFiles()} className="btn-secondary !py-2">
          Refresh
        </button>
      </div>

      <p className="mb-4 text-sm text-text-muted">{description}</p>

      {loading ? (
        <div className="flex flex-1 items-center justify-center py-10">
          <LoadingDots label="Loading files" />
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {error}
        </div>
      ) : null}

      {!loading && !error && files.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border px-4 py-10 text-center">
          <p className="font-display text-2xl text-text">No archives yet</p>
          <p className="mt-2 max-w-xs text-sm text-text-muted">
            Run an ingest from Explore to create your first weather object.
          </p>
        </div>
      ) : null}

      {!loading && files.length > 0 ? (
        <ul className="flex max-h-[32rem] flex-col gap-2 overflow-y-auto pr-1">
          {files.map((file, index) => {
            const active = selectedFile === file.name
            return (
              <motion.li
                key={file.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: Math.min(index, 10) * 0.04,
                  duration: 0.35,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <motion.button
                  type="button"
                  onClick={() => onSelect(file.name)}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full rounded-xl border px-3.5 py-3 text-left transition ${
                    active
                      ? 'border-accent bg-accent-soft'
                      : 'border-border bg-bg/40 hover:border-accent/50 hover:bg-surface-2'
                  }`}
                >
                  <p className="break-all text-sm font-semibold text-text">{file.name}</p>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-muted">
                    <span>{formatBytes(file.size)}</span>
                    <span>
                      {new Date(file.created_at).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                </motion.button>
              </motion.li>
            )
          })}
        </ul>
      ) : null}
    </section>
  )
}
