import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Lock, Plus, ShieldCheck } from 'reicon-react'
import { api } from '@/api/client'
import type { DisputeReason, EscrowJob, TradeType, Worker } from '@/api/types'
import { formatNaira } from '@/lib/format'
import { AmountText } from '@/components/pw/AmountText'
import { DisputeDialog } from '@/components/pw/DisputeDialog'
import { GradeBadge } from '@/components/pw/GradeBadge'
import { JobTypePicker } from '@/components/pw/JobTypePicker'
import { StatusPill } from '@/components/pw/StatusPill'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

export function ClientPage() {
  const [jobs, setJobs] = useState<EscrowJob[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [createOpen, setCreateOpen] = useState(false)

  const [clientName, setClientName] = useState('Chief Etim')
  const [trade, setTrade] = useState<TradeType>('Bricklaying')
  const [workerId, setWorkerId] = useState('wrk_emem_01')
  const [description, setDescription] = useState('')
  const [area, setArea] = useState('Ewet Housing, Uyo')
  const [totalNaira, setTotalNaira] = useState('45000')
  const [daysCount, setDaysCount] = useState('3')
  const [supervisorName, setSupervisorName] = useState('')
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

  async function handleCreateJob(e: React.FormEvent) {
    e.preventDefault()
    const total = Number(totalNaira)
    const days = Math.max(1, Number(daysCount))
    if (!total || !description.trim()) return
    await api.createAndRequestFunding({
      clientName: clientName.trim() || 'Client',
      workerId,
      trade,
      description: description.trim(),
      area: area.trim() || 'Uyo',
      totalNaira: total,
      daysCount: days,
      supervisorName: supervisorName.trim() || undefined,
    })
    setCreateOpen(false)
    setDescription('')
    await load()
  }

  async function handleDispute(reason: DisputeReason) {
    if (!disputeTarget) return
    await api.disputeDay(disputeTarget.jobId, disputeTarget.dayNumber, reason, 'client')
    setDisputeTarget(null)
    await load()
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-8 py-3.5">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Proofwork · Client</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/supervisor">
              <Button size="sm" variant="secondary">
                Supervisor view
              </Button>
            </Link>
            <Button size="sm" onClick={() => setCreateOpen((v) => !v)}>
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>New escrow job</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">Client Escrow Jobs</h1>
          <p className="text-sm text-muted-foreground">
            Lock funds before work starts, then confirm each day as your artisan reports done.
          </p>
        </div>

        {createOpen && (
          <Card className="p-6 space-y-5">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">Create &amp; lock a job</h2>
              <p className="text-xs text-muted-foreground">
                Daily pay is split automatically in kobo, with any remainder on the last day.
              </p>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="cli-name" className="text-sm font-medium">
                    Your name
                  </label>
                  <Input
                    id="cli-name"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="cli-worker" className="text-sm font-medium">
                    Select artisan (directory)
                  </label>
                  <Select
                    id="cli-worker"
                    value={workerId}
                    onValueChange={setWorkerId}
                    options={workers.map((w) => ({
                      value: w.id,
                      label: `${w.name} · ${w.trade} (${w.area})`,
                    }))}
                  />
                </div>
              </div>

              <JobTypePicker value={trade} onChange={setTrade} label="Trade" />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="cli-desc" className="text-sm font-medium">
                    Job description
                  </label>
                  <Input
                    id="cli-desc"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Fence wall repair"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="cli-area" className="text-sm font-medium">
                    Site area
                  </label>
                  <Input
                    id="cli-area"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label htmlFor="cli-total" className="text-sm font-medium">
                    Total pay (₦)
                  </label>
                  <Input
                    id="cli-total"
                    type="number"
                    inputMode="numeric"
                    min={1000}
                    required
                    value={totalNaira}
                    onChange={(e) => setTotalNaira(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="cli-days" className="text-sm font-medium">
                    Number of days
                  </label>
                  <Input
                    id="cli-days"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={30}
                    required
                    value={daysCount}
                    onChange={(e) => setDaysCount(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="cli-sup" className="text-sm font-medium">
                    Supervisor (optional)
                  </label>
                  <Input
                    id="cli-sup"
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                    placeholder="e.g. Foreman Bassey"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create &amp; get Paga lock account</Button>
              </div>
            </form>
          </Card>
        )}

        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-foreground">
                      {job.workerName} · {job.trade}
                    </h2>
                    <StatusPill status={job.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {job.description} · {job.area}
                    {job.supervisorName ? ` · Supervisor: ${job.supervisorName}` : ''}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <AmountText amount={Math.round(job.totalKobo / 100)} size="lg" />
                  <p className="text-xs text-muted-foreground">{job.daysCount} days</p>
                </div>
              </div>

              {job.status === 'AWAITING_FUNDING' && (
                <div className="rounded-[var(--pw-radius-sm)] border border-[var(--pw-warning)]/40 bg-[var(--pw-warning-tint)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-foreground">
                      Lock {formatNaira(Math.round(job.totalKobo / 100))} to start work
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Transfer to one-time Paga NUBAN{' '}
                      <span className="font-mono font-semibold text-foreground">
                        {job.fundingAccountNumber}
                      </span>
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={async () => {
                      await api.simulateFundJob(job.id)
                      load()
                    }}
                  >
                    <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Simulate Paga funding</span>
                  </Button>
                </div>
              )}

              <div className="divide-y divide-border">
                {job.days.map((day) => (
                  <div
                    key={day.dayNumber}
                    className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs font-semibold text-foreground">
                        Day {day.dayNumber}
                      </span>
                      <AmountText amount={Math.round(day.amountKobo / 100)} size="sm" />
                      <StatusPill status={day.status} />
                      {day.outcome && <GradeBadge outcome={day.outcome} size="sm" />}
                    </div>

                    {day.status === 'DONE_REPORTED' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={async () => {
                            await api.confirmDay(job.id, day.dayNumber, 'client')
                            load()
                          }}
                        >
                          <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Confirm &amp; release</span>
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

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
          <span>Every confirmed or auto-released day is recorded in the worker’s history.</span>
        </p>
      </main>

      <DisputeDialog
        open={Boolean(disputeTarget)}
        onClose={() => setDisputeTarget(null)}
        onSubmit={handleDispute}
      />
    </div>
  )
}
