import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ProvoMark } from '@/components/pw/ProvoMark'

const STATIC_PATHS = new Set([
  '/',
  '/design-system',
  '/privacy',
  '/terms',
  '/cookies',
  '/ndpa',
])

function isStaticRoute(pathname: string): boolean {
  if (STATIC_PATHS.has(pathname)) return true
  if (pathname === '/docs' || pathname.startsWith('/docs/')) return true
  return false
}

export function AppPreloader() {
  const { pathname } = useLocation()
  const [visible, setVisible] = useState(() => !isStaticRoute(pathname))
  const [fading, setFading] = useState(false)
  const [progress, setProgress] = useState(18)

  useEffect(() => {
    if (!visible) return

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reducedMotion) {
      setProgress(100)
      const t = window.setTimeout(() => setVisible(false), 120)
      return () => window.clearTimeout(t)
    }

    const t1 = window.setTimeout(() => setProgress(62), 90)
    const t2 = window.setTimeout(() => setProgress(100), 340)
    const t3 = window.setTimeout(() => setFading(true), 560)
    const t4 = window.setTimeout(() => setVisible(false), 820)

    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
      window.clearTimeout(t4)
    }
  }, [visible])

  if (!visible) return null

  return (
    <div
      aria-label="Loading Provo"
      aria-busy="true"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-background transition-opacity duration-250 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <ProvoMark className="h-9 w-9" />
        <span className="text-xl font-semibold tracking-tight text-foreground">Provo</span>
      </div>

      <div className="h-1.5 w-48 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
