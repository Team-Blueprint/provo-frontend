import { useEffect, useRef, useState } from 'react'
import { AlertCircle, CheckCircle } from 'reicon-react'
import { Card } from '@/components/ui/card'

const WITHOUT_ITEMS = [
  {
    title: 'NIP / OKOYE C. — ₦15,000',
    note: 'Bank statement shows a deposit, not whether it was bricklaying or a birthday gift.',
    restTilt: -2,
    enterAt: 0.02,
  },
  {
    title: 'Paper notebook lost in rain',
    note: 'Cash jobs vanish from memory. No receipts, no repeat-client trail.',
    restTilt: 1.5,
    enterAt: 0.1,
  },
  {
    title: 'Self-typed spreadsheets',
    note: 'Lenders reject worker-entered logs because anyone can type fake numbers.',
    restTilt: -1.5,
    enterAt: 0.18,
  },
  {
    title: '“Bring 6 months of statements”',
    note: '41M informal workers turned away before a loan officer even reads their story.',
    restTilt: 2,
    enterAt: 0.26,
  },
]

const WITH_ITEMS = [
  {
    title: 'Dedicated Paga NUBAN',
    highlight: '3104829104 · Auto-sweeps to bank',
    note: 'Paga webhooks log every transfer without Provo ever holding funds.',
    footer: 'Webhook verified',
    enterAt: 0.6,
  },
  {
    title: 'One-tap client confirm',
    highlight: '“Yes, this was for work” · Bricklaying',
    note: 'Client confirms in 15 seconds with no app. Numbered receipt issued.',
    footer: 'Receipt issued',
    enterAt: 0.7,
  },
  {
    title: 'Signed Lender Report',
    highlight: '82 / 100 · Trusted · Ed25519 JSON',
    note: 'Tokenized clients, active months, and cash capped at 20%.',
    footer: 'Ready for underwriting',
    enterAt: 0.8,
  },
]

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v))
}

export function WithoutWithSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setProgress(1)
      return
    }

    let raf = 0
    const update = () => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      if (scrollable <= 0) {
        setProgress(0)
        return
      }
      setProgress(clamp01(-rect.top / scrollable))
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

  const showWith = progress >= 0.52
  const withoutFade = 1 - clamp01((progress - 0.45) / 0.13)
  const withFade = clamp01((progress - 0.54) / 0.1)

  return (
    <section ref={containerRef} className="relative min-h-[260vh]">
      <div className="sticky top-20 flex min-h-[74vh] items-center">
        <div className="relative w-full">
          <div
            aria-hidden={showWith}
            className="rounded-[var(--pw-radius-lg)] bg-foreground text-background p-8 sm:p-12 space-y-8 transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{
              opacity: withoutFade,
              transform: `scale(${1 - (1 - withoutFade) * 0.04})`,
              pointerEvents: showWith ? 'none' : 'auto',
            }}
          >
            <h2 className="text-2xl sm:text-4xl font-semibold text-center tracking-tight">
              Without Provo
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {WITHOUT_ITEMS.map((item) => {
                const t = clamp01((progress - item.enterAt) / 0.12)
                const rotX = (1 - t) * 26
                const rotY = (1 - t) * -10
                const rotZ = (1 - t) * (item.restTilt * 2.5) + t * item.restTilt
                const translateY = (1 - t) * 28
                const scale = 0.92 + t * 0.08
                return (
                  <div
                    key={item.title}
                    className="rounded-[var(--pw-radius-sm)] border border-background/15 bg-background/5 p-5 space-y-2 transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]"
                    style={{
                      opacity: t,
                      transform: `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) translateY(${translateY}px) scale(${scale})`,
                    }}
                  >
                    <div className="flex items-center gap-2 text-sm font-medium text-background">
                      <AlertCircle className="h-4 w-4 text-[var(--pw-brick)] shrink-0" />
                      <span>{item.title}</span>
                    </div>
                    <p className="text-xs text-background/70 pl-6 leading-relaxed">{item.note}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div
            aria-hidden={!showWith}
            className="absolute inset-0 flex items-center transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{
              opacity: withFade,
              transform: `translateY(${(1 - withFade) * 16}px)`,
              pointerEvents: showWith ? 'auto' : 'none',
            }}
          >
            <div className="w-full rounded-[var(--pw-radius-lg)] border border-border bg-card p-8 sm:p-12 space-y-8 shadow-[var(--pw-shadow-card)]">
              <h2 className="text-2xl sm:text-4xl font-semibold text-center tracking-tight text-foreground">
                With Provo
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                {WITH_ITEMS.map((item) => {
                  const t = clamp01((progress - item.enterAt) / 0.12)
                  const rotX = (1 - t) * 26
                  const rotY = (1 - t) * 10
                  const translateY = (1 - t) * 28
                  const scale = 0.92 + t * 0.08
                  return (
                    <div
                      key={item.title}
                      className="transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]"
                      style={{
                        opacity: t,
                        transform: `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(${translateY}px) scale(${scale})`,
                      }}
                    >
                      <Card className="h-full p-5 flex flex-col justify-between gap-5 bg-background">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <CheckCircle weight="Filled" className="h-4 w-4 text-primary shrink-0" />
                            <span>{item.title}</span>
                          </div>
                          <div className="rounded-[var(--pw-radius-sm)] border border-border bg-card px-3 py-2 font-mono text-xs text-foreground">
                            {item.highlight}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{item.note}</p>
                        </div>
                        <p className="text-xs font-medium text-primary border-t border-border pt-3">
                          {item.footer}
                        </p>
                      </Card>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
