import { useEffect, useState } from 'react'
import { WifiOff } from 'reicon-react'

export function OfflineBanner({ forceOffline = false }: { forceOffline?: boolean }) {
  const [offline, setOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const onOffline = () => setOffline(true)
    const onOnline = () => setOffline(false)
    window.addEventListener('offline', onOffline)
    window.addEventListener('online', onOnline)
    return () => {
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('online', onOnline)
    }
  }, [])

  if (!offline && !forceOffline) return null

  return (
    <div
      role="alert"
      className="flex items-center gap-2 border-b border-[var(--pw-warning)]/30 bg-[var(--pw-warning-tint)] px-4 py-2.5 text-sm text-foreground"
    >
      <WifiOff className="h-4 w-4 shrink-0 text-[var(--pw-warning)]" aria-hidden="true" />
      <span>You are offline. You can read your record, but confirming or paying needs a connection.</span>
    </div>
  )
}
