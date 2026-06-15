import { useRef, useEffect } from 'react'
import * as THREE from 'three'

export default function VaultScene({ phase, onCanvasClick, onVaultOpened }) {
  const mountRef = useRef(null)
  const stateRef = useRef({
    renderer: null, scene: null, camera: null,
    vaultGroup: null, doorGroup: null, wheelGroup: null, innerGlow: null,
    animPhase: 'idle', phaseStart: 0,
    clock: null, frameId: null,
    cameraZ: 8.5, cameraTargetZ: 8.5,
    cameraX: 0, cameraTargetX: 0,
    fill: null,
    // mouse tracking
    mouseX: 0, mouseY: 0,
    targetRotX: 0, targetRotY: 0,
    currentRotX: 0, currentRotY: 0,
  })

  // ── Build scene once ────────────────────────────────────────────────────
  useEffect(() => {
    const s = stateRef.current
    const el = mountRef.current
    if (!el) return

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(el.offsetWidth, el.offsetHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    el.appendChild(renderer.domElement)
    s.renderer = renderer

    // Scene
    const scene = new THREE.Scene()
    scene.background = null
    scene.fog = new THREE.FogExp2(0xE8DCC4, 0.028)
    s.scene = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(42, el.offsetWidth / el.offsetHeight, 0.1, 100)
    camera.position.set(0, 0.3, 8.5)
    camera.lookAt(0, 0, 0)
    s.camera = camera

    // ── Lights ──
    scene.add(new THREE.AmbientLight(0xD4B896, 1.4))

    const sun = new THREE.DirectionalLight(0xFFF5E0, 3.2)
    sun.position.set(6, 10, 8)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    scene.add(sun)

    const rim = new THREE.DirectionalLight(0xC4A060, 1.2)
    rim.position.set(-5, 3, -4)
    scene.add(rim)

    const fill = new THREE.PointLight(0xFFEDD0, 1.6, 22)
    fill.position.set(2, 4, 5)
    scene.add(fill)
    s.fill = fill

    // Dynamic mouse light — follows vault face
    const mouseLight = new THREE.PointLight(0xFFE8A0, 0.0, 14)
    mouseLight.position.set(0, 0, 5)
    scene.add(mouseLight)
    s.mouseLight = mouseLight

    const innerGlow = new THREE.PointLight(0xE8C87A, 0, 8)
    innerGlow.position.set(0.2, 0, 2.2)
    scene.add(innerGlow)
    s.innerGlow = innerGlow

    // ── Materials ──
    const bodyMat   = new THREE.MeshStandardMaterial({ color: 0xC8A878, metalness: 0.48, roughness: 0.50 })
    const accentMat = new THREE.MeshStandardMaterial({ color: 0xA07838, metalness: 0.92, roughness: 0.10 })
    const darkMat   = new THREE.MeshStandardMaterial({ color: 0x8B6B42, metalness: 0.58, roughness: 0.42 })
    const doorMat   = new THREE.MeshStandardMaterial({ color: 0xB89060, metalness: 0.65, roughness: 0.25 })
    const plateMat  = new THREE.MeshStandardMaterial({ color: 0xD4B880, metalness: 0.76, roughness: 0.18 })
    const interiorMat = new THREE.MeshStandardMaterial({ color: 0x1A1A1A, metalness: 0.2, roughness: 0.9 })
    const shelfMat    = new THREE.MeshStandardMaterial({ color: 0x252525, metalness: 0.35, roughness: 0.75 })

    // ── Vault group ──
    const vaultGroup = new THREE.Group()
    scene.add(vaultGroup)
    s.vaultGroup = vaultGroup

    // Exterior body
    const body = new THREE.Mesh(new THREE.BoxGeometry(3.2, 4.0, 2.8), bodyMat)
    body.castShadow = true; body.receiveShadow = true
    vaultGroup.add(body)

    // ── Hollow interior chamber ──
    const chamberBack = new THREE.Mesh(new THREE.BoxGeometry(2.9, 3.7, 0.04), interiorMat)
    chamberBack.position.set(0, 0, -1.35); vaultGroup.add(chamberBack)
    const chamberL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 3.7, 2.6), interiorMat)
    chamberL.position.set(-1.42, 0, 0.05); vaultGroup.add(chamberL)
    const chamberR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 3.7, 2.6), interiorMat)
    chamberR.position.set(1.42, 0, 0.05); vaultGroup.add(chamberR)
    const chamberTop = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.04, 2.6), interiorMat)
    chamberTop.position.set(0, 1.82, 0.05); vaultGroup.add(chamberTop)
    const chamberFloor = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.04, 2.6), shelfMat)
    chamberFloor.position.set(0, -1.82, 0.05); vaultGroup.add(chamberFloor)

    // ── Gold border trim ──
    const addTrim = (w, h, d, x, y, z) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), accentMat)
      m.position.set(x, y, z); vaultGroup.add(m)
    }
    addTrim(0.06, 4.02, 0.06, -1.62, 0, 1.42)
    addTrim(0.06, 4.02, 0.06,  1.62, 0, 1.42)
    addTrim(3.28, 0.06, 0.06,  0,  2.03, 1.42)
    addTrim(3.28, 0.06, 0.06,  0, -2.03, 1.42)

    // Corner bolts
    const boltGeo = new THREE.CylinderGeometry(0.10, 0.10, 0.16, 14)
    ;[[-1.38, 1.72, 1.44], [1.38, 1.72, 1.44], [-1.38, -1.72, 1.44], [1.38, -1.72, 1.44]].forEach(([x, y, z]) => {
      const b = new THREE.Mesh(boltGeo, accentMat)
      b.rotation.x = Math.PI / 2; b.position.set(x, y, z)
      const hex = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 6), accentMat)
      hex.rotation.x = Math.PI / 2; hex.position.set(x, y, z + 0.04)
      vaultGroup.add(b); vaultGroup.add(hex)
    })

    // Decorative panel lines
    for (let i = 0; i < 2; i++) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.55, 0.04), darkMat)
      panel.position.set(0, -0.92 + i * 1.92, 1.43)
      vaultGroup.add(panel)
    }

    // ── Door group (hinge at left edge) ──
    const doorGroup = new THREE.Group()
    doorGroup.position.set(-1.6, 0, 1.4)
    vaultGroup.add(doorGroup)
    s.doorGroup = doorGroup

    const door = new THREE.Mesh(new THREE.BoxGeometry(3.2, 4.0, 0.38), doorMat)
    door.position.x = 1.6; doorGroup.add(door)

    const plate = new THREE.Mesh(new THREE.BoxGeometry(2.75, 3.6, 0.05), plateMat)
    plate.position.set(1.6, 0, 0.22); doorGroup.add(plate)

    const addDTrim = (w, h, d, x, y, z) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), accentMat)
      m.position.set(x, y, z); doorGroup.add(m)
    }
    addDTrim(0.055, 4.0,   0.055, 0.0,  0,     0.24)
    addDTrim(0.055, 4.0,   0.055, 3.22, 0,     0.24)
    addDTrim(3.26,  0.055, 0.055, 1.61, 2.03,  0.24)
    addDTrim(3.26,  0.055, 0.055, 1.61, -2.03, 0.24)

    // ── Wheel handle ──
    const wheelGroup = new THREE.Group()
    wheelGroup.position.set(1.6, 0, 0.32); doorGroup.add(wheelGroup)
    s.wheelGroup = wheelGroup

    wheelGroup.add(new THREE.Mesh(new THREE.TorusGeometry(0.60, 0.065, 14, 52), accentMat))
    wheelGroup.add(new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.038, 10, 40), accentMat))
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.16, 20), accentMat)
    hub.rotation.x = Math.PI / 2; wheelGroup.add(hub)
    const hubCap = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.1, 8), darkMat)
    hubCap.rotation.x = Math.PI / 2; hubCap.position.z = 0.1; wheelGroup.add(hubCap)
    for (let i = 0; i < 8; i++) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.038, 1.16, 0.048), accentMat)
      spoke.rotation.z = (i / 8) * Math.PI; wheelGroup.add(spoke)
    }
    for (let i = 0; i < 4; i++) {
      const sp = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.44, 0.04), darkMat)
      sp.rotation.z = (i / 4) * Math.PI + Math.PI / 8
      sp.position.set(
        Math.sin((i / 4) * Math.PI * 2 + Math.PI / 8) * 0.26,
        Math.cos((i / 4) * Math.PI * 2 + Math.PI / 8) * 0.26, 0
      )
      wheelGroup.add(sp)
    }

    // Rivets
    const rivetGeo = new THREE.SphereGeometry(0.065, 10, 10)
    ;[[-1.1, 1.65], [1.1, 1.65], [-1.1, -1.65], [1.1, -1.65], [0, 1.65], [0, -1.65]].forEach(([rx, ry]) => {
      const r = new THREE.Mesh(rivetGeo, accentMat)
      r.position.set(rx + 1.6, ry, 0.26); doorGroup.add(r)
    })

    // Keyhole
    const keyOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 20), darkMat)
    keyOuter.rotation.x = Math.PI / 2; keyOuter.position.set(2.5, 0, 0.27); doorGroup.add(keyOuter)
    const keyInner = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 20),
      new THREE.MeshStandardMaterial({ color: 0x2A1A08, metalness: 0.1, roughness: 0.9 }))
    keyInner.rotation.x = Math.PI / 2; keyInner.position.set(2.5, 0, 0.3); doorGroup.add(keyInner)

    // Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ color: 0xD9CEAD, roughness: 0.98, metalness: 0.02 })
    )
    floor.rotation.x = -Math.PI / 2; floor.position.y = -3.8
    floor.receiveShadow = true; scene.add(floor)

    // Dust particles
    const pGeo = new THREE.BufferGeometry()
    const pN = 220, pPos = new Float32Array(pN * 3)
    for (let i = 0; i < pN; i++) {
      pPos[i * 3]     = (Math.random() - 0.5) * 20
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 12
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 14
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0xC8922A, size: 0.028, transparent: true, opacity: 0.40
    })))

    // Clock
    s.clock = new THREE.Clock()

    // ── Animation loop ──
    const animate = () => {
      s.frameId = requestAnimationFrame(animate)
      const t = s.clock.getElapsedTime()

      // Smooth mouse-follow rotation (only in idle / done phases)
      if (s.animPhase === 'idle' || s.animPhase === 'done') {
        s.currentRotY += (s.targetRotY - s.currentRotY) * 0.06
        s.currentRotX += (s.targetRotX - s.currentRotX) * 0.06
        vaultGroup.rotation.y = s.currentRotY
        vaultGroup.rotation.x = s.currentRotX

        // Move mouse light to follow facing direction
        s.mouseLight.position.set(s.targetRotY * 8, -s.targetRotX * 8, 5)
        s.mouseLight.intensity = 0.8 + Math.abs(s.targetRotY) * 1.2
      }

      if (s.animPhase === 'idle') {
        vaultGroup.position.y = Math.sin(t * 0.55) * 0.06
        wheelGroup.rotation.z = t * 0.06

      } else if (s.animPhase === 'spinning') {
        wheelGroup.rotation.z += 0.22
        const elapsed = t - s.phaseStart
        if (elapsed > 0.6) { s.animPhase = 'opening'; s.phaseStart = t }

      } else if (s.animPhase === 'opening') {
        const elapsed = t - s.phaseStart
        const ease = 1 - Math.pow(1 - Math.min(elapsed / 0.9, 1), 3)
        doorGroup.rotation.y = -ease * Math.PI * 0.78
        wheelGroup.rotation.z += Math.max(0.22 - elapsed * 0.18, 0.01)
        innerGlow.intensity = Math.min(elapsed * 2.5, 3.5)
        if (elapsed > 1.0) {
          s.animPhase = 'zooming'; s.phaseStart = t
          s.cameraTargetZ = 5.8; s.cameraTargetX = 0
        }

      } else if (s.animPhase === 'zooming') {
        const elapsed = t - s.phaseStart
        s.cameraZ += (s.cameraTargetZ - s.cameraZ) * 0.10
        s.cameraX += (s.cameraTargetX - s.cameraX) * 0.10
        camera.position.z = s.cameraZ
        camera.position.x = s.cameraX
        camera.lookAt(0, 0, 0)
        if (elapsed > 1.2) { s.animPhase = 'done'; onVaultOpened() }

      } else if (s.animPhase === 'done') {
        vaultGroup.position.y = Math.sin(t * 0.45) * 0.025
        innerGlow.intensity = 3.0 + Math.sin(t * 1.2) * 0.5
      }

      s.fill.intensity = 1.4 + Math.sin(t * 0.9) * 0.2
      renderer.render(scene, camera)
    }
    animate()

    // ── Mouse tracking ──
    const handleMouseMove = (e) => {
      // Only track when in idle/done, not mid-animation
      const nx = (e.clientX / window.innerWidth)  * 2 - 1  // -1 to 1
      const ny = (e.clientY / window.innerHeight) * 2 - 1  // -1 to 1
      s.targetRotY =  nx * 0.28   // left-right tilt
      s.targetRotX = -ny * 0.16   // up-down tilt
    }
    window.addEventListener('mousemove', handleMouseMove)

    const handleResize = () => {
      if (!el) return
      camera.aspect = el.offsetWidth / el.offsetHeight
      camera.updateProjectionMatrix()
      renderer.setSize(el.offsetWidth, el.offsetHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(s.frameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [onVaultOpened])

  // ── Trigger open on phase change ────────────────────────────────────────
  useEffect(() => {
    const s = stateRef.current
    if (phase === 'opening' && s.animPhase === 'idle' && s.clock) {
      s.animPhase = 'spinning'
      s.phaseStart = s.clock.getElapsedTime()
    }
    if (phase === 'idle' && s.animPhase !== 'idle') {
      s.animPhase = 'idle'
      s.cameraZ = 8.5; s.cameraTargetZ = 8.5
      s.cameraX = 0; s.cameraTargetX = 0
      s.currentRotX = 0; s.currentRotY = 0
      s.targetRotX = 0; s.targetRotY = 0
      if (s.camera) { s.camera.position.set(0, 0.3, 8.5); s.camera.lookAt(0, 0, 0) }
      if (s.doorGroup) s.doorGroup.rotation.y = 0
      if (s.innerGlow) s.innerGlow.intensity = 0
    }
  }, [phase])

  return (
    <div
      ref={mountRef}
      onClick={onCanvasClick}
      style={{
        width: '56%', height: '100%',
        position: 'fixed', top: 0, left: 0, zIndex: 0,
        cursor: 'pointer',
      }}
    />
  )
}
