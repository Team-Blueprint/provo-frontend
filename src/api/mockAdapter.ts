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
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState
      const existingIds = new Set((parsed.directory ?? []).map((w) => w.id))
      const mergedDirectory = [
        ...(parsed.directory ?? []),
        ...SEED_WORKERS_DIRECTORY.filter((w) => !existingIds.has(w.id)),
      ]
      return {
        ...parsed,
        directory: mergedDirectory,
      }
    }
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

function maskEmployerName(name: string, token: string): string {
  const clean = name.trim()
  if (!clean || clean.includes('***')) return clean || `Employer (#${token})`
  const masked = clean
    .split(/\s+/)
    .map((part) => {
      if (part.length <= 2) return `${part[0]}*`
      return `${part[0]}${'*'.repeat(Math.min(3, part.length - 2))}${part[part.length - 1]}`
    })
    .join(' ')
  return token && !clean.includes(token) ? `${masked} (#${token})` : masked
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
      detail: `${uniquePayersCount} distinct employer(s) with locked & settled days`,
    },
    {
      key: 'repeat_clients',
      label: 'Repeat employers across months',
      points: repeatPts,
      maxPoints: 25,
      detail: `${repeatClients} employer(s) funded jobs in more than one month`,
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
    ([token, info]) => {
      const sampleJob = state.jobs.find((j) => j.clientToken === token)
      return {
        token,
        displayLabel: sampleJob
          ? maskEmployerName(sampleJob.clientName, token)
          : `Employer (#${token})`,
        phoneVerified: true,
        confirmedDays: info.confirmedDays,
        autoReleasedDays: info.autoDays,
        monthsActive: clientMonths.get(token)?.size ?? 1,
        totalNaira: info.totalNaira,
      }
    },
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
  async getJob(jobId: string): Promise<EscrowJob | null> {
    const state = loadState()
    return state.jobs.find((j) => j.id === jobId) ?? null
  },

  async getWorkerDashboard() {
    const state = loadState()
    return {
      worker: state.worker,
      jobs: state.jobs,
      consents: state.consents,
      reportPreview: computeReport(state, state.consents[0]?.reportToken ?? 'rep_emem_lapo_2026'),
    }
  },

  async getClientJobs(): Promise<EscrowJob[]> {
    return loadState().jobs
  },

  async getSupervisorJobs(): Promise<EscrowJob[]> {
    return loadState().jobs
  },

  async getAvailableWorkers(trade?: TradeType) {
    const state = loadState()
    return trade
      ? state.directory.filter((w) => w.trade === trade && w.available)
      : state.directory.filter((w) => w.available)
  },

  async assignSupervisor(input: {
    jobId: string
    supervisorName: string
    supervisorPhone: string
  }): Promise<EscrowJob | null> {
    const state = loadState()
    let updated: EscrowJob | null = null
    state.jobs = state.jobs.map((j) => {
      if (j.id !== input.jobId) return j
      updated = {
        ...j,
        supervisorName: input.supervisorName.trim() || undefined,
        supervisorPhone: input.supervisorPhone.trim() || undefined,
        supervisorToken: j.supervisorToken ?? `sup_${j.id}`,
      }
      return updated
    })
    saveState(state)
    window.dispatchEvent(new CustomEvent('proofwork:demo-updated'))
    return updated
  },

  async getSupervisorJobView(jobId: string, _token: string): Promise<EscrowJob> {
    const job = loadState().jobs.find((j) => j.id === jobId)
    if (!job) throw new Error('Invalid or expired supervisor link')
    return job
  },

  async supervisorConfirmDay(input: {
    jobId: string
    dayNumber: number
    token: string
    proofPhoto?: string
    phone?: string
  }): Promise<void> {
    await this.confirmDay(input.jobId, input.dayNumber, 'supervisor')
    if (input.proofPhoto) {
      const state = loadState()
      state.jobs = state.jobs.map((j) =>
        j.id === input.jobId
          ? {
              ...j,
              days: j.days.map((d) =>
                d.dayNumber === input.dayNumber ? { ...d, proofPhoto: input.proofPhoto } : d,
              ),
            }
          : j,
      )
      saveState(state)
    }
  },

  async supervisorDisputeDay(input: {
    jobId: string
    dayNumber: number
    token: string
    reason: DisputeReason
  }): Promise<void> {
    await this.disputeDay(input.jobId, input.dayNumber, input.reason, 'supervisor')
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

  async getWorkerPaymentLink(workerId: string): Promise<{
    workerId: string
    workerName: string
    accountNumber: string
    bank: string
    paymentUrl: string
    shareText: string
  } | null> {
    const state = loadState()
    const w = state.directory.find((item) => item.id === workerId) ?? state.worker
    if (!w) return null
    return {
      workerId: w.id,
      workerName: w.name,
      accountNumber: w.pagaAccountNumber,
      bank: 'Paga',
      paymentUrl: `${window.location.origin}/employer?worker=${w.id}`,
      shareText: `Pay ${w.name} via Provo: Transfer to Paga account ${w.pagaAccountNumber}`,
    }
  },

  async simulateFundJob(jobId: string, _amountNaira?: number): Promise<EscrowJob> {
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

  async assignWorkerToJob(input: {
    jobId: string
    workerPhone?: string
    workerId?: string
  }): Promise<EscrowJob> {
    const state = loadState()
    const matched = state.directory.find(
      (w) =>
        (input.workerId && w.id === input.workerId) ||
        (input.workerPhone &&
          w.phone.replace(/\D/g, '').endsWith(input.workerPhone.replace(/\D/g, '').slice(-10))),
    )
    let updated: EscrowJob | null = null
    state.jobs = state.jobs.map((j) => {
      if (j.id !== input.jobId) return j
      updated = {
        ...j,
        workerId: matched?.id ?? input.workerId ?? 'wrk_assigned',
        workerName: matched?.name ?? input.workerPhone ?? j.workerName,
      }
      return updated
    })
    saveState(state)
    if (!updated) throw new Error('Job not found')
    return updated
  },

  async requestSetPin(_phone: string): Promise<{ message: string }> {
    return { message: 'PIN setup OTP sent via SMS.' }
  },

  async setPin(_input: {
    phone: string
    otpCode: string
    newPin: string
  }): Promise<{ isWorker: boolean; isClient: boolean }> {
    return { isWorker: true, isClient: false }
  },

  async loginWithPin(input: { phone: string; pin: string }) {
    if (!/^\d{6}$/.test(input.pin.trim())) {
      throw new Error('Enter your 6-digit PIN.')
    }
    return this.verifyWorkerLogin({ phone: input.phone, otp: '123456' })
  },

  async sendWorkerOtp(phone: string) {
    const cleaned = phone.trim()
    if (!cleaned) {
      throw new Error('Enter a valid phone number.')
    }
    return { sent: true, demoCode: '123456', phone: cleaned }
  },

  async sendSignupOtp(input: {
    name: string
    phone: string
    pin: string
    role: 'worker' | 'client'
    trade?: TradeType
  }) {
    const cleaned = input.phone.trim()
    if (!cleaned) {
      throw new Error('Enter a valid phone number.')
    }
    return { sent: true, demoCode: '123456', phone: cleaned }
  },

  async getUssdBalance(phone: string) {
    const dash = await this.getWorkerDashboard()
    const paidKobo = dash.jobs
      .flatMap((j) => j.days)
      .filter((d) => d.status === 'PAID' || d.status === 'CONFIRMED')
      .reduce((acc, d) => acc + d.amountKobo, 0)
    return {
      phone,
      workerName: dash.worker.name,
      trade: dash.worker.trade,
      totalEarnedKobo: paidKobo,
      totalEarnedNaira: `${(paidKobo / 100).toLocaleString('en-NG')}`,
      availableBalanceKobo: paidKobo,
      availableBalanceNaira: `${(paidKobo / 100).toLocaleString('en-NG')}`,
      pagaAccountNumber: dash.worker.pagaAccountNumber,
      displayText: `${dash.worker.name} (${dash.worker.trade})\nEarned: ₦${(paidKobo / 100).toLocaleString('en-NG')}`,
    }
  },

  async getUssdPendingJobs(phone: string) {
    const dash = await this.getWorkerDashboard()
    const pending = dash.jobs
      .filter((j) => j.status === 'FUNDED' || j.status === 'IN_PROGRESS')
      .map((j) => {
        const nextDay = j.days.find((d) => d.status === 'PENDING' || d.status === 'DONE_REPORTED')
        return {
          jobId: j.id,
          trade: j.trade,
          description: j.description,
          totalNaira: `${Math.round(j.totalKobo / 100)}`,
          currentDay: nextDay?.dayNumber ?? 1,
          totalDays: j.daysCount,
          dayStatus: nextDay?.status ?? 'PENDING',
        }
      })
    return {
      phone,
      totalPendingJobs: pending.length,
      jobs: pending,
      displayText: `${pending.length} active job(s)`,
    }
  },

  async ussdReportDone(_phone: string, jobId: string) {
    const dash = await this.getWorkerDashboard()
    const job = dash.jobs.find((j) => j.id === jobId)
    const pendingDay = job?.days.find((d) => d.status === 'PENDING')
    if (job && pendingDay) {
      await this.markDayDone(job.id, pendingDay.dayNumber)
      return { displayText: `Day ${pendingDay.dayNumber} marked DONE. 24h window started.` }
    }
    return { displayText: 'No pending day found for this job.' }
  },

  async ussdRegister(input: {
    phone: string
    name: string
    trade: TradeType
    pin: string
  }) {
    const state = loadState()
    const newWorker: Worker = {
      ...state.worker,
      id: `wrk_${Date.now().toString().slice(-4)}`,
      slug: input.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: input.name.trim(),
      phone: input.phone.trim(),
      trade: input.trade,
      available: true,
    }
    state.worker = newWorker
    state.directory = [newWorker, ...state.directory]
    saveState(state)
    return { message: `Account created for ${input.name}.` }
  },

  async ussdWithdraw(
    _phone: string,
    _amountNaira?: number,
    options?: { accountNumber?: string; bankCode?: string; pin?: string },
  ) {
    const dash = await this.getWorkerDashboard()
    const destAccount = options?.accountNumber || dash.worker.pagaAccountNumber
    const destBank = options?.bankCode || 'Paga'
    return {
      displayText: `Withdrawal queued to ${destBank} (${destAccount}).`,
    }
  },

  async resendOtp(phone: string) {
    return { sent: true, demoCode: '123456', phone }
  },

  async revokeConsent(token: string) {
    const state = loadState()
    state.consents = state.consents.map((c) =>
      c.reportToken === token ? { ...c, revokedAt: new Date().toISOString() } : c,
    )
    saveState(state)
  },

  async getWorkerSettings(): Promise<{ alertChannel: 'telegram' | 'sms' }> {
    const raw = window.localStorage.getItem('proofwork_alert_channel')
    return { alertChannel: raw === 'sms' ? 'sms' : 'telegram' }
  },

  async updateWorkerSettings(alertChannel: 'telegram' | 'sms') {
    window.localStorage.setItem('proofwork_alert_channel', alertChannel)
    return { alertChannel }
  },

  async verifyReceipt(receiptNumber: string) {
    return {
      id: receiptNumber,
      receipt_number: receiptNumber,
      job_id: '',
      issued_at: new Date().toISOString(),
      receipt_data: {},
    }
  },

  async verifyWorkerLogin(input: { phone: string; otp: string }) {
    if (input.otp.trim() !== '123456') {
      throw new Error('Invalid code. Enter 123456 for the demo.')
    }
    const state = loadState()
    const normalized = input.phone.replace(/\s+/g, '')
    const matched = state.directory.find(
      (w) => w.phone.replace(/\s+/g, '').endsWith(normalized.slice(-10)),
    )
    if (matched) {
      state.worker = matched
      saveState(state)
    }
    window.dispatchEvent(new CustomEvent('proofwork:demo-updated'))
    return state.worker
  },

  async verifyWorkerSignup(input: {
    name: string
    phone: string
    trade: TradeType
    customTrade?: string
    otp: string
  }) {
    if (input.otp.trim() !== '123456') {
      throw new Error('Invalid code. Enter 123456 for the demo.')
    }
    const state = loadState()
    const formattedPhone = input.phone.trim().startsWith('+')
      ? input.phone.trim()
      : `+234 ${input.phone.trim()}`
    const newWorker: Worker = {
      ...state.worker,
      id: `wrk_${Date.now().toString().slice(-4)}`,
      slug: input.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: input.name.trim(),
      phone: formattedPhone,
      trade: input.trade,
      customTrade: input.trade === 'Others' ? input.customTrade?.trim() : undefined,
      available: true,
    }
    state.worker = newWorker
    state.directory = [newWorker, ...state.directory.filter((w) => w.phone !== formattedPhone)]
    saveState(state)
    window.dispatchEvent(new CustomEvent('proofwork:demo-updated'))
    return newWorker
  },
}
