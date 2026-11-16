import { getScoreBand } from '@/lib/format'
import {
  SEED_CONSENTS,
  SEED_DISPUTES,
  SEED_JOBS,
  SEED_PAGA_EVENTS,
  SEED_WORKER,
  SEED_WORKERS_DIRECTORY,
} from './mockData'
import type {
  ActiveMonthCell,
  ClientTokenSummary,
  ConfirmationOutcome,
  ConsentRecord,
  DisputeReason,
  DisputeRecord,
  EscrowJob,
  JobDay,
  OutcomeMixItem,
  PagaEventLog,
  ReportPayload,
  ScoreComponent,
  TradeType,
  Worker,
} from './types'

const STORAGE_KEY = 'proofwork_escrow_demo_v2'

interface DemoState {
  worker: Worker
  directory: Worker[]
  jobs: EscrowJob[]
  consents: ConsentRecord[]
  disputes: DisputeRecord[]
  pagaEvents: PagaEventLog[]
}

function loadState(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as DemoState
  } catch {
    // Fallback to seed
  }
  return {
    worker: SEED_WORKER,
    directory: SEED_WORKERS_DIRECTORY,
    jobs: SEED_JOBS,
    consents: SEED_CONSENTS,
    disputes: SEED_DISPUTES,
    pagaEvents: SEED_PAGA_EVENTS,
  }
}

function saveState(state: DemoState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage errors
  }
}

export function resetDemoState(): DemoState {
  const fresh: DemoState = {
    worker: SEED_WORKER,
    directory: SEED_WORKERS_DIRECTORY,
    jobs: SEED_JOBS,
    consents: SEED_CONSENTS,
    disputes: SEED_DISPUTES,
    pagaEvents: SEED_PAGA_EVENTS,
  }
  saveState(fresh)
  return fresh
}

function computeDailySchedule(totalKobo: number, daysCount: number): JobDay[] {
  const base = Math.floor(totalKobo / daysCount)
  const remainder = totalKobo - base * daysCount
  return Array.from({ length: daysCount }, (_, i) => ({
    dayNumber: i + 1,
    amountKobo: i === daysCount - 1 ? base + remainder : base,
    status: 'PENDING',
  }))
}

function computeReport(state: DemoState, reportToken: string): ReportPayload {
  const consent =
    state.consents.find((c) => c.reportToken === reportToken && !c.revokedAt) ??
    state.consents[0]

  const settledDays: Array<{ job: EscrowJob; day: JobDay }> = []
  const disputedDays: Array<{ job: EscrowJob; day: JobDay }> = []

  for (const job of state.jobs) {
    for (const day of job.days) {
      if (day.status === 'PAID' || day.status === 'CONFIRMED' || day.status === 'AUTO_RELEASED') {
        settledDays.push({ job, day })
      } else if (day.status === 'DISPUTED') {
        disputedDays.push({ job, day })
      }
    }
  }

  const distinctClients = new Set(settledDays.map(({ job }) => job.clientToken))
  const uniquePayersCount = distinctClients.size

  const clientMonths = new Map<string, Set<string>>()
  const clientStats = new Map<
    string,
    { confirmedDays: number; autoDays: number; totalNaira: number }
  >()

  for (const { job, day } of settledDays) {
    const ym = job.createdAt.slice(0, 7)
    if (!clientMonths.has(job.clientToken)) clientMonths.set(job.clientToken, new Set())
    clientMonths.get(job.clientToken)!.add(ym)

    const prev = clientStats.get(job.clientToken) ?? {
      confirmedDays: 0,
      autoDays: 0,
      totalNaira: 0,
    }
    const isAuto = day.outcome === 'auto'
    clientStats.set(job.clientToken, {
      confirmedDays: prev.confirmedDays + (isAuto ? 0 : 1),
      autoDays: prev.autoDays + (isAuto ? 1 : 0),
      totalNaira: prev.totalNaira + Math.round(day.amountKobo / 100),
    })
  }

  const repeatClients = Array.from(clientMonths.entries()).filter(
    ([, months]) => months.size > 1,
  ).length
  const activeMonthsSet = new Set(settledDays.map(({ job }) => job.createdAt.slice(0, 7)))
  const activeMonthsCount = activeMonthsSet.size

  const outcomeCounts: Record<ConfirmationOutcome, { count: number; amountNaira: number }> = {
    client: { count: 0, amountNaira: 0 },
    supervisor: { count: 0, amountNaira: 0 },
    auto: { count: 0, amountNaira: 0 },
  }

  for (const { day } of settledDays) {
    const o: ConfirmationOutcome = day.outcome ?? 'client'
    outcomeCounts[o].count += 1
    outcomeCounts[o].amountNaira += Math.round(day.amountKobo / 100)
  }

  const totalSettled = settledDays.length || 1
  const outcomeMix: OutcomeMixItem[] = (['client', 'supervisor', 'auto'] as ConfirmationOutcome[]).map(
    (outcome) => ({
      outcome,
      count: outcomeCounts[outcome].count,
      amountNaira: outcomeCounts[outcome].amountNaira,
      percentage: Math.round((outcomeCounts[outcome].count / totalSettled) * 100),
    }),
  )

  const confirmedCount = outcomeCounts.client.count + outcomeCounts.supervisor.count
  const autoCount = outcomeCounts.auto.count

  const uniquePts = Math.min(30, uniquePayersCount * 10)
  const repeatPts = Math.min(25, repeatClients * 15)
  const monthPts = Math.min(25, activeMonthsCount * 6)
  const qualityPts = Math.round(((confirmedCount + autoCount * 0.4) / totalSettled) * 20)
  const circularJobs = state.jobs.filter((j) => j.flaggedCircular)
  const deductionPts = circularJobs.length * -15

  const score = Math.max(
    0,
    Math.min(100, uniquePts + repeatPts + monthPts + qualityPts + deductionPts),
  )

  const components: ScoreComponent[] = [
    {
      key: 'unique_payers',
      label: 'Unique confirmed payers',
      points: uniquePts,
      maxPoints: 30,
      detail: `${uniquePayersCount} distinct client(s) with locked & settled days`,
    },
    {
      key: 'repeat_clients',
      label: 'Repeat clients across months',
      points: repeatPts,
      maxPoints: 25,
      detail: `${repeatClients} client(s) funded jobs in more than one month`,
    },
    {
      key: 'active_months',
      label: 'Active months',
      points: monthPts,
      maxPoints: 25,
      detail: `${activeMonthsCount} month(s) with settled work`,
    },
    {
      key: 'confirmation_quality',
      label: 'Explicit confirmation quality',
      points: qualityPts,
      maxPoints: 20,
      detail: `${confirmedCount} confirmed day(s), ${autoCount} auto-released (weighted 0.4x)`,
    },
  ]

  if (circularJobs.length > 0 || disputedDays.length > 0) {
    components.push({
      key: 'deductions',
      label: 'Disputes & flags',
      points: deductionPts,
      maxPoints: 0,
      detail: `${disputedDays.length} disputed day(s) excluded, ${circularJobs.length} circular flag(s)`,
    })
  }

  const monthsOrder = ['2026-08', '2026-09', '2026-10', '2026-11']
  const monthLabels: Record<string, string> = {
    '2026-08': 'Aug',
    '2026-09': 'Sep',
    '2026-10': 'Oct',
    '2026-11': 'Nov',
  }
  const activeMonths: ActiveMonthCell[] = monthsOrder.map((m) => {
    const inMonth = settledDays.filter(({ job }) => job.createdAt.startsWith(m))
    return {
      month: m,
      label: monthLabels[m],
      confirmedDays: inMonth.length,
      totalNaira: inMonth.reduce((sum, { day }) => sum + Math.round(day.amountKobo / 100), 0),
    }
  })

  const clientTokens: ClientTokenSummary[] = Array.from(clientStats.entries()).map(
    ([token, info]) => ({
      token,
      displayLabel: `Client ${token}`,
      phoneVerified: true,
      confirmedDays: info.confirmedDays,
      autoReleasedDays: info.autoDays,
      monthsActive: clientMonths.get(token)?.size ?? 1,
      totalNaira: info.totalNaira,
    }),
  )

  return {
    reportToken,
    worker: {
      id: state.worker.id,
      name: state.worker.name,
      trade: state.worker.trade,
      area: state.worker.area,
    },
    lenderName: consent?.lenderName ?? 'Lapo Microfinance Bank',
    generatedAt: new Date().toISOString(),
    expiresAt: consent?.expiresAt ?? '2026-11-19T09:00:00Z',
    score,
    band: getScoreBand(score),
    components,
    outcomeMix,
    activeMonths,
    clientTokens,
    jobs: state.jobs,
    circularFlags: circularJobs.map(
      (j) => `Job ${j.id}: funding account matched worker payout account`,
    ),
    signedSnapshot: {
      workerId: state.worker.id,
      standingTier: getScoreBand(score),
      standingScore: score,
      signals: {
        confirmedDays: confirmedCount,
        autoReleasedDays: autoCount,
        uniqueClients: uniquePayersCount,
        activeMonths: activeMonthsCount,
        totalPaidNaira: settledDays.reduce(
          (sum, { day }) => sum + Math.round(day.amountKobo / 100),
          0,
        ),
      },
      signedAt: new Date().toISOString(),
      signature: 'ed25519:9f84c2a1e7b03d89f612a4c7e19b0d3a5e7f8c2b1a4d6e8f',
    },
  }
}

export const mockAdapter = {
  async getWorkerDashboard() {
    const state = loadState()
    return {
      worker: state.worker,
      jobs: state.jobs,
      consents: state.consents,
      reportPreview: computeReport(state, state.consents[0]?.reportToken ?? 'rep_emem_lapo_2026'),
    }
  },

  async getAvailableWorkers(trade?: TradeType) {
    const state = loadState()
    return trade
      ? state.directory.filter((w) => w.trade === trade && w.available)
      : state.directory.filter((w) => w.available)
  },

  async createAndRequestFunding(input: {
    clientName: string
    workerId: string
    trade: TradeType
    description: string
    area: string
    totalNaira: number
    daysCount: number
    supervisorName?: string
    supervisorPhone?: string
  }): Promise<EscrowJob> {
    const state = loadState()
    const worker = state.directory.find((w) => w.id === input.workerId) ?? state.worker
    const id = `job_${Date.now().toString().slice(-3)}`
    const totalKobo = Math.round(input.totalNaira * 100)
    const job: EscrowJob = {
      id,
      clientId: 'cli_web',
      clientName: input.clientName,
      clientToken: input.clientName.slice(0, 2).toUpperCase() + '4',
      workerId: worker.id,
      workerName: worker.name,
      supervisorName: input.supervisorName?.trim() || undefined,
      supervisorPhone: input.supervisorPhone?.trim() || undefined,
      trade: input.trade,
      description: input.description,
      area: input.area,
      totalKobo,
      daysCount: input.daysCount,
      status: 'AWAITING_FUNDING',
      fundingAccountNumber: `7740${Date.now().toString().slice(-6)}`,
      fundingLink: `https://pay.paga.com/pw-${id}`,
      days: computeDailySchedule(totalKobo, input.daysCount),
      createdAt: new Date().toISOString(),
    }
    state.jobs = [job, ...state.jobs]
    saveState(state)
    return job
  },

  async simulateFundJob(jobId: string): Promise<EscrowJob> {
    const state = loadState()
    state.jobs = state.jobs.map((j) =>
      j.id === jobId ? { ...j, status: 'FUNDED' } : j,
    )
    const funded = state.jobs.find((j) => j.id === jobId)!
    state.pagaEvents = [
      {
        id: `evt_${Date.now().toString().slice(-4)}`,
        eventType: 'ESCROW_FUNDED',
        reference: `PAGA-ESC-${jobId}`,
        idempotencyKey: `idem_${Date.now().toString(36)}`,
        hashValid: true,
        reconcileVerified: true,
        amountNaira: Math.round(funded.totalKobo / 100),
        payerName: funded.clientName,
        receivedAt: new Date().toISOString(),
        outcome: `Locked ₦${Math.round(funded.totalKobo / 100).toLocaleString()} for ${funded.daysCount} days (${jobId})`,
      },
      ...state.pagaEvents,
    ]
    saveState(state)
    return funded
  },

  async markDayDone(jobId: string, dayNumber: number): Promise<EscrowJob> {
    const state = loadState()
    const now = Date.now()
    const releaseAt = new Date(now + 24 * 3600 * 1000).toISOString()
    state.jobs = state.jobs.map((j) =>
      j.id === jobId
        ? {
            ...j,
            status: 'IN_PROGRESS',
            days: j.days.map((d) =>
              d.dayNumber === dayNumber
                ? {
                    ...d,
                    status: 'DONE_REPORTED',
                    doneAt: new Date(now).toISOString(),
                    releaseAt,
                  }
                : d,
            ),
          }
        : j,
    )
    saveState(state)
    return state.jobs.find((j) => j.id === jobId)!
  },

  async confirmDay(
    jobId: string,
    dayNumber: number,
    actor: 'client' | 'supervisor',
  ): Promise<EscrowJob> {
    const state = loadState()
    let paidNaira = 0
    let workerName = state.worker.name
    state.jobs = state.jobs.map((j) => {
      if (j.id !== jobId) return j
      workerName = j.workerName
      const updatedDays = j.days.map((d) => {
        if (d.dayNumber !== dayNumber) return d
        paidNaira = Math.round(d.amountKobo / 100)
        return {
          ...d,
          status: 'PAID' as const,
          outcome: actor,
          decidedBy: actor === 'supervisor' ? j.supervisorName ?? 'Supervisor' : j.clientName,
          decidedAt: new Date().toISOString(),
        }
      })
      const allDone = updatedDays.every((d) => d.status === 'PAID' || d.status === 'DISPUTED')
      return {
        ...j,
        status: allDone ? 'COMPLETED' : 'IN_PROGRESS',
        receiptId: allDone ? j.receiptId ?? `PW-ESC-${jobId.slice(-3)}` : j.receiptId,
        days: updatedDays,
      }
    })
    state.pagaEvents = [
      {
        id: `evt_${Date.now().toString().slice(-4)}`,
        eventType: 'DAY_PAYOUT',
        reference: `PAGA-PAY-${jobId}-D${dayNumber}`,
        idempotencyKey: `idem_${jobId}_d${dayNumber}`,
        hashValid: true,
        reconcileVerified: true,
        amountNaira: paidNaira,
        payerName: workerName,
        receivedAt: new Date().toISOString(),
        outcome: `Released Day ${dayNumber} (${actor} confirmed) to Paga payout account`,
      },
      ...state.pagaEvents,
    ]
    saveState(state)
    return state.jobs.find((j) => j.id === jobId)!
  },

  async disputeDay(
    jobId: string,
    dayNumber: number,
    reason: DisputeReason,
    raisedBy: 'client' | 'supervisor' = 'client',
  ) {
    const state = loadState()
    const job = state.jobs.find((j) => j.id === jobId)
    if (!job) throw new Error('Job not found')
    const day = job.days.find((d) => d.dayNumber === dayNumber)
    if (!day) throw new Error('Day not found')

    state.jobs = state.jobs.map((j) =>
      j.id === jobId
        ? {
            ...j,
            days: j.days.map((d) =>
              d.dayNumber === dayNumber ? { ...d, status: 'DISPUTED' } : d,
            ),
          }
        : j,
    )
    state.disputes = [
      {
        id: `dsp_${Date.now().toString().slice(-4)}`,
        jobId,
        dayNumber,
        workerName: job.workerName,
        clientToken: job.clientToken,
        amountNaira: Math.round(day.amountKobo / 100),
        reason,
        raisedBy,
        status: 'open',
        createdAt: new Date().toISOString(),
      },
      ...state.disputes,
    ]
    saveState(state)
  },

  async simulateAutoReleaseNext() {
    const state = loadState()
    for (const job of state.jobs) {
      const target = job.days.find((d) => d.status === 'DONE_REPORTED')
      if (target) {
        state.jobs = state.jobs.map((j) =>
          j.id === job.id
            ? {
                ...j,
                days: j.days.map((d) =>
                  d.dayNumber === target.dayNumber
                    ? {
                        ...d,
                        status: 'PAID',
                        outcome: 'auto',
                        decidedBy: 'Scheduler (24h)',
                        decidedAt: new Date().toISOString(),
                      }
                    : d,
                ),
              }
            : j,
        )
        state.pagaEvents = [
          {
            id: `evt_${Date.now().toString().slice(-4)}`,
            eventType: 'DAY_PAYOUT',
            reference: `PAGA-AUTO-${job.id}-D${target.dayNumber}`,
            idempotencyKey: `idem_auto_${job.id}_d${target.dayNumber}`,
            hashValid: true,
            reconcileVerified: true,
            amountNaira: Math.round(target.amountKobo / 100),
            payerName: job.workerName,
            receivedAt: new Date().toISOString(),
            outcome: `24h Auto-release Day ${target.dayNumber} of ${job.id} (lower score weight)`,
          },
          ...state.pagaEvents,
        ]
        saveState(state)
        return { message: `Auto-released Day ${target.dayNumber} of ${job.id} after 24h window.` }
      }
    }
    return { message: 'No DONE_REPORTED days waiting in 24h window.' }
  },

  async createConsent(lenderName: string, daysValid = 7) {
    const state = loadState()
    const expires = new Date(Date.now() + daysValid * 86400000).toISOString()
    const consent: ConsentRecord = {
      id: `con_${Date.now().toString().slice(-4)}`,
      workerId: state.worker.id,
      lenderName,
      reportToken: `rep_${Date.now().toString().slice(-6)}`,
      grantedAt: new Date().toISOString(),
      expiresAt: expires,
    }
    state.consents = [consent, ...state.consents]
    saveState(state)
    return consent
  },

  async getReport(reportToken: string) {
    const state = loadState()
    return computeReport(state, reportToken)
  },

  async getAdminOverview() {
    const state = loadState()
    return {
      disputes: state.disputes,
      pagaEvents: state.pagaEvents,
    }
  },

  async resolveDispute(disputeId: string, resolution: 'uphold' | 'dismiss') {
    const state = loadState()
    const dispute = state.disputes.find((d) => d.id === disputeId)
    if (!dispute) return
    state.disputes = state.disputes.map((d) =>
      d.id === disputeId ? { ...d, status: resolution === 'uphold' ? 'upheld' : 'dismissed' } : d,
    )
    if (resolution === 'dismiss') {
      state.jobs = state.jobs.map((j) =>
        j.id === dispute.jobId
          ? {
              ...j,
              days: j.days.map((d) =>
                d.dayNumber === dispute.dayNumber
                  ? { ...d, status: 'PAID', outcome: 'client', decidedBy: 'Admin resolved' }
                  : d,
              ),
            }
          : j,
      )
    }
    saveState(state)
  },
}
