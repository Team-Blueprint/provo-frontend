import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle, Clock, ShieldCheck } from '@phosphor-icons/react'
import { api } from '@/api/client'
import type { JobType, PaymentRequestSession } from '@/api/types'
import { messages } from '@/messages/en'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { AmountText } from '@/components/pw/AmountText'
import { JobTypePicker } from '@/components/pw/JobTypePicker'
import { OfflineBanner } from '@/components/pw/OfflineBanner'
import { ReceiptCard } from '@/components/pw/ReceiptCard'

export function PayLinkPage() {
  const { workerSlug = 'emem-uyo' } = useParams()
  const [step, setStep] = useState<'form' | 'otp' | 'pay'>('form')
  const [amount, setAmount] = useState('25000')
  const [jobType, setJobType] = useState<JobType>('Bricklaying')
  const [payerName, setPayerName] = useState('')
  const [payerPhone, setPayerPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [session, setSession] = useState<PaymentRequestSession | null>(null)
  const [loading, setLoading] = useState(false)

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!Number(amount) || !payerName.trim() || !payerPhone.trim()) return
    setStep('otp')
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (otp.trim().length < 4) {
      setOtpError('Enter the 4-digit code (use 1234 in demo).')
      return
    }
    setOtpError('')
    setLoading(true)
    const created = await api.createPaymentRequest(
      workerSlug,
      Number(amount),
      jobType,
      payerName.trim(),
      payerPhone.trim(),
    )
    setSession(created)
    setLoading(false)
    setStep('pay')
  }

  async function handleSimulatePaid() {
    if (!session) return
    setLoading(true)
    const updated = await api.completePaymentRequest(session.referenceNumber)
    setSession(updated)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <OfflineBanner />
      <main className="mx-auto max-w-md px-4 py-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">Pay Emem Bassey</h1>
          <p className="text-sm text-muted-foreground">Bricklayer · Verified Paga link</p>
        </div>

        {step === 'form' && (
          <Card className="p-5">
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="pay-amount" className="text-sm font-medium">
                  Amount (₦)
                </label>
                <Input
                  id="pay-amount"
                  type="number"
                  inputMode="numeric"
                  required
                  min={500}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <JobTypePicker value={jobType} onChange={setJobType} />

              <div className="space-y-1.5">
                <label htmlFor="pay-name" className="text-sm font-medium">
                  Your name
                </label>
                <Input
                  id="pay-name"
                  required
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  placeholder="e.g. Adaobi Nwachukwu"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="pay-phone" className="text-sm font-medium">
                  Your phone number
                </label>
                <Input
                  id="pay-phone"
                  type="tel"
                  required
                  value={payerPhone}
                  onChange={(e) => setPayerPhone(e.target.value)}
                  placeholder="0803 000 0000"
                />
              </div>

              <Button type="submit" className="w-full">
                Continue to verify phone
              </Button>
            </form>
          </Card>
        )}

        {step === 'otp' && (
          <Card className="p-5 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-medium">Verify your phone</h2>
              <p className="text-sm text-muted-foreground">
                We sent a 4-digit code to {payerPhone}. (Demo code: <span className="font-mono">1234</span>)
              </p>
            </div>
            <form onSubmit={handleOtpSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="pay-otp" className="text-sm font-medium">
                  One-time code
                </label>
                <Input
                  id="pay-otp"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  error={otpError}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="1234"
                />
                {otpError && (
                  <p role="alert" className="text-xs text-destructive">
                    {otpError}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" loading={loading}>
                Verify &amp; get payment details
              </Button>
            </form>
          </Card>
        )}

        {step === 'pay' && session && (
          <div aria-live="polite" className="space-y-4">
            {session.state === 'pending' && (
              <Card className="p-5 space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-[var(--pw-warning)]">
                  <Clock weight="fill" className="h-4 w-4" aria-hidden="true" />
                  <span>{messages.payment.pending}</span>
                </div>

                <div className="rounded-[var(--pw-radius-md)] border border-border bg-muted/40 p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <AmountText amount={session.amount} size="lg" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transfer to</span>
                    <span className="font-mono font-semibold">{session.pagaTransferAccount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bank</span>
                    <span className="font-medium">{session.pagaTransferBank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">USSD</span>
                    <span className="font-mono">{session.ussdCode}</span>
                  </div>
                </div>

                <Button className="w-full" loading={loading} onClick={handleSimulatePaid}>
                  <CheckCircle className="h-4 w-4" aria-hidden="true" />
                  <span>Simulate Paga payment complete</span>
                </Button>
              </Card>
            )}

            {session.state === 'paid' && session.receiptId && (
              <ReceiptCard
                receiptId={session.receiptId}
                workerName={session.workerName}
                clientDisplay={session.payerName}
                amount={session.amount}
                jobType={session.jobType}
                grade={1}
                confirmedAt={new Date().toISOString()}
              />
            )}
          </div>
        )}

        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
          <span>{messages.confirm.recordedNotice('Emem Bassey')}</span>
        </p>
      </main>
    </div>
  )
}
