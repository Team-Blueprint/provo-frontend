import { useState } from 'react'
import { CheckCircle, Coins, Info, ShieldCheck } from '@phosphor-icons/react'
import type { EvidenceGrade } from '@/api/types'
import { messages } from '@/messages/en'
import { cn } from '@/lib/utils'

interface GradeBadgeProps {
  grade: EvidenceGrade
  size?: 'sm' | 'md'
  showHelp?: boolean
}

export function GradeBadge({ grade, size = 'md', showHelp = false }: GradeBadgeProps) {
  const [openHelp, setOpenHelp] = useState(false)
  const copy = messages.grades[grade]

  const styles: Record<EvidenceGrade, string> = {
    1: 'bg-[var(--pw-grade-1)] text-primary-foreground border border-transparent',
    2: 'bg-[var(--pw-info-tint)] text-foreground border-2 border-[var(--pw-grade-2)]',
    3: 'bg-transparent text-muted-foreground border border-dashed border-[var(--pw-grade-3)]',
  }

  const icon =
    grade === 1 ? (
      <ShieldCheck weight="fill" className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
    ) : grade === 2 ? (
      <CheckCircle weight="bold" className="h-3.5 w-3.5 shrink-0 text-[var(--pw-grade-2)]" aria-hidden="true" />
    ) : (
      <Coins weight="regular" className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
    )

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <span
        aria-label={`Grade ${grade}, ${copy.label}`}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap',
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
          styles[grade],
        )}
      >
        {icon}
        <span>{copy.label}</span>
        {showHelp && (
          <button
            type="button"
            onClick={() => setOpenHelp((v) => !v)}
            aria-label={`Explain ${copy.label}`}
            className="ml-0.5 inline-flex items-center justify-center rounded-full opacity-80 hover:opacity-100 cursor-pointer"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        )}
      </span>
      {showHelp && openHelp && (
        <p className="max-w-xs rounded-[var(--pw-radius-sm)] border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground">
          {copy.help}
        </p>
      )}
    </div>
  )
}
