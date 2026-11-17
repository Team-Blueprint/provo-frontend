export const messages = {
  brand: {
    name: 'Provo',
    tagline: 'Paid daily work records for informal workers',
  },
  outcomes: {
    client: {
      label: 'Employer confirmed',
      help: 'Confirmed directly by the employer after work. Full score weight.',
    },
    supervisor: {
      label: 'Supervisor confirmed',
      help: 'Confirmed by the site supervisor named by the employer. Full score weight.',
    },
    auto: {
      label: 'Auto-released (24h)',
      help: 'No dispute within 24 hours of Done. Released automatically, weighted lower in score.',
    },
  },
  statuses: {
    PENDING: 'Pending',
    DONE_REPORTED: 'Done · 24h window',
    CONFIRMED: 'Confirmed',
    AUTO_RELEASED: 'Auto-released',
    DISPUTED: 'Disputed',
    PAID: 'Paid',
    DRAFT: 'Draft',
    AWAITING_FUNDING: 'Awaiting funding',
    FUNDED: 'Funds locked',
    IN_PROGRESS: 'In progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  },
  confirm: {
    button: 'Confirm day & release pay',
    dispute: 'Dispute this day',
    recordedNotice: (workerName: string) =>
      `Confirming releases today’s pay to ${workerName} and adds it to his work record.`,
    confirmedTitle: 'Day confirmed. Pay released.',
    expiredLink: (workerName: string) =>
      `This confirmation link is no longer active. Check with ${workerName} or open your employer dashboard.`,
  },
  worker: {
    emptyJobs: 'No funded jobs yet. Share your Telegram or profile link with an employer.',
    doneAction: 'Mark day done',
    awaitingConfirm: 'Waiting for employer or supervisor (24h window)',
  },
  consent: {
    summary: (lender: string, date: string) =>
      `You are sharing your verified work record with ${lender} until ${date}. You can stop sharing at any time.`,
    agree: 'Share my income report',
    decline: 'Not now',
  },
  report: {
    fraudNote:
      'Auto-released days count for less than confirmed days. Circular flows, shared phones, and single-payer concentration are flagged openly.',
    tokenNote:
      'Employer identities are tokenized. Full details are released only for an active dispute with consent.',
  },
} as const
