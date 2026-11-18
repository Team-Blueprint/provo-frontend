import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'reicon-react'
import { api } from '@/api/client'
import { messages } from '@/messages/en'
import { WorkerShell } from '@/components/pw/WorkerShell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export function WorkerConsentPage() {
  const navigate = useNavigate()
  const [lenderName, setLenderName] = useState('Lapo Microfinance Bank')
  const [submitting, setSubmitting] = useState(false)

  const expiresDate = new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  async function handleAgree() {
    setSubmitting(true)
    const consent = await api.createConsent(lenderName.trim() || 'Partner Lender', 7)
    setSubmitting(false)
    navigate(`/report/${consent.reportToken}`)
  }

  return (
    <WorkerShell>
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Share your income report</h1>
        <p className="text-sm text-muted-foreground">
          Grant time-limited, revocable access to a lender.
        </p>
      </div>

      <Card className="p-6 space-y-5 max-w-xl">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck weight="Filled" className="h-5 w-5" aria-hidden="true" />
          <span className="text-sm font-medium">Worker consent</span>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="lender-name" className="text-sm font-medium text-foreground">
            Lender name
          </label>
          <Input
            id="lender-name"
            value={lenderName}
            onChange={(e) => setLenderName(e.target.value)}
          />
        </div>

        <p className="rounded-[var(--pw-radius-md)] border border-border bg-muted/50 p-3.5 text-sm text-foreground">
          {messages.consent.summary(lenderName || 'this lender', expiresDate)}
        </p>

        <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
          <li>Shows your confirmed jobs, active months, and total verified pay.</li>
          <li>Employer phone numbers and bank accounts stay hidden behind tokens.</li>
          <li>The link expires automatically in 7 days.</li>
        </ul>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <Button className="flex-1" loading={submitting} onClick={handleAgree}>
            {messages.consent.agree}
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => navigate('/worker')}
            disabled={submitting}
          >
            {messages.consent.decline}
          </Button>
        </div>
      </Card>
    </WorkerShell>
  )
}
