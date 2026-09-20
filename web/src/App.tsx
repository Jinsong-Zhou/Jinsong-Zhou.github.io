import { Suspense, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import * as THREE from 'three'
import Scene from './scene/Scene'
import NoiseOverlay from './ui/NoiseOverlay'
import Resume from './ui/Resume'
import Works from './ui/Works'
import LoadingScreen from './ui/LoadingScreen'
import { useStore } from './store'

function Backdrop() {
  const setActive = useStore((s) => s.setActive)
  return (
    <mesh position={[0, 0, -40]} onClick={() => setActive(null)}>
      <planeGeometry args={[600, 300]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}

export type Lang = 'en' | 'zh'

const COPY = {
  en: {
    title: 'About Jinsong',
    paragraphs: [
      'Jinsong Zhou (周劲松) is a Ph.D. candidate in Artificial Intelligence at the [AI Thrust, Information Hub](https://www.hkust-gz.edu.cn/academics/hubs-and-thrust-areas/information-hub/) of [The Hong Kong University of Science and Technology (Guangzhou)](https://www.hkust-gz.edu.cn), advised by [Prof. Yingcong Chen](https://envision-research.hkust-gz.edu.cn). My work focuses on AI agents, multimodal reasoning, and generative systems. I am currently an AI Agent Solution Architect Intern at NVIDIA. Previously, I co-founded [StoryVerse](https://storyverseai.art/) and worked as a Risk Control Algorithm Intern at ByteDance. I received my B.S. in Statistics from [Southern University of Science and Technology](https://www.sustech.edu.cn/en/).',
    ],
  },
  zh: {
    title: 'About Jinsong',
    paragraphs: [
      '周劲松是[香港科技大学（广州）](https://www.hkust-gz.edu.cn)[信息枢纽 AI 学域](https://www.hkust-gz.edu.cn/academics/hubs-and-thrust-areas/information-hub/)博士生，导师为[陈颖聪教授](https://envision-research.hkust-gz.edu.cn)。研究方向为 AI Agent、多模态推理与生成系统。目前在 NVIDIA 担任 AI Agent Solution Architect 实习生。此前联合创立 [StoryVerse](https://storyverseai.art/)，并在字节跳动担任风控算法实习生。本科毕业于[南方科技大学](https://www.sustech.edu.cn/en/)统计学专业。',
    ],
  },
}

function Hero({ lang, cueOpacity }: { lang: Lang; cueOpacity: MotionValue<number> }) {
  const { title, paragraphs } = COPY[lang]
  const aboutRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: aboutRef,
    offset: ['start 0.6', 'start start'],
  })
  const blur = useTransform(scrollYProgress, [0, 0.5], ['blur(0px)', 'blur(16px)'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -96])
  const bodyY = useTransform(scrollYProgress, [0, 1], [0, -52])
  const titleSpacing = useTransform(scrollYProgress, [0, 1], ['0.01em', '0.42em'])
  return (
    <section className="hero" id="about">
      <motion.div className="about" lang={lang} ref={aboutRef} style={{ filter: blur, opacity }}>
        <div className="about-intro">
          <motion.h1 className="about-title" style={{ y: titleY, letterSpacing: titleSpacing }}>
            {title}
          </motion.h1>
          {paragraphs.map((p, i) => (
            <motion.div key={i} className="about-body" style={{ y: bodyY }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children }) => (
                    <a className="about-link" href={href} target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                }}
              >
                {p}
              </ReactMarkdown>
            </motion.div>
          ))}
        </div>
      </motion.div>
      <motion.div className="scroll-cue" style={{ opacity: cueOpacity }} aria-hidden="true">
        <span className="scroll-cue-label">{lang === 'en' ? 'SCROLL' : '向下滚动'}</span>
        <span className="scroll-cue-track">
          <span className="scroll-cue-dot" />
        </span>
      </motion.div>
    </section>
  )
}

function LangToggle({ lang, onToggle }: { lang: Lang; onToggle: () => void }) {
  return (
    <button className="lang-toggle" onClick={onToggle} aria-label="Switch language / 切换语言">
      {lang === 'en' ? '中文' : 'EN'}
    </button>
  )
}

export default function App() {
  const [lang, setLang] = useState<Lang>('en')
  const { scrollY } = useScroll()
  const worksRef = useRef(null)
  const { scrollYProgress: worksProgress } = useScroll({
    target: worksRef,
    offset: ['start end', 'start center'],
  })
  const fogBg = useTransform(worksProgress, [0, 1], ['rgba(8, 11, 18, 0)', 'rgba(8, 11, 18, 0.41)'])
  const scrimOpacity = useTransform(scrollY, [0, 520], [0, 0.4])
  const cueOpacity = useTransform(scrollY, [0, 160], [1, 0])
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const railOpacity = useTransform(scrollY, [vh * 0.5, vh * 1.1], [0, 1])
  const heroChromeOpacity = useTransform(scrollY, [0, 280], [1, 0])

  return (
    <>
      <LoadingScreen />

      <div className="scene-bg">
        <Canvas
          shadows={{ type: THREE.PCFShadowMap }}
          dpr={[1, 1.5]}
          camera={{ position: [0, 5, 19], fov: 39, near: 0.1, far: 500 }}
          gl={{ antialias: false, stencil: false, depth: true, toneMapping: THREE.ACESFilmicToneMapping }}
        >
          <color attach="background" args={['#0a0e16']} />
          <Suspense fallback={null}>
            <Backdrop />
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      <motion.div className="scrim" style={{ opacity: scrimOpacity }} aria-hidden="true" />
      <motion.div className="stage-fog" style={{ background: fogBg }} aria-hidden="true" />
      <motion.div className="glass-rail" style={{ opacity: railOpacity }} aria-hidden="true" />

      <LangToggle lang={lang} onToggle={() => setLang((l) => (l === 'en' ? 'zh' : 'en'))} />

      <motion.div className="hero-chrome" style={{ opacity: heroChromeOpacity }} aria-hidden="true">
        <div className="hero-frame" />
        <span className="hero-mark tl">+</span>
        <span className="hero-mark tr">+</span>
        <span className="hero-mark bl">+</span>
        <span className="hero-mark br">+</span>
        <div className="hero-meta hm-tl">
          <span className="hm-name">Jinsong Zhou 周劲松</span>
          <span>Ph.D. candidate · AI</span>
        </div>
        <div className="hero-meta hm-tr">Homepage — 2026</div>
        <div className="hero-meta hm-bl">Agents · Multimodal · Generative</div>
        <div className="hero-meta hm-right">Based in Guangzhou</div>
      </motion.div>

      <NoiseOverlay />

      <main className="content">
        <Hero lang={lang} cueOpacity={cueOpacity} />
        <Resume lang={lang} />
        <Works lang={lang} innerRef={worksRef} />
      </main>
    </>
  )
}
