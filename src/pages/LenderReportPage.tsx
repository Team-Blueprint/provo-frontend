import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Briefcase,
  DownloadSquare,
  Printer,
  ShieldCheck,
  Warning,
} from 'reicon-react'
import { api } from '@/api/client'
import type { ConfirmationOutcome, ReportPayload } from '@/api/types'
import { downloadJobHistoryImage } from '@/lib/downloadJobHistory'
import { formatMaskedEmployer, formatNaira, formatShortDate, getTierDetails } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Card, Skeleton } from '@/components/ui/card'
import { EmptyState } from '@/components/pw/EmptyState'
import { GradeBadge } from '@/components/pw/GradeBadge'
import { JobLine } from '@/components/pw/JobLine'
import { ProvoMark } from '@/components/pw/ProvoMark'

const OUTCOME_FILTERS: Array<{ key: 'all' | ConfirmationOutcome; label: string }> = [
  { key: 'all', label: 'All jobs' },
  { key: 'client', label: 'Employer confirmed' },
  { key: 'supervisor', label: 'Supervisor confirmed' },
  { key: 'auto', label: 'Auto-released (24h)' },
]

export function LenderReportPage() {
  const { reportToken = 'rep_emem_lapo_2026' } = useParams()
  const [report, setReport] = useState<ReportPayload | null>(null)
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | ConfirmationOutcome>('all')

  async function load() {
    const data = await api.getReport(reportToken)
    setReport(data)
  }

  useEffect(() => {
    load()
    const handler = () => load()
    window.addEventListener('proofwork:demo-updated', handler)
    return () => window.removeEventListener('proofwork:demo-updated', handler)
  }, [reportToken])

  useEffect(() => {
    if (!report) return
    const previousTitle = document.title
    document.title = `Provo Work Record - ${report.worker.name}`
    return () => {
      document.title = previousTitle
    }
  }, [report])

  const filteredJobs = !report
    ? []
    : outcomeFilter === 'all'
      ? report.jobs
      : report.jobs
          .map((job) => ({
            ...job,
            days: job.days.filter((d) => d.outcome === outcomeFilter),
          }))
          .filter((job) => job.days.length > 0)

  const totalSettledNaira = report
    ? report.signedSnapshot.signals.totalPaidNaira ||
      report.jobs.reduce(
        (sum, job) =>
          sum +
          job.days
            .filter((d) => d.status === 'PAID' || d.status === 'CONFIRMED')
            .reduce((s, d) => s + Math.round(d.amountKobo / 100), 0),
        0,
      )
    : 0

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="sticky top-4 z-30 mx-auto max-w-5xl px-4 no-print">
        <header className="flex items-center justify-between rounded-full border border-border bg-card/90 px-5 py-2.5 backdrop-blur-md shadow-[var(--pw-shadow-card)]">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            <ProvoMark className="h-5 w-5" />
            <span>Provo</span>
          </Link>
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            <span>Save / Print PDF</span>
          </Button>
        </header>
      </div>

      <main className="mx-auto max-w-5xl px-4 sm:px-8 py-8 space-y-6">
        {!report ? (
          <div className="space-y-6">
            <Card className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="space-y-2">
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3.5 w-72 max-w-full" />
              </div>
              <div className="rounded-[14px] border border-border bg-muted/40 px-5 py-3.5 w-36 space-y-2">
                <Skeleton className="h-3 w-20 sm:ml-auto" />
                <Skeleton className="h-10 w-24 sm:ml-auto" />
                <Skeleton className="h-3 w-24 sm:ml-auto" />
              </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="p-5 sm:p-6 space-y-4 lg:col-span-2">
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-3.5 w-72 max-w-full" />
                </div>
                <div className="divide-y divide-border">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="py-3 flex items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                      <Skeleton className="h-4 w-14" />
                    </div>
                  ))}
                </div>
              </Card>

              <div className="space-y-6">
                <Card className="p-5 space-y-3">
                  <Skeleton className="h-5 w-44" />
                  <Skeleton className="h-3 w-52" />
                  <div className="space-y-2.5 pt-1">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-28 rounded-full" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-28 rounded-full" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </Card>

                <Card className="p-5 space-y-3">
                  <Skeleton className="h-5 w-32" />
                  <div className="grid grid-cols-2 gap-2">
                    {[0, 1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-14 w-full rounded-[10px]" />
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            <Card className="p-5 sm:p-6 space-y-3">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-3.5 w-80 max-w-full" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-[12px]" />
                ))}
              </div>
            </Card>
          </div>
        ) : (
          <>
            <Card className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-medium text-primary">
                  <ShieldCheck weight="Filled" className="h-4 w-4" aria-hidden="true" />
                  <span>Verified Work Record · Shared with {report.lenderName}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                  {report.worker.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {report.worker.trade} · {report.worker.area}
                </p>
                <p className="text-xs text-muted-foreground">
                  Issued {formatShortDate(report.generatedAt)} · Access expires{' '}
                  {formatShortDate(report.expiresAt)} · Total verified pay:{' '}
                  <span className="font-semibold text-foreground">
                    {formatNaira(totalSettledNaira)}
                  </span>
                </p>
              </div>

              <div className="rounded-[14px] border border-border bg-muted/40 px-5 py-3.5 text-left sm:text-right shrink-0">
                <span className="block text-xs font-medium text-muted-foreground">
                  Profile score
                </span>
                <span className="text-3xl font-bold tabular-nums text-foreground block">
                  {report.score}
                  <span className="text-base font-normal text-muted-foreground"> / 100</span>
                </span>
                <span className="block text-xs font-medium text-primary mt-0.5 tabular-nums">
                  {getTierDetails(report.score).tier} tier · {report.clientTokens.length}{' '}
                  {report.clientTokens.length === 1 ? 'employer' : 'employers'}
                </span>
              </div>
            </Card>

            {report.components.length > 0 && (
              <Card className="p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">
                      Profile score breakdown
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {getTierDetails(report.score).unlocks}
                    </p>
                  </div>
                  <Link
                    to="/docs/lenders/profile-score"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    How scoring &amp; tiers work →
                  </Link>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {report.components.map((comp) => (
                    <div
                      key={comp.key}
                      className="rounded-[var(--pw-radius-md)] border border-border bg-muted/30 p-3 space-y-1"
                    >
                      <span className="block text-xs text-muted-foreground">{comp.label}</span>
                      <span className="block text-lg font-semibold tabular-nums text-foreground">
                        {comp.points}
                        <span className="text-xs font-normal text-muted-foreground">
                          /{comp.maxPoints}
                        </span>
                      </span>
                      <span className="block text-[11px] text-muted-foreground leading-snug">
                        {comp.detail}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {report.circularFlags.length > 0 && (
              <Card className="border-[var(--pw-critical)]/40 bg-[var(--pw-critical-tint)] p-4 space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-[var(--pw-critical)]">
                  <Warning weight="Filled" className="h-4 w-4" aria-hidden="true" />
                  <span>Concentration notice</span>
                </div>
                {report.circularFlags.map((flag) => (
                  <p key={flag} className="text-sm text-foreground">
                    {flag}
                  </p>
                ))}
              </Card>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-5 space-y-3">
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Who confirmed each workday
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Direct employer and supervisor sign-offs vs. 24-hour auto-releases.
                  </p>
                </div>
                <div className="space-y-2.5">
                  {report.outcomeMix.map((item) => (
                    <div key={item.outcome} className="flex items-center justify-between text-xs">
                      <GradeBadge outcome={item.outcome} size="sm" />
                      <span className="tabular-nums text-muted-foreground">
                        {item.count} days ({item.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5 space-y-3">
                <h2 className="text-base font-semibold text-foreground">Monthly activity</h2>
                {report.activeMonths.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No settled months yet.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2">
                    {report.activeMonths.map((m) => (
                      <div
                        key={m.month}
                        className={`rounded-[10px] border p-2.5 text-center ${
                          m.confirmedDays > 0
                            ? 'border-primary/35 bg-secondary'
                            : 'border-border bg-muted/40'
                        }`}
                      >
                        <span className="block text-xs font-medium text-foreground">
                          {m.label}
                        </span>
                        <span className="block text-xs tabular-nums text-muted-foreground">
                          {m.confirmedDays} days
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <Card className="p-5 sm:p-6 space-y-3">
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-foreground">
                  Masked employers ({report.clientTokens.length})
                </h2>
                <p className="text-xs text-muted-foreground">
                  Employer names are partially masked to protect privacy under Nigeria’s Data
                  Protection Act (NDPA), while proving earnings come from real, distinct payers.
                </p>
              </div>
              {report.clientTokens.length === 0 ? (
                <p className="text-xs text-muted-foreground">No verified employers recorded yet.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {report.clientTokens.map((ct) => (
                    <div
                      key={ct.token}
                      className="rounded-[12px] border border-border bg-card p-3.5 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-sm font-semibold text-foreground truncate">
                          {formatMaskedEmployer(ct.displayLabel, ct.token)}
                        </span>
                        <span className="text-[11px] text-[var(--pw-positive)] font-medium shrink-0">
                          Verified
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {ct.confirmedDays} confirmed, {ct.autoReleasedDays} auto-released ·{' '}
                        {formatNaira(ct.totalNaira)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Verified job history ({filteredJobs.length})
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Day-by-day record of funded jobs, masked employers, and payout confirmations.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 no-print">
                  {OUTCOME_FILTERS.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setOutcomeFilter(f.key)}
                      className={`rounded-full px-3 py-1 text-xs font-medium cursor-pointer border transition-colors ${
                        outcomeFilter === f.key
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => downloadJobHistoryImage(report, filteredJobs)}
                  >
                    <DownloadSquare className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Download history</span>
                  </Button>
                </div>
              </div>

              {filteredJobs.length === 0 ? (
                <EmptyState
                  icon={Briefcase}
                  compact
                  title="No matching jobs"
                  description="No jobs match this confirmation filter."
                  action={
                    outcomeFilter !== 'all' && (
                      <Button size="sm" variant="secondary" onClick={() => setOutcomeFilter('all')}>
                        Show all jobs
                      </Button>
                    )
                  }
                />
              ) : (
                <div className="space-y-2.5">
                  {filteredJobs.map((job) => (
                    <JobLine key={job.id} job={job} mode="lender" />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}
