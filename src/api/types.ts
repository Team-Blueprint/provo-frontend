export type JobStatus =
  | 'DRAFT'
  | 'AWAITING_FUNDING'
  | 'FUNDED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED'

export type DayStatus =
  | 'PENDING'
  | 'DONE_REPORTED'
  | 'CONFIRMED'
  | 'AUTO_RELEASED'
  | 'DISPUTED'
  | 'PAID'

export type ConfirmationOutcome = 'client' | 'supervisor' | 'auto'

export type TradeType =
  | 'Bricklaying'
  | 'Plastering'
  | 'Tiling'
  | 'Painting'
  | 'Plumbing'
  | 'Electrical'
  | 'Carpentry'
  | 'Others'

export const TRADES: TradeType[] = [
  'Bricklaying',
  'Plastering',
  'Tiling',
  'Painting',
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Others',
]

export type DisputeReason =
  | 'Work not done'
  | 'Incomplete day'
  | 'Wrong worker'
  | 'Other'

export const DISPUTE_REASONS: DisputeReason[] = [
  'Work not done',
  'Incomplete day',
  'Wrong worker',
  'Other',
]

export interface Worker {
  id: string
  slug: string
  name: string
  phone: string
  trade: TradeType
  customTrade?: string
  area: string
  bankName: string
  bankAccountNumber: string
  pagaAccountNumber: string
  telegramHandle: string
  available: boolean
}

export interface JobDay {
  dayNumber: number
  amountKobo: number
  status: DayStatus
  outcome?: ConfirmationOutcome
  doneAt?: string
  releaseAt?: string
  decidedBy?: string
  decidedAt?: string
}

export interface EscrowJob {
  id: string
  clientId: string
  clientName: string
  clientToken: string
  workerId: string
  workerName: string
  supervisorName?: string
  supervisorPhone?: string
  trade: TradeType
  description: string
  area: string
  totalKobo: number
  daysCount: number
  status: JobStatus
  fundingAccountNumber: string
  fundingLink: string
  days: JobDay[]
  receiptId?: string
  createdAt: string
  flaggedCircular?: boolean
}

export interface ScoreComponent {
  key: 'unique_payers' | 'repeat_clients' | 'active_months' | 'confirmation_quality' | 'deductions'
  label: string
  points: number
  maxPoints: number
  detail: string
}

export interface ClientTokenSummary {
  token: string
  displayLabel: string
  phoneVerified: boolean
  confirmedDays: number
  autoReleasedDays: number
  monthsActive: number
  totalNaira: number
}

export interface OutcomeMixItem {
  outcome: ConfirmationOutcome
  count: number
  amountNaira: number
  percentage: number
}

export interface ActiveMonthCell {
  month: string
  label: string
  confirmedDays: number
  totalNaira: number
}

export interface ReportPayload {
  reportToken: string
  worker: Pick<Worker, 'id' | 'name' | 'trade' | 'area'>
  lenderName: string
  generatedAt: string
  expiresAt: string
  score: number
  band: string
  components: ScoreComponent[]
  outcomeMix: OutcomeMixItem[]
  activeMonths: ActiveMonthCell[]
  clientTokens: ClientTokenSummary[]
  jobs: EscrowJob[]
  circularFlags: string[]
  signedSnapshot: {
    workerId: string
    standingTier: string
    standingScore: number
    signals: {
      confirmedDays: number
      autoReleasedDays: number
      uniqueClients: number
      activeMonths: number
      totalPaidNaira: number
    }
    signedAt: string
    signature: string
  }
}

export interface PagaEventLog {
  id: string
  eventType: 'ESCROW_FUNDED' | 'DAY_PAYOUT' | 'TELEGRAM_CALLBACK'
  reference: string
  idempotencyKey: string
  hashValid: boolean
  reconcileVerified: boolean
  amountNaira: number
  payerName?: string
  receivedAt: string
  outcome: string
}

export interface DisputeRecord {
  id: string
  jobId: string
  dayNumber: number
  workerName: string
  clientToken: string
  amountNaira: number
  reason: DisputeReason
  raisedBy: 'client' | 'supervisor'
  status: 'open' | 'upheld' | 'dismissed'
  createdAt: string
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
