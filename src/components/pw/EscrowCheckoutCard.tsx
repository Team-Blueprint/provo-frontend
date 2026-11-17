import { useState } from 'react'
import { Check, CheckCircle, Copy, Lock } from 'reicon-react'
import type { EscrowJob } from '@/api/types'
import { StatusPill } from '@/components/pw/StatusPill'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatNaira } from '@/lib/format'

interface EscrowCheckoutCardProps {
  job: EscrowJob
  partialPaidNaira?: number
  isSubmitting?: boolean
  onSimulateFund?: () => Promise<void> | void
  onSimulatePartial?: (halfAmount: number) => void
  onDone?: () => void
  doneLabel?: string
}

export function EscrowCheckoutCard({
  job,
  partialPaidNaira = 0,
  isSubmitting = false,
  onSimulateFund,
  onSimulatePartial,
  onDone,
  doneLabel = 'Go to dashboard',
}: EscrowCheckoutCardProps) {
  const [copied, setCopied] = useState(false)

  const totalNaira = Math.round(job.totalKobo / 100)
  const remainingNaira = Math.max(0, totalNaira - partialPaidNaira)
  const dailyNaira = job.daysCount > 0 ? totalNaira / job.daysCount : totalNaira
  const formattedDaily = Number.isInteger(dailyNaira)
    ? formatNaira(dailyNaira)
    : `₦${dailyNaira.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const isFunded =
    job.status === 'FUNDED' || job.status === 'IN_PROGRESS' || job.status === 'COMPLETED'

  function handleCopyAccount() {
    if (!job.fundingAccountNumber) return
    navigator.clipboard?.writeText(job.fundingAccountNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-6 py-5">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground tabular-nums">
            {isFunded
              ? `${formatNaira(totalNaira)} locked for ${job.workerName}`
              : `Send ${formatNaira(remainingNaira)} to lock pay`}
          </h2>
          <p className="text-sm text-muted-foreground">
            Paga holds this money until {job.workerName} marks each day done and you confirm.
          </p>
        </div>
        <StatusPill status={job.status} />
      </div>

      {!isFunded ? (
        <div className="divide-y divide-border">
          {partialPaidNaira > 0 && (
            <div
              role="status"
              className="bg-[var(--pw-warning-tint)] px-6 py-3.5 text-sm text-foreground tabular-nums"
            >
              <span className="font-semibold">
                {formatNaira(partialPaidNaira)} of {formatNaira(totalNaira)} received.
              </span>{' '}
              Send the remaining{' '}
              <span className="font-semibold">{formatNaira(remainingNaira)}</span> to the same
              account to start the job.
            </div>
          )}

          <div className="px-6 py-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Transfer to this Paga account
                </p>
                <p className="font-mono text-2xl sm:text-3xl font-semibold tracking-wider text-foreground tabular-nums">
                  {job.fundingAccountNumber}
                </p>
                <p className="text-xs text-muted-foreground">Paga MFB · Provo Job Account</p>
              </div>
              <Button size="md" variant="secondary" onClick={handleCopyAccount}>
                {copied ? (
                  <Check className="h-4 w-4 text-[var(--pw-success)]" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                <span>{copied ? 'Copied' : 'Copy account'}</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Send {formatNaira(remainingNaira)} from OPay, Kuda, GTBank, Access, or any Nigerian
              bank. The job starts as soon as the transfer arrives.
            </p>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-6 py-4 text-sm">
            <div className="space-y-0.5">
              <dt className="text-xs text-muted-foreground">Artisan</dt>
              <dd className="font-medium text-foreground">
                {job.workerName} · {job.trade}
              </dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-xs text-muted-foreground">Daily release</dt>
              <dd className="font-medium text-foreground tabular-nums">
                {formattedDaily} / day · {job.daysCount} {job.daysCount === 1 ? 'day' : 'days'}
              </dd>
            </div>
            {job.description && (
              <div className="space-y-0.5">
                <dt className="text-xs text-muted-foreground">Work</dt>
                <dd className="font-medium text-foreground truncate" title={job.description}>
                  {job.description}
                </dd>
              </div>
            )}
          </dl>

          <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/35 px-6 py-4">
            <p className="text-xs text-muted-foreground">
              You have 24 hours to confirm or dispute each day after {job.workerName} marks it
              done.
            </p>
            {(onSimulateFund || onSimulatePartial) && (
              <div className="flex flex-wrap items-center gap-2">
                {onSimulateFund && (
                  <Button size="md" disabled={isSubmitting} onClick={onSimulateFund}>
                    <Lock className="h-4 w-4" aria-hidden="true" />
                    <span>{isSubmitting ? 'Confirming...' : 'Simulate bank transfer'}</span>
                  </Button>
                )}
                {onSimulatePartial && partialPaidNaira === 0 && totalNaira > 20000 && (
                  <Button
                    size="md"
                    variant="secondary"
                    onClick={() => onSimulatePartial(Math.round(totalNaira / 2))}
                  >
                    Simulate partial
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-2.5 rounded-[var(--pw-radius-sm)] border border-[var(--pw-success)]/30 bg-[var(--pw-success-tint)] px-4 py-3 text-sm font-medium text-[var(--pw-success)]">
            <CheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {formatNaira(totalNaira)} is locked with Paga. {job.workerName} can start work.
            </span>
          </div>
          {onDone && (
            <Button size="md" onClick={onDone}>
              {doneLabel}
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}
