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
    text: "Mon père jouait depuis qu'il était gamin, ma mère avait commencé vers ses vingt ans, et quand j'ai eu 3 ans ils m'ont tout naturellement mis un stick dans les mains. Je n'ai jamais vraiment choisi ce sport. Il faisait partie de ma vie avant même que je comprenne ce que ça voulait dire.",
  },
  {
    year: "Collège",
    type: "rise",
    title: "Le talent, puis le brassard",
    text: "Au début j'étais un très mauvais perdant, au point de pleurer et quitter le terrain pendant les entraînements du mercredi. Avec le temps, un talent naturel a commencé à se révéler, probablement hérité de mes parents. Mes coéquipiers m'ont choisi capitaine à l'unanimité sans que je l'aie demandé, et j'ai commencé à courir seul, à m'entraîner en dehors des créneaux habituels. Le travail avait rejoint le talent.",
  },
  {
    year: "U16 — 13/14 ans",
    type: "peak",
    title: "Intouchable",
    text: "J'avais vraiment l'impression de pouvoir faire ce que je voulais sur le terrain à cette période. Je tirais où je voulais, j'arrêtais la balle où je voulais, je passais à qui je voulais. J'avais même commencé à m'entraîner avec l'équipe première, ce rêve que j'avais depuis tout petit en les regardant jouer depuis le bord du terrain. C'est difficile à décrire ce sentiment, mais j'avais vraiment l'impression d'être intouchable.",
  },
  {
    year: "2019",
    type: "rupture",
    title: "La première luxation",
    text: "C'était un entraînement complètement banal, sans rien de particulier. Pas de choc, pas de duel. Juste en courant j'ai ressenti quelque chose d'anormal et je me suis retrouvé par terre. En relevant la tête j'ai vu mon genou totalement sur le côté, tordu. Ma première pensée a été que je ne ferais plus jamais de sport de ma vie. Le diagnostic est tombé ensuite : dysplasie trochléenne, héréditaire. L'os qui est censé bloquer ma rotule est trop plat chez moi, ce qui fait qu'elle peut se balader beaucoup plus facilement qu'elle ne devrait.",
  },
  {
    year: "2019 — 2020",
    type: "rebuild",
    title: "Première rééducation, premier retour",
    text: "J'ai fait ma rééducation avec un sérieux irréprochable parce que je voulais revenir au hockey le plus vite possible. Et j'y suis revenu au bout de quelques mois. Mais quelque chose avait changé dans mon genou et je le sentais à chaque appui, à chaque changement de direction. Le kiné me l'avait dit clairement : plus tu te blesses, plus ça devient fragile. Il ne pouvait pas effacer ça complètement, et j'allais vite comprendre ce que ça voulait dire concrètement.",
  },
  {
    year: "Lycée — La Malassise (2020-2022)",
    type: "rupture",
    title: "Les dislocations continuent, la période s'assombrit",
    text: "J'ai choisi La Malassise à Saint-Omer alors que la quasi-totalité de mon équipe U16 avait arrêté le hockey en arrivant au lycée. Moi je revenais le vendredi soir souvent épuisé de la semaine pour aller m'entraîner. La deuxième luxation est arrivée le seul jour où j'avais oublié ma genouillère. La troisième est arrivée alors que je l'avais, ce qui voulait dire que même le maintien artificiel ne suffisait plus. Entre les deux il y avait des luxations partielles que je ressentais et que j'ignorais volontairement.",
  },
  {
    year: "Oct. 2022",
    type: "rupture",
    title: "L'opération, l'infection, les deux staphylocoques",
    text: "Je me suis fait opérer en Terminale malgré tout parce que j'avais trop souffert pour attendre encore. Trois semaines après l'opération je me suis réveillé à 5h30 du matin avec une douleur atroce venant de la cicatrice, incapable de marcher deux pas pour aller aux toilettes. Ma mère a fait 1h30 de route pour venir me chercher. Le chirurgien sortait du bloc et ne voulait pas me prendre ce soir-là, mais ma mère a insisté jusqu'à ce qu'il accepte. En voyant l'état de la plaie il a compris tout de suite. Deux staphylocoques, réopéré d'urgence. J'ai passé trois semaines à l'hôpital avec une bouteille reliée à ma jambe pour évacuer le pus. De retour à La Malassise j'avais 9 médicaments par jour, des piqûres d'insuline tous les midis, des prises de sang régulières, trois séances de kiné par semaine et tous les cours à rattraper en même temps. J'ai failli ne pas avoir le bac.",
  },
  {
    year: "2023",
    type: "rebuild",
    title: "Reconstruire, encore une fois",
    text: "J'ai eu le bac, sans mention, mais je l'ai eu. J'ai intégré l'ESDHEM à Lille dans les locaux de SKEMA Business School et j'ai repris le hockey même si les vis dans le genou me limitent sur certains gestes que je faisais naturellement avant. Je ne joue plus exactement comme je jouais, mais je suis là. Et quelque part c'est pendant toutes ces années où je ne pouvais pas jouer comme je le voulais que j'ai commencé à construire des choses concrètes autour de l'automatisation et de l'IA.",
  },
  {
    year: "2026",
    type: "peak",
    title: "Le TAC retrouve l'Élite",
    text: "Cette saison avec l'équipe première en Nationale 1 s'est terminée d'une façon que je n'aurais peut-être pas osé imaginer quelques années plus tôt : 18 matchs, 16 victoires, 100 buts inscrits et la meilleure défense du championnat. Premiers. Montée en Élite, le plus haut niveau du hockey français. Ce rêve que j'avais depuis tout petit en regardant cette équipe jouer depuis les tribunes. Depuis 2019 mon parcours n'a été qu'une succession d'épreuves. J'avais besoin que tout ça serve à quelque chose. Je n'ai pas abandonné.",
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
