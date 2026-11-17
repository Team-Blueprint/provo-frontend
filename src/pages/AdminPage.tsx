import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, ShieldAlert } from 'reicon-react'
import { api } from '@/api/client'
import type { DisputeRecord, PagaEventLog } from '@/api/types'
import { formatNaira, formatShortDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function AdminPage() {
  const [disputes, setDisputes] = useState<DisputeRecord[]>([])
  const [events, setEvents] = useState<PagaEventLog[]>([])

  async function load() {
    const data = await api.getAdminOverview()
    setDisputes(data.disputes)
    setEvents(data.pagaEvents)
  }

  useEffect(() => {
    load()
    const handler = () => load()
    window.addEventListener('proofwork:demo-updated', handler)
    return () => window.removeEventListener('proofwork:demo-updated', handler)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-10 py-3.5">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Provo Admin</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 lg:px-10 py-8 space-y-8">
        <section className="space-y-3">
          <h1 className="text-xl font-semibold text-foreground">Disputes</h1>
          {disputes.length === 0 ? (
            <Card className="p-6 text-sm text-muted-foreground">No disputes recorded.</Card>
          ) : (
            <div className="space-y-2.5">
              {disputes.map((d) => (
                <Card key={d.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {d.workerName} · Day {d.dayNumber} · Employer {d.clientToken} ·{' '}
                      {formatNaira(d.amountNaira)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Reason: {d.reason} · Raised by {d.raisedBy} · {formatShortDate(d.createdAt)} ·
                      Status: <span className="font-medium text-foreground">{d.status}</span>
                    </p>
                  </div>
                  {d.status === 'open' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={async () => {
                          await api.resolveDispute(d.id, 'dismiss')
                          load()
                        }}
                      >
                        Dismiss
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          await api.resolveDispute(d.id, 'uphold')
                          load()
                        }}
                      >
                        Uphold dispute
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-foreground">
              Immutable Audit Ledger &amp; Paga Reconcile Guard
            </h2>
            <p className="text-xs text-muted-foreground">
              Append-only event log. Every webhook is verified via x-paga-hash-v3, deduplicated by
              idempotency key, and reconciled against Paga /status before counting.
            </p>
          </div>
          <div className="space-y-2">
            {events.map((evt) => (
              <Card key={evt.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                    {evt.hashValid ? (
                      <CheckCircle weight="Filled" className="h-4 w-4 text-[var(--pw-success)]" />
                    ) : (
                      <ShieldAlert weight="Filled" className="h-4 w-4 text-[var(--pw-critical)]" />
                    )}
                    <span className="font-mono text-xs">{evt.reference}</span>
                    <span className="text-xs text-muted-foreground">{evt.eventType}</span>
                    <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                      {evt.reconcileVerified ? 'reconciled' : 'rejected'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {evt.outcome} · <span className="font-mono">{evt.idempotencyKey}</span>
                  </p>
                </div>
                <span className="font-mono text-sm font-medium tabular-nums">
                  {formatNaira(evt.amountNaira)}
                </span>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
