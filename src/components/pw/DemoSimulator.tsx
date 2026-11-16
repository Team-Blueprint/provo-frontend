import { useState } from 'react'
import {
  ArrowClockwise,
  ChatCircleText,
  Flask,
  Lightning,
  ShieldWarning,
  X,
} from '@phosphor-icons/react'
import { api } from '@/api/client'
import { resetDemoState } from '@/api/mockAdapter'
import { Button } from '@/components/ui/button'

export function DemoSimulator({ onUpdate }: { onUpdate?: () => void }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'webhooks' | 'messages'>('webhooks')
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
              <span>Demo Simulator</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close simulator"
              className="rounded-md p-1 text-muted-foreground hover:bg-muted cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1 rounded-[var(--pw-radius-sm)] bg-muted p-1">
            <button
              type="button"
              onClick={() => setTab('webhooks')}
              className={`rounded-[6px] py-1 text-xs font-medium cursor-pointer ${
                tab === 'webhooks' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
              }`}
            >
              Paga Webhooks
            </button>
            <button
              type="button"
              onClick={() => setTab('messages')}
              className={`rounded-[6px] py-1 text-xs font-medium cursor-pointer ${
                tab === 'messages' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
              }`}
            >
              WhatsApp / SMS
            </button>
          </div>

          {tab === 'webhooks' ? (
            <div className="space-y-2">
              <Button
                size="sm"
                variant="secondary"
                className="w-full justify-start"
                onClick={() => run(() => api.simulateFundingCallback())}
              >
                <Lightning className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>Simulate ₦22,000 bank transfer</span>
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="w-full justify-start"
                onClick={() => run(() => api.simulateFundingCallback({ duplicate: true }))}
              >
                <Lightning className="h-4 w-4 text-[var(--pw-info)]" aria-hidden="true" />
                <span>Replay duplicate callback</span>
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="w-full justify-start"
                onClick={() => run(() => api.simulateFundingCallback({ invalidHash: true }))}
              >
                <ShieldWarning className="h-4 w-4 text-[var(--pw-critical)]" aria-hidden="true" />
                <span>Send invalid hash callback</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="w-full justify-start text-muted-foreground"
                onClick={() => {
                  resetDemoState()
                  setFeedback('Demo data reset to Emem’s 4-month seed.')
                  onUpdate?.()
                  window.dispatchEvent(new CustomEvent('proofwork:demo-updated'))
                }}
              >
                <ArrowClockwise className="h-4 w-4" aria-hidden="true" />
                <span>Reset demo data</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5 text-xs">
              <div className="rounded-[var(--pw-radius-md)] border border-border bg-muted/40 p-2.5 space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <ChatCircleText className="h-3.5 w-3.5 text-[var(--pw-success)]" />
                  <span>WhatsApp to Emem (Worker)</span>
                </div>
                <p className="text-muted-foreground">
                  “₦15,000 arrived from OKOYE C. (GTBank). Who paid you? Tap to link client and
                  confirm.”
                </p>
              </div>
              <div className="rounded-[var(--pw-radius-md)] border border-border bg-muted/40 p-2.5 space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <ChatCircleText className="h-3.5 w-3.5 text-primary" />
                  <span>SMS to Client (No app needed)</span>
                </div>
                <p className="text-muted-foreground">
                  “You paid Emem Bassey ₦15,000. Was this for work? Confirm in 1 tap:
                  proofwork.ng/confirm/tok_confirm_110”
                </p>
              </div>
              <div className="rounded-[var(--pw-radius-md)] border border-border bg-muted/40 p-2.5 space-y-1">
                <span className="font-medium text-foreground block">USSD fallback (mocked)</span>
                <p className="font-mono text-muted-foreground">*242*000*15000#</p>
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
