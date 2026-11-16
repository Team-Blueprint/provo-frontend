import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'reicon-react'
import type { TradeType } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Card, Skeleton } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AmountText } from '@/components/pw/AmountText'
import { GradeBadge } from '@/components/pw/GradeBadge'
import { JobTypePicker } from '@/components/pw/JobTypePicker'
import { StatusPill } from '@/components/pw/StatusPill'

const COLOR_TOKENS = [
  { name: '--pw-bg', swatch: 'bg-background', role: 'Page canvas' },
  { name: '--pw-surface', swatch: 'bg-card', role: 'Cards & inputs' },
  { name: '--pw-ink', swatch: 'bg-foreground', role: 'Primary text' },
  { name: '--pw-primary', swatch: 'bg-primary', role: 'Primary actions' },
  { name: '--pw-brick', swatch: 'bg-[var(--pw-brick)]', role: 'Brand accent' },
  { name: '--pw-success', swatch: 'bg-[var(--pw-success)]', role: 'Confirmed state' },
  { name: '--pw-warning', swatch: 'bg-[var(--pw-warning)]', role: 'Waiting state' },
  { name: '--pw-critical', swatch: 'bg-[var(--pw-critical)]', role: 'Disputed / failed' },
  { name: '--pw-info', swatch: 'bg-[var(--pw-info)]', role: 'Grade 2 transfer' },
]

const SPACING_STEPS = [4, 8, 12, 16, 24, 32, 48, 64]

const RADIUS_STEPS = [
  { label: 'xs · 5px', cls: 'rounded-[5px]' },
  { label: 'sm · 8px', cls: 'rounded-[8px]' },
  { label: 'md · 13px', cls: 'rounded-[13px]' },
  { label: 'lg · 22px', cls: 'rounded-[22px]' },
  { label: 'pill · 9999px', cls: 'rounded-full' },
]

const NAV_SECTIONS = [
  {
    group: 'Foundations',
    items: [
      { id: 'colour', label: 'Colour' },
      { id: 'type', label: 'Type' },
      { id: 'spacing', label: 'Spacing' },
      { id: 'radius', label: 'Radius' },
    ],
  },
  {
    group: 'Components',
    items: [
      { id: 'buttons', label: 'Button' },
      { id: 'inputs', label: 'Input & Select' },
      { id: 'grades', label: 'GradeBadge & Status' },
      { id: 'picker', label: 'JobTypePicker' },
    ],
  },
]

export function DesignSystemPage() {
  const [jobType, setJobType] = useState<TradeType>('Bricklaying')
  const [trade, setTrade] = useState('Bricklayer')
  const [activeNav, setActiveNav] = useState('colour')

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-6 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-foreground"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Proofwork</span>
            </Link>

            <nav className="space-y-5">
              {NAV_SECTIONS.map((sec) => (
                <div key={sec.group} className="space-y-1.5">
                  <p className="px-2.5 text-xs font-medium text-muted-foreground">{sec.group}</p>
                  <ul className="space-y-0.5">
                    {sec.items.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          onClick={() => setActiveNav(item.id)}
                          className={`block rounded-[var(--pw-radius-sm)] px-2.5 py-1.5 text-sm transition-colors ${
                            activeNav === item.id
                              ? 'bg-muted font-medium text-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        <main className="space-y-14 pb-20">
          <div className="flex items-center justify-between lg:hidden border-b border-border pb-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back to Proofwork</span>
            </Link>
            <span className="font-mono text-xs text-muted-foreground">v0.1</span>
          </div>

          <header className="space-y-2">
            <h1 className="text-3xl font-semibold text-foreground">Proofwork primitives</h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              The tokens and components Proofwork is built from. Every value on this page is the
              one the app uses.
            </p>
          </header>

          <section id="colour" className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-semibold text-foreground">Colour</h2>
              <span className="font-mono text-xs text-muted-foreground">
                --pw-bg · --pw-primary · --pw-ink
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {COLOR_TOKENS.map((t) => (
                <Card key={t.name} className="p-3 space-y-2.5">
                  <div className={`h-14 w-full rounded-[5px] border border-border ${t.swatch}`} />
                  <div>
                    <p className="font-mono text-xs font-medium text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section id="type" className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-semibold text-foreground">Type</h2>
              <span className="font-mono text-xs text-muted-foreground">DM Sans Variable</span>
            </div>
            <Card className="divide-y divide-border">
              <div className="p-4 flex items-baseline justify-between gap-4">
                <span className="font-mono text-xs text-muted-foreground w-24 shrink-0">
                  48 / 1.04
                </span>
                <p className="text-4xl font-semibold tracking-tight flex-1">Landing headline</p>
              </div>
              <div className="p-4 flex items-baseline justify-between gap-4">
                <span className="font-mono text-xs text-muted-foreground w-24 shrink-0">
                  24 / 1.3
                </span>
                <p className="text-2xl font-semibold flex-1">Page title</p>
              </div>
              <div className="p-4 flex items-baseline justify-between gap-4">
                <span className="font-mono text-xs text-muted-foreground w-24 shrink-0">
                  18 / 1.4
                </span>
                <p className="text-lg font-medium flex-1">Section heading</p>
              </div>
              <div className="p-4 flex items-baseline justify-between gap-4">
                <span className="font-mono text-xs text-muted-foreground w-24 shrink-0">
                  16 / 1.5
                </span>
                <p className="text-base flex-1">Body text that people actually read</p>
              </div>
              <div className="p-4 flex items-baseline justify-between gap-4">
                <span className="font-mono text-xs text-muted-foreground w-24 shrink-0">
                  12 / 1.5
                </span>
                <p className="text-xs text-muted-foreground flex-1">Meta, tokens, and labels</p>
              </div>
            </Card>
          </section>

          <section id="spacing" className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-semibold text-foreground">Spacing</h2>
              <span className="font-mono text-xs text-muted-foreground">4px base</span>
            </div>
            <Card className="p-5 space-y-2.5">
              {SPACING_STEPS.map((px) => (
                <div key={px} className="flex items-center gap-4">
                  <span className="font-mono text-xs text-muted-foreground w-10">{px}px</span>
                  <div
                    className="h-3 rounded-[3px] bg-primary/80"
                    style={{ width: `${px * 3}px` }}
                  />
                </div>
              ))}
            </Card>
          </section>

          <section id="radius" className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-semibold text-foreground">Radius</h2>
              <span className="font-mono text-xs text-muted-foreground">5 · 8 · 13 · 22 · pill</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {RADIUS_STEPS.map((r) => (
                <Card key={r.label} className="p-4 space-y-3 text-center">
                  <div className={`mx-auto h-12 w-12 border-2 border-primary bg-secondary ${r.cls}`} />
                  <p className="font-mono text-xs text-muted-foreground">{r.label}</p>
                </Card>
              ))}
            </div>
          </section>

          <section id="buttons" className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-semibold text-foreground">Button</h2>
              <span className="font-mono text-xs text-muted-foreground">rounded-sm (8px)</span>
            </div>
            <Card className="p-5 grid gap-4 sm:grid-cols-5">
              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground block">Primary</span>
                <Button variant="primary" size="md" className="w-full">
                  Confirm
                </Button>
              </div>
              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground block">Secondary</span>
                <Button variant="secondary" size="md" className="w-full">
                  Copy link
                </Button>
              </div>
              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground block">Loading</span>
                <Button loading size="md" className="w-full">
                  Saving
                </Button>
              </div>
              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground block">Destructive</span>
                <Button variant="destructive" size="md" className="w-full">
                  Dispute
                </Button>
              </div>
              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground block">Disabled</span>
                <Button disabled size="md" className="w-full">
                  Disabled
                </Button>
              </div>
            </Card>
          </section>

          <section id="inputs" className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-semibold text-foreground">Input, Select &amp; Textarea</h2>
              <span className="font-mono text-xs text-muted-foreground">no focus ring</span>
            </div>
            <Card className="p-5 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="ds-input" className="text-sm font-medium text-foreground">
                  Client phone
                </label>
                <Input id="ds-input" placeholder="+234 803 000 0000" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="ds-select" className="text-sm font-medium text-foreground">
                  Trade
                </label>
                <Select
                  id="ds-select"
                  value={trade}
                  onValueChange={setTrade}
                  options={[
                    { value: 'Bricklayer', label: 'Bricklayer' },
                    { value: 'Tailor', label: 'Tailor' },
                    { value: 'Mechanic', label: 'Mechanic' },
                  ]}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="ds-textarea" className="text-sm font-medium text-foreground">
                  Notes (optional)
                </label>
                <Textarea id="ds-textarea" placeholder="Add a short note..." />
              </div>
            </Card>
          </section>

          <section id="grades" className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                GradeBadge, StatusPill &amp; AmountText
              </h2>
              <span className="font-mono text-xs text-muted-foreground">never colour alone</span>
            </div>
            <Card className="p-5 space-y-4">
              <div className="flex flex-wrap gap-3">
                <GradeBadge outcome="client" showHelp />
                <GradeBadge outcome="supervisor" showHelp />
                <GradeBadge outcome="auto" showHelp />
              </div>
              <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
                <StatusPill status="PAID" />
                <StatusPill status="DONE_REPORTED" />
                <StatusPill status="PENDING" />
                <StatusPill status="DISPUTED" />
                <StatusPill status="FUNDED" />
                <StatusPill status="AWAITING_FUNDING" />
              </div>
              <div className="flex items-baseline gap-5 pt-3 border-t border-border">
                <AmountText amount={15000} size="sm" />
                <AmountText amount={45000} size="lg" />
                <AmountText amount={120000} size="xl" />
              </div>
            </Card>
          </section>

          <section id="picker" className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              JobTypePicker &amp; Loading Skeleton
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-5">
                <JobTypePicker value={jobType} onChange={setJobType} />
              </Card>
              <Card className="p-5 space-y-3">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </Card>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
