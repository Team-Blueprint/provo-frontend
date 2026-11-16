import { useEffect, useState } from 'react'
import { CheckCircle } from 'reicon-react'
import { api } from '@/api/client'
import type { EscrowJob, JobStatus } from '@/api/types'
import { messages } from '@/messages/en'
import { AmountText } from '@/components/pw/AmountText'
import { GradeBadge } from '@/components/pw/GradeBadge'
import { StatusPill } from '@/components/pw/StatusPill'
import { WorkerShell } from '@/components/pw/WorkerShell'
import { Button } from '@/components/ui/button'
import { Card, Skeleton } from '@/components/ui/card'

export function WorkerJobsPage() {
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState<EscrowJob[]>([])
  const [filter, setFilter] = useState<'all' | JobStatus>('all')
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true)
    const data = await api.getWorkerDashboard()
    setJobs(data.jobs)
    setLoading(false)
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

  return (
    <WorkerShell searchQuery={search} onSearchChange={setSearch} jobCount={jobs.length}>
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Job records</h1>
        <p className="text-sm text-muted-foreground">
          Day-by-day escrow schedule and payout outcomes.
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
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">{messages.worker.emptyJobs}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((job) => (
            <Card key={job.id} className="p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-foreground">
                      {job.clientName} · {job.trade}
                    </h2>
                    <StatusPill status={job.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {job.description} · {job.area}
                  </p>
                </div>
                <AmountText amount={Math.round(job.totalKobo / 100)} size="lg" />
              </div>

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

                    {day.status === 'PENDING' &&
                      (job.status === 'FUNDED' || job.status === 'IN_PROGRESS') && (
                        <Button
                          size="sm"
                          onClick={async () => {
                            await api.markDayDone(job.id, day.dayNumber)
                            load()
                          }}
                        >
                          <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Mark done</span>
                        </Button>
                      )}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </WorkerShell>
  )
}
