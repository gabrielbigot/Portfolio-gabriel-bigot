import type { Metadata } from "next"
import ScarTimeline from "@/components/ScarTimeline"

// Prototype: kept out of search engines and not linked from the site navigation.
export const metadata: Metadata = {
  title: "La cicatrice | Gabriel Bigot",
  robots: { index: false, follow: false },
}

export default function CicatricePage() {
  return <ScarTimeline />
}
