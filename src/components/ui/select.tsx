import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        aria-invalid={Boolean(error)}
        className={cn(
          'flex min-h-[var(--pw-tap-preferred)] w-full rounded-[var(--pw-radius-sm)] border bg-card px-3.5 py-2.5 text-base text-foreground transition-colors duration-[var(--pw-motion-fast)] ease-[var(--pw-ease)] focus:outline-none focus:ring-0 cursor-pointer',
          error
            ? 'border-destructive focus:border-destructive'
            : 'border-input focus:border-primary',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    )
  },
)
Select.displayName = 'Select'
