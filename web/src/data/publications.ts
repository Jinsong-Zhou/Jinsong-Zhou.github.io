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
}

const OVERRIDES: { match: string; title: string; url?: string; venue?: string; year?: number; note?: string }[] = [
  {
    match: 'videomemory',
    title: 'VideoMemory: Toward Consistent Video Generation via Memory Integration',
    url: 'https://arxiv.org/abs/2601.03655',
    venue: 'arXiv',
    note: 'arXiv:2601.03655 · AAAI 2027 under review',
  },
  {
    match: 'imptext',
    title: 'ImpText: A Benchmark and Tool-Augmented Framework for Implicit Text Reasoning',
    url: 'https://icml.cc/virtual/2026/poster/63174',
    venue: 'ICML',
  },
  {
    match: 'comfymind',
    title: 'ComfyMind: Toward General-Purpose Generation via Tree-Based Planning and Reactive Feedback',
    url: 'https://proceedings.neurips.cc/paper_files/paper/2025/hash/40168e00bf87869c5d153e934d8a3602-Abstract-Conference.html',
    venue: 'NeurIPS',
    year: 2025,
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
