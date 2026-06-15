import React, { useRef, useEffect, useCallback } from 'react'
import * as THREE from 'three'

// ── Vault3D: a beige/parchment-coloured bank vault rendered in Three.js ──
export default function Vault3D({ vaultOpen, onVaultOpened }) {
  const mountRef = useRef(null)
  const stateRef = useRef({
    renderer: null,
    scene: null,
    camera: null,
    doorGroup: null,
    wheelGroup: null,
    lettersGroup: null,
    innerGlow: null,
    doorAngle: 0,
    wheelSpin: 0,
    animPhase: 'idle',  // idle | spinning | opening | zooming | done
    phaseStart: 0,
    clock: null,
    frameId: null,
    cameraZ: 8.5,
    cameraTargetZ: 8.5,
    cameraTargetX: 0,
    cameraX: 0,
  })

  useEffect(() => {
    const s = stateRef.current
    const el = mountRef.current
    if (!el) return

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(el.offsetWidth, el.offsetHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    el.appendChild(renderer.domElement)
    s.renderer = renderer

    // ── Scene ──
    const scene = new THREE.Scene()
    scene.background = null
    scene.fog = new THREE.FogExp2(0xE8DCC4, 0.032)
    s.scene = scene

    // ── Camera ──
    const camera = new THREE.PerspectiveCamera(42, el.offsetWidth / el.offsetHeight, 0.1, 100)
    camera.position.set(0, 0.3, 8.5)
    camera.lookAt(0, 0, 0)
    s.camera = camera

    // ── Lights ──
    const ambient = new THREE.AmbientLight(0xD4B896, 1.2)
    scene.add(ambient)

    const sun = new THREE.DirectionalLight(0xFFF5E0, 2.8)
    sun.position.set(6, 10, 8)
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    scene.add(sun)

    const rim = new THREE.DirectionalLight(0xC4A060, 1.0)
    rim.position.set(-5, 3, -4)
    scene.add(rim)

    const fill = new THREE.PointLight(0xFFEDD0, 1.4, 20)
    fill.position.set(2, 4, 5)
    scene.add(fill)

    const innerGlow = new THREE.PointLight(0xE8C87A, 0, 8)
    innerGlow.position.set(0.2, 0, 2.2)
    scene.add(innerGlow)
    s.innerGlow = innerGlow

    // ── Materials ──
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xC8A878, metalness: 0.45, roughness: 0.52,
    })
    const accentMat = new THREE.MeshStandardMaterial({
      color: 0xA07838, metalness: 0.88, roughness: 0.12,
    })
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x8B6B42, metalness: 0.55, roughness: 0.45,
    })
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xD8C8A8, metalness: 0.12, roughness: 0.88,
    })
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0xB89060, metalness: 0.62, roughness: 0.28,
    })
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0xD4B880, metalness: 0.72, roughness: 0.2,
    })
    const paperMat = new THREE.MeshStandardMaterial({
      color: 0xF5EDD8, roughness: 0.88, metalness: 0,
    })
    const envMat = new THREE.MeshStandardMaterial({
      color: 0xE8D0A0, roughness: 0.78, metalness: 0.04,
    })

    // ── Vault Group ──
    const vaultGroup = new THREE.Group()
    scene.add(vaultGroup)

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(3.2, 4.0, 2.8), bodyMat)
    body.castShadow = true; body.receiveShadow = true
    vaultGroup.add(body)

    // Inner chamber (visible when door opens)
    const chamber = new THREE.Mesh(new THREE.BoxGeometry(2.7, 3.5, 0.6), innerMat)
    chamber.position.z = 1.1
    vaultGroup.add(chamber)

    // Horizontal shelves inside
    for (let i = 0; i < 3; i++) {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.05, 0.5), darkMat)
      shelf.position.set(0, -0.9 + i * 0.9, 1.1)
      vaultGroup.add(shelf)
    }

    // ── Gold border trim ──
    const addTrim = (w, h, d, x, y, z) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), accentMat)
      m.position.set(x, y, z)
      vaultGroup.add(m)
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
      // Add hex head
      const hex = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 6), accentMat)
      hex.rotation.x = Math.PI / 2; hex.position.set(x, y, z + 0.04)
      vaultGroup.add(b); vaultGroup.add(hex)
    })

    // Decorative panel lines on body
    for (let i = 0; i < 2; i++) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.55, 0.04), darkMat)
      panel.position.set(0, -0.92 + i * 1.92, 1.43)
      vaultGroup.add(panel)
    }

    // ── DOOR GROUP (hinge left edge) ──
    const doorGroup = new THREE.Group()
    doorGroup.position.set(-1.6, 0, 1.4)
    vaultGroup.add(doorGroup)
    s.doorGroup = doorGroup

    // Door slab
    const door = new THREE.Mesh(new THREE.BoxGeometry(3.2, 4.0, 0.38), doorMat)
    door.position.x = 1.6; doorGroup.add(door)

    // Door face plate
    const plate = new THREE.Mesh(new THREE.BoxGeometry(2.75, 3.6, 0.05), plateMat)
    plate.position.set(1.6, 0, 0.22); doorGroup.add(plate)

    // Door trim
    const addDTrim = (w, h, d, x, y, z) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), accentMat)
      m.position.set(x, y, z); doorGroup.add(m)
    }
    addDTrim(0.055, 4.0,  0.055,  0.0,  0, 0.24)
    addDTrim(0.055, 4.0,  0.055,  3.22, 0, 0.24)
    addDTrim(3.26,  0.055, 0.055, 1.61, 2.03, 0.24)
    addDTrim(3.26,  0.055, 0.055, 1.61, -2.03, 0.24)

    // ── Wheel Handle ──
    const wheelGroup = new THREE.Group()
    wheelGroup.position.set(1.6, 0, 0.32); doorGroup.add(wheelGroup)
    s.wheelGroup = wheelGroup

    // Outer ring
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.60, 0.065, 14, 52), accentMat)
    wheelGroup.add(ring1)
    // Inner ring
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.038, 10, 40), accentMat)
    wheelGroup.add(ring2)
    // Hub
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.16, 20), accentMat)
    hub.rotation.x = Math.PI / 2; wheelGroup.add(hub)
    // Hub cap
    const hubCap = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.1, 8), darkMat)
    hubCap.rotation.x = Math.PI / 2; hubCap.position.z = 0.1; wheelGroup.add(hubCap)
    // Spokes (8)
    for (let i = 0; i < 8; i++) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.038, 1.16, 0.048), accentMat)
      spoke.rotation.z = (i / 8) * Math.PI; wheelGroup.add(spoke)
    }
    // Connecting spokes to inner ring (4 diagonal)
    for (let i = 0; i < 4; i++) {
      const sp = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.44, 0.04), darkMat)
      sp.rotation.z = (i / 4) * Math.PI + Math.PI / 8
      sp.position.set(
        Math.sin((i / 4) * Math.PI * 2 + Math.PI / 8) * 0.26,
        Math.cos((i / 4) * Math.PI * 2 + Math.PI / 8) * 0.26,
        0
      )
      wheelGroup.add(sp)
    }

    // Rivets on door plate
    const rivetGeo = new THREE.SphereGeometry(0.065, 10, 10)
    ;[[-1.1, 1.65], [1.1, 1.65], [-1.1, -1.65], [1.1, -1.65], [0, 1.65], [0, -1.65]].forEach(([rx, ry]) => {
      const r = new THREE.Mesh(rivetGeo, accentMat)
      r.position.set(rx + 1.6, ry, 0.26); doorGroup.add(r)
    })

    // Keyhole
    const keyOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 20), darkMat)
    keyOuter.rotation.x = Math.PI / 2; keyOuter.position.set(2.5, 0, 0.27); doorGroup.add(keyOuter)
    const keyInner = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 20), new THREE.MeshStandardMaterial({ color: 0x2A1A08, metalness: 0.1, roughness: 0.9 }))
    keyInner.rotation.x = Math.PI / 2; keyInner.position.set(2.5, 0, 0.3); doorGroup.add(keyInner)

    // ── Letters inside vault ──
    const lettersGroup = new THREE.Group()
    lettersGroup.position.set(0, -0.3, 0.9)
    lettersGroup.visible = false
    vaultGroup.add(lettersGroup)
    s.lettersGroup = lettersGroup

    const lConfigs = [
      { x: -0.7,  y: 0.2,  z: 0.0,  rz: 0.22,  rShelf: 1, mat: paperMat },
      { x: 0.2,   y: 0.2,  z: 0.04, rz: -0.14, rShelf: 1, mat: envMat },
      { x: 0.72,  y: 0.18, z: 0.02, rz: 0.48,  rShelf: 1, mat: paperMat },
      { x: -0.5,  y: -0.7, z: 0.0,  rz: -0.32, rShelf: 0, mat: envMat },
      { x: 0.3,   y: -0.7, z: 0.03, rz: 0.12,  rShelf: 0, mat: paperMat },
      { x: -0.15, y: 0.9,  z: 0.0,  rz: -0.1,  rShelf: 2, mat: envMat },
      { x: 0.55,  y: 0.9,  z: 0.02, rz: 0.3,   rShelf: 2, mat: paperMat },
    ]
    lConfigs.forEach(c => {
      const geo = new THREE.BoxGeometry(0.72, 0.52, 0.024)
      const letter = new THREE.Mesh(geo, c.mat)
      letter.position.set(c.x, c.y, c.z)
      letter.rotation.z = c.rz
      lettersGroup.add(letter)
    })

    // ── Floor shadow plane ──
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ color: 0xD9CEAD, roughness: 0.98, metalness: 0.02 })
    )
    floor.rotation.x = -Math.PI / 2; floor.position.y = -3.8
    floor.receiveShadow = true; scene.add(floor)

    // ── Ambient dust particles ──
    const pGeo = new THREE.BufferGeometry()
    const pN = 180, pPos = new Float32Array(pN * 3)
    for (let i = 0; i < pN; i++) {
      pPos[i * 3]     = (Math.random() - 0.5) * 20
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 12
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 14
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0xB8832A, size: 0.025, transparent: true, opacity: 0.35
    })))

    // ── Clock ──
    s.clock = new THREE.Clock()

    // ── Animate loop ──
    const animate = () => {
      s.frameId = requestAnimationFrame(animate)
      const t = s.clock.getElapsedTime()

      if (s.animPhase === 'idle') {
        vaultGroup.position.y = Math.sin(t * 0.55) * 0.06
        vaultGroup.rotation.y = Math.sin(t * 0.25) * 0.04
        // Wheel slowly ticks
        wheelGroup.rotation.z = t * 0.06

      } else if (s.animPhase === 'spinning') {
        const el = t - s.phaseStart
        wheelGroup.rotation.z += 0.18
        if (el > 1.4) {
          s.animPhase = 'opening'
          s.phaseStart = t
        }

      } else if (s.animPhase === 'opening') {
        const el = t - s.phaseStart
        // Door swings open (hinge left)
        const prog = Math.min(el / 1.6, 1)
        const ease = 1 - Math.pow(1 - prog, 3)
        doorGroup.rotation.y = -ease * Math.PI * 0.78
        // Slow final wheel settle
        wheelGroup.rotation.z += Math.max(0.18 - el * 0.09, 0.01)
        // Inner glow builds
        innerGlow.intensity = Math.min(el * 1.8, 3.5)
        if (el > 1.8) {
          lettersGroup.visible = true
          s.animPhase = 'zooming'
          s.phaseStart = t
          s.cameraTargetZ = 5.8
          s.cameraTargetX = 0
        }

      } else if (s.animPhase === 'zooming') {
        const el = t - s.phaseStart
        s.cameraZ += (s.cameraTargetZ - s.cameraZ) * 0.04
        s.cameraX += (s.cameraTargetX - s.cameraX) * 0.04
        camera.position.z = s.cameraZ
        camera.position.x = s.cameraX
        camera.lookAt(0, 0, 0)
        // Letters bob subtly
        lettersGroup.children.forEach((l, i) => {
          l.position.y += Math.sin(t * 1.0 + i * 0.85) * 0.0006
        })
        if (el > 2.2) {
          s.animPhase = 'done'
          onVaultOpened()
        }

      } else if (s.animPhase === 'done') {
        // Gentle drift while inbox shows
        vaultGroup.position.y = Math.sin(t * 0.45) * 0.025
        innerGlow.intensity = 3.0 + Math.sin(t * 1.2) * 0.5
      }

      fill.intensity = 1.4 + Math.sin(t * 0.9) * 0.2
      renderer.render(scene, camera)
    }
    animate()

    // ── Resize ──
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
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [onVaultOpened])

  // Trigger vault open sequence
  useEffect(() => {
    const s = stateRef.current
    if (vaultOpen && s.animPhase === 'idle') {
      s.animPhase = 'spinning'
      s.phaseStart = s.clock.getElapsedTime()
    }
  }, [vaultOpen])

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
    />
  )
}
