import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Camera, CheckCircle, CloseCircle, Warning } from 'reicon-react'
import { api } from '@/api/client'
import type { DisputeReason, EscrowJob } from '@/api/types'
import { AmountText } from '@/components/pw/AmountText'
import { DisputeDialog } from '@/components/pw/DisputeDialog'
import { GradeBadge } from '@/components/pw/GradeBadge'
import { ProvoMark } from '@/components/pw/ProvoMark'
import { StatusPill } from '@/components/pw/StatusPill'
import { Button } from '@/components/ui/button'
import { Card, Skeleton } from '@/components/ui/card'

function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read image file'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Invalid image'))
      img.onload = () => {
        const maxDim = 960
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(String(reader.result))
          return
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.72))
      }
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

export function SupervisorVerifyPage() {
  const [searchParams] = useSearchParams()
  const jobId = searchParams.get('job') ?? ''
  const token = searchParams.get('token') ?? ''

  const [job, setJob] = useState<EscrowJob | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [photos, setPhotos] = useState<Record<number, string>>({})
  const [busyDay, setBusyDay] = useState<number | null>(null)
  const [disputeDayNum, setDisputeDayNum] = useState<number | null>(null)

  async function load() {
    if (!jobId || !token) {
      setError('This supervisor link is missing a job ID or token.')
      setLoading(false)
      return
    }
    try {
      const data = await api.getSupervisorJobView(jobId, token)
      setJob(data)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired supervisor link.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [jobId, token])

  async function handlePhotoPick(dayNumber: number, file?: File) {
    if (!file) return
    try {
      const compressed = await compressImageFile(file)
      setPhotos((prev) => ({ ...prev, [dayNumber]: compressed }))
    } catch {
      setError('Could not process that photo. Try another image.')
    }
  }

  async function handleConfirm(dayNumber: number) {
    if (!job) return
    setBusyDay(dayNumber)
    setError('')
    setNotice('')
    try {
      await api.supervisorConfirmDay({
        jobId: job.id,
        dayNumber,
        token,
        proofPhoto: photos[dayNumber],
        phone: job.supervisorPhone,
      })
      setNotice(`Day ${dayNumber} confirmed. Pay has been queued for ${job.workerName}.`)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not confirm this day.')
    } finally {
      setBusyDay(null)
    }
  }

  async function handleDispute(reason: DisputeReason) {
    if (!job || disputeDayNum === null) return
    setError('')
    setNotice('')
    try {
      await api.supervisorDisputeDay({
        jobId: job.id,
        dayNumber: disputeDayNum,
        token,
        reason,
      })
      setNotice(`Day ${disputeDayNum} flagged for review. Pay is held.`)
      setDisputeDayNum(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit dispute.')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      <header className="sticky top-0 z-20 border-b border-border bg-card">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 sm:px-6 py-3.5">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            <ProvoMark className="h-5 w-5" />
            <span>Provo</span>
          </Link>
          {job?.supervisorPhone && (
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {job.supervisorPhone}
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
            Confirm work done
          </h1>
          <p className="text-sm text-muted-foreground">
            Review each day marked done by the artisan and confirm to release pay.
          </p>
        </div>

        {notice && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-[var(--pw-radius-sm)] border border-[var(--pw-success)]/30 bg-[var(--pw-success-tint)] px-4 py-3 text-sm font-medium text-[var(--pw-success)]"
          >
            <CheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{notice}</span>
          </div>
        )}

        {error && job && (
          <div
            role="alert"
            className="rounded-[var(--pw-radius-sm)] border border-[var(--pw-critical)]/30 bg-[var(--pw-critical-tint)] px-4 py-3 text-sm font-medium text-[var(--pw-critical)]"
          >
            {error}
          </div>
        )}

        {loading ? (
          <Card className="p-6 space-y-4">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-24 w-full" />
          </Card>
        ) : !job ? (
          <Card className="p-8 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--pw-warning-tint)] text-[var(--pw-warning)]">
              <Warning className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h2 className="text-lg font-semibold text-foreground">
                {!jobId || !token
                  ? 'This supervisor link is incomplete'
                  : 'Job not found or link expired'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {!jobId || !token
                  ? 'Ask the employer to copy and send the full verification link again.'
                  : 'This link may be broken, expired, or replaced. Ask the employer to share a fresh supervisor link.'}
              </p>
            </div>
            <div className="pt-1">
              <Link to="/">
                <Button size="md" variant="secondary">
                  Back to Provo home
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          (
            <Card className="overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-6 py-5">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-foreground">
                    {job.workerName} · {job.trade}
                  </h2>
                  <p className="text-sm text-muted-foreground">{job.description}</p>
                  {job.supervisorName && (
                    <p className="text-xs text-muted-foreground">
                      Supervisor: <span className="font-medium text-foreground">{job.supervisorName}</span>
                    </p>
                  )}
                </div>
                <StatusPill status={job.status} />
              </div>

              <div className="divide-y divide-border">
                {job.days.map((day) => {
                  const previewPhoto = photos[day.dayNumber] ?? day.proofPhoto
                  const isReportable = day.status === 'DONE_REPORTED'
                  return (
                    <div key={day.dayNumber} className="px-6 py-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-mono text-sm font-semibold">
                            Day {day.dayNumber}
                          </span>
                          <AmountText amount={Math.round(day.amountKobo / 100)} size="sm" />
                          <StatusPill status={day.status} />
                          {day.outcome && <GradeBadge outcome={day.outcome} size="sm" />}
                        </div>
                      </div>

                      {previewPhoto && (
                        <div className="relative inline-block">
                          <img
                            src={previewPhoto}
                            alt={`Day ${day.dayNumber} work proof`}
                            className="h-32 w-48 rounded-[var(--pw-radius-sm)] border border-border object-cover"
                          />
                          {isReportable && photos[day.dayNumber] && (
                            <button
                              type="button"
                              aria-label="Remove proof photo"
                              onClick={() =>
                                setPhotos((prev) => {
                                  const next = { ...prev }
                                  delete next[day.dayNumber]
                                  return next
                                })
                              }
                              className="absolute -top-2 -right-2 rounded-full bg-card border border-border p-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <CloseCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}

                      {isReportable && (
                        <div className="flex flex-wrap items-center gap-2.5">
                          <label className="inline-flex items-center gap-1.5 rounded-[var(--pw-radius-sm)] border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-muted/50 cursor-pointer">
                            <Camera className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                            <span>
                              {photos[day.dayNumber] ? 'Change proof photo' : 'Add proof photo (optional)'}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              className="sr-only"
                              onChange={(e) =>
                                handlePhotoPick(day.dayNumber, e.target.files?.[0])
                              }
                            />
                          </label>

                          <Button
                            size="sm"
                            disabled={busyDay === day.dayNumber}
                            onClick={() => handleConfirm(day.dayNumber)}
                          >
                            <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>
                              {busyDay === day.dayNumber ? 'Confirming...' : 'Confirm work done'}
                            </span>
                          </Button>

                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setDisputeDayNum(day.dayNumber)}
                          >
                            Dispute
                          </Button>
                        </div>
                      )}

                      {day.status === 'PENDING' && (
                        <p className="text-xs text-muted-foreground">
                          Waiting for {job.workerName} to mark Day {day.dayNumber} done before you
                          can confirm, upload a photo, or dispute.
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>
          )
        )}
      </main>

      <DisputeDialog
        open={disputeDayNum !== null}
        onClose={() => setDisputeDayNum(null)}
        onSubmit={handleDispute}
      />
    </div>
  )
}
