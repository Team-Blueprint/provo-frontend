import { CheckCircle, Printer, Share } from 'reicon-react'
import type { ConfirmationOutcome, TradeType } from '@/api/types'
import { formatShortDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AmountText } from './AmountText'
import { GradeBadge } from './GradeBadge'

interface ReceiptCardProps {
  receiptId: string
  workerName: string
  clientDisplay: string
  amount: number
  trade: TradeType
  outcome: ConfirmationOutcome
  confirmedAt: string
}

export function ReceiptCard({
  receiptId,
  workerName,
  clientDisplay,
  amount,
  trade,
  outcome,
  confirmedAt,
}: ReceiptCardProps) {
  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--pw-success)]">
            <CheckCircle weight="Filled" className="h-4 w-4" aria-hidden="true" />
            <span>Job receipt</span>
          </div>
          <p className="font-mono text-xs text-muted-foreground">{receiptId}</p>
        </div>
        <GradeBadge outcome={outcome} />
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-baseline justify-between">
          <span className="text-muted-foreground">Amount released</span>
          <AmountText amount={amount} size="lg" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-muted-foreground">Worker</span>
          <span className="font-medium text-foreground">{workerName}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-muted-foreground">Employer</span>
          <span className="font-medium text-foreground">{clientDisplay}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-muted-foreground">Trade</span>
          <span className="font-medium text-foreground">{trade}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-muted-foreground">Date</span>
          <span className="font-medium text-foreground">{formatShortDate(confirmedAt)}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-2 no-print">
        <Button
          variant="secondary"
          size="md"
          className="flex-1"
          onClick={() => window.print()}
        >
          <Printer className="h-4 w-4" aria-hidden="true" />
          <span>Print</span>
        </Button>
        <Button
          variant="secondary"
          size="md"
          className="flex-1"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `Provo Receipt ${receiptId}`,
                text: `${workerName} - ${trade} (${receiptId})`,
              })
            }
          }}
        >
          <Share className="h-4 w-4" aria-hidden="true" />
          <span>Share</span>
        </Button>
      </div>
    </Card>
  )
}
