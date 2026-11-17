import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'reicon-react'
import { api } from '@/api/client'
import type { EscrowJob } from '@/api/types'
import { EscrowCheckoutCard } from '@/components/pw/EscrowCheckoutCard'
import { Button } from '@/components/ui/button'
import { Card, Skeleton } from '@/components/ui/card'

export function CheckoutPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const [job, setJob] = useState<EscrowJob | null>(null)
  const [loading, setLoading] = useState(true)
  const [partialPaidNaira, setPartialPaidNaira] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  async function loadJob() {
    if (!jobId) {
      setLoading(false)
      return
    }
    const found = await api.getJob(jobId)
    setJob(found)
    setLoading(false)
  }

  useEffect(() => {
    loadJob()
    const handler = () => loadJob()
    window.addEventListener('proofwork:demo-updated', handler)
    return () => window.removeEventListener('proofwork:demo-updated', handler)
  }, [jobId])

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <header className="sticky top-0 z-20 border-b border-border bg-card">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 sm:px-6 py-3.5">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            <span
              className="inline-block h-2.5 w-2.5 rounded-[3px] bg-[var(--pw-brick)]"
              aria-hidden="true"
            />
            <span>Provo</span>
          </Link>
          <Link
            to="/client"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Employer dashboard</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">Lock job pay</h1>
          <p className="text-sm text-muted-foreground">
            Transfer once into escrow. Pay releases day by day as you confirm work.
          </p>
        </div>

        {loading ? (
          <Card className="p-6 space-y-4">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-20 w-full" />
          </Card>
        ) : !job ? (
          <Card className="p-6 space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Job not found</h2>
            <p className="text-sm text-muted-foreground">
              This payment link may have expired or the job does not exist.
            </p>
            <div>
              <Button size="md" onClick={() => navigate('/client')}>
                Back to employer dashboard
              </Button>
            </div>
          </Card>
        ) : (
          <EscrowCheckoutCard
            job={job}
            partialPaidNaira={partialPaidNaira}
            isSubmitting={submitting}
            onSimulateFund={async () => {
              setSubmitting(true)
              try {
                await api.simulateFundJob(job.id)
                setPartialPaidNaira(Math.round(job.totalKobo / 100))
                await loadJob()
              } finally {
                setSubmitting(false)
              }
            }}
            onSimulatePartial={(half) => setPartialPaidNaira(half)}
            onDone={() => navigate('/client')}
            doneLabel="Open employer dashboard"
          />
        )}
      </main>
    </div>
  )
}
