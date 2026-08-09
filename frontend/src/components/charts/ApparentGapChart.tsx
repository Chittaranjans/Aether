import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useChartTheme } from '../../hooks/useChartTheme'
import type { DailyRow } from '../../types/weather'
import { toApparentGapRows } from '../../utils/analytics'

export function ApparentGapChart({ rows }: { rows: DailyRow[] }) {
  const theme = useChartTheme()
  const data = toApparentGapRows(rows)

  if (!data.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-border text-sm text-text-muted">
        Apparent temperature gap unavailable
      </div>
    )
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
          <Legend wrapperStyle={{ color: theme.text, fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="maxGap"
            name="Apparent − max"
            stroke={theme.warm}
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="minGap"
            name="Apparent − min"
            stroke={theme.accent}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
