import { motion } from 'motion/react'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <motion.div
      className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.08 } },
      }}
    >
      <div className="max-w-2xl">
        {eyebrow ? (
          <motion.p
            className="text-xs font-semibold uppercase tracking-[0.16em] text-accent"
            variants={{
              hidden: { opacity: 0, y: 8 },
              show: { opacity: 1, y: 0 },
            }}
          >
            {eyebrow}
          </motion.p>
        ) : null}
        <motion.h1
          className="mt-1 font-display text-3xl font-semibold tracking-tight text-text md:text-4xl"
          variants={{
            hidden: { opacity: 0, y: 12 },
            show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
          }}
        >
          {title}
        </motion.h1>
        {description ? (
          <motion.p
            className="mt-2 text-sm leading-relaxed text-text-muted md:text-base"
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
            }}
          >
            {description}
          </motion.p>
        ) : null}
      </div>
      {actions ? (
        <motion.div
          className="flex flex-wrap items-center gap-2"
          variants={{
            hidden: { opacity: 0, y: 10 },
            show: { opacity: 1, y: 0 },
          }}
        >
          {actions}
        </motion.div>
      ) : null}
    </motion.div>
  )
}
