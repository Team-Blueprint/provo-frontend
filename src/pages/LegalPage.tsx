import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'reicon-react'
import { SiteFooter } from '@/components/pw/SiteFooter'
import { Card } from '@/components/ui/card'

type PolicyKey = 'privacy' | 'terms' | 'cookies' | 'ndpa'

interface PolicySection {
  id: string
  title: string
  inShort: string
  body: string
  added?: string
  removed?: string
}

const POLICIES: Record<
  PolicyKey,
  {
    title: string
    subtitle: string
    updated: string
    sections: PolicySection[]
  }
> = {
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'How Provo handles your work, payment evidence, and lender consent.',
    updated: 'Updated Nov 16, 2026 · v0.2',
    sections: [
      {
        id: 'data-we-collect',
        title: '01 · What we collect',
        inShort: 'Only what is needed to run escrow locks, confirm days, and issue receipts.',
        body: 'We store your name, phone number, trade, payout Paga account, and raw Paga webhook callbacks as immutable evidence.',
        added: 'Employer identities are hashed into 3-character tokens before appearing on any lender report.',
        removed: 'Full employer phone numbers were previously visible on preview exports.',
      },
      {
        id: 'consent',
        title: '02 · Consent is a switch',
        inShort: 'No lender sees your record without your explicit, time-limited approval.',
        body: 'Sharing your report creates an expiring consent link. You can revoke access at any time from your worker dashboard.',
        added: 'Every report fetch is access-logged with lender name and timestamp.',
      },
      {
        id: 'retention',
        title: '03 · Retention & NDPA rights',
        inShort: 'You can request a copy of your confirmed jobs or ask us to correct disputed records.',
        body: 'Raw payment evidence is retained for auditability under Nigerian data protection rules.',
      },
    ],
  },
  terms: {
    title: 'Terms of Use',
    subtitle: 'The rules that keep Provo records trustworthy for workers, employers, and lenders.',
    updated: 'Updated Nov 16, 2026 · v0.2',
    sections: [
      {
        id: 'escrow-custody',
        title: '01 · Escrow & Paga payouts',
        inShort: 'Employers lock total job funds in Paga escrow before day 1 begins.',
        body: 'Each confirmed day (or 24-hour auto-release) triggers an idempotent Paga transfer to your payout account.',
        added: 'Paga /status reconciliation runs automatically before any funding lock or payout is finalized.',
      },
      {
        id: 'confirmed-work',
        title: '02 · Only funded, confirmed days count',
        inShort: 'Unfunded jobs cannot be marked done, and outcome weights stay transparent.',
        body: 'Employer-confirmed and supervisor-confirmed days carry full score weight; 24h auto-released days carry reduced weight.',
        removed: 'Cash job self-entry drafts were retired in favor of upfront Paga escrow.',
        added: 'A 24-hour confirmation window begins as soon as the worker marks a day done.',
      },
      {
        id: 'disputes',
        title: '03 · Dispute window',
        inShort: 'Employers or workers can dispute a record inside the window; disputed jobs drop out of the score.',
        body: 'Provo acts as an independent report provider and does not underwrite or disburse loans directly.',
      },
    ],
  },
  cookies: {
    title: 'Cookie Policy',
    subtitle: 'Minimal browser storage to keep your session and demo state working on slow connections.',
    updated: 'Updated Nov 16, 2026 · v0.2',
    sections: [
      {
        id: 'essential',
        title: '01 · Essential storage',
        inShort: 'We only use local storage for your active session and offline form recovery.',
        body: 'If your mobile connection drops mid-confirmation, Provo keeps your selected job type locally so you do not lose it.',
        added: 'Demo Simulator state is stored strictly in localStorage on your device.',
      },
      {
        id: 'no-ads',
        title: '02 · No third-party ad trackers',
        inShort: 'We never run advertising pixels or sell browsing history.',
        body: 'Employer confirmation pages stay lightweight so they load fast on low-end Android phones.',
      },
    ],
  },
  ndpa: {
    title: 'NDPA Consent',
    subtitle: 'Your rights and explicit consent controls under the Nigeria Data Protection Act.',
    updated: 'Updated Nov 17, 2026 · v0.2',
    sections: [
      {
        id: 'explicit-consent',
        title: '01 · Explicit, purpose-bound consent',
        inShort: 'No lender or third party can view your work record unless you turn access on.',
        body: 'Under the Nigeria Data Protection Act (NDPA), Provo processes your identity, Paga settlement receipts, and job history strictly to verify completed work. Sharing a credit report requires your affirmative consent for a specific lender and duration.',
        added: 'Each consent link records the lender name, expiry window, and access log.',
      },
      {
        id: 'data-minimization',
        title: '02 · Minimized employer & worker exposure',
        inShort: 'Lender reports never expose raw bank credentials or full employer phone numbers.',
        body: 'Reports share only your score, outcome mix, verified workday counts, and hashed employer tokens. Raw Paga webhook signatures remain sealed on Provo for audit verification.',
      },
      {
        id: 'rights-revocation',
        title: '03 · Instant revocation & correction rights',
        inShort: 'You can revoke a lender link in one tap or dispute any inaccurate day record.',
        body: 'Visit your Worker Consent page at any time to revoke active report tokens immediately, request an export of your confirmed work history, or flag a disputed day for review.',
      },
    ],
  },
}

export function LegalPage({ initialPolicy }: { initialPolicy: PolicyKey }) {
  const navigate = useNavigate()
  const [showChanges, setShowChanges] = useState(true)
  const [activeId, setActiveId] = useState<string>(POLICIES[initialPolicy].sections[0].id)

  const policy = POLICIES[initialPolicy]

  useEffect(() => {
    setActiveId(policy.sections[0].id)
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting)
        if (visible?.target.id) setActiveId(visible.target.id)
      },
      { rootMargin: '-20% 0px -60% 0px' },
    )
    policy.sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [initialPolicy, policy.sections])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-4 z-30 mx-auto max-w-3xl px-4">
        <header className="flex items-center justify-between rounded-full border border-border bg-card/90 px-4 py-2 backdrop-blur-md shadow-[var(--pw-shadow-card)]">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Provo</span>
          </Link>
          <div className="inline-flex rounded-full border border-border bg-muted/60 p-0.5">
            {(['privacy', 'terms', 'cookies', 'ndpa'] as PolicyKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => navigate(`/${key}`)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  initialPolicy === key
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {key === 'ndpa' ? 'NDPA' : key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
        </header>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-14 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-2">
            <p className="font-mono text-xs text-muted-foreground">{policy.updated}</p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
              {policy.title}
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">{policy.subtitle}</p>
          </div>

          <label className="inline-flex items-center gap-2.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={showChanges}
              onChange={(e) => setShowChanges(e.target.checked)}
              className="accent-[var(--pw-primary)] h-3.5 w-3.5 cursor-pointer"
            />
            <span>Highlight changes since v0.1</span>
          </label>
        </div>

        <div className="grid gap-10 lg:grid-cols-[200px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-2 text-xs">
              <p className="font-medium uppercase tracking-wider text-muted-foreground">Contents</p>
              <ul className="space-y-1.5">
                {policy.sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={`block rounded-[var(--pw-radius-xs)] px-2.5 py-1.5 transition-colors ${
                        activeId === s.id
                          ? 'bg-muted font-medium text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="space-y-8">
            {policy.sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24 space-y-3">
                <h2 className="text-xl font-semibold text-foreground">{s.title}</h2>
                <Card className="p-4 bg-muted/40 space-y-1">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-primary">
                    In short
                  </span>
                  <p className="text-sm font-medium text-foreground">{s.inShort}</p>
                </Card>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {s.body}{' '}
                  {showChanges && s.removed && (
                    <span className="line-through text-muted-foreground/60 mr-1.5">
                      {s.removed}
                    </span>
                  )}
                  {showChanges && s.added && (
                    <mark className="rounded-[4px] bg-[var(--pw-warning-tint)] px-1 py-0.5 text-foreground">
                      {s.added}
                    </mark>
                  )}
                  {!showChanges && s.added && <span>{s.added}</span>}
                </p>
              </section>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
