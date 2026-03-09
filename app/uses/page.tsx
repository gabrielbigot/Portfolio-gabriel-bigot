import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"

export const metadata = {
  title: "Uses — Gabriel Bigot",
  description: "Les outils, technologies et équipements que j'utilise au quotidien.",
}

type UsesItem = {
  name: string
  description: string
  url?: string
  tag?: string
}

type UsesCategory = {
  title: string
  subtitle: string
  items: UsesItem[]
}

const usesData: UsesCategory[] = [
  {
    title: "Langages & Frameworks",
    subtitle: "Ce avec quoi je construis",
    items: [
      {
        name: "Python",
        description: "Mon langage principal pour l'automatisation, le traitement de données et les scripts backend.",
        tag: "Principal",
      },
      {
        name: "TypeScript / Next.js",
        description: "Pour les interfaces web modernes, ce site en est un exemple. J'apprécie la rigueur du typage statique.",
        url: "https://nextjs.org",
      },
      {
        name: "Flask",
        description: "Framework Python léger pour exposer des APIs et des petits services web.",
        url: "https://flask.palletsprojects.com",
      },
      {
        name: "SQL (Supabase / PostgreSQL)",
        description: "Pour le stockage et la gestion de données structurées dans mes projets d'automatisation.",
        url: "https://supabase.com",
      },
      {
        name: "Excel / VBA",
        description: "Toujours utile pour automatiser des processus en milieu PME qui vivent dans des classeurs Excel.",
      },
    ],
  },
  {
    title: "IA & Automatisation",
    subtitle: "Le cœur de mon travail",
    items: [
      {
        name: "n8n",
        description: "Mon outil d'automatisation no-code/low-code préféré. Idéal pour orchestrer des workflows complexes entre APIs sans sur-ingénierie.",
        url: "https://n8n.io",
        tag: "Favori",
      },
      {
        name: "OpenAI API",
        description: "Pour intégrer des capacités GPT-4 dans des workflows : extraction de données, génération de texte, classification.",
        url: "https://platform.openai.com",
      },
      {
        name: "Google Gemini",
        description: "Alternative à OpenAI, notamment pour les tâches multimodales et l'intégration dans l'écosystème Google.",
        url: "https://ai.google.dev",
      },
      {
        name: "Claude (Anthropic)",
        description: "Pour les tâches nécessitant un raisonnement approfondi et un suivi d'instructions complexes.",
        url: "https://claude.ai",
      },
      {
        name: "LinkedIn API / Pappers API",
        description: "Utilisées pour enrichir automatiquement des bases de données prospects dans des contextes de développement commercial.",
      },
    ],
  },
  {
    title: "Outils de développement",
    subtitle: "Mon environnement quotidien",
    items: [
      {
        name: "VS Code",
        description: "Mon éditeur principal. Léger, extensible, et le meilleur support Python/TypeScript du marché.",
        url: "https://code.visualstudio.com",
        tag: "Principal",
      },
      {
        name: "GitHub",
        description: "Pour le versionnement, la collaboration et la CI/CD. Tous mes projets y vivent.",
        url: "https://github.com",
      },
      {
        name: "Vercel",
        description: "Déploiement de ce portfolio et de mes projets Next.js. Zero config, previews automatiques.",
        url: "https://vercel.com",
      },
      {
        name: "Postman / curl",
        description: "Pour tester et déboguer les APIs REST avant de les intégrer dans des workflows.",
      },
      {
        name: "Supabase",
        description: "Backend-as-a-service avec PostgreSQL, auth et storage. Parfait pour prototyper rapidement.",
        url: "https://supabase.com",
      },
    ],
  },
  {
    title: "Productivité",
    subtitle: "Organiser ma réflexion et mon travail",
    items: [
      {
        name: "Notion",
        description: "Mon second cerveau. Ce portfolio est entièrement piloté par Notion : contenus, projets, expériences.",
        url: "https://notion.so",
        tag: "Essentiel",
      },
      {
        name: "ChatGPT / Claude",
        description: "Utilisés quotidiennement comme assistants de réflexion, rédaction et débogage.",
      },
      {
        name: "Obsidian",
        description: "Pour la prise de notes personnelles, les fiches de veille tech et les réflexions long terme.",
        url: "https://obsidian.md",
      },
      {
        name: "Linear",
        description: "Gestion de projets perso et pro. Interface épurée, bien meilleure que Jira pour un usage solo.",
        url: "https://linear.app",
      },
    ],
  },
  {
    title: "Setup bureau",
    subtitle: "L'environnement physique",
    items: [
      {
        name: "MacBook Pro",
        description: "Ma machine principale. Fiable, autonome, et l'écosystème Unix facilite grandement le développement.",
      },
      {
        name: "Écran externe 27\"",
        description: "Indispensable pour travailler confortablement sur du code et plusieurs fenêtres en parallèle.",
      },
      {
        name: "Casque anti-bruit",
        description: "Pour entrer dans un état de flow, notamment lors des sessions de code ou de rédaction intense.",
      },
    ],
  },
]

export default function UsesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au portfolio</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 sm:px-8 py-12 sm:py-20">
        {/* Header */}
        <header className="space-y-6 pb-16 border-b border-border">
          <div className="text-sm text-muted-foreground font-mono tracking-wider">
            USES / {new Date().getFullYear()}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight">
            Ce que j'utilise
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Les outils, technologies et équipements qui composent mon quotidien de développeur
            spécialisé en automatisation IA. Une liste vivante, mise à jour régulièrement.
          </p>
        </header>

        {/* Categories */}
        <div className="py-12 sm:py-16 space-y-20">
          {usesData.map((category) => (
            <section key={category.title} className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-light">{category.title}</h2>
                <p className="text-muted-foreground">{category.subtitle}</p>
              </div>

              <div className="space-y-3">
                {category.items.map((item) => (
                  <div
                    key={item.name}
                    className="group p-5 sm:p-6 border border-border rounded-xl hover:border-muted-foreground/50 transition-all duration-300"
                  >
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
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 p-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                          aria-label={`Visiter ${item.name}`}
                        >
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

        {/* Footer note */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Inspiré par{" "}
            <a
              href="https://uses.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground transition-colors duration-200"
            >
              uses.tech
            </a>
            , un répertoire de pages /uses de développeurs.
          </p>
        </div>
      </main>

      <footer className="border-t border-border py-12 mt-20">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Gabriel Bigot • Développeur d'Automatisations IA
          </div>
        </div>
      </footer>
    </div>
  )
}
