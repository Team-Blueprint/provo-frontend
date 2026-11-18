import { useEffect, useState } from 'react'
import { CheckCircle, Receipt, X } from 'reicon-react'
import { api } from '@/api/client'
import type { Worker } from '@/api/types'
import { formatNaira } from '@/lib/format'
import { recordWithdrawalTransaction, type TransactionReceipt } from '@/lib/transactions'
import { TransactionReceiptModal } from '@/components/pw/TransactionReceiptModal'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { toast } from '@/components/ui/toast'

const NIGERIAN_BANKS = [
  'Access Bank',
  'GTBank',
  'Zenith Bank',
  'First Bank',
  'UBA',
  'Paga',
  'OPay',
  'Kuda',
]

interface WorkerWithdrawModalProps {
  open: boolean
  onClose: () => void
  worker: Worker
  availableBalanceNaira: number
  onSuccess: (amountNaira: number, destination: string) => void
}

export function WorkerWithdrawModal({
  open,
  onClose,
  worker,
  availableBalanceNaira,
  onSuccess,
}: WorkerWithdrawModalProps) {
  const [amountInput, setAmountInput] = useState('')
  const [destinationMode, setDestinationMode] = useState<'linked' | 'other'>('linked')
  const [otherBank, setOtherBank] = useState(NIGERIAN_BANKS[0])
  const [otherAccount, setOtherAccount] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [receipt, setReceipt] = useState<{
    amountNaira: number
    destination: string
    message: string
    txReceipt: TransactionReceipt
  } | null>(null)
  const [viewingReceipt, setViewingReceipt] = useState<TransactionReceipt | null>(null)

  useEffect(() => {
    if (!open) return
    setAmountInput(availableBalanceNaira > 0 ? String(availableBalanceNaira) : '')
    setDestinationMode('linked')
    setOtherBank(NIGERIAN_BANKS[0])
    setOtherAccount('')
    setPin('')
    setError('')
    setReceipt(null)
  }, [open, availableBalanceNaira])

  if (!open) return null

  const linkedLabel = `${worker.bankName} · ${worker.bankAccountNumber}`

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const amount = Number(amountInput)
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter a valid withdrawal amount.')
      return
    }
    if (amount > availableBalanceNaira) {
      setError(`Amount cannot exceed your available balance of ${formatNaira(availableBalanceNaira)}.`)
      return
    }
    if (destinationMode === 'other' && !/^\d{10}$/.test(otherAccount)) {
      setError('Enter a valid 10-digit NUBAN account number.')
      return
    }
    if (!/^\d{6}$/.test(pin)) {
      setError('Enter your 6-digit withdrawal PIN.')
      return
    }

    const destination =
      destinationMode === 'linked' ? linkedLabel : `${otherBank} · ${otherAccount}`

    setSubmitting(true)
    try {
      const targetAccount =
        destinationMode === 'other'
          ? otherAccount.trim()
          : worker.bankAccountNumber || worker.pagaAccountNumber
      const targetBank = destinationMode === 'other' ? otherBank : worker.bankName
      const res = await api.ussdWithdraw(worker.phone, amount, {
        accountNumber: targetAccount,
        bankCode: targetBank,
        pin,
      })
      const txReceipt = recordWithdrawalTransaction(worker.id, {
        amountNaira: amount,
        destination,
        message: res.displayText,
      })
      toast.success(
        `${formatNaira(amount)} queued to ${destination}.`,
        'Withdrawal requested',
      )
      setReceipt({
        amountNaira: amount,
        destination,
        message: res.displayText,
        txReceipt,
      })
      onSuccess(amount, destination)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not process withdrawal.'
      setError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="withdraw-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 p-4"
    >
      <Card className="w-full max-w-md p-6 space-y-5 shadow-[var(--pw-shadow-sheet)]">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 id="withdraw-modal-title" className="text-lg font-semibold text-foreground">
              {receipt ? 'Withdrawal queued' : 'Withdraw earnings'}
            </h2>
            <p className="text-xs text-muted-foreground">
              Available balance:{' '}
              <span className="font-semibold text-foreground tabular-nums">
                {formatNaira(availableBalanceNaira)}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close withdrawal modal"
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {receipt ? (
          <div className="space-y-4">
            <div className="rounded-[var(--pw-radius-md)] border border-[var(--pw-positive)]/30 bg-[var(--pw-positive-tint)] p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--pw-positive)]">
                <CheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{formatNaira(receipt.amountNaira)} payout initiated</span>
              </div>
              <p className="text-xs text-foreground">Destination: {receipt.destination}</p>
              <p className="text-xs text-muted-foreground">{receipt.message}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setViewingReceipt(receipt.txReceipt)}
              >
                <Receipt className="h-4 w-4" aria-hidden="true" />
                <span>View receipt</span>
              </Button>
              <Button type="button" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="withdraw-amount" className="text-sm font-medium text-foreground">
                  Amount (₦)
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={availableBalanceNaira <= 0}
                    onClick={() =>
                      setAmountInput(String(Math.max(1, Math.floor(availableBalanceNaira * 0.5))))
                    }
                    className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:border-primary hover:text-foreground disabled:opacity-40 cursor-pointer"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    disabled={availableBalanceNaira <= 0}
                    onClick={() => setAmountInput(String(availableBalanceNaira))}
                    className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:border-primary hover:text-foreground disabled:opacity-40 cursor-pointer"
                  >
                    Max
                  </button>
                </div>
              </div>
              <Input
                id="withdraw-amount"
                type="number"
                min={1}
                max={availableBalanceNaira || undefined}
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="Enter amount in Naira"
                required
              />
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-foreground block">Destination bank</span>
              <div role="radiogroup" className="space-y-2">
                <button
                  type="button"
                  role="radio"
                  aria-checked={destinationMode === 'linked'}
                  onClick={() => setDestinationMode('linked')}
                  className={`w-full min-h-[var(--pw-tap-min)] rounded-[var(--pw-radius-md)] border px-3.5 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                    destinationMode === 'linked'
                      ? 'border-primary bg-secondary text-foreground font-medium'
                      : 'border-border bg-card text-foreground hover:bg-muted'
                  }`}
                >
                  <span className="block">Linked bank account</span>
                  <span className="block text-xs text-muted-foreground">{linkedLabel}</span>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={destinationMode === 'other'}
                  onClick={() => setDestinationMode('other')}
                  className={`w-full min-h-[var(--pw-tap-min)] rounded-[var(--pw-radius-md)] border px-3.5 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                    destinationMode === 'other'
                      ? 'border-primary bg-secondary text-foreground font-medium'
                      : 'border-border bg-card text-foreground hover:bg-muted'
                  }`}
                >
                  Another Nigerian bank account
                </button>
              </div>

              {destinationMode === 'other' && (
                <div className="grid gap-3 pt-1 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label htmlFor="withdraw-bank" className="text-xs font-medium text-muted-foreground">
                      Bank
                    </label>
                    <Select
                      id="withdraw-bank"
                      value={otherBank}
                      onValueChange={setOtherBank}
                      options={NIGERIAN_BANKS.map((bank) => ({ value: bank, label: bank }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="withdraw-nuban" className="text-xs font-medium text-muted-foreground">
                      10-digit NUBAN
                    </label>
                    <Input
                      id="withdraw-nuban"
                      inputMode="numeric"
                      maxLength={10}
                      value={otherAccount}
                      onChange={(e) => setOtherAccount(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="0123456789"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="withdraw-pin" className="text-sm font-medium text-foreground">
                6-digit PIN
              </label>
              <Input
                id="withdraw-pin"
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                required
              />
            </div>

            {error && <p className="text-xs font-medium text-[var(--pw-critical)]">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || availableBalanceNaira <= 0}>
                {submitting ? 'Processing...' : 'Confirm withdrawal'}
              </Button>
            </div>
          </form>
        )}
      </Card>
      <TransactionReceiptModal
        receipt={viewingReceipt}
        onClose={() => setViewingReceipt(null)}
      />
    </div>
  )
}
