import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Briefcase,
  Home,
  Logout,
  Search,
  UserTick,
} from 'reicon-react'
import { OfflineBanner } from '@/components/pw/OfflineBanner'
import { ProvoMark } from '@/components/pw/ProvoMark'
import { Card } from '@/components/ui/card'

interface EmployerShellProps {
  children: React.ReactNode
  searchQuery?: string
  onSearchChange?: (q: string) => void
  pendingCount?: number
  jobCount?: number
  employerName?: string
  employerPhone?: string
}

const NAV_ITEMS = [
  { to: '/employer', label: 'Overview', icon: Home, showPending: true },
  { to: '/employer/jobs', label: 'Jobs', icon: Briefcase, showJobs: true },
  { to: '/supervisor', label: 'Supervisor', icon: UserTick },
]

const QUICK_COMMANDS = [
  { to: '/employer', label: 'Employer overview', meta: 'Pending confirmations & summary' },
  { to: '/employer/jobs', label: 'Employer jobs', meta: 'All jobs, schedules & NUBANs' },
  { to: '/supervisor', label: 'Supervisor view', meta: 'Site foreman daily sign-off' },
  { to: '/ussd', label: 'USSD simulator', meta: 'Dial *123# in simulator' },
]

export function EmployerShell({
  children,
  searchQuery,
  onSearchChange,
  pendingCount = 0,
  jobCount = 0,
  employerName = 'Chief Etim',
  employerPhone = '+234 802 910 3311',
}: EmployerShellProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [localSearch, setLocalSearch] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const avatarMenuRef = useRef<HTMLDivElement>(null)
  const modalInputRef = useRef<HTMLInputElement>(null)
  const query = searchQuery ?? localSearch
  const setQuery = onSearchChange ?? setLocalSearch

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
        setAvatarMenuOpen(false)
      }
    }
    const onClickOutside = (e: MouseEvent) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('mousedown', onClickOutside)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('mousedown', onClickOutside)
    }
  }, [])

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => modalInputRef.current?.focus(), 20)
    }
  }, [searchOpen])

  const initials = employerName
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')

  const filteredCommands = QUICK_COMMANDS.filter(
    (c) =>
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.meta.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-foreground text-foreground pb-24 lg:pb-0">
      <OfflineBanner />
      <div
        className={`min-h-screen lg:grid lg:gap-3 lg:p-3 transition-[grid-template-columns] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          collapsed ? 'lg:grid-cols-[72px_minmax(0,1fr)]' : 'lg:grid-cols-[248px_minmax(0,1fr)]'
        }`}
      >
        <aside className="hidden lg:flex flex-col justify-between px-2 py-4 sticky top-3 h-[calc(100vh-24px)] text-background">
          <div className="space-y-6">
            <div
              className={`flex items-center px-3 pt-1 ${collapsed ? 'justify-center' : 'justify-between'}`}
            >
              <Link to="/" className="flex items-center gap-2 font-semibold text-background" title="Provo">
                <ProvoMark className="h-5 w-5" />
                {!collapsed && <span className="text-base">Provo</span>}
              </Link>
              {!collapsed && (
                <button
                  type="button"
                  onClick={() => setCollapsed(true)}
                  aria-label="Collapse sidebar"
                  title="Collapse sidebar (⌘B)"
                  className="rounded-[6px] px-1.5 py-0.5 font-mono text-[10px] text-background/60 hover:bg-background/10 hover:text-background cursor-pointer"
                >
                  ⌘B
                </button>
              )}
            </div>

            <div className="space-y-2">
              {!collapsed && (
                <p className="px-3 font-mono text-[11px] uppercase tracking-wider text-background/50">
                  Employer
                </p>
              )}
              <nav className="space-y-1 text-sm">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon
                  const active = pathname === item.to
                  const badgeValue = item.showPending
                    ? pendingCount
                    : item.showJobs
                      ? jobCount
                      : 0
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      title={collapsed ? item.label : undefined}
                      className={`relative flex items-center rounded-[var(--pw-radius-sm)] px-3 py-2.5 font-medium transition-colors ${
                        collapsed ? 'justify-center' : 'justify-between'
                      } ${
                        active
                          ? 'bg-background/12 text-background before:content-[""] before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:rounded-r-full before:bg-white'
                          : 'text-background/65 hover:bg-background/8 hover:text-background'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon
                          weight={active ? 'Filled' : undefined}
                          className={`h-4 w-4 shrink-0 ${active ? 'text-white' : ''}`}
                          aria-hidden="true"
                        />
                        {!collapsed && <span>{item.label}</span>}
                      </span>
                      {!collapsed && badgeValue > 0 && (
                        <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[10px] font-semibold text-primary">
                          {badgeValue}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>

          {collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              className="mx-auto rounded-full bg-background/10 px-2.5 py-1.5 font-mono text-[10px] text-background/70 hover:text-background cursor-pointer"
            >
              →
            </button>
          )}
        </aside>

        <div className="flex flex-col min-w-0 bg-card lg:rounded-[22px] lg:border lg:border-border overflow-clip">
          <header className="sticky top-0 z-20 border-b border-border bg-card px-4 sm:px-8 py-3.5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 max-w-sm">
                <Link to="/" className="lg:hidden inline-flex items-center gap-2 font-semibold text-foreground">
                  <ProvoMark className="h-5 w-5" />
                  <span>Provo</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="hidden sm:flex w-full items-center justify-between gap-2 rounded-full border border-input bg-background px-3.5 py-2 text-left hover:border-[var(--pw-rule-strong)] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-sm text-muted-foreground/70 truncate">
                    <Search className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                    <span>{query || 'Search jobs, artisans...'}</span>
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

                <div ref={avatarMenuRef} className="relative">
                  <button
                    type="button"
                    aria-expanded={avatarMenuOpen}
                    aria-haspopup="menu"
                    onClick={() => setAvatarMenuOpen((v) => !v)}
                    className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 hover:bg-muted/60 transition-colors cursor-pointer"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {initials || 'CE'}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-semibold text-foreground leading-tight">
                        {employerName}
                      </p>
                      <p className="font-mono text-[11px] text-muted-foreground leading-tight">
                        {employerPhone}
                      </p>
                    </div>
                  </button>

                  {avatarMenuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-60 rounded-[14px] border border-border bg-card p-2 shadow-[var(--pw-shadow-sheet)] z-50"
                    >
                      <div className="px-3 py-2.5 border-b border-border">
                        <p className="text-sm font-semibold text-foreground">{employerName}</p>
                        <p className="font-mono text-xs text-muted-foreground">{employerPhone}</p>
                      </div>
                      <Link
                        to="/"
                        role="menuitem"
                        onClick={() => setAvatarMenuOpen(false)}
                        className="mt-1 flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-xs font-medium text-[var(--pw-critical)] hover:bg-[var(--pw-critical-tint)] transition-colors"
                      >
                        <Logout className="h-4 w-4" aria-hidden="true" />
                        <span>Log out</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl px-4 sm:px-8 py-6 sm:py-8 space-y-6">
            {children}
          </main>
        </div>
      </div>

      <nav
        aria-label="Employer mobile navigation"
        className="lg:hidden fixed bottom-5 inset-x-0 z-40 mx-auto flex w-fit items-center gap-2 rounded-full border border-border bg-card/95 px-4 py-1 backdrop-blur-md shadow-[var(--pw-shadow-sheet)]"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = pathname === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`relative flex flex-col items-center justify-center gap-1 px-4 py-2 text-[11px] font-medium transition-colors ${
                active
                  ? 'text-primary after:content-[""] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-1 after:rounded-t-full after:bg-primary'
                  : 'text-muted-foreground hover:text-foreground'
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

      {searchOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search Provo"
          onClick={() => setSearchOpen(false)}
          className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/30 backdrop-blur-md p-4 pt-20"
        >
          <Card
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg overflow-hidden shadow-[var(--pw-shadow-sheet)]"
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
              <input
                ref={modalInputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search jobs, artisans, or jump to a page..."
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/65 focus:outline-none focus:ring-0"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded-[4px] border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground cursor-pointer"
              >
                ESC
              </button>
            </div>
            <div className="p-2 divide-y divide-border/50 max-h-80 overflow-y-auto">
              {filteredCommands.map((cmd) => (
                <button
                  key={cmd.to}
                  type="button"
                  onClick={() => {
                    setSearchOpen(false)
                    navigate(cmd.to)
                  }}
                  className="flex w-full items-center justify-between rounded-[var(--pw-radius-sm)] px-3 py-2.5 text-left hover:bg-muted/60 cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{cmd.label}</p>
                    <p className="text-xs text-muted-foreground">{cmd.meta}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
