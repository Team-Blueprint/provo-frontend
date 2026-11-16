import { Check, Clock, Flag, PencilSimple, Prohibit, X } from '@phosphor-icons/react'
import type { JobStatus } from '@/api/types'
import { messages } from '@/messages/en'
import { cn } from '@/lib/utils'

interface StatusPillProps {
  status: JobStatus
}

export function StatusPill({ status }: StatusPillProps) {
  const label = messages.statuses[status]

  const styles: Record<JobStatus, string> = {
    draft: 'bg-muted text-muted-foreground border border-border',
    waiting: 'bg-[var(--pw-warning-tint)] text-foreground border border-[var(--pw-warning)]/30',
    confirmed: 'bg-[var(--pw-success-tint)] text-foreground border border-[var(--pw-success)]/30',
    disputed: 'bg-[var(--pw-critical-tint)] text-foreground border border-[var(--pw-critical)]/30',
    expired: 'bg-muted text-muted-foreground border border-border',
    failed: 'bg-[var(--pw-critical-tint)] text-foreground border border-[var(--pw-critical)]/30',
  }

  const icons: Record<JobStatus, React.ReactNode> = {
    draft: <PencilSimple className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />,
    waiting: <Clock className="h-3.5 w-3.5 shrink-0 text-[var(--pw-warning)]" aria-hidden="true" />,
    confirmed: <Check weight="bold" className="h-3.5 w-3.5 shrink-0 text-[var(--pw-success)]" aria-hidden="true" />,
    disputed: <Flag weight="fill" className="h-3.5 w-3.5 shrink-0 text-[var(--pw-critical)]" aria-hidden="true" />,
    expired: <Prohibit className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />,
    failed: <X weight="bold" className="h-3.5 w-3.5 shrink-0 text-[var(--pw-critical)]" aria-hidden="true" />,
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        styles[status],
      )}
    >
      {icons[status]}
      <span>{label}</span>
    </span>
  )
}
