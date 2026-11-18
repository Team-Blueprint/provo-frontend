import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Book,
  CloseCircle,
  Menu,
  Search,
} from 'reicon-react'
import { getSession } from '@/api/session'
import {
  allDocPages,
  docsTabs,
  extractHeadings,
  getAdjacentPages,
  getDocPage,
  searchDocPages,
} from '@/docs/docsLoader'
import { ProvoMark } from '@/components/pw/ProvoMark'
import { MdxContent } from '@/docs/mdxRenderer'

function methodBadgeClass(method: string) {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'bg-[var(--pw-success-tint)] text-[var(--pw-success)]'
    case 'POST':
      return 'bg-[var(--pw-primary-tint)] text-[var(--pw-primary)]'
    case 'PATCH':
      return 'bg-[var(--pw-warning-tint)] text-[var(--pw-warning)]'
    default:
      return 'bg-[var(--pw-info-tint)] text-[var(--pw-info)]'
  }
}

export function DocsPage() {
  const params = useParams()
  const navigate = useNavigate()
  const rawSlug = params['*'] || 'introduction'
  const cleanSlug = rawSlug.replace(/^\/+|\/+$/g, '') || 'introduction'

  const page = getDocPage(cleanSlug) ?? getDocPage('introduction')!
  const activeTab = useMemo(
    () => docsTabs.find((t) => t.tab === page.tab) ?? docsTabs[0],
    [page.tab],
  )
  const headings = useMemo(() => extractHeadings(page.body), [page.body])
  const { prev, next } = useMemo(() => getAdjacentPages(page.slug), [page.slug])

  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const searchResults = useMemo(() => searchDocPages(searchQuery), [searchQuery])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [page.slug])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((v) => !v)
      } else if (e.key === 'Escape') {
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const switchTab = (tabName: string) => {
    const targetTab = docsTabs.find((t) => t.tab === tabName)
    const firstSlug = targetTab?.groups[0]?.pages[0]
    if (firstSlug) {
      navigate(`/docs/${firstSlug}`)
    }
  }

  const session = getSession()
  const workerHref =
    session?.accessToken && session.user.isWorker ? '/worker' : '/sign-in?role=worker'
  const employerHref =
    session?.accessToken && session.user.isClient ? '/employer' : '/sign-in?role=employer'

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-[var(--pw-rule)] bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-label="Toggle documentation menu"
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-[var(--pw-radius-sm)] border border-[var(--pw-rule)] text-foreground cursor-pointer"
            >
              {mobileNavOpen ? (
                <CloseCircle className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Menu className="h-4 w-4" aria-hidden="true" />
              )}
            </button>

            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2 font-bold tracking-tight text-foreground hover:opacity-80 transition-opacity">
                <ProvoMark className="h-5 w-5" />
                <span>Provo</span>
              </Link>
              <Link
                to="/docs"
                className="rounded-full border border-[var(--pw-rule)] bg-[var(--pw-primary-tint)] px-2 py-0.5 text-[11px] font-medium text-[var(--pw-primary)] hover:border-[var(--pw-primary)]/40 transition-colors"
              >
                Docs
              </Link>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex w-64 lg:w-80 items-center justify-between rounded-[var(--pw-radius-sm)] border border-[var(--pw-rule)] bg-[var(--pw-bg)] px-3 py-1.5 text-xs text-muted-foreground hover:border-[var(--pw-primary)]/50 cursor-pointer"
          >
            <span className="inline-flex items-center gap-2">
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Search documentation...</span>
            </span>
            <kbd className="rounded border border-[var(--pw-rule)] bg-card px-1.5 py-0.5 font-mono text-[10px]">
              ⌘K
            </kbd>
          </button>

          <div className="flex items-center gap-3 text-xs font-medium">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search documentation"
              className="sm:hidden flex h-9 w-9 items-center justify-center rounded-[var(--pw-radius-sm)] border border-[var(--pw-rule)] text-muted-foreground cursor-pointer"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
            </button>
            <Link
              to={workerHref}
              className="hidden md:inline-block text-muted-foreground hover:text-foreground transition-colors"
            >
              Worker Demo
            </Link>
            <Link
              to={employerHref}
              className="hidden md:inline-block text-muted-foreground hover:text-foreground transition-colors"
            >
              Employer Portal
            </Link>
            <Link
              to="/"
              className="rounded-full bg-[var(--pw-primary)] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[var(--pw-primary-hover)] transition-colors"
            >
              Open App
            </Link>
          </div>
        </div>

        <div className="border-t border-[var(--pw-rule)] bg-card">
          <div className="mx-auto flex max-w-[1440px] items-center gap-6 overflow-x-auto px-4 sm:px-6 lg:px-8">
            {docsTabs.map((t) => {
              const isActive = t.tab === activeTab.tab
              return (
                <button
                  key={t.tab}
                  type="button"
                  onClick={() => switchTab(t.tab)}
                  className={`whitespace-nowrap border-b-2 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'border-[var(--pw-primary)] text-[var(--pw-primary)]'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.tab}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px] gap-8 px-4 sm:px-6 lg:px-8">
        <aside
          className={`${
            mobileNavOpen
              ? 'fixed inset-x-0 top-[102px] bottom-0 z-20 block overflow-y-auto bg-card p-6'
              : 'hidden'
          } lg:sticky lg:top-[102px] lg:block lg:h-[calc(100vh-102px)] lg:w-64 lg:shrink-0 lg:overflow-y-auto lg:border-r lg:border-[var(--pw-rule)] lg:py-8 lg:pr-5`}
        >
          <nav aria-label="Documentation sidebar" className="space-y-6">
            {activeTab.groups.map((group) => (
              <div key={group.group} className="space-y-1.5">
                <p className="px-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.group}
                </p>
                <ul className="space-y-0.5">
                  {group.pages.map((slug) => {
                    const target = allDocPages.get(slug)
                    const active = page.slug === slug
                    return (
                      <li key={slug}>
                        <Link
                          to={`/docs/${slug}`}
                          onClick={() => setMobileNavOpen(false)}
                          className={`flex items-center justify-between rounded-[var(--pw-radius-sm)] px-2.5 py-1.5 text-[13px] transition-colors ${
                            active
                              ? 'bg-[var(--pw-primary-tint)] font-semibold text-[var(--pw-primary)]'
                              : 'text-muted-foreground hover:bg-[var(--pw-primary-tint)]/40 hover:text-foreground'
                          }`}
                        >
                          <span className="truncate">{target?.title || slug}</span>
                          {target?.api && (
                            <span
                              className={`ml-2 shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${methodBadgeClass(target.api.split(' ')[0])}`}
                            >
                              {target.api.split(' ')[0]}
                            </span>
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 py-8 lg:py-10">
          <div className="mx-auto max-w-3xl">
            <div className="mb-3 flex items-center gap-2 text-xs font-medium text-[var(--pw-primary)]">
              <span>{page.tab}</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">{page.group}</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {page.title}
            </h1>
            {page.api && (
              <div className="mt-3 inline-flex items-center gap-2.5 rounded-[var(--pw-radius-sm)] border border-[var(--pw-rule)] bg-card px-3 py-1.5 font-mono text-xs">
                <span
                  className={`rounded px-1.5 py-0.5 font-bold ${methodBadgeClass(page.api.split(' ')[0])}`}
                >
                  {page.api.split(' ')[0]}
                </span>
                <span className="text-foreground">{page.api.split(' ').slice(1).join(' ')}</span>
              </div>
            )}
            {page.description && (
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                {page.description}
              </p>
            )}

            <div className="mt-8 border-t border-[var(--pw-rule)] pt-6">
              <MdxContent body={page.body} />
            </div>

            <div className="mt-12 grid gap-4 border-t border-[var(--pw-rule)] pt-6 sm:grid-cols-2">
              {prev ? (
                <Link
                  to={`/docs/${prev.slug}`}
                  className="group flex flex-col gap-1 rounded-[var(--pw-radius-md)] border border-[var(--pw-rule)] bg-card p-4 hover:border-[var(--pw-primary)]/50"
                >
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Previous</span>
                  </span>
                  <span className="text-sm font-semibold text-foreground group-hover:text-[var(--pw-primary)]">
                    {prev.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}

              {next && (
                <Link
                  to={`/docs/${next.slug}`}
                  className="group flex flex-col items-end gap-1 rounded-[var(--pw-radius-md)] border border-[var(--pw-rule)] bg-card p-4 text-right hover:border-[var(--pw-primary)]/50"
                >
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <span>Next</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold text-foreground group-hover:text-[var(--pw-primary)]">
                    {next.title}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </main>

        <aside className="hidden xl:block xl:w-56 xl:shrink-0 xl:py-10">
          <div className="sticky top-[134px] space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              On this page
            </p>
            {headings.length === 0 ? (
              <p className="text-xs text-muted-foreground">Overview</p>
            ) : (
              <ul className="space-y-1.5 border-l border-[var(--pw-rule)] pl-3 text-xs">
                {headings.map((h) => (
                  <li key={h.id} className={h.level === 3 ? 'pl-2.5' : ''}>
                    <a
                      href={`#${h.id}`}
                      className="block py-0.5 text-muted-foreground hover:text-[var(--pw-primary)] transition-colors"
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-20 backdrop-blur-xs"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-[var(--pw-radius-md)] border border-[var(--pw-rule)] bg-card shadow-[var(--pw-shadow-sheet)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 border-b border-[var(--pw-rule)] px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guides, architecture, or API endpoints..."
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded border border-[var(--pw-rule)] px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground cursor-pointer"
              >
                ESC
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {searchResults.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  No documentation pages match "{searchQuery}".
                </p>
              ) : (
                searchResults.map((item) => (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => {
                      setSearchOpen(false)
                      setSearchQuery('')
                      navigate(`/docs/${item.slug}`)
                    }}
                    className="flex w-full items-start gap-3 rounded-[var(--pw-radius-sm)] px-3 py-2.5 text-left hover:bg-[var(--pw-primary-tint)]/60 cursor-pointer"
                  >
                    <Book className="h-4 w-4 text-[var(--pw-primary)] mt-0.5 shrink-0" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.tab} · {item.group} — {item.description}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
