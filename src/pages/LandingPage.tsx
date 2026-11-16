import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Play,
  ShieldCheck,
} from 'reicon-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AmountText } from '@/components/pw/AmountText'
import { GradeBadge } from '@/components/pw/GradeBadge'
import { RevealSection } from '@/components/pw/RevealSection'
import { ScrollRevealText } from '@/components/pw/ScrollRevealText'
import { StatusPill } from '@/components/pw/StatusPill'
import { WithoutWithSection } from '@/components/pw/WithoutWithSection'

const FOUR_STEPS = [
  {
    num: '01',
    title: 'Client funds job upfront',
    body: 'Client picks an artisan like Emem Ekpo, sets the daily rate and days, and locks total funds via a one-time Paga NUBAN or payment link.',
  },
  {
    num: '02',
    title: 'Worker marks each day done',
    body: 'On Telegram, Web, or USSD (*347*900#), Emem taps Done at close of day. That starts a 24-hour confirmation window.',
  },
  {
    num: '03',
    title: 'Client or supervisor confirms',
    body: 'One tap releases that day’s tranche to Emem’s Paga account with full score weight. After 24h with no dispute, auto-release pays out.',
  },
  {
    num: '04',
    title: 'Lender reads signed snapshot',
    body: 'With Emem’s consent, the lender opens an expiring report showing client-confirmed, supervisor-confirmed, and auto-released days.',
  },
]

const FAQS = [
  {
    q: 'Do clients or workers need to install a mobile app?',
    a: 'No. Workers mostly use Telegram or USSD (*347*900#), and clients can fund and confirm directly on the web or via Telegram.',
  },
  {
    q: 'How does Proofwork stop workers from faking their own income?',
    a: 'Every job starts with real money locked in Paga escrow by the client. A worker can only mark a funded day done, and client-confirmed days carry full score weight.',
  },
  {
    q: 'What happens if a client forgets to confirm a day?',
    a: 'A 24-hour window runs after the worker marks the day done. If the client does not dispute within 24 hours, the scheduler releases that day’s pay automatically at lower score weight.',
  },
  {
    q: 'Can a site supervisor confirm days on the client’s behalf?',
    a: 'Yes. A client can name a supervisor on multi-day jobs so a foreman on site can confirm or dispute each day’s work.',
  },
]

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number>(0)
  const [email, setEmail] = useState('')
  const [joined, setJoined] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-4 z-30 mx-auto max-w-3xl px-4">
        <header className="flex items-center justify-between rounded-full border border-border bg-card/90 px-4 py-2 backdrop-blur-md shadow-[var(--pw-shadow-card)]">
          <Link to="/" className="flex items-center gap-2 pl-1 font-semibold text-foreground">
            <span
              className="inline-block h-2.5 w-2.5 rounded-[3px] bg-[var(--pw-brick)]"
              aria-hidden="true"
            />
            <span>Proofwork</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              How it works
            </a>
            <a href="#outcomes" className="hover:text-foreground transition-colors">
              Outcomes
            </a>
            <Link to="/design-system" className="hover:text-foreground transition-colors">
              Design system
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/sign-in" className="hidden sm:inline-block">
              <Button size="sm" variant="ghost" className="rounded-full">
                Sign in
              </Button>
            </Link>
            <Link to="/worker">
              <Button size="sm" className="rounded-full">
                Open demo
              </Button>
            </Link>
          </div>
        </header>
      </div>

      <main className="mx-auto max-w-7xl px-6 lg:px-10 pt-14 pb-20 space-y-24">
        <section className="space-y-12 pt-4">
          <div className="mx-auto max-w-3xl text-center space-y-5">
            <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-foreground leading-[1.04]">
              Real work, counted. Real income, proven.
            </h1>
            <p className="mx-auto max-w-xl text-base sm:text-lg text-muted-foreground">
              Clients lock job funds in Paga escrow before work begins. Bricklayers, tailors, and
              mechanics mark each day done on Telegram, Web, or USSD, building a verified credit
              record lenders can trust.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              <Link to="/worker" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto rounded-full">
                  <span>Open worker demo</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full sm:w-auto rounded-full">
                  <Play weight="Filled" className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>See how it works</span>
                </Button>
              </a>
            </div>
          </div>

          <div
            className="relative mx-auto max-w-5xl rounded-[var(--pw-radius-lg)] p-4 sm:p-12"
            style={{
              backgroundImage:
                'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(0, 49, 112, 0.14) 0%, rgba(14, 90, 107, 0.06) 52%, transparent 78%), radial-gradient(rgba(0, 49, 112, 0.12) 1px, transparent 1px)',
              backgroundSize: '100% 100%, 20px 20px',
            }}
          >
            <Card className="overflow-hidden border border-border bg-card shadow-[var(--pw-shadow-sheet)]">
              <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-border" />
                  <span className="h-2.5 w-2.5 rounded-full bg-border" />
                  <span className="h-2.5 w-2.5 rounded-full bg-border" />
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  proofwork.ng/worker
                </span>
                <span className="text-xs font-medium text-primary">Trusted · 82/100</span>
              </div>

              <div className="grid md:grid-cols-[200px_minmax(0,1fr)]">
                <div className="hidden md:flex flex-col justify-between border-r border-border bg-muted/20 p-4 text-xs">
                  <div className="space-y-3">
                    <p className="font-semibold text-foreground">Emem Ekpo</p>
                    <div className="space-y-1 text-muted-foreground">
                      <p className="rounded-[var(--pw-radius-xs)] bg-primary px-2.5 py-1.5 font-medium text-primary-foreground">
                        Overview
                      </p>
                      <p className="px-2.5 py-1.5">Job records</p>
                      <p className="px-2.5 py-1.5">Share report</p>
                      <p className="px-2.5 py-1.5">Profile</p>
                    </div>
                  </div>
                  <p className="font-mono text-[10px] text-muted-foreground">Paga 0803 441 9210</p>
                </div>

                <div className="p-5 sm:p-6 space-y-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[var(--pw-radius-sm)] border border-border bg-background p-3.5 space-y-1">
                      <span className="text-xs text-muted-foreground">Score</span>
                      <p className="text-2xl font-bold tabular-nums text-foreground">82 / 100</p>
                    </div>
                    <div className="rounded-[var(--pw-radius-sm)] border border-border bg-background p-3.5 space-y-1">
                      <span className="text-xs text-muted-foreground">Paid days</span>
                      <p className="text-2xl font-bold tabular-nums text-foreground">12</p>
                    </div>
                    <div className="rounded-[var(--pw-radius-sm)] border border-border bg-background p-3.5 space-y-1">
                      <span className="text-xs text-muted-foreground">Active months</span>
                      <p className="text-2xl font-bold tabular-nums text-primary">4 mos</p>
                    </div>
                  </div>

                  <div className="divide-y divide-border rounded-[var(--pw-radius-sm)] border border-border">
                    <div className="p-3 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Chief Etim · Bricklaying (Day 1)
                        </p>
                        <div className="flex gap-1.5 pt-1">
                          <GradeBadge outcome="client" size="sm" />
                          <StatusPill status="PAID" />
                        </div>
                      </div>
                      <AmountText amount={14000} size="sm" />
                    </div>
                    <div className="p-3 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Mrs. Okon · Renovation (Day 2)
                        </p>
                        <div className="flex gap-1.5 pt-1">
                          <GradeBadge outcome="supervisor" size="sm" />
                          <StatusPill status="PAID" />
                        </div>
                      </div>
                      <AmountText amount={16000} size="sm" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="rounded-[var(--pw-radius-md)] border border-border bg-card shadow-[var(--pw-shadow-card)] grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border">
          <div className="p-5 space-y-1">
            <p className="text-2xl sm:text-3xl font-semibold tabular-nums text-foreground">41M</p>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Informal workers in Nigeria
            </p>
          </div>
          <div className="p-5 space-y-1">
            <p className="text-2xl sm:text-3xl font-semibold tabular-nums text-foreground">83%</p>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Jobs across Africa (ILO 2024)
            </p>
          </div>
          <div className="p-5 space-y-1">
            <p className="text-2xl sm:text-3xl font-semibold tabular-nums text-foreground">70.7%</p>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Borrow from friends &amp; family
            </p>
          </div>
          <div className="p-5 space-y-1">
            <p className="text-2xl sm:text-3xl font-semibold tabular-nums text-primary">&lt;15s</p>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              1-tap client confirmation
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl py-6">
          <ScrollRevealText
            text="Across Africa, 83% of jobs are informal. Artisans earn money every week, yet bank statements cannot tell a job payment from a gift. Proofwork pairs Paga escrow locks with per-day work confirmation so real work finally counts toward credit."
            className="text-2xl sm:text-4xl font-semibold tracking-tight leading-[1.2] text-foreground"
          />
        </section>

        <WithoutWithSection />

        <RevealSection className="space-y-6">
          <div id="how-it-works" className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
                Four steps to a bank-ready record.
              </h2>
              <p className="text-sm text-muted-foreground">
                Workers never self-certify their income. Every day is backed by upfront Paga escrow
                and client confirmation.
              </p>
            </div>
            <Link to="/client">
              <Button size="sm" variant="secondary">
                Try client escrow →
              </Button>
            </Link>
          </div>
            <div className="rounded-[var(--pw-radius-md)] border border-border bg-card shadow-[var(--pw-shadow-card)] overflow-hidden grid md:grid-cols-2">
            {FOUR_STEPS.map((s, idx) => (
              <div
                key={s.num}
                className={`p-6 sm:p-8 space-y-3 ${
                  idx < 2 ? 'border-b border-border' : ''
                } ${idx % 2 === 0 ? 'md:border-r border-border' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground">{s.num}</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </RevealSection>

        <RevealSection className="rounded-[var(--pw-radius-lg)] bg-foreground text-background p-8 sm:p-12 space-y-8">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7 space-y-2">
              <p className="font-mono text-xs uppercase tracking-wider text-background/55">
                PagaEngine Infrastructure
              </p>
              <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight">
                Remove Paga, the product disappears.
              </h2>
            </div>
            <p className="lg:col-span-5 text-sm text-background/70">
              Proofwork cannot exist without Paga-confirmed transactions. Three PagaEngine surfaces
              do core structural work, not decorative payments.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[var(--pw-radius-sm)] border border-background/15 bg-background/5 p-5 space-y-2">
              <p className="text-sm font-semibold">One-time Escrow NUBANs</p>
              <p className="text-xs text-background/70 leading-relaxed">
                Generated per job so the client locks the full amount upfront via bank transfer or
                payment link before day 1 begins.
              </p>
            </div>
            <div className="rounded-[var(--pw-radius-sm)] border border-background/15 bg-background/5 p-5 space-y-2">
              <p className="text-sm font-semibold">Per-Day Disbursements</p>
              <p className="text-xs text-background/70 leading-relaxed">
                Each confirmed day (or 24-hour auto-release) triggers an idempotent Paga transfer to
                the worker’s Paga account.
              </p>
            </div>
            <div className="rounded-[var(--pw-radius-sm)] border border-background/15 bg-background/5 p-5 space-y-2">
              <p className="text-sm font-semibold">x-paga-hash-v3 + /status</p>
              <p className="text-xs text-background/70 leading-relaxed">
                SHA-512 webhook verification, idempotency keys, and /status reconciliation on every
                funding lock and payout.
              </p>
            </div>
          </div>

          <div className="rounded-[var(--pw-radius-sm)] border border-background/15 bg-background/5 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-mono uppercase tracking-wider text-background/60">
                Lifecycle of a job day
              </span>
              <span className="font-mono text-background/60">
                escrow-locked · idempotent · reconciled
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-4 text-xs">
              <div className="rounded-[var(--pw-radius-sm)] border border-background/10 p-3 space-y-1">
                <span className="font-mono text-background/50">Day 0</span>
                <p className="font-medium">Client funds Paga NUBAN</p>
              </div>
              <div className="rounded-[var(--pw-radius-sm)] border border-background/10 p-3 space-y-1">
                <span className="font-mono text-background/50">Close of day</span>
                <p className="font-medium">Worker marks Day Done</p>
              </div>
              <div className="rounded-[var(--pw-radius-sm)] border border-background/10 p-3 space-y-1">
                <span className="font-mono text-background/50">&le;24h window</span>
                <p className="font-medium">Client/Supervisor confirms</p>
              </div>
              <div className="rounded-[var(--pw-radius-sm)] border border-background/10 p-3 space-y-1">
                <span className="font-mono text-background/50">Instant</span>
                <p className="font-medium">Paga payout + Score updated</p>
              </div>
            </div>
          </div>
        </RevealSection>

        <RevealSection className="space-y-6">
          <div id="outcomes" className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
              Three confirmation outcomes, never blurred.
            </h2>
            <p className="text-sm text-muted-foreground">
              A lender always sees who confirmed each day. Auto-released days never masquerade as
              client sign-off.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-5 space-y-3">
              <GradeBadge outcome="client" />
              <p className="text-sm text-muted-foreground">
                Client funded escrow upfront and confirmed the day’s work directly. Full score
                weight.
              </p>
            </Card>
            <Card className="p-5 space-y-3">
              <GradeBadge outcome="supervisor" />
              <p className="text-sm text-muted-foreground">
                Named site supervisor confirmed the day on the client’s behalf. Full score weight.
              </p>
            </Card>
            <Card className="p-5 space-y-3">
              <GradeBadge outcome="auto" />
              <p className="text-sm text-muted-foreground">
                No dispute within 24 hours of Done; funds released automatically. Reduced score
                weight.
              </p>
            </Card>
          </div>
        </RevealSection>

        <RevealSection className="mx-auto max-w-2xl space-y-4">
          <h2 className="text-2xl font-semibold text-center text-foreground">
            Questions, answered plainly.
          </h2>
          <div className="divide-y divide-border border-y border-border">
            {FAQS.map((item, idx) => (
              <div key={item.q} className="py-3.5">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  className="flex w-full items-center justify-between text-left text-sm font-medium text-foreground cursor-pointer"
                >
                  <span>{item.q}</span>
                  <span className="font-mono text-muted-foreground ml-4">
                    {openFaq === idx ? '−' : '+'}
                  </span>
                </button>
                {openFaq === idx && (
                  <p className="pt-2 text-sm text-muted-foreground">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </RevealSection>

        <section
          className="rounded-[var(--pw-radius-lg)] border border-border p-10 sm:p-16 text-center space-y-5 shadow-[var(--pw-shadow-card)]"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 80% 70% at 50% 0%, rgba(0, 49, 112, 0.13) 0%, rgba(255, 255, 255, 0.96) 72%), radial-gradient(rgba(0, 49, 112, 0.1) 1px, transparent 1px)',
            backgroundSize: '100% 100%, 20px 20px',
          }}
        >
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-[var(--pw-radius-sm)] bg-primary text-primary-foreground">
            <ShieldCheck weight="Filled" className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Stop running on guesswork.
          </h2>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            Walk through Emem Ekpo’s 4-month bricklaying record across worker, client, and lender
            surfaces.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Link to="/worker">
              <Button size="md" className="rounded-full">
                Open worker demo
              </Button>
            </Link>
            <Link to="/pay/emem-uyo">
              <Button variant="secondary" size="md" className="rounded-full">
                Client pay link
              </Button>
            </Link>
            <Link to="/report/rep_emem_lapo_2026">
              <Button variant="secondary" size="md" className="rounded-full">
                Lender report
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-foreground text-background">
        <div className="mx-auto max-w-5xl px-4 pt-14 pb-10 space-y-12">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4 space-y-4">
              <Link to="/" className="flex items-center gap-2 font-semibold text-background">
                <span
                  className="inline-block h-3 w-3 rounded-[3px] bg-[var(--pw-brick)]"
                  aria-hidden="true"
                />
                <span>Proofwork</span>
              </Link>
              <p className="text-xs text-background/70 max-w-xs">
                Payer-confirmed income records for informal workers, powered by PagaEngine.
              </p>
              <div className="space-y-2 pt-1">
                <p className="text-xs text-background/60">Lender &amp; pilot updates.</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (email.trim()) {
                      setJoined(true)
                      setEmail('')
                    }
                  }}
                  className="flex items-center rounded-full border border-background/20 bg-background/5 p-1 max-w-xs"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    aria-label="Email address"
                    className="w-full bg-transparent px-3 py-1.5 text-xs text-background placeholder:text-background/50 focus:outline-none focus:ring-0"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-background px-4 py-1.5 text-xs font-semibold text-foreground hover:bg-background/90 transition-colors cursor-pointer shrink-0"
                  >
                    {joined ? 'Joined' : 'Join'}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 text-xs">
              <div className="space-y-3">
                <p className="font-medium uppercase tracking-wider text-background/50">Surfaces</p>
                <ul className="space-y-2 text-background/80">
                  <li>
                    <Link to="/worker" className="hover:text-background">
                      Worker app
                    </Link>
                  </li>
                  <li>
                    <Link to="/pay/emem-uyo" className="hover:text-background">
                      Client pay link
                    </Link>
                  </li>
                  <li>
                    <Link to="/confirm/tok_confirm_110" className="hover:text-background">
                      One-tap confirm
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <p className="font-medium uppercase tracking-wider text-background/50">Lenders</p>
                <ul className="space-y-2 text-background/80">
                  <li>
                    <Link to="/report/rep_emem_lapo_2026" className="hover:text-background">
                      Sample report
                    </Link>
                  </li>
                  <li>
                    <Link to="/worker/consent" className="hover:text-background">
                      Consent flow
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin" className="hover:text-background">
                      Audit ledger
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <p className="font-medium uppercase tracking-wider text-background/50">System</p>
                <ul className="space-y-2 text-background/80">
                  <li>
                    <Link to="/design-system" className="hover:text-background">
                      Design system
                    </Link>
                  </li>
                  <li>
                    <a href="#how-it-works" className="hover:text-background">
                      How it works
                    </a>
                  </li>
                  <li>
                    <a href="#grades" className="hover:text-background">
                      Evidence grades
                    </a>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <p className="font-medium uppercase tracking-wider text-background/50">Legal</p>
                <ul className="space-y-2 text-background/80">
                  <li>
                    <Link to="/privacy" className="hover:text-background">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className="hover:text-background">
                      Terms of Use
                    </Link>
                  </li>
                  <li>NDPA consent</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="overflow-hidden select-none pt-4">
            <p
              aria-label="proofwork"
              className="flex justify-center text-[16vw] sm:text-[138px] font-bold tracking-[-0.04em] leading-[0.88]"
            >
              {'proofwork'.split('').map((char, idx) => (
                <span
                  key={`${char}-${idx}`}
                  className="inline-block text-background/20 transition-[transform,color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-3 hover:text-background/95 cursor-default"
                >
                  {char}
                </span>
              ))}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-background/15 pt-6 text-xs text-background/60">
            <p>© 2026 Proofwork. Built for TechIgnite 2026.</p>
            <p>Powered by PagaEngine Subsidiary Accounts &amp; Collect API</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
