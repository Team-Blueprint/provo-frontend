import type { ComponentType } from 'react'
import { Card } from '@/components/ui/card'

interface EmptyStateProps {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  action?: React.ReactNode
  compact?: boolean
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <Card
      className={`flex flex-col items-center justify-center text-center border-dashed ${
        compact ? 'p-6 gap-2.5' : 'p-8 sm:p-10 gap-3'
      }`}
    >
      <div
        className={`flex items-center justify-center rounded-full bg-secondary text-primary ${
          compact ? 'h-10 w-10' : 'h-12 w-12'
        }`}
      >
        <Icon className={compact ? 'h-5 w-5' : 'h-6 w-6'} aria-hidden="true" />
      </div>
      <div className="space-y-1 max-w-md">
        <h3 className="text-sm sm:text-base font-semibold text-foreground">{title}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
      {action && <div className="pt-1">{action}</div>}
    </Card>
  )
}
