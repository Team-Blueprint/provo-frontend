import { useState } from 'react'
import { Link } from 'react-router-dom'

export function SiteFooter() {
  const [email, setEmail] = useState('')
  const [joined, setJoined] = useState(false)

  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-14 pb-10 space-y-12">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="flex items-center gap-2 font-semibold text-background">
              <span
                className="inline-block h-3 w-3 rounded-[3px] bg-[var(--pw-brick)]"
                aria-hidden="true"
              />
              <span>Proofwork</span>
            </Link>
            <p className="text-xs text-background/70 max-w-xs">
              Escrow-backed per-day work records for informal workers, powered by PagaEngine.
            </p>
            <div className="space-y-2 pt-1">
              <p className="text-xs text-background/60">Lender &amp; pilot updates.</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (email.trim()) {
                    setJoined(true)
                    setEmail('')
                  }
                }}
                className="flex items-center rounded-full border border-background/20 bg-background/5 p-1 max-w-xs"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  aria-label="Email address"
                  className="w-full bg-transparent px-3 py-1.5 text-xs text-background placeholder:text-background/50 focus:outline-none focus:ring-0"
                />
                <button
                  type="submit"
                  className="rounded-full bg-background px-4 py-1.5 text-xs font-semibold text-foreground hover:bg-background/90 transition-colors cursor-pointer shrink-0"
                >
                  {joined ? 'Joined' : 'Join'}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 text-xs">
            <div className="space-y-3">
              <p className="font-medium uppercase tracking-wider text-background/50">Surfaces</p>
              <ul className="space-y-2 text-background/80">
                <li>
                  <Link to="/worker" className="hover:text-background">
                    Worker app
                  </Link>
                </li>
                <li>
                  <Link to="/client" className="hover:text-background">
                    Client escrow
                  </Link>
                </li>
                <li>
                  <Link to="/supervisor" className="hover:text-background">
                    Supervisor view
                  </Link>
                </li>
                <li>
                  <Link to="/ussd" className="hover:text-background">
                    USSD simulator
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="font-medium uppercase tracking-wider text-background/50">Lenders</p>
              <ul className="space-y-2 text-background/80">
                <li>
                  <Link to="/report/rep_emem_lapo_2026" className="hover:text-background">
                    Sample report
                  </Link>
                </li>
                <li>
                  <Link to="/worker/consent" className="hover:text-background">
                    Consent flow
                  </Link>
                </li>
                <li>
                  <Link to="/admin" className="hover:text-background">
                    Audit ledger
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="font-medium uppercase tracking-wider text-background/50">System</p>
              <ul className="space-y-2 text-background/80">
                <li>
                  <Link to="/design-system" className="hover:text-background">
                    Design system
                  </Link>
                </li>
                <li>
                  <Link to="/#how-it-works" className="hover:text-background">
                    How it works
                  </Link>
                </li>
                <li>
                  <Link to="/#grades" className="hover:text-background">
                    Evidence grades
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="font-medium uppercase tracking-wider text-background/50">Legal</p>
              <ul className="space-y-2 text-background/80">
                <li>
                  <Link to="/privacy" className="hover:text-background">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-background">
                    Terms of Use
                  </Link>
                </li>
                <li>NDPA consent</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="overflow-hidden select-none pt-4">
          <p
            aria-label="proofwork"
            className="flex w-full justify-between text-[19vw] lg:text-[210px] font-bold tracking-[-0.05em] leading-[0.82]"
          >
            {'proofwork'.split('').map((char, idx) => (
              <span
                key={`${char}-${idx}`}
                className="inline-block text-background/20 transition-[transform,color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-3 hover:text-background/95 cursor-default"
              >
                {char}
              </span>
            ))}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-background/15 pt-6 text-xs text-background/60">
          <p>© 2026 Proofwork. Built for TechIgnite 2026.</p>
          <p>Powered by PagaEngine Subsidiary Accounts &amp; Collect API</p>
        </div>
      </div>
    </footer>
  )
}
