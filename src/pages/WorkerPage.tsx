import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  Briefcase,
  Check,
  CheckCircle,
  Copy,
} from 'reicon-react'
import { api } from '@/api/client'
import type { EscrowJob, ReportPayload, Worker } from '@/api/types'
import { formatNaira, getTierDetails } from '@/lib/format'
import { EmptyState } from '@/components/pw/EmptyState'
import { JobLine } from '@/components/pw/JobLine'
import { WorkerShell } from '@/components/pw/WorkerShell'
import { WorkerWithdrawModal } from '@/components/pw/WorkerWithdrawModal'
import { Button } from '@/components/ui/button'
import { Card, Skeleton } from '@/components/ui/card'
import { toast } from '@/components/ui/toast'

export function WorkerPage() {
  const [loading, setLoading] = useState(true)
  const [worker, setWorker] = useState<Worker | null>(null)
  const [jobs, setJobs] = useState<EscrowJob[]>([])
  const [reportPreview, setReportPreview] = useState<ReportPayload | null>(null)
  const [copiedNuban, setCopiedNuban] = useState(false)
  const [markingKey, setMarkingKey] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [withdrawnNaira, setWithdrawnNaira] = useState(0)

  async function load() {
    setLoading(true)
    try {
      const data = await api.getWorkerDashboard()
      setWorker(data.worker)
      setJobs(data.jobs)
      setReportPreview(data.reportPreview)
      const saved = Number(window.localStorage.getItem(`proofwork_withdrawn_${data.worker.id}`) || '0')
      setWithdrawnNaira(Number.isFinite(saved) ? saved : 0)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not load worker dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const handler = () => load()
    window.addEventListener('proofwork:demo-updated', handler)
    return () => window.removeEventListener('proofwork:demo-updated', handler)
  }, [])

  const activeJobs = jobs.filter((j) => j.status === 'FUNDED' || j.status === 'IN_PROGRESS')
  const settledDays = jobs
    .flatMap((j) => j.days)
    .filter((d) => d.status === 'PAID' || d.status === 'CONFIRMED' || d.status === 'AUTO_RELEASED')
  const confirmedDays = settledDays.length
  const totalEarnedNaira = Math.round(
    settledDays.reduce((sum, d) => sum + d.amountKobo, 0) / 100,
  )
  const pendingPayNaira = Math.round(
    activeJobs
      .flatMap((j) => j.days)
      .filter((d) => d.status === 'PENDING' || d.status === 'DONE_REPORTED')
      .reduce((sum, d) => sum + d.amountKobo, 0) / 100,
  )
  const waitingDays = jobs
    .flatMap((j) => j.days)
    .filter((d) => d.status === 'DONE_REPORTED').length
  const availableBalanceNaira = Math.max(0, totalEarnedNaira - withdrawnNaira)

  return (
    <WorkerShell jobCount={jobs.length}>
      {loading || !worker ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-4 w-72 max-w-full" />
            </div>
            <div className="flex gap-2.5">
              <Skeleton className="h-10 w-32 rounded-full" />
              <Skeleton className="h-10 w-36 rounded-full" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Card key={i} className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-7 w-7 rounded-full" />
                </div>
                <Skeleton className="h-10 w-16" />
                <Skeleton className="h-3 w-32" />
              </Card>
            ))}
          </div>

          <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3.5 w-64 max-w-full" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-10 w-44 rounded-full" />
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-12">
            <Card className="lg:col-span-5 p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3.5 w-32" />
                </div>
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
              <Skeleton className="h-14 w-full rounded-[10px]" />
              <div className="flex justify-between pt-2 border-t border-border">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3.5 w-20" />
              </div>
            </Card>
            <Card className="lg:col-span-7 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-3.5 w-16" />
              </div>
              <div className="space-y-2.5">
                <Skeleton className="h-16 w-full rounded-[12px]" />
                <Skeleton className="h-16 w-full rounded-[12px]" />
                <Skeleton className="h-16 w-full rounded-[12px]" />
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">Overview</h1>
              <p className="text-sm text-muted-foreground">
                Mark work days done to release your pay and build your record.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Link to="/ussd">
                <Button size="md" variant="secondary">
                  <span>USSD simulator</span>
                </Button>
              </Link>
              <Link to="/worker/share-link">
                <Button size="md">
                  <span>Share your link</span>
                </Button>
              </Link>
            </div>
          </div>

          {reportPreview && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-[var(--pw-radius-lg)] bg-primary text-primary-foreground p-5 flex flex-col justify-between gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium opacity-90">Provo Score</span>
                  <Link
                    to="/worker/consent"
                    aria-label="Share report"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-foreground text-primary"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
                <p className="text-4xl font-bold tabular-nums">{reportPreview.score}</p>
                <p className="text-xs opacity-85">
                  {getTierDetails(reportPreview.score).tier} tier · /100
                </p>
              </div>

              <Card className="p-5 flex flex-col justify-between gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Total Earned</span>
                  <Link
                    to="/worker/jobs"
                    aria-label="View earned jobs"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
                <p className="text-3xl font-bold tabular-nums text-foreground">
                  {formatNaira(totalEarnedNaira)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {confirmedDays} paid {confirmedDays === 1 ? 'day' : 'days'}
                </p>
              </Card>

              <Card className="p-5 flex flex-col justify-between gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Pending Pay</span>
                  <Link
                    to="/worker/jobs"
                    aria-label="View pending pay"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
                <p className="text-3xl font-bold tabular-nums text-foreground">
                  {formatNaira(pendingPayNaira)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {waitingDays} {waitingDays === 1 ? 'day' : 'days'} in 24h window
                </p>
              </Card>

              <Card className="p-5 flex flex-col justify-between gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Paid days</span>
                  <Link
                    to="/worker/jobs"
                    aria-label="View jobs"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
                <p className="text-4xl font-bold tabular-nums text-foreground">{confirmedDays}</p>
                <p className="text-xs text-muted-foreground">Paid out to Paga</p>
              </Card>
            </div>
          )}

          {notice && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-2 rounded-[var(--pw-radius-md)] border border-[var(--pw-positive)]/30 bg-[var(--pw-positive-tint)] px-4 py-2.5 text-xs font-medium text-[var(--pw-positive)]"
            >
              <CheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{notice}</span>
            </div>
          )}

          {activeJobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              compact
              title="No active funded jobs"
              description={`When an employer locks job pay for ${worker.name}, your daily schedule appears here so you can mark each day done.`}
              action={
                <Link to="/worker/share-link">
                  <Button size="sm" variant="secondary">
                    Share your work link →
                  </Button>
                </Link>
              }
            />
          ) : (
            activeJobs.map((job) => {
              const nextPending = job.days.find((d) => d.status === 'PENDING')
              const awaitingDay = job.days.find((d) => d.status === 'DONE_REPORTED')
              const paidCount = job.days.filter(
                (d) => d.status === 'PAID' || d.status === 'CONFIRMED',
              ).length
              const actionKey = nextPending ? `${job.id}-${nextPending.dayNumber}` : null
              const statusSummary = [
                nextPending
                  ? `Day ${nextPending.dayNumber} of ${job.daysCount}`
                  : `${job.daysCount} of ${job.daysCount} days reported`,
                `${paidCount} paid`,
                awaitingDay ? `Day ${awaitingDay.dayNumber} in 24h window` : null,
              ]
                .filter(Boolean)
                .join(' · ')

              return (
                <Card
                  key={job.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-primary/30"
                >
                  <div className="space-y-1">
                    <h2 className="text-base font-semibold text-foreground">
                      {job.clientName} · {job.trade}
                    </h2>
                    <p className="text-xs text-muted-foreground tabular-nums">{statusSummary}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      to="/worker/jobs"
                      className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Details →
                    </Link>

                    {nextPending && (
                      <Button
                        size="md"
                        disabled={markingKey === actionKey}
                        onClick={async () => {
                          if (!actionKey) return
                          setMarkingKey(actionKey)
                          try {
                            await api.markDayDone(job.id, nextPending.dayNumber)
                            const msg = `Day ${nextPending.dayNumber} for ${job.clientName} marked Done. 24h confirmation window started.`
                            setNotice(msg)
                            toast.success(msg, `Day ${nextPending.dayNumber} reported`)
                            await load()
                          } catch (err) {
                            toast.error(
                              err instanceof Error ? err.message : 'Could not mark day as done.',
                            )
                          } finally {
                            setMarkingKey(null)
                          }
                        }}
                      >
                        <CheckCircle className="h-4 w-4" aria-hidden="true" />
                        <span>
                          {markingKey === actionKey
                            ? 'Updating...'
                            : `Mark Day ${nextPending.dayNumber} done · ₦${Math.round(nextPending.amountKobo / 100).toLocaleString()}`}
                        </span>
                      </Button>
                    )}
                  </div>
                </Card>
              )
            })
          )}

          <div className="grid gap-4 lg:grid-cols-12">
            <Card className="lg:col-span-5 p-5 flex flex-col justify-between gap-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[11px] text-primary">
                    Payout Paga Account
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      navigator.clipboard?.writeText(worker.pagaAccountNumber)
                      setCopiedNuban(true)
                      setTimeout(() => setCopiedNuban(false), 1500)
                    }}
                  >
                    {copiedNuban ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedNuban ? 'Copied' : 'Copy'}</span>
                  </Button>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Available to withdraw</p>
                    <p className="text-2xl font-bold tabular-nums text-foreground">
                      {formatNaira(availableBalanceNaira)}
                    </p>
                  </div>
                  <Button
                    size="md"
                    disabled={availableBalanceNaira <= 0}
                    onClick={() => setWithdrawOpen(true)}
                  >
                    Withdraw
                  </Button>
                </div>
                <p className="font-mono text-xl sm:text-2xl font-semibold tracking-wider text-foreground">
                  {worker.pagaAccountNumber.replace(/(\d{4})(\d{4})(\d{2})/, '$1 $2 $3')}
                </p>
                <p className="text-xs text-muted-foreground">
                  Confirmed days pay out here and settle to {worker.bankName} (
                  {worker.bankAccountNumber}). Telegram: {worker.telegramHandle}
                </p>
              </div>
              <Link to="/worker/jobs" className="text-xs font-medium text-primary hover:underline">
                View day-by-day schedule →
              </Link>
            </Card>

            <Card className="lg:col-span-7 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">Recent jobs</h2>
                <Link to="/worker/jobs" className="text-xs font-medium text-primary hover:underline">
                  View all →
                </Link>
              </div>
              <div className="space-y-2.5">
                {jobs.length === 0 ? (
                  <EmptyState
                    icon={Briefcase}
                    compact
                    title="No job history yet"
                    description="Completed and funded jobs will appear here once an employer creates one."
                  />
                ) : (
                  jobs.slice(0, 3).map((job) => (
                    <JobLine key={job.id} job={job} mode="worker" />
                  ))
                )}
              </div>
            </Card>
          </div>
          <WorkerWithdrawModal
            open={withdrawOpen}
            onClose={() => setWithdrawOpen(false)}
            worker={worker}
            availableBalanceNaira={availableBalanceNaira}
            onSuccess={(amountNaira, destination) => {
              const nextWithdrawn = withdrawnNaira + amountNaira
              setWithdrawnNaira(nextWithdrawn)
              window.localStorage.setItem(
                `proofwork_withdrawn_${worker.id}`,
                String(nextWithdrawn),
              )
              setNotice(`Withdrawal of ${formatNaira(amountNaira)} queued to ${destination}.`)
            }}
          />
        </>
      )}
    </WorkerShell>
  )
}
