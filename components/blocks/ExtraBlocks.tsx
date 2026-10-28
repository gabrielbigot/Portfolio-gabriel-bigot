import { getContent } from "@/lib/site-content"
import Block, { type BlockData } from "@/components/blocks/Block"

/** Sections ajoutées à une page existante (content/site/pages.json › extras). À placer dans <main> : elles deviennent des blocs comme les autres. */
export default async function ExtraBlocks({ page }: { page: string }) {
  const pages = (await getContent("pages")) as { extras?: Record<string, BlockData[]> }
  const list = pages.extras?.[page] || []
  return <>{list.map(b => <Block key={b.id} block={b} />)}</>
}
