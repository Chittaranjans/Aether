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
import { useChartTheme } from '../hooks/useChartTheme'
import type { DailyRow } from '../types/weather'
import { formatDisplayDate, formatTemp } from '../utils/weather'

interface WeatherChartProps {
  rows: DailyRow[]
}

export function WeatherChart({ rows }: WeatherChartProps) {
  const theme = useChartTheme()

  if (rows.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-border text-sm text-text-muted">
        Select a stored archive to render the temperature series.
      </div>
    )
  }

  const chartData = rows.map((row) => ({
    ...row,
    label: formatDisplayDate(row.date),
  }))

  return (
    <div className="h-80 w-full md:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={theme.grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: theme.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: theme.grid }}
            minTickGap={28}
          />
          <YAxis
            tick={{ fill: theme.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: theme.grid }}
            unit="°"
            width={42}
          />
          <Tooltip
            contentStyle={{
              background: theme.tooltipBg,
              border: `1px solid ${theme.tooltipBorder}`,
              borderRadius: 12,
              color: theme.text,
            }}
            formatter={(value) => formatTemp(typeof value === 'number' ? value : null)}
            labelStyle={{ color: theme.muted, marginBottom: 4 }}
          />
          <Legend wrapperStyle={{ color: theme.text, fontSize: 12, paddingTop: 8 }} />
          <Line
            type="monotone"
            dataKey="temperature_2m_max"
            name="Max temp"
            stroke={theme.warm}
            strokeWidth={2.4}
            dot={false}
            activeDot={{ r: 4 }}
            animationDuration={1200}
            animationEasing="ease-out"
          />
          <Line
            type="monotone"
            dataKey="temperature_2m_min"
            name="Min temp"
            stroke={theme.accent}
            strokeWidth={2.4}
            dot={false}
            activeDot={{ r: 4 }}
            animationDuration={1200}
            animationBegin={80}
            animationEasing="ease-out"
          />
          <Line
            type="monotone"
            dataKey="apparent_temperature_max"
            name="Apparent max"
            stroke={theme.warmSoft}
            strokeWidth={1.5}
            strokeDasharray="5 4"
            dot={false}
            animationDuration={1200}
            animationBegin={140}
            animationEasing="ease-out"
          />
          <Line
            type="monotone"
            dataKey="apparent_temperature_min"
            name="Apparent min"
            stroke={theme.accentSoft}
            strokeWidth={1.5}
            strokeDasharray="5 4"
            dot={false}
            animationDuration={1200}
            animationBegin={200}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
