import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle,
  CloseCircle,
  Flask,
  Lock,
  Message,
  Refresh,
  Timer,
} from 'reicon-react'
import { api } from '@/api/client'
import { resetDemoState } from '@/api/mockAdapter'
import { formatNaira } from '@/lib/format'
import { Button } from '@/components/ui/button'

export function DemoSimulator({ onUpdate }: { onUpdate?: () => void }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'actions' | 'channels'>('actions')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function notifyAndRefresh(message: string) {
    setFeedback(message)
    onUpdate?.()
    window.dispatchEvent(new CustomEvent('proofwork:demo-updated'))
  }

  async function handleSimulateFundNext() {
    setBusy(true)
    try {
      const dash = await api.getWorkerDashboard()
      const awaiting = dash.jobs.find((j) => j.status === 'AWAITING_FUNDING')
      if (!awaiting) {
        await notifyAndRefresh('All current jobs are already funded.')
        return
      }
      await api.simulateFundJob(awaiting.id)
      await notifyAndRefresh(
        `Locked ${formatNaira(Math.round(awaiting.totalKobo / 100))} in Paga for ${awaiting.workerName}.`,
      )
    } finally {
      setBusy(false)
    }
  }

  async function handleSimulateMarkNextDone() {
    setBusy(true)
    try {
      const dash = await api.getWorkerDashboard()
      const job = dash.jobs.find(
        (j) =>
          (j.status === 'IN_PROGRESS' || j.status === 'FUNDED') &&
          j.days.some((d) => d.status === 'PENDING'),
      )
      const day = job?.days.find((d) => d.status === 'PENDING')
      if (!job || !day) {
        await notifyAndRefresh('No pending day found. Create or reset a job first.')
        return
      }
      await api.markDayDone(job.id, day.dayNumber)
      await notifyAndRefresh(
        `${job.workerName} marked Day ${day.dayNumber} done (${formatNaira(Math.round(day.amountKobo / 100))}).`,
      )
    } finally {
      setBusy(false)
    }
  }

  async function handleSimulateConfirmNext() {
    setBusy(true)
    try {
      const dash = await api.getWorkerDashboard()
      const job = dash.jobs.find((j) => j.days.some((d) => d.status === 'DONE_REPORTED'))
      const day = job?.days.find((d) => d.status === 'DONE_REPORTED')
      if (!job || !day) {
        await notifyAndRefresh('No reported day waiting for employer confirmation.')
        return
      }
      await api.confirmDay(job.id, day.dayNumber, 'client')
      await notifyAndRefresh(
        `Employer confirmed Day ${day.dayNumber}. ${formatNaira(Math.round(day.amountKobo / 100))} released to ${job.workerName}.`,
      )
    } finally {
      setBusy(false)
    }
  }

  async function handleAutoRelease() {
    setBusy(true)
    try {
      const res = await api.simulateAutoReleaseNext()
      await notifyAndRefresh(res.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed bottom-20 sm:bottom-5 right-4 sm:right-5 z-40 no-print">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-foreground px-4 py-2.5 text-xs font-semibold text-background shadow-[var(--pw-shadow-sheet)] hover:bg-foreground/90 active:scale-[0.96] transition-[background-color,scale] duration-150 ease-out cursor-pointer"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Flask className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span>Demo Simulator</span>
        </button>
      ) : (
        <div className="w-[336px] max-w-[calc(100vw-2rem)] rounded-[20px] border border-border bg-card p-4 shadow-[var(--pw-shadow-sheet)] space-y-3.5 overscroll-contain">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Flask className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span>Provo Demo Controls</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close simulator"
              className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
            >
              <CloseCircle className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1 rounded-[10px] bg-muted p-1">
            <button
              type="button"
              onClick={() => setTab('actions')}
              className={`rounded-[7px] py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                tab === 'actions'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Job Actions
            </button>
            <button
              type="button"
              onClick={() => setTab('channels')}
              className={`rounded-[7px] py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                tab === 'channels'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Bot &amp; Surfaces
            </button>
          </div>

          {tab === 'actions' ? (
            <div className="space-y-1.5">
              <Button
                size="sm"
                variant="secondary"
                disabled={busy}
                className="w-full justify-start"
                onClick={handleSimulateFundNext}
              >
                <Lock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                <span>Fund awaiting Paga NUBAN</span>
              </Button>

              <Button
                size="sm"
                variant="secondary"
                disabled={busy}
                className="w-full justify-start"
                onClick={handleSimulateMarkNextDone}
              >
                <CheckCircle className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                <span>Worker: Mark next day done</span>
              </Button>

              <Button
                size="sm"
                variant="secondary"
                disabled={busy}
                className="w-full justify-start"
                onClick={handleSimulateConfirmNext}
              >
                <CheckCircle className="h-3.5 w-3.5 text-[var(--pw-positive)]" aria-hidden="true" />
                <span>Employer: Confirm &amp; release pay</span>
              </Button>

              <Button
                size="sm"
                variant="secondary"
                disabled={busy}
                className="w-full justify-start"
                onClick={handleAutoRelease}
              >
                <Timer className="h-3.5 w-3.5 text-[var(--pw-warning)]" aria-hidden="true" />
                <span>Trigger 24h auto-release</span>
              </Button>

              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                className="w-full justify-start text-muted-foreground"
                onClick={() => {
                  resetDemoState()
                  notifyAndRefresh('Demo data reset to Emem Ekpo’s seed state.')
                }}
              >
                <Refresh className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reset demo data</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5 text-xs">
              <a
                href="https://t.me/Provvobot"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-[10px] border border-primary/25 bg-primary/8 px-3 py-2.5 text-foreground hover:border-primary transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Message className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-foreground">Open @Provvobot</p>
                    <p className="text-[11px] text-muted-foreground">t.me/Provvobot on Telegram</p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
              </a>

              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { to: '/worker', label: 'Worker Demo' },
                  { to: '/client', label: 'Employer Overview' },
                  { to: '/client/jobs', label: 'Employer Jobs' },
                  { to: '/supervisor', label: 'Supervisor View' },
                  { to: '/ussd', label: 'USSD Simulator' },
                  { to: '/sign-in', label: 'Sign In / Demo' },
                ].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className="rounded-[8px] border border-border bg-muted/40 px-2.5 py-2 font-medium text-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {feedback && (
            <p className="rounded-[10px] bg-muted px-3 py-2 text-xs text-foreground leading-snug">
              {feedback}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
