import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Briefcase, Message, Phone, ShieldCheck } from 'reicon-react'
import { api } from '@/api/client'
import { getSession } from '@/api/session'
import { TRADES, type TradeType } from '@/api/types'
import { ProvoMark } from '@/components/pw/ProvoMark'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

interface DemoAccount {
  phoneDisplay: string
  phoneDigits: string
  name: string
  roleLabel: string
  role: 'worker' | 'employer' | 'supervisor'
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    phoneDisplay: '08011112222',
    phoneDigits: '8011112222',
    name: 'Emem Bassey',
    roleLabel: 'WORKER',
    role: 'worker',
  },
  {
    phoneDisplay: '08022223333',
    phoneDigits: '8022223333',
    name: 'Tunde Bakare',
    roleLabel: 'WORKER',
    role: 'worker',
  },
  {
    phoneDisplay: '08077778888',
    phoneDigits: '8077778888',
    name: 'Chief Babatunde Adeleke',
    roleLabel: 'EMPLOYER',
    role: 'employer',
  },
  {
    phoneDisplay: '08099990000',
    phoneDigits: '8099990000',
    name: 'Amina Bello',
    roleLabel: 'EMPLOYER',
    role: 'employer',
  },
  {
    phoneDisplay: '08055556666',
    phoneDigits: '8055556666',
    name: 'Segun Odegbami',
    roleLabel: 'SUPERVISOR',
    role: 'supervisor',
  },
]

export function SignInPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const rawRole = searchParams.get('role')

  useEffect(() => {
    const session = getSession()
    if (!session?.accessToken) return
    const { user } = session
    if (rawRole === 'employer' && user.isClient) {
      navigate('/employer', { replace: true })
      return
    }
    if (rawRole === 'supervisor' && user.isSupervisor) {
      navigate('/supervisor', { replace: true })
      return
    }
    if (rawRole === 'worker' && user.isWorker) {
      navigate('/worker', { replace: true })
      return
    }
    if (user.isWorker) {
      navigate('/worker', { replace: true })
    } else if (user.isClient) {
      navigate('/employer', { replace: true })
    } else if (user.isSupervisor) {
      navigate('/supervisor', { replace: true })
    }
  }, [navigate, rawRole])
  const role: 'worker' | 'employer' | 'supervisor' | null =
    rawRole === 'worker' || rawRole === 'employer' || rawRole === 'supervisor' ? rawRole : null
  const [workerMode, setWorkerMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [trade, setTrade] = useState<TradeType>('Bricklaying')
  const [customTrade, setCustomTrade] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handlePhoneChange(raw: string) {
    const digits = raw.replace(/\D/g, '').replace(/^0+/, '').slice(0, 10)
    setPhone(digits)
  }

  function handlePickDemoAccount(acct: DemoAccount) {
    setError('')
    if (acct.role === 'supervisor') {
      navigate('/supervisor/verify')
      return
    }
    setWorkerMode('login')
    setPhone(acct.phoneDigits)
    setPin('123456')
    setName(acct.name)
    setSearchParams({ role: acct.role })
    if (otpSent) {
      setOtp('123456')
    }
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const isSignup = (role === 'worker' || role === 'employer') && workerMode === 'signup'
    if (isSignup && !name.trim()) {
      setError('Enter your full name.')
      return
    }
    if (!/^[789][01]\d{8}$/.test(phone)) {
      setError('Enter a valid 10-digit Nigerian number (e.g. 8034419210).')
      return
    }
    if (!/^\d{6}$/.test(pin)) {
      setError('Enter a 6-digit numeric PIN.')
      return
    }
    setSubmitting(true)
    try {
      if (isSignup) {
        await api.sendSignupOtp({
          name,
          phone,
          pin,
          role: role === 'employer' ? 'client' : 'worker',
          trade: role === 'worker' ? trade : undefined,
        })
        setOtpSent(true)
        setOtp('')
      } else {
        await api.loginWithPin({ phone, pin })
        if (role === 'employer') {
          navigate('/employer')
        } else if (role === 'supervisor') {
          navigate('/supervisor')
        } else {
          navigate('/worker')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (role === 'employer') {
        await api.verifyWorkerLogin({ phone, otp })
        navigate('/employer')
        return
      }
      if (role === 'supervisor') {
        await api.verifyWorkerLogin({ phone, otp })
        navigate('/supervisor')
        return
      }
      if (workerMode === 'signup') {
        await api.verifyWorkerSignup({
          name,
          phone,
          trade,
          customTrade: trade === 'Others' ? customTrade : undefined,
          otp,
        })
      } else {
        await api.verifyWorkerLogin({ phone, otp })
      }
      navigate('/worker')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed.')
    } finally {
      setSubmitting(false)
    }
  }

  function selectRole(nextRole: 'worker' | 'employer') {
    setSearchParams({ role: nextRole })
    setError('')
  }

  function resetToRolePicker() {
    setSearchParams({})
    setOtpSent(false)
    setOtp('')
    setError('')
  }

  function renderDemoAccountsBox() {
    return (
      <div className="rounded-[18px] bg-muted/65 border border-border/70 p-4 space-y-2.5">
        <div className="flex items-center justify-between px-0.5 text-xs">
          <span className="font-medium text-foreground/85">Demo accounts</span>
          <span className="text-muted-foreground">
            PIN / OTP <span className="font-mono font-semibold text-foreground">123456</span>
          </span>
        </div>

        <div className="space-y-2">
          {DEMO_ACCOUNTS.map((acct) => {
            const isSelected = phone === acct.phoneDigits && role === acct.role
            return (
              <button
                key={acct.phoneDisplay}
                type="button"
                onClick={() => handlePickDemoAccount(acct)}
                className={`w-full rounded-[12px] border px-4 py-3 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-card shadow-xs'
                    : 'border-border/60 bg-card/80 hover:bg-card hover:border-border'
                }`}
              >
                <div className="space-y-0.5">
                  <p className="font-mono text-sm font-semibold text-foreground tabular-nums">
                    {acct.role === 'supervisor' ? 'Site Supervisor Demo' : acct.phoneDisplay}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {acct.role === 'supervisor'
                      ? `${acct.name} · No PIN required`
                      : acct.name}
                  </p>
                </div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  {acct.role === 'supervisor' ? 'SUPERVISOR LINK →' : acct.roleLabel}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  function renderTelegramBotCta() {
    return (
      <a
        href="https://t.me/Provvobot"
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between gap-3 rounded-[14px] border border-primary/25 bg-primary/6 px-4 py-3 text-left hover:border-primary transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Message className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Continue on Telegram Bot</p>
            <p className="text-xs text-muted-foreground">
              Chat with @Provvobot to mark days done or check pay
            </p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
      </a>
    )
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background text-foreground">
      <div className="hidden lg:flex flex-col justify-between bg-foreground text-background p-12">
        <Link to="/" className="flex items-center gap-2 font-semibold text-background">
          <ProvoMark className="h-5 w-5" />
          <span>Provo</span>
        </Link>

        <div className="space-y-6 max-w-lg">
          <p className="font-mono text-xs uppercase tracking-wider text-background/55">
            Field Story · Uyo · 2026
          </p>
          <blockquote className="text-3xl font-semibold leading-snug tracking-tight">
            “Lock the pay upfront, confirm each day in one tap, and Emem gets paid as the work
            gets done.”
          </blockquote>
          <p className="text-sm text-background/70">Emem Ekpo · Bricklayer · Uyo</p>
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
          <a
            href="https://t.me/Provvobot"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <span>Telegram Bot (@Provvobot)</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>

        <div className="mx-auto w-full max-w-md space-y-6 py-8">
          {!role ? (
            <>
              <div className="space-y-2">
                <p className="font-mono text-xs uppercase tracking-wider text-primary font-semibold">
                  Welcome back
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                  Sign into your account
                </h1>
                <p className="text-sm text-muted-foreground">
                  Pick your role or tap a demo account below to pick up where you left off.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => selectRole('worker')}
                  className="w-full rounded-[var(--pw-radius-md)] border border-border bg-card p-4 text-left hover:border-primary transition-colors cursor-pointer flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="rounded-[var(--pw-radius-sm)] bg-secondary p-2.5 text-primary">
                      <Briefcase className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                        01 · Artisans &amp; Tradespeople
                      </p>
                      <p className="text-base font-semibold text-foreground">I do the work</p>
                      <p className="text-xs text-muted-foreground">
                        Accept funded jobs, mark each day done, and get paid to your Paga account.
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                </button>

                <button
                  type="button"
                  onClick={() => selectRole('employer')}
                  className="w-full rounded-[var(--pw-radius-md)] border border-border bg-card p-4 text-left hover:border-primary transition-colors cursor-pointer flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="rounded-[var(--pw-radius-sm)] bg-[var(--pw-warning-tint)] p-2.5 text-[var(--pw-warning)]">
                      <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                        02 · Employers &amp; Contractors
                      </p>
                      <p className="text-base font-semibold text-foreground">I hire &amp; fund work</p>
                      <p className="text-xs text-muted-foreground">
                        Create jobs, lock job pay in Paga, and confirm each day’s work in one
                        tap.
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                </button>
              </div>

              {renderDemoAccountsBox()}
              {renderTelegramBotCta()}
            </>
          ) : !otpSent ? (
            <div className="space-y-6">
              <form onSubmit={handleSendCode} className="space-y-5">
                <div className="space-y-3">
                  {(role === 'worker' || role === 'employer') && (
                    <div className="inline-flex rounded-full border border-border bg-muted/40 p-1">
                      {(['login', 'signup'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => {
                            setWorkerMode(mode)
                            setError('')
                          }}
                          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                            workerMode === mode
                              ? 'bg-card text-foreground shadow-xs'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {mode === 'login' ? 'Log in' : 'Sign up'}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="font-mono text-xs uppercase tracking-wider text-primary font-semibold">
                      {(role === 'worker' || role === 'employer') && workerMode === 'signup'
                        ? 'Get started'
                        : 'Welcome back'}
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                      {role === 'worker' && workerMode === 'signup'
                        ? 'Create your worker profile'
                        : role === 'employer' && workerMode === 'signup'
                          ? 'Create your employer account'
                          : 'Sign into your account'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {role === 'worker' && workerMode === 'signup'
                        ? 'Enter your name, phone number, and trade. We’ll verify with a quick code.'
                        : role === 'employer' && workerMode === 'signup'
                          ? 'Enter your name and phone number. We’ll verify with a quick code.'
                          : 'Your record keeps growing, pick up where you left off.'}
                    </p>
                  </div>
                </div>

                {(role === 'worker' || role === 'employer') && workerMode === 'signup' && (
                  <>
                    <div className="space-y-1.5">
                      <label htmlFor="signup-name" className="text-sm font-medium text-foreground">
                        Full name
                      </label>
                      <Input
                        id="signup-name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={role === 'employer' ? 'Chief Etim' : 'Emem Ekpo'}
                      />
                    </div>

                    {role === 'worker' && (
                      <>
                        <div className="space-y-1.5">
                          <label htmlFor="signup-trade" className="text-sm font-medium text-foreground">
                            Artisan trade
                          </label>
                          <Select
                            id="signup-trade"
                            value={trade}
                            onValueChange={(v) => setTrade(v as TradeType)}
                            options={TRADES.map((t) => ({ value: t, label: t }))}
                          />
                        </div>

                        {trade === 'Others' && (
                          <div className="space-y-1.5">
                            <label
                              htmlFor="signup-custom-trade"
                              className="text-sm font-medium text-foreground"
                            >
                              Specify trade
                            </label>
                            <Input
                              id="signup-custom-trade"
                              required
                              value={customTrade}
                              onChange={(e) => setCustomTrade(e.target.value)}
                              placeholder="e.g. Welding, Tailoring, Auto Mechanic"
                            />
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="signin-phone" className="text-sm font-medium text-foreground">
                    Phone number
                  </label>
                  <div className="flex items-center rounded-[12px] border border-input bg-card px-3.5 focus-within:border-primary">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                    <span className="font-mono text-sm text-muted-foreground pl-2 pr-2.5 border-r border-border">
                      +234
                    </span>
                    <input
                      id="signin-phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={10}
                      required
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="8011112222"
                      className="w-full bg-transparent px-3 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {(role === 'worker' || role === 'employer') && workerMode === 'signup'
                      ? 'We’ll send a 6-digit code to verify your number.'
                      : 'Use the phone number and 6-digit PIN you signed up with.'}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="signin-pin" className="text-sm font-medium text-foreground">
                      6-digit PIN
                    </label>
                    {workerMode === 'login' && (
                      <Link
                        to="/set-pin"
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Registered on Telegram? Set PIN →
                      </Link>
                    )}
                  </div>
                  <Input
                    id="signin-pin"
                    type="password"
                    inputMode="numeric"
                    autoComplete="new-password"
                    maxLength={6}
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••••"
                    className="font-mono tracking-[0.25em]"
                  />
                </div>

                {error && <p className="text-xs font-medium text-[var(--pw-critical)]">{error}</p>}

                <Button type="submit" disabled={submitting} className="w-full rounded-full py-3">
                  <span>
                    {(role === 'worker' || role === 'employer') && workerMode === 'signup'
                      ? submitting
                        ? 'Sending code...'
                        : 'Continue'
                      : submitting
                        ? 'Signing in...'
                        : 'Sign in'}
                  </span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </form>

              {renderDemoAccountsBox()}
              {renderTelegramBotCta()}

              <div className="text-center">
                <button
                  type="button"
                  onClick={resetToRolePicker}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  ← Change role ({role})
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <form onSubmit={handleVerify} className="space-y-5">
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false)
                      setError('')
                    }}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    ← Edit phone number
                  </button>
                  <h1 className="text-2xl font-semibold text-foreground">Enter one-time code</h1>
                  <p className="text-sm text-muted-foreground">
                    Sent to +234 {phone}. Use{' '}
                    <span className="font-mono font-semibold text-foreground">123456</span> for the
                    demo.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="signin-otp" className="text-sm font-medium">
                    6-digit OTP
                  </label>
                  <Input
                    id="signin-otp"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                  />
                </div>

                {error && <p className="text-xs font-medium text-[var(--pw-critical)]">{error}</p>}

                <div className="space-y-2.5">
                  <Button type="submit" disabled={submitting} className="w-full rounded-full py-3">
                    {submitting
                      ? 'Verifying...'
                      : role === 'employer'
                        ? 'Continue to Employer Dashboard'
                        : role === 'supervisor'
                          ? 'Continue to Supervisor Dashboard'
                          : 'Verify & open dashboard'}
                  </Button>
                  <button
                    type="button"
                    onClick={() => api.resendOtp(phone)}
                    className="w-full text-center text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Resend code to +234 {phone}
                  </button>
                </div>
              </form>

              {renderDemoAccountsBox()}
            </div>
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
