import type { EscrowJob, JobDay } from '@/api/types'

export interface TransactionReceipt {
  id: string
  kind: 'day_payout' | 'escrow_lock' | 'withdrawal' | 'job_summary'
  perspective: 'employer' | 'worker'
  title: string
  amountNaira: number
  statusLabel: string
  counterpartyLabel: string
  counterpartyName: string
  counterpartySub: string
  creditedTo?: string
  remark: string
  transactionType: string
  paymentMethod: string
  transactionDate: string
  sessionRef?: string
}

const SETTLED_DAY_STATUSES = new Set(['PAID', 'CONFIRMED', 'AUTO_RELEASED'])

export function isDaySettled(day: JobDay): boolean {
  return SETTLED_DAY_STATUSES.has(day.status)
}

function makeTxNumber(prefix: string, seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return `${prefix}-${String(hash).padStart(10, '0')}`
}

export function buildDayReceipt(
  job: EscrowJob,
  day: JobDay,
  perspective: 'employer' | 'worker',
): TransactionReceipt {
  const amountNaira = Math.round(day.amountKobo / 100)
  const txDate = day.decidedAt || day.doneAt || job.createdAt
  const txId = makeTxNumber('PRV', `${job.id}-d${day.dayNumber}-${perspective}`)
  const method =
    day.outcome === 'auto'
      ? '24h Auto-Release'
      : day.outcome === 'supervisor'
        ? 'Supervisor Sign-off'
        : 'Paga Escrow'

  if (perspective === 'employer') {
    return {
      id: txId,
      kind: 'day_payout',
      perspective,
      title: `Transfer to ${job.workerName}`,
      amountNaira,
      statusLabel: 'Successful',
      counterpartyLabel: 'Recipient Details',
      counterpartyName: job.workerName,
      counterpartySub: `Paga Escrow · ${job.trade}`,
      remark: `${job.description} (Day ${day.dayNumber} of ${job.daysCount})`,
      transactionType: 'Daily Milestone Payout',
      paymentMethod: method,
      transactionDate: txDate,
      sessionRef: job.receiptId || job.id,
    }
  }

  return {
    id: txId,
    kind: 'day_payout',
    perspective,
    title: `Transfer from ${job.clientName}`,
    amountNaira,
    statusLabel: 'Successful',
    creditedTo: 'Available Balance',
    counterpartyLabel: 'Sender Details',
    counterpartyName: job.clientName,
    counterpartySub: `Paga Escrow | ${job.fundingAccountNumber}`,
    remark: `${job.description} · Day ${day.dayNumber} of ${job.daysCount}`,
    transactionType: method === '24h Auto-Release' ? 'Auto-Release Deposit' : 'Milestone Deposit',
    paymentMethod: method,
    transactionDate: txDate,
    sessionRef: job.receiptId || job.id,
  }
}

export function buildEscrowLockReceipt(job: EscrowJob): TransactionReceipt {
  const amountNaira = Math.round(job.totalKobo / 100)
  return {
    id: makeTxNumber('PRV-LOCK', job.id),
    kind: 'escrow_lock',
    perspective: 'employer',
    title: `Escrow Lock for ${job.workerName}`,
    amountNaira,
    statusLabel: 'Successful',
    counterpartyLabel: 'Escrow Account',
    counterpartyName: `${job.workerName} (${job.trade})`,
    counterpartySub: `Paga NUBAN | ${job.fundingAccountNumber}`,
    remark: `${job.description} · ${job.daysCount} days`,
    transactionType: 'Escrow Funding Lock',
    paymentMethod: 'Bank Transfer (Paga NUBAN)',
    transactionDate: job.createdAt,
    sessionRef: job.id,
  }
}

export function buildJobSummaryReceipt(
  job: EscrowJob,
  perspective: 'employer' | 'worker',
): TransactionReceipt {
  const amountNaira = Math.round(job.totalKobo / 100)
  const lastDay = [...job.days].reverse().find((d) => d.decidedAt || d.doneAt)
  const txDate = lastDay?.decidedAt || lastDay?.doneAt || job.createdAt

  if (perspective === 'employer') {
    return {
      id: job.receiptId || makeTxNumber('PRV-JOB', job.id),
      kind: 'job_summary',
      perspective,
      title: `Transfer to ${job.workerName}`,
      amountNaira,
      statusLabel: 'Successful',
      counterpartyLabel: 'Recipient Details',
      counterpartyName: job.workerName,
      counterpartySub: `Paga | ${job.trade} · ${job.area}`,
      remark: `${job.description} (${job.daysCount} days completed)`,
      transactionType: 'Completed Job Settlement',
      paymentMethod: 'Paga Escrow',
      transactionDate: txDate,
      sessionRef: job.id,
    }
  }

  return {
    id: job.receiptId || makeTxNumber('PRV-JOB', job.id),
    kind: 'job_summary',
    perspective,
    title: `Transfer from ${job.clientName}`,
    amountNaira,
    statusLabel: 'Successful',
    creditedTo: 'Available Balance',
    counterpartyLabel: 'Sender Details',
    counterpartyName: job.clientName,
    counterpartySub: `Paga Escrow | ${job.fundingAccountNumber}`,
    remark: `${job.description} (${job.daysCount} days completed)`,
    transactionType: 'Completed Job Settlement',
    paymentMethod: 'Paga Escrow',
    transactionDate: txDate,
    sessionRef: job.id,
  }
}

export function getWithdrawalTransactions(workerId: string): TransactionReceipt[] {
  try {
    const raw = window.localStorage.getItem(`proofwork_withdrawals_${workerId}`)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as TransactionReceipt[]) : []
  } catch {
    return []
  }
}

export function recordWithdrawalTransaction(
  workerId: string,
  input: { amountNaira: number; destination: string; message: string },
): TransactionReceipt {
  const now = new Date().toISOString()
  const receipt: TransactionReceipt = {
    id: makeTxNumber('PRV-WDR', `${workerId}-${now}-${input.amountNaira}`),
    kind: 'withdrawal',
    perspective: 'worker',
    title: `Withdrawal to ${input.destination.split('·')[0]?.trim() || 'Bank'}`,
    amountNaira: input.amountNaira,
    statusLabel: 'Successful',
    creditedTo: input.destination,
    counterpartyLabel: 'Source Account',
    counterpartyName: 'Provo Paga Balance',
    counterpartySub: input.message,
    remark: `Payout to ${input.destination}`,
    transactionType: 'Bank Withdrawal',
    paymentMethod: 'Paga Instant Transfer',
    transactionDate: now,
  }
  const existing = getWithdrawalTransactions(workerId)
  window.localStorage.setItem(
    `proofwork_withdrawals_${workerId}`,
    JSON.stringify([receipt, ...existing]),
  )
  return receipt
}

export function buildTransactionHistory(
  jobs: EscrowJob[],
  perspective: 'employer' | 'worker',
  workerId?: string,
): TransactionReceipt[] {
  const items: TransactionReceipt[] = []

  for (const job of jobs) {
    if (
      perspective === 'employer' &&
      job.status !== 'AWAITING_FUNDING' &&
      job.status !== 'DRAFT' &&
      job.status !== 'CANCELLED'
    ) {
      items.push(buildEscrowLockReceipt(job))
    }

    for (const day of job.days) {
      if (isDaySettled(day)) {
        items.push(buildDayReceipt(job, day, perspective))
      }
    }
  }

  if (perspective === 'worker' && workerId) {
    items.push(...getWithdrawalTransactions(workerId))
  }

  return items.sort(
    (a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime(),
  )
}
