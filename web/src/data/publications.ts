import scholar from './scholar.json'

export interface ScholarPub {
  id: string
  title: string
  authors: string[]
  year: number | null
  venue: string
  citations: number
  url: string
  scholar_url: string
  abstract: string
}

export interface DisplayPub extends ScholarPub {
  displayTitle: string
  note?: string
  slug: string
  homepage?: string
  github?: string
}

type PubOverride = {
  match: string
  title: string
  url?: string
  venue?: string
  year?: number
  note?: string
  homepage?: string
  github?: string
}

const OVERRIDES: PubOverride[] = [
  {
    match: 'videomemory',
    title: 'VideoMemory: Toward Consistent Video Generation via Memory Integration',
    url: 'https://arxiv.org/abs/2601.03655',
    venue: 'arXiv',
    note: 'arXiv:2601.03655 · AAAI 2027 under review',
    homepage: 'https://hit-perfect.github.io/VideoMemory/',
    github: 'https://github.com/EnVision-Research/VideoMemory',
  },
  {
    match: 'imptext',
    title: 'ImpText: A Benchmark and Tool-Augmented Framework for Implicit Text Reasoning',
    url: 'https://icml.cc/virtual/2026/poster/63174',
    venue: 'ICML',
    github: 'https://github.com/LitaoGuo/ImpText',
  },
  {
    match: 'comfymind',
    title: 'ComfyMind: Toward General-Purpose Generation via Tree-Based Planning and Reactive Feedback',
    url: 'https://proceedings.neurips.cc/paper_files/paper/2025/hash/40168e00bf87869c5d153e934d8a3602-Abstract-Conference.html',
    venue: 'NeurIPS',
    year: 2025,
    homepage: 'https://litaoguo.github.io/ComfyMind.github.io/',
    github: 'https://github.com/EnVision-Research/ComfyMind',
  },
  {
    match: 'presentcoach',
    title: 'PresentCoach: Dual-Agent Presentation Coaching through Exemplars and Interactive Feedback',
    venue: 'arXiv',
  },
  {
    match: 'deepseek',
    title: 'Large language models for transforming healthcare: a perspective on DeepSeek‐R1',
    venue: 'MedComm',
  },
]

/** Highlight Jinsong Zhou / 周劲松 / J. Zhou-style variants in author lists. */
export function isHighlightedAuthor(name: string): boolean {
  const compact = name.normalize('NFKC').replace(/[.,]/g, ' ').replace(/\s+/g, ' ').trim()
  if (!compact) return false
  if (compact.includes('周劲松')) return true
  const tokens = compact.toLowerCase().split(' ')
  const hasZhou = tokens.includes('zhou')
  const hasJinsong = tokens.includes('jinsong')
  if (hasZhou && hasJinsong) return true
  if (hasZhou && tokens.includes('j') && tokens.length <= 3) return true
  return false
}

function slugify(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('videomemory')) return 'videomemory'
  if (t.includes('imptext')) return 'imptext'
  if (t.includes('comfymind')) return 'comfymind'
  if (t.includes('presentcoach')) return 'presentcoach'
  if (t.includes('deepseek')) return 'deepseek-r1-healthcare'
  return t.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function getPublications(): DisplayPub[] {
  const pubs = scholar.publications as ScholarPub[]
  return pubs.map((p) => {
    const o = OVERRIDES.find((x) => p.title.toLowerCase().includes(x.match))
    return {
      ...p,
      displayTitle: o?.title ?? p.title,
      url: o?.url || p.url,
      venue: o?.venue || p.venue,
      year: o?.year ?? p.year,
      note: o?.note,
      slug: slugify(p.title),
      homepage: o?.homepage,
      github: o?.github,
    }
  })
}

export const scholarMeta = {
  citedby: scholar.citedby as number,
  hindex: scholar.hindex as number,
  i10index: scholar.i10index as number,
  updated: scholar.updated as string,
  profileUrl: scholar.profile_url as string,
}
