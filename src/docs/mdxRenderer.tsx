import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  AngleDown,
  ArrowRight,
  Book,
  Briefcase,
  Check,
  CheckCircle,
  Code,
  Copy,
  FileText,
  InfoCircle,
  Lock,
  ShieldCheck,
  User,
  UserTick,
  Warning,
} from 'reicon-react'
import { slugifyHeading } from '@/docs/docsLoader'

function renderIcon(name?: string) {
  const cls = 'h-4 w-4 text-[var(--pw-primary)] shrink-0'
  switch (name) {
    case 'hammer':
    case 'wrench':
    case 'scissors':
    case 'briefcase':
      return <Briefcase className={cls} aria-hidden="true" />
    case 'shield-check':
      return <ShieldCheck className={cls} aria-hidden="true" />
    case 'lock':
      return <Lock className={cls} aria-hidden="true" />
    case 'code':
      return <Code className={cls} aria-hidden="true" />
    case 'user':
      return <User className={cls} aria-hidden="true" />
    case 'user-check':
      return <UserTick className={cls} aria-hidden="true" />
    case 'file-check':
      return <FileText className={cls} aria-hidden="true" />
    case 'credit-card':
    case 'chart-bar':
    case 'route':
    case 'bolt':
    case 'link':
      return <Book className={cls} aria-hidden="true" />
    default:
      return <Book className={cls} aria-hidden="true" />
  }
}

function parseAttrs(attrString: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  const regex = /(\w+)=["']([^"']*)["']|(\w+)=\{(\d+)\}|(\brequired\b)/g
  let m: RegExpExecArray | null
  while ((m = regex.exec(attrString)) !== null) {
    if (m[1]) attrs[m[1]] = m[2]
    else if (m[3]) attrs[m[3]] = m[4]
    else if (m[5]) attrs[m[5]] = 'true'
  }
  return attrs
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }
    const token = match[0]
    if (token.startsWith('**') && token.endsWith('**')) {
      nodes.push(
        <strong key={key++} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>,
      )
    } else if (token.startsWith('*') && token.endsWith('*')) {
      nodes.push(
        <em key={key++} className="italic">
          {token.slice(1, -1)}
        </em>,
      )
    } else if (token.startsWith('`') && token.endsWith('`')) {
      nodes.push(
        <code
          key={key++}
          className="rounded-[5px] border border-[var(--pw-rule)] bg-[var(--pw-primary-tint)]/70 px-1.5 py-0.5 font-mono text-[13px] text-[var(--pw-primary)]"
        >
          {token.slice(1, -1)}
        </code>,
      )
    } else if (token.startsWith('[')) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (linkMatch) {
        const [, label, href] = linkMatch
        if (href.startsWith('http')) {
          nodes.push(
            <a
              key={key++}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--pw-primary)] underline decoration-[var(--pw-primary)]/40 underline-offset-4 hover:decoration-[var(--pw-primary)]"
            >
              {label}
            </a>,
          )
        } else {
          nodes.push(
            <Link
              key={key++}
              to={href}
              className="font-medium text-[var(--pw-primary)] underline decoration-[var(--pw-primary)]/40 underline-offset-4 hover:decoration-[var(--pw-primary)]"
            >
              {label}
            </Link>,
          )
        }
      }
    }
    lastIndex = tokenRegex.lastIndex
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }
  return nodes
}

function CodeBlock({ code, lang, title }: { code: string; lang: string; title?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="my-4 overflow-hidden rounded-[var(--pw-radius-md)] border border-[var(--pw-rule)] bg-[#0F172A] text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-2 text-xs text-slate-400">
        <span className="font-mono uppercase tracking-wider">{title || lang || 'text'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-6">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function CalloutBlock({
  variant,
  children,
}: {
  variant: 'Note' | 'Tip' | 'Warning' | 'Info'
  children: ReactNode
}) {
  const styles = {
    Note: {
      wrap: 'border-[var(--pw-primary)]/25 bg-[var(--pw-primary-tint)]/60 text-foreground',
      icon: <InfoCircle className="h-4 w-4 text-[var(--pw-primary)] mt-0.5 shrink-0" aria-hidden="true" />,
      label: 'Note',
    },
    Info: {
      wrap: 'border-[var(--pw-info)]/25 bg-[var(--pw-info-tint)]/70 text-foreground',
      icon: <InfoCircle className="h-4 w-4 text-[var(--pw-info)] mt-0.5 shrink-0" aria-hidden="true" />,
      label: 'Info',
    },
    Tip: {
      wrap: 'border-[var(--pw-success)]/25 bg-[var(--pw-success-tint)]/70 text-foreground',
      icon: <CheckCircle className="h-4 w-4 text-[var(--pw-success)] mt-0.5 shrink-0" aria-hidden="true" />,
      label: 'Tip',
    },
    Warning: {
      wrap: 'border-[var(--pw-warning)]/30 bg-[var(--pw-warning-tint)]/80 text-foreground',
      icon: <Warning className="h-4 w-4 text-[var(--pw-warning)] mt-0.5 shrink-0" aria-hidden="true" />,
      label: 'Warning',
    },
  }[variant]

  return (
    <div className={`my-5 flex gap-3 rounded-[var(--pw-radius-md)] border px-4 py-3.5 text-sm leading-6 ${styles.wrap}`}>
      {styles.icon}
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider opacity-80">{styles.label}</p>
        <div>{children}</div>
      </div>
    </div>
  )
}

function AccordionBlock({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="my-3 overflow-hidden rounded-[var(--pw-radius-md)] border border-[var(--pw-rule)] bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-[var(--pw-primary-tint)]/40 cursor-pointer"
      >
        <span>{title}</span>
        <AngleDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className="border-t border-[var(--pw-rule)] px-4 py-3 text-sm leading-6 text-muted-foreground">
          <MdxContent body={content} />
        </div>
      )}
    </div>
  )
}

function TabsBlock({ items }: { items: { title: string; content: string }[] }) {
  const [active, setActive] = useState(0)
  if (items.length === 0) return null
  return (
    <div className="my-5 overflow-hidden rounded-[var(--pw-radius-md)] border border-[var(--pw-rule)] bg-card">
      <div className="flex flex-wrap gap-1 border-b border-[var(--pw-rule)] bg-[var(--pw-bg)] px-3 pt-2">
        {items.map((item, idx) => (
          <button
            key={item.title}
            type="button"
            onClick={() => setActive(idx)}
            className={`border-b-2 px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
              active === idx
                ? 'border-[var(--pw-primary)] text-[var(--pw-primary)]'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {item.title}
          </button>
        ))}
      </div>
      <div className="p-4 text-sm leading-6">
        <MdxContent body={items[active].content} />
      </div>
    </div>
  )
}

function CodeGroupBlock({ blocks }: { blocks: { lang: string; title: string; code: string }[] }) {
  const [active, setActive] = useState(0)
  const [copied, setCopied] = useState(false)
  if (blocks.length === 0) return null
  const current = blocks[active]

  const handleCopy = () => {
    navigator.clipboard.writeText(current.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="my-5 overflow-hidden rounded-[var(--pw-radius-md)] border border-[var(--pw-rule)] bg-[#0F172A] text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-3">
        <div className="flex items-center gap-1">
          {blocks.map((b, idx) => (
            <button
              key={b.title + idx}
              type="button"
              onClick={() => setActive(idx)}
              className={`border-b-2 px-3 py-2 text-xs font-medium cursor-pointer ${
                active === idx
                  ? 'border-[var(--pw-brick)] text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {b.title || b.lang}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-6">
        <code>{current.code}</code>
      </pre>
    </div>
  )
}

function parseTagChildren(inner: string, tagName: string): { attrs: Record<string, string>; content: string }[] {
  const results: { attrs: Record<string, string>; content: string }[] = []
  const regex = new RegExp(`<${tagName}([^>]*)>([\\s\\S]*?)</${tagName}>`, 'g')
  let m: RegExpExecArray | null
  while ((m = regex.exec(inner)) !== null) {
    results.push({ attrs: parseAttrs(m[1]), content: m[2].trim() })
  }
  return results
}

function extractClosingBlock(lines: string[], startIdx: number, tagName: string): { inner: string; nextIdx: number } {
  const openLine = lines[startIdx]
  const afterOpen = openLine.slice(openLine.indexOf('>') + 1)
  if (afterOpen.includes(`</${tagName}>`)) {
    return {
      inner: afterOpen.slice(0, afterOpen.indexOf(`</${tagName}>`)).trim(),
      nextIdx: startIdx + 1,
    }
  }
  const collected: string[] = [afterOpen]
  let i = startIdx + 1
  while (i < lines.length) {
    if (lines[i].includes(`</${tagName}>`)) {
      const beforeClose = lines[i].slice(0, lines[i].indexOf(`</${tagName}>`))
      collected.push(beforeClose)
      return { inner: collected.join('\n').trim(), nextIdx: i + 1 }
    }
    collected.push(lines[i])
    i++
  }
  return { inner: collected.join('\n').trim(), nextIdx: i }
}

export function MdxContent({ body }: { body: string }) {
  const lines = body.split(/\r?\n/)
  const elements: ReactNode[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      i++
      continue
    }

    // Fenced code block
    if (trimmed.startsWith('```')) {
      const fenceHeader = trimmed.slice(3).trim()
      const [lang, ...titleParts] = fenceHeader.split(/\s+/)
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++
      elements.push(
        <CodeBlock
          key={key++}
          lang={lang || 'text'}
          title={titleParts.join(' ')}
          code={codeLines.join('\n')}
        />,
      )
      continue
    }

    // Mintlify Callouts
    const calloutMatch = trimmed.match(/^<(Note|Tip|Warning|Info)>$/)
    if (calloutMatch) {
      const variant = calloutMatch[1] as 'Note' | 'Tip' | 'Warning' | 'Info'
      const { inner, nextIdx } = extractClosingBlock(lines, i, variant)
      i = nextIdx
      elements.push(
        <CalloutBlock key={key++} variant={variant}>
          <MdxContent body={inner} />
        </CalloutBlock>,
      )
      continue
    }

    // Mintlify Columns
    if (trimmed.startsWith('<Columns')) {
      const attrs = parseAttrs(trimmed)
      const cols = attrs.cols === '3' ? 'md:grid-cols-3' : 'md:grid-cols-2'
      const { inner, nextIdx } = extractClosingBlock(lines, i, 'Columns')
      i = nextIdx
      const cards = parseTagChildren(inner, 'Card')
      elements.push(
        <div key={key++} className={`my-5 grid gap-4 grid-cols-1 ${cols}`}>
          {cards.map((c, idx) => {
            const innerCard = (
              <div className="flex h-full flex-col justify-between rounded-[var(--pw-radius-md)] border border-[var(--pw-rule)] bg-card p-5 transition-colors hover:border-[var(--pw-primary)]/50">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {renderIcon(c.attrs.icon)}
                    <h4 className="text-sm font-semibold text-foreground">{c.attrs.title}</h4>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{renderInline(c.content)}</p>
                </div>
                {c.attrs.href && (
                  <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--pw-primary)]">
                    <span>Read more</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </div>
                )}
              </div>
            )
            if (c.attrs.href) {
              return c.attrs.href.startsWith('http') ? (
                <a key={idx} href={c.attrs.href} target="_blank" rel="noreferrer" className="block">
                  {innerCard}
                </a>
              ) : (
                <Link key={idx} to={c.attrs.href} className="block">
                  {innerCard}
                </Link>
              )
            }
            return <div key={idx}>{innerCard}</div>
          })}
        </div>,
      )
      continue
    }

    // Mintlify Steps
    if (trimmed === '<Steps>') {
      const { inner, nextIdx } = extractClosingBlock(lines, i, 'Steps')
      i = nextIdx
      const steps = parseTagChildren(inner, 'Step')
      elements.push(
        <div key={key++} className="my-6 space-y-6 border-l-2 border-[var(--pw-rule)] pl-6">
          {steps.map((s, idx) => (
            <div key={idx} className="relative">
              <span className="absolute -left-[35px] top-0 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--pw-rule)] bg-card text-xs font-semibold text-[var(--pw-primary)]">
                {idx + 1}
              </span>
              <h4 className="text-base font-semibold text-foreground mb-2">{s.attrs.title}</h4>
              <div className="text-sm leading-6 text-muted-foreground">
                <MdxContent body={s.content} />
              </div>
            </div>
          ))}
        </div>,
      )
      continue
    }

    // Mintlify Tabs
    if (trimmed === '<Tabs>') {
      const { inner, nextIdx } = extractClosingBlock(lines, i, 'Tabs')
      i = nextIdx
      const tabItems = parseTagChildren(inner, 'Tab').map((t) => ({
        title: t.attrs.title || 'Tab',
        content: t.content,
      }))
      elements.push(<TabsBlock key={key++} items={tabItems} />)
      continue
    }

    // Mintlify Accordion
    if (trimmed.startsWith('<Accordion')) {
      const attrs = parseAttrs(trimmed)
      const { inner, nextIdx } = extractClosingBlock(lines, i, 'Accordion')
      i = nextIdx
      elements.push(<AccordionBlock key={key++} title={attrs.title || 'Details'} content={inner} />)
      continue
    }

    // Mintlify CodeGroup
    if (trimmed === '<CodeGroup>') {
      const { inner, nextIdx } = extractClosingBlock(lines, i, 'CodeGroup')
      i = nextIdx
      const codeBlocks: { lang: string; title: string; code: string }[] = []
      const fenceRegex = /```([^\n]*)\r?\n([\s\S]*?)```/g
      let fm: RegExpExecArray | null
      while ((fm = fenceRegex.exec(inner)) !== null) {
        const [lang, ...titleParts] = fm[1].trim().split(/\s+/)
        codeBlocks.push({ lang: lang || 'text', title: titleParts.join(' '), code: fm[2].trim() })
      }
      elements.push(<CodeGroupBlock key={key++} blocks={codeBlocks} />)
      continue
    }

    // Mintlify ParamField / ResponseField
    if (trimmed.startsWith('<ParamField') || trimmed.startsWith('<ResponseField')) {
      const tag = trimmed.startsWith('<ParamField') ? 'ParamField' : 'ResponseField'
      const attrs = parseAttrs(trimmed)
      const { inner, nextIdx } = extractClosingBlock(lines, i, tag)
      i = nextIdx
      const fieldName = attrs.body || attrs.name || attrs.query || attrs.path || 'field'
      elements.push(
        <div
          key={key++}
          className="my-3 rounded-[var(--pw-radius-sm)] border border-[var(--pw-rule)] bg-card px-4 py-3 text-sm"
        >
          <div className="flex flex-wrap items-center gap-2">
            <code className="font-mono text-[13px] font-semibold text-[var(--pw-primary)]">{fieldName}</code>
            {attrs.type && (
              <span className="rounded bg-[var(--pw-primary-tint)] px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                {attrs.type}
              </span>
            )}
            {attrs.required === 'true' && (
              <span className="rounded bg-[var(--pw-critical-tint)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--pw-critical)]">
                required
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">{renderInline(inner)}</p>
        </div>,
      )
      continue
    }

    // Headings
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const text = headingMatch[2]
      const id = slugifyHeading(text)
      if (level === 2) {
        elements.push(
          <h2
            key={key++}
            id={id}
            className="mt-9 mb-3 scroll-mt-24 border-b border-[var(--pw-rule)] pb-2 text-xl font-semibold text-foreground"
          >
            {renderInline(text)}
          </h2>,
        )
      } else if (level === 3) {
        elements.push(
          <h3 key={key++} id={id} className="mt-6 mb-2 scroll-mt-24 text-lg font-semibold text-foreground">
            {renderInline(text)}
          </h3>,
        )
      } else {
        elements.push(
          <h4 key={key++} id={id} className="mt-4 mb-2 text-base font-semibold text-foreground">
            {renderInline(text)}
          </h4>,
        )
      }
      i++
      continue
    }

    // Markdown Table
    if (trimmed.startsWith('|') && i + 1 < lines.length && lines[i + 1].trim().startsWith('|')) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim())
        i++
      }
      const parseRow = (row: string) =>
        row
          .split('|')
          .slice(1, -1)
          .map((cell) => cell.trim())
      const headers = parseRow(tableLines[0])
      const rows = tableLines.slice(2).map(parseRow)
      elements.push(
        <div key={key++} className="my-5 overflow-x-auto rounded-[var(--pw-radius-md)] border border-[var(--pw-rule)] bg-card">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-[var(--pw-rule)] bg-[var(--pw-primary-tint)]/60">
              <tr>
                {headers.map((h, idx) => (
                  <th key={idx} className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-foreground">
                    {renderInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--pw-rule)]">
              {rows.map((r, rIdx) => (
                <tr key={rIdx} className="hover:bg-[var(--pw-bg)]">
                  {r.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-2.5 text-muted-foreground">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
      continue
    }

    // Unordered list
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const items: string[] = []
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        items.push(lines[i].trim().slice(2))
        i++
      }
      elements.push(
        <ul key={key++} className="my-4 list-disc space-y-2 pl-5 text-[15px] leading-7 text-muted-foreground">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ul>,
      )
      continue
    }

    // Ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''))
        i++
      }
      elements.push(
        <ol key={key++} className="my-4 list-decimal space-y-2 pl-5 text-[15px] leading-7 text-muted-foreground">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ol>,
      )
      continue
    }

    // Paragraph
    const paraLines: string[] = [trimmed]
    i++
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('<') &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('|') &&
      !lines[i].trim().startsWith('- ') &&
      !/^\d+\.\s+/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim())
      i++
    }
    elements.push(
      <p key={key++} className="my-3.5 text-[15px] leading-7 text-muted-foreground">
        {renderInline(paraLines.join(' '))}
      </p>,
    )
  }

  return <>{elements}</>
}
