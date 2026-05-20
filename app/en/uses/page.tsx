import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"

const usesData = [
  {
    title: "Languages & Frameworks",
    subtitle: "What I build with",
    items: [
      { name: "Python", description: "My main language for automation, data processing, and backend scripts.", tag: "Main" },
      { name: "TypeScript / Next.js", description: "For modern web interfaces and full-stack applications.", url: "https://nextjs.org" },
      { name: "Flask", description: "Lightweight Python framework for APIs and small web services.", url: "https://flask.palletsprojects.com" },
      { name: "SQL (Supabase / PostgreSQL)", description: "For storing and managing structured data in automation projects.", url: "https://supabase.com" },
      { name: "Excel / VBA", description: "Still very useful for automating SME processes that live inside spreadsheets." },
    ],
  },
  {
    title: "AI & Automation",
    subtitle: "The core of my work",
    items: [
      { name: "n8n", description: "My favorite no-code/low-code automation tool for orchestrating API workflows.", url: "https://n8n.io", tag: "Favorite" },
      { name: "OpenAI API", description: "For data extraction, text generation, classification, and AI-assisted workflows.", url: "https://platform.openai.com" },
      { name: "Google Gemini", description: "Useful for multimodal tasks and integration with the Google ecosystem.", url: "https://ai.google.dev" },
      { name: "Claude (Anthropic)", description: "For deeper reasoning and complex instruction-following tasks.", url: "https://claude.ai" },
      { name: "LinkedIn API / Pappers API", description: "Used to enrich prospect databases and automate business development workflows." },
    ],
  },
  {
    title: "Development tools",
    subtitle: "My daily environment",
    items: [
      { name: "VS Code", description: "My main editor: lightweight, extensible, and strong for Python/TypeScript.", url: "https://code.visualstudio.com", tag: "Main" },
      { name: "GitHub", description: "For version control, collaboration, and deployment workflows.", url: "https://github.com" },
      { name: "Vercel", description: "Deployment for this portfolio and my Next.js projects.", url: "https://vercel.com" },
      { name: "Supabase", description: "Backend-as-a-service with PostgreSQL, auth, and storage.", url: "https://supabase.com" },
    ],
  },
  {
    title: "Productivity",
    subtitle: "Organizing thinking and work",
    items: [
      { name: "Notion", description: "My operating system for content, projects, notes, and client documentation.", url: "https://notion.so", tag: "Essential" },
      { name: "ChatGPT / Claude", description: "Daily thinking, writing, debugging, and learning assistants." },
      { name: "Obsidian", description: "For personal notes, technical watch files, and long-term reflections.", url: "https://obsidian.md" },
      { name: "Linear", description: "Clean project management for personal and professional work.", url: "https://linear.app" },
    ],
  },
]

export const metadata = {
  title: "Uses — Gabriel Bigot",
  description: "Tools, technologies, and equipment Gabriel Bigot uses daily.",
}

export default function EnglishUsesPage() {
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
          <div className="text-sm text-muted-foreground font-mono tracking-wider">USES / {new Date().getFullYear()}</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight">My tools</h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
            The tools, technologies, and equipment that shape my daily work as an AI automation developer.
          </p>
        </header>

        <div className="py-12 sm:py-16 space-y-20">
          {usesData.map((category) => (
            <section key={category.title} className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-light">{category.title}</h2>
                <p className="text-muted-foreground">{category.subtitle}</p>
              </div>

              <div className="space-y-3">
                {category.items.map((item) => (
                  <div key={item.name} className="group p-5 sm:p-6 border border-border rounded-xl hover:border-muted-foreground/50 transition-all duration-300">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="font-medium">{item.name}</h3>
                          {item.tag && (
                            <span className="px-2 py-0.5 text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full">
                              {item.tag}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                      </div>

                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 p-2 text-muted-foreground hover:text-foreground transition-colors duration-200" aria-label={`Visit ${item.name}`}>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t border-border py-12 mt-20">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Gabriel Bigot • AI Automation Developer
          </div>
        </div>
      </footer>
    </div>
  )
}
