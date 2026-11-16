import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Call, CloseCircle } from 'reicon-react'
import { api } from '@/api/client'
import type { EscrowJob } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

type UssdScreen = 'dialer' | 'home' | 'worker_done' | 'confirm_day' | 'score' | 'result'

const KEYPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#']

export function UssdSimulatorPage() {
  const [dialInput, setDialInput] = useState('*347*900#')
  const [screen, setScreen] = useState<UssdScreen>('dialer')
  const [message, setMessage] = useState('')
  const [jobs, setJobs] = useState<EscrowJob[]>([])
  const [score, setScore] = useState(82)

  async function refresh() {
    const dash = await api.getWorkerDashboard()
    setJobs(dash.jobs)
    setScore(dash.reportPreview.score)
  }

  useEffect(() => {
    refresh()
  }, [])

  const activeJob = jobs.find((j) => j.status === 'IN_PROGRESS' || j.status === 'FUNDED')
  const pendingDay = activeJob?.days.find((d) => d.status === 'PENDING')
  const reportedDay = activeJob?.days.find((d) => d.status === 'DONE_REPORTED')

  async function handleOption(key: string) {
    if (screen === 'dialer') {
      setDialInput((prev) => prev + key)
      return
    }
    if (screen === 'home') {
      if (key === '1') setScreen('worker_done')
      else if (key === '2') setScreen('confirm_day')
      else if (key === '3') setScreen('score')
      return
    }
    if (screen === 'worker_done') {
      if (key === '1' && activeJob && pendingDay) {
        await api.markDayDone(activeJob.id, pendingDay.dayNumber)
        await refresh()
        setMessage(
          `Day ${pendingDay.dayNumber} marked DONE. 24h confirmation window started for ${activeJob.clientName}.`,
        )
        setScreen('result')
      } else if (key === '0') {
        setScreen('home')
      }
      return
    }
    if (screen === 'confirm_day') {
      if (key === '1' && activeJob && reportedDay) {
        await api.confirmDay(activeJob.id, reportedDay.dayNumber, 'client')
        await refresh()
        setMessage(
          `Confirmed Day ${reportedDay.dayNumber}. ₦${Math.round(reportedDay.amountKobo / 100).toLocaleString()} released to ${activeJob.workerName}.`,
        )
        setScreen('result')
      } else if (key === '0') {
        setScreen('home')
      }
      return
    }
    if (key === '0') setScreen('home')
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3.5">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Proofwork</span>
          </Link>
          <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
            SIMULATED USSD
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 grid gap-10 md:grid-cols-2 md:items-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Feature-phone USSD simulator.
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Artisans without smartphones can dial <span className="font-mono">*347*900#</span> to
            mark a work day done or check their standing score. Pressing buttons on the phone
            updates the live Proofwork escrow state.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => setScreen('home')}>
              Jump to USSD menu
            </Button>
            <Link to="/worker">
              <Button size="sm">Open worker dashboard</Button>
            </Link>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[320px] rounded-[28px] border-4 border-foreground bg-foreground p-4 text-background shadow-[var(--pw-shadow-sheet)] space-y-4">
          <div className="mx-auto h-1.5 w-14 rounded-full bg-background/20" />

          <Card className="min-h-[210px] rounded-[14px] border-0 bg-card p-4 text-foreground flex flex-col justify-between">
            {screen === 'dialer' && (
              <div className="my-auto text-center space-y-2">
                <p className="font-mono text-xs text-muted-foreground">Dial Proofwork USSD</p>
                <p className="font-mono text-2xl font-semibold tracking-wider">{dialInput || '...'}</p>
              </div>
            )}

            {screen === 'home' && (
              <div className="space-y-2 font-mono text-xs">
                <p className="font-semibold text-primary">Proofwork USSD (*347*900#)</p>
                <p>1. Mark today’s work DONE</p>
                <p>2. Client: Confirm day</p>
                <p>3. Check my score</p>
              </div>
            )}

            {screen === 'worker_done' && (
              <div className="space-y-2 font-mono text-xs">
                <p className="font-semibold">Mark Work Done</p>
                {activeJob && pendingDay ? (
                  <>
                    <p>
                      Job: {activeJob.trade} · Day {pendingDay.dayNumber}
                    </p>
                    <p>1. Confirm Day {pendingDay.dayNumber} DONE</p>
                  </>
                ) : (
                  <p>No pending work day right now.</p>
                )}
                <p className="text-muted-foreground">0. Back</p>
              </div>
            )}

            {screen === 'confirm_day' && (
              <div className="space-y-2 font-mono text-xs">
                <p className="font-semibold">Confirm &amp; Release</p>
                {activeJob && reportedDay ? (
                  <>
                    <p>
                      {activeJob.workerName} · Day {reportedDay.dayNumber} (₦
                      {Math.round(reportedDay.amountKobo / 100).toLocaleString()})
                    </p>
                    <p>1. Confirm &amp; pay</p>
                  </>
                ) : (
                  <p>No day awaiting confirmation.</p>
                )}
                <p className="text-muted-foreground">0. Back</p>
              </div>
            )}

            {screen === 'score' && (
              <div className="space-y-2 font-mono text-xs">
                <p className="font-semibold">Emem Ekpo · Record</p>
                <p>Standing Score: {score} / 100</p>
                <p className="text-muted-foreground">0. Back</p>
              </div>
            )}

            {screen === 'result' && (
              <div className="space-y-2 font-mono text-xs">
                <p className="font-semibold text-[var(--pw-success)]">Success</p>
                <p>{message}</p>
                <p className="text-muted-foreground">0. Main menu</p>
              </div>
            )}

            <div className="flex justify-between pt-2 border-t border-border text-[10px] font-mono text-muted-foreground">
              <span>SIMULATED</span>
              <span>PAGA RAIL</span>
            </div>
          </Card>

          <div className="grid grid-cols-3 gap-2">
            {KEYPAD.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleOption(k)}
                className="h-11 rounded-[10px] bg-background/10 font-mono text-base font-semibold text-background hover:bg-background/20 active:scale-95 transition-all cursor-pointer"
              >
                {k}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                if (screen === 'dialer') setScreen('home')
              }}
              className="flex h-11 items-center justify-center gap-1.5 rounded-full bg-[var(--pw-success)] text-xs font-semibold text-white cursor-pointer"
            >
              <Call className="h-4 w-4" aria-hidden="true" />
              <span>Dial</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setScreen('dialer')
                setDialInput('*347*900#')
              }}
              className="flex h-11 items-center justify-center gap-1.5 rounded-full bg-[var(--pw-critical)] text-xs font-semibold text-white cursor-pointer"
            >
              <CloseCircle className="h-4 w-4" aria-hidden="true" />
              <span>End</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
