import * as THREE from 'three'
import { FRAMES_PER_NODE } from '../data/focusPoints'

const FPS = 24
const WORKS_TAIL_FRAMES = 100

type CamKey = {
  frame: number
  pos: THREE.Vector3Tuple
  target: THREE.Vector3Tuple
  fov: number
}

function cameraKeys(nodeCount: number): CamKey[] {
  const resumeEnd = nodeCount * FRAMES_PER_NODE
  const total = resumeEnd + WORKS_TAIL_FRAMES
  // Subject sits slightly left of frame so the HTML résumé can occupy the right rail.
  return [
    { frame: 0, pos: [1.85, 1.42, 5.15], target: [-0.28, 1.22, 0], fov: 33 },
    { frame: FRAMES_PER_NODE, pos: [1.35, 1.48, 4.35], target: [-0.22, 1.2, 0], fov: 31 },
    { frame: FRAMES_PER_NODE * 2, pos: [0.72, 1.62, 3.85], target: [-0.18, 1.28, 0], fov: 29 },
    { frame: FRAMES_PER_NODE * 3, pos: [0.18, 1.72, 4.55], target: [-0.12, 1.32, 0], fov: 30 },
    { frame: FRAMES_PER_NODE * 4, pos: [1.55, 1.38, 3.55], target: [-0.3, 1.18, 0], fov: 27 },
    { frame: resumeEnd, pos: [1.95, 1.68, 5.05], target: [-0.08, 1.22, 0], fov: 34 },
    { frame: resumeEnd + 50, pos: [0.55, 1.95, 6.4], target: [0.05, 1.15, 0], fov: 38 },
    { frame: total, pos: [0.15, 2.15, 7.6], target: [0.1, 1.05, 0], fov: 40 },
  ]
}

function lookQuat(pos: THREE.Vector3, target: THREE.Vector3): THREE.Quaternion {
  const m = new THREE.Matrix4().lookAt(pos, target, new THREE.Vector3(0, 1, 0))
  return new THREE.Quaternion().setFromRotationMatrix(m)
}

function buildCameraClip(nodeCount: number): THREE.AnimationClip {
  const keys = cameraKeys(nodeCount)
  const times = keys.map((k) => k.frame / FPS)
  const positions: number[] = []
  const quats: number[] = []
  const prevQ = new THREE.Quaternion()
  keys.forEach((k, i) => {
    const pos = new THREE.Vector3(...k.pos)
    const q = lookQuat(pos, new THREE.Vector3(...k.target))
    if (i > 0 && q.dot(prevQ) < 0) {
      q.x *= -1
      q.y *= -1
      q.z *= -1
      q.w *= -1
    }
    prevQ.copy(q)
    positions.push(pos.x, pos.y, pos.z)
    quats.push(q.x, q.y, q.z, q.w)
  })
  const duration = times[times.length - 1]
  return new THREE.AnimationClip('CameraAction', duration, [
    new THREE.VectorKeyframeTrack('Camera.position', times, positions),
    new THREE.QuaternionKeyframeTrack('Camera.quaternion', times, quats),
  ])
}

export function fovAtFrame(frame: number, nodeCount: number): number {
  const keys = cameraKeys(nodeCount)
  if (frame <= keys[0].frame) return keys[0].fov
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i]
    const b = keys[i + 1]
    if (frame <= b.frame) {
      const t = (frame - a.frame) / Math.max(1, b.frame - a.frame)
      return THREE.MathUtils.lerp(a.fov, b.fov, t)
    }
  }
  return keys[keys.length - 1].fov
}

/** Original 3D subject: Jinsong's portrait on a studio disc + rings (not Sen's character). */
export function createPortraitScene(
  texture: THREE.Texture,
  focusNames: readonly string[],
): { scene: THREE.Group; animations: THREE.AnimationClip[] } {
  const root = new THREE.Group()
  root.name = 'portrait-scene'

  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  texture.needsUpdate = true

  const portrait = new THREE.Mesh(
    new THREE.CircleGeometry(0.78, 64),
    new THREE.MeshPhysicalMaterial({
      map: texture,
      roughness: 0.42,
      metalness: 0.04,
      clearcoat: 0.35,
      clearcoatRoughness: 0.35,
      side: THREE.FrontSide,
    }),
  )
  portrait.name = 'portrait'
  portrait.position.set(-0.22, 1.22, 0)
  portrait.castShadow = true
  portrait.receiveShadow = true
  root.add(portrait)

  const frame = new THREE.Mesh(
    new THREE.TorusGeometry(0.8, 0.028, 12, 80),
    new THREE.MeshStandardMaterial({
      color: '#cbb892',
      roughness: 0.35,
      metalness: 0.55,
    }),
  )
  frame.name = 'frame'
  frame.position.copy(portrait.position)
  frame.castShadow = true
  root.add(frame)

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.12, 0.01, 8, 80),
    new THREE.MeshStandardMaterial({
      color: '#6f906f',
      roughness: 0.45,
      metalness: 0.2,
      transparent: true,
      opacity: 0.7,
    }),
  )
  ring.name = 'orbit-ring'
  ring.position.copy(portrait.position)
  ring.rotation.x = Math.PI * 0.18
  root.add(ring)

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(1.38, 0.006, 8, 80),
    new THREE.MeshStandardMaterial({
      color: '#dbd3b5',
      roughness: 0.5,
      metalness: 0.15,
      transparent: true,
      opacity: 0.35,
    }),
  )
  ring2.name = 'orbit-ring-2'
  ring2.position.copy(portrait.position)
  ring2.rotation.x = Math.PI * -0.12
  ring2.rotation.y = 0.2
  root.add(ring2)

  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.32, 0.08, 32),
    new THREE.MeshStandardMaterial({ color: '#2a3328', roughness: 0.8, metalness: 0.1 }),
  )
  pedestal.position.set(portrait.position.x, 0.04, 0.05)
  pedestal.receiveShadow = true
  root.add(pedestal)

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.42, 12),
    new THREE.MeshStandardMaterial({ color: '#cbb892', roughness: 0.4, metalness: 0.45 }),
  )
  stem.position.set(portrait.position.x, 0.28, 0.05)
  root.add(stem)

  const start = new THREE.Object3D()
  start.name = 'focus-0'
  start.position.copy(portrait.position)
  root.add(start)

  focusNames.forEach((name, i) => {
    const o = new THREE.Object3D()
    o.name = name
    const a = (i / Math.max(1, focusNames.length - 1)) * Math.PI * 0.35 - 0.15
    o.position.set(
      portrait.position.x + Math.sin(a) * 0.12,
      portrait.position.y + (i - 2) * 0.05,
      portrait.position.z + 0.02,
    )
    root.add(o)
  })

  const works = new THREE.Object3D()
  works.name = 'focus-works'
  works.position.set(portrait.position.x, portrait.position.y - 0.08, portrait.position.z)
  root.add(works)

  const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 500)
  camera.name = 'Camera'
  const hero = cameraKeys(focusNames.length)[0]
  camera.position.set(...hero.pos)
  camera.lookAt(...hero.target)
  root.add(camera)

  return { scene: root, animations: [buildCameraClip(focusNames.length)] }
}
