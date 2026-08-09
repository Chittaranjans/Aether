import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import {
  FadeUp,
  RevealOnScroll,
  Stagger,
  StaggerItem,
} from '../components/motion/primitives'

export function HomePage() {
  return (
    <div className="space-y-16 md:space-y-24">
      <section className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <Stagger>
          <StaggerItem>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Climate weather intelligence
            </p>
          </StaggerItem>
          <StaggerItem>
            <h1 className="mt-3 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-text md:text-6xl lg:text-7xl">
              Aether
            </h1>
          </StaggerItem>
          <StaggerItem>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-text-muted md:text-lg">
              Ingest historical weather, persist raw archives to object storage, and turn
              daily extremes into decision-ready climate insight — without drowning in
              scattered API calls.
            </p>
          </StaggerItem>
          <StaggerItem>
            <div className="mt-7 flex flex-wrap gap-3">
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link to="/dashboard" className="btn-primary">
                  Open dashboard
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link to="/explore" className="btn-secondary">
                  Start an ingest
                </Link>
              </motion.div>
            </div>
          </StaggerItem>
        </Stagger>

        <FadeUp>
          <motion.div
            className="surface relative overflow-hidden rounded-3xl p-6 md:p-8"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(145deg, var(--aether-accent-soft), transparent 55%), linear-gradient(320deg, var(--aether-warm-soft), transparent 50%)',
              }}
              aria-hidden
              animate={{ opacity: [0.55, 0.9, 0.55], scale: [1, 1.04, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="relative space-y-4">
              <p className="text-sm font-semibold text-text">Product snapshot</p>
              <Stagger className="space-y-0">
                <StaggerItem>
                  <SnapshotRow label="Archive source" value="Open-Meteo daily history" />
                </StaggerItem>
                <StaggerItem>
                  <SnapshotRow label="Persistence" value="Cloud object storage" />
                </StaggerItem>
                <StaggerItem>
                  <SnapshotRow label="Window" value="Up to 31 days per request" />
                </StaggerItem>
                <StaggerItem>
                  <SnapshotRow label="Outputs" value="Charts · tables · metrics" />
                </StaggerItem>
              </Stagger>
            </div>
          </motion.div>
        </FadeUp>
      </section>

      <Stagger className="grid gap-4 md:grid-cols-3">
        <StaggerItem>
          <FeatureCard
            title="Fetch once"
            body="Pull validated historical ranges for any lat/lon and keep the full JSON response for later analysis."
          />
        </StaggerItem>
        <StaggerItem>
          <FeatureCard
            title="Store reliably"
            body="Every ingest lands in object storage with a deterministic filename so teams can audit and replay."
          />
        </StaggerItem>
        <StaggerItem>
          <FeatureCard
            title="Explore deeply"
            body="Dashboard metrics, diurnal range, apparent-temperature gaps, and daily tables — all from stored files."
          />
        </StaggerItem>
      </Stagger>

      <RevealOnScroll>
        <motion.section
          className="surface rounded-3xl p-6 md:p-10"
          whileHover={{ y: -2 }}
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="font-display text-3xl font-semibold text-text md:text-4xl">
                Built for climate-risk workflows
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-muted md:text-base">
                Aether is a focused MVP for teams that need a clean path from public weather
                APIs to stored archives and visual review — ready to expand into broader
                climate-risk pipelines.
              </p>
            </div>
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link to="/about" className="btn-secondary self-start">
                Learn more
              </Link>
            </motion.div>
          </div>
        </motion.section>
      </RevealOnScroll>
    </div>
  )
}

function SnapshotRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-none last:pb-0">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-sm font-semibold text-text">{value}</span>
    </div>
  )
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <motion.article
      className="surface h-full rounded-2xl p-5 md:p-6"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <h3 className="font-display text-2xl font-semibold text-text">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">{body}</p>
    </motion.article>
  )
}
