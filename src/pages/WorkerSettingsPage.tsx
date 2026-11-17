import { useEffect, useState } from 'react'
import { api } from '@/api/client'
import { WorkerShell } from '@/components/pw/WorkerShell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select } from '@/components/ui/select'

export function WorkerSettingsPage() {
  const [channel, setChannel] = useState<'whatsapp' | 'sms'>('whatsapp')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.getWorkerSettings().then((res) => setChannel(res.alertChannel)).catch(() => {})
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      await api.updateWorkerSettings(channel)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <WorkerShell>
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Notification channel and consent defaults for your Provo record.
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
              setChannel(v === 'sms' ? 'sms' : 'whatsapp')
              setSaved(false)
            }}
            options={[
              { value: 'whatsapp', label: 'WhatsApp + SMS fallback' },
              { value: 'sms', label: 'SMS only' },
            ]}
          />
        </div>

        <Button size="md" disabled={saving} onClick={handleSave}>
          {saving ? 'Saving...' : saved ? 'Saved' : 'Save preferences'}
        </Button>
      </Card>
    </WorkerShell>
  )
}
