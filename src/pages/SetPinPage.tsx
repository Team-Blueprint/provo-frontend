import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'reicon-react'
import { api } from '@/api/client'
import { ProvoMark } from '@/components/pw/ProvoMark'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export function SetPinPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialPhone = (searchParams.get('phone') ?? '')
    .replace(/\D/g, '')
    .replace(/^234/, '')
    .replace(/^0+/, '')
    .slice(0, 10)
  const [phone, setPhone] = useState(initialPhone)
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [newPin, setNewPin] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handlePhoneChange(raw: string) {
    setPhone(raw.replace(/\D/g, '').replace(/^0+/, '').slice(0, 10))
  }

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!/^[789][01]\d{8}$/.test(phone)) {
      setError('Enter a valid 10-digit Nigerian number (e.g. 8123456780).')
      return
    }
    setSubmitting(true)
    try {
      await api.requestSetPin(phone)
      setOtpSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send OTP.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSetPin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!otpCode.trim()) {
      setError('Enter the verification code sent to your phone.')
      return
    }
    if (!/^\d{6}$/.test(newPin)) {
      setError('Enter a 6-digit numeric PIN.')
      return
    }
    setSubmitting(true)
    try {
      const res = await api.setPin({
        phone,
        otpCode: otpCode.trim(),
        newPin,
      })
      navigate(res.isClient && !res.isWorker ? '/employer' : '/worker')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not set PIN.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-6 sm:p-12">
      <div className="flex items-center justify-between max-w-md mx-auto w-full">
        <Link
          to="/sign-in"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to sign in</span>
        </Link>
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          <ProvoMark className="h-5 w-5" />
          <span>Provo</span>
        </Link>
      </div>

      <div className="mx-auto w-full max-w-md py-10">
        <Card className="p-6 space-y-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-foreground">
              Set your web login PIN
            </h1>
            <p className="text-sm text-muted-foreground">
              {otpSent
                ? `Enter the code sent to +234 ${phone} (use 123456 in demo mode) and choose a 6-digit PIN.`
                : 'If you registered on the Telegram bot, verify your phone number to set a 6-digit PIN for web sign-in.'}
            </p>
          </div>

          {!otpSent ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="setpin-phone" className="text-sm font-medium text-foreground">
                  Phone number
                </label>
                <div className="flex items-center rounded-[12px] border border-input bg-card px-3.5 focus-within:border-primary">
                  <span className="font-mono text-sm text-muted-foreground pr-3 border-r border-border">
                    +234
                  </span>
                  <input
                    id="setpin-phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    required
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="8123456780"
                    className="w-full bg-transparent px-3 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0"
                  />
                </div>
              </div>

              {error && <p className="text-xs font-medium text-[var(--pw-critical)]">{error}</p>}

              <Button type="submit" disabled={submitting} className="w-full rounded-full py-3">
                <span>{submitting ? 'Sending code...' : 'Send verification code'}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSetPin} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="setpin-otp" className="text-sm font-medium text-foreground">
                  One-time code
                </label>
                <Input
                  id="setpin-otp"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="font-mono tracking-[0.25em]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="setpin-new" className="text-sm font-medium text-foreground">
                  New 6-digit PIN
                </label>
                <Input
                  id="setpin-new"
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="••••••"
                  className="font-mono tracking-[0.25em]"
                />
              </div>

              {error && <p className="text-xs font-medium text-[var(--pw-critical)]">{error}</p>}

              <Button type="submit" disabled={submitting} className="w-full rounded-full py-3">
                <span>{submitting ? 'Saving PIN...' : 'Save PIN & sign in'}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </form>
          )}
        </Card>
      </div>

      <div />
    </div>
  )
}
