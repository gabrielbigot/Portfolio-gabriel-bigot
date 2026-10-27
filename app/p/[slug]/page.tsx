import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getContent } from "@/lib/site-content"
import Block, { type BlockData } from "@/components/blocks/Block"
import { stripDeep } from "@/lib/studio/stega"

type Page = { slug: string; title: string; description?: string; blocks: BlockData[] }
const load = async () => ((await getContent("pages")) as { pages: Page[] }).pages

export async function generateStaticParams() { return (await load()).map(p => ({ slug: p.slug })) }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const p = (await load()).find(x => x.slug === slug); if (!p) return { title: "Page introuvable" }
  return stripDeep({ title: `${p.title} — Gabriel Bigot`, description: p.description || undefined })
}

// Pages créées depuis l'éditeur : /p/<identifiant>. Le contenu vient de content/site/pages.json.
export default async function CustomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const page = (await load()).find(x => x.slug === slug); if (!page) notFound()
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-4"><Link href="/portfolio" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300"><ArrowLeft className="w-4 h-4" /><span>Retour</span></Link></div>
      </nav>
      <main className="max-w-5xl mx-auto px-6 sm:px-8 py-8 sm:py-16">
        {page.blocks.map(b => <Block key={b.id} block={b} />)}
      </main>
    </div>
  )
}
