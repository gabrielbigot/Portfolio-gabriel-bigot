"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { SCAR_PHOTO, SCAR_STAPLES } from "@/lib/scar-trace"

type Kind = "origin" | "rise" | "peak" | "rupture" | "rebuild"

const KIND: Record<Kind, { label: string; color: string }> = {
  origin: { label: "Origine", color: "var(--muted-foreground)" },
  rise: { label: "Progression", color: "#f59e0b" },
  peak: { label: "Sommet", color: "#f59e0b" },
  rupture: { label: "Épreuve", color: "#f87171" },
  rebuild: { label: "Retour", color: "#10b981" },
}

// Prototype copy: short teasers distilled from /about. One staple = one milestone.
const MILESTONES: { year: string; kind: Kind; title: string; text: string }[] = [
  { year: "2008", kind: "origin", title: "Un stick dans les mains", text: "Premières crosses au TAC Hockey, Le Touquet. Le début de tout." },
  { year: "Collège", kind: "rise", title: "Le talent, puis le brassard", text: "Mauvais perdant au départ, puis le talent, puis le brassard de capitaine." },
  { year: "U16", kind: "peak", title: "Intouchable", text: "L'impression de pouvoir faire ce que je voulais sur le terrain." },
  { year: "2019", kind: "rupture", title: "La première luxation", text: "Un entraînement banal, sans choc ni duel. En courant, le genou se dérobe." },
  { year: "2019 — 2020", kind: "rebuild", title: "Première rééducation, premier retour", text: "Reprendre pas à pas, jusqu'au retour sur le terrain." },
  { year: "2020 — 2022", kind: "rupture", title: "Les dislocations continuent", text: "Le lycée La Malassise, le bac, et des complications médicales qui assombrissent la période." },
  { year: "Oct. 2022", kind: "rupture", title: "L'opération, l'infection", text: "L'opération, puis deux staphylocoques. C'est de là que vient la cicatrice." },
  { year: "2023", kind: "rebuild", title: "Reconstruire, encore une fois", text: "Rééducation, reprise progressive et reconstruction de la confiance." },
  { year: "2026", kind: "peak", title: "Le TAC retrouve l'Élite", text: "1ère place de Nationale 1, 16 victoires en 18 matchs et 100 buts inscrits." },
]
const N = MILESTONES.length

// ---- scene: everything is drawn in the coordinate space of the original scar photo (2000 x 1500) ----
const VB_W = SCAR_PHOTO.width
const VB_H = SCAR_PHOTO.height
const TOTAL_STAPLES = SCAR_STAPLES.length
// Milestones sit on evenly spaced staples; the others are decorative
const MILESTONE_STAPLE = MILESTONES.map((_, i) => Math.round((i * (TOTAL_STAPLES - 1)) / (N - 1)))

// Rounded so server and client render identical attribute strings (avoids hydration mismatches)
const r2 = (n: number) => Math.round(n * 100) / 100

const rand = (seed: number) => {
  const v = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return v - Math.floor(v)
}

const STAPLES = SCAR_STAPLES.map(([hx, hy, fx, fy]) => ({ hx, hy, fx, fy, x: (hx + fx) / 2, y: (hy + fy) / 2 }))

// Smoothed centerline through the staples
const CENTER = STAPLES.map((s, i) => {
  const a = STAPLES[Math.max(0, i - 1)]
  const b = STAPLES[Math.min(TOTAL_STAPLES - 1, i + 1)]
  return i === 0 || i === TOTAL_STAPLES - 1 ? { x: s.x, y: s.y } : { x: (a.x + 2 * s.x + b.x) / 4, y: (a.y + 2 * s.y + b.y) / 4 }
})
const FIRST = CENTER[0]
const LAST = CENTER[TOTAL_STAPLES - 1]
const CHORD = Math.hypot(LAST.x - FIRST.x, LAST.y - FIRST.y)
const MID_X = (FIRST.x + LAST.x) / 2
const MID_Y = (FIRST.y + LAST.y) / 2
// Rotation that turns the scar (left to right in the photo) into a vertical line running top to bottom
const ROT_V = 90 - (Math.atan2(LAST.y - FIRST.y, LAST.x - FIRST.x) * 180) / Math.PI

// Scroll timeline (fractions of the section): overview, zoom on first staple, staples, outro (zoom out + reveal photo)
const INTRO_END = 0.08
const OUT = 0.86
const LABEL_OFFSET = 62

// Notes alternate on each side of the scar
const noteSide = (i: number) => (i % 2 === 0 ? "right" : "left")

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (t: number) => t * t * (3 - 2 * t)

const curve = (pts: { x: number; y: number }[]) => {
  let d = `M${r2(pts[0].x)} ${r2(pts[0].y)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    d += ` C${r2(p1.x + (p2.x - p0.x) / 6)} ${r2(p1.y + (p2.y - p0.y) / 6)} ${r2(p2.x - (p3.x - p1.x) / 6)} ${r2(p2.y - (p3.y - p1.y) / 6)} ${r2(p2.x)} ${r2(p2.y)}`
  }
  return d
}

export default function ScarTimeline() {
  const sectionRef = useRef<HTMLElement>(null)
  const cameraRef = useRef<SVGGElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const scarPhotoRef = useRef<SVGImageElement>(null)
  const decorRef = useRef<SVGGElement>(null)
  const ridgeRef = useRef<SVGGElement>(null)
  const decoStaplesRef = useRef<SVGGElement>(null)
  const labelsRef = useRef<SVGGElement>(null)
  const labelRefs = useRef<(SVGGElement | null)[]>([])
  const captionRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(-1)

  const { scarPath, hairs } = useMemo(() => {
    const ext = [
      { x: FIRST.x - 26, y: FIRST.y - 2 },
      ...CENTER,
      { x: LAST.x + 22, y: LAST.y - 6 },
    ]
    const hairs = Array.from({ length: 420 }, (_, i) => {
      const x = -250 + rand(i * 3 + 1) * 2500
      const y = 560 + rand(i * 3 + 2) * 650
      const len = 10 + rand(i * 3 + 3) * 16
      const a = (38 + (rand(i + 900) - 0.5) * 40) * (Math.PI / 180)
      return { x: r2(x), y: r2(y), dx: r2(Math.cos(a) * len), dy: r2(Math.sin(a) * len) }
    })
    return { scarPath: curve(ext), hairs }
  }, [])

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let ps = 0 // smoothed scroll progress
    let raf = 0
    let lastActive = -2
    const setOpacity = (el: Element | null, v: number) => {
      if (el) (el as HTMLElement | SVGElement).style.opacity = String(v)
    }

    const tick = () => {
      const section = sectionRef.current
      const group = cameraRef.current
      const svg = svgRef.current
      const title = titleRef.current
      if (section && group && svg && title) {
        const rect = section.getBoundingClientRect()
        const total = rect.height - window.innerHeight
        const raw = clamp(-rect.top / total)
        ps = reduce ? raw : lerp(ps, raw, 0.16)
        const p = ps
        const W = window.innerWidth
        const H = window.innerHeight
        const desktop = W >= 1024
        const base = Math.min(W / VB_W, H / VB_H) // screen px per scene unit at camera scale 1
        const zoom = (desktop ? 1.9 : 1.0) / base

        // whole scar visible at the start, taking 60% of the screen height
        const OVERVIEW = (H * 0.6) / (CHORD * base)
        setOpacity(title, 1 - smooth(clamp(p / (INTRO_END * 0.7))))

        // --- drawing: camera glides from staple to staple ---
        const f = clamp((p - INTRO_END) / (OUT - INTRO_END)) * (N - 1)
        const i0 = Math.floor(f)
        const i1 = Math.min(N - 1, i0 + 1)
        const k = smooth(f - i0)
        const a = STAPLES[MILESTONE_STAPLE[i0]]
        const b = STAPLES[MILESTONE_STAPLE[i1]]
        const px = lerp(a.x, b.x, k)
        const py = lerp(a.y, b.y, k)
        const last = STAPLES[MILESTONE_STAPLE[N - 1]]

        // where the focused staple sits on screen (px), converted to scene units
        const focusX = W / 2
        const focusY = desktop ? H / 2 : H * 0.36
        const toVbX = (sx: number) => VB_W / 2 + (sx - W / 2) / base
        const toVbY = (sy: number) => VB_H / 2 + (sy - H / 2) / base

        let s = OVERVIEW
        let rot = ROT_V
        let cx: number
        let cy: number
        let fx: number
        let fy: number
        let fade = 0
        let u = 0
        if (p <= OUT) {
          s = p <= INTRO_END ? lerp(OVERVIEW, zoom, smooth(p / INTRO_END)) : zoom
          const w = (s - OVERVIEW) / (zoom - OVERVIEW)
          cx = lerp(MID_X, px, w)
          cy = lerp(MID_Y, py, w)
          fx = lerp(VB_W / 2, toVbX(focusX), w)
          fy = lerp(VB_H / 2, toVbY(focusY), w)
        } else {
          // outro: zoom out to frame the whole original photo (kept upright, like the scar) and reveal it under the drawing
          u = clamp((p - OUT) / (1 - OUT))
          const su = smooth(u)
          const th = (ROT_V * Math.PI) / 180
          const boxW = VB_W * Math.abs(Math.cos(th)) + VB_H * Math.abs(Math.sin(th))
          const boxH = VB_W * Math.abs(Math.sin(th)) + VB_H * Math.abs(Math.cos(th))
          const fit = (Math.min(W / boxW, H / boxH) / base) * 0.86
          s = lerp(zoom, fit, su)
          cx = lerp(last.x, VB_W / 2, su)
          cy = lerp(last.y, VB_H / 2, su)
          fx = lerp(toVbX(focusX), VB_W / 2, su)
          fy = lerp(toVbY(focusY), VB_H / 2, su)
          fade = smooth(clamp((u - 0.1) / 0.6))
        }
        group.setAttribute("transform", `translate(${fx} ${fy}) rotate(${rot}) scale(${s}) translate(${-cx} ${-cy})`)

        setOpacity(scarPhotoRef.current, fade)
        setOpacity(decorRef.current, 1 - fade)
        setOpacity(ridgeRef.current, 1 - 0.85 * fade)
        setOpacity(decoStaplesRef.current, 1 - 0.6 * fade)
        setOpacity(labelsRef.current, 1 - smooth(clamp(u / 0.3)))
        setOpacity(captionRef.current, smooth(clamp((u - 0.75) / 0.25)))

        // keep the year labels upright while the scene rotates
        const rr = (rot * Math.PI) / 180
        labelRefs.current.forEach((el, i) => {
          if (!el) return
          const st = STAPLES[MILESTONE_STAPLE[i]]
          const sign = noteSide(i) === "right" ? 1 : -1 // label sits opposite to the note
          const ox = -sign * LABEL_OFFSET * Math.cos(rr)
          const oy = sign * LABEL_OFFSET * Math.sin(rr)
          el.setAttribute("transform", `translate(${st.x + ox} ${st.y + oy}) rotate(${-rot})`)
        })

        const next = p < INTRO_END * 0.95 ? -1 : p > OUT + 0.005 ? N : Math.round(f)
        if (next !== lastActive) {
          lastActive = next
          setActive(next)
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const goTo = (index: number) => {
    const section = sectionRef.current
    if (!section) return
    const total = section.offsetHeight - window.innerHeight
    const p = INTRO_END + (index / (N - 1)) * (OUT - INTRO_END)
    const top = section.getBoundingClientRect().top + window.scrollY + p * total
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" })
  }

  const current = active >= 0 && active < N ? MILESTONES[active] : null
  const currentKind = current ? KIND[current.kind] : null
  const activeStaple = active >= 0 && active < N ? MILESTONE_STAPLE[active] : -1

  const stapleEl = (i: number) => {
    const s = STAPLES[i]
    const m = MILESTONE_STAPLE.indexOf(i)
    const isMilestone = m >= 0
    const color = isMilestone ? KIND[MILESTONES[m].kind].color : "var(--foreground)"
    const isActive = i === activeStaple
    return (
      <g
        key={i}
        onClick={isMilestone ? () => goTo(m) : undefined}
        style={{ cursor: isMilestone ? "pointer" : "default" }}
        opacity={isMilestone ? 1 : 0.55}
      >
        {isMilestone && <circle cx={s.x} cy={s.y} r="40" fill="transparent" />}
        {isActive && (
          <circle cx={s.x} cy={s.y} r="30" fill="none" stroke={color} strokeWidth="1.6" opacity="0.8">
            <animate attributeName="r" values="24;36;24" dur="2.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.85;0.2;0.85" dur="2.6s" repeatCount="indefinite" />
          </circle>
        )}
        <line x1={s.hx} y1={s.hy} x2={s.fx} y2={s.fy} style={{ stroke: color }} strokeWidth={isMilestone ? 4 : 3.2} strokeLinecap="round" strokeOpacity={isMilestone ? 0.95 : 0.6} />
        <circle cx={s.hx} cy={s.hy} r="4" style={{ fill: "var(--background)", stroke: color }} strokeWidth="1.8" />
        <circle cx={s.fx} cy={s.fy} r="4" style={{ fill: "var(--background)", stroke: color }} strokeWidth="1.8" />
      </g>
    )
  }

  return (
    <div className="bg-background text-foreground">
      <section ref={sectionRef} style={{ height: `${(N + 4) * 85}vh` }} className="relative">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          {/* Back link */}
          <Link
            href="/"
            className="absolute left-5 top-5 z-30 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au portfolio</span>
          </Link>
          <div className="absolute right-5 top-5 z-30 text-[10px] font-mono tracking-[0.18em] uppercase text-muted-foreground">
            Prototype · la cicatrice
          </div>

          {/* The scar, drawn in the coordinate space of the original photo */}
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 h-full w-full"
            style={{ overflow: "visible" }}
            role="img"
            aria-label="Une cicatrice fermée par des agrafes, chacune marquant un moment de mon parcours"
          >
            <g ref={cameraRef}>
              {/* stylised skin and hair (fades out when the real photo appears) */}
              <g ref={decorRef}>
                <path
                  d="M-900 590 C 300 640, 1300 540, 2900 480 L 2900 1210 C 1500 1250, 600 1190, -900 1250 Z"
                  style={{ fill: "color-mix(in srgb, var(--foreground) 4%, transparent)", stroke: "var(--border)" }}
                  strokeWidth="2"
                />
                {hairs.map((h, i) => (
                  <line
                    key={i}
                    x1={h.x}
                    y1={h.y}
                    x2={h.x + h.dx}
                    y2={h.y + h.dy}
                    style={{ stroke: "var(--foreground)" }}
                    strokeOpacity="0.14"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                ))}
              </g>

              {/* the original photo, revealed at the very end; same coordinates as the drawing */}
              <image
                ref={scarPhotoRef}
                href={SCAR_PHOTO.src}
                x="0"
                y="0"
                width={VB_W}
                height={VB_H}
                preserveAspectRatio="none"
                style={{ opacity: 0 }}
              />

              {/* scar ridge */}
              <g ref={ridgeRef}>
                <path d={scarPath} fill="none" style={{ stroke: "var(--foreground)" }} strokeOpacity="0.28" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                <path d={scarPath} fill="none" style={{ stroke: "#f87171" }} strokeOpacity="0.16" strokeWidth="19" strokeLinecap="round" strokeLinejoin="round" />
                <path d={scarPath} fill="none" style={{ stroke: "var(--background)" }} strokeOpacity="0.7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </g>

              {/* staples: decorative first, milestones on top */}
              <g ref={decoStaplesRef}>{STAPLES.map((_, i) => (MILESTONE_STAPLE.includes(i) ? null : stapleEl(i)))}</g>
              <g>{MILESTONE_STAPLE.map((i) => stapleEl(i))}</g>

              {/* year labels (kept upright in the render loop) */}
              <g ref={labelsRef}>
                {MILESTONES.map((m, i) => (
                  <g key={i} ref={(el) => { labelRefs.current[i] = el }}>
                    <text
                      textAnchor={noteSide(i) === "right" ? "end" : "start"}
                      dominantBaseline="middle"
                      className="font-mono"
                      fontSize="12.5"
                      letterSpacing="1.2"
                      style={{ fill: "var(--muted-foreground)", transition: "opacity .4s" }}
                      opacity={active === -1 || active === i ? 1 : 0.35}
                    >
                      {m.year.toUpperCase()}
                    </text>
                  </g>
                ))}
              </g>
            </g>
          </svg>

          {/* Intro title, beside the photo */}
          <div
            ref={titleRef}
            className="pointer-events-none absolute z-20 inset-x-6 top-[11%] text-center lg:inset-x-auto lg:left-[4vw] lg:top-1/2 lg:-translate-y-1/2 lg:w-[17rem] lg:text-left"
          >
            <div className="text-sm text-muted-foreground font-mono tracking-wider">MON HISTOIRE, AGRAFE PAR AGRAFE</div>
            <h1 className="font-editorial mt-4 text-4xl sm:text-5xl lg:text-[2.5rem] leading-[1.05]">Une cicatrice, neuf repères</h1>
            <p className="mt-4 text-muted-foreground">Scrolle pour suivre la cicatrice.</p>
          </div>

          {/* Outro caption */}
          <div
            ref={captionRef}
            className="pointer-events-none absolute z-20 inset-x-6 bottom-5 text-center text-xs font-mono tracking-[0.18em] uppercase text-muted-foreground"
            style={{ opacity: 0 }}
          >
            Le dessin, posé sur la vraie cicatrice
          </div>

          {/* Milestone note: a hairline links it to the active staple (desktop) */}
          {current && currentKind && (
            <div
              key={`line-${active}`}
              className="animate-fade-in-up pointer-events-none absolute top-1/2 z-10 hidden h-px lg:block"
              style={{
                background: currentKind.color,
                opacity: 0.45,
                ...(noteSide(active) === "right"
                  ? { left: "calc(50% + 70px)", right: "calc(6vw + 26rem)" }
                  : { right: "calc(50% + 70px)", left: "calc(6vw + 26rem)" }),
              }}
            />
          )}
          {current && currentKind && (
            <div
              key={active}
              className={`animate-fade-in-up absolute z-20 inset-x-4 bottom-6 lg:inset-x-auto lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:w-[26rem] ${
                noteSide(active) === "right" ? "lg:right-[6vw]" : "lg:left-[6vw]"
              }`}
            >
              <div className="rounded-lg border bg-background/75 backdrop-blur-md p-6 sm:p-7" style={{ borderColor: `color-mix(in srgb, ${currentKind.color} 35%, var(--border))` }}>
                <div className="flex items-baseline justify-between gap-4">
                  <div className="text-base text-muted-foreground">{current.year}</div>
                  <div className="text-xs font-mono" style={{ color: currentKind.color }}>
                    {currentKind.label.toUpperCase()}
                  </div>
                </div>
                <h2 className="font-editorial mt-3 text-2xl sm:text-3xl leading-tight">{current.title}</h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">{current.text}</p>

                <div className="mt-6 flex items-center gap-1.5" role="tablist" aria-label="Jalons">
                  {MILESTONES.map((m, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-label={`${m.year} — ${m.title}`}
                      aria-current={i === active}
                      className="h-4 flex-1 flex items-center group"
                    >
                      <span
                        className="block h-px w-full transition-all duration-300 group-hover:h-[3px]"
                        style={{ background: i === active ? currentKind.color : "var(--border)", height: i === active ? 3 : undefined }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
