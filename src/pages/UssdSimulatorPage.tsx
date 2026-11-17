import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, VolumeCross, VolumeUp } from 'reicon-react'
import { api } from '@/api/client'
import type { EscrowJob, Worker } from '@/api/types'
import { formatNaira } from '@/lib/format'
import { Button } from '@/components/ui/button'

type UssdScreen = 'dialer' | 'home' | 'balance' | 'pending_jobs' | 'withdraw' | 'result'

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
  const [score, setScore] = useState(82)
  const [soundOn, setSoundOn] = useState(true)
  const [pressedKey, setPressedKey] = useState<string | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  async function refresh() {
    const dash = await api.getWorkerDashboard()
    setWorker(dash.worker)
    setJobs(dash.jobs)
    setScore(dash.reportPreview.score)
  }

  useEffect(() => {
    refresh()
    const handler = () => refresh()
    window.addEventListener('proofwork:demo-updated', handler)
    return () => window.removeEventListener('proofwork:demo-updated', handler)
  }, [])

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
      if (key === '1') {
        setSelectedIndex(1)
        setScreen('balance')
      } else if (key === '2') {
        setSelectedIndex(2)
        setScreen('pending_jobs')
      } else if (key === '3') {
        setSelectedIndex(3)
        setScreen('withdraw')
      }
      return
    }

    if (screen === 'pending_jobs') {
      if (key === '1' && activeJob && pendingDay) {
        await api.markDayDone(activeJob.id, pendingDay.dayNumber)
        await refresh()
        setMessage(
          `Day ${pendingDay.dayNumber} marked DONE (${formatNaira(Math.round(pendingDay.amountKobo / 100))}). 24h window started.`,
        )
        setScreen('result')
      } else if (key === '2' && activeJob && reportedDay) {
        await api.confirmDay(activeJob.id, reportedDay.dayNumber, 'client')
        await refresh()
        setMessage(
          `Day ${reportedDay.dayNumber} confirmed! ${formatNaira(Math.round(reportedDay.amountKobo / 100))} paid to ${activeJob.workerName}.`,
        )
        setScreen('result')
      } else if (key === '0') {
        setScreen('home')
      }
      return
    }

    if (screen === 'withdraw') {
      if (key === '1') {
        setMessage(
          `${formatNaira(Math.round(totalPaidKobo / 100))} swept to ${worker?.bankName ?? 'Access Bank'} (${worker?.bankAccountNumber ?? '0124883920'}).`,
        )
        setScreen('result')
      } else if (key === '0') {
        setScreen('home')
      }
      return
    }

    if (key === '0') {
      setScreen('home')
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
    <div className="min-h-screen bg-background text-foreground pb-16">
      <header className="sticky top-0 z-20 border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-8 py-3.5">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Provo</span>
          </Link>

          <div className="flex items-center gap-2">
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
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-8 py-8 sm:py-12 grid gap-10 lg:grid-cols-12 lg:items-center">
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

          <div className="grid grid-cols-3 gap-2.5 text-xs">
            <button
              type="button"
              onClick={() => handleKeyPress('1')}
              className="rounded-[12px] border border-border bg-card p-3 text-left hover:border-primary transition-colors cursor-pointer"
            >
              <span className="font-mono text-[11px] text-primary block">Key 1</span>
              <span className="font-semibold text-foreground">1. Balance</span>
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('2')}
              className="rounded-[12px] border border-border bg-card p-3 text-left hover:border-primary transition-colors cursor-pointer"
            >
              <span className="font-mono text-[11px] text-primary block">Key 2</span>
              <span className="font-semibold text-foreground">2. Pending Jobs</span>
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('3')}
              className="rounded-[12px] border border-border bg-card p-3 text-left hover:border-primary transition-colors cursor-pointer"
            >
              <span className="font-mono text-[11px] text-primary block">Key 3</span>
              <span className="font-semibold text-foreground">3. Withdraw</span>
            </button>
          </div>

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
          <div className="relative w-full max-w-[290px] sm:max-w-[356px] drop-shadow-[0_32px_65px_rgba(11,22,40,0.35)] select-none">
            <img
              src="/feature-phone.png"
              alt="Feature phone running Provo USSD"
              className="block w-full h-auto pointer-events-none"
            />

            <div className="absolute top-[9.5%] left-[13.5%] right-[13.5%] h-[42.5%] flex flex-col justify-between rounded-[5px] bg-[#0e1518] p-3 sm:p-4 text-left font-sans text-white overflow-hidden border border-white/10">
              <div className="flex items-center justify-between border-b border-white/15 pb-1 text-[10px] sm:text-xs text-white">
                <span className="font-mono">*123#</span>
                <span className="inline-flex items-center gap-0.5">
                  <span className="h-2.5 w-4 rounded-[1px] border border-white bg-white inline-block" />
                  <span className="h-1.5 w-0.5 bg-white inline-block" />
                </span>
              </div>

              <div className="relative flex-1 pr-3 flex flex-col justify-center text-white">
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
                  <div className="space-y-1.5 text-xs sm:text-[15px] leading-snug font-medium text-white">
                    <p className="font-semibold">Welcome to PROVO</p>
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
                  </div>
                )}

                {screen === 'balance' && (
                  <div className="space-y-1 text-[11px] sm:text-[13px] leading-snug text-white">
                    <p className="font-semibold">
                      {worker?.name ?? 'Emem Ekpo'} · Balance
                    </p>
                    <p>Paid out: {formatNaira(Math.round(totalPaidKobo / 100))}</p>
                    <p>Locked pay: {formatNaira(Math.round(lockedKobo / 100))}</p>
                    <p>Provo Score: {score} / 100</p>
                    <p className="pt-1">0. Back</p>
                  </div>
                )}

                {screen === 'pending_jobs' && (
                  <div className="space-y-1 text-[11px] sm:text-[13px] leading-snug text-white">
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
                    <p className="pt-0.5">0. Back</p>
                  </div>
                )}

                {screen === 'withdraw' && (
                  <div className="space-y-1 text-[11px] sm:text-[13px] leading-snug text-white">
                    <p className="font-semibold">Withdraw to Bank</p>
                    <p>Paga: {worker?.pagaAccountNumber ?? '3104829104'}</p>
                    <p>Bank: {worker?.bankName ?? 'Access Bank'}</p>
                    <button
                      type="button"
                      onClick={() => handleKeyPress('1')}
                      className="block w-full text-left rounded-[3px] bg-white/15 px-1.5 py-0.5 font-semibold text-white cursor-pointer mt-1"
                    >
                      1. Transfer {formatNaira(Math.round(totalPaidKobo / 100))} now
                    </button>
                    <p>0. Back</p>
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
