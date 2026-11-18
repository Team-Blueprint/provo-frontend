import { useState } from 'react'
import { Check, CheckCircle, Copy, DownloadSquare, Printer, Share, X } from 'reicon-react'
import { formatNaira, formatShortDate, formatTime } from '@/lib/format'
import type { TransactionReceipt } from '@/lib/transactions'
import { ProvoMark } from '@/components/pw/ProvoMark'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface TransactionReceiptModalProps {
  receipt: TransactionReceipt | null
  onClose: () => void
}

function downloadReceiptPng(receipt: TransactionReceipt) {
  const width = 760
  const height = 940
  const canvas = document.createElement('canvas')
  canvas.width = width * 2
  canvas.height = height * 2
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.scale(2, 2)
  ctx.fillStyle = '#F6F9FC'
  ctx.fillRect(0, 0, width, height)

  // Header card
  ctx.fillStyle = '#FFFFFF'
  ctx.strokeStyle = '#E2E8F0'
  ctx.lineWidth = 1.5
  roundRect(ctx, 40, 48, width - 80, 220, 22)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#003170'
  ctx.font = '600 18px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('PROVO VERIFIED RECEIPT', width / 2, 92)

  ctx.fillStyle = '#475569'
  ctx.font = '500 18px sans-serif'
  ctx.fillText(receipt.title, width / 2, 134)

  ctx.fillStyle = '#0F172A'
  ctx.font = '700 44px sans-serif'
  ctx.fillText(`${formatNaira(receipt.amountNaira)}.00`, width / 2, 194)

  ctx.fillStyle = '#1E7B4B'
  ctx.font = '600 16px sans-serif'
  ctx.fillText(`✓ ${receipt.statusLabel}`, width / 2, 236)

  // Details card
  ctx.fillStyle = '#FFFFFF'
  roundRect(ctx, 40, 294, width - 80, 520, 22)
  ctx.fill()
  ctx.stroke()

  ctx.textAlign = 'left'
  ctx.fillStyle = '#0F172A'
  ctx.font = '600 19px sans-serif'
  ctx.fillText('Transaction Details', 72, 342)

  const rows: Array<[string, string]> = []
  if (receipt.creditedTo) rows.push(['Credited to', receipt.creditedTo])
  rows.push([receipt.counterpartyLabel, `${receipt.counterpartyName} · ${receipt.counterpartySub}`])
  rows.push(['Remark', receipt.remark])
  rows.push([
    receipt.perspective === 'worker' ? 'Transaction Type' : 'Payment Method',
    receipt.perspective === 'worker' ? receipt.transactionType : receipt.paymentMethod,
  ])
  rows.push(['Transaction No.', receipt.id])
  rows.push([
    'Transaction Date',
    `${formatShortDate(receipt.transactionDate)} ${formatTime(receipt.transactionDate)}`,
  ])
  if (receipt.sessionRef) rows.push(['Session ID', receipt.sessionRef])

  let y = 396
  for (const [label, value] of rows) {
    ctx.fillStyle = '#64748B'
    ctx.font = '400 15px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(label, 72, y)

    ctx.fillStyle = '#0F172A'
    ctx.font = '500 15px sans-serif'
    ctx.textAlign = 'right'
    const truncated = value.length > 42 ? `${value.slice(0, 39)}...` : value
    ctx.fillText(truncated, width - 72, y)
    y += 54
  }

  ctx.textAlign = 'center'
  ctx.fillStyle = '#64748B'
  ctx.font = '400 13px sans-serif'
  ctx.fillText('Provo · Paga Escrow Settlement Record', width / 2, 868)

  const link = document.createElement('a')
  link.download = `provo-receipt-${receipt.id}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export function TransactionReceiptModal({ receipt, onClose }: TransactionReceiptModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [shared, setShared] = useState(false)

  if (!receipt) return null

  function copyValue(field: string, value: string) {
    navigator.clipboard?.writeText(value)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 1500)
  }

  async function handleShare() {
    if (!receipt) return
    const summary = `${receipt.title}\nAmount: ${formatNaira(receipt.amountNaira)}.00\nStatus: ${receipt.statusLabel}\nTransaction No.: ${receipt.id}\nRemark: ${receipt.remark}`
    if (navigator.share) {
      try {
        await navigator.share({ title: `Provo Receipt ${receipt.id}`, text: summary })
        return
      } catch {
        // Fallback to clipboard copy
      }
    }
    navigator.clipboard?.writeText(summary)
    setShared(true)
    setTimeout(() => setShared(false), 1800)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tx-receipt-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 p-4 overflow-y-auto"
    >
      <div className="w-full max-w-md space-y-3 my-auto">
        <Card className="p-6 space-y-5 shadow-[var(--pw-shadow-sheet)]">
          <div className="flex items-center justify-between no-print">
            <span className="text-xs font-medium text-muted-foreground">Transaction Details</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close receipt"
              className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="rounded-[var(--pw-radius-lg)] border border-border bg-muted/30 p-5 text-center space-y-2">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border shadow-xs">
              <ProvoMark className="h-5 w-5" />
            </div>
            <p id="tx-receipt-title" className="text-sm font-medium text-foreground">
              {receipt.title}
            </p>
            <p className="text-3xl font-bold tabular-nums text-foreground">
              {formatNaira(receipt.amountNaira)}.00
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--pw-positive)]">
              <CheckCircle weight="Filled" className="h-4 w-4" aria-hidden="true" />
              <span>{receipt.statusLabel}</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-sm font-semibold text-foreground">Transaction Details</p>

            {receipt.creditedTo && (
              <div className="flex items-start justify-between gap-4">
                <span className="text-muted-foreground shrink-0">Credited to</span>
                <span className="font-medium text-foreground text-right">{receipt.creditedTo}</span>
              </div>
            )}

            <div className="flex items-start justify-between gap-4">
              <span className="text-muted-foreground shrink-0">{receipt.counterpartyLabel}</span>
              <div className="text-right">
                <p className="font-medium text-foreground">{receipt.counterpartyName}</p>
                <p className="text-muted-foreground">{receipt.counterpartySub}</p>
              </div>
            </div>

            <div className="flex items-start justify-between gap-4">
              <span className="text-muted-foreground shrink-0">Remark</span>
              <span className="font-medium text-foreground text-right">{receipt.remark}</span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <span className="text-muted-foreground shrink-0">
                {receipt.perspective === 'worker' ? 'Transaction Type' : 'Payment Method'}
              </span>
              <span className="font-medium text-foreground text-right">
                {receipt.perspective === 'worker' ? receipt.transactionType : receipt.paymentMethod}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground shrink-0">Transaction No.</span>
              <button
                type="button"
                onClick={() => copyValue('id', receipt.id)}
                className="inline-flex items-center gap-1.5 font-mono text-foreground hover:text-primary cursor-pointer"
              >
                <span>{receipt.id}</span>
                {copiedField === 'id' ? (
                  <Check className="h-3.5 w-3.5 text-[var(--pw-positive)]" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>
            </div>

            <div className="flex items-start justify-between gap-4">
              <span className="text-muted-foreground shrink-0">Transaction Date</span>
              <span className="font-medium text-foreground text-right tabular-nums">
                {formatShortDate(receipt.transactionDate)} {formatTime(receipt.transactionDate)}
              </span>
            </div>

            {receipt.sessionRef && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground shrink-0">Session ID</span>
                <button
                  type="button"
                  onClick={() => copyValue('session', receipt.sessionRef || '')}
                  className="inline-flex items-center gap-1.5 font-mono text-foreground hover:text-primary cursor-pointer"
                >
                  <span>{receipt.sessionRef}</span>
                  {copiedField === 'session' ? (
                    <Check className="h-3.5 w-3.5 text-[var(--pw-positive)]" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border no-print">
            <Button type="button" size="sm" variant="secondary" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Print / PDF</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => downloadReceiptPng(receipt)}
            >
              <DownloadSquare className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Save PNG</span>
            </Button>
            <Button type="button" size="sm" onClick={handleShare}>
              <Share className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{shared ? 'Copied' : 'Share'}</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
