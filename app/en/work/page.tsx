import Link from "next/link"
import { ArrowLeft, ArrowRight, Briefcase, Calendar, MapPin } from "lucide-react"
import TechnologyGroups from "@/components/TechnologyGroups"

const companies = [
  {
    slug: "adn-potentiel-freelance-2026",
    company: "ADN POTENTIEL",
    type: "Freelance",
    position: "Freelance AI & Full-Stack Developer",
    location: "Remote, France",
    startDate: "April 2026",
    endDate: "May 2026",
    current: false,
    shortDescription: "Built a custom Next.js 16 web application replacing n8n + Notion, plus prospect enrichment workflows — my first paid mission based on AI and full-stack skills.",
    technologies: ["Next.js 16", "TypeScript", "Neon PostgreSQL", "Drizzle ORM", "Vercel", "OpenAI", "Anthropic"],
  },
  {
    slug: "adn-potentiel",
    company: "ADN POTENTIEL",
    type: "Internship",
    position: "Business Development & Digital Automation Assistant",
    location: "Remote — Lille, France",
    startDate: "January 2026",
    endDate: "February 2026",
    current: false,
    shortDescription: "Designed and deployed 3 production n8n workflows to transform business development through AI and API integrations.",
    technologies: ["n8n", "Notion", "OpenAI", "Google Gemini", "LinkedIn API", "Pappers API"],
  },
  {
    slug: "bigot-materiaux-2025",
    company: "BIGOT Materiaux",
    type: "Summer work",
    position: "HR/Accounting Assistant & Automation Developer",
    location: "Etaples, France",
    startDate: "July 2025",
    endDate: "September 2025",
    current: false,
    shortDescription: "Built strategic automations to optimize HR and accounting processes in the family-owned SME.",
    technologies: ["Python", "Flask", "Supabase", "Excel/VBA", "OCR", "PDF Parsing"],
  },
  {
    slug: "texti",
    company: "TEXTI",
    type: "Summer job",
    position: "Sales Assistant",
    location: "Le Touquet Paris-Plage, France",
    startDate: "July 2024",
    endDate: "August 2024",
    current: false,
    shortDescription: "Summer job in the retail clothing sector, focused on customer relations, checkout, merchandising, and stock management.",
    technologies: [],
  },
  {
    slug: "bigot-materiaux-2023",
    company: "BIGOT Materiaux",
    type: "Summer work",
    position: "HR & Accounting Assistant",
    location: "Etaples, France",
    startDate: "July 2023",
    endDate: "July 2023",
    current: false,
    shortDescription: "First exposure to administrative processes in the family business: HR documents, inventory, accounting entry, and AS400 tools.",
    technologies: ["Excel", "Accounting software"],
  },
  {
    slug: "tac-hockey",
    company: "TAC Hockey",
    type: "Coaching",
    position: "Youth Camp Leader & Coach",
    location: "Le Touquet Paris-Plage, France",
    startDate: "July 2022",
    endDate: "July 2022",
    current: false,
    shortDescription: "Supervised young field hockey players and led training sessions.",
    technologies: [],
  },
]

export const metadata = {
  title: "Professional experience — Gabriel Bigot",
  description: "Companies, missions, and projects led by Gabriel Bigot.",
}

export default function EnglishWorkPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-4">
          <Link href="/en/portfolio" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to portfolio</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 sm:px-8 py-12 sm:py-20">
        <header className="space-y-6 pb-16 border-b border-border">
          <div className="text-sm text-muted-foreground font-mono tracking-wider">
            EXPERIENCE / {new Date().getFullYear()}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight">
            Where I have worked
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
            The organizations that trusted me, the projects I delivered, and what each experience taught me.
          </p>
        </header>

        <div className="py-12 sm:py-16 space-y-6">
          {companies.map((company) => (
            <div key={company.slug} className="group block p-6 sm:p-8 border border-border rounded-xl hover:border-muted-foreground/50 hover:shadow-lg transition-all duration-300">
              <div className="flex gap-5 sm:gap-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border border-border bg-foreground/[0.03] flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-light text-muted-foreground select-none">
                    {company.company.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 flex-1 min-w-0">
                  <div className="space-y-2.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-xl sm:text-2xl font-light group-hover:text-muted-foreground transition-colors duration-300">
                        {company.company}
                      </h2>
                      <span className="px-2.5 py-0.5 text-xs bg-foreground/5 border border-border rounded-full">
                        {company.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{company.position}</span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{company.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{company.startDate} — {company.endDate}</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                      {company.shortDescription}
                    </p>

                    {company.technologies.length > 0 && (
                      <div className="pt-0.5">
                        <TechnologyGroups technologies={company.technologies} compact maxItems={6} locale="en" />
                      </div>
                    )}
                  </div>

                  <Link href={`/en/projects`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 self-end sm:self-center flex-shrink-0">
                    <span>See related projects</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-border py-12">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div className="text-center text-sm text-muted-foreground">
            © 2025 Gabriel Bigot • AI Automation Developer
          </div>
        </div>
      </footer>
    </div>
  )
}
