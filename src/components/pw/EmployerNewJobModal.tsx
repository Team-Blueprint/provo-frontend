import { useEffect, useRef, useState } from 'react'
import {
  AngleDown,
  ArrowRight,
  Check,
  CheckCircle,
  CloseCircle,
  Copy,
  Lock,
  Phone,
  UserTick,
} from 'reicon-react'
import { api } from '@/api/client'
import { SEED_WORKERS_DIRECTORY } from '@/api/mockData'
import { TRADES, type EscrowJob, type TradeType, type Worker } from '@/api/types'
import { formatNaira } from '@/lib/format'
import { StatusPill } from '@/components/pw/StatusPill'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

interface EmployerNewJobModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => Promise<void>
  workers: Worker[]
  defaultEmployerName?: string
}

export function EmployerNewJobModal({
  open,
  onClose,
  onCreated,
  workers,
  defaultEmployerName = 'Chief Etim',
}: EmployerNewJobModalProps) {
  const allWorkers = workers.length > 0 ? workers : SEED_WORKERS_DIRECTORY

  const [trade, setTrade] = useState<TradeType>('Bricklaying')
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>(['wrk_emem_01'])
  const [artisanDropdownOpen, setArtisanDropdownOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [totalNaira, setTotalNaira] = useState('45000')
  const [daysCount, setDaysCount] = useState('3')
  const [supervisorName, setSupervisorName] = useState('')
  const [supervisorPhone, setSupervisorPhone] = useState('')
  const [createdJobs, setCreatedJobs] = useState<EscrowJob[]>([])
  const [busy, setBusy] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [error, setError] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const tradeWorkers = allWorkers.filter((w) => w.trade === trade)

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setArtisanDropdownOpen(false)
      }
    }
    window.addEventListener('mousedown', onClickOutside)
    return () => window.removeEventListener('mousedown', onClickOutside)
  }, [])

  if (!open) return null

  function handleTradeChange(nextTrade: TradeType) {
    setTrade(nextTrade)
    const matching = allWorkers.filter((w) => w.trade === nextTrade)
    if (matching.length > 0) {
      setSelectedWorkerIds([matching[0].id])
    } else {
      setSelectedWorkerIds([])
    }
    setArtisanDropdownOpen(true)
  }

  function toggleWorker(id: string) {
    setSelectedWorkerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  function handleSupervisorPhoneChange(raw: string) {
    setSupervisorPhone(raw.replace(/\D/g, '').replace(/^0+/, '').slice(0, 10))
  }

  function copyText(key: string, value: string) {
    navigator.clipboard?.writeText(value)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1600)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (selectedWorkerIds.length === 0) {
      setError('Select at least one artisan from the dropdown.')
      return
    }
    const perWorkerTotal = Number(totalNaira)
    const days = Math.max(1, Number(daysCount))
    if (!perWorkerTotal || !description.trim()) {
      setError('Enter a job description and pay amount.')
      return
    }
    if (supervisorName.trim() && supervisorPhone && !/^[789][01]\d{8}$/.test(supervisorPhone)) {
      setError('Enter a valid 10-digit Nigerian phone number for the supervisor.')
      return
    }

    const formattedSupPhone = supervisorPhone ? `+234 ${supervisorPhone}` : undefined

    setBusy(true)
    try {
      const results: EscrowJob[] = []
      for (const wId of selectedWorkerIds) {
        const matched = allWorkers.find((w) => w.id === wId)
        const job = await api.createAndRequestFunding({
          clientName: defaultEmployerName,
          workerId: wId,
          trade: matched?.trade ?? trade,
          description: description.trim(),
          area: matched?.area ?? 'Ewet Housing, Uyo',
          totalNaira: perWorkerTotal,
          daysCount: days,
          supervisorName: supervisorName.trim() || undefined,
          supervisorPhone: formattedSupPhone,
        })
        results.push(job)
      }
      setCreatedJobs(results)
      await onCreated()
    } finally {
      setBusy(false)
    }
  }

  function handleCloseAll() {
    setCreatedJobs([])
    setDescription('')
    setSupervisorName('')
    setSupervisorPhone('')
    setArtisanDropdownOpen(false)
    setError('')
    onClose()
  }

  const selectedWorkersList = allWorkers.filter((w) => selectedWorkerIds.includes(w.id))
  const totalCombinedNaira = Number(totalNaira || 0) * selectedWorkerIds.length

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-job-modal-title"
      onClick={handleCloseAll}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <Card
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto overscroll-contain p-6 space-y-5 shadow-[var(--pw-shadow-sheet)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1">
            <p className="font-mono text-[11px] uppercase tracking-wider text-primary">
              {createdJobs.length > 0 ? 'Step 2 · Transfer & Lock Pay' : 'Step 1 · Job Details'}
            </p>
            <h2 id="new-job-modal-title" className="text-xl font-semibold text-foreground">
              {createdJobs.length > 0
                ? `Lock pay for ${createdJobs.length} artisan${createdJobs.length > 1 ? 's' : ''}`
                : 'Create a new job'}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleCloseAll}
            aria-label="Close modal"
            className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <CloseCircle className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {createdJobs.length === 0 ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="mod-trade" className="text-sm font-medium text-foreground">
                Trade category
              </label>
              <Select
                id="mod-trade"
                value={trade}
                onValueChange={(val) => handleTradeChange(val as TradeType)}
                options={TRADES.map((t) => ({
                  value: t,
                  label: `${t} (${allWorkers.filter((w) => w.trade === t).length} available)`,
                }))}
              />
            </div>

            <div ref={dropdownRef} className="space-y-2 relative">
              <label className="text-sm font-medium text-foreground block">
                Artisans in {trade} ({selectedWorkerIds.length} selected)
              </label>

              <button
                type="button"
                aria-expanded={artisanDropdownOpen}
                onClick={() => setArtisanDropdownOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-2 rounded-[var(--pw-radius-sm)] border border-input bg-card px-3.5 py-2.5 text-left text-sm text-foreground hover:border-primary transition-colors cursor-pointer"
              >
                <span className="truncate">
                  {selectedWorkersList.length === 0
                    ? `Select ${trade.toLowerCase()} artisan(s)...`
                    : selectedWorkersList.map((w) => w.name).join(', ')}
                </span>
                <AngleDown
                  className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-150 ${
                    artisanDropdownOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {artisanDropdownOpen && (
                <div className="rounded-[12px] border border-border bg-card p-1.5 shadow-[var(--pw-shadow-sheet)] space-y-1 max-h-56 overflow-y-auto overscroll-contain">
                  {tradeWorkers.map((w) => {
                    const selected = selectedWorkerIds.includes(w.id)
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => toggleWorker(w.id)}
                        className={`flex w-full items-center justify-between gap-3 rounded-[8px] px-3 py-2.5 text-left transition-colors cursor-pointer ${
                          selected
                            ? 'bg-primary/10 text-foreground'
                            : 'hover:bg-muted/70 text-foreground'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">{w.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {w.customTrade || w.trade} · {w.area} · {w.phone}
                          </p>
                        </div>
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border ${
                            selected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-background'
                          }`}
                        >
                          {selected && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}

              {selectedWorkersList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {selectedWorkersList.map((w) => (
                    <span
                      key={w.id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary"
                    >
                      <span>{w.name}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${w.name}`}
                        onClick={() => toggleWorker(w.id)}
                        className="text-primary/70 hover:text-primary cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="mod-desc" className="text-sm font-medium text-foreground">
                Job description
              </label>
              <Input
                id="mod-desc"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Perimeter wall blockwork & plastering"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="mod-total" className="text-sm font-medium text-foreground">
                  Pay per artisan (₦)
                </label>
                <Input
                  id="mod-total"
                  type="number"
                  min={1000}
                  required
                  value={totalNaira}
                  onChange={(e) => setTotalNaira(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="mod-days" className="text-sm font-medium text-foreground">
                  Working days
                </label>
                <Input
                  id="mod-days"
                  type="number"
                  min={1}
                  max={30}
                  required
                  value={daysCount}
                  onChange={(e) => setDaysCount(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-[12px] border border-border bg-muted/30 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserTick className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span className="text-xs font-semibold text-foreground">
                    Site supervisor (optional)
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Generates a unique reporting link
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="mod-sup-name" className="text-xs font-medium text-muted-foreground">
                    Supervisor name
                  </label>
                  <Input
                    id="mod-sup-name"
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                    placeholder="e.g. Foreman Bassey"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="mod-sup-phone"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Supervisor phone
                  </label>
                  <div className="flex items-center rounded-[var(--pw-radius-sm)] border border-input bg-card px-2.5 focus-within:border-primary">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                    <span className="font-mono text-xs text-muted-foreground pl-1.5 pr-2 border-r border-border">
                      +234
                    </span>
                    <input
                      id="mod-sup-phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={supervisorPhone}
                      onChange={(e) => handleSupervisorPhoneChange(e.target.value)}
                      placeholder="8051120944"
                      className="w-full bg-transparent px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[10px] border border-border bg-muted/40 px-4 py-3 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {selectedWorkerIds.length} artisan{selectedWorkerIds.length !== 1 ? 's' : ''} ×{' '}
                {formatNaira(Number(totalNaira || 0))} ({daysCount} days)
              </span>
              <span className="font-mono text-sm font-semibold text-foreground">
                Total: {formatNaira(totalCombinedNaira)}
              </span>
            </div>

            {error && <p className="text-xs font-medium text-[var(--pw-critical)]">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={handleCloseAll}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                <span>{busy ? 'Creating NUBAN(s)...' : 'Continue to payment'}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Transfer to each artisan’s dedicated Paga subsidiary NUBAN below, or simulate the
              Paga lock for the demo.
            </p>

            <div className="space-y-3">
              {createdJobs.map((job) => {
                const isFunded = job.status === 'FUNDED' || job.status === 'IN_PROGRESS'
                const supervisorUrl =
                  typeof window !== 'undefined'
                    ? `${window.location.origin}/supervisor?job=${job.id}&token=sup_${job.id}`
                    : `/supervisor?job=${job.id}&token=sup_${job.id}`

                return (
                  <div
                    key={job.id}
                    className="rounded-[12px] border border-border bg-background p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {job.workerName} · {job.trade}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                          Paga NUBAN: {job.fundingAccountNumber} ·{' '}
                          {formatNaira(Math.round(job.totalKobo / 100))}
                        </p>
                      </div>
                      <StatusPill status={job.status} />
                    </div>

                    {job.supervisorName && (
                      <div className="rounded-[8px] border border-primary/20 bg-primary/5 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div>
                          <p className="font-semibold text-foreground">
                            Supervisor: {job.supervisorName}
                            {job.supervisorPhone ? ` (${job.supervisorPhone})` : ''}
                          </p>
                          <p className="font-mono text-[11px] text-muted-foreground truncate max-w-xs">
                            {supervisorUrl}
                          </p>
                        </div>
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
                            {copiedKey === `sup-${job.id}` ? 'Copied link' : 'Copy supervisor link'}
                          </span>
                        </Button>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => copyText(job.id, job.fundingAccountNumber)}
                      >
                        {copiedKey === job.id ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        <span>{copiedKey === job.id ? 'Copied' : 'Copy NUBAN'}</span>
                      </Button>

                      {!isFunded ? (
                        <Button
                          size="sm"
                          disabled={busy}
                          onClick={async () => {
                            setBusy(true)
                            try {
                              const funded = await api.simulateFundJob(job.id)
                              setCreatedJobs((prev) =>
                                prev.map((item) => (item.id === job.id ? funded : item)),
                              )
                              await onCreated()
                            } finally {
                              setBusy(false)
                            }
                          }}
                        >
                          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Simulate Paga payment</span>
                        </Button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--pw-positive)]">
                          <CheckCircle className="h-4 w-4" aria-hidden="true" />
                          <span>Funds locked in Paga</span>
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleCloseAll}>Done</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
