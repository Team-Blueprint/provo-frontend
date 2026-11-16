export type EvidenceGrade = 1 | 2 | 3

export type JobStatus =
  | 'draft'
  | 'waiting'
  | 'confirmed'
  | 'disputed'
  | 'expired'
  | 'failed'

export type PaymentRequestState = 'pending' | 'paid' | 'failed' | 'expired'

export type JobType =
  | 'Bricklaying'
  | 'Plastering'
  | 'Tiling'
  | 'Foundation'
  | 'Repairs'
  | 'Renovation'
  | 'General Labour'

export const JOB_TYPES: JobType[] = [
  'Bricklaying',
  'Plastering',
  'Tiling',
  'Foundation',
  'Repairs',
  'Renovation',
  'General Labour',
]

export type DisputeReason =
  | 'Not for work'
  | 'Wrong amount'
  | 'Duplicate entry'
  | 'Other'

export const DISPUTE_REASONS: DisputeReason[] = [
  'Not for work',
  'Wrong amount',
  'Duplicate entry',
  'Other',
]

export interface Worker {
  id: string
  slug: string
  name: string
  phone: string
  trade: string
  bankName: string
  bankAccountNumber: string
  pagaAccountNumber: string
  accountReference: string
  paymentLink: string
}

export interface Job {
  id: string
  workerId: string
  clientId?: string
  clientName: string
  clientToken: string
  amount: number
  jobType?: JobType
  grade: EvidenceGrade
  status: JobStatus
  createdAt: string
  confirmedAt?: string
  receiptId?: string
  confirmToken?: string
  payerBankName?: string
  payerAccountNumber?: string
  payerRawName?: string
  needsPayerLink?: boolean
  flaggedCircular?: boolean
}

export interface ScoreComponent {
  key: 'unique_payers' | 'repeat_clients' | 'active_months' | 'evidence_quality' | 'deductions'
  label: string
  points: number
  maxPoints: number
  detail: string
  relatedJobIds: string[]
}

export interface ClientTokenSummary {
  token: string
  displayLabel: string
  phoneVerified: boolean
  confirmedCount: number
  monthsActive: number
  totalAmount: number
}

export interface GradeMixItem {
  grade: EvidenceGrade
  count: number
  amount: number
  percentage: number
}

export interface ActiveMonthCell {
  month: string
  label: string
  confirmedCount: number
  totalAmount: number
}

export interface ReportPayload {
  reportToken: string
  worker: Pick<Worker, 'id' | 'name' | 'trade'>
  lenderName: string
  generatedAt: string
  expiresAt: string
  score: number
  band: string
  components: ScoreComponent[]
  gradeMix: GradeMixItem[]
  activeMonths: ActiveMonthCell[]
  clientTokens: ClientTokenSummary[]
  jobs: Job[]
  circularFlags: string[]
  signedSnapshot: {
    workerId: string
    standingTier: string
    standingScore: number
    signals: {
      confirmedJobs: number
      uniqueClients: number
      activeMonths: number
      totalConfirmedNaira: number
      cashSharePercent: number
    }
    signedAt: string
    signature: string
  }
}

export interface PagaEventLog {
  id: string
  eventType: 'FUNDING_CALLBACK' | 'PAYMENT_REQUEST_CALLBACK'
  reference: string
  idempotencyKey: string
  hashValid: boolean
  reconcileVerified: boolean
  idempotentDuplicate: boolean
  amount: number
  payerName?: string
  receivedAt: string
  outcome: string
}

export interface DisputeRecord {
  id: string
  jobId: string
  workerName: string
  clientToken: string
  amount: number
  reason: DisputeReason
  raisedBy: 'client' | 'worker'
  status: 'open' | 'upheld' | 'dismissed'
  createdAt: string
}

export interface PaymentRequestSession {
  referenceNumber: string
  workerSlug: string
  workerName: string
  amount: number
  jobType: JobType
  payerName: string
  payerPhone: string
  state: PaymentRequestState
  pagaTransferAccount: string
  pagaTransferBank: string
  ussdCode: string
  expiresAt: string
  receiptId?: string
}

export interface ConsentRecord {
  id: string
  workerId: string
  lenderName: string
  reportToken: string
  grantedAt: string
  expiresAt: string
  revokedAt?: string
}
