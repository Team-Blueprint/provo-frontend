import { useState } from 'react'

interface ArchNode {
  id: string
  title: string
  subtitle: string
  layer: 'Channels' | 'API & Auth' | 'Core Engine' | 'Storage & Rails'
  detail: string
  x: number
  y: number
  accent?: 'primary' | 'brick' | 'success' | 'info'
}

const ARCH_NODES: ArchNode[] = [
  {
    id: 'web',
    title: 'Web App',
    subtitle: 'Worker, Employer, Supervisor',
    layer: 'Channels',
    detail: 'React web workspaces for creating jobs, paying into one-time accounts, confirming daily work, and viewing lender reports.',
    x: 24,
    y: 28,
    accent: 'primary',
  },
  {
    id: 'telegram',
    title: 'Telegram Bot',
    subtitle: 'Daily check-ins & alerts',
    layer: 'Channels',
    detail: 'Workers mark days done, employers confirm with one tap, and supervisors sign off without installing a new app.',
    x: 256,
    y: 28,
    accent: 'info',
  },
  {
    id: 'ussd',
    title: 'USSD (*123#)',
    subtitle: 'Basic phone menu',
    layer: 'Channels',
    detail: 'Works on feature phones without mobile data so workers can check balances, mark days done, and withdraw pay.',
    x: 488,
    y: 28,
    accent: 'brick',
  },
  {
    id: 'api',
    title: 'FastAPI Server',
    subtitle: 'Auth, Jobs, Reports, USSD',
    layer: 'API & Auth',
    detail: 'Handles phone + 6-digit PIN login, Telegram PIN setup, job creation, daily confirmations, and token-gated lender reports.',
    x: 92,
    y: 148,
    accent: 'primary',
  },
  {
    id: 'webhooks',
    title: 'Webhook Gate',
    subtitle: 'Paga & Telegram callbacks',
    layer: 'API & Auth',
    detail: 'Checks security signatures on incoming payment alerts and ignores duplicate retries so a payment is never counted twice.',
    x: 412,
    y: 148,
    accent: 'info',
  },
  {
    id: 'rules',
    title: 'Job & Day Rules',
    subtitle: 'State machine + kobo math',
    layer: 'Core Engine',
    detail: 'Enforces allowed status changes (funded, done, confirmed, disputed, paid) and splits total pay into exact kobo per day.',
    x: 24,
    y: 274,
    accent: 'primary',
  },
  {
    id: 'ledger',
    title: 'Ledger & Payouts',
    subtitle: '24h timer + payout queue',
    layer: 'Core Engine',
    detail: 'Records every kobo funded or released, runs the 24-hour auto-release timer, and retries payouts safely until settled.',
    x: 256,
    y: 274,
    accent: 'success',
  },
  {
    id: 'fraud',
    title: 'Fraud & Report Signals',
    subtitle: 'Work summary + safety flags',
    layer: 'Core Engine',
    detail: 'Compiles confirmed days, active months, and repeat employers, and flags shared phones or circular money flows.',
    x: 488,
    y: 274,
    accent: 'brick',
  },
  {
    id: 'db',
    title: 'Database',
    subtitle: 'Jobs, ledger, audit log',
    layer: 'Storage & Rails',
    detail: 'Stores users, jobs, daily decisions, consents, and append-only audit events in PostgreSQL or SQLite.',
    x: 92,
    y: 396,
    accent: 'primary',
  },
  {
    id: 'paga',
    title: 'PagaEngine Rails',
    subtitle: '10-digit accounts & payouts',
    layer: 'Storage & Rails',
    detail: 'Issues one-time 10-digit bank account numbers for job funding and sends daily payouts to the worker Paga account.',
    x: 412,
    y: 396,
    accent: 'success',
  },
]

const CONNECTIONS: [string, string][] = [
  ['web', 'api'],
  ['telegram', 'webhooks'],
  ['ussd', 'api'],
  ['api', 'rules'],
  ['api', 'ledger'],
  ['webhooks', 'ledger'],
  ['rules', 'db'],
  ['ledger', 'db'],
  ['ledger', 'paga'],
  ['fraud', 'db'],
]

function getCenter(node: ArchNode) {
  return { cx: node.x + 96, cy: node.y + 34 }
}

function accentColor(accent?: ArchNode['accent']) {
  switch (accent) {
    case 'brick':
      return 'var(--pw-brick)'
    case 'success':
      return 'var(--pw-success)'
    case 'info':
      return 'var(--pw-info)'
    default:
      return 'var(--pw-primary)'
  }
}

export function ArchitectureDiagram() {
  const [selectedId, setSelectedId] = useState<string>('ledger')
  const selected = ARCH_NODES.find((n) => n.id === selectedId) ?? ARCH_NODES[0]

  return (
    <div className="my-6 overflow-hidden rounded-[var(--pw-radius-md)] border border-[var(--pw-rule)] bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--pw-rule)] bg-[var(--pw-bg)] px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--pw-primary)]">
            Interactive System Map
          </p>
          <p className="text-xs text-muted-foreground">
            Click any box to see what it does and how data moves through Provo.
          </p>
        </div>
        <a
          href="/architecture-diagram.html"
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-[var(--pw-rule)] bg-card px-3 py-1 text-xs font-medium text-foreground hover:border-[var(--pw-primary)]/50"
        >
          Open full diagram
        </a>
      </div>

      <div className="overflow-x-auto p-4">
        <svg
          viewBox="0 0 704 492"
          className="w-full min-w-[620px] select-none"
          role="img"
          aria-label="Provo system architecture diagram"
        >
          <defs>
            <marker
              id="arch-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#94A3B8" />
            </marker>
          </defs>

          {CONNECTIONS.map(([fromId, toId]) => {
            const fromNode = ARCH_NODES.find((n) => n.id === fromId)
            const toNode = ARCH_NODES.find((n) => n.id === toId)
            if (!fromNode || !toNode) return null
            const a = getCenter(fromNode)
            const b = getCenter(toNode)
            const active = selectedId === fromId || selectedId === toId
            return (
              <line
                key={`${fromId}-${toId}`}
                x1={a.cx}
                y1={a.cy + 34}
                x2={b.cx}
                y2={b.cy - 34}
                stroke={active ? 'var(--pw-primary)' : '#CBD5E1'}
                strokeWidth={active ? 2 : 1.5}
                strokeDasharray={active ? undefined : '4 3'}
                markerEnd="url(#arch-arrow)"
              />
            )
          })}

          {ARCH_NODES.map((node) => {
            const isSelected = node.id === selectedId
            const stroke = isSelected ? accentColor(node.accent) : '#CBD5E1'
            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => setSelectedId(node.id)}
                className="cursor-pointer"
              >
                <rect
                  width={192}
                  height={68}
                  rx={10}
                  fill={isSelected ? '#F0F6FA' : '#FFFFFF'}
                  stroke={stroke}
                  strokeWidth={isSelected ? 2 : 1}
                />
                <rect
                  x={0}
                  y={0}
                  width={6}
                  height={68}
                  rx={3}
                  fill={accentColor(node.accent)}
                />
                <text
                  x={18}
                  y={28}
                  fontSize="13"
                  fontWeight="600"
                  fill="#0F172A"
                  fontFamily="Instrument Sans Variable, Inter, sans-serif"
                >
                  {node.title}
                </text>
                <text
                  x={18}
                  y={48}
                  fontSize="11"
                  fill="#64748B"
                  fontFamily="Instrument Sans Variable, Inter, sans-serif"
                >
                  {node.subtitle}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="border-t border-[var(--pw-rule)] bg-[var(--pw-primary-tint)]/45 px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: accentColor(selected.accent) }}
          />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {selected.layer}
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-sm font-semibold text-foreground">{selected.title}</span>
        </div>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{selected.detail}</p>
      </div>
    </div>
  )
}
