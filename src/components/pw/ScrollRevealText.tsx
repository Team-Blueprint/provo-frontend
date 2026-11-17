import { useEffect, useRef, useState } from 'react'

const STAGES = [
  {
    eyebrow: 'THE PROBLEM',
    headline: 'Hard work pays every week, yet leaves zero proof behind.',
    body: 'Across Africa, 83% of jobs are informal. Artisans earn money every week, yet bank statements cannot tell a job payment from a gift.',
  },
  {
    eyebrow: 'OUR SOLUTION',
    headline: 'Provo opens doors that cash never could.',
    body: 'Provo pairs upfront Paga job locks with per-day work confirmation so real work finally counts toward credit.',
  },
] as const

export function ScrollRevealText() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setProgress(1)
      return
    }

    let raf = 0
    const update = () => {
      const el = trackRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const scrollable = Math.max(1, rect.height - vh * 0.65)
      const scrolled = vh * 0.35 - rect.top
      const raw = scrolled / scrollable
      setProgress(Math.max(0, Math.min(1, raw)))
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

  const stageIndex = progress < 0.5 ? 0 : 1
  const stageProgress =
    stageIndex === 0
      ? Math.max(0, Math.min(1, progress / 0.42))
      : Math.max(0, Math.min(1, (progress - 0.5) / 0.42))

  const activeStage = STAGES[stageIndex]
  const words = activeStage.headline.split(' ')

  return (
    <div ref={trackRef} className="relative min-h-[108vh] sm:min-h-[150vh]">
      <div className="sticky top-20 sm:top-24 mx-auto max-w-3xl py-6 sm:py-20 text-center space-y-5 sm:space-y-6">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground transition-opacity duration-300">
          {activeStage.eyebrow}
        </p>

        <h2
          key={activeStage.eyebrow}
          className="text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.12] text-foreground"
        >
          {words.map((word, idx) => {
            const threshold = idx / words.length
            const lit = stageProgress >= threshold
            return (
              <span
                key={`${word}-${idx}`}
                className="inline-block transition-opacity duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]"
                style={{ opacity: lit ? 1 : 0.28 }}
              >
                {word}
                {idx < words.length - 1 ? '\u00A0' : ''}
              </span>
            )
          })}
        </h2>

        <p
          key={`${activeStage.eyebrow}-body`}
          className="mx-auto max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed transition-opacity duration-300"
        >
          {activeStage.body}
        </p>

        <div className="flex items-center justify-center gap-2.5 pt-8" aria-hidden="true">
          {STAGES.map((s, idx) => (
            <span
              key={s.eyebrow}
              className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${
                stageIndex === idx ? 'bg-foreground' : 'bg-foreground/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
