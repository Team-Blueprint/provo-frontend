import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle,
  Plus,
} from 'reicon-react'
import { api } from '@/api/client'
import type { DisputeReason, EscrowJob, TradeType, Worker } from '@/api/types'
import { formatNaira } from '@/lib/format'
import { AmountText } from '@/components/pw/AmountText'
import { DisputeDialog } from '@/components/pw/DisputeDialog'
import { EmployerNewJobModal } from '@/components/pw/EmployerNewJobModal'
import { EmployerShell } from '@/components/pw/EmployerShell'
import { EscrowCheckoutCard } from '@/components/pw/EscrowCheckoutCard'
import { JobTypePicker } from '@/components/pw/JobTypePicker'
import { StatusPill } from '@/components/pw/StatusPill'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

export function ClientPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const invitedWorkerId = searchParams.get('worker')
  const invitedAmount = searchParams.get('amount')
  const invitedDays = searchParams.get('days')
  const invitedDesc = searchParams.get('desc')

  const [jobs, setJobs] = useState<EscrowJob[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [checkoutJob, setCheckoutJob] = useState<EscrowJob | null>(null)
  const [partialPaidNaira, setPartialPaidNaira] = useState(0)
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [notice, setNotice] = useState('')

  const [clientName, setClientName] = useState(invitedWorkerId ? '' : 'Chief Etim')
  const [clientPhone, setClientPhone] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [phoneVerified, setPhoneVerified] = useState(!invitedWorkerId)
  const [authError, setAuthError] = useState('')

  const [trade, setTrade] = useState<TradeType>('Bricklaying')
  const [workerId, setWorkerId] = useState(invitedWorkerId || 'wrk_emem_01')
  const [description, setDescription] = useState(invitedDesc || '')
  const [area, setArea] = useState('Ewet Housing, Uyo')
  const [totalNaira, setTotalNaira] = useState(invitedAmount || '45000')
  const [daysCount, setDaysCount] = useState(invitedDays || '3')
  const [supervisorName, setSupervisorName] = useState('')
  const [disputeTarget, setDisputeTarget] = useState<{ jobId: string; dayNumber: number } | null>(
    null,
  )

  async function load() {
    const [clientJobs, dir] = await Promise.all([api.getClientJobs(), api.getAvailableWorkers()])
    setJobs(clientJobs)
    setWorkers(dir)
    if (invitedWorkerId) {
      const matched = dir.find((w) => w.id === invitedWorkerId)
      if (matched) {
        setWorkerId(matched.id)
        setTrade(matched.trade)
      }
    }
    if (checkoutJob) {
      const updated = clientJobs.find((j) => j.id === checkoutJob.id)
      if (updated) setCheckoutJob(updated)
    }
  }

  useEffect(() => {
    load()
    const handler = () => load()
    window.addEventListener('proofwork:demo-updated', handler)
    return () => window.removeEventListener('proofwork:demo-updated', handler)
  }, [])

  function handlePhoneChange(raw: string) {
    setClientPhone(raw.replace(/\D/g, '').replace(/^0+/, '').slice(0, 10))
  }

  function handleSendInlineOtp() {
    setAuthError('')
    if (!clientName.trim()) {
      setAuthError('Enter your full name first.')
      return
    }
    if (!/^[789][01]\d{8}$/.test(clientPhone)) {
      setAuthError('Enter a valid 10-digit Nigerian number (e.g. 8034419210).')
      return
    }
    setOtpSent(true)
  }

  function handleVerifyInlineOtp() {
    setAuthError('')
    if (otp.trim() !== '123456') {
      setAuthError('Invalid code. Enter 123456 for the demo.')
      return
    }
    setPhoneVerified(true)
  }

  async function handleCreateJob(e: React.FormEvent) {
    e.preventDefault()
    setAuthError('')
    if (!clientName.trim()) {
      setAuthError('Employer name is required.')
      return
    }
    if (invitedWorkerId && !phoneVerified) {
      setAuthError('Verify your phone number with the 6-digit OTP to continue.')
      return
    }
    const total = Number(totalNaira)
    const days = Math.max(1, Number(daysCount))
    if (!total || !description.trim()) return

    setBusyKey('create')
    try {
      const created = await api.createAndRequestFunding({
        clientName: clientName.trim(),
        workerId,
        trade,
        description: description.trim(),
        area: area.trim() || 'Uyo',
        totalNaira: total,
        daysCount: days,
        supervisorName: supervisorName.trim() || undefined,
      })
      setCheckoutJob(created)
      setPartialPaidNaira(0)
      setDescription('')
      await load()
    } finally {
      setBusyKey(null)
    }
  }

  async function handleDispute(reason: DisputeReason) {
    if (!disputeTarget) return
    await api.disputeDay(disputeTarget.jobId, disputeTarget.dayNumber, reason, 'client')
    setNotice(`Day ${disputeTarget.dayNumber} disputed. Pay is held while admin reviews.`)
    setDisputeTarget(null)
    await load()
  }

  const invitedWorker = workers.find((w) => w.id === workerId)
  const isSharedCheckout = Boolean(invitedWorkerId)

  const pendingConfirmations = jobs.flatMap((job) =>
    job.days
      .filter((day) => day.status === 'DONE_REPORTED')
      .map((day) => ({ job, day })),
  )

  const filteredJobs = jobs.filter((j) =>
    search.trim()
      ? j.workerName.toLowerCase().includes(search.toLowerCase()) ||
        j.trade.toLowerCase().includes(search.toLowerCase()) ||
        j.description.toLowerCase().includes(search.toLowerCase())
      : true,
  )

  function renderTransferStep(job: EscrowJob) {
    const total = Math.round(job.totalKobo / 100)

    return (
      <EscrowCheckoutCard
        job={job}
        partialPaidNaira={partialPaidNaira}
        isSubmitting={busyKey === `fund-${job.id}`}
        onSimulateFund={async () => {
          setBusyKey(`fund-${job.id}`)
          try {
            await api.simulateFundJob(job.id)
            setPartialPaidNaira(total)
            await load()
          } finally {
            setBusyKey(null)
          }
        }}
        onSimulatePartial={(half) => setPartialPaidNaira(half)}
        onDone={() => {
          setCheckoutJob(null)
          if (invitedWorkerId) setSearchParams({})
        }}
        doneLabel="Open employer dashboard"
      />
    )
  }

  function renderJobForm() {
    return (
      <Card className="p-6 space-y-5">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">Set up protected job pay</h2>
          <p className="text-xs text-muted-foreground">
            Daily pay is split automatically, with any remainder on the last day.
          </p>
        </div>

        <form onSubmit={handleCreateJob} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="cli-name" className="text-sm font-medium">
                Your full name
              </label>
              <Input
                id="cli-name"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Mrs. Okon"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cli-worker" className="text-sm font-medium">
                Artisan
              </label>
              <Select
                id="cli-worker"
                value={workerId}
                onValueChange={(id) => {
                  setWorkerId(id)
                  const w = workers.find((item) => item.id === id)
                  if (w) setTrade(w.trade)
                }}
                options={workers.map((w) => ({
                  value: w.id,
                  label: `${w.name} · ${w.customTrade || w.trade} (${w.area})`,
                }))}
              />
            </div>
          </div>

          {isSharedCheckout && !phoneVerified && (
            <div className="rounded-[var(--pw-radius-md)] border border-border bg-muted/35 p-4 space-y-3">
              <p className="text-xs font-medium text-foreground">
                Verify your phone number to receive daily confirmation alerts
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="flex flex-1 items-center rounded-[8px] border border-input bg-card px-3 focus-within:border-primary">
                  <span className="font-mono text-sm text-muted-foreground pr-2.5 border-r border-border">
                    +234
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={clientPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="8034419210"
                    className="w-full bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0"
                  />
                </div>
                {!otpSent && (
                  <Button type="button" size="md" variant="secondary" onClick={handleSendInlineOtp}>
                    Send OTP
                  </Button>
                )}
              </div>

              {otpSent && (
                <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                  <Input
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP (123456)"
                    className="sm:max-w-xs"
                  />
                  <Button type="button" size="md" onClick={handleVerifyInlineOtp}>
                    Verify phone
                  </Button>
                </div>
              )}
            </div>
          )}

          {isSharedCheckout && phoneVerified && (
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--pw-positive)]">
              <CheckCircle className="h-4 w-4" aria-hidden="true" />
              <span>Phone verified (+234 {clientPhone})</span>
            </div>
          )}

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
                placeholder="e.g. Perimeter block wall & plastering"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="cli-area" className="text-sm font-medium">
                Site area
              </label>
              <Input id="cli-area" value={area} onChange={(e) => setArea(e.target.value)} />
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
                min={1000}
                required
                value={totalNaira}
                onChange={(e) => setTotalNaira(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="cli-days" className="text-sm font-medium">
                Working days
              </label>
              <Input
                id="cli-days"
                type="number"
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
                placeholder="Foreman Bassey"
              />
            </div>
          </div>

          {authError && <p className="text-xs font-medium text-[var(--pw-critical)]">{authError}</p>}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={busyKey === 'create'}>
              <span>{busyKey === 'create' ? 'Preparing NUBAN...' : 'Continue to payment'}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </form>
      </Card>
    )
  }

  if (isSharedCheckout) {
    return (
      <div className="min-h-screen bg-background text-foreground pb-20">
        <header className="sticky top-0 z-20 border-b border-border bg-card">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 sm:px-6 py-3.5">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              <span
                className="inline-block h-2.5 w-2.5 rounded-[3px] bg-[var(--pw-brick)]"
                aria-hidden="true"
              />
              <span>Provo</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setCheckoutJob(null)
                setSearchParams({})
              }}
              className="text-xs font-medium text-primary hover:underline cursor-pointer"
            >
              Employer dashboard →
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
              {invitedWorker ? `Lock job pay for ${invitedWorker.name}` : 'Lock job pay'}
            </h1>
            <p className="text-sm text-muted-foreground">
              Pay is held safely through Paga and released day by day as work is confirmed.
            </p>
          </div>

          {checkoutJob ? renderTransferStep(checkoutJob) : renderJobForm()}
        </main>
      </div>
    )
  }

  return (
    <EmployerShell
      searchQuery={search}
      onSearchChange={setSearch}
      pendingCount={pendingConfirmations.length}
      jobCount={jobs.length}
      employerName={clientName || 'Chief Etim'}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">Overview</h1>
          <p className="text-sm text-muted-foreground">
            Confirm completed work days to release pay, or lock pay for a new job.
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

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Waiting for your confirmation ({pendingConfirmations.length})
          </h2>
          <Link to="/supervisor" className="text-xs font-medium text-primary hover:underline">
            Supervisor view →
          </Link>
        </div>

        {pendingConfirmations.length === 0 ? (
          <Card className="p-5 text-xs text-muted-foreground">
            No days are waiting right now. When an artisan marks a day done, it appears here for
            one-tap confirmation.
          </Card>
        ) : (
          <div className="space-y-3">
            {pendingConfirmations.map(({ job, day }) => {
              const key = `${job.id}-${day.dayNumber}`
              return (
                <Card
                  key={key}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-[var(--pw-warning)]/35"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold text-foreground">
                        {job.workerName} · {job.trade}
                      </span>
                      <StatusPill status={day.status} />
                    </div>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      Day {day.dayNumber} of {job.daysCount} ·{' '}
                      {formatNaira(Math.round(day.amountKobo / 100))} · {job.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      disabled={busyKey === key}
                      onClick={async () => {
                        setBusyKey(key)
                        try {
                          await api.confirmDay(job.id, day.dayNumber, 'client')
                          setNotice(
                            `Day ${day.dayNumber} confirmed. ${formatNaira(Math.round(day.amountKobo / 100))} released to ${job.workerName}.`,
                          )
                          await load()
                        } finally {
                          setBusyKey(null)
                        }
                      }}
                    >
                      <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{busyKey === key ? 'Releasing...' : 'Confirm & release pay'}</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setDisputeTarget({ jobId: job.id, dayNumber: day.dayNumber })}
                    >
                      Dispute
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Recent active jobs</h2>
          <Link to="/client/jobs" className="text-xs font-medium text-primary hover:underline">
            View all jobs ({jobs.length}) →
          </Link>
        </div>

        <div className="space-y-3">
          {filteredJobs.slice(0, 2).map((job) => {
            const paidCount = job.days.filter(
              (d) => d.status === 'PAID' || d.status === 'CONFIRMED',
            ).length
            return (
              <Card
                key={job.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {job.workerName} · {job.trade}
                    </span>
                    <StatusPill status={job.status} />
                  </div>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {job.description} · {job.area} · {paidCount} of {job.daysCount} days paid
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <AmountText amount={Math.round(job.totalKobo / 100)} size="md" />
                  <Link to="/client/jobs">
                    <Button size="sm" variant="secondary">
                      Manage
                    </Button>
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      <EmployerNewJobModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={load}
        workers={workers}
        defaultEmployerName={clientName || 'Chief Etim'}
      />

      <DisputeDialog
        open={Boolean(disputeTarget)}
        onClose={() => setDisputeTarget(null)}
        onSubmit={handleDispute}
      />
    </EmployerShell>
  )
}
