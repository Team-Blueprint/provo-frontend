import { useEffect, useRef, useState } from 'react'

interface ScrollRevealTextProps {
  text: string
  className?: string
}

export function ScrollRevealText({ text, className = '' }: ScrollRevealTextProps) {
  const containerRef = useRef<HTMLParagraphElement>(null)
  const [progress, setProgress] = useState(0)
  const words = text.split(' ')

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
      const vh = window.innerHeight
      const start = vh * 0.85
      const end = vh * 0.25
      const raw = (start - rect.top) / (start - end)
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

  return (
    <p ref={containerRef} className={className}>
      {words.map((word, idx) => {
        const threshold = idx / words.length
        const active = progress >= threshold
        return (
          <span
            key={`${word}-${idx}`}
            className="inline-block transition-[opacity,color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{
              opacity: active ? 1 : 0.24,
            }}
          >
            {word}
            {idx < words.length - 1 ? '\u00A0' : ''}
          </span>
        )
      })}
    </p>
  )
}
