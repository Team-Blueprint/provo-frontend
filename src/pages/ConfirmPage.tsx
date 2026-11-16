import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '@/api/client'
import type { DisputeReason, Job, JobType } from '@/api/types'
import { formatShortDate } from '@/lib/format'
import { messages } from '@/messages/en'
import { Button } from '@/components/ui/button'
import { Card, Skeleton } from '@/components/ui/card'
import { AmountText } from '@/components/pw/AmountText'
import { DisputeDialog } from '@/components/pw/DisputeDialog'
import { JobTypePicker } from '@/components/pw/JobTypePicker'
import { OfflineBanner } from '@/components/pw/OfflineBanner'
import { ReceiptCard } from '@/components/pw/ReceiptCard'
import { StatusPill } from '@/components/pw/StatusPill'

export function ConfirmPage() {
  const { token = 'tok_confirm_110' } = useParams()
  const [loading, setLoading] = useState(true)
  const [workerName, setWorkerName] = useState('Emem Bassey')
  const [job, setJob] = useState<Job | null>(null)
  const [selectedType, setSelectedType] = useState<JobType | undefined>(undefined)
  const [submitting, setSubmitting] = useState(false)
  const [disputeOpen, setDisputeOpen] = useState(false)

  async function load() {
    setLoading(true)
    const res = await api.getConfirmJob(token)
    setWorkerName(res.workerName)
    setJob(res.job)
    if (res.job?.jobType) setSelectedType(res.job.jobType)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [token])

  async function handleConfirm() {
    if (!job || !selectedType) return
    setSubmitting(true)
    const updated = await api.confirmJob(token, selectedType)
    setJob(updated)
    setSubmitting(false)
  }

  async function handleDispute(reason: DisputeReason) {
    await api.disputeJob(token, reason, 'client')
    await load()
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <OfflineBanner />
      <main className="mx-auto max-w-md px-4 py-8 space-y-5">
        {loading ? (
          <Card className="p-5 space-y-4">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </Card>
        ) : !job ? (
          <Card className="p-6 text-center space-y-2">
            <h1 className="text-lg font-medium">Link not found</h1>
            <p className="text-sm text-muted-foreground">
              {messages.confirm.expiredLink(workerName)}
            </p>
          </Card>
        ) : job.status === 'confirmed' && job.receiptId && job.jobType ? (
          <div className="space-y-4">
            <p className="text-sm font-medium text-[var(--pw-success)]">
              {messages.confirm.confirmedTitle}
            </p>
            <ReceiptCard
              receiptId={job.receiptId}
              workerName={workerName}
              clientDisplay={job.clientName}
              amount={job.amount}
              jobType={job.jobType}
              grade={job.grade}
              confirmedAt={job.confirmedAt ?? job.createdAt}
            />
          </div>
        ) : job.status === 'disputed' ? (
          <Card className="p-6 space-y-3">
            <StatusPill status="disputed" />
            <h1 className="text-lg font-medium">This payment was marked as disputed</h1>
            <p className="text-sm text-muted-foreground">
              It has been removed from {workerName}’s income score while reviewed.
            </p>
          </Card>
        ) : (
          <Card className="p-5 space-y-5">
            <div className="space-y-1 border-b border-border pb-4">
              <p className="text-sm text-muted-foreground">Confirm payment to</p>
              <h1 className="text-xl font-semibold text-foreground">{workerName}</h1>
              <div className="pt-2">
                <AmountText amount={job.amount} size="xl" />
              </div>
              <p className="text-xs text-muted-foreground">{formatShortDate(job.createdAt)}</p>
            </div>

            <JobTypePicker
              value={selectedType}
              onChange={setSelectedType}
              disabled={submitting}
            />

            <div className="space-y-2.5">
              <Button
                className="w-full"
                disabled={!selectedType}
                loading={submitting}
                onClick={handleConfirm}
              >
                {messages.confirm.button}
              </Button>
              {!selectedType && (
                <p className="text-center text-xs text-muted-foreground">
                  {messages.confirm.disabledReason}
                </p>
              )}
              <button
                type="button"
                onClick={() => setDisputeOpen(true)}
                className="w-full py-2 text-center text-sm font-medium text-muted-foreground hover:text-destructive cursor-pointer"
              >
                {messages.confirm.notForWork}
              </button>
            </div>

            <p className="text-xs text-muted-foreground text-center border-t border-border pt-3">
              {messages.confirm.recordedNotice(workerName)}
            </p>
          </Card>
        )}
      </main>

      <DisputeDialog
        open={disputeOpen}
        onClose={() => setDisputeOpen(false)}
        onSubmit={handleDispute}
      />
    </div>
  )
}
