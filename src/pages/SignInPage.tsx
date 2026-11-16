import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Bank, Briefcase } from 'reicon-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function SignInPage() {
  const navigate = useNavigate()
  const [role, setRole] = useState<'worker' | 'lender' | null>(null)
  const [phone, setPhone] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')

  function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    if (!phone.trim()) return
    setOtpSent(true)
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (role === 'lender') {
      navigate('/report/rep_emem_lapo_2026')
    } else {
      navigate('/worker')
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background text-foreground">
      <div className="hidden lg:flex flex-col justify-between bg-foreground text-background p-12">
        <Link to="/" className="flex items-center gap-2 font-semibold text-background">
          <span
            className="inline-block h-3 w-3 rounded-[3px] bg-[var(--pw-brick)]"
            aria-hidden="true"
          />
          <span>Proofwork</span>
        </Link>

        <div className="space-y-6 max-w-lg">
          <p className="font-mono text-xs uppercase tracking-wider text-background/55">
            Field Interview · Uyo · 2026
          </p>
          <blockquote className="text-3xl font-semibold leading-snug tracking-tight">
            “When Emem brings a bank statement, I see ₦40,000 deposits—I can’t tell a bricklaying
            job from a birthday gift.”
          </blockquote>
          <p className="text-sm text-background/70">
            Loan Officer · Microfinance Partner
          </p>
        </div>

        <div className="flex items-center justify-between font-mono text-xs text-background/50">
          <span>REAL WORK, COUNTED.</span>
          <span>PAGAENGINE · V0.1</span>
        </div>
      </div>

      <div className="flex flex-col justify-between p-6 sm:p-12">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back</span>
          </Link>
          <Link to="/worker" className="text-xs font-medium text-primary hover:underline">
            Skip to demo →
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md space-y-6 py-10">
          {!role ? (
            <>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                  Are you here to do the work, or to underwrite it?
                </h1>
                <p className="text-sm text-muted-foreground">
                  Pick a side and we’ll open the right surface. You can switch at any time.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setRole('worker')}
                  className="w-full rounded-[var(--pw-radius-md)] border border-border bg-card p-5 text-left hover:border-primary transition-colors cursor-pointer flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="rounded-[var(--pw-radius-sm)] bg-secondary p-2.5 text-primary">
                      <Briefcase className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                        01 · Artisans &amp; Tradespeople
                      </p>
                      <p className="text-base font-semibold text-foreground">I do the work</p>
                      <p className="text-xs text-muted-foreground">
                        Get a dedicated Paga NUBAN, send payment links, and build a verified income
                        record.
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                </button>

                <button
                  type="button"
                  onClick={() => setRole('lender')}
                  className="w-full rounded-[var(--pw-radius-md)] border border-border bg-card p-5 text-left hover:border-primary transition-colors cursor-pointer flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="rounded-[var(--pw-radius-sm)] bg-[var(--pw-warning-tint)] p-2.5 text-[var(--pw-warning)]">
                      <Bank className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                        02 · Microfinance &amp; Fintechs
                      </p>
                      <p className="text-base font-semibold text-foreground">I underwrite loans</p>
                      <p className="text-xs text-muted-foreground">
                        Inspect consented income reports, evidence grades, and Ed25519-signed
                        snapshots.
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                </button>
              </div>
            </>
          ) : !otpSent ? (
            <form onSubmit={handleSendCode} className="space-y-5">
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setRole(null)}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  ← Change role ({role})
                </button>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                  Pick up where you left it.
                </h1>
                <p className="text-sm text-muted-foreground">
                  We’ll send a one-time code to your phone. No password.
                </p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="signin-phone" className="text-sm font-medium text-foreground">
                  Phone number
                </label>
                <div className="flex items-center rounded-[var(--pw-radius-sm)] border border-input bg-card px-3 focus-within:border-primary">
                  <span className="font-mono text-sm text-muted-foreground pr-2.5 border-r border-border">
                    +234
                  </span>
                  <input
                    id="signin-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="803 000 0000"
                    className="w-full bg-transparent px-3 py-2.5 text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full rounded-full">
                <span>Send code</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5">
              <div className="space-y-1.5">
                <h1 className="text-2xl font-semibold text-foreground">Enter one-time code</h1>
                <p className="text-sm text-muted-foreground">
                  Sent to +234 {phone}. (Use <span className="font-mono">1234</span> in demo)
                </p>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="signin-otp" className="text-sm font-medium">
                  4-digit code
                </label>
                <Input
                  id="signin-otp"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="1234"
                />
              </div>
              <Button type="submit" className="w-full rounded-full">
                Continue to {role === 'lender' ? 'Lender Report' : 'Worker Dashboard'}
              </Button>
            </form>
          )}
        </div>

        <div className="text-xs text-muted-foreground flex items-center justify-between">
          <span>NDPA consent-gated</span>
          <Link to="/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  )
}
