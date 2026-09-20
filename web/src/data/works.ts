import { getPublications, scholarMeta } from './publications'

export interface WorkListItem {
  name: string
  meta?: string
  tags?: string[]
  link?: string
  slug?: string
}

export interface WorkGroup {
  heading: string
  items: string[]
}

export interface WorkSection {
  id: string
  no: string
  title: string
  tagline: string
  items?: WorkListItem[]
  groups?: WorkGroup[]
  awards?: string[]
  footer?: string
}

export interface WorksLang {
  title: string
  closeLabel: string
  openLabel: string
  hint: string
  awardsLabel: string
  visitLabel: string
  detailPlaceholder: string
  phImageLabel: string
  phButtonLabel: string
  countLabel: (n: number) => string
  sections: WorkSection[]
}

const pubs = getPublications()

const pubItems: WorkListItem[] = pubs.map((p) => ({
  name: p.displayTitle,
  meta: [p.venue, p.year].filter(Boolean).join(' · '),
  tags: p.citations ? [`${p.citations} cites`] : undefined,
  link: p.url || p.scholar_url,
  slug: p.slug,
}))

export const WORKS: Record<'zh' | 'en', WorksLang> = {
  zh: {
    title: 'Works',
    closeLabel: '返回',
    openLabel: '展开',
    hint: '继续下滑',
    awardsLabel: '引用',
    visitLabel: '打开链接',
    detailPlaceholder: '论文摘要见 Google Scholar。',
    phImageLabel: '图片 / 视频',
    phButtonLabel: '跳转按钮',
    countLabel: (n) => `${n} 项`,
    sections: [
      {
        id: 'pubs',
        no: '01',
        title: '论文',
        tagline: `${scholarMeta.citedby} 次引用 · h-index ${scholarMeta.hindex}`,
        items: pubItems,
        footer: `Google Scholar 同步于 ${scholarMeta.updated}`,
      },
      {
        id: 'oss',
        no: '02',
        title: '开源',
        tagline: 'DeepSeek Harness 插件',
        items: [
          {
            name: 'safe-find-dsh-plugins',
            meta: '安全扫描',
            slug: 'safe-find-dsh-plugins',
            link: 'https://github.com/Jinsong-Zhou/safe-find-dsh-plugins',
          },
          {
            name: 'dsh-html-canvas',
            meta: 'HTML 画布',
            slug: 'dsh-html-canvas',
            link: 'https://github.com/Jinsong-Zhou/dsh-html-canvas',
          },
        ],
      },
    ],
  },
  en: {
    title: 'Works',
    closeLabel: 'Back',
    openLabel: 'Explore',
    hint: 'Keep scrolling',
    awardsLabel: 'Citations',
    visitLabel: 'Open link',
    detailPlaceholder: 'See Google Scholar for the paper abstract.',
    phImageLabel: 'Image / Video',
    phButtonLabel: 'Link button',
    countLabel: (n) => `${n} works`,
    sections: [
      {
        id: 'pubs',
        no: '01',
        title: 'Publications',
        tagline: `${scholarMeta.citedby} citations · h-index ${scholarMeta.hindex}`,
        items: pubItems,
        footer: `Synced from Google Scholar on ${scholarMeta.updated}`,
      },
      {
        id: 'oss',
        no: '02',
        title: 'Open Source',
        tagline: 'DeepSeek Harness plugins',
        items: [
          {
            name: 'safe-find-dsh-plugins',
            meta: 'Security scan',
            slug: 'safe-find-dsh-plugins',
            link: 'https://github.com/Jinsong-Zhou/safe-find-dsh-plugins',
          },
          {
            name: 'dsh-html-canvas',
            meta: 'HTML canvas',
            slug: 'dsh-html-canvas',
            link: 'https://github.com/Jinsong-Zhou/dsh-html-canvas',
          },
        ],
      },
    ],
  },
}

export const SECTION_COVERS: Record<string, string> = {}

export function sectionCount(section: WorkSection): number {
  if (section.items) return section.items.length
  if (section.groups) return section.groups.reduce((n, g) => n + g.items.length, 0)
  return 0
}
