import * as React from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[var(--pw-radius-sm)] border border-border bg-card text-card-foreground shadow-[var(--pw-shadow-card)]',
        className,
      )}
      {...props}
    />
  )
}

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-[var(--pw-radius-sm)] bg-muted', className)}
      {...props}
    />
  )
}
