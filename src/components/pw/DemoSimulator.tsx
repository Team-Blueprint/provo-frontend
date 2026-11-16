import { useState } from 'react'
import { CloseCircle, Flask, Message, Refresh, Timer } from 'reicon-react'
import { api } from '@/api/client'
import { resetDemoState } from '@/api/mockAdapter'
import { Button } from '@/components/ui/button'

export function DemoSimulator({ onUpdate }: { onUpdate?: () => void }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'scheduler' | 'telegram'>('scheduler')
  const [feedback, setFeedback] = useState<string | null>(null)

  async function run(action: () => Promise<{ message: string }>) {
    const res = await action()
    setFeedback(res.message)
    onUpdate?.()
    window.dispatchEvent(new CustomEvent('proofwork:demo-updated'))
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 no-print">
      {!open ? (
        <Button
          size="md"
          variant="secondary"
          onClick={() => setOpen(true)}
          className="shadow-[var(--pw-shadow-sheet)]"
        >
          <Flask className="h-4 w-4 text-[var(--pw-brick)]" aria-hidden="true" />
          <span>Demo Simulator</span>
        </Button>
      ) : (
        <div className="w-84 rounded-[var(--pw-radius-lg)] border border-border bg-card p-4 shadow-[var(--pw-shadow-sheet)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Flask className="h-4 w-4 text-[var(--pw-brick)]" aria-hidden="true" />
              <span>Escrow &amp; Telegram Simulator</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close simulator"
              className="rounded-md p-1 text-muted-foreground hover:bg-muted cursor-pointer"
            >
              <CloseCircle className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1 rounded-[var(--pw-radius-sm)] bg-muted p-1">
            <button
              type="button"
              onClick={() => setTab('scheduler')}
              className={`rounded-[6px] py-1 text-xs font-medium cursor-pointer ${
                tab === 'scheduler' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
              }`}
            >
              Escrow Scheduler
            </button>
            <button
              type="button"
              onClick={() => setTab('telegram')}
              className={`rounded-[6px] py-1 text-xs font-medium cursor-pointer ${
                tab === 'telegram' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
              }`}
            >
              Telegram / SMS
            </button>
          </div>

          {tab === 'scheduler' ? (
            <div className="space-y-2">
              <Button
                size="sm"
                variant="secondary"
                className="w-full justify-start"
                onClick={() => run(() => api.simulateAutoReleaseNext())}
              >
                <Timer className="h-4 w-4 text-[var(--pw-warning)]" aria-hidden="true" />
                <span>Trigger 24h auto-release</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="w-full justify-start text-muted-foreground"
                onClick={() => {
                  resetDemoState()
                  setFeedback('Demo data reset to Emem Ekpo’s escrow seed.')
                  onUpdate?.()
                  window.dispatchEvent(new CustomEvent('proofwork:demo-updated'))
                }}
              >
                <Refresh className="h-4 w-4" aria-hidden="true" />
                <span>Reset demo data</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5 text-xs">
              <div className="rounded-[var(--pw-radius-md)] border border-border bg-muted/40 p-2.5 space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <Message className="h-3.5 w-3.5 text-primary" />
                  <span>Telegram Bot (@ProofworkBot)</span>
                </div>
                <p className="text-muted-foreground">
                  “Emem Ekpo marked Day 2 of 3 done (₦15,000). Confirm or dispute within 24h.”
                </p>
              </div>
              <div className="rounded-[var(--pw-radius-md)] border border-border bg-muted/40 p-2.5 space-y-1">
                <span className="font-medium text-foreground block">
                  SMS Invite (Simulated · Unregistered Worker)
                </span>
                <p className="text-muted-foreground">
                  “Chief Etim locked ₦45,000 for Bricklaying in Uyo. Open t.me/ProofworkBot to
                  accept.”
                </p>
              </div>
            </div>
          )}

          {feedback && (
            <p className="rounded-[var(--pw-radius-sm)] bg-muted px-2.5 py-2 text-xs text-foreground">
              {feedback}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
