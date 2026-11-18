import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'
import { Check, CheckCircle, Copy, DownloadSquare, Share, X } from 'reicon-react'
import { formatNaira, formatShortDate, formatTime } from '@/lib/format'
import type { TransactionReceipt } from '@/lib/transactions'
import { ProvoMark } from '@/components/pw/ProvoMark'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from '@/components/ui/toast'

interface TransactionReceiptModalProps {
  receipt: TransactionReceipt | null
  onClose: () => void
}

export function TransactionReceiptModal({ receipt, onClose }: TransactionReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [shared, setShared] = useState(false)
  const [exporting, setExporting] = useState<'png' | 'pdf' | null>(null)

  if (!receipt) return null

  function copyValue(field: string, value: string) {
    navigator.clipboard?.writeText(value)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 1500)
  }

  async function captureReceiptPng() {
    if (!receiptRef.current) throw new Error('Receipt is not ready to export.')
    return toPng(receiptRef.current, {
      pixelRatio: 3,
      backgroundColor: '#ffffff',
      cacheBust: true,
    })
  }

  async function handleDownloadPng() {
    if (!receipt) return
    setExporting('png')
    try {
      const dataUrl = await captureReceiptPng()
      const link = document.createElement('a')
      link.download = `provo-receipt-${receipt.id}.png`
      link.href = dataUrl
      link.click()
    } catch {
      toast.error('Could not generate PNG receipt.')
    } finally {
      setExporting(null)
    }
  }

  async function handleDownloadPdf() {
    if (!receipt || !receiptRef.current) return
    setExporting('pdf')
    try {
      const dataUrl = await captureReceiptPng()
      const rect = receiptRef.current.getBoundingClientRect()
      const pad = 28
      const pdfWidth = Math.max(360, Math.round(rect.width) + pad * 2)
      const pdfHeight = Math.round(rect.height) + pad * 2
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [pdfWidth, pdfHeight],
      })
      pdf.addImage(dataUrl, 'PNG', pad, pad, rect.width, rect.height)
      pdf.save(`provo-receipt-${receipt.id}.pdf`)
    } catch {
      toast.error('Could not generate PDF receipt.')
    } finally {
      setExporting(null)
    }
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
        <Card className="p-5 sm:p-6 space-y-4 shadow-[var(--pw-shadow-sheet)]">
          <div className="flex items-center justify-between">
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

          <div ref={receiptRef} className="rounded-[var(--pw-radius-lg)] bg-card p-1 space-y-4">
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

            <div className="space-y-3 px-1 text-xs">
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

              <p className="pt-2 border-t border-border text-center text-[11px] text-muted-foreground">
                Provo · Paga Escrow Settlement Record
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={exporting !== null}
              onClick={handleDownloadPdf}
            >
              <DownloadSquare className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{exporting === 'pdf' ? 'Saving...' : 'Save PDF'}</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={exporting !== null}
              onClick={handleDownloadPng}
            >
              <DownloadSquare className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{exporting === 'png' ? 'Saving...' : 'Save PNG'}</span>
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
