export const messages = {
  brand: {
    name: 'Proofwork',
    tagline: 'Payer-confirmed income records for informal workers',
  },
  grades: {
    1: {
      label: 'Paid via link',
      help: 'Paid through the Proofwork link with a verified client phone number. Full weight.',
    },
    2: {
      label: 'Transfer confirmed',
      help: 'Transferred to the worker’s dedicated Paga account and confirmed by the client. Full weight.',
    },
    3: {
      label: 'Cash confirmed',
      help: 'Cash is confirmed by the client but not by a payment record, so it counts for less.',
    },
  },
  statuses: {
    draft: 'Draft',
    waiting: 'Waiting for confirmation',
    confirmed: 'Confirmed',
    disputed: 'Disputed',
    expired: 'Expired, not confirmed',
    failed: 'Payment failed',
  },
  confirm: {
    button: 'Yes, this was for work',
    notForWork: "This wasn't for work",
    recordedNotice: (workerName: string) =>
      `This payment will be recorded in ${workerName}'s income record.`,
    confirmedTitle: 'Confirmed. Your receipt is ready.',
    alreadyConfirmed: 'This job is already confirmed.',
    expiredLink: (workerName: string) =>
      `This link has expired. Ask ${workerName} for a new one.`,
    disabledReason: 'Pick a job type above to confirm.',
  },
  payment: {
    pending: "We're waiting for your bank. This can take a few minutes.",
    paid: 'Payment confirmed. Your receipt is ready.',
    failed: "The payment didn't go through. Try again or use bank transfer.",
    expired: 'This payment request expired. Start a new payment below.',
  },
  worker: {
    emptyJobs: 'No jobs yet. Send your payment link to a client.',
    waitingLine: 'Waiting for the client to confirm',
    cashDraftLine: 'Draft. It counts once the client confirms.',
    unknownTransfer: 'New transfer received. Who paid you?',
    resendAction: 'Resend confirmation',
  },
  consent: {
    summary: (lender: string, date: string) =>
      `You are sharing your income record with ${lender} until ${date}. You can stop sharing at any time.`,
    agree: 'Share my income report',
    decline: 'Not now',
  },
  report: {
    fraudNote:
      'Cash jobs are capped at 20% of the score. Circular patterns and disputes are flagged openly so fraud is costly and visible, not hidden.',
    tokenNote:
      'Client identities are tokenized. Full details are released only for an active dispute with consent.',
  },
} as const
