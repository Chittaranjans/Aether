import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useChartTheme } from '../../hooks/useChartTheme'
import type { DailyRow } from '../../types/weather'
import { toDiurnalRows } from '../../utils/analytics'

export function DiurnalRangeChart({ rows }: { rows: DailyRow[] }) {
  const theme = useChartTheme()
  const data = toDiurnalRows(rows)

  if (!data.length) {
    return <EmptyChart label="Diurnal range unavailable" />
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
            formatter={(value) => [`${value}°`, 'Diurnal range']}
          />
          <Bar dataKey="range" fill={theme.accent} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-border text-sm text-text-muted">
      {label}
    </div>
  )
}
