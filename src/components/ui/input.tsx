import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        aria-invalid={Boolean(error)}
        className={cn(
          'flex min-h-[var(--pw-tap-preferred)] w-full rounded-[var(--pw-radius-sm)] border bg-card px-3.5 py-2.5 text-base text-foreground placeholder:text-muted-foreground/65 transition-colors duration-[var(--pw-motion-fast)] ease-[var(--pw-ease)] focus:outline-none focus:ring-0',
          error
            ? 'border-destructive focus:border-destructive'
            : 'border-input focus:border-primary',
          className,
        )}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'
