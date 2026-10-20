import type { Metadata } from "next"
import { existsSync } from "node:fs"
import { join } from "node:path"
import ScarPortfolio from "@/components/ScarPortfolio"
import { buildFil } from "@/lib/fil"
import { STORY_COPY } from "@/lib/scar-story"
import { personalInfo, skills, socialLinks } from "@/lib/data"

// Preview of the portfolio rebuilt around the scar. Not indexed, not linked: compare with the current home first.
export const metadata: Metadata = {
  title: "Gabriel Bigot | Portfolio (la cicatrice)",
  robots: { index: false, follow: false },
}

export default function ScarPortfolioPage() {
  const groups = skills.technical.map((g) => ({ category: g.category, skills: g.skills.map((s) => s.name) }))
  // Optional: very softly shown behind the hero when the file exists (public/cicatrice/scar.webp).
  const photo = existsSync(join(process.cwd(), "public", "cicatrice", "scar.webp")) ? "/cicatrice/scar.webp" : undefined
  const photoHd = existsSync(join(process.cwd(), "public", "cicatrice", "scar-hd.webp")) ? "/cicatrice/scar-hd.webp" : undefined
  const linkedin = socialLinks.find((l) => l.name === "LinkedIn")?.url
  return (
    <ScarPortfolio
      locale="fr"
      copy={STORY_COPY.fr}
      items={buildFil("fr")}
      skills={groups}
      languages={skills.languages}
      cvUrl={personalInfo.cvUrl}
      linkedin={linkedin}
      photo={photo}
      photoHd={photoHd}
    />
  )
}
