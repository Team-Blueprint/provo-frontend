import { Check, Clock, CloseCircle, Flag, Lock } from 'reicon-react'
import type { DayStatus, JobStatus } from '@/api/types'
import { messages } from '@/messages/en'
import { cn } from '@/lib/utils'

interface StatusPillProps {
  status: DayStatus | JobStatus
}

export function StatusPill({ status }: StatusPillProps) {
  const label = messages.statuses[status]

  const tone: Record<DayStatus | JobStatus, string> = {
    PENDING: 'bg-muted text-muted-foreground border border-border',
    DRAFT: 'bg-muted text-muted-foreground border border-border',
    AWAITING_FUNDING:
      'bg-[var(--pw-warning-tint)] text-foreground border border-[var(--pw-warning)]/30',
    DONE_REPORTED:
      'bg-[var(--pw-warning-tint)] text-foreground border border-[var(--pw-warning)]/30',
    FUNDED: 'bg-[var(--pw-info-tint)] text-foreground border border-[var(--pw-info)]/30',
    IN_PROGRESS: 'bg-[var(--pw-info-tint)] text-foreground border border-[var(--pw-info)]/30',
    CONFIRMED: 'bg-[var(--pw-success-tint)] text-foreground border border-[var(--pw-success)]/30',
    PAID: 'bg-[var(--pw-success-tint)] text-foreground border border-[var(--pw-success)]/30',
    COMPLETED: 'bg-[var(--pw-success-tint)] text-foreground border border-[var(--pw-success)]/30',
    AUTO_RELEASED: 'bg-muted text-foreground border border-dashed border-border',
    DISPUTED:
      'bg-[var(--pw-critical-tint)] text-foreground border border-[var(--pw-critical)]/30',
    CANCELLED: 'bg-muted text-muted-foreground border border-border',
  }

  const icon =
    status === 'PAID' || status === 'CONFIRMED' || status === 'COMPLETED' ? (
      <Check className="h-3.5 w-3.5 shrink-0 text-[var(--pw-success)]" aria-hidden="true" />
    ) : status === 'DISPUTED' ? (
      <Flag weight="Filled" className="h-3.5 w-3.5 shrink-0 text-[var(--pw-critical)]" aria-hidden="true" />
    ) : status === 'FUNDED' || status === 'IN_PROGRESS' ? (
      <Lock className="h-3.5 w-3.5 shrink-0 text-[var(--pw-info)]" aria-hidden="true" />
    ) : status === 'CANCELLED' ? (
      <CloseCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
    ) : (
      <Clock className="h-3.5 w-3.5 shrink-0 text-[var(--pw-warning)]" aria-hidden="true" />
    )

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        tone[status],
      )}
    >
      {icon}
      <span>{label}</span>
    </span>
  )
}
