import { formatNaira } from '@/lib/format'
import { cn } from '@/lib/utils'

interface AmountTextProps {
  amount: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function AmountText({ amount, size = 'md', className }: AmountTextProps) {
  const sizes = {
    sm: 'text-sm font-medium',
    md: 'text-base font-medium',
    lg: 'text-xl font-semibold',
    xl: 'text-3xl font-bold tracking-tight',
  }

  return (
    <span className={cn('tabular-nums text-foreground', sizes[size], className)}>
      {formatNaira(amount)}
    </span>
  )
}
