export function ProvoMark({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <img
      src="/favicon.svg"
      alt=""
      aria-hidden="true"
      className={`shrink-0 rounded-[6px] ${className}`}
    />
  )
}
