import { blogPosts, companies, projects } from "./data"
import { projectTranslationsEn } from "./project-translations-en"

export type FilKind = "origin" | "experience" | "project" | "essay"
export type FilLocale = "fr" | "en"

export type FilItem = {
  id: string
  kind: FilKind
  /** YYYY-MM */
  date: string
  year: string
  /** Human date, already formatted on the server so client and server render the same text. */
  when: string
  label: string
  sub?: string
  href: string
  image?: string
  blurb?: string
  featured?: boolean
  /** Experiences only: "avr. 2026 → mai 2026". */
  range?: string
}

export const FIL_KIND: Record<FilKind, { label: Record<FilLocale, string>; plural: Record<FilLocale, string>; color: string }> = {
  origin: { label: { fr: "Origine", en: "Origin" }, plural: { fr: "Origine", en: "Origin" }, color: "var(--muted-foreground)" },
  experience: { label: { fr: "Expérience", en: "Experience" }, plural: { fr: "Parcours", en: "Career" }, color: "#10b981" },
  project: { label: { fr: "Projet", en: "Project" }, plural: { fr: "Projets", en: "Projects" }, color: "#f59e0b" },
  essay: { label: { fr: "Essai", en: "Essay" }, plural: { fr: "Essais", en: "Essays" }, color: "#818cf8" },
}

const KIND_ORDER: Record<FilKind, number> = { origin: 0, experience: 1, project: 2, essay: 3 }

const formatWhen = (date: string, locale: FilLocale) => {
  const [y, m] = date.split("-").map(Number)
  return new Date(Date.UTC(y, (m || 1) - 1, 1)).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
}

const month = (d: string) => d.slice(0, 7)

/**
 * One chronological list built from the existing content (companies, projects, essays).
 * Nothing is duplicated: adding a dated entry in lib/data.ts makes it appear on the thread.
 */
export function buildFil(locale: FilLocale): FilItem[] {
  const prefix = locale === "en" ? "/en" : ""
  const items: Omit<FilItem, "year" | "when">[] = []

  items.push({
    id: "origin",
    kind: "origin",
    date: "2008-01",
    label: locale === "fr" ? "L'origine" : "The origin",
    sub: locale === "fr" ? "Hockey, chutes, retours : d'où vient ce parcours" : "Hockey, falls, comebacks: where this path comes from",
    href: `${prefix}/about`,
  })

  for (const c of companies) {
    items.push({
      id: `experience:${c.slug}`,
      kind: "experience",
      date: month(c.startDate),
      label: c.company,
      sub: c.position,
      blurb: (c as { shortDescription?: string }).shortDescription || undefined,
      range: `${formatWhen(month(c.startDate), locale)} → ${
        (c as { current?: boolean }).current || !(c as { endDate?: string }).endDate
          ? locale === "fr" ? "présent" : "present"
          : formatWhen(month((c as { endDate: string }).endDate), locale)
      }`,
      // The English site only has the list of experiences, not detail pages.
      href: locale === "en" ? "/en/work" : `/work/${c.slug}`,
    })
  }

  for (const p of projects) {
    const en = (projectTranslationsEn as Record<string, { title?: string; shortDescription?: string }>)[p.slug]
    items.push({
      id: `project:${p.slug}`,
      kind: "project",
      date: month(p.date),
      label: locale === "en" && en?.title ? en.title : p.title,
      sub: p.company || p.category,
      href: `${prefix}/projects/${p.slug}`,
      image: (p as { image?: string }).image || undefined,
      blurb: (locale === "en" ? (en as { shortDescription?: string } | undefined)?.shortDescription : undefined) || (p as { shortDescription?: string }).shortDescription || undefined,
      featured: Boolean((p as { featured?: boolean }).featured),
    })
  }

  for (const b of blogPosts) {
    if (!b.published) continue
    items.push({
      id: `essay:${b.slug}`,
      kind: "essay",
      date: month(b.date),
      label: b.title,
      sub: b.category,
      blurb: (b as { excerpt?: string }).excerpt || undefined,
      // Essays are only written in French.
      href: `/blog/${b.slug}`,
    })
  }

  return items
    .sort((a, b) => a.date.localeCompare(b.date) || KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || a.label.localeCompare(b.label))
    .map((it) => ({ ...it, year: it.date.slice(0, 4), when: formatWhen(it.date, locale) }))
}
