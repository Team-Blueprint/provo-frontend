import { Link } from 'react-router-dom'
import { ArrowLeft, FileText } from 'reicon-react'
import { Card } from '@/components/ui/card'
import { SiteFooter } from '@/components/pw/SiteFooter'

const SHORT_TERMS = [
  {
    num: '01',
    title: 'Zero custody',
    body: 'Payments sent to your dedicated Paga Subsidiary Account auto-sweep to your bank account. Proofwork does not hold your money.',
  },
  {
    num: '02',
    title: 'Only confirmed work counts',
    body: 'Jobs you log yourself stay drafts and count for zero until a client confirms them. Attempting circular payments will flag your score.',
  },
  {
    num: '03',
    title: 'Report provider only',
    body: 'Proofwork provides verified income reports to lenders you choose. We do not underwrite or disburse loans directly.',
  },
  {
    num: '04',
    title: 'Dispute window',
    body: 'Either party can flag an incorrect job inside the dispute window. Disputed jobs drop out of the score while reviewed.',
  },
]

export function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-4 z-30 mx-auto max-w-3xl px-4">
        <header className="flex items-center justify-between rounded-full border border-border bg-card/90 px-4 py-2 backdrop-blur-md shadow-[var(--pw-shadow-card)]">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Proofwork</span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <span className="text-foreground">Terms</span>
          </div>
        </header>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-14 space-y-16">
        <section className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-primary">
            <FileText weight="Filled" className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Plain-language terms</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
            Terms of Use.
          </h1>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            The rules that keep Proofwork records trustworthy for workers, clients, and lenders.
          </p>
          <div className="flex items-center justify-center gap-2 pt-1 text-xs font-mono text-muted-foreground">
            <span className="rounded-full border border-border bg-card px-3 py-1">
              UPDATED · NOV 16, 2026
            </span>
          </div>
        </section>

        <section className="rounded-[var(--pw-radius-md)] border border-border bg-card shadow-[var(--pw-shadow-card)] overflow-hidden grid md:grid-cols-2">
          {SHORT_TERMS.map((r, idx) => (
            <div
              key={r.num}
              className={`p-6 space-y-2 ${idx < 2 ? 'border-b border-border' : ''} ${
                idx % 2 === 0 ? 'md:border-r border-border' : ''
              }`}
            >
              <span className="font-mono text-xs text-muted-foreground">{r.num}</span>
              <h2 className="text-base font-semibold text-foreground">{r.title}</h2>
              <p className="text-sm text-muted-foreground">{r.body}</p>
            </div>
          ))}
        </section>

        <section className="space-y-8 max-w-2xl mx-auto">
          <div className="space-y-2">
            <p className="font-mono text-xs text-muted-foreground">01</p>
            <h2 className="text-xl font-semibold text-foreground">Using Proofwork</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You must provide accurate trade and bank account details when creating a Paga
              Subsidiary Account. Clients confirm payments voluntarily and receive a numbered
              receipt for each confirmed job.
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-mono text-xs text-muted-foreground">02</p>
            <h2 className="text-xl font-semibold text-foreground">Scoring &amp; fraud rules</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Proofwork makes fraud costly and visible rather than claiming to eliminate it. Self-paid
              transfers or repeated circular flows between linked accounts are flagged on lender
              reports and deducted from the score.
            </p>
          </div>
          <Card className="p-5 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">Read our Privacy Notice</p>
              <p className="text-xs text-muted-foreground">
                Learn how client tokens and consent links work.
              </p>
            </div>
            <Link to="/privacy" className="text-sm font-medium text-primary hover:underline shrink-0">
              Privacy →
            </Link>
          </Card>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
