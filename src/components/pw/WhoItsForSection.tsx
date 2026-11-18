import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Briefcase, CheckCircle, ShieldCheck } from 'reicon-react'

const PERSONAS = [
  {
    role: 'Worker',
    tag: '01 · Artisans & Tradespeople',
    name: 'Emem Ekpo, 29',
    meta: 'Bricklayer · Uyo',
    problem:
      'Works 3 to 6 days a week across different building sites. Has no payslip, and his bank statement looks like random transfers so lenders cannot tell work from gifts.',
    gives:
      'Employers lock job pay in Paga before Day 1. Emem marks each day done on Telegram or *123# USSD, gets paid the same day, and builds a verified credit record.',
    bullets: [
      'Job pay locked before Day 1 begins',
      'Works on Telegram, Web, or *123# USSD',
      'Same-day Paga payouts per confirmed day',
      'Consented 0–100 credit report for lenders',
    ],
    surfaceBg: 'bg-[#193B3D] text-white',
    cardBg: 'bg-[#122C2E] border-white/15',
    badgeTitle: 'PROVO · WORKER',
    artifactTitle: 'Emem Ekpo',
    artifactSub: 'Score 82 / 100 · Trusted tier',
    artifactStat: '₦15,000 · Day 2 Done',
    ctaLabel: 'Open worker demo',
    ctaTo: '/sign-in?role=worker',
    icon: Briefcase,
  },
  {
    role: 'Employer',
    tag: '02 · Employers & Contractors',
    name: 'Chief Etim, 44',
    meta: 'Site Owner & Contractor · Uyo',
    problem:
      'Hires bricklayers, electricians, and tilers for multi-day jobs. Tired of paying upfront with no accountability or arguing over unfinished days.',
    gives:
      'Hire artisans directly. Lock the job pay once through a dedicated Paga NUBAN, optionally name a site supervisor, and release pay day by day as work is confirmed.',
    bullets: [
      'One-time 10-digit Paga NUBAN per job',
      'Pay released only as each day is confirmed',
      'Optional site supervisor daily sign-off',
      'Numbered Provo receipt on completion',
    ],
    surfaceBg: 'bg-primary text-primary-foreground',
    cardBg: 'bg-[#00224E] border-white/15',
    badgeTitle: 'PROVO · EMPLOYER',
    artifactTitle: 'Chief Etim',
    artifactSub: '₦45,000 locked · 3 working days',
    artifactStat: '1-tap Confirm & Release',
    ctaLabel: 'Open employer flow',
    ctaTo: '/sign-in?role=employer',
    icon: ShieldCheck,
  },
] as const

export function WhoItsForSection() {
  const secondCardRef = useRef<HTMLDivElement>(null)
  const [overlapProgress, setOverlapProgress] = useState(0)

  useEffect(() => {
    let raf = 0
    const update = () => {
      const el = secondCardRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const raw = (vh * 0.85 - rect.top) / (vh * 0.55)
      setOverlapProgress(Math.max(0, Math.min(1, raw)))
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const firstScale = 1 - overlapProgress * 0.045
  const firstRotate = -overlapProgress * 1.2

  return (
    <section id="who-its-for" className="space-y-8 py-4">
      <div className="mx-auto max-w-2xl text-center space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
          WHO IT’S FOR
        </p>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          Made for two kinds of people.
        </h2>
        <p className="mx-auto max-w-lg text-sm text-muted-foreground leading-relaxed">
          Different needs, same simple idea: real work should be counted. Here’s what Provo looks
          like for each of them.
        </p>
      </div>

      <div className="relative space-y-6 sm:space-y-10">
        {PERSONAS.map((item, idx) => {
          const Icon = item.icon
          const isFirst = idx === 0
          return (
            <div
              key={item.role}
              ref={isFirst ? undefined : secondCardRef}
              style={
                isFirst
                  ? {
                      transform: `scale(${firstScale.toFixed(3)}) rotate(${firstRotate.toFixed(2)}deg)`,
                      transformOrigin: 'top center',
                    }
                  : undefined
              }
              className={`sticky ${
                isFirst ? 'top-20 z-10' : 'top-28 z-20'
              } rounded-[24px] sm:rounded-[28px] ${item.surfaceBg} p-6 sm:p-10 shadow-[0_24px_60px_rgba(11,22,40,0.22)] transition-transform duration-150 ease-out overflow-hidden`}
            >
              <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
                <div className="lg:col-span-7 space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/20 bg-white/10">
                      <Icon className="h-4 w-4 text-white" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-xs uppercase tracking-wider text-white/65">
                      {item.tag}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                      {item.role}
                    </h3>
                    <p className="text-sm sm:text-base font-medium text-white/85">
                      {item.name} · <span className="text-white/65">{item.meta}</span>
                    </p>
                    <p className="text-sm text-white/75 leading-relaxed max-w-xl pt-0.5">
                      {item.problem}
                    </p>
                  </div>

                  <div className="rounded-[16px] border border-white/15 bg-white/8 p-4 space-y-1">
                    <p className="font-mono text-[11px] uppercase tracking-wider text-emerald-300">
                      WHAT PROVO GIVES THEM
                    </p>
                    <p className="text-xs sm:text-sm text-white/90 leading-relaxed">{item.gives}</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 border-t border-white/15 pt-3.5 text-xs text-white/85">
                    {item.bullets.map((b) => (
                      <div key={b} className="flex items-center gap-2 py-1 border-b border-white/10">
                        <CheckCircle
                          weight="Filled"
                          className="h-3.5 w-3.5 shrink-0 text-emerald-300"
                          aria-hidden="true"
                        />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 flex justify-center">
                  <div
                    className={`w-full max-w-[280px] sm:max-w-[310px] rounded-[20px] border ${item.cardBg} p-5 sm:p-6 shadow-2xl flex flex-col justify-between min-h-[260px] sm:min-h-[300px] ${
                      isFirst ? '-rotate-[3deg]' : 'rotate-[3deg]'
                    } transition-transform duration-300 hover:rotate-0`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/15 bg-white/10">
                        <Icon className="h-4 w-4 text-white" aria-hidden="true" />
                      </span>
                      <span
                        className="font-semibold text-lg sm:text-xl tracking-tight text-white/80"
                        style={{ writingMode: 'vertical-rl' }}
                      >
                        {item.role}
                      </span>
                    </div>

                    <div className="space-y-2.5 my-5">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/55">
                        {item.badgeTitle}
                      </p>
                      <p className="text-lg sm:text-xl font-semibold text-white">
                        {item.artifactTitle}
                      </p>
                      <p className="text-xs text-white/70">{item.artifactSub}</p>
                      <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-mono font-semibold text-emerald-300 w-fit">
                        {item.artifactStat}
                      </div>
                    </div>

                    <Link
                      to={item.ctaTo}
                      className="inline-flex items-center justify-between rounded-full bg-white px-4 py-2 text-xs font-semibold text-foreground hover:bg-white/90 transition-colors"
                    >
                      <span>{item.ctaLabel}</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
