import fs from "fs"
import path from "path"

export type Newsletter = {
  slug: string
  date: string
  title: string
  hasPdf: boolean
}

const NEWSLETTERS_DIR = path.join(process.cwd(), "public", "newsletters")

function parseDateFromSlug(slug: string): string {
  // Expects tribune-YYYY-MM-DD
  const match = slug.match(/(\d{4}-\d{2}-\d{2})/)
  return match ? match[1] : ""
}

function buildTitle(date: string): string {
  if (!date) return "Tribune IA"
  try {
    const formatted = new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    return `Tribune IA — ${formatted}`
  } catch {
    return `Tribune IA — ${date}`
  }
}

export function getNewsletters(): Newsletter[] {
  try {
    const files = fs.readdirSync(NEWSLETTERS_DIR)
    const htmlFiles = files.filter((f) => f.endsWith(".html"))
    const pdfSlugs = new Set(
      files.filter((f) => f.endsWith(".pdf")).map((f) => f.replace(".pdf", ""))
    )

    return htmlFiles
      .map((file) => {
        const slug = file.replace(".html", "")
        const date = parseDateFromSlug(slug)
        return {
          slug,
          date,
          title: buildTitle(date),
          hasPdf: pdfSlugs.has(slug),
        }
      })
      .filter((n) => n.date)
      .sort((a, b) => b.date.localeCompare(a.date))
  } catch {
    return []
  }
}

export function getNewsletter(slug: string): Newsletter | undefined {
  return getNewsletters().find((n) => n.slug === slug)
}

export function formatNewsletterDate(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  } catch {
    return isoDate
  }
}
