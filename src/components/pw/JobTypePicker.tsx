import { JOB_TYPES, type JobType } from '@/api/types'
import { cn } from '@/lib/utils'

interface JobTypePickerProps {
  value?: JobType
  onChange: (value: JobType) => void
  disabled?: boolean
  label?: string
}

export function JobTypePicker({
  value,
  onChange,
  disabled,
  label = 'What kind of work was this?',
}: JobTypePickerProps) {
  return (
    <fieldset disabled={disabled} className="space-y-2">
      <legend className="text-sm font-medium text-foreground">{label}</legend>
      <div role="radiogroup" className="grid grid-cols-2 gap-2">
        {JOB_TYPES.map((type) => {
          const selected = value === type
          return (
            <button
              key={type}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(type)}
              className={cn(
                'min-h-[var(--pw-tap-preferred)] rounded-[var(--pw-radius-md)] border px-3 py-2.5 text-left text-sm font-medium transition-colors cursor-pointer',
                selected
                  ? 'border-primary bg-secondary text-foreground'
                  : 'border-border bg-card text-foreground hover:bg-muted',
                disabled && 'opacity-50 pointer-events-none',
              )}
            >
              {type}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
