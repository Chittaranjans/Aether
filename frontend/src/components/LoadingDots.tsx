export function LoadingDots({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-text-muted">
      {label ? <span>{label}</span> : null}
      <span className="inline-flex gap-1" aria-hidden>
        <span className="loading-dot h-1.5 w-1.5 rounded-full bg-accent" />
        <span className="loading-dot h-1.5 w-1.5 rounded-full bg-accent" />
        <span className="loading-dot h-1.5 w-1.5 rounded-full bg-accent" />
      </span>
    </span>
  )
}
