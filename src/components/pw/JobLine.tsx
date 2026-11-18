import type { EscrowJob } from '@/api/types'
import { formatNaira, formatShortDate } from '@/lib/format'
import { AmountText } from './AmountText'
import { GradeBadge } from './GradeBadge'
import { StatusPill } from './StatusPill'

interface JobLineProps {
  job: EscrowJob
  mode: 'worker' | 'lender' | 'client'
  onSelect?: (job: EscrowJob) => void
}

function maskEmployerLabel(name: string, token: string): string {
  const clean = (name || '').trim()
  if (clean.includes('***')) return clean
  if (!clean || clean === 'Employer' || clean.startsWith('Client-')) {
    const short = (token || '').split('-').pop() || token
    return `Masked Employer (#${short})`
  }
  const masked = clean
    .split(/\s+/)
    .map((part) => {
      if (part.length <= 2) return `${part[0]}*`
      return `${part[0]}${'*'.repeat(Math.min(3, part.length - 2))}${part[part.length - 1]}`
    })
    .join(' ')
  const short = (token || '').split('-').pop() || token
  return short && !masked.includes(short) ? `${masked} (#${short})` : masked
}

export function JobLine({ job, mode, onSelect }: JobLineProps) {
  const clientLabel =
    mode === 'lender' ? maskEmployerLabel(job.clientName, job.clientToken) : job.clientName
  const paidDays = job.days.filter(
    (d) => d.status === 'PAID' || d.status === 'CONFIRMED' || d.status === 'AUTO_RELEASED',
  ).length
  const latestOutcome = [...job.days].reverse().find((d) => d.outcome)?.outcome

  return (
    <div
      onClick={() => onSelect?.(job)}
      className="w-full text-left rounded-[14px] border border-border bg-card p-4 space-y-3 transition-colors"
    >
      <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-foreground">
              {mode === 'client' ? job.workerName : clientLabel}
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-sm font-medium text-foreground/85">
              {job.trade} ({paidDays} of {job.daysCount} days paid)
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {job.description} · {formatShortDate(job.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 md:justify-end">
          <div className="flex flex-wrap items-center gap-1.5">
            {latestOutcome && mode !== 'lender' && <GradeBadge outcome={latestOutcome} size="sm" />}
            <StatusPill status={job.status} />
          </div>
          <AmountText
            amount={Math.round(job.totalKobo / 100)}
            size="md"
            className="min-w-[88px] text-right"
          />
        </div>
      </div>

      {mode === 'lender' && job.days.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-border/70 pt-2.5">
          {job.days.map((day) => (
            <div
              key={day.dayNumber}
              className="inline-flex items-center gap-1.5 rounded-[8px] border border-border bg-muted/35 px-2.5 py-1 text-xs"
            >
              <span className="font-mono font-semibold text-foreground">Day {day.dayNumber}</span>
              <span className="text-muted-foreground tabular-nums">
                {formatNaira(Math.round(day.amountKobo / 100))}
              </span>
              {day.outcome ? (
                <GradeBadge outcome={day.outcome} size="sm" />
              ) : (
                <StatusPill status={day.status} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
