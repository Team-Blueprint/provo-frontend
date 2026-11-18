import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  Briefcase,
  CloseCircle,
  FileText,
  HelpCircle,
  Home,
  Logout,
  Menu,
  Search,
  Settings,
} from 'reicon-react'
import { workerDashboardQueryOptions } from '@/api/queries'
import { clearSession } from '@/api/session'
import type { Worker } from '@/api/types'
import { OfflineBanner } from '@/components/pw/OfflineBanner'
import { ProvoMark } from '@/components/pw/ProvoMark'
import { Card } from '@/components/ui/card'

interface WorkerShellProps {
  children: React.ReactNode
  searchQuery?: string
  onSearchChange?: (q: string) => void
  jobCount?: number
}

const MENU_ITEMS = [
  { to: '/worker', label: 'Overview', icon: Home },
  { to: '/worker/jobs', label: 'Job records', icon: Briefcase, showBadge: true },
  { to: '/worker/consent', label: 'Share report', icon: FileText },
  { to: '/worker/settings', label: 'Settings', icon: Settings },
]

const FOOTER_ITEMS = [
  { to: '/worker/help', label: 'Help', icon: HelpCircle },
  { to: '/', label: 'Log out', icon: Logout, isLogout: true },
]

const QUICK_COMMANDS = [
  { to: '/worker', label: 'Overview', meta: 'Score & payout Paga account' },
  { to: '/worker/jobs', label: 'Job records', meta: 'Day-by-day work schedule' },
  { to: '/worker/consent', label: 'Share report', meta: 'Grant lender access' },
  { to: '/worker/share-link', label: 'Share your link', meta: 'Send job pay link to employer' },
  { to: '/worker/settings?tab=account', label: 'Account', meta: 'Trade & payout account' },
  { to: '/worker/settings?tab=preferences', label: 'Settings', meta: 'Alert preferences' },
  { to: '/worker/help', label: 'Help', meta: 'FAQs for workers' },
  { to: '/ussd', label: 'USSD simulator', meta: 'Dial *123# on feature phone' },
  { to: '/employer', label: 'Employer portal', meta: 'Create & fund a job' },
]

export function WorkerShell({
  children,
  searchQuery,
  onSearchChange,
  jobCount,
}: WorkerShellProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [localSearch, setLocalSearch] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { data: dashboard } = useQuery(workerDashboardQueryOptions())
  const activeWorker: Worker | null = dashboard?.worker ?? null
  const modalInputRef = useRef<HTMLInputElement>(null)
  const query = searchQuery ?? localSearch
  const setQuery = onSearchChange ?? setLocalSearch
  const resolvedJobCount = jobCount ?? dashboard?.jobs.length

  const workerInitials = (activeWorker?.name ?? 'Emem Ekpo')
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        setCollapsed((v) => !v)
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => modalInputRef.current?.focus(), 20)
    }
  }, [searchOpen])

  const filteredCommands = QUICK_COMMANDS.filter(
    (c) =>
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.meta.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-muted/45 text-foreground">
      <OfflineBanner />
      <div
        className={`min-h-screen lg:grid lg:gap-3 lg:p-3 transition-[grid-template-columns] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          collapsed
            ? 'lg:grid-cols-[72px_minmax(0,1fr)]'
            : 'lg:grid-cols-[236px_minmax(0,1fr)]'
        }`}
      >
        <aside className="hidden lg:sticky lg:top-3 lg:flex lg:h-[calc(100vh-1.5rem)] flex-col justify-between py-3 px-2 overflow-y-auto">
          <div className="space-y-7">
            <Link
              to="/"
              title="Provo"
              className={`flex items-center gap-2.5 px-2.5 font-semibold text-foreground ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <ProvoMark className="h-5 w-5" />
              {!collapsed && <span className="text-base">Provo</span>}
            </Link>

            <div className="space-y-6">
              <div className="space-y-2">
                {!collapsed && (
                  <p className="px-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Menu
                  </p>
                )}
                <nav className="space-y-1 text-sm">
                  {MENU_ITEMS.map((item) => {
                    const Icon = item.icon
                    const active =
                      pathname === item.to ||
                      (item.to === '/worker/settings' && pathname === '/worker/profile')
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        title={collapsed ? item.label : undefined}
                        className={`relative flex items-center rounded-[var(--pw-radius-sm)] px-3 py-2.5 font-medium transition-colors ${
                          collapsed ? 'justify-center' : 'justify-between'
                        } ${
                          active
                            ? 'bg-card text-foreground before:content-[""] before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:rounded-r-full before:bg-primary'
                            : 'text-muted-foreground hover:bg-card/60 hover:text-foreground'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon
                            weight={active ? 'Filled' : undefined}
                            className={`h-4 w-4 shrink-0 ${active ? 'text-primary' : ''}`}
                            aria-hidden="true"
                          />
                          {!collapsed && <span>{item.label}</span>}
                        </span>
                        {!collapsed && item.showBadge && resolvedJobCount !== undefined && (
                          <span className="rounded-full bg-primary px-2 py-0.5 font-mono text-[10px] font-semibold text-primary-foreground">
                            {resolvedJobCount}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </div>
          </div>

          <div className="border-t border-border/70 pt-3">
            <nav className="space-y-1 text-sm">
              {FOOTER_ITEMS.map((item) => {
                const Icon = item.icon
                const active = !item.isLogout && pathname === item.to
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => {
                      if (item.isLogout) clearSession()
                    }}
                    title={collapsed ? item.label : undefined}
                    className={`relative flex items-center gap-2.5 rounded-[var(--pw-radius-sm)] px-3 py-2.5 font-medium transition-colors ${
                      collapsed ? 'justify-center' : ''
                    } ${
                      active
                        ? 'bg-card text-foreground before:content-[""] before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:rounded-r-full before:bg-primary'
                        : item.isLogout
                          ? 'text-muted-foreground hover:bg-[var(--pw-critical-tint)] hover:text-[var(--pw-critical)]'
                          : 'text-muted-foreground hover:bg-card/60 hover:text-foreground'
                    }`}
                  >
                    <Icon
                      weight={active ? 'Filled' : undefined}
                      className={`h-4 w-4 shrink-0 ${active ? 'text-primary' : ''}`}
                      aria-hidden="true"
                    />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                )
              })}
            </nav>
          </div>
        </aside>

        <div className="flex flex-col min-w-0 bg-card lg:rounded-[22px] lg:border lg:border-border overflow-clip">
          <header className="sticky top-0 z-20 border-b border-border bg-card px-4 sm:px-8 py-3.5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 flex-1 max-w-sm">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Open menu"
                  className="lg:hidden flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground cursor-pointer"
                >
                  <Menu className="h-4 w-4" aria-hidden="true" />
                </button>
                <Link to="/" className="lg:hidden inline-flex items-center gap-1.5 font-semibold">
                  <ProvoMark className="h-5 w-5" />
                </Link>
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="hidden sm:flex w-full items-center justify-between gap-2 rounded-full border border-input bg-background px-3.5 py-2 text-left hover:border-[var(--pw-rule-strong)] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-sm text-muted-foreground/70 truncate">
                    <Search className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                    <span>{query || 'Search jobs, employers...'}</span>
                  </span>
                  <span className="rounded-[4px] border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    ⌘F
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search"
                  className="sm:hidden flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground cursor-pointer"
                >
                  <Search className="h-4 w-4" aria-hidden="true" />
                </button>
                <Link
                  to="/worker/jobs"
                  aria-label="Notifications"
                  className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-foreground"
                >
                  <Bell className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link to="/worker/settings?tab=account" className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {workerInitials || 'EE'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-foreground leading-tight">
                      {activeWorker?.name ?? 'Emem Ekpo'}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      {activeWorker?.customTrade || activeWorker?.trade || 'Bricklaying'} ·{' '}
                      {activeWorker?.phone ?? '+234 803 441 9210'}
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl px-4 sm:px-8 py-6 sm:py-8 space-y-6">
            {children}
          </main>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm lg:hidden"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="h-full w-72 bg-card p-5 flex flex-col justify-between border-r border-border"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
                  <ProvoMark className="h-5 w-5" />
                  <span>Provo</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="rounded-full p-1.5 text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  <CloseCircle className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <nav className="space-y-1 text-sm">
                {MENU_ITEMS.map((item) => {
                  const Icon = item.icon
                  const active =
                    pathname === item.to ||
                    (item.to === '/worker/settings' && pathname === '/worker/profile')
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`relative flex items-center gap-2.5 rounded-[var(--pw-radius-sm)] px-3 py-2.5 font-medium transition-colors ${
                        active
                          ? 'bg-muted/70 text-foreground before:content-[""] before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:rounded-r-full before:bg-primary'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      }`}
                    >
                      <Icon
                        weight={active ? 'Filled' : undefined}
                        className={`h-4 w-4 shrink-0 ${active ? 'text-primary' : ''}`}
                        aria-hidden="true"
                      />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="border-t border-border pt-3">
              <nav className="space-y-1 text-sm">
                {FOOTER_ITEMS.map((item) => {
                  const Icon = item.icon
                  const active = !item.isLogout && pathname === item.to
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => {
                        setMobileMenuOpen(false)
                        if (item.isLogout) clearSession()
                      }}
                      className={`relative flex items-center gap-2.5 rounded-[var(--pw-radius-sm)] px-3 py-2.5 font-medium transition-colors ${
                        active
                          ? 'bg-muted/70 text-foreground before:content-[""] before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:rounded-r-full before:bg-primary'
                          : item.isLogout
                            ? 'text-muted-foreground hover:bg-[var(--pw-critical-tint)] hover:text-[var(--pw-critical)]'
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      }`}
                    >
                      <Icon
                        weight={active ? 'Filled' : undefined}
                        className={`h-4 w-4 shrink-0 ${active ? 'text-primary' : ''}`}
                        aria-hidden="true"
                      />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {searchOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search Provo"
          onClick={() => setSearchOpen(false)}
          className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/30 backdrop-blur-sm px-4 pt-20"
        >
          <Card
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg overflow-hidden shadow-[var(--pw-shadow-sheet)]"
          >
            <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
              <input
                ref={modalInputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search jobs, pages, or actions..."
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/65 focus:outline-none focus:ring-0"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded-[4px] border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ESC
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto p-2 space-y-1">
              {filteredCommands.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                  No matching pages. Press Enter in Job records to filter jobs.
                </p>
              ) : (
                filteredCommands.map((item) => (
                  <button
                    key={item.to}
                    type="button"
                    onClick={() => {
                      setSearchOpen(false)
                      navigate(item.to)
                    }}
                    className="flex w-full items-center justify-between rounded-[var(--pw-radius-sm)] px-3 py-2.5 text-left hover:bg-muted transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.meta}</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  </button>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
