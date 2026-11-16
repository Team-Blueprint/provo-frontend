import { TRADES, type TradeType } from '@/api/types'
import { cn } from '@/lib/utils'

interface JobTypePickerProps {
  value?: TradeType
  onChange: (value: TradeType) => void
  disabled?: boolean
  label?: string
}

export function JobTypePicker({
  value,
  onChange,
  disabled,
  label = 'Select trade',
}: JobTypePickerProps) {
  return (
    <fieldset disabled={disabled} className="space-y-2">
      <legend className="text-sm font-medium text-foreground">{label}</legend>
      <div role="radiogroup" className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {TRADES.map((trade) => {
          const selected = value === trade
          return (
            <button
              key={trade}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(trade)}
              className={cn(
                'min-h-[var(--pw-tap-preferred)] rounded-[var(--pw-radius-sm)] border px-3 py-2.5 text-left text-sm font-medium transition-colors cursor-pointer',
                selected
                  ? 'border-primary bg-secondary text-foreground'
                  : 'border-border bg-card text-foreground hover:bg-muted',
                disabled && 'opacity-50 pointer-events-none',
              )}
            >
              {trade}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
