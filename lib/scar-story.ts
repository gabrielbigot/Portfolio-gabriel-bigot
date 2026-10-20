export type StoryKind = "origin" | "rise" | "peak" | "rupture" | "rebuild" | "build"
export type StoryLocale = "fr" | "en"

export type StoryMilestone = { year: string; kind: StoryKind; title: string; text: string }

export const STORY_KIND: Record<StoryKind, { label: Record<StoryLocale, string>; color: string }> = {
  origin: { label: { fr: "Origine", en: "Origin" }, color: "var(--muted-foreground)" },
  rise: { label: { fr: "Progression", en: "Growth" }, color: "#f59e0b" },
  peak: { label: { fr: "Sommet", en: "Peak" }, color: "#f59e0b" },
  rupture: { label: { fr: "Épreuve", en: "Setback" }, color: "#f87171" },
  rebuild: { label: { fr: "Retour", en: "Comeback" }, color: "#10b981" },
  build: { label: { fr: "Aujourd'hui", en: "Today" }, color: "var(--foreground)" },
}

// Short, discreet teasers of the story told in full on /about. No medical detail: only the rhythm.
export const STORY_MILESTONES: Record<StoryLocale, StoryMilestone[]> = {
  fr: [
    { year: "2008", kind: "origin", title: "Un stick dans les mains", text: "Premières crosses au TAC Hockey, Le Touquet. Le début de tout." },
    { year: "Collège", kind: "rise", title: "Le brassard de capitaine", text: "Très mauvais perdant au début. Avec le temps, mes coéquipiers m'ont choisi comme capitaine." },
    { year: "U16", kind: "peak", title: "Confiant sur le terrain", text: "À cet âge, j'avais l'impression que tout me réussissait sur le terrain." },
    { year: "2019", kind: "rupture", title: "La première chute", text: "Un entraînement banal, sans choc ni duel. Et soudain, le genou lâche." },
    { year: "2019 — 2020", kind: "rebuild", title: "Premier retour", text: "Une rééducation prise au sérieux, jusqu'au retour sur le terrain." },
    { year: "2020 — 2022", kind: "rupture", title: "Les années dures", text: "Le lycée, la distance avec le hockey et une période qui s'assombrit." },
    { year: "Oct. 2022", kind: "rupture", title: "La cicatrice", text: "Une opération, une complication, et une marque qui reste. C'est de là que vient ce fil." },
    { year: "2023", kind: "rebuild", title: "Reconstruire, encore", text: "Le bac, l'ESDHEM à Lille, et une reprise progressive, étape par étape." },
    { year: "2026", kind: "peak", title: "Le TAC remonte en Élite", text: "Première place de Nationale 1 avec le TAC, et retour au plus haut niveau français." },
  ],
  en: [
    { year: "2008", kind: "origin", title: "A stick in my hands", text: "First hockey sticks at TAC Hockey, Le Touquet. Where it all began." },
    { year: "Middle school", kind: "rise", title: "The captain's armband", text: "A very bad loser at first. Over time, my teammates chose me as captain." },
    { year: "U16", kind: "peak", title: "Confident on the field", text: "At that age, it felt like everything worked for me on the field." },
    { year: "2019", kind: "rupture", title: "The first fall", text: "An ordinary training session, no contact, no duel. And suddenly, the knee gives way." },
    { year: "2019 — 2020", kind: "rebuild", title: "A first comeback", text: "A rehab taken seriously, all the way back onto the field." },
    { year: "2020 — 2022", kind: "rupture", title: "The hard years", text: "High school, distance from hockey, and a period that turns dark." },
    { year: "Oct. 2022", kind: "rupture", title: "The scar", text: "A surgery, a complication, and a mark that stays. This thread starts here." },
    { year: "2023", kind: "rebuild", title: "Rebuilding, again", text: "The baccalaureate, ESDHEM in Lille, and a gradual return, one step at a time." },
    { year: "2026", kind: "peak", title: "TAC moves back up to the Elite", text: "First place in Nationale 1 with TAC, and back to the highest level in France." },
  ],
}

export const STORY_COPY = {
  fr: {
    brand: "Gabriel Bigot",
    nav: { why: "Pourquoi l'IA", origin: "Le parcours", thread: "Essais", skills: "Outils", contact: "Contact" },
    kicker: "PORTFOLIO / 2026",
    heroLine1: "Gabriel",
    heroLine2: "Bigot",
    tagline: "Étudiant en économie-gestion appliquant l'IA et l'automatisation aux processus métier.",
    availability: "À l'écoute d'opportunités",
    scrollHint: "Suivez le fil",
    scarLabel: "MA CICATRICE",
    scarDate: "Oct. 2022",
    scarCaption: "Cette cicatrice date d'octobre 2022. Voici ce qui s'est passé depuis.",
    ctaProjects: "Voir mes projets",
    ctaStory: "Mon histoire",
    ctaContact: "Contact",
    expertise: ["Python", "IA & LLM", "Flask", "Excel/VBA", "Automatisation"],
    originKicker: "CHAPITRE 2 · LE PARCOURS",
    originTitle: "D'où je viens",
    originIntro:
      "Le hockey, les blessures, puis le développement et l'IA. Voici, dans l'ordre, ce qui m'a amené ici, et ce que j'ai fait depuis.",
    originMore: "Lire le récit complet",
    journeyHint: "Faites défiler pour avancer le long de la cicatrice",
    softLabel: "Atténuer l'image",
    sharpLabel: "Voir nettement",
    threadKicker: "CHAPITRE 3 · LES ESSAIS",
    threadTitle: "Essais & réflexions",
    threadIntro: "Des textes pour penser l'IA au-delà des outils : travail, apprentissage, économie et responsabilité.",
    filterAll: "Tout",
    filterCareer: "Parcours",
    filterProject: "Projets",
    filterEssay: "Essais",
    open: "Ouvrir",
    featured: "Projet phare",
    skillsKicker: "CHAPITRE 4 · LES OUTILS",
    skillsTitle: "Ce que j'utilise",
    languages: "Langues",
    closeKicker: "POUR FINIR",
    closeTitle: "Merci d'avoir suivi le fil.",
    closeText: "Toujours intéressé par de nouveaux projets d'automatisation, des stages en IA, et des discussions sur la transformation digitale des PME.",
    contact: "Me contacter",
    cv: "Télécharger mon CV",
    classic: "Voir la version classique",
    classicHref: "/portfolio",
    lightLabel: "Passer en mode clair",
    darkLabel: "Passer en mode sombre",
    langLabel: "EN",
    langHref: "/en/cicatrice",
    footer: "© 2026 Gabriel Bigot • Développeur d'Automatisations IA",
    contactHref: "/#connect",
    storyHref: "/about",
  },
  en: {
    brand: "Gabriel Bigot",
    nav: { why: "Why AI", origin: "The path", thread: "Essays", skills: "Tools", contact: "Contact" },
    kicker: "PORTFOLIO / 2026",
    heroLine1: "Gabriel",
    heroLine2: "Bigot",
    tagline: "Economics and management student applying AI and automation to business processes.",
    availability: "Open to opportunities",
    scrollHint: "Follow the thread",
    scarLabel: "MY SCAR",
    scarDate: "Oct. 2022",
    scarCaption: "This scar dates from October 2022. Here is what has happened since.",
    ctaProjects: "View my projects",
    ctaStory: "My story",
    ctaContact: "Contact",
    expertise: ["Python", "AI & LLMs", "Flask", "Excel/VBA", "Automation"],
    originKicker: "CHAPTER 2 · THE PATH",
    originTitle: "Where I come from",
    originIntro:
      "Hockey, injuries, then development and AI. Here, in order, is what led me here, and what I have done since.",
    originMore: "Read the full story",
    journeyHint: "Scroll to move along the scar",
    softLabel: "Soften the image",
    sharpLabel: "Show it sharp",
    threadKicker: "CHAPTER 3 · THE ESSAYS",
    threadTitle: "Essays & reflections",
    threadIntro: "Writing that considers AI beyond tools: work, learning, economics, and responsibility.",
    filterAll: "All",
    filterCareer: "Career",
    filterProject: "Projects",
    filterEssay: "Essays",
    open: "Open",
    featured: "Featured project",
    skillsKicker: "CHAPTER 4 · THE TOOLS",
    skillsTitle: "What I use",
    languages: "Languages",
    closeKicker: "TO FINISH",
    closeTitle: "Thank you for following the thread.",
    closeText: "Always interested in new automation projects, AI internships, and conversations about digital transformation for SMEs.",
    contact: "Contact me",
    cv: "Download my CV",
    classic: "See the classic version",
    classicHref: "/en/portfolio",
    lightLabel: "Switch to light mode",
    darkLabel: "Switch to dark mode",
    langLabel: "FR",
    langHref: "/cicatrice",
    footer: "© 2026 Gabriel Bigot • AI Automation Developer",
    contactHref: "/en/portfolio#connect",
    storyHref: "/en/about",
  },
}

export type StoryCopy = (typeof STORY_COPY)["fr"]


// ───────── chapter 1: why AI ─────────
// Built only from things stated in Gabriel's own documents (bio, project notes, Sapiens Machina map).
// Sentences about the injury are written for him to review.
export type WhyBeat = { kicker: string; title: string; text: string; links?: { label: string; href: string }[] }
export type WhyCopy = {
  kicker: string
  title: string
  intro: string
  beats: WhyBeat[]
  questionsTitle: string
  questions: string[]
  note: string
}

export const STORY_WHY: Record<StoryLocale, WhyCopy> = {
  fr: {
    kicker: "CHAPITRE 1 · POURQUOI L'IA",
    title: "Pourquoi l'IA ?",
    intro: "Pas un grand plan : d'abord des besoins très concrets, puis des questions.",
    beats: [
      {
        kicker: "UN BESOIN PRATIQUE",
        title: "Des tâches répétitives",
        text: "À l'entreprise familiale, il y avait des relevés, des relances et des procès-verbaux à refaire sans cesse. Automatiser m'a paru plus utile que de les subir : d'abord pour gagner du temps, puis pour repenser des flux entiers.",
        links: [{ label: "Mes missions chez BIGOT Matériaux", href: "/work/bigot-materiaux-2025" }],
      },
      {
        kicker: "MES PROPRES BESOINS",
        title: "Des outils pour moi",
        text: "Ensuite j'ai construit ce dont j'avais besoin. Unlimited Cognition pour réviser : j'ai des troubles de mémoire que je compense par une révision régulière. Atlas pour reprendre le sport pas à pas après l'opération : des exercices adaptés au matériel que j'ai, et un suivi de ce que je fais. Et une extension pour retrouver ce que je lis.",
        links: [
          { label: "Unlimited Cognition", href: "/projects/unlimited-cognition" },
          { label: "Atlas", href: "/projects/atlas" },
          { label: "L'extension Chrome", href: "/projects/bookmarks-x-research" },
        ],
      },
      {
        kicker: "DES QUESTIONS",
        title: "Autonomie ou dépendance ?",
        text: "Après l'opération, j'ai appris concrètement ce que veulent dire pénibilité et autonomie. C'est devenu la première question que je pose à un outil d'IA : réduit-il une pénibilité, rend-il plus autonome, ou plus dépendant ? Je n'ai pas les réponses. Je note les questions, je teste à petite échelle, et je dis ce qui ne marche pas.",
      },
    ],
    questionsTitle: "Les questions que je me pose avant de construire",
    questions: [
      "Est-ce utile, de façon démontrable ?",
      "Est-ce que ça rend plus autonome, ou plus dépendant ?",
      "Qui profite de la valeur créée ?",
      "Les limites et les échecs sont-ils dits honnêtement ?",
    ],
    note: "Ces questions viennent d'un cadre de réflexion que j'appelle Sapiens Machina : réflexion en cours, aucun produit.",
  },
  en: {
    kicker: "CHAPTER 1 · WHY AI",
    title: "Why AI?",
    intro: "Not a grand plan: first very concrete needs, then questions.",
    beats: [
      {
        kicker: "A PRACTICAL NEED",
        title: "Repetitive tasks",
        text: "At the family business, there were statements, reminders and meeting minutes to redo over and over. Automating them seemed more useful than putting up with them: first to save time, then to rethink whole flows.",
        links: [{ label: "My work at BIGOT Matériaux", href: "/en/work" }],
      },
      {
        kicker: "MY OWN NEEDS",
        title: "Tools for myself",
        text: "Then I built what I needed. Unlimited Cognition to study: I have memory difficulties that I make up for with regular review. Atlas to get back to sport step by step after the surgery: exercises that fit the equipment I have, and a record of what I do. And an extension to find again what I read.",
        links: [
          { label: "Unlimited Cognition", href: "/en/projects/unlimited-cognition" },
          { label: "Atlas", href: "/en/projects/atlas" },
          { label: "The Chrome extension", href: "/en/projects/bookmarks-x-research" },
        ],
      },
      {
        kicker: "QUESTIONS",
        title: "Autonomy or dependence?",
        text: "After the surgery, I learned first-hand what hardship and autonomy mean. It became the first question I ask of an AI tool: does it reduce hardship, does it make people more autonomous, or more dependent? I don't have the answers. I write the questions down, test on a small scale, and say what does not work.",
      },
    ],
    questionsTitle: "The questions I ask before building",
    questions: [
      "Is it useful, in a way that can be shown?",
      "Does it make people more autonomous, or more dependent?",
      "Who benefits from the value created?",
      "Are the limits and failures stated honestly?",
    ],
    note: "These questions come from a thinking framework I call Sapiens Machina: work in progress, no product.",
  },
}

// A sentence on what made each project necessary, shown first on its step of the journey.
export const STORY_LEADS: Record<string, Record<StoryLocale, string>> = {
  "project:unlimited-cognition": {
    fr: "Né d'un besoin personnel : réviser, et compenser des troubles de mémoire par une révision régulière.",
    en: "Born from a personal need: studying, and making up for memory difficulties with regular review.",
  },
  "project:atlas": {
    fr: "Pensé pour reprendre le sport pas à pas après l'opération : des exercices adaptés au matériel que j'ai, et un suivi de ce que je fais.",
    en: "Designed to get back to sport step by step after the surgery: exercises that fit the equipment I have, and a record of what I do.",
  },
  "project:bookmarks-x-research": {
    fr: "Pour retrouver ce que je lis et ce que je regarde, sans dépendre d'un service externe.",
    en: "To find again what I read and watch, without depending on an outside service.",
  },
  "project:assistant-bigot-controle-prix-achat": {
    fr: "Né d'une tâche répétitive à l'entreprise familiale : vérifier chaque prix d'achat à la main.",
    en: "Born from a repetitive task at the family business: checking every purchase price by hand.",
  },
}
