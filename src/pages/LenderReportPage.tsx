import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Code, Copy, Printer, ShieldCheck, Warning } from '@phosphor-icons/react'
import { api } from '@/api/client'
import type { EvidenceGrade, ReportPayload } from '@/api/types'
import { formatNaira, formatShortDate, getTierDetails } from '@/lib/format'
import { messages } from '@/messages/en'
import { Button } from '@/components/ui/button'
import { Card, Skeleton } from '@/components/ui/card'
import { GradeBadge } from '@/components/pw/GradeBadge'
import { JobLine } from '@/components/pw/JobLine'

export function LenderReportPage() {
  const { reportToken = 'rep_emem_lapo_2026' } = useParams()
  const [report, setReport] = useState<ReportPayload | null>(null)
  const [gradeFilter, setGradeFilter] = useState<'all' | EvidenceGrade>('all')
  const [copiedJson, setCopiedJson] = useState(false)

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

  const filteredJobs =
    !report
      ? []
      : gradeFilter === 'all'
        ? report.jobs
        : report.jobs.filter((j) => j.grade === gradeFilter)

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <header className="border-b border-border bg-card no-print">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Proofwork</span>
          </Link>
          <Button size="sm" variant="secondary" onClick={() => window.print()}>
            <Printer className="h-4 w-4" aria-hidden="true" />
            <span>Print report</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        {!report ? (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-56 w-full" />
          </div>
        ) : (
          <>
            <Card className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-medium text-primary">
                  <ShieldCheck weight="fill" className="h-4 w-4" aria-hidden="true" />
                  <span>Consented Lender Report · {report.lenderName}</span>
                </div>
                <h1 className="text-2xl font-semibold text-foreground">
                  {report.worker.name} · {report.worker.trade}
                </h1>
                <p className="text-xs text-muted-foreground">
                  Generated {formatShortDate(report.generatedAt)} · Expires{' '}
                  {formatShortDate(report.expiresAt)} · Token{' '}
                  <span className="font-mono">{report.reportToken}</span>
                </p>
              </div>
              <div className="rounded-[var(--pw-radius-md)] border border-border bg-muted/40 px-5 py-3 text-left sm:text-right">
                <span className="block text-xs text-muted-foreground">Income score</span>
                <span className="text-4xl font-bold tabular-nums text-foreground">
                  {report.score}
                </span>
                <span className="text-sm text-muted-foreground"> / 100</span>
                <span className="block text-xs font-medium text-primary mt-0.5">
                  {report.band}
                </span>
              </div>
            </Card>

            {report.circularFlags.length > 0 && (
              <Card className="border-[var(--pw-critical)]/40 bg-[var(--pw-critical-tint)] p-4 space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-[var(--pw-critical)]">
                  <Warning weight="fill" className="h-4 w-4" aria-hidden="true" />
                  <span>Circular-flow flag</span>
                </div>
                {report.circularFlags.map((flag) => (
                  <p key={flag} className="text-sm text-foreground">{flag}</p>
                ))}
              </Card>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="p-5 space-y-4 lg:col-span-2">
                <h2 className="text-lg font-medium text-foreground">Score breakdown</h2>
                <div className="divide-y divide-border">
                  {report.components.map((comp) => (
                    <div key={comp.key} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-foreground">{comp.label}</p>
                        <p className="text-xs text-muted-foreground">{comp.detail}</p>
                      </div>
                      <span className="font-mono text-sm font-semibold tabular-nums text-foreground shrink-0">
                        {comp.points > 0 ? `+${comp.points}` : comp.points}
                        {comp.maxPoints > 0 ? ` / ${comp.maxPoints}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground border-t border-border pt-3">
                  {messages.report.fraudNote}
                </p>
              </Card>

              <div className="space-y-6">
                <Card className="p-5 space-y-3">
                  <h2 className="text-base font-medium text-foreground">Evidence grade mix</h2>
                  <div className="space-y-2.5">
                    {report.gradeMix.map((item) => (
                      <div key={item.grade} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <GradeBadge grade={item.grade} size="sm" />
                          <span className="tabular-nums text-muted-foreground">
                            {item.count} jobs ({item.percentage}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-5 space-y-3">
                  <h2 className="text-base font-medium text-foreground">Active months</h2>
                  <div className="grid grid-cols-4 gap-2">
                    {report.activeMonths.map((m) => (
                      <div
                        key={m.month}
                        className={`rounded-[var(--pw-radius-sm)] border p-2 text-center ${
                          m.confirmedCount > 0
                            ? 'border-primary/40 bg-secondary'
                            : 'border-border bg-muted/40'
                        }`}
                      >
                        <span className="block text-xs font-medium text-foreground">{m.label}</span>
                        <span className="block text-xs tabular-nums text-muted-foreground">
                          {m.confirmedCount} jobs
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            <Card className="p-5 space-y-3">
              <div className="space-y-1">
                <h2 className="text-lg font-medium text-foreground">Tokenized clients</h2>
                <p className="text-xs text-muted-foreground">{messages.report.tokenNote}</p>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {report.clientTokens.map((ct) => (
                  <div
                    key={ct.token}
                    className="rounded-[var(--pw-radius-md)] border border-border bg-card p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-semibold text-foreground">
                        {ct.displayLabel}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {ct.phoneVerified ? 'phone verified' : 'bank linked'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {ct.confirmedCount} payments over {ct.monthsActive} month(s) ·{' '}
                      {formatNaira(ct.totalAmount)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-medium text-foreground">Job ledger</h2>
                <div className="flex gap-1.5 no-print">
                  {(['all', 1, 2, 3] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGradeFilter(g)}
                      className={`rounded-full px-3 py-1 text-xs font-medium cursor-pointer border ${
                        gradeFilter === g
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card text-muted-foreground'
                      }`}
                    >
                      {g === 'all' ? 'All grades' : `Grade ${g}`}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                {filteredJobs.map((job) => (
                  <JobLine key={job.id} job={job} mode="lender" />
                ))}
              </div>
            </div>

            <Card className="p-5 space-y-3 no-print">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-primary" aria-hidden="true" />
                  <h2 className="text-base font-medium text-foreground">
                    Signed Partner Snapshot ({getTierDetails(report.score).tier})
                  </h2>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    navigator.clipboard?.writeText(JSON.stringify(report.signedSnapshot, null, 2))
                    setCopiedJson(true)
                    setTimeout(() => setCopiedJson(false), 1500)
                  }}
                >
                  {copiedJson ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedJson ? 'Copied JSON' : 'Copy signed JSON'}</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {getTierDetails(report.score).unlocks}. Signed with Ed25519 for underwriting ingestion.
              </p>
              <pre className="overflow-x-auto rounded-[var(--pw-radius-md)] border border-border bg-muted/50 p-3.5 font-mono text-xs text-foreground">
                {JSON.stringify(report.signedSnapshot, null, 2)}
              </pre>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
