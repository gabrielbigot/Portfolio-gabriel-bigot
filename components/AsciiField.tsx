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

export default function AsciiField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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
      const from = last ?? { x, y }
      const dist = Math.hypot(x - from.x, y - from.y)
      const n = Math.max(1, Math.ceil(dist / 1.5))
      for (let i = 1; i <= n; i++) seed(field, from.x + ((x - from.x) * i) / n, from.y + ((y - from.y) * i) / n, 1.4)
      last = { x, y }
    }

    resize()
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
      cancelAnimationFrame(raf)
      window.clearTimeout(resizeTimer)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("pointermove", onPointer)
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  return (
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
  )
}
