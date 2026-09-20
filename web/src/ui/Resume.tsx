import { motion } from 'framer-motion'
import { SOCIAL_ICONS } from './SocialIcons'
import { FOCUS_POINTS } from '../data/focusPoints'
import type { Lang } from '../App'

const SOCIAL_LINKS = [
  { id: 'email', label: 'Email', href: 'mailto:jinsongzhou14@gmail.com' },
  { id: 'github', label: 'GitHub', href: 'https://github.com/Jinsong-Zhou' },
  { id: 'scholar', label: 'Google Scholar', href: 'https://scholar.google.com/citations?user=9GlGW1MAAAAJ' },
]

interface ResumeGroup {
  heading?: string
  sub?: string
  link?: string
  items?: string[]
  links?: { id: string; label: string; href: string }[]
}
interface ResumeEntry {
  period: string
  place: string
  role?: string
  points?: string[]
  groups?: ResumeGroup[]
}

const RESUME: Record<Lang, { title: string; entries: ResumeEntry[] }> = {
  en: {
    title: 'Résumé',
    entries: [
      {
        period: '2020 – Present',
        place: 'Education',
        groups: [
          {
            heading: 'HKUST(GZ)',
            link: 'https://www.hkust-gz.edu.cn',
            sub: 'China · Sep 2024 – Present',
            items: ['Ph.D. in Artificial Intelligence · advised by Prof. Yingcong Chen'],
          },
          {
            heading: 'SUSTech',
            link: 'https://www.sustech.edu.cn/en/',
            sub: 'China · Sep 2020 – Jul 2024',
            items: ['B.S. in Statistics'],
          },
          {
            heading: 'University of California, Irvine',
            link: 'https://uci.edu/',
            sub: 'United States · Mar 2023 – Jul 2023',
            items: ['Exchange student'],
          },
        ],
      },
      {
        period: 'May 2025 – Dec 2025',
        place: 'ByteDance, Douyin',
        role: 'Risk Control Algorithm Intern',
        points: [
          'Built a LangGraph-based multi-agent risk assessment system from scratch, orchestrating 30+ MCP Tools to aggregate multi-dimensional user data for autonomous violation detection and explainable evidence generation.',
          'Built an adversarial image synthesis engine and 3,000+ Function Tool call-chain samples; trained Qwen3-VL-8B with SFT and GRPO to jointly optimize tool selection and semantic reasoning, producing ImpText-Reader and the ICML 2026 paper ImpText.',
        ],
      },
      {
        period: 'Aug 2025 – Mar 2026',
        place: 'StoryVerse',
        role: 'Co-Founder',
        groups: [
          {
            heading: 'StoryVerse',
            link: 'https://storyverseai.art/',
            sub: 'AI-native cinematic studio',
            items: [
              'Co-founded an AI-native New Hollywood studio delivering end-to-end cinematic production for global audiences.',
              'Helped close a $1M angel round at a $10M valuation.',
              'Built and led a six-person cross-functional team across product, UI/UX, frontend, backend, and machine learning; productized the multi-agent cinematic pipeline and launched the Beta, supporting 1,000+ concurrent users.',
            ],
          },
        ],
      },
      {
        period: 'May 2026 – Present',
        place: 'NVIDIA',
        role: 'AI Agent Solution Architect Intern',
        points: [
          'Built cross-platform Agent Harnesses for expert workflows across DevRel, robotics, and AI coding agents.',
          'Packaged repetitive NVIDIA DevRel workflows into 10 installable Agent Skills and delivered an internal Harness compatible with Codex, Claude Code, Cursor, and other major coding agents.',
          'Converted expert-operated Sim2Real workflows—including data import, robot modeling, simulation tuning, validation, and configuration export—into a reproducible human-in-the-loop Agent Harness.',
          'Built NIMHub, a reliable NVIDIA model integration layer supporting natural-language discovery, selection, multi-model composition, and code generation across 208 Build/NIM models, with direct invocation code for 163 models.',
        ],
      },
      {
        period: 'Honors',
        place: 'Awards & contact',
        groups: [
          {
            heading: 'Honors',
            items: [
              'Full Postgraduate Scholarship · HKUST(GZ) · Sep 2024',
              'First-Class Outstanding Student Scholarship (Top 5%) · SUSTech · Oct 2023',
              'Study Abroad Scholarship (¥80,000) · SUSTech · Dec 2022',
            ],
            links: SOCIAL_LINKS,
          },
        ],
      },
    ],
  },
  zh: {
    title: 'Résumé',
    entries: [
      {
        period: '2020 – 至今',
        place: '教育经历',
        groups: [
          {
            heading: '香港科技大学（广州）',
            link: 'https://www.hkust-gz.edu.cn',
            sub: '中国 · 2024.09 – 至今',
            items: ['人工智能博士 · 导师陈颖聪教授'],
          },
          {
            heading: '南方科技大学',
            link: 'https://www.sustech.edu.cn/en/',
            sub: '中国 · 2020.09 – 2024.07',
            items: ['统计学学士'],
          },
          {
            heading: '加州大学欧文分校',
            link: 'https://uci.edu/',
            sub: '美国 · 2023.03 – 2023.07',
            items: ['交换生'],
          },
        ],
      },
      {
        period: '2025.05 – 2025.12',
        place: '字节跳动 · 抖音',
        role: '风控算法实习生',
        points: [
          '从零搭建基于 LangGraph 的多智能体风险评估系统，编排 30+ MCP Tools 汇聚多维用户数据，用于自动违规检测与可解释证据生成。',
          '构建对抗图像合成引擎与 3000+ Function Tool 调用链样本；以 SFT 与 GRPO 训练 Qwen3-VL-8B，联合优化工具选择与语义推理，产出 ImpText-Reader 与 ICML 2026 论文 ImpText。',
        ],
      },
      {
        period: '2025.08 – 2026.03',
        place: 'StoryVerse',
        role: '联合创始人',
        groups: [
          {
            heading: 'StoryVerse',
            link: 'https://storyverseai.art/',
            sub: 'AI 原生影视工作室',
            items: [
              '联合创立面向全球观众的 AI 原生影视工作室，覆盖端到端电影制作流程。',
              '参与完成 100 万美元天使轮，估值 1000 万美元。',
              '组建并带领 6 人跨职能团队（产品、UI/UX、前后端、机器学习），将多智能体影视管线产品化并上线 Beta，支持 1000+ 并发用户。',
            ],
          },
        ],
      },
      {
        period: '2026.05 – 至今',
        place: 'NVIDIA',
        role: 'AI Agent Solution Architect 实习生',
        points: [
          '为 DevRel、机器人与 AI 编程智能体搭建跨平台 Agent Harness。',
          '将重复的 NVIDIA DevRel 工作流封装为 10 个可安装 Agent Skill，并交付兼容 Codex、Claude Code、Cursor 等主流编程智能体的内部 Harness。',
          '把专家操作的 Sim2Real 流程（数据导入、机器人建模、仿真调参、验证与配置导出）做成可复现的人机协同 Agent Harness。',
          '搭建 NIMHub，为 208 个 Build/NIM 模型提供自然语言发现、选择、多模型组合与代码生成，其中 163 个模型可直接调用。',
        ],
      },
      {
        period: '荣誉',
        place: '奖项与联系',
        groups: [
          {
            heading: '荣誉奖项',
            items: [
              '全日制研究生奖学金 · 香港科技大学（广州）· 2024.09',
              '一等优秀学生奖学金（前 5%）· 南方科技大学 · 2023.10',
              '出国留学奖学金（8 万元）· 南方科技大学 · 2022.12',
            ],
            links: SOCIAL_LINKS,
          },
        ],
      },
    ],
  },
}

const POINT_ORDER = FOCUS_POINTS

const EASE = [0.22, 1, 0.36, 1]
const containerV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
}
const itemV = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
}

function Group({ group }: { group: ResumeGroup }) {
  const heading = group.link ? (
    <a className="about-link" href={group.link} target="_blank" rel="noopener noreferrer">
      {group.heading}
    </a>
  ) : (
    <span>{group.heading}</span>
  )

  return (
    <motion.div className="tl-group" variants={itemV}>
      <div className="tl-group-head">
        {heading}
        {group.sub && <span className="tl-group-sub">{group.sub}</span>}
      </div>
      {group.items && (
        <ul className="tl-points">
          {group.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      )}
      {group.links && (
        <div className="tl-logos">
          {group.links.map((l) => {
            const Icon = SOCIAL_ICONS[l.id as keyof typeof SOCIAL_ICONS]
            return (
              <a
                key={l.id}
                className="tl-logo"
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={l.label}
                title={l.label}
              >
                {Icon ? <Icon /> : l.label}
              </a>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

function Entry({ entry, index }: { entry: ResumeEntry; index: number }) {
  return (
    <motion.div
      className="tl-entry"
      data-point={POINT_ORDER[index]}
      variants={containerV}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-12% 0px -12% 0px' }}
    >
      <motion.span className="tl-dot" variants={itemV} aria-hidden="true" />
      <div className="tl-body">
        <motion.div className="tl-period" variants={itemV}>
          {entry.period}
        </motion.div>
        <motion.div className="tl-head" variants={itemV}>
          <h3 className="tl-place">{entry.place}</h3>
        </motion.div>
        {entry.role && (
          <motion.div className="tl-role" variants={itemV}>
            {entry.role}
          </motion.div>
        )}
        {entry.points && (
          <motion.ul className="tl-points" variants={itemV}>
            {entry.points.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </motion.ul>
        )}
        {entry.groups && entry.groups.map((g, i) => <Group key={i} group={g} />)}
      </div>
    </motion.div>
  )
}

export default function Resume({ lang }: { lang: Lang }) {
  const data = RESUME[lang]
  return (
    <section className="resume" lang={lang} id="resume">
      <motion.h2
        className="resume-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        {data.title}
      </motion.h2>
      <div className="timeline">
        {data.entries.map((e, i) => (
          <Entry key={i} entry={e} index={i} />
        ))}
      </div>
    </section>
  )
}
