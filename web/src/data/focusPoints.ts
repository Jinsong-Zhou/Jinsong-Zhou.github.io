// Timeline focus anchors: empty Object3D names in the portrait scene, in the
// same order as résumé entries (Resume.tsx). This is the single source of
// truth for how many résumé stops the camera has — Scene.tsx and Resume.tsx
// both read it. Add/remove here and in Resume.tsx together.
//
// CameraAction frame convention (24 fps), matching sen-3d-resume:
//   frame 0              → hero (focus-0 / focus-start)
//   frame 50·k           → k-th timeline node (FOCUS_POINTS[k-1])
//   last frame           → works (focus-works)
export const FOCUS_POINTS = ['focus-1', 'focus-2', 'focus-3', 'focus-4', 'focus-5'] as const

export const FRAMES_PER_NODE = 50
