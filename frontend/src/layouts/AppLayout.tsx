import { motion } from 'motion/react'
import { NavLink } from 'react-router-dom'
import { AnimatedOutlet } from '../components/motion/AnimatedOutlet'
import { ThemeToggle } from '../components/ThemeToggle'

const NAV = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/explore', label: 'Explore' },
  { to: '/files', label: 'Archives' },
  { to: '/insights', label: 'Insights' },
  { to: '/about', label: 'About' },
]

export function AppLayout() {
  return (
    <div className="page-shell">
      <div className="ambient-orb ambient-orb-a" aria-hidden />
      <div className="ambient-orb ambient-orb-b" aria-hidden />

      <motion.header
        className="sticky top-0 z-40 border-b border-border bg-bg-elevated/90 backdrop-blur-md"
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <NavLink to="/" end className="group flex items-center gap-2.5">
            <motion.span
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white"
              whileHover={{ rotate: -6, scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
            >
              Æ
            </motion.span>
            <span className="font-display text-xl font-semibold tracking-tight text-text transition-colors group-hover:text-accent">
              Aether
            </span>
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'nav-link-active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
              <NavLink to="/explore" className="btn-primary !py-2">
                New ingest
              </NavLink>
            </motion.div>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-7xl gap-1 overflow-x-auto px-4 pb-3 md:hidden md:px-6">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-link whitespace-nowrap ${isActive ? 'nav-link-active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </motion.header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <AnimatedOutlet />
      </main>

      <motion.footer
        className="border-t border-border"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-text-muted md:flex-row md:items-center md:justify-between md:px-6">
          <p>© {new Date().getFullYear()} Aether · Historical weather intelligence</p>
          <p>Open-Meteo archives · Object storage · Insight dashboards</p>
        </div>
      </motion.footer>
    </div>
  )
}
