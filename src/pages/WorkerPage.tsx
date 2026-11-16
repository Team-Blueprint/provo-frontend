import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Copy,
  FileText,
  Link as LinkIcon,
  Plus,
  UserAdd,
} from 'reicon-react'
import { api } from '@/api/client'
import type { Job, JobStatus, JobType, ReportPayload, Worker } from '@/api/types'
import { formatNaira, getTierDetails } from '@/lib/format'
import { messages } from '@/messages/en'
import { Button } from '@/components/ui/button'
import { Card, Skeleton } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { AmountText } from '@/components/pw/AmountText'
import { JobLine } from '@/components/pw/JobLine'
import { JobTypePicker } from '@/components/pw/JobTypePicker'
import { OfflineBanner } from '@/components/pw/OfflineBanner'

export function WorkerPage() {
  const [loading, setLoading] = useState(true)
  const [worker, setWorker] = useState<Worker | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [reportPreview, setReportPreview] = useState<ReportPayload | null>(null)
  const [filter, setFilter] = useState<'all' | JobStatus>('all')
  const [copiedNuban, setCopiedNuban] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const [linkingJob, setLinkingJob] = useState<Job | null>(null)
  const [linkName, setLinkName] = useState('')
  const [linkPhone, setLinkPhone] = useState('')

  const [cashOpen, setCashOpen] = useState(false)
  const [cashName, setCashName] = useState('')
  const [cashPhone, setCashPhone] = useState('')
  const [cashAmount, setCashAmount] = useState('')
  const [cashType, setCashType] = useState<JobType>('Bricklaying')

  async function load() {
    setLoading(true)
    const data = await api.getWorkerDashboard()
    setWorker(data.worker)
    setJobs(data.jobs)
    setReportPreview(data.reportPreview)
    setLoading(false)
  }

  useEffect(() => {
    load()
    const handler = () => load()
    window.addEventListener('proofwork:demo-updated', handler)
    return () => window.removeEventListener('proofwork:demo-updated', handler)
  }, [])

  const unlinkedTransfers = jobs.filter((j) => j.needsPayerLink)
  const filteredJobs = filter === 'all' ? jobs : jobs.filter((j) => j.status === filter)

  async function handleLinkPayer(e: React.FormEvent) {
    e.preventDefault()
    if (!linkingJob || !linkName.trim() || !linkPhone.trim()) return
    await api.linkPayerToClient(linkingJob.id, linkName.trim(), linkPhone.trim())
    setLinkingJob(null)
    setLinkName('')
    setLinkPhone('')
    await load()
  }

  async function handleCashSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amt = Number(cashAmount)
    if (!cashName.trim() || !cashPhone.trim() || !amt) return
    await api.createCashDraft(cashName.trim(), cashPhone.trim(), amt, cashType)
    setCashOpen(false)
    setCashName('')
    setCashPhone('')
    setCashAmount('')
    await load()
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <OfflineBanner />
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3.5">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Proofwork</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/worker/consent">
              <Button size="sm" variant="secondary">
                <FileText className="h-4 w-4" aria-hidden="true" />
                <span>Share report</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        {loading || !worker ? (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">{worker.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {worker.trade} · {worker.phone}
                </p>
              </div>
              {reportPreview && (
                <Link
                  to={`/report/${reportPreview.reportToken}`}
                  className="rounded-[var(--pw-radius-md)] border border-border bg-card px-3.5 py-2.5 text-right hover:bg-muted transition-colors"
                >
                  <span className="block text-xs font-medium text-primary">
                    {getTierDetails(reportPreview.score).tier} tier
                  </span>
                  <span className="text-lg font-semibold tabular-nums text-foreground">
                    {reportPreview.score}/100
                  </span>
                </Link>
              )}
            </div>

            {reportPreview && (
              <Card className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-secondary/40">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">
                    Standing: {getTierDetails(reportPreview.score).tier} ({reportPreview.score}/100)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getTierDetails(reportPreview.score).nextStep}
                  </p>
                </div>
                <Link to={`/report/${reportPreview.reportToken}`} className="shrink-0">
                  <Button size="sm" variant="secondary">View lender report</Button>
                </Link>
              </Card>
            )}

            {unlinkedTransfers.map((job) => (
              <Card
                key={job.id}
                className="border-[var(--pw-warning)]/40 bg-[var(--pw-warning-tint)] p-4 space-y-3"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle
                    weight="Filled"
                    className="h-5 w-5 shrink-0 text-[var(--pw-warning)] mt-0.5"
                    aria-hidden="true"
                  />
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {messages.worker.unknownTransfer}
                    </p>
                    <p className="text-sm text-foreground">
                      <AmountText amount={job.amount} /> from{' '}
                      <span className="font-mono font-medium">{job.payerRawName}</span> (
                      {job.payerBankName})
                    </p>
                  </div>
                </div>
                <Button
                  size="md"
                  className="w-full sm:w-auto"
                  onClick={() => setLinkingJob(job)}
                >
                  <UserAdd className="h-4 w-4" aria-hidden="true" />
                  <span>Link client &amp; send confirmation</span>
                </Button>
              </Card>
            ))}

            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="p-4 space-y-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Dedicated Paga account
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xl font-semibold tracking-wide text-foreground">
                    {worker.pagaAccountNumber}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      navigator.clipboard?.writeText(worker.pagaAccountNumber)
                      setCopiedNuban(true)
                      setTimeout(() => setCopiedNuban(false), 1500)
                    }}
                  >
                    {copiedNuban ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copiedNuban ? 'Copied' : 'Copy'}</span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Sweeps automatically to {worker.bankName} ({worker.bankAccountNumber})
                </p>
              </Card>

              <Card className="p-4 space-y-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Client payment link
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm truncate text-foreground">
                    {worker.paymentLink}
                  </span>
                  <div className="flex gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        navigator.clipboard?.writeText(window.location.origin + worker.paymentLink)
                        setCopiedLink(true)
                        setTimeout(() => setCopiedLink(false), 1500)
                      }}
                    >
                      {copiedLink ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                    </Button>
                    <Link to={worker.paymentLink}>
                      <Button size="sm">Open</Button>
                    </Link>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Grade 1 evidence when client pays through this link.
                </p>
              </Card>
            </div>

            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-medium text-foreground">Job record</h2>
              <Button size="sm" variant="secondary" onClick={() => setCashOpen((v) => !v)}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Log cash job</span>
              </Button>
            </div>

            {cashOpen && (
              <Card className="p-4 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-medium text-foreground">Log a cash job (Grade 3)</h3>
                  <p className="text-xs text-muted-foreground">
                    {messages.worker.cashDraftLine}
                  </p>
                </div>
                <form onSubmit={handleCashSubmit} className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label htmlFor="cash-name" className="text-sm font-medium">Client name</label>
                      <Input
                        id="cash-name"
                        required
                        value={cashName}
                        onChange={(e) => setCashName(e.target.value)}
                        placeholder="e.g. Mr. Akpan"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="cash-phone" className="text-sm font-medium">Client phone</label>
                      <Input
                        id="cash-phone"
                        type="tel"
                        required
                        value={cashPhone}
                        onChange={(e) => setCashPhone(e.target.value)}
                        placeholder="0803 000 0000"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="cash-amount" className="text-sm font-medium">Amount (₦)</label>
                    <Input
                      id="cash-amount"
                      type="number"
                      inputMode="numeric"
                      required
                      min={500}
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      placeholder="8000"
                    />
                  </div>
                  <JobTypePicker value={cashType} onChange={setCashType} />
                  <div className="flex gap-2">
                    <Button type="button" variant="secondary" onClick={() => setCashOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save draft &amp; send confirmation</Button>
                  </div>
                </form>
              </Card>
            )}

            <div className="flex flex-wrap gap-1.5">
              {(['all', 'confirmed', 'waiting', 'draft', 'disputed'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilter(tab)}
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize cursor-pointer border ${
                    filter === tab
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {filteredJobs.length === 0 ? (
              <Card className="p-8 text-center space-y-2">
                <p className="text-sm text-muted-foreground">{messages.worker.emptyJobs}</p>
              </Card>
            ) : (
              <div className="space-y-2.5">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="space-y-1">
                    <JobLine job={job} mode="worker" />
                    {job.confirmToken && (job.status === 'waiting' || job.status === 'draft') && (
                      <div className="flex justify-end px-1">
                        <Link
                          to={`/confirm/${job.confirmToken}`}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Open client confirmation screen →
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {linkingJob && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 p-4"
        >
          <Card className="w-full max-w-md p-5 space-y-4 shadow-[var(--pw-shadow-sheet)]">
            <div className="space-y-1">
              <h2 className="text-lg font-medium text-foreground">Who paid you?</h2>
              <p className="text-sm text-muted-foreground">
                {formatNaira(linkingJob.amount)} from{' '}
                <span className="font-mono text-foreground">{linkingJob.payerRawName}</span> (
                {linkingJob.payerBankName})
              </p>
            </div>
            <form onSubmit={handleLinkPayer} className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="link-name" className="text-sm font-medium">Client name</label>
                <Input
                  id="link-name"
                  required
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  placeholder="e.g. Mr. Chinedu Okoye"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="link-phone" className="text-sm font-medium">Client phone</label>
                <Input
                  id="link-phone"
                  type="tel"
                  required
                  value={linkPhone}
                  onChange={(e) => setLinkPhone(e.target.value)}
                  placeholder="0803 123 4567"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setLinkingJob(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Send confirmation
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
