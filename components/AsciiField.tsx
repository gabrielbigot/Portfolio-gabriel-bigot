"use client"

import { useEffect, useRef } from "react"

/**
 * Champ vivant en ASCII : une réaction-diffusion (Gray-Scott) qui pousse comme une colonie.
 * Les bords sont organiques ( . , : ), les cœurs denses sont « machine » ( 1 # 0 ).
 * Le curseur ensemence la croissance sans la contrôler : il l'infléchit, elle continue seule.
 */

const GLYPHS = ".,:;~+1#0"
const CELL_W = 9
const CELL_H = 16
const FONT = `12px ui-monospace, "SF Mono", Menlo, monospace`

// Karl Sims : diffusion de U et V, alimentation F, retrait k (régime « corail »)
const DU = 1
const DV = 0.5
const K = 0.062

// fondu vers le bas, et plus discret à gauche, là où se trouve le texte
const MASK = "linear-gradient(to bottom, black 45%, transparent 100%), linear-gradient(to right, rgba(0,0,0,0.18), black 70%)"

const COLONY = { feed: 0.054, k: 0.062 }

type Field = { cols: number; rows: number; u: Float32Array; v: Float32Array; nu: Float32Array; nv: Float32Array }

function createField(cols: number, rows: number): Field {
  const size = cols * rows
  const field: Field = {
    cols,
    rows,
    u: new Float32Array(size).fill(1),
    v: new Float32Array(size),
    nu: new Float32Array(size),
    nv: new Float32Array(size),
  }
  const seeds = Math.max(4, Math.round(size / 600))
  for (let i = 0; i < seeds; i++) {
    seed(field, Math.random() * cols, Math.random() * rows, 2 + Math.random() * 2)
  }
  return field
}

function seed(f: Field, cx: number, cy: number, radius: number) {
  const r = Math.ceil(radius)
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy > radius * radius) continue
      const x = (Math.round(cx) + dx + f.cols) % f.cols
      const y = (Math.round(cy) + dy + f.rows) % f.rows
      const i = y * f.cols + x
      f.u[i] = 0.5
      f.v[i] = 0.25 + Math.random() * 0.1
    }
  }
}

function step(f: Field, feed: number) {
  const { cols, rows, u, v, nu, nv } = f
  for (let y = 0; y < rows; y++) {
    const up = ((y - 1 + rows) % rows) * cols
    const mid = y * cols
    const down = ((y + 1) % rows) * cols
    for (let x = 0; x < cols; x++) {
      const l = (x - 1 + cols) % cols
      const r = (x + 1) % cols
      const i = mid + x
      const lapU = -u[i] + 0.2 * (u[mid + l] + u[mid + r] + u[up + x] + u[down + x]) + 0.05 * (u[up + l] + u[up + r] + u[down + l] + u[down + r])
      const lapV = -v[i] + 0.2 * (v[mid + l] + v[mid + r] + v[up + x] + v[down + x]) + 0.05 * (v[up + l] + v[up + r] + v[down + l] + v[down + r])
      const uvv = u[i] * v[i] * v[i]
      const a = u[i] + DU * lapU - uvv + feed * (1 - u[i])
      const b = v[i] + DV * lapV + uvv - (feed + K) * v[i]
      nu[i] = a < 0 ? 0 : a > 1 ? 1 : a
      nv[i] = b < 0 ? 0 : b > 1 ? 1 : b
    }
  }
  f.u = nu
  f.v = nv
  f.nu = u
  f.nv = v
}

// Apparition du titre : les lettres de #hero-title se forment en caractères « machine », puis se dissolvent dans le champ pendant que le vrai titre apparaît
const INTRO_GLYPHS = "01#1@0"
const INTRO_HOLD = 1100 // ms avant la dissolution
const LENS_RADIUS = 7 // cellules

export default function AsciiField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const introRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const isSmall = window.matchMedia("(max-width: 640px)").matches
    const animated = !reduceMotion && !isSmall

    let field = createField(1, 1)
    let levels = new Uint8Array(0)
    let raf = 0
    let frame = 0
    let color = "#000"
    let lastTick = 0
    let heroProgress = 0
    let lastW = 0
    let lastH = 0
    let last: { x: number; y: number } | null = null
    const lens = { x: 0, y: 0, s: 0 } // loupe : les caractères se précisent autour du curseur, puis la loupe s'éteint
    let introAbort = false

    const onScroll = () => {
      heroProgress = Math.min(1, window.scrollY / window.innerHeight)
      canvas.style.opacity = String(1 - 0.65 * heroProgress)
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      // la barre d'adresse mobile change la hauteur au scroll : on ne réinitialise pas pour si peu
      if (lastW && rect.width === lastW && Math.abs(rect.height - lastH) < 120) return
      lastW = rect.width
      lastH = rect.height
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const cols = Math.max(8, Math.floor(rect.width / CELL_W))
      const rows = Math.max(8, Math.floor(rect.height / CELL_H))
      field = createField(cols, rows)
      levels = new Uint8Array(cols * rows)
      for (let i = 0; i < 260; i++) step(field, COLONY.feed)
      draw()
    }

    const draw = () => {
      color = getComputedStyle(canvas).color
      const { cols, rows, v } = field
      const rect = canvas.getBoundingClientRect()
      const offX = (rect.width - cols * CELL_W) / 2
      ctx.clearRect(0, 0, rect.width, rect.height)
      ctx.font = FONT
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = color
      for (let i = 0; i < v.length; i++) {
        const value = v[i]
        levels[i] = value < 0.03 ? 0 : 1 + Math.floor(Math.min(1, (value - 0.03) / 0.35) * 8.99)
      }
      if (lens.s > 0.02) {
        const x0 = Math.max(0, Math.floor(lens.x - LENS_RADIUS)), x1 = Math.min(cols - 1, Math.ceil(lens.x + LENS_RADIUS))
        const y0 = Math.max(0, Math.floor(lens.y - LENS_RADIUS)), y1 = Math.min(rows - 1, Math.ceil(lens.y + LENS_RADIUS))
        for (let y = y0; y <= y1; y++) {
          for (let x = x0; x <= x1; x++) {
            const d = Math.hypot((x - lens.x) * (CELL_W / CELL_H), y - lens.y) / LENS_RADIUS * (CELL_H / CELL_W)
            if (d >= 1) continue
            const i = y * cols + x
            levels[i] = Math.min(GLYPHS.length, levels[i] + Math.round(lens.s * (1 - d) * 6))
          }
        }
      }
      for (let level = 1; level <= GLYPHS.length; level++) {
        ctx.globalAlpha = 0.25 + (0.75 * level) / GLYPHS.length
        const glyph = GLYPHS[level - 1]
        for (let i = 0; i < levels.length; i++) {
          if (levels[i] !== level) continue
          const x = i % cols
          const y = (i / cols) | 0
          ctx.fillText(glyph, offX + x * CELL_W + CELL_W / 2, y * CELL_H + CELL_H / 2)
        }
      }
      ctx.globalAlpha = 1
    }

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (document.hidden || now - lastTick < 50) return
      lastTick = now
      frame++
      lens.s *= 0.94
      const feed = COLONY.feed + 0.003 * Math.sin(frame / 160)
      for (let i = 0; i < 5; i++) step(field, feed)
      if (frame % 120 === 0) {
        let sum = 0
        for (let i = 0; i < field.v.length; i += 7) sum += field.v[i]
        if (sum < field.v.length * 0.004) seed(field, Math.random() * field.cols, Math.random() * field.rows, 3)
      }
      draw()
    }

    // traînée : on ensemence le long du trajet du curseur, la colonie pousse ensuite toute seule (accueil uniquement)
    const onPointer = (event: PointerEvent) => {
      if (heroProgress > 0.8) {
        last = null
        return
      }
      const rect = canvas.getBoundingClientRect()
      const x = (event.clientX - rect.left - (rect.width - field.cols * CELL_W) / 2) / CELL_W
      const y = (event.clientY - rect.top) / CELL_H
      lens.x = x
      lens.y = y
      lens.s = 1
      const from = last ?? { x, y }
      const dist = Math.hypot(x - from.x, y - from.y)
      const n = Math.max(1, Math.ceil(dist / 1.5))
      for (let i = 1; i <= n; i++) seed(field, from.x + ((x - from.x) * i) / n, from.y + ((y - from.y) * i) / n, 1.4)
      last = { x, y }
    }

    // masque des lettres du titre, en cellules de la grille
    const buildTitleMask = (): Uint8Array | null => {
      const el = document.getElementById("hero-title")
      if (!el) return null
      const rect = canvas.getBoundingClientRect()
      const off = document.createElement("canvas")
      off.width = Math.ceil(rect.width)
      off.height = Math.ceil(rect.height)
      const c = off.getContext("2d", { willReadFrequently: true })
      if (!c) return null
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
      let node: Node | null
      while ((node = walker.nextNode())) {
        const text = node.textContent?.trim()
        if (!text || !node.parentElement) continue
        const range = document.createRange()
        range.selectNodeContents(node)
        const r = range.getBoundingClientRect()
        const cs = getComputedStyle(node.parentElement)
        c.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
        c.fillStyle = c.strokeStyle = "#000"
        c.lineJoin = "round"
        c.lineWidth = parseFloat(cs.fontSize) * 0.07
        const ascent = c.measureText(text).fontBoundingBoxAscent
        const x = r.left - rect.left
        const y = r.top - rect.top + ascent
        c.strokeText(text, x, y)
        c.fillText(text, x, y)
      }
      const { cols, rows } = field
      const offX = (rect.width - cols * CELL_W) / 2
      const data = c.getImageData(0, 0, off.width, off.height).data
      const mask = new Uint8Array(cols * rows)
      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          let hit = 0
          for (let sy = 0; sy < 4; sy++) {
            for (let sx = 0; sx < 3; sx++) {
              const px = Math.floor(offX + cx * CELL_W + ((sx + 0.5) / 3) * CELL_W)
              const py = Math.floor(cy * CELL_H + ((sy + 0.5) / 4) * CELL_H)
              if (px >= 0 && py >= 0 && px < off.width && py < off.height && data[(py * off.width + px) * 4 + 3] > 128) hit++
            }
          }
          if (hit >= 4) mask[cy * cols + cx] = 1
        }
      }
      return mask
    }

    const runIntro = () => {
      const ic = introRef.current
      const ictx = ic?.getContext("2d")
      if (!ic || !ictx) return
      const mask = buildTitleMask()
      if (!mask) return
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      ic.width = Math.round(rect.width * dpr)
      ic.height = Math.round(rect.height * dpr)
      ictx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const { cols } = field
      const offX = (rect.width - cols * CELL_W) / 2
      const cells: { x: number; y: number; appear: number; dissolve: number; seed: number }[] = []
      for (let i = 0; i < mask.length; i++) {
        if (!mask[i]) continue
        const r = Math.random()
        cells.push({ x: i % cols, y: (i / cols) | 0, appear: r * 600, dissolve: INTRO_HOLD + (1 - Math.random()) * 800, seed: (Math.random() * 6) | 0 })
      }
      const start = performance.now()
      const loop = (now: number) => {
        const t = now - start
        if (introAbort || t > INTRO_HOLD + 1100) {
          ictx.clearRect(0, 0, rect.width, rect.height)
          return
        }
        ictx.clearRect(0, 0, rect.width, rect.height)
        ictx.font = FONT
        ictx.textAlign = "center"
        ictx.textBaseline = "middle"
        ictx.fillStyle = getComputedStyle(ic).color
        for (const c of cells) {
          if (t < c.appear) continue
          const alpha = t < c.dissolve ? 0.85 : 0.85 * Math.max(0, 1 - (t - c.dissolve) / 280)
          if (alpha <= 0) continue
          ictx.globalAlpha = alpha
          ictx.fillText(INTRO_GLYPHS[(c.seed + Math.floor(t / 110)) % INTRO_GLYPHS.length], offX + c.x * CELL_W + CELL_W / 2, c.y * CELL_H + CELL_H / 2)
        }
        requestAnimationFrame(loop)
      }
      requestAnimationFrame(loop)
    }

    resize()
    if (!reduceMotion && "fonts" in document) document.fonts.ready.then(() => !introAbort && runIntro())
    let resizeTimer = 0
    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(resize, 200)
    }
    window.addEventListener("resize", onResize)
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()


    if (animated) {
      window.addEventListener("pointermove", onPointer, { passive: true })
      raf = requestAnimationFrame(tick)
    }

    return () => {
      introAbort = true
      cancelAnimationFrame(raf)
      window.clearTimeout(resizeTimer)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("pointermove", onPointer)
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  return (
    <>
    <canvas ref={introRef} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-0 h-screen w-full text-foreground" />
    <div aria-hidden="true" className={`pointer-events-none ${className}`}>
      <canvas
        ref={canvasRef}
        className="h-full w-full text-foreground"
        style={{
          maskImage: MASK,
          WebkitMaskImage: MASK,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />
    </div>
    </>
  )
}
