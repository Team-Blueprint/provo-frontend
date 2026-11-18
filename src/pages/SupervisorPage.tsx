import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  AngleDown,
  Check,
  CheckCircle,
  CloseCircle,
  Copy,
  Phone,
  Plus,
  UserTick,
} from 'reicon-react'
import { api } from '@/api/client'
import type { DisputeReason, EscrowJob } from '@/api/types'
import { AmountText } from '@/components/pw/AmountText'
import { DisputeDialog } from '@/components/pw/DisputeDialog'
import { EmployerShell } from '@/components/pw/EmployerShell'
import { EmptyState } from '@/components/pw/EmptyState'
import { GradeBadge } from '@/components/pw/GradeBadge'
import { StatusPill } from '@/components/pw/StatusPill'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

export function SupervisorPage() {
  const [searchParams] = useSearchParams()
  const targetJobId = searchParams.get('job')
  const [allJobs, setAllJobs] = useState<EscrowJob[]>([])
  const [search, setSearch] = useState('')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({})

  function isExpanded(jobId: string, idx: number) {
    if (jobId in expandedIds) return expandedIds[jobId]
    return targetJobId ? jobId === targetJobId : idx === 0
  }

  function toggleExpand(jobId: string, idx: number) {
    setExpandedIds((prev) => ({ ...prev, [jobId]: !isExpanded(jobId, idx) }))
  }

  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState('')
  const [supervisorName, setSupervisorName] = useState('')
  const [supervisorPhone, setSupervisorPhone] = useState('')
  const [assignError, setAssignError] = useState('')
  const [saving, setSaving] = useState(false)

  const [disputeTarget, setDisputeTarget] = useState<{ jobId: string; dayNumber: number } | null>(
    null,
  )

  async function load() {
    const clientJobs = await api.getClientJobs()
    const list = [...clientJobs]
    if (targetJobId) {
      list.sort((a, b) => (a.id === targetJobId ? -1 : b.id === targetJobId ? 1 : 0))
    }
    setAllJobs(list)
    if (!selectedJobId && list.length > 0) {
      setSelectedJobId(list[0].id)
    }
  }

  useEffect(() => {
    load()
    const handler = () => load()
    window.addEventListener('proofwork:demo-updated', handler)
    return () => window.removeEventListener('proofwork:demo-updated', handler)
  }, [])

  function copyText(key: string, value: string) {
    navigator.clipboard?.writeText(value)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1600)
  }

  function getUniqueSupervisorUrl(job: EscrowJob) {
    const token = job.supervisorToken || `sup_${job.id}`
    const path = `/supervisor/verify?job=${job.id}&token=${encodeURIComponent(token)}`
    return typeof window !== 'undefined' ? `${window.location.origin}${path}` : path
  }

  function openAssignForJob(job?: EscrowJob) {
    const target = job ?? allJobs[0]
    if (target) {
      setSelectedJobId(target.id)
      setSupervisorName(target.supervisorName ?? '')
      const rawDigits = (target.supervisorPhone ?? '')
        .replace(/\D/g, '')
        .replace(/^234/, '')
        .replace(/^0+/, '')
        .slice(0, 10)
      setSupervisorPhone(rawDigits)
    } else {
      setSupervisorName('')
      setSupervisorPhone('')
    }
    setAssignError('')
    setAssignModalOpen(true)
  }

  async function handleAssignSubmit(e: React.FormEvent) {
    e.preventDefault()
    setAssignError('')
    if (!selectedJobId) {
      setAssignError('Select a job.')
      return
    }
    if (!supervisorName.trim()) {
      setAssignError('Enter the supervisor’s full name.')
      return
    }
    if (!/^[789][01]\d{8}$/.test(supervisorPhone)) {
      setAssignError('Enter a valid 10-digit Nigerian phone number (e.g. 8051120944).')
      return
    }

    setSaving(true)
    try {
      const formattedPhone = `+234 ${supervisorPhone}`
      await api.assignSupervisor({
        jobId: selectedJobId,
        supervisorName: supervisorName.trim(),
        supervisorPhone: formattedPhone,
      })
      await load()
      setAssignModalOpen(false)
      setNotice(
        `Assigned ${supervisorName.trim()} (${formattedPhone}). Share their unique supervisor link below.`,
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDispute(reason: DisputeReason) {
    if (!disputeTarget) return
    await api.disputeDay(disputeTarget.jobId, disputeTarget.dayNumber, reason, 'supervisor')
    setDisputeTarget(null)
    await load()
  }

  const pendingCount = allJobs
    .flatMap((j) => j.days)
    .filter((d) => d.status === 'DONE_REPORTED').length

  const filteredJobs = allJobs.filter((j) =>
    search.trim()
      ? j.workerName.toLowerCase().includes(search.toLowerCase()) ||
        j.trade.toLowerCase().includes(search.toLowerCase()) ||
        j.description.toLowerCase().includes(search.toLowerCase()) ||
        (j.supervisorName ?? '').toLowerCase().includes(search.toLowerCase())
      : true,
  )

  const supervisedJobs = filteredJobs.filter((j) => Boolean(j.supervisorName))
  const unassignedJobs = filteredJobs.filter((j) => !j.supervisorName)

  return (
    <EmployerShell
      searchQuery={search}
      onSearchChange={setSearch}
      pendingCount={pendingCount}
      jobCount={allJobs.length}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">Supervisors</h1>
          <p className="text-sm text-muted-foreground">
            Supervisors assigned per job and their unique daily reporting links.
          </p>
        </div>
        <Button size="md" onClick={() => openAssignForJob()}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add supervisor to job</span>
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
        <h2 className="text-base font-semibold text-foreground">
          Assigned supervisors ({supervisedJobs.length})
        </h2>

        {supervisedJobs.length === 0 ? (
          <EmptyState
            icon={UserTick}
            compact
            title="No supervisors assigned yet"
            description="Add a supervisor’s name and phone number to any job to generate their unique daily reporting link."
            action={
              <Button size="sm" onClick={() => openAssignForJob()}>
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Assign a supervisor</span>
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {supervisedJobs.map((job, idx) => {
              const uniqueUrl = getUniqueSupervisorUrl(job)
              const expanded = isExpanded(job.id, idx)
              return (
                <Card key={job.id} className="overflow-hidden">
                  <div className="p-5 flex flex-wrap items-start justify-between gap-3">
                    <button
                      type="button"
                      aria-expanded={expanded}
                      onClick={() => toggleExpand(job.id, idx)}
                      className="flex flex-1 min-w-[200px] items-start gap-3 text-left cursor-pointer"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                        <UserTick weight="Filled" className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-foreground">
                            {job.supervisorName}
                          </h3>
                          <span className="font-mono text-xs text-muted-foreground">
                            {job.supervisorPhone || '+234 802 111 9021'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Assigned to:{' '}
                          <span className="font-medium text-foreground">
                            {job.workerName} · {job.trade}
                          </span>{' '}
                          ({job.description})
                        </p>
                      </div>
                    </button>

                    <div className="flex items-center gap-2">
                      <StatusPill status={job.status} />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openAssignForJob(job)}
                      >
                        Edit
                      </Button>
                      <button
                        type="button"
                        aria-label={expanded ? 'Collapse supervisor' : 'Expand supervisor'}
                        onClick={() => toggleExpand(job.id, idx)}
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
                    <div className="border-t border-border p-5 space-y-4">
                      <div className="rounded-[12px] border border-primary/20 bg-primary/5 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="min-w-0 space-y-0.5">
                          <p className="text-xs font-semibold text-foreground">
                            Unique supervisor reporting link
                          </p>
                          <p className="font-mono text-xs text-primary truncate">{uniqueUrl}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => copyText(`sup-link-${job.id}`, uniqueUrl)}
                        >
                          {copiedKey === `sup-link-${job.id}` ? (
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                          <span>
                            {copiedKey === `sup-link-${job.id}` ? 'Link copied' : 'Copy unique link'}
                          </span>
                        </Button>
                      </div>

                      <div className="divide-y divide-border">
                        {job.days.map((day) => (
                          <div
                            key={day.dayNumber}
                            className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span className="font-mono text-xs font-semibold">
                                Day {day.dayNumber}
                              </span>
                              <AmountText amount={Math.round(day.amountKobo / 100)} size="sm" />
                              <StatusPill status={day.status} />
                              {day.outcome && <GradeBadge outcome={day.outcome} size="sm" />}
                              {day.proofPhoto && (
                                <a
                                  href={day.proofPhoto}
                                  target="_blank"
                                  rel="noreferrer"
                                  title={`View Day ${day.dayNumber} proof photo`}
                                  className="inline-flex items-center gap-1.5 rounded-[6px] border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-foreground hover:border-primary"
                                >
                                  <img
                                    src={day.proofPhoto}
                                    alt={`Day ${day.dayNumber} proof`}
                                    className="h-5 w-7 rounded-[3px] object-cover"
                                  />
                                  <span>Proof photo</span>
                                </a>
                              )}
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
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {unassignedJobs.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">
            Jobs without a supervisor ({unassignedJobs.length})
          </h2>
          <div className="space-y-2.5">
            {unassignedJobs.map((job) => (
              <Card
                key={job.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {job.workerName} · {job.trade}
                    </span>
                    <StatusPill status={job.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {job.description} · {job.area}
                  </p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => openAssignForJob(job)}>
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Add supervisor</span>
                </Button>
              </Card>
            ))}
          </div>
        </section>
      )}

      {assignModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="assign-supervisor-title"
          onClick={() => setAssignModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 backdrop-blur-xs p-4"
        >
          <Card
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md p-6 space-y-5 shadow-[var(--pw-shadow-sheet)]"
          >
            <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-primary">
                  Site Supervisor
                </p>
                <h2 id="assign-supervisor-title" className="text-lg font-semibold text-foreground">
                  Assign supervisor to job
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                aria-label="Close modal"
                className="rounded-full p-1 text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <CloseCircle className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="sup-job" className="text-sm font-medium text-foreground">
                  Select job
                </label>
                <Select
                  id="sup-job"
                  value={selectedJobId}
                  onValueChange={(id) => {
                    setSelectedJobId(id)
                    const found = allJobs.find((j) => j.id === id)
                    if (found?.supervisorName) setSupervisorName(found.supervisorName)
                    if (found?.supervisorPhone) {
                      setSupervisorPhone(
                        found.supervisorPhone
                          .replace(/\D/g, '')
                          .replace(/^234/, '')
                          .replace(/^0+/, '')
                          .slice(0, 10),
                      )
                    }
                  }}
                  options={allJobs.map((j) => ({
                    value: j.id,
                    label: `${j.workerName} · ${j.trade} (${j.description})`,
                  }))}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="sup-name" className="text-sm font-medium text-foreground">
                  Supervisor full name
                </label>
                <Input
                  id="sup-name"
                  required
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  placeholder="e.g. Foreman Bassey"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="sup-phone" className="text-sm font-medium text-foreground">
                  Supervisor phone number
                </label>
                <div className="flex items-center rounded-[var(--pw-radius-sm)] border border-input bg-card px-3 focus-within:border-primary">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                  <span className="font-mono text-sm text-muted-foreground pl-2 pr-2.5 border-r border-border">
                    +234
                  </span>
                  <input
                    id="sup-phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    required
                    value={supervisorPhone}
                    onChange={(e) =>
                      setSupervisorPhone(
                        e.target.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 10),
                      )
                    }
                    placeholder="8051120944"
                    className="w-full bg-transparent px-2.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  A unique supervisor link will be generated for this job.
                </p>
              </div>

              {assignError && (
                <p className="text-xs font-medium text-[var(--pw-critical)]">{assignError}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setAssignModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save & generate link'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <DisputeDialog
        open={Boolean(disputeTarget)}
        onClose={() => setDisputeTarget(null)}
        onSubmit={handleDispute}
      />
    </EmployerShell>
  )
}
