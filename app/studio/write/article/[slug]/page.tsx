import { notFound } from "next/navigation"
import { studioEnabled } from "@/lib/studio/guard"
import ArticleWriter from "@/components/studio/ArticleWriter"

export const dynamic = "force-dynamic"

// Éditeur d'écriture d'un dossier (copie privée seulement).
export default async function WriteArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  if (!studioEnabled()) notFound()
  const { slug } = await params
  return <ArticleWriter slug={slug} />
}
