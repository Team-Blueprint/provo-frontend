import { useState } from 'react'
import { WorkerShell } from '@/components/pw/WorkerShell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select } from '@/components/ui/select'

export function WorkerSettingsPage() {
  const [channel, setChannel] = useState('whatsapp')
  const [saved, setSaved] = useState(false)

  return (
    <WorkerShell>
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Notification channel and consent defaults for your Proofwork record.
        </p>
      </div>

      <Card className="p-5 space-y-5 max-w-xl">
        <div className="space-y-1.5">
          <label htmlFor="pref-channel" className="text-sm font-medium text-foreground">
            Preferred alert channel
          </label>
          <Select
            id="pref-channel"
            value={channel}
            onValueChange={(v) => {
              setChannel(v)
              setSaved(false)
            }}
            options={[
              { value: 'whatsapp', label: 'WhatsApp + SMS fallback' },
              { value: 'sms', label: 'SMS only' },
            ]}
          />
        </div>

        <Button
          size="md"
          onClick={() => {
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
          }}
        >
          {saved ? 'Saved' : 'Save preferences'}
        </Button>
      </Card>
    </WorkerShell>
  )
}
