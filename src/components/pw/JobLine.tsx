import type { Job } from '@/api/types'
import { formatShortDate } from '@/lib/format'
import { AmountText } from './AmountText'
import { GradeBadge } from './GradeBadge'
import { StatusPill } from './StatusPill'

interface JobLineProps {
  job: Job
  mode: 'worker' | 'lender'
  onSelect?: (job: Job) => void
}

export function JobLine({ job, mode, onSelect }: JobLineProps) {
  const clientLabel =
    mode === 'lender' ? `Client ${job.clientToken}` : job.clientName

  return (
    <button
      type="button"
      onClick={() => onSelect?.(job)}
      className="w-full text-left rounded-[var(--pw-radius-md)] border border-border bg-card p-3.5 hover:bg-muted/50 transition-colors cursor-pointer"
    >
      <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground">{clientLabel}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">
              {job.jobType ?? 'Unassigned job'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatShortDate(job.createdAt)}
            {job.receiptId ? ` · ${job.receiptId}` : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 md:justify-end">
          <div className="flex flex-wrap items-center gap-1.5">
            <GradeBadge grade={job.grade} size="sm" />
            <StatusPill status={job.status} />
          </div>
          <AmountText amount={job.amount} size="md" className="min-w-[88px] text-right" />
        </div>
      </div>
    </button>
  )
}
