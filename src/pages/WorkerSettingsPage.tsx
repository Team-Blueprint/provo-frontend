import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { api } from '@/api/client'
import { workerDashboardQueryOptions, workerSettingsQueryOptions } from '@/api/queries'
import { WorkerShell } from '@/components/pw/WorkerShell'
import { Button } from '@/components/ui/button'
import { Card, Skeleton } from '@/components/ui/card'
import { Select } from '@/components/ui/select'

type SettingsTab = 'account' | 'preferences'

export function WorkerSettingsPage() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const rawTab = searchParams.get('tab')
  const activeTab: SettingsTab = rawTab === 'preferences' ? 'preferences' : 'account'

  const { data: dashboard } = useQuery(workerDashboardQueryOptions())
  const { data: settingsData } = useQuery(workerSettingsQueryOptions())
  const worker = dashboard?.worker ?? null
  const [channel, setChannel] = useState<'telegram' | 'sms'>('telegram')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (settingsData?.alertChannel) {
      setChannel(settingsData.alertChannel === 'sms' ? 'sms' : 'telegram')
    }
  }, [settingsData])

  function setTab(next: SettingsTab) {
    setSearchParams({ tab: next })
  }

  async function handleSave() {
    setSaving(true)
    try {
      await api.updateWorkerSettings(channel)
      await queryClient.invalidateQueries({ queryKey: ['worker', 'settings'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const initials = (worker?.name ?? 'Emem Ekpo')
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <WorkerShell>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your verified worker account, Paga payout details, and notification preferences.
          </p>
        </div>

        <div className="inline-flex rounded-full border border-border bg-muted/60 p-1">
          {(
            [
              { key: 'account', label: 'Account' },
              { key: 'preferences', label: 'Preferences' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setTab(tab.key)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'account' ? (
        !worker ? (
          <Card className="divide-y divide-border overflow-hidden">
            <div className="p-5 flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-3.5 w-44" />
              </div>
            </div>
            <div className="p-5 grid gap-4 sm:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-36" />
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="divide-y divide-border overflow-hidden">
            <div className="p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground">
                {initials || 'EE'}
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">{worker.name}</p>
                <p className="text-xs text-muted-foreground">
                  {worker.customTrade || worker.trade} · {worker.area}
                </p>
              </div>
            </div>
            <div className="p-5 grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block">Trade</span>
                <span className="font-medium text-foreground">
                  {worker.customTrade || worker.trade}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Phone</span>
                <span className="font-medium text-foreground">{worker.phone}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Payout Paga account</span>
                <span className="font-mono font-medium text-foreground">
                  {worker.pagaAccountNumber || 'Not provisioned yet'}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Linked bank account</span>
                <span className="font-medium text-foreground">
                  {worker.bankName}
                  {worker.bankAccountNumber ? ` (${worker.bankAccountNumber})` : ''}
                </span>
              </div>
            </div>
          </Card>
        )
      ) : (
        <Card className="p-5 space-y-5 max-w-xl">
          <div className="space-y-1.5">
            <label htmlFor="pref-channel" className="text-sm font-medium text-foreground">
              Preferred alert channel
            </label>
            <Select
              id="pref-channel"
              value={channel}
              onValueChange={(v) => {
                setChannel(v === 'sms' ? 'sms' : 'telegram')
                setSaved(false)
              }}
              options={[
                { value: 'telegram', label: 'Telegram + SMS fallback' },
                { value: 'sms', label: 'SMS only' },
              ]}
            />
          </div>

          <Button size="md" disabled={saving} onClick={handleSave}>
            {saving ? 'Saving...' : saved ? 'Saved' : 'Save preferences'}
          </Button>
        </Card>
      )}
    </WorkerShell>
  )
}
