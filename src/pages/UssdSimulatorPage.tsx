import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Phone, VolumeCross, VolumeUp } from 'reicon-react'
import { api } from '@/api/client'
import { ApiError } from '@/api/http'
import { getSession } from '@/api/session'
import { TRADES, type EscrowJob, type TradeType, type Worker } from '@/api/types'
import { ProvoMark } from '@/components/pw/ProvoMark'
import { formatNaira } from '@/lib/format'
import { Button } from '@/components/ui/button'

type UssdScreen =
  | 'dialer'
  | 'home'
  | 'create_account'
  | 'balance'
  | 'pending_jobs'
  | 'withdraw'
  | 'result'

type RegStep = 'name' | 'trade' | 'pin'

function formatUssdNaira(val: string) {
  return val.startsWith('₦') ? val : `₦${val}`
}

const DTMF_FREQS: Record<string, [number, number]> = {
  '1': [697, 1209],
  '2': [697, 1336],
  '3': [697, 1477],
  '4': [770, 1209],
  '5': [770, 1336],
  '6': [770, 1477],
  '7': [852, 1209],
  '8': [852, 1336],
  '9': [852, 1477],
  '*': [941, 1209],
  '0': [941, 1336],
  '#': [941, 1477],
  select: [770, 1477],
  back: [697, 1209],
}

export function UssdSimulatorPage() {
  const [dialInput, setDialInput] = useState('*123#')
  const [screen, setScreen] = useState<UssdScreen>('home')
  const [selectedIndex, setSelectedIndex] = useState<number>(1)
  const [message, setMessage] = useState('')
  const [worker, setWorker] = useState<Worker | null>(null)
  const [jobs, setJobs] = useState<EscrowJob[]>([])
  const [soundOn, setSoundOn] = useState(true)
  const [pressedKey, setPressedKey] = useState<string | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const [simPhone, setSimPhone] = useState<string>(
    () => getSession()?.user.phone || '+2348011112222',
  )
  const [phoneInput, setPhoneInput] = useState<string>(
    () => getSession()?.user.phone || '+2348011112222',
  )
  const [ussdError, setUssdError] = useState<string>('')
  const [isUnregistered, setIsUnregistered] = useState(false)
  const [regStep, setRegStep] = useState<RegStep>('name')
  const [regName, setRegName] = useState('')
  const [regTrade, setRegTrade] = useState<TradeType>('Bricklaying')
  const [regPin, setRegPin] = useState('')
  const [regBusy, setRegBusy] = useState(false)
  const [regError, setRegError] = useState('')
  const [withdrawStep, setWithdrawStep] = useState<'menu' | 'account' | 'pin'>('menu')
  const [withdrawUseOther, setWithdrawUseOther] = useState(false)
  const [withdrawBank, setWithdrawBank] = useState('044')
  const [withdrawAccount, setWithdrawAccount] = useState('')
  const [withdrawPin, setWithdrawPin] = useState('')
  const [withdrawError, setWithdrawError] = useState('')
  const [withdrawBusy, setWithdrawBusy] = useState(false)
  const [ussdSummary, setUssdSummary] = useState<{
    phone: string
    workerName: string
    trade: string
    earnedNaira: string
    availableBalanceKobo: number
    availableBalanceNaira: string
    pagaAccount: string
    balanceDisplayText: string
    pendingDisplayText: string
    pendingJobs: Array<{
      jobId: string
      trade: string
      description: string
      totalNaira: string
      currentDay: number
      totalDays: number
      dayStatus: string
    }>
  } | null>(null)

  async function refresh(targetPhone = simPhone) {
    setUssdError('')
    setIsUnregistered(false)
    try {
      const [bal, pending] = await Promise.all([
        api.getUssdBalance(targetPhone),
        api.getUssdPendingJobs(targetPhone),
      ])
      setUssdSummary({
        phone: bal.phone,
        workerName: bal.workerName,
        trade: bal.trade,
        earnedNaira: bal.totalEarnedNaira,
        availableBalanceKobo: bal.availableBalanceKobo,
        availableBalanceNaira: bal.availableBalanceNaira,
        pagaAccount: bal.pagaAccountNumber,
        balanceDisplayText: bal.displayText,
        pendingDisplayText: pending.displayText,
        pendingJobs: pending.jobs,
      })
      setWorker((prev) => ({
        ...(prev ?? {
          id: '',
          slug: '',
          name: bal.workerName,
          phone: bal.phone,
          trade: 'Bricklaying',
          area: 'Nigeria',
          bankName: 'Paga',
          bankAccountNumber: bal.pagaAccountNumber,
          pagaAccountNumber: bal.pagaAccountNumber,
          telegramHandle: '',
          available: true,
        }),
        name: bal.workerName,
        phone: bal.phone,
        pagaAccountNumber: bal.pagaAccountNumber,
      }))
    } catch (err) {
      setUssdSummary(null)
      const notFound =
        (err instanceof ApiError && err.status === 404) ||
        (err instanceof Error && err.message.toLowerCase().includes('not registered'))
      if (notFound) {
        setIsUnregistered(true)
        setUssdError('')
      } else {
        setUssdError(
          err instanceof Error ? err.message : 'Could not load USSD data for this number.',
        )
      }
      if (getSession()?.accessToken) {
        const dash = await api.getWorkerDashboard().catch(() => null)
        if (dash) {
          setWorker(dash.worker)
          setJobs(dash.jobs)
        }
      }
    }
  }

  useEffect(() => {
    refresh(simPhone)
    const handler = () => refresh(simPhone)
    window.addEventListener('proofwork:demo-updated', handler)
    return () => window.removeEventListener('proofwork:demo-updated', handler)
  }, [simPhone])

  function playKeyTone(key: string) {
    if (!soundOn || typeof window === 'undefined') return
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!Ctx) return
      if (!audioCtxRef.current) {
        audioCtxRef.current = new Ctx()
      }
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') {
        ctx.resume()
      }
      const [f1, f2] = DTMF_FREQS[key] ?? [770, 1336]
      const now = ctx.currentTime
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()

      osc1.type = 'sine'
      osc2.type = 'sine'
      osc1.frequency.setValueAtTime(f1, now)
      osc2.frequency.setValueAtTime(f2, now)

      gain.gain.setValueAtTime(0.06, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)

      osc1.start(now)
      osc2.start(now)
      osc1.stop(now + 0.09)
      osc2.stop(now + 0.09)
    } catch {
      // Ignore audio errors when blocked by browser policy
    }
  }

  function flashKey(id: string) {
    setPressedKey(id)
    setTimeout(() => setPressedKey((prev) => (prev === id ? null : prev)), 140)
  }

  const activeJob = jobs.find((j) => j.status === 'IN_PROGRESS' || j.status === 'FUNDED')
  const pendingDay = activeJob?.days.find((d) => d.status === 'PENDING')
  const reportedDay = activeJob?.days.find((d) => d.status === 'DONE_REPORTED')

  const totalPaidKobo = jobs
    .flatMap((j) => j.days)
    .filter((d) => d.status === 'PAID' || d.status === 'CONFIRMED')
    .reduce((acc, d) => acc + d.amountKobo, 0)

  const lockedKobo = jobs
    .filter((j) => j.status === 'FUNDED' || j.status === 'IN_PROGRESS')
    .flatMap((j) => j.days)
    .filter((d) => d.status === 'PENDING' || d.status === 'DONE_REPORTED')
    .reduce((acc, d) => acc + d.amountKobo, 0)

  async function handleKeyPress(key: string) {
    playKeyTone(key)
    flashKey(key)

    if (screen === 'dialer') {
      if (key === '#' && (dialInput + '#').includes('*123#')) {
        setDialInput('*123#')
        setScreen('home')
        return
      }
      setDialInput((prev) => (prev.length < 14 ? prev + key : prev))
      return
    }

    if (screen === 'home') {
      if (isUnregistered) {
        if (key === '1') {
          setRegStep('name')
          setRegName('')
          setRegPin('')
          setRegError('')
          setScreen('create_account')
        }
        return
      }
      if (key === '1') {
        setSelectedIndex(1)
        setScreen('balance')
      } else if (key === '2') {
        setSelectedIndex(2)
        setScreen('pending_jobs')
      } else if (key === '3') {
        setSelectedIndex(3)
        setWithdrawStep('menu')
        setWithdrawUseOther(false)
        setWithdrawAccount('')
        setWithdrawPin('')
        setWithdrawError('')
        setScreen('withdraw')
      }
      return
    }

    if (screen === 'create_account') {
      if (key === '0') {
        setScreen('home')
        return
      }
      if (regStep === 'trade') {
        const idx = Number(key) - 1
        if (!Number.isNaN(idx) && idx >= 0 && idx < TRADES.length) {
          setRegTrade(TRADES[idx])
          setRegError('')
          setRegStep('pin')
        }
      } else if (regStep === 'pin' && /^\d$/.test(key)) {
        setRegPin((prev) => (prev.length < 6 ? prev + key : prev))
      }
      return
    }

    if (screen === 'pending_jobs') {
      if (key === '0') {
        setScreen('home')
        return
      }
      const choiceIdx = Number(key) - 1
      const pickedUssdJob =
        !Number.isNaN(choiceIdx) && choiceIdx >= 0
          ? ussdSummary?.pendingJobs[choiceIdx]
          : undefined
      if (pickedUssdJob) {
        try {
          const res = await api.ussdReportDone(simPhone, pickedUssdJob.jobId)
          await refresh(simPhone)
          setMessage(res.displayText)
        } catch (err) {
          setMessage(err instanceof Error ? err.message : 'Could not report day done.')
        }
        setScreen('result')
      } else if (key === '1' && activeJob && pendingDay) {
        await api.markDayDone(activeJob.id, pendingDay.dayNumber)
        await refresh(simPhone)
        setMessage(
          `Day ${pendingDay.dayNumber} marked DONE (${formatNaira(Math.round(pendingDay.amountKobo / 100))}). 24h window started.`,
        )
        setScreen('result')
      } else if (key === '2' && activeJob && reportedDay) {
        await api.confirmDay(activeJob.id, reportedDay.dayNumber, 'client')
        await refresh(simPhone)
        setMessage(
          `Day ${reportedDay.dayNumber} confirmed! ${formatNaira(Math.round(reportedDay.amountKobo / 100))} paid to ${activeJob.workerName}.`,
        )
        setScreen('result')
      }
      return
    }

    if (screen === 'withdraw') {
      if (key === '0') {
        if (withdrawStep === 'menu') {
          setScreen('home')
        } else {
          setWithdrawStep('menu')
          setWithdrawError('')
        }
        return
      }
      if (withdrawStep === 'menu') {
        if (key === '1') {
          setWithdrawUseOther(false)
          setWithdrawPin('')
          setWithdrawError('')
          setWithdrawStep('pin')
        } else if (key === '2') {
          setWithdrawUseOther(true)
          setWithdrawAccount('')
          setWithdrawError('')
          setWithdrawStep('account')
        }
      } else if (withdrawStep === 'account' && /^\d$/.test(key)) {
        setWithdrawAccount((prev) => (prev.length < 10 ? prev + key : prev))
      } else if (withdrawStep === 'pin' && /^\d$/.test(key)) {
        setWithdrawPin((prev) => (prev.length < 6 ? prev + key : prev))
      }
      return
    }

    if (key === '0') {
      setScreen('home')
    }
  }

  async function handleSubmitPinForRegistration() {
    if (!/^\d{6}$/.test(regPin)) {
      setRegError('Enter a 6-digit numeric PIN.')
      return
    }
    setRegBusy(true)
    setRegError('')
    try {
      await api.ussdRegister({
        phone: simPhone,
        name: regName.trim(),
        trade: regTrade,
        pin: regPin,
      })
      setIsUnregistered(false)
      await refresh(simPhone)
      setMessage(`Account created for ${regName.trim()} (${regTrade}). You can now check balance and jobs.`)
      setScreen('result')
    } catch (err) {
      setRegError(err instanceof Error ? err.message : 'Could not create account.')
    } finally {
      setRegBusy(false)
    }
  }

  async function handleConfirmWithdraw() {
    if (!/^\d{6}$/.test(withdrawPin)) {
      setWithdrawError('Enter your 6-digit PIN.')
      return
    }
    const availableNaira = ussdSummary
      ? Math.round(ussdSummary.availableBalanceKobo / 100)
      : Math.round(totalPaidKobo / 100)
    if (availableNaira <= 0) {
      setWithdrawError('No available balance to withdraw yet.')
      return
    }
    setWithdrawBusy(true)
    setWithdrawError('')
    try {
      const targetAccount = withdrawUseOther
        ? withdrawAccount.trim()
        : ussdSummary?.pagaAccount || worker?.pagaAccountNumber || ''
      const res = await api.ussdWithdraw(simPhone, availableNaira, {
        accountNumber: targetAccount,
        bankCode: withdrawUseOther ? withdrawBank : undefined,
        pin: withdrawPin,
      })
      await refresh(simPhone)
      setMessage(res.displayText)
      setScreen('result')
    } catch (err) {
      setWithdrawError(err instanceof Error ? err.message : 'Could not process withdrawal.')
    } finally {
      setWithdrawBusy(false)
    }
  }

  function handleSelectSoftkey() {
    playKeyTone('select')
    flashKey('select')
    if (screen === 'dialer') {
      setScreen('home')
      return
    }
    if (screen === 'home') {
      handleKeyPress(String(selectedIndex))
      return
    }
    if (screen === 'pending_jobs' || screen === 'withdraw') {
      handleKeyPress('1')
      return
    }
    setScreen('home')
  }

  function handleBackSoftkey() {
    playKeyTone('back')
    flashKey('back')
    if (screen === 'dialer') {
      setDialInput((prev) => prev.slice(0, -1))
      return
    }
    if (screen === 'home') {
      setScreen('dialer')
      return
    }
    setScreen('home')
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-10">
      <div className="sticky top-4 z-30 mx-auto max-w-5xl px-4">
        <header className="flex items-center justify-between rounded-full border border-border bg-card/90 px-5 py-2.5 backdrop-blur-md shadow-[var(--pw-shadow-card)]">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            <ProvoMark className="h-5 w-5" />
            <span>Provo</span>
          </Link>

          <button
            type="button"
            onClick={() => setSoundOn((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-foreground hover:bg-muted cursor-pointer transition-colors"
          >
            {soundOn ? (
              <VolumeUp className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            ) : (
              <VolumeCross className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            )}
            <span>{soundOn ? 'Keypad sound: On' : 'Keypad sound: Muted'}</span>
          </button>
        </header>
      </div>

      <main className="mx-auto max-w-5xl px-4 sm:px-8 py-6 sm:py-8 grid gap-8 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-6 space-y-5">
          <div className="space-y-2">
            <p className="font-mono text-xs uppercase tracking-wider text-primary">
              USSD Simulator
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
              Try <span className="font-mono text-primary">*123#</span> in the simulator
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Artisans without a smartphone or mobile data use this menu to report finished work
              days and move paid wages to their bank account. Press the keys on the phone to try it.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (phoneInput.trim()) {
                setSimPhone(phoneInput.trim())
                setScreen('home')
              }
            }}
            className="rounded-[14px] border border-border bg-card p-3.5 space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                <Phone className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                <span>Dialing USSD from number</span>
              </span>
              {ussdSummary && (
                <span className="font-mono text-[11px] text-primary font-semibold">
                  {ussdSummary.workerName} · {ussdSummary.trade}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="+2348123456780"
                aria-label="USSD phone number"
                className="flex-1 rounded-[8px] border border-input bg-background px-3 py-1.5 font-mono text-xs sm:text-sm text-foreground focus:border-primary"
              />
              <Button type="submit" size="sm" variant="secondary">
                Use number
              </Button>
            </div>
            {ussdError && <p className="text-[11px] text-[var(--pw-critical)]">{ussdError}</p>}
          </form>

          <div className="flex flex-wrap gap-2.5 pt-1">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                playKeyTone('select')
                setScreen('home')
              }}
            >
              Main menu
            </Button>
            <Link to="/sign-in?role=worker">
              <Button size="sm">Open worker dashboard →</Button>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-full max-w-[240px] sm:max-w-[280px] drop-shadow-[0_32px_65px_rgba(11,22,40,0.35)] select-none">
            <img
              src="/feature-phone.png"
              alt="Feature phone running Provo USSD"
              className="block w-full h-auto pointer-events-none"
            />

            <div className="absolute top-[9.5%] left-[13.5%] right-[13.5%] h-[42.5%] flex flex-col justify-between rounded-[5px] bg-[#0e1518] p-3 sm:p-4 text-left font-sans text-white overflow-hidden border border-white/10">
              <div className="flex items-center justify-between border-b border-white/15 pb-1 text-[10px] sm:text-xs font-mono text-white">
                <span className="inline-flex items-end gap-[1.5px]">
                  <span className="h-[4px] w-[2px] bg-white inline-block" />
                  <span className="h-[6px] w-[2px] bg-white inline-block" />
                  <span className="h-[8px] w-[2px] bg-white inline-block" />
                  <span className="h-[10px] w-[2px] bg-white inline-block" />
                  <span className="ml-1 text-[9px] sm:text-[10px] leading-none">2G</span>
                </span>
                <span className="leading-none">17:41</span>
                <span className="inline-flex items-center gap-0.5">
                  <span className="h-2.5 w-4 rounded-[1px] border border-white bg-white inline-block" />
                  <span className="h-1.5 w-0.5 bg-white inline-block" />
                </span>
              </div>

              <div className="relative flex-1 pr-3 flex flex-col justify-center text-white">
                <p className="mb-1 font-mono text-[9.5px] sm:text-[11px] text-white/75 truncate">
                  SIM: {ussdSummary?.phone || simPhone}
                </p>

                {screen === 'dialer' && (
                  <div className="space-y-1.5 text-center text-white">
                    <p className="text-[11px] sm:text-xs">Dial USSD code</p>
                    <p className="font-mono text-lg sm:text-2xl font-bold tracking-wider">
                      {dialInput || '*123#'}
                    </p>
                    <p className="text-[10px]">Press Call or Select</p>
                  </div>
                )}

                {screen === 'home' && (
                  <div className="space-y-1 text-xs sm:text-[14px] leading-snug font-medium text-white">
                    {isUnregistered ? (
                      <>
                        <p className="font-semibold">Welcome to PROVO</p>
                        <p className="text-[11px] text-white/75">
                          This number is not registered yet.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleKeyPress('1')}
                          className="block w-full text-left rounded-[3px] bg-white/15 px-1.5 py-0.5 font-semibold text-white cursor-pointer"
                        >
                          1. Create account
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold">
                          Welcome to PROVO
                          {ussdSummary?.workerName
                            ? ` (${ussdSummary.workerName.split(' ')[0]})`
                            : ''}
                        </p>
                        {[
                          { num: 1, label: '1. Balance' },
                          { num: 2, label: '2. Pending Jobs' },
                          { num: 3, label: '3. Withdraw' },
                        ].map((item) => (
                          <button
                            key={item.num}
                            type="button"
                            onClick={() => handleKeyPress(String(item.num))}
                            className={`block w-full text-left rounded-[3px] px-1.5 py-0.5 text-white transition-colors cursor-pointer ${
                              selectedIndex === item.num
                                ? 'bg-white/15 font-semibold'
                                : 'hover:bg-white/10'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}

                {screen === 'create_account' && (
                  <div className="space-y-1.5 text-[11px] sm:text-[12.5px] leading-snug text-white">
                    {regStep === 'name' && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          if (regName.trim().length < 2) {
                            setRegError('Enter your full name.')
                            return
                          }
                          setRegError('')
                          setRegStep('trade')
                        }}
                        className="space-y-1.5"
                      >
                        <p className="font-semibold">Create Account (1/3)</p>
                        <p>Enter your full name:</p>
                        <input
                          type="text"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="e.g. Emem Bassey"
                          className="w-full rounded-[3px] border border-white/30 bg-black/40 px-2 py-1 text-xs text-white placeholder:text-white/40 focus:outline-none"
                          autoFocus
                        />
                        {regError && <p className="text-[10px] text-amber-300">{regError}</p>}
                        <div className="flex items-center justify-between pt-0.5">
                          <button
                            type="submit"
                            className="rounded-[3px] bg-white/20 px-2 py-0.5 font-semibold text-white cursor-pointer"
                          >
                            Next
                          </button>
                          <button
                            type="button"
                            onClick={() => setScreen('home')}
                            className="text-white/75 cursor-pointer"
                          >
                            0. Back
                          </button>
                        </div>
                      </form>
                    )}

                    {regStep === 'trade' && (
                      <div className="space-y-1">
                        <p className="font-semibold">Select Trade (2/3)</p>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 max-h-24 overflow-y-auto pr-1 text-[10.5px]">
                          {TRADES.map((t, idx) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => handleKeyPress(String(idx + 1))}
                              className="text-left rounded-[3px] px-1 py-0.5 hover:bg-white/15 text-white cursor-pointer truncate"
                            >
                              {idx + 1}. {t}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => setRegStep('name')}
                          className="text-[10.5px] text-white/75 cursor-pointer"
                        >
                          0. Back
                        </button>
                      </div>
                    )}

                    {regStep === 'pin' && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          handleSubmitPinForRegistration()
                        }}
                        className="space-y-1.5"
                      >
                        <p className="font-semibold">Set 6-digit PIN (3/3)</p>
                        <p className="text-[10.5px] text-white/80">
                          {regName.trim()} · {regTrade}
                        </p>
                        <input
                          type="password"
                          inputMode="numeric"
                          maxLength={6}
                          value={regPin}
                          onChange={(e) =>
                            setRegPin(e.target.value.replace(/\D/g, '').slice(0, 6))
                          }
                          placeholder="••••••"
                          className="w-full rounded-[3px] border border-white/30 bg-black/40 px-2 py-1 font-mono text-xs tracking-widest text-white placeholder:text-white/40 focus:outline-none"
                          autoFocus
                        />
                        {regError && <p className="text-[10px] text-amber-300">{regError}</p>}
                        <div className="flex items-center justify-between pt-0.5">
                          <button
                            type="submit"
                            disabled={regBusy}
                            className="rounded-[3px] bg-white/20 px-2 py-0.5 font-semibold text-white cursor-pointer"
                          >
                            {regBusy ? 'Creating...' : 'Create'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setRegStep('trade')}
                            className="text-white/75 cursor-pointer"
                          >
                            0. Back
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {screen === 'balance' && (
                  <div className="space-y-1 text-[11px] sm:text-[13px] leading-snug text-white">
                    <p className="font-semibold">
                      {ussdSummary?.workerName ?? worker?.name ?? 'Worker'} · Balance
                    </p>
                    <p>
                      Paid out:{' '}
                      {ussdSummary
                        ? formatUssdNaira(ussdSummary.earnedNaira)
                        : formatNaira(Math.round(totalPaidKobo / 100))}
                    </p>
                    {ussdSummary ? (
                      <>
                        <p>Available: {formatUssdNaira(ussdSummary.availableBalanceNaira)}</p>
                        <p>Paga: {ussdSummary.pagaAccount || 'Pending'}</p>
                      </>
                    ) : (
                      <p>Locked pay: {formatNaira(Math.round(lockedKobo / 100))}</p>
                    )}
                    <p className="pt-1">0. Back</p>
                  </div>
                )}

                {screen === 'pending_jobs' && (
                  <div className="space-y-1 text-[11px] sm:text-[12.5px] leading-snug text-white">
                    {ussdSummary ? (
                      <>
                        <p className="font-semibold">
                          Pending Jobs ({ussdSummary.pendingJobs.length})
                        </p>
                        {ussdSummary.pendingJobs.length > 0 ? (
                          <div className="space-y-0.5 max-h-24 overflow-y-auto pr-1">
                            {ussdSummary.pendingJobs.slice(0, 3).map((j, idx) => (
                              <button
                                key={j.jobId}
                                type="button"
                                onClick={() => handleKeyPress(String(idx + 1))}
                                className={`block w-full text-left rounded-[3px] px-1.5 py-0.5 text-white cursor-pointer ${
                                  idx === 0 ? 'bg-white/15 font-semibold' : 'hover:bg-white/10'
                                }`}
                              >
                                {idx + 1}. {j.trade} · Day {j.currentDay}/{j.totalDays} (
                                {formatUssdNaira(j.totalNaira)})
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p>No active jobs right now.</p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="font-semibold">
                          {activeJob ? `${activeJob.clientName} · ${activeJob.trade}` : 'Pending Jobs'}
                        </p>
                        {activeJob && pendingDay ? (
                          <button
                            type="button"
                            onClick={() => handleKeyPress('1')}
                            className="block w-full text-left rounded-[3px] bg-white/15 px-1.5 py-0.5 font-semibold text-white cursor-pointer"
                          >
                            1. Mark Day {pendingDay.dayNumber} Done (
                            {formatNaira(Math.round(pendingDay.amountKobo / 100))})
                          </button>
                        ) : (
                          <p>All days reported done.</p>
                        )}
                        {activeJob && reportedDay && (
                          <button
                            type="button"
                            onClick={() => handleKeyPress('2')}
                            className="block w-full text-left rounded-[3px] hover:bg-white/10 px-1.5 py-0.5 text-white cursor-pointer"
                          >
                            2. Employer: Confirm Day {reportedDay.dayNumber}
                          </button>
                        )}
                      </>
                    )}
                    <p className="pt-0.5">0. Back</p>
                  </div>
                )}

                {screen === 'withdraw' && (
                  <div className="space-y-1 text-[11px] sm:text-[12.5px] leading-snug text-white">
                    {withdrawStep === 'menu' && (
                      <>
                        <p className="font-semibold">
                          Withdraw{' '}
                          {ussdSummary
                            ? formatUssdNaira(ussdSummary.availableBalanceNaira)
                            : formatNaira(Math.round(totalPaidKobo / 100))}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleKeyPress('1')}
                          className="block w-full text-left rounded-[3px] bg-white/15 px-1.5 py-0.5 font-semibold text-white cursor-pointer"
                        >
                          1. Paga ({ussdSummary?.pagaAccount || worker?.pagaAccountNumber || 'Default'})
                        </button>
                        <button
                          type="button"
                          onClick={() => handleKeyPress('2')}
                          className="block w-full text-left rounded-[3px] hover:bg-white/10 px-1.5 py-0.5 text-white cursor-pointer"
                        >
                          2. Other bank account
                        </button>
                        <p className="pt-0.5">0. Back</p>
                      </>
                    )}

                    {withdrawStep === 'account' && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          if (!/^\d{10}$/.test(withdrawAccount)) {
                            setWithdrawError('Enter a 10-digit account number.')
                            return
                          }
                          setWithdrawError('')
                          setWithdrawPin('')
                          setWithdrawStep('pin')
                        }}
                        className="space-y-1"
                      >
                        <p className="font-semibold">Destination Account</p>
                        <select
                          value={withdrawBank}
                          onChange={(e) => setWithdrawBank(e.target.value)}
                          className="w-full rounded-[3px] border border-white/30 bg-black/60 px-1.5 py-0.5 text-[11px] text-white focus:outline-none"
                        >
                          <option value="044">Access Bank</option>
                          <option value="999992">OPay</option>
                          <option value="058">GTBank</option>
                          <option value="033">UBA</option>
                          <option value="50211">Kuda</option>
                          <option value="057">Zenith Bank</option>
                        </select>
                        <input
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          value={withdrawAccount}
                          onChange={(e) =>
                            setWithdrawAccount(e.target.value.replace(/\D/g, '').slice(0, 10))
                          }
                          placeholder="10-digit NUBAN"
                          className="w-full rounded-[3px] border border-white/30 bg-black/40 px-2 py-0.5 font-mono text-xs text-white placeholder:text-white/40 focus:outline-none"
                          autoFocus
                        />
                        {withdrawError && (
                          <p className="text-[10px] text-amber-300">{withdrawError}</p>
                        )}
                        <div className="flex items-center justify-between pt-0.5">
                          <button
                            type="submit"
                            className="rounded-[3px] bg-white/20 px-2 py-0.5 font-semibold text-white cursor-pointer"
                          >
                            Next
                          </button>
                          <button
                            type="button"
                            onClick={() => setWithdrawStep('menu')}
                            className="text-white/75 cursor-pointer"
                          >
                            0. Back
                          </button>
                        </div>
                      </form>
                    )}

                    {withdrawStep === 'pin' && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          handleConfirmWithdraw()
                        }}
                        className="space-y-1.5"
                      >
                        <p className="font-semibold">Enter 6-digit PIN</p>
                        <p className="text-[10.5px] text-white/80 truncate">
                          To:{' '}
                          {withdrawUseOther
                            ? `${withdrawBank} · ${withdrawAccount}`
                            : `Paga · ${ussdSummary?.pagaAccount || worker?.pagaAccountNumber || 'Default'}`}
                        </p>
                        <input
                          type="password"
                          inputMode="numeric"
                          maxLength={6}
                          value={withdrawPin}
                          onChange={(e) =>
                            setWithdrawPin(e.target.value.replace(/\D/g, '').slice(0, 6))
                          }
                          placeholder="••••••"
                          className="w-full rounded-[3px] border border-white/30 bg-black/40 px-2 py-1 font-mono text-xs tracking-widest text-white placeholder:text-white/40 focus:outline-none"
                          autoFocus
                        />
                        {withdrawError && (
                          <p className="text-[10px] text-amber-300">{withdrawError}</p>
                        )}
                        <div className="flex items-center justify-between pt-0.5">
                          <button
                            type="submit"
                            disabled={withdrawBusy}
                            className="rounded-[3px] bg-white/20 px-2 py-0.5 font-semibold text-white cursor-pointer"
                          >
                            {withdrawBusy ? 'Sending...' : 'Confirm'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setWithdrawStep(withdrawUseOther ? 'account' : 'menu')
                            }
                            className="text-white/75 cursor-pointer"
                          >
                            0. Back
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {screen === 'result' && (
                  <div className="space-y-1.5 text-[11px] sm:text-[13px] leading-snug text-white">
                    <p className="font-semibold">Done</p>
                    <p>{message}</p>
                    <p className="pt-1">0. Main menu</p>
                  </div>
                )}

                <div className="absolute right-0 top-1.5 bottom-1.5 w-[3px] bg-white/20 rounded-full">
                  <div className="h-3/5 w-full bg-white rounded-full" />
                </div>
              </div>

              <div className="mt-2 -mx-3 sm:-mx-4 -mb-3 sm:-mb-4 border-t border-white/15 bg-white/10 px-3 py-1.5 flex items-center justify-between text-xs sm:text-sm text-white">
                <span className="w-8" />
                <button
                  type="button"
                  onClick={handleSelectSoftkey}
                  className="font-bold text-white hover:underline cursor-pointer"
                >
                  Select
                </button>
                <button
                  type="button"
                  onClick={handleBackSoftkey}
                  className="text-white hover:underline cursor-pointer"
                >
                  Back
                </button>
              </div>
            </div>

            <button
              type="button"
              aria-label="Left softkey Select"
              onClick={handleSelectSoftkey}
              className={`absolute top-[56.2%] left-[4%] w-[29.5%] h-[6.8%] rounded-[6px] cursor-pointer transition-colors ${
                pressedKey === 'select' ? 'bg-white/25' : 'hover:bg-white/10'
              }`}
            />
            <button
              type="button"
              aria-label="Center D-pad OK"
              onClick={handleSelectSoftkey}
              className={`absolute top-[57.5%] left-[35.5%] w-[28.5%] h-[11.5%] rounded-[14px] cursor-pointer transition-colors ${
                pressedKey === 'select' ? 'bg-white/25' : 'hover:bg-white/10'
              }`}
            />
            <button
              type="button"
              aria-label="Right softkey Back"
              onClick={handleBackSoftkey}
              className={`absolute top-[56.2%] left-[65.2%] w-[29.5%] h-[6.8%] rounded-[6px] cursor-pointer transition-colors ${
                pressedKey === 'back' ? 'bg-white/25' : 'hover:bg-white/10'
              }`}
            />

            <button
              type="button"
              aria-label="Call / Dial"
              onClick={handleSelectSoftkey}
              className={`absolute top-[63.2%] left-[4%] w-[29.5%] h-[7%] rounded-[6px] cursor-pointer transition-colors ${
                pressedKey === 'select' ? 'bg-white/25' : 'hover:bg-white/10 active:bg-white/25'
              }`}
            />
            <button
              type="button"
              aria-label="End / Back"
              onClick={() => {
                playKeyTone('back')
                flashKey('back')
                setScreen('home')
              }}
              className={`absolute top-[63.2%] left-[65.2%] w-[29.5%] h-[7%] rounded-[6px] cursor-pointer transition-colors ${
                pressedKey === 'back' ? 'bg-white/25' : 'hover:bg-white/10 active:bg-white/25'
              }`}
            />

            <div className="absolute top-[70.55%] bottom-[2.4%] left-[3.85%] right-[5.5%] grid grid-cols-3 grid-rows-4 gap-0.5">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-label={`Keypad ${key}`}
                  onClick={() => handleKeyPress(key)}
                  className={`rounded-[6px] cursor-pointer transition-all ${
                    pressedKey === key
                      ? 'bg-white/30 scale-95'
                      : 'hover:bg-white/10 active:bg-white/25'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
