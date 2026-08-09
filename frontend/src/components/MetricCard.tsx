import { motion } from 'motion/react'

interface MetricCardProps {
  label: string
  value: string
  hint?: string
  index?: number
}

export function MetricCard({ label, value, hint, index = 0 }: MetricCardProps) {
  return (
    <motion.div
      className="surface rounded-2xl p-4 md:p-5"
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.45,
        delay: index * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -4,
        boxShadow: '0 16px 36px rgba(15, 110, 120, 0.12)',
        transition: { duration: 0.2 },
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
        {label}
      </p>
      <motion.p
        key={value}
        className="mt-2 font-display text-3xl font-semibold tracking-tight text-text"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {value}
      </motion.p>
      {hint ? <p className="mt-1 text-sm text-text-muted">{hint}</p> : null}
    </motion.div>
  )
}
