import { useState } from 'react'
import { DISPUTE_REASONS, type DisputeReason } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface DisputeDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (reason: DisputeReason) => Promise<void>
}

export function DisputeDialog({ open, onClose, onSubmit }: DisputeDialogProps) {
  const [reason, setReason] = useState<DisputeReason>(DISPUTE_REASONS[0])
  const [submitting, setSubmitting] = useState(false)

  if (!open) return null

  async function handleConfirm() {
    setSubmitting(true)
    try {
      await onSubmit(reason)
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dispute-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 p-4"
    >
      <Card className="w-full max-w-md p-5 space-y-4 shadow-[var(--pw-shadow-sheet)]">
        <div className="space-y-1">
          <h2 id="dispute-title" className="text-lg font-medium text-foreground">
            Dispute this day’s work
          </h2>
          <p className="text-sm text-muted-foreground">
            Disputed days are held safely and excluded from the worker’s score while reviewed.
          </p>
        </div>

        <div role="radiogroup" className="space-y-2">
          {DISPUTE_REASONS.map((item) => (
            <button
              key={item}
              type="button"
              role="radio"
              aria-checked={reason === item}
              onClick={() => setReason(item)}
              className={`w-full min-h-[var(--pw-tap-min)] rounded-[var(--pw-radius-md)] border px-3.5 py-2 text-left text-sm font-medium cursor-pointer ${
                reason === item
                  ? 'border-primary bg-secondary text-foreground'
                  : 'border-border bg-card text-foreground hover:bg-muted'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex gap-2 pt-1">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            loading={submitting}
            onClick={handleConfirm}
          >
            Submit dispute
          </Button>
        </div>
      </Card>
    </div>
  )
}
