import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'lg', loading, disabled, children, ...props }, ref) => {
    const variants = {
      primary:
        'bg-primary text-primary-foreground border border-transparent hover:bg-[var(--pw-primary-hover)] hover:shadow-[var(--pw-shadow-lift)]',
      secondary:
        'bg-card text-foreground border border-border hover:bg-muted hover:border-[var(--pw-rule-strong)]',
      ghost:
        'bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent',
      destructive:
        'bg-destructive text-destructive-foreground border border-transparent hover:opacity-90',
    }

    const sizes = {
      sm: 'h-9 px-4 text-xs font-semibold rounded-full',
      md: 'h-11 px-5 text-sm font-semibold rounded-full',
      lg: 'min-h-[var(--pw-tap-preferred)] px-6 py-3.5 text-base font-semibold leading-none rounded-full',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-[var(--pw-motion-fast)] ease-[var(--pw-ease)] disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {loading && (
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        )}
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'
