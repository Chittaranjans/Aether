import { AnimatePresence, motion } from 'motion/react'
import { useTheme } from '../context/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      className="btn-secondary !px-3 !py-2"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.96 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          className="inline-flex items-center gap-2"
          initial={{ opacity: 0, rotate: -40, y: 6 }}
          animate={{ opacity: 1, rotate: 0, y: 0 }}
          exit={{ opacity: 0, rotate: 40, y: -6 }}
          transition={{ duration: 0.25 }}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
          <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2v2.2M12 19.8V22M4.2 12H2M22 12h-2.2M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 14.5A8.5 8.5 0 0 1 9.5 4 7 7 0 1 0 20 14.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}
