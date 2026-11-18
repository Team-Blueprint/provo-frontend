import { useEffect, useState } from 'react'
import { CheckCircle, CloseCircle, InfoCircle, Warning } from 'reicon-react'

export type ToastVariant = 'error' | 'success' | 'info'

export interface ToastItem {
  id: string
  variant: ToastVariant
  title?: string
  message: string
}

type ToastListener = (item: ToastItem) => void
const listeners = new Set<ToastListener>()

function emitToast(variant: ToastVariant, message: string, title?: string) {
  const item: ToastItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    variant,
    title,
    message,
  }
  listeners.forEach((fn) => fn(item))
}

export const toast = {
  error: (message: string, title = 'Action failed') => emitToast('error', message, title),
  success: (message: string, title = 'Done') => emitToast('success', message, title),
  info: (message: string, title?: string) => emitToast('info', message, title),
}

export function ToastViewport() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    const onToast: ToastListener = (item) => {
      setItems((prev) => [...prev.slice(-3), item])
      const duration = item.variant === 'error' ? 5500 : 4000
      window.setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== item.id))
      }, duration)
    }

    listeners.add(onToast)

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason as { message?: string } | string | undefined
      const msg =
        typeof reason === 'string'
          ? reason
          : reason && typeof reason.message === 'string'
            ? reason.message
            : null
      if (msg) {
        emitToast('error', msg, 'Request error')
      }
    }

    window.addEventListener('unhandledrejection', onUnhandledRejection)
    return () => {
      listeners.delete(onToast)
      window.removeEventListener('unhandledrejection', onUnhandledRejection)
    }
  }, [])

  if (items.length === 0) return null

  return (
    <div
      aria-live="assertive"
      aria-atomic="true"
      className="fixed top-4 right-4 z-[80] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2.5 pointer-events-none no-print"
    >
      {items.map((item) => {
        const isError = item.variant === 'error'
        const isSuccess = item.variant === 'success'
        const Icon = isError ? Warning : isSuccess ? CheckCircle : InfoCircle

        return (
          <div
            key={item.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 rounded-[14px] border bg-card p-3.5 shadow-[var(--pw-shadow-sheet)] transition-all duration-200 ${
              isError
                ? 'border-[var(--pw-critical)]/40'
                : isSuccess
                  ? 'border-[var(--pw-positive)]/40'
                  : 'border-border'
            }`}
          >
            <div
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                isError
                  ? 'bg-[var(--pw-critical-tint)] text-[var(--pw-critical)]'
                  : isSuccess
                    ? 'bg-[var(--pw-positive-tint)] text-[var(--pw-positive)]'
                    : 'bg-secondary text-primary'
              }`}
            >
              <Icon weight="Filled" className="h-4 w-4" aria-hidden="true" />
            </div>

            <div className="min-w-0 flex-1 space-y-0.5">
              {item.title && (
                <p className="text-xs font-semibold text-foreground">{item.title}</p>
              )}
              <p className="text-xs text-muted-foreground leading-snug break-words">
                {item.message}
              </p>
            </div>

            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setItems((prev) => prev.filter((t) => t.id !== item.id))}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer shrink-0"
            >
              <CloseCircle className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
