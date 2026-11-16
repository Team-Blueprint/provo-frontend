import { getScoreBand } from '@/lib/format'
import {
  SEED_CONSENTS,
  SEED_DISPUTES,
  SEED_JOBS,
  SEED_PAGA_EVENTS,
  SEED_WORKER,
} from './mockData'
import type {
  ActiveMonthCell,
  ClientTokenSummary,
  ConsentRecord,
  DisputeReason,
  DisputeRecord,
  EvidenceGrade,
  GradeMixItem,
  Job,
  JobType,
  PagaEventLog,
  PaymentRequestSession,
  ReportPayload,
  ScoreComponent,
  Worker,
} from './types'

const STORAGE_KEY = 'proofwork_demo_state_v1'

interface DemoState {
  worker: Worker
  jobs: Job[]
  consents: ConsentRecord[]
  disputes: DisputeRecord[]
  pagaEvents: PagaEventLog[]
  paymentRequests: Record<string, PaymentRequestSession>
}

function loadState(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as DemoState
  } catch {
    // Fallback to seed if storage is unavailable
  }
  return {
    worker: SEED_WORKER,
    jobs: SEED_JOBS,
    consents: SEED_CONSENTS,
    disputes: SEED_DISPUTES,
    pagaEvents: SEED_PAGA_EVENTS,
    paymentRequests: {},
  }
}

function saveState(state: DemoState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage quota errors in demo mode
  }
}

export function resetDemoState(): DemoState {
  const fresh: DemoState = {
    worker: SEED_WORKER,
    jobs: SEED_JOBS,
    consents: SEED_CONSENTS,
    disputes: SEED_DISPUTES,
    pagaEvents: SEED_PAGA_EVENTS,
    paymentRequests: {},
  }
  saveState(fresh)
  return fresh
}

function computeReport(state: DemoState, reportToken: string): ReportPayload {
  const consent =
    state.consents.find((c) => c.reportToken === reportToken && !c.revokedAt) ??
    state.consents[0]

  const confirmed = state.jobs.filter((j) => j.status === 'confirmed')
  const distinctClients = new Set(confirmed.map((j) => j.clientToken))
  const uniquePayersCount = distinctClients.size

  const clientMonths = new Map<string, Set<string>>()
  const clientTotals = new Map<string, { count: number; amount: number; grade1: boolean }>()

  for (const job of confirmed) {
    const ym = job.createdAt.slice(0, 7)
    if (!clientMonths.has(job.clientToken)) clientMonths.set(job.clientToken, new Set())
    clientMonths.get(job.clientToken)!.add(ym)

    const prev = clientTotals.get(job.clientToken) ?? { count: 0, amount: 0, grade1: false }
    clientTotals.set(job.clientToken, {
      count: prev.count + 1,
      amount: prev.amount + job.amount,
      grade1: prev.grade1 || job.grade === 1,
    })
  }

  const repeatClients = Array.from(clientMonths.entries()).filter(
    ([, months]) => months.size > 1,
  ).length

  const activeMonthsSet = new Set(confirmed.map((j) => j.createdAt.slice(0, 7)))
  const activeMonthsCount = activeMonthsSet.size

  const gradeCounts: Record<EvidenceGrade, { count: number; amount: number }> = {
    1: { count: 0, amount: 0 },
    2: { count: 0, amount: 0 },
    3: { count: 0, amount: 0 },
  }
  for (const j of confirmed) {
    gradeCounts[j.grade].count += 1
    gradeCounts[j.grade].amount += j.amount
  }

  const totalConfirmed = confirmed.length || 1
  const gradeMix: GradeMixItem[] = ([1, 2, 3] as EvidenceGrade[]).map((g) => ({
    grade: g,
    count: gradeCounts[g].count,
    amount: gradeCounts[g].amount,
    percentage: Math.round((gradeCounts[g].count / totalConfirmed) * 100),
  }))

  const cashShare = gradeCounts[3].count / totalConfirmed
  const uniquePts = Math.min(30, uniquePayersCount * 6)
  const repeatPts = Math.min(25, repeatClients * 10)
  const monthPts = Math.min(25, activeMonthsCount * 6)
  const rawEvidencePts = Math.round(((gradeCounts[1].count + gradeCounts[2].count) / totalConfirmed) * 20)
  const evidencePts = cashShare > 0.2 ? Math.min(rawEvidencePts, 14) : rawEvidencePts

  const circularJobs = state.jobs.filter((j) => j.flaggedCircular)
  const disputedJobs = state.jobs.filter((j) => j.status === 'disputed')
  const deductionPts = circularJobs.length * -10

  const score = Math.max(
    0,
    Math.min(100, uniquePts + repeatPts + monthPts + evidencePts + deductionPts),
  )

  const components: ScoreComponent[] = [
    {
      key: 'unique_payers',
      label: 'Unique confirmed payers',
      points: uniquePts,
      maxPoints: 30,
      detail: `${uniquePayersCount} distinct clients with confirmed jobs`,
      relatedJobIds: confirmed.map((j) => j.id),
    },
    {
      key: 'repeat_clients',
      label: 'Repeat clients across months',
      points: repeatPts,
      maxPoints: 25,
      detail: `${repeatClients} clients confirmed jobs in more than one month`,
      relatedJobIds: confirmed
        .filter((j) => (clientMonths.get(j.clientToken)?.size ?? 0) > 1)
        .map((j) => j.id),
    },
    {
      key: 'active_months',
      label: 'Active months',
      points: monthPts,
      maxPoints: 25,
      detail: `${activeMonthsCount} months with confirmed work`,
      relatedJobIds: confirmed.map((j) => j.id),
    },
    {
      key: 'evidence_quality',
      label: 'Evidence grade quality',
      points: evidencePts,
      maxPoints: 20,
      detail: `${gradeMix[0].percentage + gradeMix[1].percentage}% from link or bank transfer (cash capped at 20%)`,
      relatedJobIds: confirmed.filter((j) => j.grade !== 3).map((j) => j.id),
    },
  ]

  if (circularJobs.length > 0 || disputedJobs.length > 0) {
    components.push({
      key: 'deductions',
      label: 'Flags & disputed records',
      points: deductionPts,
      maxPoints: 0,
      detail: `${disputedJobs.length} disputed (excluded), ${circularJobs.length} circular-flow flag(s)`,
      relatedJobIds: [...disputedJobs, ...circularJobs].map((j) => j.id),
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
    const inMonth = confirmed.filter((j) => j.createdAt.startsWith(m))
    return {
      month: m,
      label: monthLabels[m],
      confirmedCount: inMonth.length,
      totalAmount: inMonth.reduce((sum, j) => sum + j.amount, 0),
    }
  })

  const clientTokens: ClientTokenSummary[] = Array.from(clientTotals.entries()).map(
    ([token, info]) => ({
      token,
      displayLabel: `Client ${token}`,
      phoneVerified: info.grade1,
      confirmedCount: info.count,
      monthsActive: clientMonths.get(token)?.size ?? 1,
      totalAmount: info.amount,
    }),
  )

  return {
    reportToken,
    worker: {
      id: state.worker.id,
      name: state.worker.name,
      trade: state.worker.trade,
    },
    lenderName: consent?.lenderName ?? 'Lapo Microfinance Bank',
    generatedAt: new Date().toISOString(),
    expiresAt: consent?.expiresAt ?? '2026-11-19T09:00:00Z',
    score,
    band: getScoreBand(score),
    components,
    gradeMix,
    activeMonths,
    clientTokens,
    jobs: state.jobs,
    circularFlags: circularJobs.map(
      (j) => `Job ${j.id}: payer account matched worker sweep account`,
    ),
    signedSnapshot: {
      workerId: state.worker.id,
      standingTier: getScoreBand(score),
      standingScore: score,
      signals: {
        confirmedJobs: confirmed.length,
        uniqueClients: uniquePayersCount,
        activeMonths: activeMonthsCount,
        totalConfirmedNaira: confirmed.reduce((sum, j) => sum + j.amount, 0),
        cashSharePercent: gradeMix[2].percentage,
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

  async linkPayerToClient(jobId: string, clientName: string, _clientPhone: string) {
    const state = loadState()
    const token = clientName.slice(0, 2).toUpperCase() + Math.floor(1 + Math.random() * 9)
    state.jobs = state.jobs.map((j) =>
      j.id === jobId
        ? {
            ...j,
            clientName,
            clientToken: token,
            needsPayerLink: false,
            confirmToken: j.confirmToken ?? `tok_${j.id}`,
          }
        : j,
    )
    saveState(state)
    return state.jobs.find((j) => j.id === jobId)!
  },

  async createCashDraft(clientName: string, _clientPhone: string, amount: number, jobType: JobType) {
    const state = loadState()
    const id = `job_${Date.now().toString().slice(-4)}`
    const token = clientName.slice(0, 2).toUpperCase() + '8'
    const newJob: Job = {
      id,
      workerId: state.worker.id,
      clientName,
      clientToken: token,
      amount,
      jobType,
      grade: 3,
      status: 'draft',
      createdAt: new Date().toISOString(),
      confirmToken: `tok_${id}`,
    }
    state.jobs = [newJob, ...state.jobs]
    saveState(state)
    return newJob
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

  async getConfirmJob(token: string) {
    const state = loadState()
    const job = state.jobs.find((j) => j.confirmToken === token || j.id === token)
    return {
      workerName: state.worker.name,
      job: job ?? null,
    }
  },

  async confirmJob(token: string, jobType: JobType) {
    const state = loadState()
    const receiptId = `PW-REC-${Math.floor(1000 + Math.random() * 9000)}`
    state.jobs = state.jobs.map((j) =>
      j.confirmToken === token || j.id === token
        ? {
            ...j,
            jobType,
            status: 'confirmed',
            confirmedAt: new Date().toISOString(),
            receiptId: j.receiptId ?? receiptId,
          }
        : j,
    )
    saveState(state)
    return state.jobs.find((j) => j.confirmToken === token || j.id === token)!
  },

  async disputeJob(token: string, reason: DisputeReason, raisedBy: 'client' | 'worker' = 'client') {
    const state = loadState()
    const target = state.jobs.find((j) => j.confirmToken === token || j.id === token)
    if (!target) throw new Error('Job not found')

    state.jobs = state.jobs.map((j) =>
      j.id === target.id ? { ...j, status: 'disputed' } : j,
    )
    state.disputes = [
      {
        id: `dsp_${Date.now().toString().slice(-4)}`,
        jobId: target.id,
        workerName: state.worker.name,
        clientToken: target.clientToken,
        amount: target.amount,
        reason,
        raisedBy,
        status: 'open',
        createdAt: new Date().toISOString(),
      },
      ...state.disputes,
    ]
    saveState(state)
    return target
  },

  async createPaymentRequest(
    workerSlug: string,
    amount: number,
    jobType: JobType,
    payerName: string,
    payerPhone: string,
  ): Promise<PaymentRequestSession> {
    const state = loadState()
    const ref = `PW-REQ-${Date.now().toString().slice(-5)}`
    const session: PaymentRequestSession = {
      referenceNumber: ref,
      workerSlug,
      workerName: state.worker.name,
      amount,
      jobType,
      payerName,
      payerPhone,
      state: 'pending',
      pagaTransferAccount: '7740192831',
      pagaTransferBank: 'Paga',
      ussdCode: `*242*000*${amount}#`,
      expiresAt: new Date(Date.now() + 15 * 60000).toISOString(),
    }
    state.paymentRequests[ref] = session
    saveState(state)
    return session
  },

  async completePaymentRequest(referenceNumber: string): Promise<PaymentRequestSession> {
    const state = loadState()
    const session = state.paymentRequests[referenceNumber]
    if (!session) throw new Error('Payment request not found')
    const receiptId = `PW-REC-${Math.floor(1000 + Math.random() * 9000)}`
    const updated: PaymentRequestSession = {
      ...session,
      state: 'paid',
      receiptId,
    }
    state.paymentRequests[referenceNumber] = updated

    const newJob: Job = {
      id: `job_${Date.now().toString().slice(-4)}`,
      workerId: state.worker.id,
      clientName: session.payerName,
      clientToken: session.payerName.slice(0, 2).toUpperCase() + '5',
      amount: session.amount,
      jobType: session.jobType,
      grade: 1,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
      receiptId,
    }
    state.jobs = [newJob, ...state.jobs]
    state.pagaEvents = [
      {
        id: `evt_${Date.now().toString().slice(-4)}`,
        eventType: 'PAYMENT_REQUEST_CALLBACK',
        reference: referenceNumber,
        idempotencyKey: `idem_${Date.now().toString(36)}`,
        hashValid: true,
        reconcileVerified: true,
        idempotentDuplicate: false,
        amount: session.amount,
        payerName: session.payerName,
        receivedAt: new Date().toISOString(),
        outcome: `Confirmed Grade 1 ${newJob.id}`,
      },
      ...state.pagaEvents,
    ]
    saveState(state)
    return updated
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
      circularJobs: state.jobs.filter((j) => j.flaggedCircular),
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
        j.id === dispute.jobId ? { ...j, status: 'confirmed' } : j,
      )
    }
    saveState(state)
  },

  async simulateFundingCallback(options?: { duplicate?: boolean; invalidHash?: boolean }) {
    const state = loadState()
    if (options?.invalidHash) {
      state.pagaEvents = [
        {
          id: `evt_${Date.now().toString().slice(-4)}`,
          eventType: 'FUNDING_CALLBACK',
          reference: `PAGA-BAD-${Date.now().toString().slice(-4)}`,
          idempotencyKey: `idem_${Date.now().toString(36)}`,
          hashValid: false,
          reconcileVerified: false,
          idempotentDuplicate: false,
          amount: 20000,
          payerName: 'UNKNOWN',
          receivedAt: new Date().toISOString(),
          outcome: 'Rejected: x-paga-hash-v3 mismatch',
        },
        ...state.pagaEvents,
      ]
      saveState(state)
      return { message: 'Invalid hash callback logged and rejected.' }
    }

    if (options?.duplicate) {
      state.pagaEvents = [
        {
          id: `evt_${Date.now().toString().slice(-4)}`,
          eventType: 'FUNDING_CALLBACK',
          reference: 'PAGA-FND-99102',
          idempotencyKey: 'idem_01JCK99102',
          hashValid: true,
          reconcileVerified: true,
          idempotentDuplicate: true,
          amount: 15000,
          payerName: 'OKOYE C. (GTBank)',
          receivedAt: new Date().toISOString(),
          outcome: 'Ignored duplicate callback (idempotent)',
        },
        ...state.pagaEvents,
      ]
      saveState(state)
      return { message: 'Duplicate callback ignored. No second job created.' }
    }

    const id = `job_${Date.now().toString().slice(-4)}`
    const newJob: Job = {
      id,
      workerId: state.worker.id,
      clientName: 'UDEH M.',
      clientToken: 'NEW',
      amount: 22000,
      grade: 2,
      status: 'waiting',
      createdAt: new Date().toISOString(),
      payerBankName: 'First Bank',
      payerAccountNumber: '3091827465',
      payerRawName: 'UDEH M.',
      needsPayerLink: true,
      confirmToken: `tok_${id}`,
    }
    state.jobs = [newJob, ...state.jobs]
    state.pagaEvents = [
      {
        id: `evt_${Date.now().toString().slice(-4)}`,
        eventType: 'FUNDING_CALLBACK',
        reference: `PAGA-FND-${Date.now().toString().slice(-5)}`,
        idempotencyKey: `idem_${Date.now().toString(36)}`,
        hashValid: true,
        reconcileVerified: true,
        idempotentDuplicate: false,
        amount: 22000,
        payerName: 'UDEH M. (First Bank)',
        receivedAt: new Date().toISOString(),
        outcome: `Created waiting job ${id}`,
      },
      ...state.pagaEvents,
    ]
    saveState(state)
    return { message: `Simulated ₦22,000 transfer from UDEH M. (First Bank).` }
  },
}
