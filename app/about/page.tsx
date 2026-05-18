import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

type MilestoneType = "origin" | "rise" | "peak" | "rupture" | "rebuild"

const milestones: {
  year: string
  type: MilestoneType
  title: string
  text: string
}[] = [
  {
    year: "2008",
    type: "origin",
    title: "Un stick dans les mains",
    text: "Mon père le pratiquait depuis toujours. Ma mère avait commencé à vingt ans. À 3 ans, on m'a mis un stick dans les mains. Ce n'était pas un choix — c'était une évidence. Le hockey m'a choisi avant que je puisse le choisir.",
  },
  {
    year: "Collège",
    type: "rise",
    title: "Le talent, puis le brassard",
    text: "J'étais mauvais perdant. Je pleurais et quittais le terrain les mercredis. Puis quelque chose s'est allumé : un talent naturel, hérité de mes parents. Mes coéquipiers m'ont élu capitaine à l'unanimité, sans que je l'aie demandé. J'ai commencé à courir seul, à m'entraîner en dehors des créneaux officiels. Le travail a rejoint le talent.",
  },
  {
    year: "U16 — 13/14 ans",
    type: "peak",
    title: "Intouchable",
    text: "J'avais l'impression de pouvoir faire ce que je voulais sur le terrain. Tirer où je voulais, arrêter la balle où je voulais. J'avais commencé à m'entraîner avec l'équipe première — ce rêve d'enfant depuis que je les regardais depuis les tribunes. J'étais à mon prime. Injouable.",
  },
  {
    year: "2019",
    type: "rupture",
    title: "La première luxation",
    text: "Un entraînement totalement ordinaire. Pas de coup reçu, pas d'impact. Juste en courant. J'ai vu mon genou sur le côté — tordu. Ma première pensée : je ne ferai plus jamais de sport. Le diagnostic : dysplasie trochléenne, héréditaire. L'os censé bloquer ma rotule est trop plat. Elle se balade.",
  },
  {
    year: "2019 — 2020",
    type: "rebuild",
    title: "Première rééducation, premier retour",
    text: "Rééducation. Retour au hockey. Mais le genou n'était plus le même — je le sentais à chaque appui, à chaque changement de direction. Plus tu te blesses, plus ça devient fragile. Le kiné ne peut pas effacer ça complètement.",
  },
  {
    year: "Lycée — La Malassise (2020-2022)",
    type: "rupture",
    title: "Les dislocations continuent, la période s'assombrit",
    text: "Internat à Saint-Omer. La majorité de mon équipe U16 avait arrêté le hockey en arrivant au lycée. Pas moi. Je rentrais le vendredi soir épuisé pour m'entraîner. Deuxième luxation — le seul jour où j'avais oublié ma genouillère. Troisième luxation — cette fois avec la genouillère. Mon genou s'était luxé alors même qu'il était maintenu. Des luxations partielles que j'ignorais. Une période sombre que personne ne voyait. Je cherchais de la dopamine partout, sans le comprendre. Beaucoup de gens me regardaient comme si j'étais un zombie.",
  },
  {
    year: "Oct. 2022",
    type: "rupture",
    title: "L'opération, l'infection, les deux staphylocoques",
    text: "Opéré en Terminale — l'année du bac. Trois semaines après, réveillé à 5h30 par la douleur. Cicatrice gonflée, infection. Incapable de marcher deux pas. Ma mère a fait 1h30 de route. Le chirurgien, encore au bloc à 19h, ne voulait pas me prendre. Elle a fait le forcing. Il a vu l'état de la plaie et a compris. Deux staphylocoques. Réopéré d'urgence. Trois semaines à l'hôpital avec une bouteille reliée à ma jambe pour évacuer le pus. De retour à La Malassise : 9 médicaments par jour, piqûres d'insuline, prises de sang, 3 séances de kiné par semaine, et des cours à rattraper. J'ai failli ne pas avoir le bac.",
  },
  {
    year: "2023",
    type: "rebuild",
    title: "Reconstruire, encore une fois",
    text: "J'ai eu le bac — sans mention, mais je l'ai eu. ESDHEM à Lille, dans les locaux de SKEMA Business School. Les vis dans le genou limitent certains gestes techniques. Je ne joue plus exactement comme avant. Mais je suis là. Et l'automatisation, l'IA, la construction de solutions concrètes — tout ça est né dans ces années où je ne pouvais pas jouer mais où je ne voulais pas m'arrêter.",
  },
  {
    year: "2026",
    type: "peak",
    title: "Le TAC retrouve l'Élite",
    text: "Équipe première, Nationale 1. 18 matchs, 16 victoires, 100 buts, meilleure défense du championnat. 1er. Montée en Élite — le plus haut niveau français. Ce rêve d'enfant depuis que je regardais l'équipe jouer depuis le bord du terrain. Depuis 2019, ma vie n'a été qu'obstacles. Mais j'avais besoin que tout ça serve à quelque chose. Je n'ai pas abandonné.",
  },
]

const typeConfig: Record<MilestoneType, { dot: string; border: string; tag: string; label: string }> = {
  origin:  { dot: "bg-muted-foreground/40",  border: "border-border",                  tag: "text-muted-foreground/60",  label: "Origine"     },
  rise:    { dot: "bg-amber-500/60",          border: "border-amber-500/20",            tag: "text-amber-500/70",         label: "Progression" },
  peak:    { dot: "bg-amber-500",             border: "border-amber-500/40",            tag: "text-amber-500",            label: "Sommet"      },
  rupture: { dot: "bg-red-400/70",            border: "border-red-400/25",              tag: "text-red-400/80",           label: "Épreuve"     },
  rebuild: { dot: "bg-emerald-500/70",        border: "border-emerald-500/20",          tag: "text-emerald-500/80",       label: "Retour"      },
}

export default function AboutPage() {
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

        {/* ── HEADER ── */}
        <header className="pb-20 sm:pb-28 border-b border-border">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-end">
            <div className="space-y-7">
              <div className="text-sm text-muted-foreground font-mono tracking-wider">MON HISTOIRE</div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight">
                Tenir, revenir, construire
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed">
                Mon parcours tient en trois fils : le hockey, les blessures et la construction de solutions
                concrètes. Le terrain m'a appris le collectif. Les épreuves m'ont appris la résilience.
                L'IA et le développement m'ont donné un moyen d'agir.
              </p>
            </div>

            <figure className="space-y-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-foreground/[0.02]">
                <Image
                  src="/about/story/nationale-1-trophy.jpg"
                  alt="L'équipe du TAC soulevant le trophée de Nationale 1"
                  fill
                  priority
                  sizes="(min-width: 1024px) 520px, calc(100vw - 48px)"
                  className="object-cover"
                />
              </div>
              <figcaption className="text-sm text-muted-foreground">
                TAC Hockey, 2026. 1ère place de Nationale 1 et retour en Élite.
              </figcaption>
            </figure>
          </div>
        </header>

        {/* ── TIMELINE ── */}
        <section className="py-20 sm:py-28">
          <div className="space-y-14 sm:space-y-16">
            <div className="space-y-5">
              <h2 className="text-3xl sm:text-4xl font-light">La chronologie</h2>
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Ni linéaire, ni simple. Une suite de chutes et de retours — chaque épreuve
                suivie d'une reconstruction, jusqu'à la saison qui valide tout.
              </p>

              {/* Légende */}
              <div className="flex flex-wrap gap-4 pt-1">
                {(Object.entries(typeConfig) as [MilestoneType, typeof typeConfig[MilestoneType]][]).map(([, cfg]) => (
                  <div key={cfg.label} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <span className={`text-xs font-mono ${cfg.tag}`}>{cfg.label.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              {/* Ligne verticale */}
              <div className="absolute left-[7px] top-6 bottom-6 w-px bg-border hidden sm:block" />

              <div className="space-y-0">
                {milestones.map((item, i) => {
                  const cfg = typeConfig[item.type]
                  return (
                    <div key={i} className="relative pb-10 last:pb-0 group">
                      {/* Dot */}
                      <div
                        className={`absolute left-0 top-[22px] w-[15px] h-[15px] rounded-full border-2 border-background hidden sm:block z-10 transition-transform duration-300 group-hover:scale-125 ${cfg.dot}`}
                      />

                      <div className="sm:pl-10 grid lg:grid-cols-12 gap-3 sm:gap-6">
                        {/* Année */}
                        <div className="lg:col-span-2 pt-1">
                          <div className="text-base sm:text-lg font-light text-muted-foreground group-hover:text-foreground transition-colors duration-400">
                            {item.year}
                          </div>
                          <div className={`text-xs font-mono mt-0.5 ${cfg.tag}`}>
                            {typeConfig[item.type].label.toUpperCase()}
                          </div>
                        </div>

                        {/* Contenu */}
                        <div className="lg:col-span-10">
                          <div
                            className={`p-6 sm:p-7 border rounded-lg transition-all duration-300 hover:shadow-md ${cfg.border} hover:border-opacity-60`}
                          >
                            <h3 className="text-lg sm:text-xl font-medium mb-3 group-hover:text-foreground transition-colors duration-300">
                              {item.title}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed text-[0.95rem] sm:text-base">
                              {item.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-16 sm:py-20 border-t border-border">
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/projects"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-all duration-300"
            >
              <span>Voir mes projets</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/#connect"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300"
            >
              <span>Me contacter</span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-12">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div className="text-center text-sm text-muted-foreground">
            © 2025 Gabriel Bigot • Développeur d'Automatisations IA
          </div>
        </div>
      </footer>
    </div>
  )
}
