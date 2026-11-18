import { Receipt } from 'reicon-react'
import { formatNaira, formatShortDate, formatTime } from '@/lib/format'
import type { TransactionReceipt } from '@/lib/transactions'
import { EmptyState } from '@/components/pw/EmptyState'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface TransactionHistoryListProps {
  items: TransactionReceipt[]
  onSelect: (receipt: TransactionReceipt) => void
  emptyDescription: string
}

export function TransactionHistoryList({
  items,
  onSelect,
  emptyDescription,
}: TransactionHistoryListProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No transactions yet"
        description={emptyDescription}
      />
    )
  }

  return (
    <Card className="divide-y divide-border overflow-hidden">
      {items.map((item) => {
        const isCredit = item.perspective === 'worker' && item.kind !== 'withdrawal'
        return (
          <div
            key={item.id}
            className="p-4 sm:px-5 flex flex-wrap items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
          >
            <div className="min-w-0 space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                <span className="rounded-full bg-[var(--pw-positive-tint)] px-2 py-0.5 text-[11px] font-medium text-[var(--pw-positive)]">
                  {item.transactionType}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{item.remark}</p>
              <p className="text-[11px] text-muted-foreground tabular-nums">
                {formatShortDate(item.transactionDate)} · {formatTime(item.transactionDate)} ·{' '}
                <span className="font-mono">{item.id}</span>
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span
                className={`text-sm font-semibold tabular-nums ${
                  isCredit ? 'text-[var(--pw-positive)]' : 'text-foreground'
                }`}
              >
                {isCredit ? '+' : ''}
                {formatNaira(item.amountNaira)}
              </span>
              <Button size="sm" variant="secondary" onClick={() => onSelect(item)}>
                <Receipt className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Receipt</span>
              </Button>
            </div>
          </div>
        )
      })}
    </Card>
  )
}
