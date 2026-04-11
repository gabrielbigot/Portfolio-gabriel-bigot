/**
 * Personal Data Configuration
 * All content for the portfolio is centralized here for easy updates
 */

export const personalInfo = {
  name: "Gabriel Bigot",
  firstName: "Gabriel",
  lastName: "Bigot",
  title: "Développeur d'Automatisations IA",
  tagline: "Étudiant en économie-gestion appliquant l'IA et l'automatisation aux processus métier",
  location: "Saint-Josse-sur-Mer, France",
  email: "gabriel.bigot2005@gmail.com",
  phone: "06.12.75.24.56",
  availability: "Disponible dès maintenant",
  birthDate: "2005-05-19",

  bio: {
    short: "Étudiant en économie-gestion, j'applique l'IA et l'automatisation à des processus métier réels. Mon parcours sportif forgé par le hockey m'a appris la rigueur, la résilience et le travail d'équipe.",
    full: `Passionné par l'intelligence artificielle et l'automatisation depuis 2022, je transforme des processus métier complexes en solutions efficaces. Mon expérience en PME familiale m'a naturellement orienté vers l'IA : d'abord pour résoudre des tâches répétitives, puis pour repenser des flux entiers.

Mon parcours sportif de haut niveau en hockey sur gazon m'a forgé une résilience exceptionnelle, notamment après avoir surmonté de graves blessures pour revenir au plus haut niveau. Cette expérience m'a appris la persévérance, le travail d'équipe et la capacité à me relever face aux difficultés.

Mon objectif est d'intégrer SKEMA Business School avec une spécialisation en IA et transformation digitale, pour développer une expertise à l'intersection du business et de la technologie.`
  },

  currentRole: {
    position: "Étudiant en Licence 3 Éco-Gestion",
    company: "ESDHEM (Lille)",
    location: "Lille, France",
    startDate: "2023",
    current: true
  },

  objectiveTitle: "OBJECTIF 2026",
  objectiveText: "Stage ADN POTENTIEL terminé (jan–fév. 2026) — Ouvert aux opportunités en IA & automatisation.",
  cvUrl: "/cv-gabriel-bigot.pdf",
};

export const socialLinks = [
  {
    name: "GitHub",
    url: "https://github.com/gabrielbigot", // À mettre à jour avec votre vrai GitHub
    icon: "github"
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/gabriel-bigot-5149ab2a9/",
    icon: "linkedin"
  },
  {
    name: "Email",
    url: "mailto:gabriel.bigot2005@gmail.com",
    icon: "mail"
  }
];

export const education = [
  {
    degree: "Licence 3 Économie-Gestion",
    school: "ESDHEM",
    location: "Lille, France",
    startDate: "2023",
    endDate: "2026 (en cours)",
    description: "Formation en économie et gestion avec préparation aux concours des grandes écoles. Objectif : intégrer SKEMA Business School.",
    highlights: [
      "Spécialisation envisagée : MSc in Artificial Intelligence & Business Transformation",
      "Alternative : MSc in Data Analytics & Artificial Intelligence",
      "Préparation concours parallèles"
    ]
  },
  {
    degree: "Baccalauréat",
    school: "Lycée La Malassise",
    location: "Saint-Omer, France",
    startDate: "2020",
    endDate: "2023",
    description: "Parcours marqué par une opération au genou et complications médicales surmontées avec résilience.",
    highlights: [
      "Baccalauréat obtenu malgré hospitalisation et rééducation intensive",
      "Internat pendant 3 ans"
    ]
  },
  {
    degree: "Brevet des Collèges",
    school: "Collège Sainte-Austreberthe",
    location: "Montreuil-sur-Mer, France",
    startDate: "2016",
    endDate: "2020",
    description: "Excellents résultats académiques et sportifs.",
    highlights: [
      "Moyennes 16-17 en 6e-5e",
      "Sélections cross district, départemental, régional",
      "Révélation au cross : 2e place en 6e"
    ]
  }
];

export const workExperience = [
  {
    position: "Assistant en développement commercial et automatisation digitale",
    company: "ADN POTENTIEL",
    location: "Télétravail — Lille, France",
    startDate: "Janvier 2026",
    endDate: "Février 2026",
    current: false,
    description: "Stage de 7 semaines au sein d'un cabinet de formation, conseil et coaching professionnel (certification Qualiopi). Mission centrée sur la transformation digitale via l'automatisation et l'intelligence artificielle.",
    achievements: [
      "Conception et déploiement de 3 workflows n8n en production : enrichissement automatique de 15 000+ prospects BTP (API Pappers), système de veille sectorielle avec qualification IA (score d'impact, catégorisation), génération et publication automatique de contenus LinkedIn",
      "Création d'un Hub Notion avec 5 bases de données interconnectées comme interface de pilotage de l'ensemble du système",
      "Économie de 7h+ par semaine sur la veille et la création de contenus, 75% de taux de validation des contenus par le client, 0 échec en production",
      "Production de 4 tutoriels vidéo (~70 minutes) et documentation technique complète pour garantir l'autonomie du client non-technique",
      "Optimisation des coûts API à ~5-10€/mois et mise en place de mécanismes anti-doublon et de gestion d'erreurs gracieuse"
    ],
    technologies: ["n8n", "Notion", "OpenAI", "Google Gemini", "LinkedIn API", "Pappers API", "Perplexity AI"]
  },
  {
    position: "Assistant RH/Compta & Développeur d'Automatisations",
    company: "BIGOT Matériaux",
    location: "Étaples, France",
    startDate: "Juillet 2025",
    endDate: "Septembre 2025",
    current: false,
    description: "Développement d'automatisations stratégiques pour optimiser les processus RH et comptables de la PME familiale.",
    achievements: [
      "Création d'une application web complète pour automatiser la comptabilité (saisies répétitives, génération d'écritures) avec Python, Flask et base de données cloud",
      "Développement d'un système de traitement automatique de relevés bancaires : extraction PDF, mise en forme Excel, préparation import comptable",
      "Conception d'automatisations Excel avancées : relances clients automatiques, regroupement de données, calculs et suppression de doublons",
      "Automatisation de la génération de procès-verbaux d'assemblées générales"
    ],
    technologies: ["Python", "Flask", "Supabase", "Excel/VBA", "OCR", "PDF Parsing", "Automatisation UI"]
  },
  {
    position: "Vendeur",
    company: "TEXTI",
    location: "Le Touquet Paris-Plage, France",
    startDate: "Juillet 2024",
    endDate: "Août 2024",
    current: false,
    description: "Job d'été dans le secteur du textile.",
    achievements: [
      "Relation client et conseil personnalisé",
      "Tenue de caisse et gestion des transactions",
      "Merchandising et présentation produits",
      "Gestion de stock et inventaires"
    ],
    technologies: []
  },
  {
    position: "Assistant RH & Comptable",
    company: "BIGOT Matériaux",
    location: "Étaples, France",
    startDate: "Juillet 2023",
    endDate: "Juillet 2023",
    current: false,
    description: "Premier contact avec les processus administratifs de l'entreprise familiale.",
    achievements: [
      "Archivage et organisation de documents RH",
      "Inventaires et gestion de stock",
      "Saisie et lettrage comptable",
      "Découverte des outils internes (AS400)"
    ],
    technologies: ["Excel", "Logiciels comptables"]
  },
  {
    position: "Animateur & Entraîneur",
    company: "TAC Hockey",
    location: "Le Touquet Paris-Plage, France",
    startDate: "Juillet 2022",
    endDate: "Juillet 2022",
    current: false,
    description: "Encadrement de jeunes joueurs de hockey.",
    achievements: [
      "Encadrement et animation de groupes de jeunes",
      "Pédagogie sportive et transmission de techniques",
      "Responsabilité de groupe et sécurité",
      "Organisation d'exercices et de jeux"
    ],
    technologies: []
  }
];

export const skills = {
  technical: [
    {
      category: "Développement & Automatisation",
      skills: [
        { name: "Python", level: 85, description: "Scripts data, automatisations, Flask" },
        { name: "Flask", level: 75, description: "Applications web, APIs" },
        { name: "Excel/VBA", level: 90, description: "Automatisations avancées, macros complexes" },
        { name: "UI Automation", level: 80, description: "Automatisation d'interfaces" },
        { name: "n8n", level: 80, description: "Conception et déploiement de workflows d'automatisation no-code en production" },
        { name: "Intégration APIs", level: 75, description: "REST, OAuth2, webhooks — Pappers, OpenAI, LinkedIn API v2, Google Sheets" }
      ]
    },
    {
      category: "Données & Bases de Données",
      skills: [
        { name: "SQL", level: 75, description: "Requêtes, gestion de bases" },
        { name: "Supabase", level: 70, description: "Backend as a Service" },
        { name: "Pandas", level: 80, description: "Manipulation et analyse de données" },
        { name: "Excel Avancé", level: 95, description: "Tableaux croisés, formules complexes, Power Query" }
      ]
    },
    {
      category: "Intelligence Artificielle",
      skills: [
        { name: "Prototypage LLM", level: 85, description: "GPT, Claude, intégration d'APIs" },
        { name: "Prompt Design", level: 90, description: "Optimisation de prompts, chaînage" },
        { name: "OCR & Parsing", level: 80, description: "Extraction de données de documents" },
        { name: "Agents IA", level: 75, description: "Systèmes multi-agents, workflows" }
      ]
    },
    {
      category: "Outils & Productivité",
      skills: [
        { name: "Suite Microsoft", level: 95, description: "Word, Excel, PowerPoint, Outlook" },
        { name: "Git", level: 70, description: "Contrôle de version" },
        { name: "VS Code", level: 85, description: "Environnement de développement" },
        { name: "Notion avancé", level: 75, description: "Bases de données interconnectées, hub CRM, interface de pilotage" }
      ]
    }
  ],

  soft: [
    {
      name: "Résilience",
      description: "Capacité à surmonter les obstacles, démontrée par le parcours médical et sportif"
    },
    {
      name: "Travail d'équipe",
      description: "Capitaine d'équipe de hockey, coordination et leadership"
    },
    {
      name: "Autonomie d'apprentissage",
      description: "Auto-formation en IA et automatisation, veille technologique quotidienne"
    },
    {
      name: "Résolution de problèmes",
      description: "Approche analytique pour identifier et automatiser les processus"
    },
    {
      name: "Modestie",
      description: "Conscience de ses limites, toujours en apprentissage"
    },
    {
      name: "Sens du collectif",
      description: "Orientation équipe, partage de connaissances"
    },
    {
      name: "Pédagogie & Formation",
      description: "Production de tutoriels vidéo (~70 min) et documentation technique pour clients non-techniques"
    },
    {
      name: "Posture consultant",
      description: "Compréhension des enjeux business avant la technique, gestion de projet client"
    }
  ],

  languages: [
    { name: "Français", level: "Natif" },
    { name: "Anglais", level: "Opérationnel", certification: "TOEIC 900+" }
  ]
};

export const projects = [
  {
    id: "veille-automatisee-contenus-linkedin",
    title: "Veille automatisée et machine à contenus LinkedIn",
    slug: "veille-automatisee-contenus-linkedin",
    shortDescription: "Chaîne complète d'automatisation : flux RSS → qualification IA → génération de brouillons LinkedIn → images IA → publication automatique, pilotée depuis un Hub Notion à 5 bases de données interconnectées.",
    fullDescription: `Chaîne d'automatisation complète en 3 workflows n8n interconnectés pour ADN POTENTIEL. Workflow A : veille automatisée avec qualification IA (Perplexity + GPT-4 mini) toutes les 6h. Workflow B : génération de brouillons LinkedIn (150-250 mots) + images via Google Gemini. Workflow C : publication automatique LinkedIn au clic depuis Notion.`,
    category: "Automatisation",
    tags: ["n8n", "OpenAI", "Google Gemini", "LinkedIn API", "Notion", "Perplexity AI"],
    date: "2026-01",
    company: "ADN POTENTIEL",
    featured: true,
    image: "",
    problem: "Aucune présence SEO malgré 2 ans d'existence, production de contenus manuelle et chronophage (~7h/semaine), pas de système de veille sectorielle.",
    solution: "3 workflows n8n interconnectés + Hub Notion 5 bases de données : veille automatisée, génération de contenus IA, publication LinkedIn au clic.",
    impact: [
      "7h+ économisées par semaine sur la veille et la création de contenus",
      "75% de taux de validation des brouillons générés (modifications mineures uniquement)",
      "0 échec de publication en production",
      "~50 articles captés et qualifiés en quelques jours",
      "Coût API optimisé : ~5-10€/mois"
    ],
    technologies: [
      { name: "n8n", usage: "Orchestration des 3 workflows" },
      { name: "OpenAI GPT-4 mini", usage: "Qualification IA et génération de contenus" },
      { name: "Google Gemini", usage: "Génération d'images" },
      { name: "LinkedIn API v2", usage: "Publication automatique" },
      { name: "Perplexity AI", usage: "Recherche et qualification d'articles" },
      { name: "Notion", usage: "Hub de pilotage central (5 BDD interconnectées)" }
    ],
    challenges: [
      "Maintenir la voix et le ton d'ADN POTENTIEL dans les contenus générés",
      "Mécanisme anti-doublon fiable pour les publications LinkedIn",
      "Gestion gracieuse des erreurs API (token expiré, rate limits)"
    ],
    learnings: [
      "Architecture de workflows n8n en production",
      "Importance de la ligne éditoriale dans les prompts IA",
      "Valeur de la documentation pour l'autonomie client"
    ],
    media: [] as Array<{ url: string; caption?: string }>
  },
  {
    id: "enrichissement-prospects-btp",
    title: "Enrichissement automatisé de la base de prospects BTP",
    slug: "enrichissement-prospects-btp",
    shortDescription: "Workflow n8n connecté à l'API Pappers pour enrichir automatiquement 15 000+ prospects BTP avec l'âge des dirigeants et activer une micro-segmentation par tranche d'âge.",
    fullDescription: `Workflow n8n entièrement automatisé qui enrichit une base de 15 000+ prospects BTP avec l'âge et la date de naissance des dirigeants via l'API Pappers. Objectif : transformer une prospection "aveugle" en un ciblage précis par tranche d'âge (60-65 / 65-70 / 70+) pour adapter le discours commercial selon la maturité du projet de transmission.`,
    category: "Automatisation",
    tags: ["n8n", "API Pappers", "Google Sheets", "Prospection", "BTP"],
    date: "2026-01",
    company: "ADN POTENTIEL",
    featured: true,
    image: "",
    problem: "Base de 15 000+ prospects sans information sur l'âge des dirigeants. Prospection à l'aveugle : impossible de prioriser ni de segmenter. Enrichissement manuel impossible à cette échelle.",
    solution: "Workflow n8n connecté à l'API Pappers pour récupérer automatiquement la date de naissance, l'âge calculé, le statut \"senior\" (60+ ans) et la tranche d'âge de chaque dirigeant.",
    impact: [
      "85,7% de complétion — workflow opérationnel en production",
      "Traitement automatique de 15 000+ prospects par lots",
      "Micro-segmentation activée sur 3 tranches d'âge",
      "Coût marginal : quelques euros de crédits API"
    ],
    technologies: [
      { name: "n8n", usage: "Orchestration du workflow" },
      { name: "API Pappers", usage: "Données légales et dirigeants" },
      { name: "Google Sheets API", usage: "Lecture et écriture des données enrichies" }
    ],
    challenges: [
      "Gestion gracieuse des données manquantes (date de naissance non disponible dans Pappers)",
      "Traitement par lots pour 15 000+ lignes sans saturer l'API",
      "Respect des limites de rate des APIs"
    ],
    learnings: [
      "Conception de workflows robustes avec gestion d'erreurs gracieuse",
      "Valeur stratégique de la micro-segmentation",
      "Pagination et traitement en masse via API"
    ],
    media: [] as Array<{ url: string; caption?: string }>
  },
  {
    id: "automatisation-rappels-sms-greminders",
    title: "Automatisation des rappels SMS — Greminders",
    slug: "automatisation-rappels-sms-greminders",
    shortDescription: "Mise en place de Greminders pour envoyer automatiquement des rappels SMS et email aux prospects avant leurs rendez-vous avec ADN POTENTIEL, réduisant le taux de no-show sans aucun développement technique.",
    fullDescription: `Configuration de Greminders connecté au Google Calendar d'ADN POTENTIEL pour automatiser les rappels de rendez-vous. Rappel J-1 (SMS + email) et H-1 (SMS) avec messages personnalisés, lien de confirmation/annulation intégré, et notification automatique en cas d'annulation.`,
    category: "Automatisation",
    tags: ["Greminders", "Google Calendar", "No-code", "SMS", "Automatisation"],
    date: "2026-01",
    company: "ADN POTENTIEL",
    featured: false,
    image: "",
    problem: "Taux de no-show non négligeable sur les rendez-vous qualifiés. Rappels manuels chronophages (appels ou SMS envoyés à la main). Perte de temps et crédibilité sur des créneaux non honorés.",
    solution: "Configuration Greminders (SaaS no-code) connecté au Google Calendar via OAuth2 : rappels SMS + email J-1 et H-1, messages personnalisés, lien confirmation/annulation.",
    impact: [
      "Rappels SMS/email entièrement automatisés (0 action manuelle requise)",
      "Messages personnalisés avec nom du prospect et contexte du rendez-vous",
      "Lien de confirmation/annulation intégré dans chaque rappel",
      "Notification automatique en cas d'annulation",
      "Mise en place rapide sans développement"
    ],
    technologies: [
      { name: "Greminders", usage: "Plateforme SaaS de rappels automatiques" },
      { name: "Google Calendar", usage: "Intégration OAuth2 pour déclenchement automatique" }
    ],
    challenges: [
      "Rédaction de templates SMS adaptés au ton professionnel d'ADN POTENTIEL",
      "Configuration des délais optimaux pour maximiser le taux de présence"
    ],
    learnings: [
      "Valeur des outils no-code pour des gains rapides sans développement",
      "Importance de la personnalisation dans les communications automatisées"
    ],
    media: [] as Array<{ url: string; caption?: string }>
  },
  {
    id: "veille-ia-automatisee-n8n",
    title: "Veille IA automatisée — Workflow n8n",
    slug: "veille-ia-automatisee-n8n",
    shortDescription: "Workflow n8n automatisé qui génère quotidiennement un rapport de veille IA complet via Perplexity Deep Research et Grok, envoyé par email.",
    fullDescription: `Workflow n8n personnel planifié à 7h qui orchestre une veille IA multi-sources : Perplexity Sonar Deep Research (web) + xAI Grok 3 (X/Twitter), structurée par rubriques fixes (Robotique, Grandes entreprises, Startups, Prix API), convertie en HTML stylé et envoyée par Gmail.`,
    category: "Automatisation",
    tags: ["n8n", "Perplexity AI", "Grok", "OpenAI", "Gmail", "Veille"],
    date: "2025-11",
    company: "Personnel",
    featured: true,
    image: "/projects/veille-ia-n8n-workflow.png",
    problem: "Trop d'annonces et de sources sans cadre pour prioriser. Temps perdu à compiler et reformater. Pas de synthèse quotidienne automatique.",
    solution: "Workflow n8n planifié à 7h avec agent IA (GPT-4o-mini) orchestrant Perplexity (web) + Grok (X/Twitter), conversion Markdown → HTML, envoi Gmail.",
    impact: [
      "Veille quotidienne en 0 minute d'effort",
      "Rapport structuré et comparable jour après jour",
      "Vue multi-sources : web + réseaux sociaux + tableau comparatif prix API",
      "Lecture du rapport en < 10 minutes"
    ],
    technologies: [
      { name: "n8n", usage: "Orchestration du workflow" },
      { name: "OpenAI GPT-4o-mini", usage: "Agent orchestrateur et structuration du rapport" },
      { name: "Perplexity AI", usage: "Recherche web (Sonar Deep Research)" },
      { name: "xAI Grok 3", usage: "Veille X/Twitter (24h)" },
      { name: "Gmail API", usage: "Envoi du rapport HTML" }
    ],
    challenges: [
      "Réduire le bruit tout en gardant les signaux pertinents",
      "Structurer les résultats en rubriques fixes comparables chaque jour",
      "Conversion Markdown → HTML propre et lisible sur mobile"
    ],
    learnings: [
      "Conception d'agents IA orchestrateurs avec n8n",
      "Itération sur les prompts pour le ratio signal/bruit",
      "Valeur des formats stables pour la comparaison dans le temps"
    ],
    media: [
      { url: "/projects/veille-ia-n8n-workflow.png", caption: "Workflow n8n — vue d'ensemble" },
      { url: "/projects/veille-ia-gmail-rapport.png", caption: "Exemple de rapport HTML reçu par email" }
    ] as Array<{ url: string; caption?: string }>
  },
  {
    id: "excel-vba-automatisation-relances",
    title: "Automatisation des relances clients — Python/FastAPI + React",
    slug: "excel-vba-automatisation-relances",
    shortDescription: "Suite d'automatisation des relances clients pour BIGOT Matériaux : traitement des données AS/400 par backend FastAPI/Pandas et génération d'Excel formaté, avec interface React pour l'upload et les métriques.",
    fullDescription: `Backend FastAPI + Pandas qui parse, normalise, agrège et génère automatiquement un Excel formaté à partir de données brutes issues d'AS/400. Frontend React léger pour uploader les fichiers, visualiser les métriques (Chart.js) et télécharger les résultats. Remplace un processus manuel de plusieurs heures par un traitement en quelques secondes.`,
    category: "Automatisation",
    tags: ["Python", "FastAPI", "Pandas", "React", "Excel", "OpenPyXL"],
    date: "2025-06",
    company: "BIGOT Matériaux",
    featured: true,
    image: "/projects/relances-interface.png",
    problem: "Données brutes hétérogènes issues d'AS/400. Tri et mises en forme manuels très longs et sources d'erreurs. Aucune vue synthétique pour piloter les relances par vendeur, niveau et période.",
    solution: "Backend FastAPI qui parse, normalise et agrège les données (Pandas), génère un Excel formaté (OpenPyXL). Frontend React léger pour upload, métriques et téléchargement.",
    impact: [
      "Temps de préparation des relances divisé par environ 4",
      "Standardisation des fichiers envoyés et meilleure traçabilité",
      "Vision immédiate par vendeur et par niveau de relance",
      "Détection automatique des doublons sur clé multi-champs"
    ],
    technologies: [
      { name: "Python / FastAPI", usage: "Backend et API de traitement" },
      { name: "Pandas", usage: "Parsing, normalisation et agrégation des données" },
      { name: "OpenPyXL", usage: "Génération d'Excel formaté" },
      { name: "React 18", usage: "Interface d'upload et tableau de bord" },
      { name: "Chart.js", usage: "Visualisation des métriques" }
    ],
    challenges: [
      "Données brutes hétérogènes issues d'AS/400 avec formats variés",
      "Validation robuste : formats de date, montants, doublons multi-champs",
      "Interface accessible aux non-techniciens"
    ],
    learnings: [
      "Architecture backend/frontend découplée",
      "Importance de la validation de données à l'entrée",
      "Design orienté utilisateur final (non-technicien)"
    ],
    media: [
      { url: "/projects/relances-interface.png", caption: "Interface d'upload et métriques" }
    ] as Array<{ url: string; caption?: string }>
  },
  {
    id: "as400-beta-2-automatisation-comptable",
    title: "Application comptable v1 — Look & Feel AS/400",
    slug: "as400-beta-2-automatisation-comptable",
    shortDescription: "Application web qui reproduit les fonctions clés d'AS/400 et automatise les écritures récurrentes pour réduire le temps de saisie.",
    fullDescription: `Application de comptabilité moderne inspirée de l'ergonomie AS/400, développée pour le Touquet Athletic Club (TAC). Navigation clavier façon terminal (fond noir, texte vert), saisie en partie double avec validations, import bancaire OCR, génération de rapports légaux (FEC, Balance, Grand Livre, TVA), et assistant IA (Claude) pour analyse et détection d'anomalies.`,
    category: "Développement",
    tags: ["React", "TypeScript", "Node.js", "Claude API", "Supabase", "OCR"],
    date: "2025-06",
    company: "TAC Hockey Club",
    featured: false,
    image: "",
    problem: "Saisie manuelle et redondante depuis PDF. Interfaces peu accessibles et peu tolérantes aux erreurs. Difficulté à produire rapidement des états conformes (FEC, Balance, TVA).",
    solution: "Interface AS/400 look & feel (fond noir, texte vert, navigation clavier) + saisie en partie double + import OCR + rapports légaux en un clic + assistant IA Claude.",
    impact: [
      "Environ 60% de temps de saisie économisé sur les périodes récurrentes",
      "Diminution des erreurs grâce aux validations et à l'IA d'assistance",
      "Meilleure accessibilité pour des utilisateurs non experts"
    ],
    technologies: [
      { name: "React 18 + TypeScript", usage: "Frontend" },
      { name: "Vite + Tailwind CSS", usage: "Build et styles" },
      { name: "Node.js / Express", usage: "Backend API" },
      { name: "Claude (Anthropic SDK)", usage: "Assistant IA intégré" },
      { name: "Supabase / PostgreSQL", usage: "Base de données et auth" }
    ],
    challenges: [
      "Reproduire l'ergonomie AS/400 tout en modernisant l'UX",
      "Intégration d'un assistant IA qui analyse sans inventer d'écritures",
      "Conformité légale des états générés (FEC)"
    ],
    learnings: [
      "Architecture full-stack TypeScript moderne",
      "Intégration d'IA dans des applications métier critiques",
      "Importance de l'ergonomie familière pour l'adoption"
    ],
    media: [] as Array<{ url: string; caption?: string }>
  },
  {
    id: "as400-horizontal-application-comptabilite-moderne",
    title: "Application comptable v2 — Navigation horizontale + IA",
    slug: "as400-horizontal-application-comptabilite-moderne",
    shortDescription: "Nouvelle version de l'app comptable TAC Hockey : navigation horizontale fluide, assistant IA conversationnel (Claude + GenUI), Supabase, exports PDF/CSV.",
    fullDescription: `Refonte complète de l'application comptable v1 avec Next.js 15 et navigation horizontale pilotée au scroll. 9 sections (dashboard → plan → journaux → écritures → brouillard → lettrage → rapports → paramètres → IA). Assistant IA conversationnel avec streaming (Claude + Thesys GenUI). Exports PDF/CSV soignés. Base Supabase avec schémas typés.`,
    category: "Développement",
    tags: ["Next.js", "TypeScript", "Claude API", "Supabase", "Framer Motion", "Tailwind"],
    date: "2025-01",
    company: "TAC Hockey Club",
    featured: true,
    image: "/projects/as400-v2-dashboard.png",
    problem: "UX très terminale rendant l'intégration d'IA conversationnelle laborieuse. Animations et dashboards limités. Industrialisation (exports PDF/CSV soignés) demandant une stack plus moderne.",
    solution: "Next.js 15 + navigation horizontale en 9 sections + assistant IA conversationnel avec streaming (Claude + Thesys GenUI) + exports PDF/CSV soignés + Supabase.",
    impact: [
      "Parcours de bout en bout plus fluide, de la saisie à l'édition des états",
      "Meilleure compréhension immédiate via dashboards et vues par section",
      "Base technique prête pour l'authentification multi-sociétés et les rôles"
    ],
    technologies: [
      { name: "Next.js 15 / React 18", usage: "Frontend avec App Router" },
      { name: "TypeScript + Tailwind + Radix UI", usage: "UI et composants" },
      { name: "Claude (Anthropic SDK)", usage: "Assistant IA conversationnel avec streaming" },
      { name: "Thesys GenUI", usage: "Génération d'UI dynamique par l'IA" },
      { name: "Supabase / PostgreSQL", usage: "Base de données, auth et RLS" },
      { name: "jsPDF", usage: "Export PDF" }
    ],
    challenges: [
      "Navigation horizontale fluide pilotée au scroll vertical",
      "Assistant IA qui répond et explique sans jamais inventer d'écritures",
      "Performances avec virtual scrolling sur gros volumes de données"
    ],
    learnings: [
      "Architecture Next.js 15 App Router avec composants server/client",
      "Streaming d'IA dans des applications métier",
      "Design système cohérent pour une application complexe"
    ],
    media: [
      { url: "/projects/as400-v2-dashboard.png", caption: "Tableau de bord et navigation horizontale" },
      { url: "/projects/as400-v2-assistant-ia.png", caption: "Assistant IA comptable" },
      { url: "/projects/as400-v2-assistant-ia-2.png", caption: "Assistant IA — analyse contextuelle" }
    ] as Array<{ url: string; caption?: string }>
  }
];

type ContentSection = {
  type: 'heading' | 'paragraph' | 'list' | 'quote' | 'code';
  text?: string;
  items?: string[];
};

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  readingTime: string;
  category: string;
  featured: boolean;
  published: boolean;
  content?: ContentSection[];
};

export const blogPosts: BlogPost[] = [
  {
    id: "impact-ia-metiers-du-futur",
    title: `L'impact de l'IA sur les métiers du futur`,
    slug: "impact-ia-metiers-du-futur",
    excerpt: `90% des métiers actuels vont disparaître avec l'IA. Ce n'est pas du catastrophisme, c'est une observation lucide de ce qui est déjà en train de se passer sous nos yeux.`,
    date: "2025-10",
    readingTime: "8 min",
    category: "Vision",
    featured: false,
    published: true,
    content: [
      { type: "paragraph", text: `Je vais vous partager une conviction qui guide toutes mes décisions d'orientation professionnelle : 90% des métiers actuels vont disparaître avec l'intelligence artificielle.` },
      { type: "paragraph", text: `Pas "évoluer". Pas "se transformer légèrement". Disparaître.` },
      { type: "paragraph", text: `Et ce n'est pas une prédiction catastrophiste. C'est une observation lucide de ce qui est déjà en train de se passer sous nos yeux.` },
      { type: "heading", text: `La fin d'une ère` },
      { type: "paragraph", text: `Regardez autour de vous. Combien de tâches dans votre travail quotidien pourraient déjà être automatisées par l'IA ? Combien de métiers reposent essentiellement sur le traitement d'informations, la rédaction de documents, l'analyse de données, la production de contenus répétitifs ?` },
      { type: "paragraph", text: `J'ai eu l'occasion de travailler dans l'entreprise familiale. J'ai vu des tâches administratives et comptables qui prenaient des heures. J'ai créé des automatisations qui les font maintenant en quelques minutes. Pipeline d'extraction de relevés bancaires, automatisation des relances clients, génération de procès-verbaux... Tout ça, c'était du travail humain il y a encore quelques années. Aujourd'hui, c'est du code.` },
      { type: "paragraph", text: `Et ce n'est que le début.` },
      { type: "heading", text: `Les métiers qui vont survivre` },
      { type: "paragraph", text: `Face à cette transformation radicale, une question s'impose : quels métiers vont perdurer ?` },
      { type: "paragraph", text: `Pour moi, la réponse est claire. Six catégories vont résister à l'automatisation :` },
      { type: "heading", text: `1. Les experts en intelligence artificielle` },
      { type: "paragraph", text: `Évident, non ? Tant qu'on construira, déploiera et maintiendra des systèmes d'IA, il faudra des gens qui comprennent comment ça fonctionne. La demande de connaissances dans ce domaine va exploser.` },
      { type: "heading", text: `2. Les ingénieurs` },
      { type: "paragraph", text: `Quelqu'un devra bien intégrer l'IA dans le monde physique. Robots humanoïdes, bras robotiques, infrastructures intelligentes... L'IA est puissante, mais elle a besoin d'interfaces avec le réel. Et ça, c'est le boulot des ingénieurs.` },
      { type: "heading", text: `3. Les métiers du sport` },
      { type: "paragraph", text: `Le corps humain ne se virtualise pas. Le besoin de mouvement, de compétition physique, d'entraînement restera. Et dans un monde où l'effort physique disparaît du travail, le sport deviendra encore plus central.` },
      { type: "heading", text: `4. Les professions de santé et du bien-être` },
      { type: "paragraph", text: `Médecins, infirmiers, kinés, nutritionnistes... Tant qu'il y aura des corps humains, il faudra s'en occuper. Et peut-être même plus qu'avant, justement parce que le reste de notre vie sera facilité.` },
      { type: "heading", text: `5. La psychologie et l'accompagnement mental` },
      { type: "paragraph", text: `Dans un monde où 90% des gens n'auront plus de travail traditionnel, qui va gérer la crise existentielle collective ? Les psychologues. Le besoin d'accompagnement mental va exploser quand les gens devront redéfinir leur identité en dehors du travail.` },
      { type: "heading", text: `6. Les métiers artistiques` },
      { type: "paragraph", text: `La créativité authentique, l'expression personnelle, l'art qui vient d'une expérience humaine unique... L'IA peut imiter, mais elle ne peut pas vivre. Et c'est ça que les gens chercheront de plus en plus.` },
      { type: "heading", text: `Le grand basculement sociétal` },
      { type: "paragraph", text: `Mais au-delà de la question des métiers, ce qui m'intéresse vraiment, c'est la transformation sociétale que ça va provoquer.` },
      { type: "paragraph", text: `Aujourd'hui, nous vivons dans une société de la productivité. Notre valeur est mesurée par notre capacité à produire, à être efficaces, à générer des résultats. Nos conversations tournent autour du travail. Notre identité est liée à notre métier.` },
      { type: "paragraph", text: `Demain ? Nous vivrons dans une société du bien-être.` },
      { type: "heading", text: `De la productivité au bien-être` },
      { type: "paragraph", text: `Pensez-y : quand 90% des métiers auront disparu, quand l'IA fera le gros du travail de production, sur quoi allons-nous concentrer notre attention ?` },
      { type: "paragraph", text: `Sur nous-mêmes. Sur notre santé. Sur notre développement personnel. Sur nos relations. Sur notre épanouissement.` },
      { type: "paragraph", text: `On ne se demandera plus "Comment puis-je être plus productif ?" mais "Comment puis-je être mieux ?"` },
      { type: "list", items: [
        `Quelle est la meilleure alimentation pour mon corps ?`,
        `Comment optimiser mon sommeil ?`,
        `Quelles activités physiques me conviennent le mieux ?`,
        `Comment cultiver ma créativité ?`,
        `Comment approfondir mes relations ?`
      ] },
      { type: "paragraph", text: `C'est pour ça que je suis convaincu que les métiers liés à la santé, au sport, au bien-être et à la psychologie vont exploser. Nous n'aurons plus à nous préoccuper de la productivité, nous pourrons enfin nous préoccuper de vivre bien.` },
      { type: "heading", text: `Pourquoi cette conviction guide mon orientation` },
      { type: "paragraph", text: `Vous comprenez maintenant pourquoi je me dirige vers l'IA ?` },
      { type: "paragraph", text: `Je n'ai aucune envie de passer trois ans à me former dans un domaine qui n'existera plus dans dix ans. Je n'ai aucune envie de subir cette transformation en spectateur.` },
      { type: "paragraph", text: `La comptabilité ? Dans quelques années, l'IA fera tout le travail technique. Il restera du conseil de haut niveau, mais il faudra être expert-comptable pour avoir un impact, et même là...` },
      { type: "paragraph", text: `La finance ? Saturé. Et en plus, l'IA va automatiser une grande partie de l'analyse financière.` },
      { type: "paragraph", text: `Le marketing digital ? Déjà submergé par l'IA générative qui produit du contenu à l'infini.` },
      { type: "paragraph", text: `Non, je veux être du côté de ceux qui construisent cette révolution. Pas du côté de ceux qui la subissent.` },
      { type: "heading", text: `Les compétences du futur` },
      { type: "paragraph", text: `Si ma vision se réalise, et je suis persuadé qu'elle se réalisera, quelles compétences faudra-t-il cultiver ?` },
      { type: "list", items: [
        `Comprendre l'IA et savoir l'utiliser - Pas forcément coder des modèles, mais au minimum savoir identifier où l'IA peut apporter de la valeur et comment la déployer.`,
        `Développer sa créativité authentique - Ce qui nous rendra irremplaçables, c'est notre capacité à créer quelque chose d'unique, né de notre expérience humaine.`,
        `Cultiver les compétences relationnelles - Dans un monde automatisé, la connexion humaine authentique deviendra rare et précieuse.`,
        `Maîtriser le bien-être physique et mental - Savoir prendre soin de soi et des autres sera la compétence centrale d'une société post-productivité.`,
        `Être capable de traduire la technologie en usage - Faire le pont entre les capacités de l'IA et les besoins humains réels.`
      ] },
      { type: "heading", text: `Une révolution à construire, pas à subir` },
      { type: "paragraph", text: `Voilà ma vision. Peut-être trop radicale pour certains. Peut-être trop rapide. Mais je préfère anticiper et me préparer à un changement majeur plutôt que de me réveiller dans cinq ans en réalisant que j'ai passé mon temps à acquérir des compétences obsolètes.` },
      { type: "paragraph", text: `Je n'ai pas envie de subir cette révolution. J'ai envie de la construire.` },
      { type: "paragraph", text: `Et si je me trompe ? Si seulement 50% des métiers disparaissent ? Si ça prend vingt ans au lieu de dix ?` },
      { type: "paragraph", text: `Dans tous les cas, je serai du bon côté de la transformation. Avec des compétences en IA qui seront utiles quoi qu'il arrive. Prêt à naviguer dans ce nouveau monde plutôt qu'à y chercher désespérément ma place.` },
      { type: "paragraph", text: `Le futur du travail est en train de se redéfinir. Et je compte bien avoir mon mot à dire dans sa construction.` }
    ]
  },
  {
    id: "ia-ethique-responsabilite-trois-scenarios",
    title: `IA, éthique et responsabilité: trois scénarios possibles`,
    slug: "ia-ethique-responsabilite-trois-scenarios",
    excerpt: `Je ne veux pas être responsable de l'abrutissement cognitif de ma génération. Mais je veux aussi contribuer à une IA qui aide vraiment les humains. Comment naviguer entre ces deux injonctions ?`,
    date: "2025-10",
    readingTime: "6 min",
    category: "Éthique",
    featured: false,
    published: true,
    content: [
      { type: "paragraph", text: `Depuis trois ans maintenant, je suis de près l'évolution de l'intelligence artificielle. Depuis sa sortie fin 2022, je passe mes journées à me tenir informé, à tester, à comprendre les implications de cette technologie. Et plus j'avance dans cette exploration, plus une question me hante : comment concilier mon engagement dans l'IA avec ma responsabilité éthique ?` },
      { type: "heading", text: `Le dilemme qui me pousse à réfléchir` },
      { type: "paragraph", text: `Quand je regarde autour de moi, je vois l'impact des technologies sur nos capacités cognitives. TikTok, les réseaux sociaux, maintenant les chatbots IA... tout ça a déjà commencé à modifier notre façon de penser, de réfléchir. 90% des gens utilisent l'IA pour qu'elle fasse le travail de réflexion à leur place. Et ça, ça me pose un vrai problème.` },
      { type: "paragraph", text: `Je ne veux pas être responsable de l'abrutissement cognitif de ma génération. Je ne veux pas proposer mes services en IA si c'est pour contribuer à la dégradation des capacités intellectuelles des gens auxquels je m'adresse.` },
      { type: "heading", text: `L'analogie avec nos capacités physiques` },
      { type: "paragraph", text: `Pensez-y : il y a des siècles, les humains étaient naturellement musclés et sveltes. Pourquoi ? Parce que leur travail nécessitait des efforts physiques constants. Ils se musclaient inconsciemment, simplement en travaillant. Puis nous avons mécanisé, automatisé, facilité. Aujourd'hui, ceux qui font du sport doivent le faire consciemment, avec discipline.` },
      { type: "paragraph", text: `Le même phénomène est en train de se produire avec nos capacités cognitives. Nous utilisions notre réflexion inconsciemment parce qu'elle était nécessaire à notre travail. Avec l'IA, nous allons de moins en moins solliciter ces capacités. Et voilà le danger : si nous perdons nos capacités cognitives, nous ne pourrons plus nous forcer consciemment à réfléchir. Nous nous lèverons, mangerons, et repartirons dormir. Comme des animaux.` },
      { type: "paragraph", text: `Je ne pense pas qu'une majorité d'humains soit favorable à ça. En tout cas, moi non.` },
      { type: "heading", text: `Mes trois scénarios pour assumer mon orientation` },
      { type: "paragraph", text: `Face à ce dilemme, j'ai identifié trois voies possibles qui me permettraient de poursuivre dans l'IA tout en assumant ma responsabilité :` },
      { type: "heading", text: `1. Miser sur la régulation conditionnelle` },
      { type: "paragraph", text: `Premier scénario : je me persuade que, sur le long terme, quelqu'un va inventer une réglementation qui donnera accès à l'IA seulement aux personnes qui fournissent un effort physique et cognitif quotidien.` },
      { type: "paragraph", text: `Une sorte de "permis d'utilisation de l'IA" conditionné à des preuves d'efforts. Vous voulez utiliser l'IA ? Prouvez d'abord que vous maintenez vos capacités intellectuelles et physiques à niveau. Cela forcerait les gens à rester actifs mentalement et physiquement, tout en bénéficiant des avantages de l'IA.` },
      { type: "paragraph", text: `C'est optimiste, peut-être naïf, mais ça me permettrait de travailler dans ce domaine avec la conscience tranquille.` },
      { type: "heading", text: `2. Le pari économique` },
      { type: "paragraph", text: `Deuxième scénario : je me convaincs que l'impact économique positif de l'IA justifie mon engagement.` },
      { type: "paragraph", text: `Matthias Baccino, directeur Europe de Trade Republic, a dit quelque chose qui m'a marqué : "L'IA peut générer 1% de croissance supplémentaire par an, ce qui aurait un impact considérable sur les salaires, le budget de l'État et le développement des entreprises. Mais à une condition : pour qu'il y ait 1% de croissance en plus grâce à l'IA, il faut que 70% des entreprises s'en servent. Aujourd'hui, seulement 10% l'utilisent en France. L'enjeu, c'est l'adoption et la formation."` },
      { type: "paragraph", text: `Si je pars du principe que mon travail contribue à cette adoption massive nécessaire, et que cette adoption va effectivement générer cette croissance bénéfique pour tous, alors je peux justifier mon orientation.` },
      { type: "paragraph", text: `C'est un pari sur l'impact économique collectif qui compenserait les risques individuels de dégradation cognitive.` },
      { type: "heading", text: `3. Assumer pleinement ma responsabilité` },
      { type: "paragraph", text: `Troisième scénario : le plus brutal, le plus honnête aussi. Je me lance dans l'IA sans excuse, sans filet de sécurité moral. Et si aucun des deux premiers scénarios ne se réalise, j'assume ma part de responsabilité dans ce qui pourrait advenir.` },
      { type: "paragraph", text: `Pas d'échappatoire, pas de justification a posteriori. J'y vais les yeux ouverts, en sachant que je contribue peut-être à quelque chose de néfaste, mais en acceptant d'en porter la responsabilité.` },
      { type: "heading", text: `Pourquoi je choisis quand même l'IA` },
      { type: "paragraph", text: `Malgré ces préoccupations éthiques, je reste convaincu d'une chose : je ne veux pas subir cette révolution, je veux la construire.` },
      { type: "paragraph", text: `J'ai 20 ans. J'ai trois ans d'avance sur la plupart des gens autour de moi dans ce domaine. J'ai développé une expertise autodidacte qui me permet de voir immédiatement où l'IA peut apporter une vraie plus-value. J'ai automatisé des processus dans l'entreprise familiale, j'ai créé des solutions concrètes, j'ai compris les mécanismes.` },
      { type: "paragraph", text: `Les métiers du futur ? Pour moi, c'est clair : santé, bien-être, sport, IA, arts. Le reste va disparaître ou se transformer radicalement. Je ne veux pas me former pendant trois ans dans un domaine qui n'existera plus dans dix ans.` },
      { type: "heading", text: `Un choix à assumer` },
      { type: "paragraph", text: `Alors oui, il y a cette tension entre éthique et opportunité. Entre mes principes et la réalité du marché. Entre ce que je pense être juste et ce que je sais être possible.` },
      { type: "paragraph", text: `Mais au fond, j'ai fait mon choix. Je vais dans l'IA. Peut-être en espérant le premier scénario. Probablement en pariant sur le deuxième. Certainement en étant prêt à assumer le troisième.` },
      { type: "paragraph", text: `Parce qu'au final, rester en retrait ne changerait rien. D'autres prendront ma place. Autant être de ceux qui construisent, qui réfléchissent, qui essaient de faire les choses avec conscience.` },
      { type: "paragraph", text: `L'enfer est pavé de bonnes intentions, dit-on. Mais l'inaction aussi a ses responsabilités.` }
    ]
  },
  {
    id: "bulle-ia-analyse",
    title: `Sommes-nous dans une bulle IA ?`,
    slug: "bulle-ia-analyse",
    excerpt: `Suis-je en train de monter dans un train qui va dérailler ? Avec Michael Burry qui parie contre Nvidia et les valorisations qui explosent, j'ai voulu analyser la situation moi-même.`,
    date: "2025-10",
    readingTime: "12 min",
    category: "Marché",
    featured: false,
    published: true,
    content: [
      { type: "paragraph", text: `Depuis que j'ai décidé de m'orienter vers l'IA, une question me hante : suis-je en train de monter dans un train qui va dérailler ?` },
      { type: "paragraph", text: `Partout, on parle de bulle de l'IA. Les recherches Google pour "AI bubble" ont explosé. Les investisseurs sont nerveux. 54% des gestionnaires de fonds mondiaux pensent qu'on est en territoire de bulle. Même Sam Altman, le PDG d'OpenAI, met en garde contre la surenchère.` },
      { type: "paragraph", text: `Alors, sommes-nous vraiment dans une bulle ? Ou est-ce simplement la peur classique face à une révolution technologique majeure ?` },
      { type: "paragraph", text: `Et le signal le plus troublant : Michael Burry, l'investisseur légendaire qui avait prédit le krach des subprimes de 2008, a pris des positions à découvert contre Nvidia et Palantir. Quand celui qui a vu venir 2008 parie sur un krach de l'IA, ça mérite qu'on y prête attention.` },
      { type: "paragraph", text: `Mise à jour novembre 2025 : Les prédictions de Burry commencent à se matérialiser. Nvidia a perdu 450 milliards de dollars en seulement 3 jours début novembre, et Burry a fermé son hedge fund Scion Asset Management le 10 novembre 2025, déclarant que "son estimation de la valeur des titres n'est plus en phase avec les marchés". Le signal d'alarme est désormais assourdissant.` },
      { type: "paragraph", text: `Voici mon analyse mise à jour, après avoir creusé le sujet en profondeur.` },
      { type: "heading", text: `Le parallèle troublant avec l'an 2000` },
      { type: "paragraph", text: `Difficile de ne pas faire le rapprochement avec la bulle Internet de la fin des années 90.` },
      { type: "heading", text: `Ce qui se ressemble` },
      { type: "paragraph", text: `Les valorisations folles : Entre 1995 et 2000, le Nasdaq a quadruplé. Des actions s'achetaient même quand les entreprises n'avaient aucun chiffre d'affaires. Cisco, qui vendait de l'équipement réseau, a vu son action monter de 883% en trois ans.` },
      { type: "paragraph", text: `Aujourd'hui ? Des startups d'IA sont valorisées à 250 fois leur chiffre d'affaires annuel. OpenAI était en discussion pour atteindre 300 milliards de dollars de valorisation début 2025.` },
      { type: "paragraph", text: `Le même discours : "Internet va tout changer" est devenu "L'IA va tout changer". Le narratif est identique.` },
      { type: "paragraph", text: `Les investissements massifs : L'investissement dans l'équipement informatique et les logiciels représente 4,4% du PIB américain aujourd'hui, presque autant que les 4,6% du pic de la bulle dot-com.` },
      { type: "paragraph", text: `Le symbole : Cisco à l'époque, Nvidia aujourd'hui. Nvidia a triplé de valeur depuis début 2024. La moitié de tout l'argent investi dans l'IA finirait dans ses poches.` },
      { type: "heading", text: `Ce qui change tout` },
      { type: "paragraph", text: `Mais attention. La différence fondamentale, c'est la rentabilité.` },
      { type: "paragraph", text: `En 2000, seulement 14% des entreprises tech étaient rentables. Aujourd'hui, Microsoft, Google, Nvidia sont déjà extrêmement profitables. Nvidia affiche une marge nette de plus de 52%. Ces entreprises dégagent des milliards de bénéfices, pas des promesses.` },
      { type: "paragraph", text: `Le ratio cours/bénéfice du Nasdaq était de 60x en mars 2000. Fin 2023 ? 26x. Deux fois moins extrême.` },
      { type: "heading", text: `Novembre 2025 : La correction commence` },
      { type: "heading", text: `La chute spectaculaire de Nvidia` },
      { type: "paragraph", text: `Le 29 octobre 2025, Nvidia atteignait un sommet historique à 212,19$ par action, avec une capitalisation boursière de 5,156 trillions de dollars, devenant la première entreprise au monde à franchir ce seuil.` },
      { type: "paragraph", text: `Puis tout a basculé.` },
      { type: "paragraph", text: `En seulement 3 jours début novembre, Nvidia a perdu 450 milliards de dollars de valorisation. L'action est retombée autour de 188-198$, soit une chute de près de 20% depuis le début de 2025.` },
      { type: "paragraph", text: `Ce qui est frappant, ce n'est pas tant la volatilité (normale pour une valeur tech), mais le timing : cela arrive exactement au moment où les doutes sur la rentabilité réelle de l'IA commencent à se matérialiser.` },
      { type: "heading", text: `Michael Burry ferme son hedge fund` },
      { type: "paragraph", text: `Le 10 novembre 2025, Michael Burry a officiellement désenregistré son hedge fund Scion Asset Management auprès de la SEC. Dans une lettre datée du 27 octobre à ses investisseurs, il écrit :` },
      { type: "quote", text: `"Mon estimation de la valeur des titres n'est pas, et n'a pas été depuis longtemps, en phase avec les marchés."` },
      { type: "paragraph", text: `Ce n'est pas anodin. Burry avait pris des positions short massives contre Nvidia et Palantir pour 1,1 milliard de dollars en put options. Il parie littéralement sur l'effondrement des valorisations de l'IA.` },
      { type: "paragraph", text: `Quand l'homme qui a vu venir la crise des subprimes en 2008 ferme boutique en déclarant que le marché est déconnecté de la réalité, ça devrait nous faire réfléchir.` },
      { type: "heading", text: `Le PDG de Palantir répond` },
      { type: "paragraph", text: `Alex Karp, PDG de Palantir (une des cibles de Burry), a qualifié les positions de Burry de "complètement dingues" (bats--- crazy), déclarant sur CNBC :` },
      { type: "quote", text: `"Les deux entreprises qu'il short sont celles qui font tout l'argent, ce qui est super bizarre."` },
      { type: "paragraph", text: `Mais est-ce vraiment bizarre ? Ou est-ce justement parce qu'elles font "tout l'argent" qu'elles sont survalorisées ?` },
      { type: "heading", text: `Le système d'investissement circulaire : comment ça marche vraiment` },
      { type: "paragraph", text: `Voici le truc qui m'a vraiment interpellé dans mes recherches : le système d'investissement croisé. C'est complexe, alors laissez-moi vous l'expliquer simplement.` },
      { type: "heading", text: `L'investissement croisé, version simple` },
      { type: "paragraph", text: `Imaginez que vous voulez ouvrir un restaurant, mais que l'équipement de cuisine coûte extrêmement cher. Le fabricant d'équipement de cuisine, au lieu de simplement vous vendre son matériel, décide d'investir dans votre restaurant. En échange, vous vous engagez à acheter tout votre équipement exclusivement chez lui, et à faire la promotion de sa marque.` },
      { type: "paragraph", text: `Résultat ? Le fabricant se paie lui-même avec son propre argent. Il investit 1 million dans votre restaurant, et vous lui achetez pour 1 million d'équipement avec cet argent. Sur le papier, il a des revenus en hausse. Mais en réalité, c'est de l'argent qui circule en boucle.` },
      { type: "paragraph", text: `C'est exactement ce qui se passe dans l'IA en ce moment.` },
      { type: "heading", text: `Les investissements croisés dans l'IA : le système complet` },
      { type: "paragraph", text: `Prenons des exemples concrets :` },
      { type: "paragraph", text: `Microsoft et OpenAI : Microsoft a investi plusieurs milliards de dollars dans OpenAI. Mais cet investissement prend une forme particulière : Microsoft fournit à OpenAI des capacités de calcul sur Azure (son cloud). OpenAI utilise donc l'argent de Microsoft pour... acheter des services Microsoft. Et en retour, Microsoft intègre les modèles d'OpenAI dans ses produits (Copilot dans Word, Excel, Bing).` },
      { type: "paragraph", text: `Amazon, Google et Anthropic : Amazon investit 4 milliards dans Anthropic. Google investit 2 milliards. Que fait Anthropic avec cet argent ? Elle achète de la puissance de calcul sur AWS (Amazon) et Google Cloud. L'argent revient aux investisseurs.` },
      { type: "paragraph", text: `Nvidia et tout le monde : Nvidia, le fabricant de puces, a investi dans Mistral AI, Inflection, HuggingFace, AI21 Labs, CoreWeave... Que font toutes ces startups avec cet argent ? Elles achètent des GPU Nvidia.` },
      { type: "heading", text: `Pourquoi c'est inquiétant` },
      { type: "paragraph", text: `Ce système crée une illusion de croissance. Les revenus de Nvidia explosent, mais une partie significative vient d'argent qu'elle a elle-même injecté dans l'écosystème.` },
      { type: "paragraph", text: `Plus de 1000 milliards de dollars de partenariats ont été signés par OpenAI en quelques semaines. Des montants colossaux circulent, mais créent-ils vraiment de la valeur ou simplement du mouvement ?` },
      { type: "paragraph", text: `C'est typique des bulles spéculatives : un écosystème qui s'auto-alimente.` },
      { type: "heading", text: `La vraie fracture : infrastructure vs applications` },
      { type: "paragraph", text: `Après avoir analysé en profondeur, j'en suis arrivé à cette conclusion : il n'y a pas UNE bulle IA, mais DEUX marchés complètement différents.` },
      { type: "heading", text: `1. L'infrastructure : des fondations qui tremblent ?` },
      { type: "paragraph", text: `Les fournisseurs de puissance de calcul (Nvidia, Microsoft, Amazon, Google) ont des fondamentaux économiques solides :` },
      { type: "list", items: [
        `Actifs tangibles : Centres de données, serveurs, puces. Ça a une valeur réelle, contrairement aux "espoirs virtuels" de l'an 2000.`,
        `Marges colossales : 60% de marge nette pour certains fabricants de puces.`,
        `Cash flow établi : Ces entreprises génèrent des milliards de profits réels, aujourd'hui.`,
        `Utilité prouvée : Que les applications d'IA réussissent ou échouent, la puissance de calcul reste nécessaire pour l'innovation.`
      ] },
      { type: "paragraph", text: `Métaphore : Si l'IA est une ruée vers l'or, Nvidia vend les pelles. Et historiquement, ce sont ceux qui vendent les pelles qui font fortune, pas ceux qui cherchent l'or.` },
      { type: "paragraph", text: `Mais attention : La perte de 450 milliards en 3 jours de Nvidia montre que même l'infrastructure n'est pas immunisée contre la correction. Les valorisations, même pour des entreprises profitables, peuvent être déconnectées de la réalité.` },
      { type: "heading", text: `2. Les applications : un château de cartes` },
      { type: "paragraph", text: `Les startups d'IA générative, elles, sont dans une situation complètement différente :` },
      { type: "list", items: [
        `Valorisations délirantes : 250x leur chiffre d'affaires pour certaines.`,
        `Pas de rentabilité : Une étude du MIT montre que 95% des projets d'IA en entreprise n'ont aucun retour sur investissement.`,
        `Faible adoption réelle : Seulement 10% des entreprises américaines utilisent l'IA activement, malgré les investissements massifs.`
      ] },
      { type: "paragraph", text: `Le problème fondamental : Ces startups brûlent des millions pour créer des modèles que les gens ne sont pas prêts à payer au prix qu'il faudrait pour être rentable.` },
      { type: "heading", text: `L'image du gratte-ciel` },
      { type: "paragraph", text: `La meilleure analogie que j'ai trouvée : l'économie de l'IA est comme un gratte-ciel.` },
      { type: "list", items: [
        `Les fondations (l'infrastructure) sont extrêmement solides, en béton armé.`,
        `Mais les étages supérieurs (les applications) sont construits à une vitesse vertigineuse, avec des matériaux fragiles, sans avoir trouvé comment générer assez de revenus pour justifier leur hauteur.`
      ] },
      { type: "paragraph", text: `Le risque ? Pas un effondrement total du bâtiment, mais un effondrement partiel des étages supérieurs.` },
      { type: "paragraph", text: `Novembre 2025 : Les premières fissures apparaissent même dans les fondations.` },
      { type: "heading", text: `Les facteurs qui pourraient déclencher la correction` },
      { type: "paragraph", text: `Plusieurs scénarios pourraient faire exploser la bulle (des applications, et possiblement de l'infrastructure) :` },
      { type: "heading", text: `1. La commoditisation des modèles` },
      { type: "paragraph", text: `Le coût des grands modèles de langage chute de manière exponentielle : jusqu'à 200x par an après janvier 2024.` },
      { type: "paragraph", text: `Si tout le monde peut accéder à des modèles puissants pour presque rien, comment les startups vont-elles justifier leurs valorisations stratosphériques ?` },
      { type: "heading", text: `2. La pression réglementaire` },
      { type: "paragraph", text: `L'AI Act européen arrive en 2026, avec des sanctions allant jusqu'à 7% du chiffre d'affaires mondial ou 35 millions d'euros. Les jeunes startups à forte croissance mais faible maturité de gouvernance vont souffrir.` },
      { type: "heading", text: `3. La déception des bénéfices` },
      { type: "paragraph", text: `Si les gains de productivité promis par l'IA tardent à arriver (et pour l'instant, 95% des projets échouent), les investisseurs vont décrocher brutalement.` },
      { type: "paragraph", text: `C'est en train de se produire : Malgré des résultats financiers solides, Nvidia et Palantir voient leurs actions plonger. Le marché commence à douter.` },
      { type: "heading", text: `4. L'effet domino de la concentration` },
      { type: "paragraph", text: `Le marché est ultra-concentré : les 7 plus grandes entreprises du S&P 500 représentent plus de 30% de l'indice. L'IA a généré 75% des gains du S&P 500 depuis ChatGPT. Si un acteur clé comme OpenAI échoue à rentabiliser ses investissements massifs, un effet domino pourrait se propager.` },
      { type: "heading", text: `5. Le cygne noir géopolitique ou technologique` },
      { type: "paragraph", text: `Une crise à Taïwan paralysant la production de puces, une percée dans le calcul quantique rendant l'infrastructure actuelle obsolète, une hausse brutale des taux de la Fed... Les déclencheurs potentiels ne manquent pas.` },
      { type: "heading", text: `Alors, bulle ou pas bulle ?` },
      { type: "paragraph", text: `Ma conclusion après tout ce travail d'analyse, mise à jour en novembre 2025 :` },
      { type: "paragraph", text: `Ce n'est plus une hypothèse, c'est en train d'arriver. Nous sommes au début d'une correction industrielle majeure.` },
      { type: "paragraph", text: `Voici ce que je retiens :` },
      { type: "paragraph", text: `⚠️ L'infrastructure commence à craquer : La perte de 450 milliards de Nvidia montre que même les fondations solides ne sont pas à l'abri quand les valorisations dépassent la réalité.` },
      { type: "paragraph", text: `🚨 La bulle des applications éclate : La majorité des startups d'IA générative sont survalorisées, non rentables, et la correction est inévitable.` },
      { type: "paragraph", text: `🎯 L'IA elle-même est réelle : La technologie fonctionne, apporte des gains mesurables dans des cas d'usage précis (j'en ai fait l'expérience avec mes automatisations qui atteignent 85% de gain de temps).` },
      { type: "paragraph", text: `📉 Burry avait raison : Sa décision de fermer son fonds après avoir shorté Nvidia et Palantir est un signal d'alarme majeur. Il préfère sortir du jeu plutôt que de continuer dans un marché qu'il juge irrationnel.` },
      { type: "heading", text: `Ce que ça change pour mon orientation` },
      { type: "paragraph", text: `Cette analyse, et surtout les événements de novembre 2025, ne me font pas reculer dans mon choix de me diriger vers l'IA. Au contraire, cela confirme l'importance de bien choisir où positionner mes efforts.` },
      { type: "paragraph", text: `Ce qu'il faut absolument éviter : Les startups d'IA générative à la valorisation délirante qui vendent du vent et brûlent du cash sans modèle économique clair. La correction va les balayer.` },
      { type: "paragraph", text: `Ce qu'il faut viser : Les projets qui s'appuient sur l'infrastructure (même affaiblie temporairement) pour créer de la valeur concrète et mesurable. Les applications qui ont un ROI clair, pas juste une promesse futuriste.` },
      { type: "paragraph", text: `Je veux être du côté de ceux qui construisent des solutions qui résolvent vraiment des problèmes, pas du côté de ceux qui surfent sur une vague spéculative avant qu'elle ne s'écrase.` },
      { type: "paragraph", text: `La leçon de Burry : Quand le marché devient irrationnel, les plus intelligents sortent du jeu. Mais cela ne veut pas dire que la technologie sous-jacente n'a pas de valeur. Cela signifie simplement qu'il faut attendre que les valorisations reviennent à la réalité.` },
      { type: "paragraph", text: `Parce qu'au final, même si 95% des projets d'IA échouent, les 5% qui réussiront créeront une valeur immense. Et je compte bien faire partie de ces 5%.` },
      { type: "paragraph", text: `La bulle éclate en ce moment même. Mais la technologie, elle, restera. Et ceux qui sauront l'utiliser intelligemment, avec des modèles économiques solides, auront toujours leur place.` },
      { type: "paragraph", text: `Novembre 2025 est un tournant. La question n'est plus "y aura-t-il une correction ?" mais "comment survivre à la correction qui arrive ?"` }
    ]
  },
  {
    id: "api-vs-interface-web-securite-donnees",
    title: `API vs Interface Web : pourquoi je ne mettrai jamais mes données sensibles dans ChatGPT`,
    slug: "api-vs-interface-web-securite-donnees",
    excerpt: `79% des données exposées via l'IA transitent par ChatGPT. Pourtant, il existe une alternative beaucoup plus sécurisée pour les entreprises : l'API directe.`,
    date: "2025-11",
    readingTime: "10 min",
    category: "Technique",
    featured: false,
    published: true,
    content: [
      { type: "paragraph", text: `Depuis que j'ai commencé à automatiser des processus pour l'entreprise familiale, j'ai dû me poser une question cruciale : où est-ce que je mets les données sensibles quand j'utilise l'IA ?` },
      { type: "paragraph", text: `Parce que voilà le truc : quand on parle d'IA en entreprise, tout le monde pense immédiatement à ChatGPT. On ouvre le navigateur, on tape notre question, on obtient une réponse. Simple, rapide, efficace.` },
      { type: "paragraph", text: `Sauf que c'est exactement comme ça qu'on fuit des données sensibles.` },
      { type: "paragraph", text: `79,1% des données exposées via l'IA générative transitent par ChatGPT. Près d'un salarié sur deux utilise ces outils, et beaucoup manipulent sans le savoir des informations sensibles dans leurs échanges.` },
      { type: "paragraph", text: `Alors, comment on fait ? Comment on profite de la puissance de l'IA sans compromettre la sécurité de nos données ?` },
      { type: "paragraph", text: `La réponse tient en trois lettres : API.` },
      { type: "paragraph", text: `Laissez-moi vous expliquer pourquoi la distinction entre interface web et API est probablement l'un des sujets les plus importants (et les plus ignorés) de l'adoption de l'IA en entreprise.` },
      { type: "heading", text: `Interface Web vs API : la différence fondamentale` },
      { type: "heading", text: `L'interface web, c'est la vitrine` },
      { type: "paragraph", text: `Quand vous allez sur ChatGPT, Claude, ou n'importe quel chatbot d'IA, vous utilisez une interface web publique. C'est comme entrer dans un magasin : il y a une belle devanture, c'est accueillant, facile d'accès, tout le monde peut y entrer.` },
      { type: "paragraph", text: `Vous tapez votre texte dans une boîte de dialogue, vous appuyez sur Entrée, et boom, vous obtenez une réponse. L'interface se charge de tout : affichage, historique, suggestions.` },
      { type: "paragraph", text: `Le problème ? Cette simplicité a un prix. Un prix de sécurité et de contrôle.` },
      { type: "heading", text: `L'API, c'est l'arrière-boutique` },
      { type: "paragraph", text: `Une API (Interface de Programmation d'Applications), c'est l'accès direct au moteur qui fait tourner l'IA, sans passer par l'interface publique.` },
      { type: "paragraph", text: `Imaginez que vous voulez acheter en gros chez un fournisseur. Vous n'allez pas au magasin avec un caddie. Vous appelez l'entrepôt directement, vous passez commande avec vos conditions, vos spécifications, votre contrat.` },
      { type: "paragraph", text: `C'est exactement ça, une API : un canal direct et contractuel entre votre système et le modèle d'IA.` },
      { type: "paragraph", text: `Au lieu de taper dans une interface web, votre application (ou votre script Python, ou votre outil d'automatisation) envoie des requêtes structurées au modèle, reçoit les réponses, et les traite comme vous le souhaitez.` },
      { type: "heading", text: `Le cauchemar du "Shadow AI"` },
      { type: "paragraph", text: `Vous savez ce qui m'a vraiment fait comprendre l'ampleur du problème ? Les chiffres sur le "Shadow AI".` },
      { type: "paragraph", text: `Shadow AI, c'est quand les employés utilisent des outils d'IA publics pour leur travail, sans que l'entreprise le sache ou le contrôle.` },
      { type: "paragraph", text: `Et c'est un désastre :` },
      { type: "list", items: [
        `79,1% des données exposées via l'IA passent par ChatGPT`,
        `Plus de 40% des fichiers envoyés contiennent des données sensibles`,
        `Près d'un salarié sur deux utilise ces outils, souvent sans se rendre compte du risque`
      ] },
      { type: "heading", text: `Ce qui se passe vraiment quand vous utilisez le chat web public` },
      { type: "paragraph", text: `Quand vous collez du code propriétaire, des données clients, des informations stratégiques dans ChatGPT pour "juste obtenir de l'aide rapidement", voici ce qui se passe :` },
      { type: "list", items: [
        `Vos données sont envoyées en clair sur les serveurs du fournisseur (souvent aux États-Unis, soumis au Cloud Act)`,
        `Elles peuvent être utilisées pour entraîner les modèles selon les conditions d'utilisation (qui changent régulièrement, d'ailleurs)`,
        `Vous n'avez aucun contrôle sur qui peut y accéder, comment elles sont stockées, combien de temps elles sont conservées`,
        `Impossible de filtrer les données sensibles avant l'envoi`
      ] },
      { type: "paragraph", text: `C'est comme envoyer vos plans secrets par carte postale. Techniquement, ça marche. Mais c'est une idée terrible.` },
      { type: "heading", text: `Pourquoi l'API d'entreprise change tout` },
      { type: "paragraph", text: `Quand j'ai développé mes automatisations pour Bigot Matériaux, j'ai vite compris que je ne pouvais pas simplement copier-coller des données comptables dans ChatGPT.` },
      { type: "paragraph", text: `J'avais besoin de contrôle. J'avais besoin de sécurité. J'avais besoin d'une API.` },
      { type: "paragraph", text: `Voici ce que l'API vous apporte :` },
      { type: "heading", text: `1. Vos données ne servent pas à entraîner les modèles` },
      { type: "paragraph", text: `C'est contractuel. Les fournisseurs d'API d'entreprise (OpenAI, Anthropic, etc.) s'engagent explicitement à ne pas utiliser vos données pour entraîner leurs modèles.` },
      { type: "paragraph", text: `Avec le chat web public ? Aucune garantie. Anthropic a même changé sa politique pour utiliser les conversations par défaut, sauf refus explicite.` },
      { type: "heading", text: `2. Vous pouvez filtrer les données sensibles AVANT l'envoi` },
      { type: "paragraph", text: `Avec une API, vous intégrez des couches de sécurité entre vos données et le modèle :` },
      { type: "list", items: [
        `Masquage des données personnelles (PII) : Les noms, adresses, numéros de téléphone sont automatiquement masqués avant d'être envoyés`,
        `DLP (Data Loss Prevention) : Des filtres qui détectent et bloquent les données sensibles`,
        `Minimisation des données : Vous n'envoyez que ce qui est strictement nécessaire`
      ] },
      { type: "paragraph", text: `Dans le chat web ? Vous envoyez tout, en brut, sans filtre.` },
      { type: "heading", text: `3. Vous contrôlez où vos données sont stockées` },
      { type: "paragraph", text: `Avec l'API d'entreprise, vous pouvez :` },
      { type: "list", items: [
        `Choisir la région de stockage (pour respecter le RGPD)`,
        `Utiliser vos propres clés de chiffrement (double chiffrement)`,
        `Définir des durées de conservation précises`
      ] },
      { type: "paragraph", text: `Le chat web public ? Vos données vont où le fournisseur décide.` },
      { type: "heading", text: `4. Vous gérez les accès de manière granulaire` },
      { type: "paragraph", text: `Avec l'API, vous créez des clés d'accès avec des permissions spécifiques :` },
      { type: "list", items: [
        `Telle clé peut seulement lire, pas écrire`,
        `Telle clé est limitée à certains modèles`,
        `Telle clé expire après 24 heures`
      ] },
      { type: "paragraph", text: `C'est le principe du moindre privilège : chaque accès a exactement les permissions nécessaires, rien de plus.` },
      { type: "paragraph", text: `Le chat web ? Une simple session de navigateur. Zéro granularité.` },
      { type: "heading", text: `Le parallèle avec les chatbots et les agents IA` },
      { type: "paragraph", text: `Ce qui est fascinant, c'est que cette distinction API vs Interface se retrouve aussi dans la différence entre chatbots et agents IA.` },
      { type: "paragraph", text: `Les chatbots, c'est comme l'interface web : réactifs, simples, orientés conversation. Vous posez une question, ils répondent. Parfait pour du support client de premier niveau.` },
      { type: "paragraph", text: `Les agents IA, c'est comme l'API : proactifs, autonomes, intégrés profondément dans vos systèmes. Ils ne se contentent pas de répondre, ils agissent sur vos données, vos processus, vos workflows.` },
      { type: "paragraph", text: `Pour mes automatisations comptables, j'avais besoin d'agents IA connectés via API, pas de chatbots publics. La différence ? La sécurité, le contrôle, et la conformité.` },
      { type: "heading", text: `Les risques majeurs des API (oui, il y en a)` },
      { type: "paragraph", text: `Attention, je ne veux pas vous faire croire que l'API est magique et sans risque. Une API mal gérée peut être aussi dangereuse qu'une interface web publique.` },
      { type: "paragraph", text: `Voici les pièges à éviter absolument :` },
      { type: "heading", text: `1. Les clés API codées en dur` },
      { type: "paragraph", text: `Le cauchemar absolu : un développeur qui écrit sa clé API directement dans le code source.` },
      { type: "code", text: `api_key = "sk-proj-1234567890abcdef"  # NE JAMAIS FAIRE ÇA` },
      { type: "paragraph", text: `Pourquoi c'est catastrophique ? Parce que si ce code fuit (sur GitHub, par exemple), n'importe qui peut utiliser votre clé pour accéder à vos systèmes.` },
      { type: "paragraph", text: `La solution : Utiliser des gestionnaires de secrets (Vaults) qui stockent les clés de manière sécurisée, séparées du code.` },
      { type: "heading", text: `2. Les API "zombies" et "shadow APIs"` },
      { type: "paragraph", text: `42% des professionnels citent les API obsolètes (zombies) comme risque urgent. Ce sont des API qu'on a créées, oubliées, et qui restent actives, non surveillées, potentiellement vulnérables.` },
      { type: "paragraph", text: `Et pire : les shadow APIs, créées sans que l'équipe sécurité le sache. Leur nombre a explosé récemment.` },
      { type: "heading", text: `3. Le manque de surveillance` },
      { type: "paragraph", text: `Près d'un tiers des professionnels ont identifié une fuite de données sensibles dans leur production d'API au cours de l'année écoulée.` },
      { type: "paragraph", text: `Pourquoi ? Parce qu'ils n'ont pas mis en place de journalisation et surveillance des requêtes API.` },
      { type: "paragraph", text: `Il faut surveiller :` },
      { type: "list", items: [
        `Qui accède à l'API`,
        `Quelles données sont envoyées`,
        `Quels patterns sont anormaux (tentatives d'abus)`
      ] },
      { type: "heading", text: `4. Pas de rotation des clés` },
      { type: "paragraph", text: `Une clé API, c'est comme un mot de passe. Si elle ne change jamais, elle finit par fuiter.` },
      { type: "paragraph", text: `Bonnes pratiques :` },
      { type: "list", items: [
        `Rotation régulière des clés (tous les 30-90 jours)`,
        `Utilisation de jetons d'accès (JWT) avec expiration automatique`,
        `Révocation immédiate en cas de suspicion de compromission`
      ] },
      { type: "heading", text: `Mon approche concrète pour sécuriser l'IA` },
      { type: "paragraph", text: `Quand j'ai développé mes automatisations, voici le principe que j'ai suivi :` },
      { type: "paragraph", text: `Jamais de données sensibles dans le chat web public. Toujours via API avec filtrage.` },
      { type: "paragraph", text: `Concrètement, voici mon architecture :` },
      { type: "list", items: [
        `Extraction des données depuis les sources (PDF, Excel, bases de données)`,
        `Masquage automatique des PII (noms, adresses, données personnelles)`,
        `Envoi via API d'entreprise avec clé stockée dans un vault sécurisé`,
        `Réception et traitement de la réponse de l'IA`,
        `Journalisation de toutes les requêtes pour audit`
      ] },
      { type: "paragraph", text: `Résultat ? 85% de gain de temps sur les tâches comptables, zéro fuite de données.` },
      { type: "paragraph", text: `C'est plus complexe que de copier-coller dans ChatGPT ? Oui. Mais c'est la seule façon de faire les choses correctement.` },
      { type: "heading", text: `API et RGPD : pourquoi c'est crucial en Europe` },
      { type: "paragraph", text: `Si vous êtes en Europe et que vous manipulez des données personnelles, vous DEVEZ respecter le RGPD (Règlement Général sur la Protection des Données).` },
      { type: "paragraph", text: `Et voilà le truc : le chat web public ne vous permet pas d'être conforme.` },
      { type: "paragraph", text: `Pourquoi ?` },
      { type: "list", items: [
        `Vous ne contrôlez pas où les données sont stockées`,
        `Vous ne pouvez pas garantir la minimisation des données`,
        `Vous n'avez pas de contrat clair de responsabilité de traitement`,
        `Vous ne pouvez pas assurer la suppression effective des données`
      ] },
      { type: "paragraph", text: `L'API d'entreprise, en revanche, vous permet :` },
      { type: "paragraph", text: `✅ De définir contractuellement que vous êtes le Responsable de Traitement` },
      { type: "paragraph", text: `✅ De choisir la régionalisation (serveurs en Europe)` },
      { type: "paragraph", text: `✅ D'intégrer le masquage obligatoire des PII` },
      { type: "paragraph", text: `✅ De mettre en place des durées de conservation conformes` },
      { type: "paragraph", text: `✅ D'assurer la traçabilité de tous les traitements` },
      { type: "paragraph", text: `Sans API d'entreprise, vous êtes en infraction dès que vous utilisez l'IA sur des données personnelles.` },
      { type: "heading", text: `L'analogie de la messagerie blindée` },
      { type: "paragraph", text: `Voici comment je résume tout ça :` },
      { type: "paragraph", text: `Le chat web public, c'est comme envoyer vos documents par la poste publique.` },
      { type: "list", items: [
        `N'importe qui peut ouvrir l'enveloppe`,
        `Vous ne savez pas qui manipule votre courrier`,
        `Pas de garantie de confidentialité`,
        `Pas de contrôle sur la durée de conservation`
      ] },
      { type: "paragraph", text: `L'API d'entreprise, c'est comme un service de messagerie blindé et sous contrat.` },
      { type: "list", items: [
        `Le coursier est identifié et autorisé`,
        `Vous choisissez l'itinéraire (régionalisation)`,
        `Le paquet est scellé et ne peut pas être copié (garantie de non-entraînement)`,
        `Vous filtrez les informations superflues avant l'envoi (masquage DLP)`,
        `Vous avez un contrat qui précise toutes les responsabilités`
      ] },
      { type: "paragraph", text: `C'est la seule façon de garantir la sécurité et la conformité.` },
      { type: "heading", text: `Pourquoi ça change ma façon de travailler avec l'IA` },
      { type: "paragraph", text: `Depuis que j'ai compris cette distinction, ma façon de travailler avec l'IA a radicalement changé.` },
      { type: "paragraph", text: `Pour l'expérimentation et l'apprentissage : Je continue d'utiliser ChatGPT et Claude en interface web. Mais uniquement avec des données non sensibles, des exemples génériques, des questions de compréhension.` },
      { type: "paragraph", text: `Pour les projets réels avec des données sensibles : Toujours via API. Toujours avec filtrage. Toujours avec journalisation.` },
      { type: "paragraph", text: `Et c'est exactement ce que je vais faire avec mon projet de startup (qui conditionne l'accès à l'IA à une activité physique mesurée). Les données d'activité physique des utilisateurs sont des données de santé, donc ultra-sensibles.` },
      { type: "paragraph", text: `Je ne passerai jamais ces données par un chat web public. Tout sera via API d'entreprise, avec :` },
      { type: "list", items: [
        `Masquage des identifiants personnels`,
        `Stockage régionalisé en Europe`,
        `Contrat de responsabilité de traitement clair`,
        `Audit trail complet`
      ] },
      { type: "paragraph", text: `Parce que la confiance des utilisateurs, ça ne se reconstruit pas après une fuite de données.` },
      { type: "heading", text: `Ce qu'il faut retenir` },
      { type: "paragraph", text: `Si vous ne deviez retenir qu'une chose de cet article, ce serait celle-ci :` },
      { type: "paragraph", text: `L'interface web publique et l'API d'entreprise donnent toutes deux accès à l'IA, mais avec des niveaux de sécurité, de contrôle et de conformité radicalement différents.` },
      { type: "paragraph", text: `✅ Utilisez le chat web public pour : expérimenter, apprendre, tester des idées avec des données non sensibles.` },
      { type: "paragraph", text: `❌ N'utilisez JAMAIS le chat web public pour : des données clients, du code propriétaire, des informations stratégiques, des données personnelles.` },
      { type: "paragraph", text: `✅ Utilisez l'API d'entreprise pour : tout projet de production, toute donnée sensible, toute intégration dans vos systèmes.` },
      { type: "paragraph", text: `Et surtout, formez vos équipes. Parce que le Shadow AI, c'est le risque numéro un aujourd'hui. Un salarié bien intentionné qui colle des données clients dans ChatGPT "juste pour gagner du temps" peut créer une fuite massive sans même s'en rendre compte.` },
      { type: "paragraph", text: `La révolution de l'IA est incroyable. Mais elle nécessite une maturité en sécurité que beaucoup d'entreprises n'ont pas encore.` },
      { type: "paragraph", text: `Soyez du bon côté. Utilisez l'API.` }
    ]
  },
  {
    id: "economie-ia-2025-fin-gratuite",
    title: `L'économie de l'IA en 2025 : pourquoi la gratuité touche à sa fin`,
    slug: "economie-ia-2025-fin-gratuite",
    excerpt: `OpenAI perd 5 milliards malgré 10 milliards de revenus. Google développe des puces 4x plus efficaces. Et si la gratuité de l'IA n'était qu'une phase d'acquisition ?`,
    date: "2025-11",
    readingTime: "10 min",
    category: "Marché",
    featured: false,
    published: true,
    content: [
      { type: "paragraph", text: `Vous utilisez ChatGPT gratuitement. Claude aussi. Gemini également. Et vous trouvez ça normal, non ?` },
      { type: "paragraph", text: `Moi aussi, jusqu'à ce que je creuse les chiffres. Et là, j'ai réalisé quelque chose : cette gratuité n'a aucun sens économique. C'est une stratégie d'acquisition de marché à haut risque, pas un modèle durable.` },
      { type: "paragraph", text: `Alors j'ai décidé de comprendre : comment fonctionnent vraiment ces géants de l'IA ? Qui gagne ? Qui perd ? Et surtout, combien de temps cette fête gratuite va-t-elle durer ?` },
      { type: "paragraph", text: `Voici ce que j'ai découvert.` },
      { type: "heading", text: `Le coût réel d'une requête IA` },
      { type: "paragraph", text: `Comparons une seconde. Quand vous faites une recherche Google classique, ça consomme une quantité d'énergie normale. Quand vous envoyez une requête à ChatGPT ?` },
      { type: "paragraph", text: `10 fois plus d'électricité.` },
      { type: "paragraph", text: `Dix fois. Pour chaque question. Chaque message gratuit que vous envoyez érode directement la trésorerie d'OpenAI.` },
      { type: "paragraph", text: `Mais ça, ce n'est que la partie visible. Parce qu'avant même de pouvoir répondre à votre question, ces entreprises doivent :` },
      { type: "list", items: [
        `Acheter des serveurs GPU (un Nvidia H100 coûte 28 000 €, et il en faut des centaines)`,
        `Payer des salaires astronomiques aux experts en IA`,
        `Financer la R&D pour développer les modèles`,
        `Maintenir une infrastructure complète (on parle de plus de 250 000 € par installation)`
      ] },
      { type: "paragraph", text: `Et tout ça, pour vous offrir un service... gratuit ?` },
      { type: "heading", text: `OpenAI : le paradoxe de la croissance explosive` },
      { type: "paragraph", text: `Les chiffres d'OpenAI sont hallucinants. Et je pèse mes mots.` },
      { type: "paragraph", text: `10 milliards de dollars de revenus annuels. C'est colossal. Principalement grâce à ChatGPT Plus (55 % des revenus), aux offres entreprise (21 %), et à l'API (15 %).` },
      { type: "paragraph", text: `Mais voilà le problème : malgré ces 10 milliards de revenus, OpenAI a enregistré 5 milliards de dollars de pertes l'année dernière.` },
      { type: "paragraph", text: `Cinq. Milliards. De pertes.` },
      { type: "paragraph", text: `Comment c'est possible ? Simple : les coûts d'entraînement et de fonctionnement des modèles d'IA sont tout simplement démentiels. Chaque requête gratuite coûte de l'argent. Chaque amélioration nécessite des investissements massifs.` },
      { type: "heading", text: `La fuite en avant stratégique` },
      { type: "paragraph", text: `Et la situation devient encore plus intéressante. Depuis mai 2025, la croissance des abonnements ChatGPT Plus ralentit. OpenAI se retrouve sous pression et réagit en se diversifiant tous azimuts :` },
      { type: "list", items: [
        `Conseil en IA pour grandes organisations (contrats à 10 millions de dollars)`,
        `Logiciels de productivité pour concurrencer Microsoft 365`,
        `Développement de matériel "post-écran" (rachat de la société de Jony Ive pour 6,5 milliards)`,
        `Exploration de la publicité`,
        `Et même des services à contenu érotique encadré`
      ] },
      { type: "paragraph", text: `Certains analystes appellent ça une "fuite en avant". Moi, j'y vois surtout un réflexe de survie économique.` },
      { type: "heading", text: `Le projet qui change tout : Stargate` },
      { type: "paragraph", text: `Mais le vrai game changer, c'est le projet Stargate : une infrastructure IA évaluée jusqu'à 500 milliards de dollars.` },
      { type: "paragraph", text: `Cinq. Cents. Milliards.` },
      { type: "paragraph", text: `Pour financer ça, OpenAI a besoin de capital massif. D'où les levées de fonds records, une valorisation à 40 milliards de dollars (avec des ambitions de 125 milliards de revenus d'ici 2029), et probablement une entrée en bourse historique à venir.` },
      { type: "heading", text: `La rupture avec Microsoft` },
      { type: "paragraph", text: `Et voilà le twist : OpenAI cherche activement à se détacher de Microsoft.` },
      { type: "paragraph", text: `Ils ont signé des accords avec CoreWeave (pour près de 12 milliards de dollars) et... Google Cloud. Oui, vous avez bien lu : OpenAI achète de la puissance de calcul à son concurrent direct, Google.` },
      { type: "paragraph", text: `Le monde de l'IA est vraiment bizarre.` },
      { type: "heading", text: `Google : l'avantage de l'infrastructure` },
      { type: "paragraph", text: `Parlons justement de Google. Parce que contrairement à OpenAI, Google a un avantage structurel massif.` },
      { type: "heading", text: `Les TPU : l'arme secrète` },
      { type: "paragraph", text: `Google a développé ses propres accélérateurs d'IA : les TPU v5 (Tensor Processing Units). Et ils ne rigolent pas :` },
      { type: "paragraph", text: `2 à 4 fois plus de performance par dollar que les configurations GPU équivalentes.` },
      { type: "paragraph", text: `Vous comprenez l'avantage ? Là où OpenAI doit louer des GPU Nvidia à prix d'or, Google utilise son propre matériel optimisé. Le coût marginal de chaque requête est drastiquement réduit.` },
      { type: "paragraph", text: `C'est comme si vous compariez quelqu'un qui doit louer une voiture à chaque déplacement versus quelqu'un qui possède déjà son propre véhicule ultra-efficace.` },
      { type: "heading", text: `L'ironie de la situation` },
      { type: "paragraph", text: `ChatGPT représente "la plus grande menace pour le business de recherche de Google depuis des années". Pourtant, Google Cloud vend de la puissance de calcul à OpenAI.` },
      { type: "paragraph", text: `C'est l'illustration parfaite de la complexité du secteur : même si Google doit défendre sa propre IA (Gemini), l'entreprise monétise aussi ses infrastructures en les louant à ses rivaux.` },
      { type: "paragraph", text: `Et pendant ce temps, Microsoft (partenaire historique d'OpenAI) développe ses propres modèles d'IA (la famille MAI) et considère ouvertement OpenAI comme un concurrent.` },
      { type: "paragraph", text: `Partenaires le jour, concurrents le soir. Bienvenue dans l'économie de l'IA.` },
      { type: "heading", text: `Anthropic et la course à la performance` },
      { type: "paragraph", text: `Et il y a Anthropic, avec Claude. Eux, ils jouent une autre carte : la performance pure.` },
      { type: "paragraph", text: `Claude 2 est considéré par certains utilisateurs comme aussi utile que GPT-4 pour les discussions scientifiques ou philosophiques, avec un contexte plus élevé. Et Claude Opus 4.5 ? Il repousse encore les limites.` },
      { type: "heading", text: `Le phénomène "LLMflation"` },
      { type: "paragraph", text: `La concurrence est tellement intense que le coût de l'inférence pour un LLM de performance équivalente diminue de 10 fois chaque année.` },
      { type: "paragraph", text: `C'est ce qu'on appelle la "LLMflation". Les acteurs comme Anthropic, Google et OpenAI se tirent mutuellement vers le bas sur les prix.` },
      { type: "paragraph", text: `Leur réaction ? Ils concèdent la gamme basse (le gratuit) pour se concentrer sur les modèles de très haute qualité, qui maintiennent des prix élevés.` },
      { type: "heading", text: `Pourquoi tout va devenir payant` },
      { type: "paragraph", text: `Maintenant que vous comprenez les coûts et la guerre concurrentielle, une question s'impose : combien de temps ça va durer ?` },
      { type: "paragraph", text: `Pas longtemps. Et voici pourquoi.` },
      { type: "heading", text: `1. La stratégie freemium touche à sa fin` },
      { type: "paragraph", text: `La gratuité actuelle n'est qu'une phase d'acquisition stratégique. L'objectif était de créer une adoption massive, une dépendance. Mission accomplie.` },
      { type: "paragraph", text: `Maintenant, place à la monétisation. Et les limitations commencent déjà :` },
      { type: "list", items: [
        `Environ 10 messages GPT-5 toutes les cinq heures en gratuit, puis bascule vers un modèle moins performant`,
        `Temps de réponse plus longs aux heures de pointe`,
        `Les abonnés payants ont un accès prioritaire et des réponses plus rapides`
      ] },
      { type: "paragraph", text: `C'est une segmentation délibérée pour pousser à la conversion.` },
      { type: "heading", text: `2. Le B2B, c'est là que l'argent est` },
      { type: "paragraph", text: `Le vrai potentiel de monétisation ? Le marché professionnel.` },
      { type: "paragraph", text: `Un développeur utilisant GPT-4 pour le codage et la rédaction peut économiser au moins 8 000 $ par mois par rapport à l'embauche d'entrepreneurs. L'abonnement à 20 $ ? C'est une blague.` },
      { type: "paragraph", text: `68 % des responsables des opérations dans l'industrie s'attendent à ce que leur rentabilité s'améliore grâce à l'IA d'ici 2030. Pour eux, l'abonnement payant est incontournable.` },
      { type: "paragraph", text: `C'est là que le ROI est clair. C'est là que les entreprises peuvent justifier des coûts bien plus élevés.` },
      { type: "heading", text: `3. Les coûts réglementaires arrivent` },
      { type: "paragraph", text: `L'AI Act européen entre en vigueur. Et devinez quoi ? Ça va coûter cher.` },
      { type: "paragraph", text: `Les coûts de conformité pourraient être similaires ou supérieurs au RGPD. Pour référence, les grandes entreprises américaines ont dépensé jusqu'à 150 milliards de dollars au total pour la conformité RGPD.` },
      { type: "paragraph", text: `Certes, pour des modèles comme GPT-4, ces coûts ne représentent "que" 0,22 % de l'investissement total (457 millions d'euros). Mais qu'ils soient marginaux ou massifs, ces coûts légaux justifient que les services d'IA avancée soient payants.` },
      { type: "heading", text: `Ce que ça signifie pour vous` },
      { type: "paragraph", text: `Alors, concrètement, qu'est-ce que ça change pour vous ?` },
      { type: "paragraph", text: `La gratuité de l'IA de pointe est une phase d'incubation qui touche à sa fin.` },
      { type: "paragraph", text: `Dans quelques années, l'accès aux modèles les plus performants sera payant. Peut-être qu'il restera des versions gratuites bridées, comme il existe aujourd'hui des versions gratuites de Spotify ou YouTube. Mais l'IA que vous utilisez aujourd'hui sans limite ?` },
      { type: "paragraph", text: `Profitez-en. Parce que ça ne va pas durer.` },
      { type: "heading", text: `Pour les particuliers` },
      { type: "paragraph", text: `Si vous utilisez l'IA occasionnellement, les versions gratuites limitées suffiront probablement.` },
      { type: "paragraph", text: `Mais si vous l'intégrez sérieusement dans votre travail, votre créativité, vos projets ? Préparez-vous à payer. Et ce n'est pas forcément une mauvaise chose : vous paierez pour de la performance, de la fiabilité, de la conformité.` },
      { type: "heading", text: `Pour les professionnels` },
      { type: "paragraph", text: `L'abonnement payant sera incontournable. Mais le ROI sera là. Un outil qui vous fait économiser 8 000 $ par mois pour 20 ou même 200 $ d'abonnement ? C'est un no-brainer.` },
      { type: "paragraph", text: `Les entreprises qui refuseront de payer seront simplement dépassées par celles qui investiront.` },
      { type: "heading", text: `Ma conclusion` },
      { type: "paragraph", text: `Voilà la réalité de l'économie de l'IA en 2025 :` },
      { type: "list", items: [
        `OpenAI brûle du cash malgré des revenus records, se diversifie frénétiquement, et cherche des centaines de milliards pour financer son infrastructure future`,
        `Google a un avantage structurel massif grâce à ses TPU propriétaires, mais doit défendre son cœur de métier (la recherche) tout en monétisant ses infrastructures`,
        `Anthropic et les autres concurrents maintiennent une pression intense sur la performance et les prix`,
        `La gratuité actuelle n'est qu'une stratégie temporaire d'acquisition de marché`,
        `La monétisation massive arrive, principalement via le B2B`
      ] },
      { type: "paragraph", text: `Alors oui, l'ère de l'IA gratuite touche à sa fin. Mais ce n'est pas forcément une mauvaise nouvelle. Ça signifie que le secteur mûrit, que les modèles économiques se stabilisent, et que l'IA devient un vrai outil professionnel fiable.` },
      { type: "paragraph", text: `La fête est bientôt finie. Mais le vrai travail commence.` },
      { type: "paragraph", text: `Et moi ? Je compte bien être de ceux qui construisent cette économie, pas de ceux qui la subissent.` }
    ]
  },
  {
    id: "ia-diplomes-portfolios-competences",
    title: `Quand l'IA tue la valeur des diplômes : vers l'ère du portfolio`,
    slug: "ia-diplomes-portfolios-competences",
    excerpt: `Dans ma classe, c'est flagrant : l'IA permet d'avoir le diplôme sans développer les compétences. Ma génération est la première à vivre cette rupture. Et si les portfolios remplaçaient les diplômes ?`,
    date: "2025-12",
    readingTime: "12 min",
    category: "Vision",
    featured: false,
    published: true,
    content: [
      { type: "paragraph", text: `Il y a un truc qui me tracasse vraiment depuis quelques mois. Un truc que j'observe tous les jours en classe et qui me fait me poser des questions sur l'avenir de l'éducation.` },
      { type: "paragraph", text: `Mes camarades deviennent de plus en plus dépendants de l'IA, font de moins en moins d'efforts... et pourtant, ça n'empêche pas d'avoir le diplôme. Parfois, ça augmente même leurs chances.` },
      { type: "paragraph", text: `Alors je me demande : est-ce que finalement, les diplômes et l'école ne vont plus avoir beaucoup de valeur au final ?` },
      { type: "heading", text: `Ce que j'observe en classe : un phénomène inquiétant` },
      { type: "paragraph", text: `Depuis trois ans que je suis à SKEMA, j'ai vu une transformation radicale. ChatGPT arrive fin 2022, et dès 2023, tout change.` },
      { type: "paragraph", text: `Mes camarades utilisent l'IA pour tout :` },
      { type: "list", items: [
        `Les devoirs écrits ? ChatGPT`,
        `Les analyses de cas ? ChatGPT`,
        `Les présentations ? ChatGPT`,
        `Même les révisions d'examens ? ChatGPT qui résume les cours`
      ] },
      { type: "paragraph", text: `Le résultat ? Ils développent beaucoup moins de compétences réelles. Leur capacité d'analyse diminue. Leur esprit critique s'atrophie. Leur créativité s'évapore.` },
      { type: "paragraph", text: `Mais voilà le truc le plus troublant : ça ne change rien à leur capacité d'obtenir le diplôme. Voire même, parfois, ça améliore leurs notes.` },
      { type: "paragraph", text: `Et ça me pose une question fondamentale : si on peut avoir le diplôme sans les compétences, à quoi sert le diplôme ?` },
      { type: "heading", text: `Les données confirment : ce n'est pas qu'à SKEMA` },
      { type: "paragraph", text: `J'ai creusé le sujet, et ce que j'observe n'est pas un cas isolé. C'est un phénomène généralisé.` },
      { type: "heading", text: `L'impact massif sur l'emploi des jeunes diplômés` },
      { type: "paragraph", text: `Les chiffres sont brutaux :` },
      { type: "list", items: [
        `En Inde, le recrutement de jeunes diplômés dans les grandes entreprises IT a chuté de 70% entre 2023 et 2024 : de 225 000 à 60 000 recrutements.`,
        `Aux États-Unis, une étude de Stanford montre que les jeunes de 22-25 ans dans les secteurs exposés à l'IA ont significativement moins d'opportunités que leurs aînés.`,
        `Pourquoi ? Parce que les entreprises automatisent les tâches qu'on confiait traditionnellement aux juniors : codage simple, analyse de données de base, rédaction de documents...`
      ] },
      { type: "paragraph", text: `Résultat : les entreprises privilégient maintenant l'expérience. Elles préfèrent recruter des profils confirmés plutôt que de former des juniors dont les compétences de base ne sont plus nécessaires.` },
      { type: "heading", text: `Le déclin cognitif lié à l'IA` },
      { type: "paragraph", text: `Un post LinkedIn que j'ai sauvegardé pose la vraie question :` },
      { type: "quote", text: `"Si l'intelligence artificielle accomplit une tâche mieux et plus vite, à quoi sert d'apprendre à la reproduire manuellement ?"` },
      { type: "paragraph", text: `La réponse est évidente : l'école a longtemps valorisé la mémorisation, la répétition, la restitution. Or, ces compétences sont désormais automatisables.` },
      { type: "paragraph", text: `Les compétences qui comptent maintenant :` },
      { type: "list", items: [
        `La curiosité`,
        `La pensée critique`,
        `La collaboration homme-machine`,
        `La créativité authentique`
      ] },
      { type: "paragraph", text: `Mais voilà le problème : mes camarades ne développent même pas ces compétences-là. Ils utilisent l'IA comme une béquille pour éviter l'effort, pas comme un levier pour aller plus loin.` },
      { type: "heading", text: `La mort du diplôme comme signal de compétence` },
      { type: "paragraph", text: `Alors voici ma conviction : le diplôme est en train de perdre sa valeur comme signal de compétence.` },
      { type: "heading", text: `Pourquoi les diplômes valaient quelque chose` },
      { type: "paragraph", text: `Historiquement, un diplôme servait de signal au marché du travail. Il disait :` },
      { type: "list", items: [
        `"Cette personne a acquis un socle de connaissances"`,
        `"Elle a la capacité de travailler dur et de terminer ce qu'elle commence"`,
        `"Elle peut analyser des problèmes complexes"`
      ] },
      { type: "paragraph", text: `Mais si l'IA permet d'obtenir le diplôme sans développer ces capacités, le signal devient du bruit.` },
      { type: "paragraph", text: `Le diplôme ne garantit plus les compétences. Il garantit juste qu'on a su naviguer dans un système qui n'a pas encore compris comment évaluer les compétences réelles à l'ère de l'IA.` },
      { type: "heading", text: `Ce qui va remplacer le diplôme` },
      { type: "paragraph", text: `Je suis convaincu que les entreprises vont devoir refondre complètement leur système de recrutement.` },
      { type: "paragraph", text: `Voici vers quoi on se dirige :` },
      { type: "paragraph", text: `1. Le portfolio de projets réels` },
      { type: "paragraph", text: `Au lieu de demander "Vous avez quel diplôme ?", les recruteurs vont demander "Montrez-moi ce que vous avez construit."` },
      { type: "paragraph", text: `Un portfolio qui montre :` },
      { type: "list", items: [
        `Des projets concrets que vous avez menés`,
        `Les problèmes que vous avez résolus`,
        `La valeur que vous avez créée`,
        `Comment vous avez utilisé les outils (y compris l'IA) pour y arriver`
      ] },
      { type: "paragraph", text: `C'est exactement ce que je fais avec MoveThink. Je construis quelque chose de réel, qui crée de la valeur mesurable. Ça vaut infiniment plus qu'une bonne moyenne dans des devoirs rédigés par ChatGPT.` },
      { type: "paragraph", text: `2. Les avis et recommandations professionnels` },
      { type: "paragraph", text: `L'équivalent des notes Google pour les restaurants, mais pour les professionnels.` },
      { type: "paragraph", text: `Imaginez :` },
      { type: "list", items: [
        `Vous travaillez sur un projet`,
        `Les personnes avec qui vous collaborez (tuteurs, clients, collègues) laissent des avis détaillés sur vos compétences réelles`,
        `Ces avis sont vérifiés, datés, contextualisés`
      ] },
      { type: "paragraph", text: `C'est beaucoup plus difficile à tricher qu'un diplôme obtenu avec l'aide de ChatGPT.` },
      { type: "paragraph", text: `3. Les évaluations de compétences en situation réelle` },
      { type: "paragraph", text: `Plutôt que d'évaluer ce que vous savez en théorie, on va évaluer ce que vous savez faire en pratique.` },
      { type: "list", items: [
        `Des tests de codage en live`,
        `Des études de cas à résoudre en temps limité`,
        `Des projets pilotes courts pour démontrer votre valeur`
      ] },
      { type: "paragraph", text: `On ne pourra pas se cacher derrière l'IA pour ces évaluations. Soit vous savez faire, soit vous ne savez pas.` },
      { type: "heading", text: `Mais attendez... on peut tricher sur un portfolio aussi ?` },
      { type: "paragraph", text: `C'est vrai. On peut mettre n'importe quoi sur un portfolio. Mais c'est là que les avis deviennent cruciaux.` },
      { type: "paragraph", text: `Si je dis "J'ai créé MoveThink, une startup qui conditionne l'accès à l'IA à l'effort physique", quelqu'un peut vérifier :` },
      { type: "list", items: [
        `Est-ce que la startup existe vraiment ?`,
        `Est-ce que Gabriel Bigot en est vraiment le fondateur ?`,
        `Est-ce que le produit fonctionne ?`,
        `Qu'en disent les utilisateurs ?`,
        `Qu'en dit le tuteur de stage qui l'a supervisé ?`
      ] },
      { type: "paragraph", text: `L'écosystème de vérification fait toute la différence.` },
      { type: "paragraph", text: `C'est comme sur Amazon : on peut dire qu'on vend le meilleur produit du monde, mais si les avis disent le contraire, personne n'achète.` },
      { type: "heading", text: `Le paradoxe : l'IA révèle qui crée vraiment de la valeur` },
      { type: "paragraph", text: `Voici l'ironie de la situation : l'IA, en rendant les diplômes moins fiables, va forcer le marché à se concentrer sur ce qui compte vraiment : la capacité à créer de la valeur.` },
      { type: "paragraph", text: `Dans ma classe, il y a deux types de personnes :` },
      { type: "paragraph", text: `Type 1 : Ceux qui utilisent l'IA pour éviter l'effort` },
      { type: "list", items: [
        `Ils demandent à ChatGPT de faire leurs devoirs`,
        `Ils obtiennent de bonnes notes`,
        `Ils auront le diplôme`,
        `Mais ils n'ont développé aucune compétence réelle`,
        `Le marché du travail va les démasquer rapidement`
      ] },
      { type: "paragraph", text: `Type 2 : Ceux qui utilisent l'IA comme levier` },
      { type: "list", items: [
        `Ils utilisent l'IA pour automatiser les tâches répétitives`,
        `Ils se concentrent sur la création de valeur réelle`,
        `Ils construisent des projets, des entreprises, des solutions`,
        `Ils développent des compétences que l'IA ne peut pas remplacer`,
        `Le marché du travail va les valoriser énormément`
      ] },
      { type: "paragraph", text: `Je fais partie du Type 2. Et je pense que c'est le seul choix viable à long terme.` },
      { type: "heading", text: `Ma stratégie personnelle : construire pendant que les autres trichent` },
      { type: "paragraph", text: `Pendant que mes camarades utilisent ChatGPT pour avoir 14/20 à un devoir qu'ils ne comprennent pas, moi je fais autre chose :` },
      { type: "paragraph", text: `Je construis MoveThink.` },
      { type: "list", items: [
        `Une vraie startup, avec une vraie SASU`,
        `Un vrai produit qui crée de la valeur`,
        `Une vraie problématique résolue : conditionner l'accès à l'IA à l'effort`,
        `Un vrai business model : B2C à 15€/mois`,
        `De vraies compétences développées : architecture technique, APIs, n8n, Supabase, stratégie, positionnement`
      ] },
      { type: "paragraph", text: `Je crée un portfolio concret.` },
      { type: "list", items: [
        `Des automatisations qui ont généré 85% de gain de temps dans l'entreprise familiale`,
        `Des articles de blog qui démontrent ma capacité d'analyse (comme celui-ci)`,
        `Un projet entrepreneurial qui montre que je sais identifier des problèmes et construire des solutions`
      ] },
      { type: "paragraph", text: `Je développe des compétences irremplaçables.` },
      { type: "list", items: [
        `Comprendre où l'IA crée de la valeur`,
        `Savoir déployer des solutions techniques`,
        `Penser de manière critique et stratégique`,
        `Avoir une vision long terme sur l'évolution du marché`
      ] },
      { type: "paragraph", text: `Quand le marché du travail va réaliser que les diplômes ne veulent plus rien dire, ceux qui auront construit quelque chose de réel auront une longueur d'avance massive.` },
      { type: "heading", text: `L'éducation va devoir se réinventer` },
      { type: "paragraph", text: `Les écoles et universités vont devoir s'adapter. Elles n'ont pas le choix.` },
      { type: "paragraph", text: `Voici ce qui doit changer :` },
      { type: "paragraph", text: `1. Arrêter d'évaluer la restitution, évaluer la création` },
      { type: "paragraph", text: `Plus de devoirs à rendre qu'on peut faire rédiger par ChatGPT. À la place :` },
      { type: "list", items: [
        `Des projets réels à construire`,
        `Des problèmes concrets à résoudre`,
        `Des présentations orales où on doit défendre ses idées en live`
      ] },
      { type: "paragraph", text: `2. Enseigner l'utilisation intelligente de l'IA` },
      { type: "paragraph", text: `Plutôt que d'interdire ChatGPT (ce qui est ridicule et inefficace), apprendre aux étudiants :` },
      { type: "list", items: [
        `Comment utiliser l'IA comme levier`,
        `Où l'IA apporte de la valeur et où elle n'en apporte pas`,
        `Comment vérifier et critiquer ce que produit l'IA`,
        `Comment l'intégrer dans un workflow de création de valeur`
      ] },
      { type: "paragraph", text: `3. Créer des systèmes de validation de compétences réelles` },
      { type: "paragraph", text: `Les écoles doivent devenir des certificateurs de compétences, pas des distributeurs de diplômes.` },
      { type: "list", items: [
        `Portfolio vérifié de projets menés pendant les études`,
        `Évaluations en situation réelle`,
        `Avis de professionnels qui ont collaboré avec l'étudiant`
      ] },
      { type: "paragraph", text: `Si les écoles ne font pas cette transition, elles vont devenir obsolètes. Les entreprises arrêteront de faire confiance aux diplômes et créeront leurs propres systèmes d'évaluation.` },
      { type: "heading", text: `Une question qui reste : est-ce partout pareil ?` },
      { type: "paragraph", text: `J'observe ça à SKEMA depuis trois ans. Mais est-ce que c'est représentatif de ce qui se passe en France ? En Europe ? Dans le monde ?` },
      { type: "paragraph", text: `La réponse est oui. Les données montrent que c'est un phénomène global :` },
      { type: "list", items: [
        `68% des entreprises de plus de 500 employés utilisent déjà l'IA dans le recrutement en 2025`,
        `Les études sur l'impact de l'IA sur l'emploi des jeunes diplômés touchent tous les pays développés`,
        `Les discussions sur "l'IA dans l'éducation" explosent partout`
      ] },
      { type: "paragraph", text: `Ce n'est pas spécifique à ma classe. Ce n'est pas spécifique à mon école. C'est une transformation systémique du rapport entre éducation, compétences et emploi.` },
      { type: "paragraph", text: `Certaines écoles s'adaptent plus vite que d'autres. Certains étudiants comprennent l'enjeu plus vite que d'autres. Mais tout le monde est concerné.` },
      { type: "heading", text: `Ma conviction finale` },
      { type: "paragraph", text: `Le diplôme n'est pas mort. Mais le diplôme comme unique signal de compétence est en train de mourir.` },
      { type: "paragraph", text: `L'IA force une évolution qui était nécessaire depuis longtemps : passer d'un système qui valorise la conformité et la restitution à un système qui valorise la création de valeur et les compétences réelles.` },
      { type: "paragraph", text: `Ceux qui l'ont compris ont une opportunité massive. Pendant que la majorité continue à jouer au jeu de "avoir le diplôme avec le moins d'effort possible", ceux qui construisent vraiment quelque chose se distinguent de plus en plus.` },
      { type: "paragraph", text: `Dans cinq ans, quand un recruteur me demandera ce que j'ai fait pendant mes études, je ne dirai pas "J'ai eu ma licence avec mention."` },
      { type: "paragraph", text: `Je dirai : "J'ai créé MoveThink, une startup qui conditionne l'accès à l'IA à l'effort physique. J'ai automatisé les processus d'une entreprise familiale avec 85% de gain de temps. J'ai écrit des analyses de fond sur l'économie de l'IA. J'ai construit des compétences techniques réelles."` },
      { type: "paragraph", text: `Et ça, aucun ChatGPT ne peut le faire à ma place.` },
      { type: "paragraph", text: `Le futur du travail ne récompensera pas ceux qui ont su naviguer dans un système d'évaluation obsolète. Il récompensera ceux qui ont su créer de la valeur réelle.` },
      { type: "paragraph", text: `Et je compte bien en faire partie.` }
    ]
  }
];

export const achievements = [
  {
    title: "Vice-Champion de France Hockey en Salle",
    organization: "Équipe Départementale",
    date: "2016",
    description: "Capitaine de l'équipe départementale, meilleur résultat historique du département",
    icon: "trophy"
  },
  {
    title: "TOEIC 900+",
    organization: "Educational Testing Service",
    date: "2024",
    description: "Certification anglais professionnel",
    icon: "certificate"
  },
  {
    title: "2e Place Cross Départemental",
    organization: "UNSS",
    date: "2017",
    description: "Course à pied inter-collèges",
    icon: "award"
  }
];

export const interests = [
  {
    name: "Hockey sur Gazon",
    icon: "🏑",
    description: "Pratique depuis 15+ ans, actuellement joueur du TAC Hockey en 2ème division française. Capitaine et vice-champion de France en salle (2016)."
  },
  {
    name: "Course à Pied",
    icon: "🏃",
    description: "Entraînements réguliers, excellent palmares aux cross inter-collèges (sélections départementales et régionales)."
  },
  {
    name: "Veille Technologique IA",
    icon: "🤖",
    description: "Veille quotidienne sur les avancées en IA, LLM et automatisation. Prototypage de nouvelles solutions."
  },
  {
    name: "Automatisation & Productivité",
    icon: "⚡",
    description: "Passion pour optimiser et automatiser les processus, toujours à la recherche de gains d'efficacité."
  }
];

export const timeline = [
  {
    year: "2026",
    title: "Objectif SKEMA Business School",
    description: "Concours et spécialisation en IA & Business Transformation",
    type: "education"
  },
  {
    year: "2025",
    title: "Développeur d'Automatisations - BIGOT Matériaux",
    description: "Applications web, automatisations comptables et RH",
    type: "work"
  },
  {
    year: "2023",
    title: "ESDHEM - Licence Éco-Gestion",
    description: "Début des études supérieures à Lille",
    type: "education"
  },
  {
    year: "2022-2023",
    title: "Découverte Passion IA",
    description: "Bascule vers l'IA et l'automatisation, veille et prototypage",
    type: "milestone"
  },
  {
    year: "2020-2023",
    title: "Lycée La Malassise",
    description: "Baccalauréat malgré complications médicales majeures",
    type: "education"
  },
  {
    year: "2019-2020",
    title: "Opération Genou & Résilience",
    description: "Opération, infection, ré-opération, hospitalisation et rééducation intensive",
    type: "life"
  },
  {
    year: "2016",
    title: "Vice-Champion de France Hockey",
    description: "Capitaine, 2e place championnat France en salle",
    type: "achievement"
  },
  {
    year: "2008",
    title: "Débuts Hockey sur Gazon",
    description: "Premières crosses au TAC Hockey, Le Touquet",
    type: "life"
  },
  {
    year: "2005",
    title: "Naissance",
    description: "Boulogne-sur-Mer",
    type: "life"
  }
];

export const companies = [
  {
    id: "adn-potentiel",
    slug: "adn-potentiel",
    company: "ADN POTENTIEL",
    position: "Assistant en développement commercial et automatisation digitale",
    location: "Télétravail — Lille, France",
    startDate: "2026-01-02",
    endDate: "2026-02-21",
    current: false,
    type: "Stage",
    shortDescription: "Conception et déploiement de 3 workflows n8n en production pour transformer le développement commercial d'une TPE via IA et intégrations APIs.",
    description: "Stage de 7 semaines au sein d'un cabinet de formation, conseil et coaching professionnel (certification Qualiopi). Mission centrée sur la transformation digitale via l'automatisation et l'intelligence artificielle.",
    logo: "/companies/adn-potentiel.png",
    logoBackground: "#ffffff",
    companyUrl: null,
    technologies: ["n8n", "Notion", "OpenAI", "Google Gemini", "LinkedIn API", "Pappers API", "Perplexity AI"],
    achievements: [
      "Conception et déploiement de 3 workflows n8n en production : enrichissement automatique de 15 000+ prospects BTP (API Pappers), système de veille sectorielle avec qualification IA (score d'impact, catégorisation), génération et publication automatique de contenus LinkedIn",
      "Création d'un Hub Notion avec 5 bases de données interconnectées comme interface de pilotage de l'ensemble du système",
      "Économie de 7h+ par semaine sur la veille et la création de contenus, 75% de taux de validation des contenus par le client, 0 échec en production",
      "Production de 4 tutoriels vidéo (~70 minutes) et documentation technique complète pour garantir l'autonomie du client non-technique",
      "Optimisation des coûts API à ~5-10€/mois et mise en place de mécanismes anti-doublon et de gestion d'erreurs gracieuse"
    ],
    content: [],
  },
  {
    id: "bigot-materiaux-2025",
    slug: "bigot-materiaux-2025",
    company: "BIGOT Matériaux",
    position: "Assistant RH/Compta & Développeur d'Automatisations",
    location: "Étaples, France",
    startDate: "2025-07-01",
    endDate: "2025-09-01",
    current: false,
    type: "Stage",
    shortDescription: "Développement d'automatisations stratégiques pour optimiser les processus RH et comptables de la PME familiale.",
    description: "Développement d'automatisations stratégiques pour optimiser les processus RH et comptables de la PME familiale.",
    logo: null,
    logoBackground: null,
    companyUrl: null,
    technologies: ["Python", "Flask", "Supabase", "Excel/VBA", "OCR", "PDF Parsing", "Automatisation UI"],
    achievements: [
      "Création d'une application web complète pour automatiser la comptabilité avec Python, Flask et base de données cloud",
      "Développement d'un système de traitement automatique de relevés bancaires : extraction PDF, mise en forme Excel, préparation import comptable",
      "Conception d'automatisations Excel avancées : relances clients automatiques, regroupement de données, suppression de doublons",
      "Automatisation de la génération de procès-verbaux d'assemblées générales"
    ],
    content: [],
  },
  {
    id: "texti",
    slug: "texti",
    company: "TEXTI",
    position: "Vendeur",
    location: "Le Touquet Paris-Plage, France",
    startDate: "2024-07-01",
    endDate: "2024-08-31",
    current: false,
    type: "Job d'été",
    shortDescription: "Job d'été dans le secteur du textile.",
    description: "Job d'été dans le secteur du textile. Relation client, tenue de caisse et gestion des stocks.",
    logo: null,
    logoBackground: null,
    companyUrl: null,
    technologies: [],
    achievements: [
      "Relation client et conseil personnalisé",
      "Tenue de caisse et gestion des transactions",
      "Merchandising et présentation produits",
      "Gestion de stock et inventaires"
    ],
    content: [],
  },
  {
    id: "bigot-materiaux-2023",
    slug: "bigot-materiaux-2023",
    company: "BIGOT Matériaux",
    position: "Assistant RH & Comptable",
    location: "Étaples, France",
    startDate: "2023-07-01",
    endDate: "2023-07-31",
    current: false,
    type: "Stage",
    shortDescription: "Premier contact avec les processus administratifs de l'entreprise familiale.",
    description: "Premier contact avec les processus administratifs de l'entreprise familiale. Découverte des outils internes et des processus comptables.",
    logo: null,
    logoBackground: null,
    companyUrl: null,
    technologies: ["Excel", "Logiciels comptables"],
    achievements: [
      "Archivage et organisation de documents RH",
      "Inventaires et gestion de stock",
      "Saisie et lettrage comptable",
      "Découverte des outils internes (AS400)"
    ],
    content: [],
  },
  {
    id: "tac-hockey",
    slug: "tac-hockey",
    company: "TAC Hockey",
    position: "Animateur & Entraîneur",
    location: "Le Touquet Paris-Plage, France",
    startDate: "2022-07-01",
    endDate: "2022-07-31",
    current: false,
    type: "Bénévolat",
    shortDescription: "Encadrement de jeunes joueurs de hockey sur gazon.",
    description: "Encadrement de jeunes joueurs de hockey sur gazon. Transmission de techniques sportives et animation de séances.",
    logo: null,
    logoBackground: null,
    companyUrl: null,
    technologies: [],
    achievements: [
      "Encadrement et animation de groupes de jeunes",
      "Pédagogie sportive et transmission de techniques",
      "Responsabilité de groupe et sécurité",
      "Organisation d'exercices et de jeux"
    ],
    content: [],
  },
];

export const metadata = {
  siteTitle: "Gabriel Bigot | Développeur d'Automatisations IA",
  siteDescription: "Portfolio de Gabriel Bigot, développeur spécialisé en automatisation et intelligence artificielle. Étudiant en économie-gestion passionné par la transformation digitale des PME.",
  siteKeywords: [
    "Gabriel Bigot",
    "automatisation",
    "intelligence artificielle",
    "IA",
    "Python",
    "Flask",
    "développeur",
    "ESDHEM",
    "SKEMA",
    "hockey",
    "PME",
    "transformation digitale",
    "Excel VBA",
    "LLM",
    "prompt engineering"
  ],
  siteUrl: "https://gabrielbigot.com", // À mettre à jour avec votre domaine
  ogImage: "/og-image.jpg",
  twitterHandle: "@gabrielbigot" // À mettre à jour si vous avez Twitter
};
