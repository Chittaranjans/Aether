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
import { temperatureBuckets } from '../../utils/analytics'

export function TempDistributionChart({ rows }: { rows: DailyRow[] }) {
  const theme = useChartTheme()
  const data = temperatureBuckets(rows)

  if (!rows.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-border text-sm text-text-muted">
        Distribution unavailable
      </div>
    )
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
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: theme.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: theme.grid }}
            width={28}
          />
          <Tooltip
            contentStyle={{
              background: theme.tooltipBg,
              border: `1px solid ${theme.tooltipBorder}`,
              borderRadius: 12,
              color: theme.text,
            }}
            formatter={(value) => [`${value} days`, 'Count']}
          />
          <Bar dataKey="count" fill={theme.warm} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
