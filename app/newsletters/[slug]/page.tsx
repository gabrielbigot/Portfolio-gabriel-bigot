import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Download } from "lucide-react"
import { newsletters, getNewsletter, formatNewsletterDate } from "@/lib/newsletters-data"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return newsletters.map((n) => ({ slug: n.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const newsletter = getNewsletter(slug)
  if (!newsletter) return {}
  return {
    title: `${newsletter.title} — Gabriel Bigot`,
    description: newsletter.description,
  }
}

export default async function NewsletterPage({ params }: Props) {
  const { slug } = await params
  const newsletter = getNewsletter(slug)
  if (!newsletter) notFound()

  const htmlUrl = `/newsletters/${slug}.html`
  const pdfUrl = `/newsletters/${slug}.pdf`

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Toolbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Left — back + title */}
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

          {/* Right — actions */}
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

      {/* iframe */}
      <div className="flex-1 w-full" style={{ height: "calc(100vh - 57px)" }}>
        <iframe
          src={htmlUrl}
          title={newsletter.title}
          className="w-full h-full border-0"
          loading="lazy"
        />
      </div>
    </div>
  )
}
