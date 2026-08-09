import { useMemo } from 'react'
import { useTheme } from '../context/ThemeContext'

export function useChartTheme() {
  const { theme } = useTheme()

  return useMemo(() => {
    const styles = getComputedStyle(document.documentElement)
    const read = (name: string, fallback: string) =>
      styles.getPropertyValue(name).trim() || fallback

    return {
      mode: theme,
      grid: read('--aether-chart-grid', 'rgba(20,32,40,0.08)'),
      axis: read('--aether-chart-axis', '#5a6d78'),
      text: read('--aether-text', '#142028'),
      muted: read('--aether-text-muted', '#5a6d78'),
      tooltipBg: read('--aether-tooltip-bg', '#ffffff'),
      tooltipBorder: read('--aether-tooltip-border', 'rgba(20,32,40,0.12)'),
      warm: read('--aether-warm', '#c47b14'),
      accent: read('--aether-accent', '#0f6e78'),
      warmSoft: theme === 'dark' ? '#f3c96b' : '#d4922a',
      accentSoft: theme === 'dark' ? '#7eb8c9' : '#2a8f9a',
    }
  }, [theme])
}
