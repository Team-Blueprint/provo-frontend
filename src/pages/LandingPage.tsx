import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AngleDown,
  ArrowRight,
  CloseCircle,
  Menu,
} from 'reicon-react'
import { Button } from '@/components/ui/button'
import { ProvoMark } from '@/components/pw/ProvoMark'
import { RevealSection } from '@/components/pw/RevealSection'
import { ScrollRevealText } from '@/components/pw/ScrollRevealText'
import { WhoItsForSection } from '@/components/pw/WhoItsForSection'

const FOUR_STEPS = [
  {
    num: '01',
    title: 'Employer funds job upfront',
    body: 'Employer picks an artisan like Emem Ekpo, sets the daily rate and days, and locks total funds via a one-time Paga NUBAN or payment link.',
  },
  {
    num: '02',
    title: 'Worker marks each day done',
    body: 'On Telegram, Web, or USSD (*123#), Emem taps Done at close of day. That starts a 24-hour confirmation window.',
  },
  {
    num: '03',
    title: 'Employer or supervisor confirms',
    body: 'One tap releases that day’s tranche to Emem’s Paga account with full score weight. After 24h with no dispute, auto-release pays out.',
  },
  {
    num: '04',
    title: 'Lender reads Profile Score & snapshot',
    body: 'With Emem’s consent, the lender opens an expiring report showing a 0–100 Profile Score, tier band, and employer-confirmed, supervisor-confirmed, and auto-released days.',
  },
]

const FAQS = [
  {
    q: 'Do employers or workers need to install a mobile app?',
    a: 'No. Workers mostly use Telegram or USSD (*123#), and employers can fund and confirm directly on the web or via Telegram.',
  },
  {
    q: 'How does Provo stop workers from faking their own income?',
    a: 'Every job starts with the employer locking the full pay through Paga before work begins. A worker can only mark a funded day done, and employer-confirmed days carry full score weight.',
  },
  {
    q: 'What happens if an employer forgets to confirm a day?',
    a: 'A 24-hour window runs after the worker marks the day done. If the employer does not dispute within 24 hours, the scheduler releases that day’s pay automatically at lower score weight.',
  },
  {
    q: 'Can a site supervisor confirm days on the employer’s behalf?',
    a: 'Yes. An employer can name a supervisor on multi-day jobs so a foreman on site can confirm or dispute each day’s work.',
  },
  {
    q: 'How do lenders verify a worker’s Provo record?',
    a: 'With the worker’s explicit consent, Provo generates an expiring report link with tokenized employer identities and an Ed25519-signed JSON snapshot.',
  },
]

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number>(1)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [joined, setJoined] = useState(false)
  const stepsRef = useRef<HTMLDivElement>(null)
  const [stepsProgress, setStepsProgress] = useState(0)

  useEffect(() => {
    let raf = 0
    const updateSteps = () => {
      const el = stepsRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const raw = (vh * 0.82 - rect.top) / Math.max(1, rect.height * 0.85)
      setStepsProgress(Math.max(0, Math.min(1, raw)))
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(updateSteps)
    }
    updateSteps()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed top-4 inset-x-0 z-50 mx-auto max-w-4xl px-4">
        <header className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center rounded-full border border-white/70 bg-white/75 pl-7 pr-2.5 py-2 backdrop-blur-md shadow-[0_8px_30px_rgba(0,49,112,0.08)] text-sm">
          <div className="flex items-center justify-start gap-6">
            <a
              href="#how-it-works"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="whitespace-nowrap font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              How it Works
            </a>
            <a
              href="#who-its-for"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('who-its-for')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="whitespace-nowrap font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Who it’s For
            </a>
            <Link
              to="/ussd"
              className="whitespace-nowrap font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              USSD Simulator
            </Link>
          </div>

          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-4 text-center text-xl font-extrabold tracking-tight text-primary"
          >
            <ProvoMark className="h-6 w-6" />
            <span>Provo</span>
          </Link>

          <div className="flex items-center justify-end gap-6">
            <Link
              to="/docs"
              className="whitespace-nowrap font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Docs
            </Link>
            <a
              href="#faq"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="whitespace-nowrap font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              FAQ
            </a>
            <Link
              to="/sign-in"
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 active:scale-[0.96] transition-[background-color,scale] duration-150 ease-out"
            >
              <span>Get started</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </header>

        <header className="md:hidden relative flex items-center justify-center rounded-full border border-white/70 bg-white/80 px-5 py-3.5 backdrop-blur-md shadow-[0_8px_24px_rgba(0,49,112,0.08)]">
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 text-xl font-extrabold tracking-tight text-primary"
          >
            <ProvoMark className="h-6 w-6" />
            <span>Provo</span>
          </Link>
          <button
            type="button"
            aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileNavOpen((v) => !v)}
            className="absolute right-4 flex h-9 w-9 items-center justify-center rounded-full text-foreground cursor-pointer"
          >
            {mobileNavOpen ? (
              <CloseCircle className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </header>

        {mobileNavOpen && (
          <div className="md:hidden mt-2 rounded-[20px] border border-white/70 bg-card/95 p-4 backdrop-blur-md shadow-[var(--pw-shadow-sheet)] space-y-1.5 text-sm">
            <a
              href="#how-it-works"
              onClick={(e) => {
                e.preventDefault()
                setMobileNavOpen(false)
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="block rounded-[10px] px-3 py-2 font-medium text-foreground hover:bg-muted"
            >
              How it Works
            </a>
            <a
              href="#who-its-for"
              onClick={(e) => {
                e.preventDefault()
                setMobileNavOpen(false)
                document.getElementById('who-its-for')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="block rounded-[10px] px-3 py-2 font-medium text-foreground hover:bg-muted"
            >
              Who it’s For
            </a>
            <a
              href="#faq"
              onClick={(e) => {
                e.preventDefault()
                setMobileNavOpen(false)
                document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="block rounded-[10px] px-3 py-2 font-medium text-foreground hover:bg-muted"
            >
              FAQ
            </a>
            <Link
              to="/ussd"
              onClick={() => setMobileNavOpen(false)}
              className="block rounded-[10px] px-3 py-2 font-medium text-foreground hover:bg-muted"
            >
              USSD Simulator
            </Link>
            <Link
              to="/docs"
              onClick={() => setMobileNavOpen(false)}
              className="block rounded-[10px] px-3 py-2 font-medium text-foreground hover:bg-muted"
            >
              Docs
            </Link>
            <div className="pt-2">
              <Link
                to="/sign-in"
                onClick={() => setMobileNavOpen(false)}
                className="block rounded-full bg-primary px-4 py-2.5 text-center text-xs font-semibold text-primary-foreground"
              >
                Get started
              </Link>
            </div>
          </div>
        )}
      </div>

      <section
        className="relative overflow-hidden pt-20 sm:pt-24 pb-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(0, 49, 112, 0.15) 0%, rgba(0, 49, 112, 0.08) 70%, rgba(0, 49, 112, 0.04) 100%)',
        }}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <path
            d="M0,400 Q720,560 1440,400 L1440,900 L0,900 Z"
            fill="rgba(0, 49, 112, 0.06)"
          />
          <path
            d="M0,510 Q720,670 1440,510 L1440,900 L0,900 Z"
            fill="rgba(0, 49, 112, 0.08)"
          />
          <path
            d="M0,620 Q720,780 1440,620 L1440,900 L0,900 Z"
            fill="rgba(0, 49, 112, 0.10)"
          />
        </svg>

        <div className="relative z-20 mx-auto max-w-4xl px-4 pt-6 sm:pt-8 text-center space-y-3.5">
          <div
            className="hero-enter inline-flex items-center gap-2 rounded-full border border-white/75 bg-white/65 px-3.5 py-1.5 backdrop-blur-xs shadow-2xs"
            style={{ animationDelay: '40ms' }}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 16"
              className="h-3.5 w-5 rounded-[2px] shadow-2xs shrink-0"
            >
              <rect width="8" height="16" x="0" y="0" fill="#008751" />
              <rect width="8" height="16" x="8" y="0" fill="#FFFFFF" />
              <rect width="8" height="16" x="16" y="0" fill="#008751" />
            </svg>
            <span className="text-xs sm:text-sm font-medium text-foreground/85">
              Built for Africans, but Nigeria first
            </span>
          </div>

          <h1
            className="hero-enter mx-auto max-w-2xl text-4xl sm:text-6xl font-semibold tracking-tight text-foreground leading-[1.06]"
            style={{ animationDelay: '130ms' }}
          >
            Real work, counted.
            <br />
            Real income, proven.
          </h1>

          <p
            className="hero-enter mx-auto max-w-lg text-sm sm:text-lg text-muted-foreground leading-relaxed"
            style={{ animationDelay: '220ms' }}
          >
            Employers lock job pay through Paga before work begins. Bricklayers, electricians, and
            tilers mark each day done on Telegram or USSD in one tap.
          </p>

          <div
            className="hero-enter flex flex-wrap items-center justify-center gap-3 pt-1"
            style={{ animationDelay: '310ms' }}
          >
            <Link to="/ussd">
              <Button className="rounded-full">
                <span>Try USSD</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
            <a href="https://t.me/Provvobot" target="_blank" rel="noreferrer">
              <Button variant="secondary" className="rounded-full bg-white/80 backdrop-blur-xs">
                <span>Open Telegram Bot</span>
              </Button>
            </a>
          </div>
        </div>

        <div
          className="hero-mockup-enter relative z-20 mx-auto mt-3 sm:mt-4 flex max-w-5xl items-end justify-center px-2 pt-2 -mb-14 sm:-mb-24"
          style={{ animationDelay: '380ms' }}
        >
          <Link
            to="/ussd"
            aria-label="Open USSD Simulator"
            className="group relative z-10 -mr-3 sm:-mr-8 origin-bottom-right -rotate-[7deg] sm:-rotate-[11deg] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:z-30 hover:-translate-y-3"
          >
            <div className="relative w-[148px] sm:w-[268px] drop-shadow-[0_28px_55px_rgba(11,22,40,0.38)] select-none">
              <img
                src="/feature-phone.png"
                alt="Feature phone running Provo USSD"
                className="block w-full h-auto"
              />

              <div className="absolute top-[9.5%] left-[13.5%] right-[13.5%] h-[42.5%] flex flex-col justify-between rounded-[4px] bg-[#0e1518] p-1.5 sm:p-3 text-left font-sans text-white overflow-hidden border border-white/10">
                <div className="flex items-center justify-between pb-0.5 text-[7px] sm:text-[10px] font-mono text-white">
                  <span className="inline-flex items-end gap-[1px] sm:gap-[1.5px]">
                    <span className="h-[3px] sm:h-[4px] w-[1.5px] sm:w-[2px] bg-white inline-block" />
                    <span className="h-[5px] sm:h-[6px] w-[1.5px] sm:w-[2px] bg-white inline-block" />
                    <span className="h-[7px] sm:h-[8px] w-[1.5px] sm:w-[2px] bg-white inline-block" />
                    <span className="h-[9px] sm:h-[10px] w-[1.5px] sm:w-[2px] bg-white inline-block" />
                    <span className="ml-0.5 sm:ml-1 text-[6.5px] sm:text-[9px] leading-none">2G</span>
                  </span>
                  <span className="leading-none">17:41</span>
                  <span className="inline-flex items-center gap-0.5">
                    <span className="h-1.5 w-3 sm:h-2 sm:w-3.5 rounded-[1px] border border-white bg-white inline-block" />
                    <span className="h-1 w-0.5 bg-white inline-block" />
                  </span>
                </div>

                <div className="relative flex-1 pr-2 flex flex-col justify-center">
                  <div className="space-y-0.5 sm:space-y-1 text-[8px] sm:text-[13px] leading-[1.3] sm:leading-[1.35] font-medium tracking-tight text-white">
                    <p className="font-semibold">Welcome to PROVO</p>
                    <p>1. Balance</p>
                    <p>2. Pending Jobs</p>
                    <p>3. Withdraw</p>
                  </div>
                  <div className="absolute right-0 top-0.5 bottom-0.5 w-[2.5px] sm:w-[3px] bg-white/20 rounded-full">
                    <div className="h-3/5 w-full bg-white rounded-full" />
                  </div>
                </div>

                <div className="mt-1 -mx-1.5 sm:-mx-3 -mb-1.5 sm:-mb-3 border-t border-white/15 bg-white/10 px-2 sm:px-2.5 py-0.5 sm:py-1 flex items-center justify-between text-[7.5px] sm:text-[11px] text-white">
                  <span className="w-4 sm:w-6" />
                  <span className="font-bold">Select</span>
                  <span>Back</span>
                </div>
              </div>
            </div>
          </Link>

          <Link
            to="/sign-in?role=worker"
            aria-label="Open Worker Sign In"
            className="group relative z-20 -ml-3 sm:-ml-8 origin-bottom-left -translate-y-3 sm:-translate-y-8 rotate-[6deg] sm:rotate-[10deg] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:z-30 hover:-translate-y-5 sm:hover:-translate-y-11"
          >
            <div className="relative w-[178px] sm:w-[328px] rounded-[34px] sm:rounded-[50px] bg-gradient-to-b from-[#434d5e] via-[#252d3a] to-[#141922] p-[2.5px] sm:p-[3px] shadow-[0_34px_75px_rgba(11,22,40,0.45)] select-none">
              <span
                aria-hidden="true"
                className="hidden sm:block absolute -left-[5px] top-24 h-6 w-[3px] rounded-l-sm bg-[#3a4352]"
              />
              <span
                aria-hidden="true"
                className="hidden sm:block absolute -left-[5px] top-36 h-11 w-[3px] rounded-l-sm bg-[#3a4352]"
              />
              <span
                aria-hidden="true"
                className="hidden sm:block absolute -left-[5px] top-50 h-11 w-[3px] rounded-l-sm bg-[#3a4352]"
              />
              <span
                aria-hidden="true"
                className="hidden sm:block absolute -right-[5px] top-40 h-14 w-[3px] rounded-r-sm bg-[#3a4352]"
              />

              <div className="rounded-[31px] sm:rounded-[47px] bg-[#080b10] p-[5px] sm:p-[9px]">
                <div className="aspect-[9/19.5] flex flex-col justify-between overflow-hidden rounded-[26px] sm:rounded-[38px] bg-[#131c24] text-white">
                  <div>
                    <div className="grid grid-cols-3 items-center px-3 sm:px-5 pt-2 sm:pt-2.5 pb-1 text-[8px] sm:text-[12px] font-semibold text-white">
                      <span className="tracking-tight">9:41</span>
                      <div className="mx-auto flex h-[14px] sm:h-[22px] w-[50px] sm:w-[86px] items-center justify-end rounded-full bg-black px-1.5 sm:px-2">
                        <span className="h-1.5 w-1.5 sm:h-2.5 sm:w-2.5 rounded-full bg-[#131d36] ring-1 ring-white/15" />
                      </div>
                      <div className="flex items-center justify-end gap-1 sm:gap-1.5 text-white">
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 18 12"
                          className="h-2 sm:h-3 w-auto fill-current"
                        >
                          <rect x="1" y="8" width="2.5" height="4" rx="0.8" />
                          <rect x="5" y="6" width="2.5" height="6" rx="0.8" />
                          <rect x="9" y="3.5" width="2.5" height="8.5" rx="0.8" />
                          <rect x="13" y="1" width="2.5" height="11" rx="0.8" />
                        </svg>
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 16 12"
                          className="h-2 sm:h-3 w-auto fill-current"
                        >
                          <path d="M8 9.2a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8Zm-3.6-2a5.2 5.2 0 0 1 7.2 0l1.2-1.2a6.9 6.9 0 0 0-9.6 0l1.2 1.2Zm-2.8-2.8a9.2 9.2 0 0 1 12.8 0l1.2-1.2a10.9 10.9 0 0 0-15.2 0l1.2 1.2Z" />
                        </svg>
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 25 12"
                          className="h-2 sm:h-3 w-auto"
                        >
                          <rect
                            x="0.75"
                            y="1"
                            width="20.5"
                            height="10"
                            rx="3"
                            stroke="currentColor"
                            strokeOpacity="0.45"
                            strokeWidth="1.2"
                            fill="none"
                          />
                          <rect
                            x="2.3"
                            y="2.5"
                            width="17.4"
                            height="7"
                            rx="1.6"
                            fill="currentColor"
                          />
                          <path
                            d="M22.5 4.2v3.6a1.6 1.6 0 0 0 0-3.6Z"
                            fill="currentColor"
                            fillOpacity="0.45"
                          />
                        </svg>
                      </div>
                    </div>

                    <div className="px-2 sm:px-2.5 pt-0.5 pb-1 flex items-center gap-1 sm:gap-1.5">
                      <span className="flex h-5 w-5 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-[#1f2c38] text-[9px] sm:text-xs text-white/85">
                        ←
                      </span>
                      <div className="flex flex-1 items-center gap-1.5 sm:gap-2 rounded-full bg-[#1f2c38] px-2 sm:px-2.5 py-0.5 sm:py-1">
                        <span className="flex h-4 w-4 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full bg-[#e58e49] text-[8px] sm:text-[11px] font-bold text-white">
                          P
                        </span>
                        <div className="min-w-0 leading-tight">
                          <p className="truncate text-[8.5px] sm:text-[11.5px] font-bold text-white">
                            Provo
                          </p>
                          <p className="text-[7px] sm:text-[9px] text-white/55">bot</p>
                        </div>
                      </div>
                      <span className="flex h-5 w-5 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-[#1f2c38] text-[9px] sm:text-xs text-white/85">
                        ⋮
                      </span>
                    </div>

                    <div className="hidden sm:block px-2.5 pb-1.5">
                      <div className="rounded-full bg-[#1f2c38]/85 py-1.5 text-center text-[10px] font-medium text-[#52a8ff]">
                        📷 Set Profile Photo
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center space-y-1.5 sm:space-y-2.5 px-2 sm:px-2.5 py-1 text-left text-[7.5px] sm:text-[10.5px] leading-snug">
                    <div className="mx-auto w-fit rounded-full bg-[#1f2c38]/90 px-2 py-0.5 text-[7px] sm:text-[9px] font-medium text-white/75">
                      November 17
                    </div>

                    <div className="ml-auto w-fit rounded-[10px] sm:rounded-[12px] rounded-br-[3px] bg-[#7b5ce6] px-2 sm:px-2.5 py-0.5 sm:py-1 text-white font-medium">
                      <span>/start</span>
                      <span className="ml-1 text-[6px] sm:text-[7px] text-white/75">12:18 ✓✓</span>
                    </div>

                    <div className="max-w-[94%] rounded-[11px] sm:rounded-[14px] rounded-bl-[3px] bg-[#1f2c38] p-1.5 sm:p-3 space-y-1 text-white/95">
                      <p className="font-semibold">Welcome to Provo! 🛡️</p>
                      <p className="text-white/80">
                        Provo locks employer pay upfront, releases funds daily as work is confirmed,
                        and creates verified records lenders can trust.
                      </p>
                      <p className="hidden sm:block text-white/80">
                        To get started, tap the button below to share and verify your phone number:
                      </p>
                      <p className="text-right text-[6.5px] sm:text-[7.5px] text-white/45">12:18</p>
                    </div>

                    <div className="ml-auto w-[90%] rounded-[11px] sm:rounded-[14px] rounded-br-[3px] bg-[#4c71f0] p-1.5 sm:p-2.5 space-y-1 text-white">
                      <div className="border-l-2 border-white/80 bg-black/15 px-1.5 py-0.5 rounded-[3px] text-[6.5px] sm:text-[8px]">
                        <p className="font-semibold">Provo</p>
                        <p className="truncate text-white/80">Welcome to Provo! 🛡️</p>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 pt-0.5">
                        <span className="flex h-5 w-5 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-[#e76f89] text-[7.5px] sm:text-[10px] font-bold text-white">
                          EE
                        </span>
                        <div className="min-w-0 leading-tight">
                          <p className="truncate font-semibold text-[8px] sm:text-[11px]">
                            Emem Ekpo
                          </p>
                          <p className="text-[6.5px] sm:text-[9px] text-white/85">
                            +234 803 441 9210
                          </p>
                        </div>
                      </div>
                      <div className="border-t border-white/20 pt-0.5 sm:pt-1 text-center text-[6.5px] sm:text-[9px] font-semibold tracking-wider uppercase text-white/95">
                        MESSAGE
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#18222c] p-1.5 sm:p-2.5 space-y-1 sm:space-y-1.5 border-t border-white/10">
                    <div className="flex items-center justify-between rounded-full bg-[#212e3a] px-2.5 sm:px-3 py-0.5 sm:py-1.5 text-[7.5px] sm:text-[10px] text-white/50">
                      <span>Message</span>
                      <span className="h-3 w-3 sm:h-5 sm:w-5 rounded-full bg-[#2ea6ff] inline-block" />
                    </div>
                    <div className="grid grid-cols-2 gap-1 sm:gap-1.5 text-center text-[7px] sm:text-[10px] font-semibold text-white/90">
                      <span className="rounded-[6px] sm:rounded-[8px] bg-[#24323f] py-1 sm:py-2">
                        💼 My Active Jobs
                      </span>
                      <span className="rounded-[6px] sm:rounded-[8px] bg-[#24323f] py-1 sm:py-2">
                        ✅ Done Today
                      </span>
                      <span className="rounded-[6px] sm:rounded-[8px] bg-[#24323f] py-1 sm:py-2">
                        📊 My Credit Record
                      </span>
                      <span className="rounded-[6px] sm:rounded-[8px] bg-[#24323f] py-1 sm:py-2">
                        ℹ️ Help
                      </span>
                    </div>
                    <div className="mx-auto mt-0.5 h-1 w-16 sm:w-24 rounded-full bg-white/35" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <svg
          aria-hidden="true"
          viewBox="0 0 1440 110"
          preserveAspectRatio="none"
          className="pointer-events-none relative z-30 block h-14 sm:h-24 w-full"
        >
          <path
            d="M0,34 C260,108 500,-10 740,48 C980,106 1210,12 1440,52 L1440,110 L0,110 Z"
            fill="var(--pw-bg)"
          />
          <path
            d="M0,34 C260,108 500,-10 740,48 C980,106 1210,12 1440,52"
            fill="none"
            stroke="rgba(0, 49, 112, 0.16)"
            strokeWidth="2"
          />
        </svg>
      </section>

      <main className="mx-auto max-w-7xl px-6 lg:px-10 pt-14 pb-12 sm:pb-20 space-y-14 sm:space-y-24">

        <RevealSection className="mx-auto max-w-3xl text-center space-y-7 py-4">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-foreground">
              Built on Paga &times; Litehost
            </h2>
            <p className="mx-auto max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed">
              Every naira locks and settles on PagaEngine payment rails. Every webhook, ledger
              state transition, and Telegram bot session runs on Litehost infrastructure.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-10 pt-1">
            <div className="flex items-center gap-3 rounded-full border border-border bg-card px-5 py-2.5 shadow-[var(--pw-shadow-card)]">
              <img
                src="https://qa2-checkout.paga.com/favicon.ico"
                alt="Paga logo"
                className="h-7 w-7 sm:h-8 sm:w-8 object-contain"
              />
              <div className="text-left leading-tight">
                <p className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                  Paga
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Payment Rails
                </p>
              </div>
            </div>

            <span className="font-mono text-lg text-muted-foreground/60 select-none">&times;</span>

            <div className="flex items-center gap-3 rounded-full border border-border bg-card px-5 py-2.5 shadow-[var(--pw-shadow-card)]">
              <img
                src="/litehost.svg"
                alt="Litehost logo"
                className="h-7 sm:h-8 w-auto rounded-[6px]"
              />
              <div className="text-left leading-tight">
                <p className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                  Litehost
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Cloud Infrastructure
                </p>
              </div>
            </div>
          </div>
        </RevealSection>

        <ScrollRevealText />

        <WhoItsForSection />

        <section className="rounded-[var(--pw-radius-md)] border border-border bg-card shadow-[var(--pw-shadow-card)] grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border">
          <div className="p-5 space-y-1">
            <p className="text-2xl sm:text-3xl font-semibold tabular-nums text-foreground">41M</p>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Informal workers in Nigeria
            </p>
          </div>
          <div className="p-5 space-y-1">
            <p className="text-2xl sm:text-3xl font-semibold tabular-nums text-foreground">83%</p>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Jobs across Africa (ILO 2024)
            </p>
          </div>
          <div className="p-5 space-y-1">
            <p className="text-2xl sm:text-3xl font-semibold tabular-nums text-foreground">70.7%</p>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Borrow from friends &amp; family
            </p>
          </div>
          <div className="p-5 space-y-1">
            <p className="text-2xl sm:text-3xl font-semibold tabular-nums text-primary">&lt;15s</p>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              1-tap employer confirmation
            </p>
          </div>
        </section>

        <RevealSection className="space-y-6">
          <div id="how-it-works" className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
                How it works
              </h2>
              <p className="text-sm text-muted-foreground">
                Four steps to a bank-ready record. Workers never self-certify their income. Every
                day is backed by locked employer pay and direct confirmation.
              </p>
            </div>
            <Link to="/sign-in?role=employer">
              <Button size="sm" variant="secondary">
                Try employer flow →
              </Button>
            </Link>
          </div>
          <div
            ref={stepsRef}
            className="rounded-[var(--pw-radius-md)] border border-border bg-card shadow-[var(--pw-shadow-card)] overflow-hidden grid md:grid-cols-2"
          >
            {FOUR_STEPS.map((s, idx) => {
              const stepStart = idx * 0.22
              const stepFill = Math.max(0, Math.min(1, (stepsProgress - stepStart) / 0.28))
              const isReached = stepFill > 0.15
              return (
                <div
                  key={s.num}
                  style={{
                    opacity: 0.35 + stepFill * 0.65,
                    transform: `translateY(${(1 - stepFill) * 18}px)`,
                  }}
                  className={`p-6 sm:p-8 space-y-3 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                    idx < 2 ? 'border-b border-border' : ''
                  } ${idx % 2 === 0 ? 'md:border-r border-border' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-mono text-[11px] font-semibold transition-colors duration-300 ${
                        isReached
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {s.num}
                    </span>
                    <div className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full bg-primary transition-[width] duration-300 ease-out"
                        style={{ width: `${Math.round(stepFill * 100)}%` }}
                      />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              )
            })}
          </div>
        </RevealSection>

        <RevealSection className="relative overflow-hidden rounded-[28px] bg-primary text-primary-foreground px-6 sm:px-12 py-12 sm:py-16 space-y-10">
          <div className="relative z-10 grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7 space-y-2">
              <p className="font-mono text-xs uppercase tracking-wider text-primary-foreground/65">
                PagaEngine Infrastructure
              </p>
              <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight">
                Remove Paga, the product disappears.
              </h2>
            </div>
            <p className="lg:col-span-5 text-sm text-primary-foreground/80 leading-relaxed">
              Provo cannot exist without Paga-confirmed transactions. Three PagaEngine surfaces do
              core structural work, not decorative payments.
            </p>
          </div>

          <div className="relative z-10 grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/15 border-y border-white/15">
            <div className="py-6 md:py-8 md:pr-8 space-y-2">
              <span className="font-mono text-[11px] text-primary-foreground/60">01 · Lock</span>
              <p className="text-base font-semibold">One-time Job NUBANs</p>
              <p className="text-xs sm:text-sm text-primary-foreground/75 leading-relaxed">
                Generated per job so the employer locks the full amount upfront via bank transfer or
                payment link before day 1 begins.
              </p>
            </div>
            <div className="py-6 md:py-8 md:px-8 space-y-2">
              <span className="font-mono text-[11px] text-primary-foreground/60">02 · Settle</span>
              <p className="text-base font-semibold">Per-Day Disbursements</p>
              <p className="text-xs sm:text-sm text-primary-foreground/75 leading-relaxed">
                Each confirmed day (or 24-hour auto-release) triggers an idempotent Paga transfer to
                the worker’s Paga account.
              </p>
            </div>
            <div className="py-6 md:py-8 md:pl-8 space-y-2">
              <span className="font-mono text-[11px] text-primary-foreground/60">03 · Verify</span>
              <p className="text-base font-semibold">x-paga-hash-v3 + /status</p>
              <p className="text-xs sm:text-sm text-primary-foreground/75 leading-relaxed">
                SHA-512 webhook verification, idempotency keys, and /status reconciliation on every
                funding lock and payout.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-mono uppercase tracking-wider text-primary-foreground/65">
                Lifecycle of a job day
              </span>
              <span className="font-mono text-primary-foreground/65">
                funds-locked · idempotent · reconciled
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-4 pt-2">
              {[
                { time: 'Day 0', label: 'Employer funds Paga NUBAN' },
                { time: 'Close of day', label: 'Worker marks Day Done' },
                { time: '≤24h window', label: 'Employer/Supervisor confirms' },
                { time: 'Instant', label: 'Paga payout + Work record updated' },
              ].map((node, i) => (
                <div key={node.time} className="relative pl-4 border-l-2 border-white/25 space-y-1">
                  <span className="font-mono text-[11px] text-primary-foreground/65">
                    0{i + 1} · {node.time}
                  </span>
                  <p className="text-sm font-semibold">{node.label}</p>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>

        <RevealSection className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5 space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              FAQs
            </p>
            <h2 id="faq" className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
              Questions, answered plainly.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              How Provo locks job pay, confirms daily work, and builds a verified record across
              Telegram, Web, and USSD.
            </p>
          </div>

          <div className="lg:col-span-7 flex flex-col">
            {FAQS.map((item, idx) => {
              const isOpen = openFaq === idx
              const prevCollapsed = idx > 0 && openFaq !== idx - 1
              const nextCollapsed = idx < FAQS.length - 1 && openFaq !== idx + 1

              const containerClasses = isOpen
                ? 'my-3 first:mt-0 last:mb-0 rounded-[20px] border border-border bg-card px-6 py-5 shadow-[var(--pw-shadow-card)]'
                : [
                    'border-x border-border bg-card px-6 py-4',
                    !prevCollapsed ? 'rounded-t-[20px] border-t' : 'border-t border-border',
                    !nextCollapsed ? 'rounded-b-[20px] border-b' : '',
                  ].join(' ')

              return (
                <div key={item.q} className={containerClasses}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    className="flex w-full items-center justify-between gap-4 text-left text-sm sm:text-base font-medium text-foreground cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <AngleDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <p className="pt-3 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                  )}
                </div>
              )
            })}
          </div>
        </RevealSection>
      </main>

      <section
        className="relative w-full overflow-hidden pt-16 sm:pt-20 pb-0 text-center"
        style={{
          background:
            'linear-gradient(180deg, rgba(0, 49, 112, 0.14) 0%, rgba(0, 49, 112, 0.08) 72%, rgba(0, 49, 112, 0.04) 100%)',
        }}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 520"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <path
            d="M0,140 Q720,260 1440,140 L1440,520 L0,520 Z"
            fill="rgba(0, 49, 112, 0.06)"
          />
          <path
            d="M0,240 Q720,360 1440,240 L1440,520 L0,520 Z"
            fill="rgba(0, 49, 112, 0.09)"
          />
        </svg>

        <div className="relative z-10 mx-auto max-w-4xl px-6 space-y-5 pb-10 sm:pb-14">
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Make every workday count.
          </h2>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            Walk through Emem Ekpo’s 4-month bricklaying record across worker, employer, and
            lender surfaces.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Link to="/sign-in?role=worker">
              <Button size="md" className="rounded-full">
                Open worker demo
              </Button>
            </Link>
            <Link to="/sign-in?role=employer">
              <Button variant="secondary" size="md" className="rounded-full bg-white/80">
                Employer flow
              </Button>
            </Link>
            <Link
              to={
                import.meta.env.VITE_USE_MOCK === 'true'
                  ? '/report/rep_emem_lapo_2026'
                  : '/report/EMEM-CREDIT-EVAL-2026'
              }
            >
              <Button variant="secondary" size="md" className="rounded-full bg-white/80">
                Lender report
              </Button>
            </Link>
          </div>
        </div>

        <svg
          aria-hidden="true"
          viewBox="0 0 1440 110"
          preserveAspectRatio="none"
          className="pointer-events-none relative z-20 block h-14 sm:h-24 w-full"
        >
          <path
            d="M0,34 C260,108 500,-10 740,48 C980,106 1210,12 1440,52 L1440,110 L0,110 Z"
            fill="var(--foreground)"
          />
        </svg>
      </section>

      <footer className="bg-foreground text-background">
        <div className="mx-auto max-w-5xl px-4 pt-10 pb-6 space-y-12">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4 space-y-4">
              <Link to="/" className="flex items-center gap-2 font-semibold text-background">
                <ProvoMark className="h-5 w-5" />
                <span>Provo</span>
              </Link>
              <p className="text-xs text-background/70 max-w-xs">
                Payer-confirmed income records for informal workers, powered by PagaEngine.
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
                    <Link to="/sign-in?role=worker" className="hover:text-background">
                      Worker app
                    </Link>
                  </li>
                  <li>
                    <Link to="/sign-in?role=employer" className="hover:text-background">
                      Employer flow
                    </Link>
                  </li>
                  <li>
                    <Link to="/ussd" className="hover:text-background">
                      USSD Simulator
                    </Link>
                  </li>
                  <li>
                    <a
                      href="https://t.me/Provvobot"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-background"
                    >
                      Telegram Bot (@Provvobot)
                    </a>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <p className="font-medium uppercase tracking-wider text-background/50">Lenders</p>
                <ul className="space-y-2 text-background/80">
                  <li>
                    <Link
                      to={
                        import.meta.env.VITE_USE_MOCK === 'true'
                          ? '/report/rep_emem_lapo_2026'
                          : '/report/EMEM-CREDIT-EVAL-2026'
                      }
                      className="hover:text-background"
                    >
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
                    <a href="#how-it-works" className="hover:text-background">
                      How it works
                    </a>
                  </li>
                  <li>
                    <a href="#who-its-for" className="hover:text-background">
                      Who it’s for
                    </a>
                  </li>
                  <li>
                    <a href="#grades" className="hover:text-background">
                      Evidence grades
                    </a>
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
                  <li>
                    <Link to="/ndpa" className="hover:text-background">
                      NDPA consent
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full overflow-hidden select-none pt-2">
          <p
            aria-label="provo"
            className="flex justify-center text-[34vw] sm:text-[31vw] font-bold tracking-[-0.06em] leading-[0.76]"
          >
            {'provo'.split('').map((char, idx) => (
              <span
                key={`${char}-${idx}`}
                className="inline-block text-background/20 transition-[transform,color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-4 hover:text-background/95 cursor-default"
              >
                {char}
              </span>
            ))}
          </p>
        </div>

        <div className="mx-auto max-w-5xl px-4 pb-10 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-background/15 pt-6 text-xs text-background/60">
            <p>© 2026 Provo. Built for TechIgnite 2026.</p>
            <p>Powered by PagaEngine Subsidiary Accounts &amp; Collect API</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
