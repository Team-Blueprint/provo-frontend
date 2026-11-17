import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  Check,
  CheckCircle,
  Copy,
} from 'reicon-react'
import { api } from '@/api/client'
import type { EscrowJob, ReportPayload, Worker } from '@/api/types'
import { getTierDetails } from '@/lib/format'
import { JobLine } from '@/components/pw/JobLine'
import { WorkerShell } from '@/components/pw/WorkerShell'
import { Button } from '@/components/ui/button'
import { Card, Skeleton } from '@/components/ui/card'

export function WorkerPage() {
  const [loading, setLoading] = useState(true)
  const [worker, setWorker] = useState<Worker | null>(null)
  const [jobs, setJobs] = useState<EscrowJob[]>([])
  const [reportPreview, setReportPreview] = useState<ReportPayload | null>(null)
  const [copiedNuban, setCopiedNuban] = useState(false)
  const [markingKey, setMarkingKey] = useState<string | null>(null)
  const [notice, setNotice] = useState('')

  async function load() {
    setLoading(true)
    const data = await api.getWorkerDashboard()
    setWorker(data.worker)
    setJobs(data.jobs)
    setReportPreview(data.reportPreview)
    setLoading(false)
  }

  useEffect(() => {
    load()
    const handler = () => load()
    window.addEventListener('proofwork:demo-updated', handler)
    return () => window.removeEventListener('proofwork:demo-updated', handler)
  }, [])

  const activeJobs = jobs.filter((j) => j.status === 'FUNDED' || j.status === 'IN_PROGRESS')
  const confirmedDays = jobs
    .flatMap((j) => j.days)
    .filter((d) => d.status === 'PAID' || d.status === 'CONFIRMED').length
  const waitingDays = jobs
    .flatMap((j) => j.days)
    .filter((d) => d.status === 'DONE_REPORTED').length

  return (
    <WorkerShell jobCount={jobs.length}>
      {loading || !worker ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
          </div>
          <Skeleton className="h-44 w-full" />
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
              <div className="rounded-[var(--pw-radius-md)] bg-primary text-primary-foreground p-5 flex flex-col justify-between gap-4">
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
                  <span className="text-sm font-medium text-foreground">Paid days</span>
                  <Link
                    to="/worker/jobs"
                    aria-label="View jobs"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
                <p className="text-4xl font-bold tabular-nums text-foreground">{confirmedDays}</p>
                <p className="text-xs text-muted-foreground">Paid out to Paga</p>
              </Card>

              <Card className="p-5 flex flex-col justify-between gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">24h window</span>
                  <Link
                    to="/worker/jobs"
                    aria-label="View waiting days"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
                <p className="text-4xl font-bold tabular-nums text-foreground">{waitingDays}</p>
                <p className="text-xs text-muted-foreground">Awaiting employer or supervisor</p>
              </Card>

              <Card className="p-5 flex flex-col justify-between gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Active months</span>
                  <Link
                    to="/worker/jobs"
                    aria-label="View work history"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
                <p className="text-4xl font-bold tabular-nums text-foreground">
                  {reportPreview.activeMonths.filter((m) => m.confirmedDays > 0).length}
                </p>
                <p className="text-xs text-muted-foreground">Consistent work history</p>
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
            <Card className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-foreground">No active funded jobs</h2>
                <p className="text-xs text-muted-foreground max-w-lg">
                  When an employer locks job pay for {worker.name}, your daily schedule
                  appears here so you can mark each day done.
                </p>
              </div>
              <Link to="/client" className="shrink-0">
                <Button size="sm" variant="secondary">
                  Try employer flow →
                </Button>
              </Link>
            </Card>
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
                            setNotice(
                              `Day ${nextPending.dayNumber} for ${job.clientName} marked Done. 24h confirmation window started.`,
                            )
                            await load()
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
                <p className="font-mono text-2xl sm:text-3xl font-semibold tracking-wider text-foreground">
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
                {jobs.slice(0, 3).map((job) => (
                  <JobLine key={job.id} job={job} mode="worker" />
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </WorkerShell>
  )
}
