import { Link } from 'react-router-dom'
import { WorkerShell } from '@/components/pw/WorkerShell'
import { Card } from '@/components/ui/card'

const HELP_ITEMS = [
  {
    q: 'How does my Paga account number work?',
    a: 'Every payment transferred to your 10-digit Paga NUBAN sweeps straight to your payout bank account and creates a waiting job record.',
  },
  {
    q: 'Why do I need to link unknown transfers?',
    a: 'Bank transfers include the sender’s name and bank, not their phone number. Linking a client once lets Proofwork send them the 1-tap confirmation automatically next time.',
  },
  {
    q: 'How do cash jobs count?',
    a: 'Cash jobs you log stay drafts until your client confirms them. Confirmed cash jobs appear at Grade 3 and are capped at 20% of your score.',
  },
]

export function WorkerHelpPage() {
  return (
    <WorkerShell>
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Worker Help</h1>
        <p className="text-sm text-muted-foreground">
          Plain answers on Paga transfers, client confirmations, and your score.
        </p>
      </div>

      <div className="space-y-3 max-w-2xl">
        {HELP_ITEMS.map((item) => (
          <Card key={item.q} className="p-5 space-y-1.5">
            <h2 className="text-base font-semibold text-foreground">{item.q}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
          </Card>
        ))}
        <p className="text-xs text-muted-foreground pt-2">
          Looking for legal terms? Read our{' '}
          <Link to="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </WorkerShell>
  )
}
