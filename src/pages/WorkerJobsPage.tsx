import { useEffect, useState } from 'react'
import { AngleDown, Briefcase, CheckCircle } from 'reicon-react'
import { api } from '@/api/client'
import type { EscrowJob, JobStatus } from '@/api/types'
import { messages } from '@/messages/en'
import { AmountText } from '@/components/pw/AmountText'
import { EmptyState } from '@/components/pw/EmptyState'
import { GradeBadge } from '@/components/pw/GradeBadge'
import { StatusPill } from '@/components/pw/StatusPill'
import { WorkerShell } from '@/components/pw/WorkerShell'
import { Button } from '@/components/ui/button'
import { Card, Skeleton } from '@/components/ui/card'
import { toast } from '@/components/ui/toast'

const PAGE_SIZE = 3

export function WorkerJobsPage() {
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState<EscrowJob[]>([])
  const [filter, setFilter] = useState<'all' | JobStatus>('all')
  const [search, setSearch] = useState('')
  const [markingKey, setMarkingKey] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({})
  const [page, setPage] = useState(1)

  async function load() {
    setLoading(true)
    try {
      const data = await api.getWorkerDashboard()
      setJobs(data.jobs)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not load job records.')
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

  const filtered = jobs
    .filter((j) => (filter === 'all' ? true : j.status === filter))
    .filter((j) =>
      search.trim()
        ? j.clientName.toLowerCase().includes(search.toLowerCase()) ||
          j.trade.toLowerCase().includes(search.toLowerCase()) ||
          j.description.toLowerCase().includes(search.toLowerCase())
        : true,
    )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [filter, search])

  function isJobExpanded(job: EscrowJob) {
    if (job.id in expandedIds) return expandedIds[job.id]
    return job.status === 'IN_PROGRESS' || job.status === 'FUNDED'
  }

  function toggleJob(job: EscrowJob) {
    setExpandedIds((prev) => ({ ...prev, [job.id]: !isJobExpanded(job) }))
  }

  return (
    <WorkerShell searchQuery={search} onSearchChange={setSearch} jobCount={jobs.length}>
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Job records</h1>
        <p className="text-sm text-muted-foreground">
          Day-by-day work schedule and payout outcomes.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(['all', 'IN_PROGRESS', 'FUNDED', 'COMPLETED', 'AWAITING_FUNDING'] as const).map((tab) => (
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

      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="p-5 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-3.5 w-60 max-w-full" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
              </div>
              {i === 0 && (
                <div className="border-t border-border px-5 py-4 space-y-3">
                  {[0, 1, 2].map((d) => (
                    <div key={d} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                      {d === 0 && <Skeleton className="h-8 w-24 rounded-full" />}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={
            filter !== 'all' || search.trim() !== ''
              ? 'No matching job records'
              : 'No job records yet'
          }
          description={
            filter !== 'all' || search.trim() !== ''
              ? 'Try clearing your status filter or search term to see all jobs.'
              : messages.worker.emptyJobs
          }
          action={
            (filter !== 'all' || search.trim() !== '') && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setFilter('all')
                  setSearch('')
                }}
              >
                Clear filters
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {paginated.map((job) => {
            const expanded = isJobExpanded(job)
            return (
              <Card key={job.id} className="overflow-hidden">
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => toggleJob(job)}
                  className="w-full p-5 flex flex-wrap items-center justify-between gap-3 text-left hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-foreground">
                        {job.clientName} · {job.trade}
                      </h2>
                      <StatusPill status={job.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {job.description} · {job.area} · {job.daysCount} days
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <AmountText amount={Math.round(job.totalKobo / 100)} size="lg" />
                    <AngleDown
                      className={`h-4 w-4 text-muted-foreground transition-transform duration-150 ${
                        expanded ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </div>
                </button>

                {expanded && (
                  <div className="border-t border-border px-5 py-4 divide-y divide-border">
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

                        {day.status === 'PENDING' &&
                          (job.status === 'FUNDED' || job.status === 'IN_PROGRESS') && (
                            <Button
                              size="sm"
                              disabled={markingKey === `${job.id}-${day.dayNumber}`}
                              onClick={async () => {
                                const key = `${job.id}-${day.dayNumber}`
                                setMarkingKey(key)
                                try {
                                  await api.markDayDone(job.id, day.dayNumber)
                                  toast.success(
                                    `Day ${day.dayNumber} marked Done. 24h confirmation window started.`,
                                    `Day ${day.dayNumber} reported`,
                                  )
                                  await load()
                                } catch (err) {
                                  toast.error(
                                    err instanceof Error
                                      ? err.message
                                      : 'Could not mark day as done.',
                                  )
                                } finally {
                                  setMarkingKey(null)
                                }
                              }}
                            >
                              <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>
                                {markingKey === `${job.id}-${day.dayNumber}` ? 'Updating...' : 'Mark done'}
                              </span>
                            </Button>
                          )}
                      </div>
                    ))}
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
      )}
    </WorkerShell>
  )
}
