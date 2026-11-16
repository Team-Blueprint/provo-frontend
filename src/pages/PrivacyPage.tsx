import { Link } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'reicon-react'
import { Card } from '@/components/ui/card'

const SHORT_RULES = [
  {
    num: '01',
    title: 'Your record, your data',
    body: 'Every confirmed job and receipt belongs to you. We never sell your history, and we never share it without your explicit consent.',
  },
  {
    num: '02',
    title: 'Plain English, not legalese',
    body: 'We tell you what we collect and why without buried clauses or 30-page contracts written for lawyers.',
  },
  {
    num: '03',
    title: 'NDPA by design',
    body: 'Nigeria’s Data Protection Act sets the floor. Client identities are tokenized on lender reports by default.',
  },
  {
    num: '04',
    title: 'Consent is a switch',
    body: 'Sharing your report with a lender takes a clear yes from you, expires automatically, and can be revoked at any time.',
  },
]

const COLLECT_ROWS = [
  ['Worker profile', 'Your name, phone number, trade, and payout bank account for Paga auto-sweep.'],
  ['Payment callbacks', 'Raw Paga webhook payloads (amount, timestamp, payer bank, and reference) kept as immutable evidence.'],
  ['Client confirmation', 'Client name, verified phone (on Grade 1 links), and the job type picked from the list.'],
  ['Consent logs', 'Timestamp, lender name, and expiry date whenever you authorize a report link.'],
]

const RIGHTS_ROWS = [
  ['Access', 'Ask for a copy of every confirmed job, receipt, and consent record we hold about you.'],
  ['Correction', 'Flag or dispute an incorrect job record within the dispute window.'],
  ['Revoke consent', 'Stop sharing any active lender report link immediately from your worker dashboard.'],
  ['Data minimisation', 'Lenders see tokenized client IDs (e.g. Client A3F), never client phone numbers or bank accounts.'],
]

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-4 z-30 mx-auto max-w-3xl px-4">
        <header className="flex items-center justify-between rounded-full border border-border bg-card/90 px-4 py-2 backdrop-blur-md shadow-[var(--pw-shadow-card)]">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Proofwork</span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
            <span className="text-foreground">Privacy</span>
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
          </div>
        </header>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-14 space-y-16">
        <section className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck weight="Filled" className="h-3.5 w-3.5" aria-hidden="true" />
            <span>NDPA-aligned by design</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
            Privacy at Proofwork.
          </h1>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            How we handle your work, your payment evidence, and your trust in plain language.
          </p>
          <div className="flex items-center justify-center gap-2 pt-1 text-xs font-mono text-muted-foreground">
            <span className="rounded-full border border-border bg-card px-3 py-1">
              UPDATED · NOV 16, 2026
            </span>
            <span className="rounded-full border border-border bg-card px-3 py-1">
              EFFECTIVE · NOV 16, 2026
            </span>
          </div>
        </section>

        <section className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-semibold text-foreground">The short version.</h2>
            <p className="text-sm text-muted-foreground">
              Four rules we hold ourselves to before any legal text below.
            </p>
          </div>
          <div className="rounded-[var(--pw-radius-md)] border border-border bg-card shadow-[var(--pw-shadow-card)] overflow-hidden grid md:grid-cols-2">
            {SHORT_RULES.map((r, idx) => (
              <div
                key={r.num}
                className={`p-6 space-y-2 ${idx < 2 ? 'border-b border-border' : ''} ${
                  idx % 2 === 0 ? 'md:border-r border-border' : ''
                }`}
              >
                <span className="font-mono text-xs text-muted-foreground">{r.num}</span>
                <h3 className="text-base font-semibold text-foreground">{r.title}</h3>
                <p className="text-sm text-muted-foreground">{r.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-[180px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-2 text-xs">
              <p className="font-medium uppercase tracking-wider text-muted-foreground">On this page</p>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#who" className="hover:text-foreground">01 · Who we are</a></li>
                <li><a href="#collect" className="hover:text-foreground">02 · What we collect</a></li>
                <li><a href="#rights" className="hover:text-foreground">03 · Your rights</a></li>
                <li><a href="#security" className="hover:text-foreground">04 · How we protect it</a></li>
              </ul>
            </div>
          </aside>

          <div className="space-y-10">
            <div id="who" className="space-y-2">
              <p className="font-mono text-xs text-muted-foreground">01</p>
              <h2 className="text-xl font-semibold text-foreground">Who we are</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Proofwork is an income verification service built for informal workers in Nigeria.
                We act as a report provider, not a lender and not a custodian of worker funds.
              </p>
            </div>

            <div id="collect" className="space-y-3">
              <p className="font-mono text-xs text-muted-foreground">02</p>
              <h2 className="text-xl font-semibold text-foreground">What we collect</h2>
              <Card className="divide-y divide-border overflow-hidden">
                {COLLECT_ROWS.map(([k, v]) => (
                  <div key={k} className="p-4 grid gap-2 sm:grid-cols-[180px_minmax(0,1fr)] text-sm">
                    <span className="font-medium text-foreground">{k}</span>
                    <span className="text-muted-foreground">{v}</span>
                  </div>
                ))}
              </Card>
            </div>

            <div id="rights" className="space-y-3">
              <p className="font-mono text-xs text-muted-foreground">03</p>
              <h2 className="text-xl font-semibold text-foreground">Your rights under NDPA</h2>
              <Card className="divide-y divide-border overflow-hidden">
                {RIGHTS_ROWS.map(([k, v]) => (
                  <div key={k} className="p-4 grid gap-2 sm:grid-cols-[180px_minmax(0,1fr)] text-sm">
                    <span className="font-medium text-foreground">{k}</span>
                    <span className="text-muted-foreground">{v}</span>
                  </div>
                ))}
              </Card>
            </div>

            <div id="security" className="space-y-2">
              <p className="font-mono text-xs text-muted-foreground">04</p>
              <h2 className="text-xl font-semibold text-foreground">How we protect it</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every Paga callback is verified with SHA-512 (`x-paga-hash-v3`) before processing.
                Lender report links expire automatically and never expose client phone numbers or
                bank account numbers unless an active dispute requires review with consent.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
