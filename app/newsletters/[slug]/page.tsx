import fs from "fs"
import path from "path"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Download } from "lucide-react"
import { getNewsletters, getNewsletter, formatNewsletterDate } from "@/lib/newsletters-data"
import { NewsletterViewer } from "@/components/NewsletterViewer"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getNewsletters().map((n) => ({ slug: n.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const newsletter = getNewsletter(slug)
  if (!newsletter) return {}
  return {
    title: `${newsletter.title} — Gabriel Bigot`,
  }
}

function parseNewsletter(slug: string): { styles: string; body: string } | null {
  const htmlPath = path.join(process.cwd(), "public", "newsletters", `${slug}.html`)
  try {
    const raw = fs.readFileSync(htmlPath, "utf-8")

    // Extract all <style> blocks
    const styleMatches = [...raw.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    const styles = styleMatches.map((m) => m[1]).join("\n")

    // Extract <body> content (strip scripts for safety)
    const bodyMatch = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i)
    const raw_body = bodyMatch ? bodyMatch[1] : raw
    const body = raw_body.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ""
    )

    return { styles, body }
  } catch {
    return null
  }
}

export default async function NewsletterPage({ params }: Props) {
  const { slug } = await params
  const newsletter = getNewsletter(slug)
  if (!newsletter) notFound()

  const parsed = parseNewsletter(slug)
  if (!parsed) notFound()

  const htmlUrl = `/newsletters/${slug}.html`
  const pdfUrl = `/newsletters/${slug}.pdf`

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Toolbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href="/newsletters"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Toutes les éditions</span>
            </Link>
            <div className="hidden sm:block w-px h-4 bg-border" />
            <div className="min-w-0">
              <span className="text-sm font-medium truncate block">{newsletter.title}</span>
              <span className="text-xs text-muted-foreground">
                {formatNewsletterDate(newsletter.date)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground border border-border rounded-lg hover:text-foreground hover:border-muted-foreground/50 transition-all duration-200"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ouvrir</span>
            </a>
            {newsletter.hasPdf && (
              <a
                href={pdfUrl}
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-200"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PDF</span>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Newsletter content rendered inline */}
      <NewsletterViewer
        styles={parsed.styles}
        body={parsed.body}
        title={newsletter.title}
      />
    </div>
  )
}
