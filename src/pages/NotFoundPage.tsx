import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Search } from 'reicon-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const WAYFINDER_LINKS = [
  {
    title: 'Worker Dashboard',
    description: 'Emem Ekpo’s active funded jobs, daily Done buttons, and payout Paga account.',
    to: '/worker',
  },
  {
    title: 'Client Escrow',
    description: 'Create an escrow-backed job, lock funds via Paga, and confirm or dispute days.',
    to: '/client',
  },
  {
    title: 'Supervisor View',
    description: 'Site foreman screen to confirm or dispute days on multi-day jobs.',
    to: '/supervisor',
  },
  {
    title: 'USSD Simulator',
    description: 'Interactive *347*900# feature-phone dialer for marking days done and checking scores.',
    to: '/ussd',
  },
  {
    title: 'Lender Report',
    description: '0–100 score, outcome mix, and Ed25519-signed JSON snapshot.',
    to: '/report/rep_emem_lapo_2026',
  },
]

export function NotFoundPage() {
  const [query, setQuery] = useState('')
  const filtered = WAYFINDER_LINKS.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-6 sm:p-10">
      <header className="mx-auto w-full max-w-3xl flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
          <span
            className="inline-block h-2.5 w-2.5 rounded-[3px] bg-[var(--pw-brick)]"
            aria-hidden="true"
          />
          <span>Proofwork</span>
        </Link>
        <Link to="/">
          <Button size="sm" variant="secondary">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back home</span>
          </Button>
        </Link>
      </header>

      <main className="mx-auto w-full max-w-3xl py-12 space-y-8">
        <div className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-wider text-primary">404 · Not found</p>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-foreground">
            This page isn’t in the ledger.
          </h1>
          <p className="text-base text-muted-foreground max-w-xl">
            The link may have expired or moved. Pick one of the live Proofwork surfaces below.
          </p>
        </div>

        <div className="flex items-center gap-2.5 rounded-[var(--pw-radius-sm)] border border-input bg-card px-3.5 py-2.5 focus-within:border-primary">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a surface (worker, pay, lender, confirm)..."
            aria-label="Search Proofwork surfaces"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/65 focus:outline-none focus:ring-0"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((item) => (
            <Link key={item.to} to={item.to}>
              <Card className="h-full p-5 flex flex-col justify-between gap-4 hover:border-primary transition-colors">
                <div className="space-y-1">
                  <h2 className="text-base font-semibold text-foreground">{item.title}</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                  <span>Open</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </main>

      <footer className="mx-auto w-full max-w-3xl text-xs text-muted-foreground flex items-center justify-between border-t border-border pt-6">
        <span>Proofwork · TechIgnite 2026</span>
        <Link to="/privacy" className="hover:text-foreground">
          Privacy Policy
        </Link>
      </footer>
    </div>
  )
}
