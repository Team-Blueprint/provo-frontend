import docsConfig from '../../docs/docs.json'

export interface DocsNavGroup {
  group: string
  pages: string[]
}

export interface DocsNavTab {
  tab: string
  groups: DocsNavGroup[]
}

export interface DocPage {
  slug: string
  title: string
  description: string
  api?: string
  body: string
  tab: string
  group: string
}

const rawModules = import.meta.glob('../../docs/**/*.mdx', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function parseFrontmatter(raw: string): {
  title: string
  description: string
  api?: string
  body: string
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) {
    return { title: 'Documentation', description: '', body: raw }
  }

  const yaml = match[1]
  const body = match[2].trim()
  const titleMatch = yaml.match(/^title:\s*["']?(.*?)["']?\s*$/m)
  const descMatch = yaml.match(/^description:\s*["']?(.*?)["']?\s*$/m)
  const apiMatch = yaml.match(/^api:\s*["']?(.*?)["']?\s*$/m)

  return {
    title: titleMatch ? titleMatch[1] : 'Documentation',
    description: descMatch ? descMatch[1] : '',
    api: apiMatch ? apiMatch[1] : undefined,
    body,
  }
}

function normalizeSlug(filePath: string): string {
  return filePath
    .replace(/^(\.\.\/)+docs\//, '')
    .replace(/\.mdx$/, '')
}

export const docsTabs: DocsNavTab[] = docsConfig.navigation.tabs

const pageMetaMap = new Map<string, { tab: string; group: string }>()
export const orderedSlugs: string[] = []

for (const tabItem of docsTabs) {
  for (const groupItem of tabItem.groups) {
    for (const slug of groupItem.pages) {
      pageMetaMap.set(slug, { tab: tabItem.tab, group: groupItem.group })
      orderedSlugs.push(slug)
    }
  }
}

export const allDocPages: Map<string, DocPage> = new Map()

for (const [path, raw] of Object.entries(rawModules)) {
  const slug = normalizeSlug(path)
  const { title, description, api, body } = parseFrontmatter(raw)
  const meta = pageMetaMap.get(slug) ?? { tab: 'Guides', group: 'Documentation' }
  allDocPages.set(slug, {
    slug,
    title,
    description,
    api,
    body,
    tab: meta.tab,
    group: meta.group,
  })
}

export function getDocPage(slug: string): DocPage | undefined {
  const clean = slug.replace(/^\/+|\/+$/g, '') || 'introduction'
  return allDocPages.get(clean)
}

export function getAdjacentPages(slug: string): {
  prev?: DocPage
  next?: DocPage
} {
  const idx = orderedSlugs.indexOf(slug)
  if (idx === -1) return {}
  const prevSlug = idx > 0 ? orderedSlugs[idx - 1] : undefined
  const nextSlug = idx < orderedSlugs.length - 1 ? orderedSlugs[idx + 1] : undefined
  return {
    prev: prevSlug ? allDocPages.get(prevSlug) : undefined,
    next: nextSlug ? allDocPages.get(nextSlug) : undefined,
  }
}

export interface TocHeading {
  id: string
  text: string
  level: 2 | 3
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`*_~]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function extractHeadings(body: string): TocHeading[] {
  const headings: TocHeading[] = []
  let inFence = false
  for (const line of body.split(/\r?\n/)) {
    if (line.trim().startsWith('```')) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    const match = line.match(/^(#{2,3})\s+(.+)$/)
    if (match) {
      const level = match[1].length as 2 | 3
      const text = match[2].replace(/[`*_]/g, '').trim()
      headings.push({ id: slugifyHeading(text), text, level })
    }
  }
  return headings
}

export function searchDocPages(query: string): DocPage[] {
  const q = query.trim().toLowerCase()
  const list = orderedSlugs
    .map((s) => allDocPages.get(s))
    .filter((p): p is DocPage => Boolean(p))
  if (!q) return list.slice(0, 8)
  return list.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.body.toLowerCase().includes(q) ||
      p.group.toLowerCase().includes(q),
  )
}
