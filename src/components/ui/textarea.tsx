import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        aria-invalid={Boolean(error)}
        className={cn(
          'flex min-h-[104px] w-full rounded-[var(--pw-radius-sm)] border bg-card px-3.5 py-2.5 text-base text-foreground placeholder:text-muted-foreground/65 transition-colors duration-[var(--pw-motion-fast)] ease-[var(--pw-ease)] focus:outline-none focus:ring-0',
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
Textarea.displayName = 'Textarea'
