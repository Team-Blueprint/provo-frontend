import { useEffect, useState } from 'react'
import { AngleDown, Check, CheckCircle, Copy, Lock, Plus, ShieldCheck } from 'reicon-react'
import { api } from '@/api/client'
import type { DisputeReason, EscrowJob, JobStatus, Worker } from '@/api/types'
import { messages } from '@/messages/en'
import { AmountText } from '@/components/pw/AmountText'
import { DisputeDialog } from '@/components/pw/DisputeDialog'
import { EmployerNewJobModal } from '@/components/pw/EmployerNewJobModal'
import { EmployerShell } from '@/components/pw/EmployerShell'
import { GradeBadge } from '@/components/pw/GradeBadge'
import { StatusPill } from '@/components/pw/StatusPill'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const PAGE_SIZE = 3

export function ClientJobsPage() {
  const [jobs, setJobs] = useState<EscrowJob[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [filter, setFilter] = useState<'all' | JobStatus>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [disputeTarget, setDisputeTarget] = useState<{ jobId: string; dayNumber: number } | null>(
    null,
  )

  async function load() {
    const [dash, dir] = await Promise.all([api.getWorkerDashboard(), api.getAvailableWorkers()])
    setJobs(dash.jobs)
    setWorkers(dir)
  }

  useEffect(() => {
    load()
    const handler = () => load()
    window.addEventListener('proofwork:demo-updated', handler)
    return () => window.removeEventListener('proofwork:demo-updated', handler)
  }, [])

  useEffect(() => {
    setPage(1)
  }, [filter, search])

  function copyText(key: string, value: string) {
    navigator.clipboard?.writeText(value)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1600)
  }

  function isExpanded(job: EscrowJob) {
    if (job.id in expandedIds) return expandedIds[job.id]
    return job.status === 'IN_PROGRESS' || job.status === 'FUNDED' || job.status === 'AWAITING_FUNDING'
  }

  function toggleExpand(job: EscrowJob) {
    setExpandedIds((prev) => ({ ...prev, [job.id]: !isExpanded(job) }))
  }

  async function handleDispute(reason: DisputeReason) {
    if (!disputeTarget) return
    await api.disputeDay(disputeTarget.jobId, disputeTarget.dayNumber, reason, 'client')
    setNotice(`Day ${disputeTarget.dayNumber} disputed. Pay is held while admin reviews.`)
    setDisputeTarget(null)
    await load()
  }

  const pendingConfirmCount = jobs.flatMap((j) =>
    j.days.filter((d) => d.status === 'DONE_REPORTED'),
  ).length

  const filtered = jobs
    .filter((j) => (filter === 'all' ? true : j.status === filter))
    .filter((j) =>
      search.trim()
        ? j.workerName.toLowerCase().includes(search.toLowerCase()) ||
          j.trade.toLowerCase().includes(search.toLowerCase()) ||
          j.description.toLowerCase().includes(search.toLowerCase())
        : true,
    )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <EmployerShell
      searchQuery={search}
      onSearchChange={setSearch}
      pendingCount={pendingConfirmCount}
      jobCount={jobs.length}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">Jobs</h1>
          <p className="text-sm text-muted-foreground">
            All employer jobs, daily schedules, and supervisor links.
          </p>
        </div>
        <Button size="md" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>New job</span>
        </Button>
      </div>

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

      <div className="flex flex-wrap gap-1.5">
        {(['all', 'IN_PROGRESS', 'FUNDED', 'AWAITING_FUNDING', 'COMPLETED'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`rounded-full px-3 py-1 text-xs font-medium cursor-pointer border ${
              filter === tab
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'all' ? 'All' : messages.statuses[tab]}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {paginated.map((job) => {
          const expanded = isExpanded(job)
          const paidCount = job.days.filter(
            (d) => d.status === 'PAID' || d.status === 'CONFIRMED',
          ).length
          const supervisorUrl =
            typeof window !== 'undefined'
              ? `${window.location.origin}/supervisor?job=${job.id}`
              : `/supervisor?job=${job.id}`

          return (
            <Card key={job.id} className="overflow-hidden">
              <div className="p-5 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => toggleExpand(job)}
                  className="flex-1 min-w-[200px] text-left cursor-pointer space-y-1"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-foreground">
                      {job.workerName} · {job.trade}
                    </h2>
                    <StatusPill status={job.status} />
                  </div>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {job.description} · {job.area} · {paidCount} of {job.daysCount} days paid
                    {job.supervisorName ? ` · Supervisor: ${job.supervisorName}` : ''}
                  </p>
                </button>

                <div className="flex flex-wrap items-center gap-2.5">
                  {job.supervisorName && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => copyText(`sup-${job.id}`, supervisorUrl)}
                    >
                      {copiedKey === `sup-${job.id}` ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {copiedKey === `sup-${job.id}` ? 'Link copied' : 'Copy supervisor link'}
                      </span>
                    </Button>
                  )}
                  <AmountText amount={Math.round(job.totalKobo / 100)} size="lg" />
                  <button
                    type="button"
                    aria-label={expanded ? 'Collapse job' : 'Expand job'}
                    onClick={() => toggleExpand(job)}
                    className="rounded-full p-1 text-muted-foreground hover:bg-muted cursor-pointer"
                  >
                    <AngleDown
                      className={`h-4 w-4 transition-transform duration-150 ${
                        expanded ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>

              {expanded && (
                <div className="border-t border-border px-5 py-4 space-y-4">
                  {job.status === 'AWAITING_FUNDING' && (
                    <div className="rounded-[var(--pw-radius-md)] border border-[var(--pw-warning)]/30 bg-[var(--pw-warning-tint)] p-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-foreground">
                          Pay to one-time Paga NUBAN: {job.fundingAccountNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Waiting for bank transfer before Day 1 can begin.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => copyText(`nuban-${job.id}`, job.fundingAccountNumber)}
                        >
                          <span>{copiedKey === `nuban-${job.id}` ? 'Copied' : 'Copy NUBAN'}</span>
                        </Button>
                        <Button
                          size="sm"
                          onClick={async () => {
                            await api.simulateFundJob(job.id)
                            setNotice(`Funds locked for ${job.workerName}.`)
                            await load()
                          }}
                        >
                          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Simulate Paga payment</span>
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="divide-y divide-border">
                    {job.days.map((day) => (
                      <div
                        key={day.dayNumber}
                        className="py-2.5 first:pt-0 last:pb-0 flex flex-wrap items-center justify-between gap-2"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-semibold">Day {day.dayNumber}</span>
                          <AmountText amount={Math.round(day.amountKobo / 100)} size="sm" />
                          <StatusPill status={day.status} />
                          {day.outcome && <GradeBadge outcome={day.outcome} size="sm" />}
                        </div>

                        {day.status === 'DONE_REPORTED' && (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              onClick={async () => {
                                await api.confirmDay(job.id, day.dayNumber, 'client')
                                setNotice(`Day ${day.dayNumber} confirmed and paid out.`)
                                await load()
                              }}
                            >
                              <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Confirm &amp; release pay</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                setDisputeTarget({ jobId: job.id, dayNumber: day.dayNumber })
                              }
                            >
                              Dispute
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {job.receiptId && (
                    <div className="flex items-center gap-2 pt-2 border-t border-border text-xs text-[var(--pw-positive)]">
                      <ShieldCheck weight="Filled" className="h-4 w-4" aria-hidden="true" />
                      <span>Job completed · Receipt {job.receiptId} issued</span>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )
        })}

        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="text-xs text-muted-foreground tabular-nums">
              Page {currentPage} of {totalPages} · {filtered.length} jobs
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <EmployerNewJobModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={load}
        workers={workers}
      />

      <DisputeDialog
        open={Boolean(disputeTarget)}
        onClose={() => setDisputeTarget(null)}
        onSubmit={handleDispute}
      />
    </EmployerShell>
  )
}
