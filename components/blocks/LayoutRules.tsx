"use client"
// Mise en page (content/site/layout.json) : ordre, masquage, fond, espacements, largeur, alignement des sections de la page courante.
import { usePathname } from "next/navigation"

type Rule = { order?: number; hidden?: boolean; bg?: string; py?: string; width?: string; align?: string }
const BG: Record<string, string> = { card: "var(--card)", muted: "var(--muted)", accent: "var(--accent)", secondary: "var(--secondary)", foreground: "var(--foreground)" }
const PY: Record<string, string> = { none: "0", s: "1.5rem", m: "3rem", l: "5rem", xl: "8rem" }
const HEX = /^#[0-9a-fA-F]{3,8}$/

export function ruleCss(rules: Record<string, Rule> | undefined): string {
  if (!rules) return ""
  const entries = Object.entries(rules).filter(([sel]) => /^[#.\[\]\w:>\s="'()+-]+$/.test(sel))
  if (!entries.length) return ""
  let css = entries.some(([, r]) => typeof r.order === "number") ? "main{display:flex;flex-direction:column}" : ""
  for (const [sel, r] of entries) {
    const d: string[] = []
    if (typeof r.order === "number") d.push(`order:${Math.round(r.order)}`)
    if (r.hidden) d.push("display:none")
    const bg = r.bg && (BG[r.bg] || (HEX.test(r.bg) ? r.bg : "")); if (bg) d.push(`background:${bg}`, r.bg === "foreground" ? "color:var(--background)" : "")
    if (r.py && PY[r.py] !== undefined) d.push(`padding-top:${PY[r.py]}`, `padding-bottom:${PY[r.py]}`)
    if (r.width === "narrow") d.push("max-width:40rem", "margin-left:auto", "margin-right:auto", "width:100%")
    if (r.align === "center" || r.align === "left" || r.align === "right") d.push(`text-align:${r.align}`)
    if (d.filter(Boolean).length) css += `main > ${sel}{${d.filter(Boolean).map(x => x + " !important").join(";")}}`
  }
  return css
}

export default function LayoutRules({ all }: { all: Record<string, Record<string, Rule>> }) {
  const path = (usePathname() || "/").replace(/(.)\/$/, "$1")
  const css = ruleCss(all[path])
  return css ? <style id="layout-rules" dangerouslySetInnerHTML={{ __html: css }} /> : null
}
