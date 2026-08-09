import { useMemo, useState } from 'react'
import type { DailyRow } from '../types/weather'
import { formatDisplayDate, formatTemp } from '../utils/weather'

interface WeatherTableProps {
  rows: DailyRow[]
}

const PAGE_SIZES = [10, 20, 50] as const

export function WeatherTable({ rows }: WeatherTableProps) {
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(10)
  const [page, setPage] = useState(0)

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const safePage = Math.min(page, totalPages - 1)

  const pageRows = useMemo(() => {
    const start = safePage * pageSize
    return rows.slice(start, start + pageSize)
  }, [rows, safePage, pageSize])

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-text-muted">
        Daily values will appear here once an archive is loaded.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-muted">
          Showing{' '}
          <span className="font-semibold text-text">
            {safePage * pageSize + 1}–
            {Math.min((safePage + 1) * pageSize, rows.length)}
          </span>{' '}
          of <span className="font-semibold text-text">{rows.length}</span> days
        </p>
        <label className="flex items-center gap-2 text-sm text-text-muted">
          Rows
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value) as (typeof PAGE_SIZES)[number])
              setPage(0)
            }}
            className="field-input !w-auto !py-1.5"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface-2 text-xs uppercase tracking-[0.12em] text-text-muted">
            <tr>
              <th className="px-3 py-3 font-semibold">Date</th>
              <th className="px-3 py-3 font-semibold">Max °C</th>
              <th className="px-3 py-3 font-semibold">Min °C</th>
              <th className="px-3 py-3 font-semibold">App. max</th>
              <th className="px-3 py-3 font-semibold">App. min</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr
                key={row.date}
                className="border-t border-border odd:bg-bg/40 hover:bg-accent-soft/40"
              >
                <td className="whitespace-nowrap px-3 py-2.5 font-medium text-text">
                  {formatDisplayDate(row.date)}
                </td>
                <td className="px-3 py-2.5 text-warm">{formatTemp(row.temperature_2m_max)}</td>
                <td className="px-3 py-2.5 text-accent">
                  {formatTemp(row.temperature_2m_min)}
                </td>
                <td className="px-3 py-2.5 text-text">
                  {formatTemp(row.apparent_temperature_max)}
                </td>
                <td className="px-3 py-2.5 text-text">
                  {formatTemp(row.apparent_temperature_min)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={safePage === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="btn-secondary !py-1.5 disabled:opacity-40"
        >
          Previous
        </button>
        <p className="text-sm text-text-muted">
          Page {safePage + 1} / {totalPages}
        </p>
        <button
          type="button"
          disabled={safePage >= totalPages - 1}
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          className="btn-secondary !py-1.5 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}
