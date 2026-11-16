import { useEffect, useRef, useState } from 'react'
import { AngleDown, Check } from 'reicon-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  id?: string
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function Select({
  id,
  value,
  onValueChange,
  options,
  placeholder = 'Select an option',
  className,
  disabled,
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div ref={rootRef} className={cn('relative w-full', className)}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex min-h-[var(--pw-tap-preferred)] w-full items-center justify-between gap-2 rounded-[var(--pw-radius-sm)] border bg-card px-3.5 py-2.5 text-left text-base text-foreground transition-colors duration-[var(--pw-motion-fast)] ease-[var(--pw-ease)] focus:outline-none focus:ring-0 cursor-pointer disabled:opacity-50',
          open ? 'border-primary' : 'border-input hover:border-[var(--pw-rule-strong)]',
        )}
      >
        <span className={selected ? 'text-foreground' : 'text-muted-foreground'}>
          {selected ? selected.label : placeholder}
        </span>
        <AngleDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform duration-150',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-1.5 max-h-60 overflow-auto rounded-[var(--pw-radius-sm)] border border-border bg-card p-1 shadow-[var(--pw-shadow-sheet)]"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value
            return (
              <li key={opt.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onValueChange(opt.value)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-[var(--pw-radius-xs)] px-3 py-2 text-left text-sm transition-colors cursor-pointer',
                    isSelected
                      ? 'bg-secondary font-medium text-foreground'
                      : 'text-foreground hover:bg-muted',
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="h-4 w-4 text-primary" aria-hidden="true" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
