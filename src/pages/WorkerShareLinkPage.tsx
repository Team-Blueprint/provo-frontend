import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Check, Copy, Share } from 'reicon-react'
import { api } from '@/api/client'
import type { Worker } from '@/api/types'
import { WorkerShell } from '@/components/pw/WorkerShell'
import { Button } from '@/components/ui/button'
import { Card, Skeleton } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export function WorkerShareLinkPage() {
  const [worker, setWorker] = useState<Worker | null>(null)
  const [paymentAccount, setPaymentAccount] = useState<{
    accountNumber: string
    bank: string
    paymentUrl: string
  } | null>(null)
  const [amount, setAmount] = useState('')
  const [days, setDays] = useState('')
  const [description, setDescription] = useState('')
  const [copied, setCopied] = useState(false)
  const [copiedAccount, setCopiedAccount] = useState(false)

  useEffect(() => {
    const load = () =>
      api.getWorkerDashboard().then((d) => {
        setWorker(d.worker)
        api.getWorkerPaymentLink(d.worker.id).then((link) => {
          if (link) {
            setPaymentAccount({
              accountNumber: link.accountNumber,
              bank: link.bank,
              paymentUrl: link.paymentUrl,
            })
          }
        })
      })
    load()
    window.addEventListener('proofwork:demo-updated', load)
    return () => window.removeEventListener('proofwork:demo-updated', load)
  }, [])

  const params = new URLSearchParams()
  if (worker) params.set('worker', worker.id)
  if (amount.trim() && Number(amount) > 0) params.set('amount', amount.trim())
  if (days.trim() && Number(days) > 0) params.set('days', days.trim())
  if (description.trim()) params.set('desc', description.trim())

  const relativePath = `/employer?${params.toString()}`
  const shareUrl =
    typeof window !== 'undefined' ? `${window.location.origin}${relativePath}` : relativePath

  const whatsappText = worker
    ? `Hi, please use this Provo link to lock our job pay through Paga (${worker.name} · ${worker.customTrade || worker.trade}): ${shareUrl}`
    : shareUrl

  return (
    <WorkerShell>
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Share your payment link</h1>
        <p className="text-sm text-muted-foreground">
          Send this link to an employer so they can lock the job pay before work starts.
        </p>
      </div>

      {!worker ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          <Card className="lg:col-span-7 p-6 space-y-5">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                Employer payment link for {worker.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Opens the employer job form with you pre-selected ({worker.customTrade || worker.trade}).
              </p>
            </div>

            <div className="rounded-[var(--pw-radius-md)] border border-border bg-muted/40 p-3.5 flex items-center justify-between gap-3">
              <span className="font-mono text-xs text-foreground break-all">{shareUrl}</span>
              <Button
                size="sm"
                variant="secondary"
                className="shrink-0"
                onClick={() => {
                  navigator.clipboard?.writeText(shareUrl)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 1800)
                }}
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy link'}</span>
              </Button>
            </div>

            {paymentAccount && (
              <div className="rounded-[var(--pw-radius-md)] border border-border bg-card p-3.5 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">
                    Permanent Paga account ({paymentAccount.bank})
                  </p>
                  <p className="font-mono text-base font-semibold tracking-wider text-foreground tabular-nums">
                    {paymentAccount.accountNumber}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="shrink-0"
                  onClick={() => {
                    navigator.clipboard?.writeText(paymentAccount.accountNumber)
                    setCopiedAccount(true)
                    setTimeout(() => setCopiedAccount(false), 1800)
                  }}
                >
                  {copiedAccount ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>{copiedAccount ? 'Copied' : 'Copy NUBAN'}</span>
                </Button>
              </div>
            )}

            <div className="flex flex-wrap gap-2.5">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(whatsappText)}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button size="md">
                  <Share className="h-4 w-4" aria-hidden="true" />
                  <span>Send via WhatsApp</span>
                </Button>
              </a>
              <Link to={relativePath}>
                <Button size="md" variant="secondary">
                  <span>Preview employer view</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="lg:col-span-5 p-6 space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">Optional quote preset</h2>
              <p className="text-xs text-muted-foreground">
                Pre-fill the agreed amount and days in the link before sending.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="link-amount" className="text-xs font-medium text-foreground">
                  Total pay (₦)
                </label>
                <Input
                  id="link-amount"
                  type="number"
                  min={1000}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="45000"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="link-days" className="text-xs font-medium text-foreground">
                  Number of days
                </label>
                <Input
                  id="link-days"
                  type="number"
                  min={1}
                  max={30}
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  placeholder="3"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="link-desc" className="text-xs font-medium text-foreground">
                  Job note
                </label>
                <Input
                  id="link-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Perimeter wall blockwork"
                />
              </div>
            </div>
          </Card>
        </div>
      )}
    </WorkerShell>
  )
}
