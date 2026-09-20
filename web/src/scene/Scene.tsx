import { Suspense, useMemo, useRef, useEffect, type MutableRefObject } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { EffectComposer, Bloom, DepthOfField, SMAA } from '@react-three/postprocessing'
import * as THREE from 'three'
import { FOCUS_POINTS, FRAMES_PER_NODE } from '../data/focusPoints'
import { createPortraitScene, fovAtFrame } from './portrait'

useTexture.preload(`${import.meta.env.BASE_URL}images/avatar.png`)

const POINTS = FOCUS_POINTS as readonly string[]
const M = POINTS.length
const RESUME_FRAMES = M * FRAMES_PER_NODE
const WORKS_ENTRANCE = 50
const FPS = 24
const NODE_LINE = 0.3

function GradientBackground() {
  const top = '#6f906f'
  const bottom = '#dbd3b5'
  const steep = 1.4

  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color() },
      uBottom: { value: new THREE.Color() },
      uSteep: { value: 1 },
    }),
    [],
  )
  uniforms.uTop.value.set(top)
  uniforms.uBottom.value.set(bottom)
  uniforms.uSteep.value = steep

  return (
    <mesh scale={100}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={/* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          uniform vec3 uTop;
          uniform vec3 uBottom;
          uniform float uSteep;
          varying vec3 vDir;
          void main() {
            float t = clamp(vDir.y * uSteep * 0.5 + 0.5, 0.0, 1.0);
            gl_FragColor = vec4(mix(uBottom, uTop, t), 1.0);
          }
        `}
      />
    </mesh>
  )
}

function Lights() {
  const c = {
    hemiIntensity: 1.15,
    hemiSky: '#ffffff',
    hemiGround: '#404040',
    keyIntensity: 2.35,
    keyColor: '#ffd9c6',
    keyPos: [5, 8, 5] as [number, number, number],
    fillIntensity: 2.25,
    fillColor: '#9fc6ff',
    fillPos: [-5, 4, -4] as [number, number, number],
  }

  return (
    <>
      <ambientLight intensity={0.28} />
      <hemisphereLight args={[c.hemiSky, c.hemiGround, c.hemiIntensity]} />
      <directionalLight
        position={c.keyPos}
        intensity={c.keyIntensity}
        color={c.keyColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={c.fillPos} intensity={c.fillIntensity} color={c.fillColor} />
    </>
  )
}

function Portrait({
  focusRef,
  frameRef,
  dofBokehRef,
  dofRangeRef,
}: {
  focusRef: MutableRefObject<THREE.Vector3>
  frameRef: MutableRefObject<number>
  dofBokehRef: MutableRefObject<number>
  dofRangeRef: MutableRefObject<number>
}) {
  const posX = 0
  const posY = 0.4
  const posZ = -0.7
  const scale = 1.55
  const rotationY = 0

  const cam = {
    damping: 0.1,
    dwell: 0.35,
    parallax: 4,
    parallaxEase: 0.1,
    mobilePullback: 1.2,
    mobileTimelineShift: 0.12,
  }

  const get = useThree((s) => s.get)
  const texture = useTexture(`${import.meta.env.BASE_URL}images/avatar.png`)

  const { model, animations, points, startPoint, glbCam, focusNode } = useMemo(() => {
    const built = createPortraitScene(texture, POINTS)
    const clone = built.scene
    const pmap: Record<string, THREE.Object3D> = {}
    let start: THREE.Object3D | null = null
    let cameraObj: THREE.Camera | null = null
    let works: THREE.Object3D | null = null
    clone.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true
        o.receiveShadow = true
      }
      if ((o as THREE.Camera).isCamera) cameraObj = o as THREE.Camera
      if (o.name === 'focus-start' || o.name === 'focus-0') start = o
      if (o.name === 'focus-works') works = o
      if ((POINTS as readonly string[]).includes(o.name)) pmap[o.name] = o
    })
    const pts = POINTS.map((n) => pmap[n] || null)
    return {
      model: clone,
      animations: built.animations,
      points: pts,
      startPoint: start || pts[0] || null,
      glbCam: cameraObj,
      focusNode: works || pts[pts.length - 1] || null,
    }
  }, [texture])

  const totalFrames = useMemo(() => {
    const clips = animations || []
    const camClip = clips.find((c) => c.name === 'CameraAction')
    const clip = camClip || (clips.length ? clips.reduce((a, b) => (b.duration > a.duration ? b : a)) : null)
    return clip ? Math.round(clip.duration * FPS) : RESUME_FRAMES + 2 * WORKS_ENTRANCE
  }, [animations])

  const mixer = useMemo(() => new THREE.AnimationMixer(model), [model])
  const actions = useRef<{ action: THREE.AnimationAction; duration: number }[]>([])
  useEffect(() => {
    if (!animations || animations.length === 0) return
    mixer.stopAllAction()
    actions.current = animations.map((clip) => {
      const a = mixer.clipAction(clip)
      a.play()
      a.paused = true
      return { action: a, duration: clip.duration }
    })
    return () => {
      mixer.stopAllAction()
      actions.current = []
    }
  }, [mixer, animations])

  const mouse = useRef({ x: 0, y: 0 })
  const smouse = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const isMobile = useRef(
    typeof window !== 'undefined' &&
      (window.matchMedia?.('(pointer: coarse)').matches === true || window.innerWidth <= 640),
  )

  const anchorEls = useRef<Array<Element | null> | null>(null)
  const galleryEl = useRef<Element | null>(null)
  const frameSmooth = useRef(0)
  const posA = useRef(new THREE.Vector3())
  const posB = useRef(new THREE.Vector3())
  const tmpVec = useRef(new THREE.Vector3())
  const camPos = useRef(new THREE.Vector3())
  const camQuat = useRef(new THREE.Quaternion())
  const camScl = useRef(new THREE.Vector3())
  const paraEuler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
  const paraQuat = useRef(new THREE.Quaternion())

  useFrame((_, dt) => {
    const a = 1 - Math.pow(cam.damping, dt)

    if (!anchorEls.current) {
      anchorEls.current = POINTS.map((n) => document.querySelector(`[data-point="${n}"]`))
    }
    const els = anchorEls.current
    const d = THREE.MathUtils.clamp(cam.dwell, 0, 0.49)
    const dwell = (t: number) => {
      if (d <= 0) return t
      if (t < d) return 0
      if (t > 1 - d) return 1
      return THREE.MathUtils.smoothstep((t - d) / (1 - 2 * d), 0, 1)
    }
    let sTarget = THREE.MathUtils.clamp(frameSmooth.current / FRAMES_PER_NODE - 1, -1, M - 1)
    if (els && els.length === M && els.every(Boolean)) {
      const refLine = window.scrollY + window.innerHeight * NODE_LINE
      const tops = els.map((el) => (el as HTMLElement).getBoundingClientRect().top + window.scrollY)
      if (refLine <= tops[0]) {
        const heroScroll = Math.max(1, tops[0] - window.innerHeight * NODE_LINE)
        sTarget = -1 + dwell(THREE.MathUtils.clamp(window.scrollY / heroScroll, 0, 1))
      } else if (refLine >= tops[M - 1]) {
        sTarget = M - 1
      } else {
        for (let i = 0; i < M - 1; i++) {
          if (refLine <= tops[i + 1]) {
            const t = (refLine - tops[i]) / Math.max(1, tops[i + 1] - tops[i])
            sTarget = i + dwell(t)
            break
          }
        }
      }
    }
    let frameTarget = THREE.MathUtils.clamp((sTarget + 1) * FRAMES_PER_NODE, 0, RESUME_FRAMES)
    let inWorks = false
    if (!galleryEl.current) galleryEl.current = document.querySelector('.wk-gallery')
    if (galleryEl.current) {
      const ih = window.innerHeight
      const rectTop = (galleryEl.current as HTMLElement).getBoundingClientRect().top
      const range = Math.max(0, (galleryEl.current as HTMLElement).offsetHeight - ih)
      if (rectTop < ih) {
        inWorks = true
        const entranceEnd = Math.min(RESUME_FRAMES + WORKS_ENTRANCE, totalFrames)
        if (rectTop > 0) {
          const pA = THREE.MathUtils.clamp(1 - rectTop / ih, 0, 1)
          frameTarget = RESUME_FRAMES + (entranceEnd - RESUME_FRAMES) * pA
        } else {
          const scrolled = THREE.MathUtils.clamp(-rectTop, 0, range)
          const pB = THREE.MathUtils.clamp(scrolled / window.innerWidth, 0, 1)
          frameTarget = entranceEnd + (totalFrames - entranceEnd) * pB
        }
      }
    }
    const smoothOff = THREE.MathUtils.smoothstep(frameTarget, RESUME_FRAMES, RESUME_FRAMES + WORKS_ENTRANCE)
    const aEff = THREE.MathUtils.lerp(a, 1, smoothOff)
    frameSmooth.current += (frameTarget - frameSmooth.current) * aEff
    const frame = frameSmooth.current
    if (actions.current.length) {
      const t = frame / FPS
      for (const { action: act, duration } of actions.current) {
        act.time = Math.min(t, duration)
      }
      mixer.update(0)
    }
    if (frameRef) frameRef.current = frame

    const s = THREE.MathUtils.clamp(frame / FRAMES_PER_NODE - 1, -1, M - 1)

    if (focusRef) {
      if (inWorks && focusNode) {
        focusNode.getWorldPosition(focusRef.current)
      } else if (s < 0 && startPoint && points[0]) {
        startPoint.getWorldPosition(posA.current)
        points[0].getWorldPosition(posB.current)
        focusRef.current.lerpVectors(posA.current, posB.current, THREE.MathUtils.clamp(s + 1, 0, 1))
      } else {
        const sc = THREE.MathUtils.clamp(s, 0, M - 1)
        const iA = Math.floor(sc)
        const iB = Math.min(iA + 1, M - 1)
        const f = sc - iA
        if (points[iA] && points[iB]) {
          points[iA].getWorldPosition(posA.current)
          points[iB].getWorldPosition(posB.current)
          focusRef.current.lerpVectors(posA.current, posB.current, f)
        }
      }
    }

    if (dofBokehRef && dofRangeRef) {
      dofBokehRef.current = -1
    }

    const camera: THREE.Camera = get().camera
    if (glbCam && (camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
      const persp = camera as THREE.PerspectiveCamera
      const rigCam = glbCam as THREE.PerspectiveCamera
      rigCam.fov = fovAtFrame(frame, M)
      rigCam.updateProjectionMatrix()
      rigCam.updateWorldMatrix(true, false)
      rigCam.matrixWorld.decompose(camPos.current, camQuat.current, camScl.current)
      const me = 1 - Math.pow(cam.parallaxEase, dt)
      smouse.current.x += (mouse.current.x - smouse.current.x) * me
      smouse.current.y += (mouse.current.y - smouse.current.y) * me
      const ax = THREE.MathUtils.degToRad(cam.parallax)
      paraEuler.current.set(-smouse.current.y * ax, -smouse.current.x * ax, 0)
      paraQuat.current.setFromEuler(paraEuler.current)
      tmpVec.current.copy(camPos.current).sub(focusRef.current).applyQuaternion(paraQuat.current)
      if (isMobile.current) tmpVec.current.multiplyScalar(cam.mobilePullback)
      tmpVec.current.add(focusRef.current)
      persp.position.copy(tmpVec.current)
      persp.quaternion.multiplyQuaternions(paraQuat.current, camQuat.current)
      if (isMobile.current && cam.mobileTimelineShift !== 0) {
        const tlWeight = THREE.MathUtils.smoothstep(s, -0.8, 0.3) * (1 - smoothOff)
        if (tlWeight > 0) {
          const dist = persp.position.distanceTo(focusRef.current)
          persp.translateX(-dist * cam.mobileTimelineShift * tlWeight)
        }
      }
      if (persp.fov !== rigCam.fov) {
        persp.fov = rigCam.fov
        persp.updateProjectionMatrix()
      }
    }

    const ring = model.getObjectByName('orbit-ring')
    const ring2 = model.getObjectByName('orbit-ring-2')
    if (ring) ring.rotateZ(dt * 0.12)
    if (ring2) ring2.rotateZ(-dt * 0.07)

    // Portrait follows the cursor a little — stand-in for eye-follow without copying a face rig.
    const disc = model.getObjectByName('portrait')
    if (disc && !isMobile.current) {
      disc.rotation.y = THREE.MathUtils.lerp(disc.rotation.y, smouse.current.x * 0.18, 0.08)
      disc.rotation.x = THREE.MathUtils.lerp(disc.rotation.x, -smouse.current.y * 0.1, 0.08)
    }
  })

  return (
    <group position={[posX, posY, posZ]} rotation={[0, (rotationY * Math.PI) / 180, 0]} scale={scale}>
      <primitive object={model} />
    </group>
  )
}

function Post2({
  focusRef,
  frameRef,
  dofBokehRef,
  dofRangeRef,
}: {
  focusRef: MutableRefObject<THREE.Vector3>
  frameRef: MutableRefObject<number>
  dofBokehRef: MutableRefObject<number>
  dofRangeRef: MutableRefObject<number>
}) {
  const post = {
    bloomIntensity: 0.6,
    bloomThreshold: 0.82,
    dof: true,
    startBokeh: 7.4,
    startRange: 2.0,
    focusBokeh: 11.0,
    focusRange: 0.15,
    startBlendFrame: 48,
    endBlendFrame: RESUME_FRAMES - 50,
  }

  const dofRef = useRef<any>(null)
  useFrame(() => {
    const e = dofRef.current
    if (!e) return
    if (e.target && focusRef) e.target.copy(focusRef.current)
    const f = frameRef ? frameRef.current : 0
    const wStart = 1 - THREE.MathUtils.smoothstep(f, 0, post.startBlendFrame)
    const wEnd = THREE.MathUtils.smoothstep(f, post.endBlendFrame, RESUME_FRAMES)
    const w = Math.max(wStart, wEnd)
    if (dofBokehRef && dofBokehRef.current >= 0) {
      e.bokehScale = dofBokehRef.current
      if (e.cocMaterial) e.cocMaterial.focusRange = Math.max(1e-4, dofRangeRef ? dofRangeRef.current : post.focusRange)
    } else {
      e.bokehScale = THREE.MathUtils.lerp(post.focusBokeh, post.startBokeh, w)
      if (e.cocMaterial) e.cocMaterial.focusRange = THREE.MathUtils.lerp(post.focusRange, post.startRange, w)
    }
  })

  return (
    <EffectComposer multisampling={0} stencilBuffer={false} depthBuffer>
      {(post.dof ? (
        <DepthOfField
          ref={dofRef}
          target={[0, 1.3, 0]}
          worldFocusRange={post.focusRange}
          bokehScale={post.focusBokeh}
          height={480}
        />
      ) : null) as any}
      <Bloom
        mipmapBlur
        intensity={post.bloomIntensity}
        luminanceThreshold={post.bloomThreshold}
        luminanceSmoothing={0.3}
      />
      <SMAA />
    </EffectComposer>
  )
}

export default function Scene() {
  const focusRef = useRef(new THREE.Vector3(0, 1.3, 0))
  const frameRef = useRef(0)
  const dofBokehRef = useRef(-1)
  const dofRangeRef = useRef(0.15)
  return (
    <>
      <GradientBackground />
      <Suspense fallback={null}>
        <Lights />
        <Portrait focusRef={focusRef} frameRef={frameRef} dofBokehRef={dofBokehRef} dofRangeRef={dofRangeRef} />
      </Suspense>
      <Post2 focusRef={focusRef} frameRef={frameRef} dofBokehRef={dofBokehRef} dofRangeRef={dofRangeRef} />
    </>
  )
}
