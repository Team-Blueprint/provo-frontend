import { useEffect, useState } from 'react'
import { api } from '@/api/client'
import type { Worker } from '@/api/types'
import { WorkerShell } from '@/components/pw/WorkerShell'
import { Card, Skeleton } from '@/components/ui/card'

export function WorkerProfilePage() {
  const [worker, setWorker] = useState<Worker | null>(null)

  useEffect(() => {
    api.getWorkerDashboard().then((d) => setWorker(d.worker))
  }, [])

  return (
    <WorkerShell>
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Your verified worker identity and Paga auto-sweep bank account.
        </p>
      </div>

      {!worker ? (
        <Skeleton className="h-56 w-full" />
      ) : (
        <Card className="divide-y divide-border overflow-hidden">
          <div className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground">
              EE
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">{worker.name}</p>
              <p className="text-xs text-muted-foreground">emem.ekpo@proofwork.ng</p>
            </div>
          </div>
          <div className="p-5 grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <span className="text-xs text-muted-foreground block">Trade</span>
              <span className="font-medium text-foreground">{worker.trade}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Phone</span>
              <span className="font-medium text-foreground">{worker.phone}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Paga Subsidiary NUBAN</span>
              <span className="font-mono font-medium text-foreground">
                {worker.pagaAccountNumber}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Auto-sweep payout bank</span>
              <span className="font-medium text-foreground">
                {worker.bankName} ({worker.bankAccountNumber})
              </span>
            </div>
          </div>
        </Card>
      )}
    </WorkerShell>
  )
}
