import { Link } from 'react-router-dom'
import { WorkerShell } from '@/components/pw/WorkerShell'
import { Card } from '@/components/ui/card'

const HELP_ITEMS = [
  {
    q: 'How do my Paga payout account and withdrawals work?',
    a: 'Employers fund each job upfront into a dedicated Paga escrow NUBAN. As each workday is confirmed, that day’s pay settles to your Paga payout balance. You can withdraw anytime from Overview to your linked bank account or another Nigerian bank using your 6-digit PIN.',
  },
  {
    q: 'How do I mark a workday done and get paid?',
    a: 'Once a job is funded, tap Mark done on your Overview, in Job records, via Telegram, or by dialing *123# in the USSD simulator. Your employer or site supervisor can confirm immediately, or pay auto-releases after 24 hours if no dispute is raised.',
  },
  {
    q: 'How is my Profile Score (0–100) calculated?',
    a: 'Your Profile Score reflects confirmed work days, unique and repeat employers, and active earning months across four tiers: Building (0–39), Emerging (40–64), Trusted (65–84), and Established (85–100). Active employer or supervisor confirmations carry full weight, while 24h auto-released days carry lower weight.',
  },
  {
    q: 'Where do I find payment receipts and lender reports?',
    a: 'Every settled day payout, completed job, and withdrawal has a downloadable PNG and PDF receipt inside Job records → Transaction history. To share your record with a lender, open Consent to generate a 7-day revocable report link with masked employer details.',
  },
  {
    q: 'How do I change my alert channel?',
    a: 'Open Settings → Preferences to switch between Telegram + SMS fallback and SMS only, or check Settings → Account to view your linked bank account and Paga NUBAN.',
  },
]

export function WorkerHelpPage() {
  return (
    <WorkerShell>
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Worker Help</h1>
        <p className="text-sm text-muted-foreground">
          Plain answers on Paga escrow payouts, withdrawals, receipts, and your Profile Score.
        </p>
      </div>

      <div className="space-y-3">
        {HELP_ITEMS.map((item) => (
          <Card key={item.q} className="p-5 space-y-1.5">
            <h2 className="text-base font-semibold text-foreground">{item.q}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
          </Card>
        ))}
        <p className="text-xs text-muted-foreground pt-2">
          Looking for legal terms or scoring details? Read our{' '}
          <Link to="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>{' '}
          or{' '}
          <Link to="/docs/lenders/profile-score" className="text-primary hover:underline">
            Profile Score guide
          </Link>
          .
        </p>
      </div>
    </WorkerShell>
  )
}
