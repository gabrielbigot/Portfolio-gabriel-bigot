"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ArrowRight, Eye, EyeOff } from "lucide-react"
import { SC, SCAR_PTS, spline } from "@/lib/scar-geometry"
import { STORY_KIND, type StoryLocale, type StoryMilestone } from "@/lib/scar-story"

// Camera tuning
const INTRO = 0.08
const OUTRO = 0.94
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (t: number) => t * t * (3 - 2 * t)

type Props = {
  locale: StoryLocale
  /** The real photo of the scar. */
  photo: string
  milestones: StoryMilestone[]
  kicker: string
  title: string
  intro: string
  hint: string
  more: string
  storyHref: string
  /** Height in px of the fixed bar above the scene. */
  offset: number
  theme: "dark" | "light"
  softLabel: string
  sharpLabel: string
  tabsLabel: string
}

/**
 * Chapter 1: the camera travels along the real scar, staple by staple, and the story is read on it.
 * The photo is the inverted version, desaturated, and softened by default (a button shows it sharp).
 */
export default function ScarJourney({ locale, photo, milestones, kicker, title, intro, hint, more, storyHref, offset, theme, softLabel, sharpLabel, tabsLabel }: Props) {
  const N = milestones.length
  const sectionRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState<{ vw: number; vh: number } | null>(null)
  const [active, setActive] = useState(-1)
  const [soft, setSoft] = useState(true)

  useEffect(() => {
    try {
      if (localStorage.getItem("scar-soft") === "0") setSoft(false)
    } catch {}
  }, [])
  const toggleSoft = () => {
    const next = !soft
    setSoft(next)
    try {
      localStorage.setItem("scar-soft", next ? "1" : "0")
    } catch {}
  }

  // size of the pinned viewport
  useEffect(() => {
    const el = stickyRef.current
    if (!el) return
    const update = () => setBox({ vw: el.clientWidth, vh: el.clientHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const desktop = box ? box.vw >= 1024 : true
  const sw = box ? (desktop ? box.vw : box.vw * 1.6) : 0
  const sh = sw * 0.75

  // one stop per milestone, evenly spread along the real scar
  const stops = useMemo(() => {
    const dense = spline(SCAR_PTS)
    let total = 0
    const cum = dense.map((p, i) => {
      if (i > 0) total += Math.hypot(p.x - dense[i - 1].x, p.y - dense[i - 1].y)
      return total
    })
    return Array.from({ length: N }, (_, k) => {
      const target = total * (0.025 + (0.95 * k) / Math.max(1, N - 1))
      let i = 1
      while (i < dense.length - 1 && cum[i] < target) i++
      return { x: Math.round(dense[i].x * 10) / 10, y: Math.round(dense[i].y * 10) / 10 }
    })
  }, [N])

  // ---- the camera ----
  useEffect(() => {
    const section = sectionRef.current
    if (!section || !box || !sw) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const cam = { px: SC.cx * sw, py: SC.cy * sh, fx: box.vw / 2, fy: box.vh / 2, s: 1 }
    let raf = 0
    let running = false
    let last = -2

    const tick = () => {
      const stage = stageRef.current
      const sticky = stickyRef.current
      if (!stage || !sticky) return
      const rect = section.getBoundingClientRect()
      const total = rect.height - sticky.offsetHeight
      const p = clamp((offset - rect.top) / total)
      const zoom = desktop ? 3.1 : 3.0

      const f = clamp((p - INTRO) / (OUTRO - INTRO)) * (N - 1)
      const i0 = Math.floor(f)
      const i1 = Math.min(N - 1, i0 + 1)
      const k = smooth(f - i0)
      const wp = (q: { x: number; y: number }) => ({ x: (q.x / 900) * sw, y: (q.y / 675) * sh })
      const a = wp(stops[i0])
      const b = wp(stops[i1])
      const px = lerp(a.x, b.x, k)
      const py = lerp(a.y, b.y, k)

      let s = zoom
      if (p < INTRO) s = lerp(1, zoom, smooth(p / INTRO))
      else if (p > OUTRO) s = lerp(zoom, 1, smooth((p - OUTRO) / (1 - OUTRO)))
      const w = clamp((s - 1) / (zoom - 1))

      const target = {
        px: lerp(SC.cx * sw, px, w),
        py: lerp(SC.cy * sh, py, w),
        fx: lerp(box.vw / 2, desktop ? box.vw * 0.34 : box.vw / 2, w),
        fy: lerp(box.vh / 2, desktop ? box.vh / 2 : box.vh * 0.34, w),
        s,
      }
      const e = reduce ? 1 : 0.14
      ;(Object.keys(target) as (keyof typeof target)[]).forEach((key) => {
        cam[key] = lerp(cam[key], target[key], e)
      })
      stage.style.transform = `translate(${cam.fx}px, ${cam.fy}px) scale(${cam.s}) translate(${-cam.px}px, ${-cam.py}px)`

      const next = p < INTRO * 0.6 ? -1 : Math.round(f)
      if (next !== last) {
        last = next
        setActive(next)
      }
    }
    const loop = () => {
      tick()
      raf = requestAnimationFrame(loop)
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true
          raf = requestAnimationFrame(loop)
        } else if (!entry.isIntersecting && running) {
          running = false
          cancelAnimationFrame(raf)
        }
      },
      { rootMargin: "200px 0px" },
    )
    io.observe(section)
    tick()
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [box, sw, sh, stops, N, offset, desktop])

  const goTo = (index: number) => {
    const section = sectionRef.current
    const sticky = stickyRef.current
    if (!section || !sticky) return
    const total = section.offsetHeight - sticky.offsetHeight
    const p = INTRO + (index / (N - 1)) * (OUTRO - INTRO)
    const top = window.scrollY + section.getBoundingClientRect().top - offset + p * total
    window.scrollTo({ top, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })
  }

  const current = active >= 0 ? milestones[active] : null
  const kind = current ? STORY_KIND[current.kind] : null
  const imgFilter = `grayscale(1) ${theme === "dark" ? "brightness(.72) contrast(1.12)" : "contrast(1.05)"} ${soft ? "blur(1.15px)" : ""}`

  return (
    <section id="origine" ref={sectionRef} className="relative" style={{ height: `${(N + 2) * 78}vh` }}>
      {/* the full story as real text, for screen readers and search engines */}
      <ol className="sr-only">
        {milestones.map((m) => (
          <li key={m.year + m.title}>
            {m.year} — {m.title}. {m.text}
          </li>
        ))}
      </ol>

      <div ref={stickyRef} className="sticky overflow-hidden bg-background [contain:paint]" style={{ top: offset, height: `calc(100svh - ${offset}px)` }}>
        {/* the real scar */}
        <div ref={stageRef} aria-hidden="true" className="absolute left-0 top-0" style={{ width: sw, height: sh, transformOrigin: "0 0" }}>
          {sw > 0 && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" loading="lazy" decoding="async" draggable={false} className="absolute inset-0 h-full w-full select-none" style={{ filter: imgFilter, opacity: theme === "dark" ? 0.92 : 0.88, transition: "filter .5s" }} />
          )}
          {/* a ring on the staple that carries each moment of the story */}
          <svg viewBox="0 0 900 675" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" style={{ overflow: "visible" }}>
            {stops.map((st, i) => {
              const m = milestones[i]
              const c = STORY_KIND[m.kind].color
              const on = i === active
              return (
                <g key={i} transform={`translate(${st.x} ${st.y})`}>
                  <circle r={on ? 11 : 6} fill="none" stroke={c.startsWith("var(") ? "#d6d3d1" : c} strokeWidth={on ? 1.6 : 1} opacity={on ? 0.95 : 0.55} style={{ transition: "all .4s" }} />
                  {on && (
                    <circle r="11" fill="none" stroke={c.startsWith("var(") ? "#d6d3d1" : c} strokeWidth="0.8" opacity="0.7">
                      <animate attributeName="r" values="11;19;11" dur="2.6s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.7;0;0.7" dur="2.6s" repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        {/* blend the photo into the page */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 35%, var(--background) 100%)" }} />
        {desktop ? (
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-[58%]" style={{ background: "linear-gradient(to left, var(--background) 30%, color-mix(in srgb, var(--background) 70%, transparent) 62%, transparent)" }} />
        ) : (
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%]" style={{ background: "linear-gradient(to top, var(--background) 32%, color-mix(in srgb, var(--background) 75%, transparent) 64%, transparent)" }} />
        )}

        {/* soften / show */}
        <button
          type="button"
          onClick={toggleSoft}
          aria-pressed={!soft}
          className="absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 font-mono text-[11px] text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
        >
          {soft ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          {soft ? sharpLabel : softLabel}
        </button>

        {/* intro */}
        <div
          className="pointer-events-none absolute inset-x-0 top-[9%] z-10 px-6 text-center transition-all duration-700"
          style={{ opacity: active === -1 ? 1 : 0, transform: active === -1 ? "none" : "translateY(-14px)" }}
          aria-hidden={active !== -1}
        >
          <div className="font-mono text-xs tracking-[0.2em] text-muted-foreground sm:text-sm">{kicker}</div>
          <h2 className="font-editorial mx-auto mt-4 max-w-4xl text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">{title}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{intro}</p>
          <p className="mt-6 font-mono text-xs tracking-[0.2em] text-muted-foreground">{hint.toUpperCase()}</p>
        </div>

        {/* the story, written on the scene (no box) */}
        {current && kind && (
          <>
            {desktop && <div aria-hidden="true" className="pointer-events-none absolute z-10 h-px" style={{ left: `calc(34% + 40px)`, top: "50%", width: "21%", background: `linear-gradient(to right, ${kind.color.startsWith("var(") ? "#a8a29e" : kind.color}, transparent)` }} />}
            <div
              key={active}
              className="animate-fade-in-up absolute z-10 inset-x-6 bottom-8 lg:inset-x-auto lg:bottom-auto lg:right-[5vw] lg:top-1/2 lg:w-[min(30rem,36vw)] lg:-translate-y-1/2"
            >
              <div className="flex items-baseline gap-4 font-mono text-xs tracking-wider">
                <span className="text-lg font-light tracking-normal text-muted-foreground">{current.year}</span>
                <span style={{ color: kind.color }}>{kind.label[locale].toUpperCase()}</span>
              </div>
              <h3 className="font-editorial mt-3 text-4xl leading-[1.02] sm:text-5xl">{current.title}</h3>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-muted-foreground">{current.text}</p>
              {active === N - 1 && (
                <Link href={storyHref} className="mt-5 inline-flex items-center gap-2 text-sm transition-all duration-300 hover:gap-3">
                  {more} <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </>
        )}

        {/* the stops, clickable */}
        <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center px-6" role="tablist" aria-label={tabsLabel}>
          <div className="flex w-full max-w-md items-center gap-1.5">
            {milestones.map((m, i) => (
              <button key={i} type="button" onClick={() => goTo(i)} aria-label={`${m.year} — ${m.title}`} aria-current={i === active} className="group flex h-4 flex-1 items-center">
                <span className="block h-px w-full transition-all duration-300 group-hover:h-[3px]" style={{ background: i === active ? (kind?.color.startsWith("var(") ? "var(--foreground)" : kind?.color) : "var(--border)", height: i === active ? 3 : undefined }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
