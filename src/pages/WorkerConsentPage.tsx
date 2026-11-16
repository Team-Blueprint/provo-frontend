import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'reicon-react'
import { api } from '@/api/client'
import { messages } from '@/messages/en'
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
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3.5">
          <Link to="/worker" className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to worker</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-8">
        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck weight="Filled" className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm font-medium">Worker consent</span>
          </div>

          <h1 className="text-xl font-semibold text-foreground">Share your income report</h1>

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
            <li>Shows your confirmed jobs, active months, and 0 to 100 score.</li>
            <li>Client phone numbers and bank accounts stay hidden behind tokens.</li>
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
      </main>
    </div>
  )
}
