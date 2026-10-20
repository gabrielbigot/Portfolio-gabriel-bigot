import type { Metadata } from "next"
import ScarPortfolio from "@/components/ScarPortfolio"
import { buildFil } from "@/lib/fil"
import { STORY_COPY } from "@/lib/scar-story"
import { personalInfo, skills, socialLinks } from "@/lib/data"

// Preview of the portfolio rebuilt around the scar. Not indexed, not linked: compare with the current home first.
export const metadata: Metadata = {
  title: "Gabriel Bigot | Portfolio (the scar)",
  robots: { index: false, follow: false },
}

export default function ScarPortfolioPage() {
  const groups = skills.technical.map((g) => ({ category: g.category, skills: g.skills.map((s) => s.name) }))
  const linkedin = socialLinks.find((l) => l.name === "LinkedIn")?.url
  return (
    <ScarPortfolio
      locale="en"
      copy={STORY_COPY.en}
      items={buildFil("en")}
      skills={groups}
      languages={skills.languages}
      cvUrl={personalInfo.cvUrl}
      linkedin={linkedin}
    />
  )
}
