import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle,
  Play,
  ShieldCheck,
  WarningCircle,
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AmountText } from '@/components/pw/AmountText'
import { GradeBadge } from '@/components/pw/GradeBadge'
import { RevealSection } from '@/components/pw/RevealSection'
import { ScrollRevealText } from '@/components/pw/ScrollRevealText'
import { StatusPill } from '@/components/pw/StatusPill'

const WITHOUT_ITEMS = [
  {
    title: 'NIP / OKOYE C. — ₦15,000',
    note: 'Bank statement shows a deposit, not whether it was bricklaying or a birthday gift.',
    tilt: '-rotate-2',
  },
  {
    title: 'Paper notebook lost in rain',
    note: 'Cash jobs vanish from memory. No receipts, no repeat-client trail.',
    tilt: 'rotate-1',
  },
  {
    title: 'Self-typed spreadsheets',
    note: 'Lenders reject worker-entered logs because anyone can type fake numbers.',
    tilt: '-rotate-1',
  },
  {
    title: '“Bring 6 months of statements”',
    note: '41M informal workers turned away before a loan officer even reads their story.',
    tilt: 'rotate-2',
  },
]

const WITH_ITEMS = [
  {
    title: 'Dedicated Paga NUBAN',
    highlight: '3104829104 · Auto-sweeps to bank',
    note: 'Paga webhooks log every transfer without Proofwork ever holding funds.',
    footer: 'Webhook verified',
  },
  {
    title: 'One-tap client confirm',
    highlight: '“Yes, this was for work” · Bricklaying',
    note: 'Client confirms in 15 seconds with no app. Numbered receipt issued.',
    footer: 'Receipt issued',
  },
  {
    title: 'Signed Lender Report',
    highlight: '82 / 100 · Trusted · Ed25519 JSON',
    note: 'Tokenized clients, active months, and cash capped at 20%.',
    footer: 'Ready for underwriting',
  },
]

const FOUR_STEPS = [
  {
    num: '01',
    title: 'Client pays through Paga',
    body: 'Through Emem’s Proofwork link (Grade 1) or his 10-digit Paga Subsidiary Account (Grade 2). Funds sweep straight to his bank.',
  },
  {
    num: '02',
    title: 'Webhook verifies & reconciles',
    body: 'Proofwork verifies x-paga-hash-v3, deduplicates by idempotency key, and confirms settlement against Paga /status.',
  },
  {
    num: '03',
    title: 'Client confirms in one tap',
    body: 'No app, no account. The client picks the job type from a fixed list and taps "Yes, this was for work" to issue a receipt.',
  },
  {
    num: '04',
    title: 'Lender reads signed snapshot',
    body: 'With Emem’s consent, the lender opens an expiring report and copies the Ed25519-signed JSON snapshot for underwriting.',
  },
]

const FAQS = [
  {
    q: 'Do clients need a smartphone app or a Proofwork account?',
    a: 'No. Clients open a single web link from WhatsApp or SMS, pick the job type, and confirm in one tap.',
  },
  {
    q: 'How does Proofwork stop workers from faking their own income?',
    a: 'A job typed in by the worker stays a draft and counts for zero. Only a client payment and client confirmation create a confirmed record, and circular flows are flagged openly.',
  },
  {
    q: 'Does Proofwork hold the worker’s money?',
    a: 'No. Paga Subsidiary Accounts auto-sweep directly to the worker’s bank account so Proofwork stays a zero-custody verification layer.',
  },
  {
    q: 'How are cash jobs treated?',
    a: 'Cash jobs require client confirmation, display a lighter dashed Grade 3 pill, and are capped at 20% of the score.',
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
            <a href="#grades" className="hover:text-foreground transition-colors">
              Grades
            </a>
            <Link to="/design-system" className="hover:text-foreground transition-colors">
              Design system
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/report/rep_emem_lapo_2026" className="hidden sm:inline-block">
              <Button size="sm" variant="ghost" className="rounded-full">
                Lender view
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

      <main className="mx-auto max-w-5xl px-4 pt-14 pb-20 space-y-24">
        <section className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7 space-y-5">
            <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-foreground leading-[1.04]">
              Real work, counted. Real income, proven.
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl">
              Proofwork gives bricklayers, tailors, and mechanics a dedicated Paga account and
              payment link. Every client payment is confirmed in one tap and turned into a credit
              record lenders can trust.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <Link to="/worker">
                <Button className="w-full sm:w-auto rounded-full">
                  <span>Open worker demo</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="secondary" className="w-full sm:w-auto rounded-full">
                  <Play weight="fill" className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>See how it works</span>
                </Button>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <Card className="p-5 space-y-4 bg-card">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <p className="text-xs font-medium text-primary">Trusted tier</p>
                  <p className="text-base font-semibold text-foreground">
                    Emem Bassey · Bricklayer
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold tabular-nums text-foreground">82</span>
                  <span className="text-xs text-muted-foreground"> / 100</span>
                </div>
              </div>

              <div className="divide-y divide-border">
                <div className="py-3 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      Client A3F · Bricklaying
                    </span>
                    <AmountText amount={42000} size="sm" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <GradeBadge grade={1} size="sm" />
                    <StatusPill status="confirmed" />
                  </div>
                </div>

                <div className="py-3 last:pb-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      Client B7K · Renovation
                    </span>
                    <AmountText amount={32000} size="sm" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <GradeBadge grade={2} size="sm" />
                    <StatusPill status="confirmed" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <span>Ed25519 signed snapshot</span>
                <Link
                  to="/report/rep_emem_lapo_2026"
                  className="font-medium text-primary hover:underline"
                >
                  Inspect report →
                </Link>
              </div>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-3xl py-6">
          <ScrollRevealText
            text="Across Africa, 83% of jobs are informal. Artisans earn money every week, yet bank statements cannot tell a job payment from a gift. Proofwork pairs Paga payment records with one-tap client confirmation so real work finally counts toward credit."
            className="text-2xl sm:text-4xl font-semibold tracking-tight leading-[1.2] text-foreground"
          />
        </section>

        <RevealSection className="space-y-6">
          <div className="rounded-[var(--pw-radius-lg)] bg-foreground text-background p-8 sm:p-12 space-y-8">
            <h2 className="text-2xl sm:text-4xl font-semibold text-center tracking-tight">
              Without Proofwork
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {WITHOUT_ITEMS.map((item) => (
                <div
                  key={item.title}
                  className={`rounded-[var(--pw-radius-sm)] border border-background/15 bg-background/5 p-5 space-y-2 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:rotate-0 hover:-translate-y-1 ${item.tilt}`}
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-background">
                    <WarningCircle className="h-4 w-4 text-[var(--pw-brick)] shrink-0" />
                    <span>{item.title}</span>
                  </div>
                  <p className="text-xs text-background/70 pl-6 leading-relaxed">{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[var(--pw-radius-lg)] border border-border bg-muted/40 p-8 sm:p-12 space-y-8">
            <h2 className="text-2xl sm:text-4xl font-semibold text-center tracking-tight text-foreground">
              With Proofwork
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {WITH_ITEMS.map((item) => (
                <Card
                  key={item.title}
                  className="p-5 flex flex-col justify-between gap-5 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <CheckCircle weight="fill" className="h-4 w-4 text-primary shrink-0" />
                      <span>{item.title}</span>
                    </div>
                    <div className="rounded-[var(--pw-radius-sm)] border border-border bg-background px-3 py-2 font-mono text-xs text-foreground">
                      {item.highlight}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.note}</p>
                  </div>
                  <p className="text-xs font-medium text-primary border-t border-border pt-3">
                    {item.footer}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </RevealSection>

        <RevealSection className="space-y-6">
          <div id="how-it-works" className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
                Four steps to a bank-ready record.
              </h2>
              <p className="text-sm text-muted-foreground">
                Workers never self-certify their income. Every step is backed by Paga and client
                confirmation.
              </p>
            </div>
            <Link to="/pay/emem-uyo">
              <Button size="sm" variant="secondary">
                Try pay link →
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

        <RevealSection className="space-y-6">
          <div id="grades" className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
              Three evidence grades, never blurred.
            </h2>
            <p className="text-sm text-muted-foreground">
              A lender always sees how a job was verified. Cash never looks like a bank transfer.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-5 space-y-3">
              <GradeBadge grade={1} />
              <p className="text-sm text-muted-foreground">
                Client paid through the Proofwork link with a verified phone number. Full weight.
              </p>
            </Card>
            <Card className="p-5 space-y-3">
              <GradeBadge grade={2} />
              <p className="text-sm text-muted-foreground">
                Client transferred to the worker’s dedicated Paga account and confirmed. Full weight.
              </p>
            </Card>
            <Card className="p-5 space-y-3">
              <GradeBadge grade={3} />
              <p className="text-sm text-muted-foreground">
                Worker logged a cash job and the client confirmed it. Capped at 20% of score.
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

        <section className="rounded-[var(--pw-radius-lg)] bg-primary text-primary-foreground p-8 sm:p-12 text-center space-y-5">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium opacity-85">
            <ShieldCheck weight="fill" className="h-4 w-4" aria-hidden="true" />
            <span>Built on PagaEngine</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight">
            Test Emem’s 4-month record live.
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Link to="/worker">
              <Button variant="secondary" size="md" className="rounded-full">
                Worker view
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
            <Link to="/admin">
              <Button variant="secondary" size="md" className="rounded-full">
                Admin audit ledger
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
