import { notFound } from "next/navigation"
import { studioEnabled } from "@/lib/studio/guard"
import { CONTENT } from "@/lib/site-content-registry"
import StudioApp from "@/components/studio/StudioApp"

export const dynamic = "force-dynamic"

// Studio d'édition du site. N'existe que sur la copie privée (STUDIO_MODE=1) : 404 partout ailleurs.
export default function StudioPage() {
  if (!studioEnabled()) notFound()
  return <StudioApp defs={CONTENT} />
}
