import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, UserTick } from 'reicon-react'
import { api } from '@/api/client'
import type { DisputeReason, EscrowJob } from '@/api/types'
import { AmountText } from '@/components/pw/AmountText'
import { DisputeDialog } from '@/components/pw/DisputeDialog'
import { GradeBadge } from '@/components/pw/GradeBadge'
import { StatusPill } from '@/components/pw/StatusPill'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function SupervisorPage() {
  const [jobs, setJobs] = useState<EscrowJob[]>([])
  const [disputeTarget, setDisputeTarget] = useState<{ jobId: string; dayNumber: number } | null>(
    null,
  )

  async function load() {
    const dash = await api.getWorkerDashboard()
    setJobs(dash.jobs.filter((j) => Boolean(j.supervisorName)))
  }

  useEffect(() => {
    load()
    const handler = () => load()
    window.addEventListener('proofwork:demo-updated', handler)
    return () => window.removeEventListener('proofwork:demo-updated', handler)
  }, [])

  async function handleDispute(reason: DisputeReason) {
    if (!disputeTarget) return
    await api.disputeDay(disputeTarget.jobId, disputeTarget.dayNumber, reason, 'supervisor')
    setDisputeTarget(null)
    await load()
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-8 py-3.5">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Proofwork · Supervisor</span>
          </Link>
          <Link to="/client">
            <Button size="sm" variant="secondary">
              Client view
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-8 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-[var(--pw-info-tint)] p-2.5 text-[var(--pw-info)]">
            <UserTick className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Foreman Bassey</h1>
            <p className="text-sm text-muted-foreground">
              Confirm or dispute daily site work on behalf of the client.
            </p>
          </div>
        </div>

        {jobs.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No jobs assigned to you as supervisor.
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} className="p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">
                      {job.workerName} · {job.trade}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Client: {job.clientName} · {job.description}
                    </p>
                  </div>
                  <StatusPill status={job.status} />
                </div>

                <div className="divide-y divide-border">
                  {job.days.map((day) => (
                    <div
                      key={day.dayNumber}
                      className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-xs font-semibold">Day {day.dayNumber}</span>
                        <AmountText amount={Math.round(day.amountKobo / 100)} size="sm" />
                        <StatusPill status={day.status} />
                        {day.outcome && <GradeBadge outcome={day.outcome} size="sm" />}
                      </div>

                      {day.status === 'DONE_REPORTED' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={async () => {
                              await api.confirmDay(job.id, day.dayNumber, 'supervisor')
                              load()
                            }}
                          >
                            <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Confirm day</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
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
              </Card>
            ))}
          </div>
        )}
      </main>

      <DisputeDialog
        open={Boolean(disputeTarget)}
        onClose={() => setDisputeTarget(null)}
        onSubmit={handleDispute}
      />
    </div>
  )
}
