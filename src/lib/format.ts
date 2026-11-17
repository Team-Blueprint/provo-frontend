export function formatNaira(amount: number): string {
  return `₦${Math.round(amount).toLocaleString('en-NG')}`
}

export function formatShortDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatTime(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatPhoneNg(input: string): string {
  const digits = input.replace(/\D/g, '')
  if (digits.startsWith('234') && digits.length >= 13) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9, 13)}`
  }
  if (digits.startsWith('0') && digits.length >= 11) {
    return `+234 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`
  }
  return input
}

export function getScoreBand(score: number): string {
  if (score >= 85) return 'Established'
  if (score >= 65) return 'Trusted'
  if (score >= 40) return 'Emerging'
  return 'Building'
}

export function getTierDetails(score: number) {
  if (score >= 85) {
    return {
      tier: 'Established',
      nextTier: null,
      unlocks: 'Best terms from partner lenders, highest credit limits',
      nextStep: 'Keep confirming jobs across active months to maintain tier.',
    }
  }
  if (score >= 65) {
    return {
      tier: 'Trusted',
      nextTier: 'Established (85+)',
      unlocks: 'Eligible for tool-equipment loans and working-capital advances',
      nextStep: 'Add 1 more distinct employer or active month to reach Established.',
    }
  }
  if (score >= 40) {
    return {
      tier: 'Emerging',
      nextTier: 'Trusted (65+)',
      unlocks: 'Starter micro-credit eligibility with partner lenders',
      nextStep: 'Confirm repeat employers across 2+ months to reach Trusted.',
    }
  }
  return {
    tier: 'Building',
    nextTier: 'Emerging (40+)',
    unlocks: 'Building verifiable job history',
    nextStep: 'Confirm jobs from 3+ distinct employers via link or bank transfer.',
  }
}
