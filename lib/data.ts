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
  availability: "Recherche stage IA - Jan-Fév 2026",
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
  }
};

export const socialLinks = [
  {
    name: "GitHub",
    url: "https://github.com/gabrielbigot", // À mettre à jour avec votre vrai GitHub
    icon: "github"
  },
  {
    name: "LinkedIn",
    url: "https://linkedin.com/in/gabriel-bigot", // À mettre à jour avec votre vrai LinkedIn
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
        { name: "UI Automation", level: 80, description: "Automatisation d'interfaces" }
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
        { name: "VS Code", level: 85, description: "Environnement de développement" }
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
    }
  ],

  languages: [
    { name: "Français", level: "Natif" },
    { name: "Anglais", level: "Opérationnel", certification: "TOEIC 900+" }
  ]
};

export const projects = [
  {
    id: "accounting-automation-app",
    title: "Application Web de Comptabilité Automatisée",
    slug: "accounting-automation-app",
    shortDescription: "Application web complète pour automatiser les processus comptables d'une PME",
    fullDescription: `Développement from scratch d'une application web permettant d'automatiser l'ensemble du processus de saisie comptable pour BIGOT Matériaux. L'application élimine les tâches répétitives et réduit drastiquement le temps de traitement.`,
    category: "Automatisation",
    tags: ["Python", "Flask", "Supabase", "IA", "Comptabilité", "Web App"],
    date: "2025-09",
    company: "BIGOT Matériaux",
    featured: true,
    image: "/projects/accounting-app.jpg", // À ajouter
    problem: "Les saisies comptables répétitives prenaient plusieurs heures par semaine et étaient sujettes aux erreurs humaines.",
    solution: "Création d'une application web avec interface intuitive permettant de générer automatiquement les écritures comptables à partir de règles prédéfinies.",
    impact: [
      "Réduction de 80% du temps de saisie comptable",
      "Élimination quasi-totale des erreurs de saisie",
      "Génération automatique des écritures complexes",
      "Interface accessible sans compétences techniques"
    ],
    technologies: [
      { name: "Python", usage: "Backend et logique métier" },
      { name: "Flask", usage: "Framework web et API" },
      { name: "Supabase", usage: "Base de données cloud et authentification" },
      { name: "HTML/CSS/JS", usage: "Interface utilisateur" }
    ],
    challenges: [
      "Comprendre les règles comptables complexes",
      "Assurer la fiabilité des générations automatiques",
      "Créer une interface accessible aux non-techniciens"
    ],
    learnings: [
      "Architecture d'applications web Python",
      "Gestion de base de données cloud",
      "Importance de l'UX pour l'adoption utilisateur"
    ]
  },
  {
    id: "bank-statement-automation",
    title: "Automatisation Traitement Relevés Bancaires",
    slug: "bank-statement-automation",
    shortDescription: "Système d'extraction et formatage automatique de relevés bancaires PDF vers Excel",
    fullDescription: `Développement d'un pipeline complet pour extraire les données de relevés bancaires PDF, les structurer et les préparer pour l'import dans le système comptable.`,
    category: "Automatisation",
    tags: ["Python", "OCR", "PDF", "Excel", "Data Processing"],
    date: "2025-08",
    company: "BIGOT Matériaux",
    featured: true,
    image: "/projects/bank-automation.jpg", // À ajouter
    problem: "Le traitement manuel de dizaines de relevés bancaires PDF prenait plusieurs heures et était source d'erreurs.",
    solution: "Création d'un script Python utilisant l'OCR et le parsing intelligent pour extraire, nettoyer et formater automatiquement les données.",
    impact: [
      "Traitement de 50+ relevés en quelques minutes vs plusieurs heures",
      "Précision de 98% dans l'extraction des données",
      "Export direct vers format compatible comptabilité",
      "Élimination de la saisie manuelle"
    ],
    technologies: [
      { name: "Python", usage: "Script d'automatisation" },
      { name: "OCR", usage: "Extraction de texte depuis PDF" },
      { name: "Pandas", usage: "Manipulation et nettoyage de données" },
      { name: "Excel", usage: "Export formaté" }
    ],
    challenges: [
      "Variabilité des formats de PDF bancaires",
      "Reconnaissance OCR précise des montants",
      "Gestion des cas limites et erreurs"
    ],
    learnings: [
      "Techniques d'OCR et parsing de documents",
      "Importance de la validation de données",
      "Gestion robuste des erreurs"
    ]
  },
  {
    id: "excel-automation-suite",
    title: "Suite d'Automatisations Excel Avancées",
    slug: "excel-automation-suite",
    shortDescription: "Collection d'automatisations Excel pour optimiser les processus quotidiens",
    fullDescription: `Développement de multiples automatisations Excel/VBA pour gérer les relances clients, regrouper des données de sources multiples, effectuer des calculs complexes et supprimer les doublons intelligemment.`,
    category: "Automatisation",
    tags: ["Excel", "VBA", "Automatisation", "Productivité"],
    date: "2025-07",
    company: "BIGOT Matériaux",
    featured: false,
    image: "/projects/excel-suite.jpg", // À ajouter
    problem: "Tâches Excel répétitives quotidiennes mobilisant plusieurs heures de travail productif.",
    solution: "Suite de macros VBA et automatisations pour transformer des processus manuels en workflows automatiques.",
    impact: [
      "Gain de temps : 10+ heures par semaine",
      "Relances clients automatiques et personnalisées",
      "Consolidation de données multi-sources en un clic",
      "Détection et suppression intelligente de doublons"
    ],
    technologies: [
      { name: "Excel", usage: "Plateforme principale" },
      { name: "VBA", usage: "Macros et automatisations" },
      { name: "Power Query", usage: "Transformation de données" }
    ],
    challenges: [
      "Gérer la complexité des différents formats de données",
      "Créer des automatisations réutilisables",
      "Optimiser les performances sur gros volumes"
    ],
    learnings: [
      "Maîtrise avancée de VBA",
      "Design de solutions utilisateur-friendly",
      "Importance de la documentation"
    ]
  },
  {
    id: "meeting-minutes-automation",
    title: "Génération Automatique de Procès-Verbaux",
    slug: "meeting-minutes-automation",
    shortDescription: "Système d'automatisation de la génération de PV d'assemblées générales",
    fullDescription: `Automatisation complète de la création de procès-verbaux d'assemblées générales à partir de templates et de données structurées.`,
    category: "Automatisation",
    tags: ["Python", "Document Generation", "Templates", "Automatisation"],
    date: "2025-09",
    company: "BIGOT Matériaux",
    featured: false,
    image: "/projects/pv-automation.jpg", // À ajouter
    problem: "Rédaction manuelle de PV d'AG longue et sujette à oublis ou erreurs de formatage.",
    solution: "Script Python générant automatiquement des PV formatés à partir de données saisies et de templates Word.",
    impact: [
      "Réduction du temps de rédaction de 90%",
      "Garantie de conformité et cohérence",
      "Templates personnalisables facilement",
      "Export PDF automatique"
    ],
    technologies: [
      { name: "Python", usage: "Logique de génération" },
      { name: "python-docx", usage: "Manipulation de documents Word" },
      { name: "Templates", usage: "Modèles de documents" }
    ],
    challenges: [
      "Respect strict du formalisme légal",
      "Gestion de cas variés d'assemblées",
      "Personnalisation flexible des templates"
    ],
    learnings: [
      "Génération programmatique de documents",
      "Importance des templates bien structurés",
      "Automatisation de workflows administratifs"
    ]
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
    id: "ia-pme-transformation",
    title: "Comment l'IA transforme les PME : retour d'expérience",
    slug: "ia-pme-transformation",
    excerpt: "Mon parcours d'automatisation dans une PME familiale : de la simple tâche répétitive à la transformation complète des processus.",
    date: "2025-10",
    readingTime: "8 min",
    category: "IA & Business",
    featured: true,
    published: true,
    content: [
      {
        type: "paragraph",
        text: "En juillet 2025, quand je suis arrivé chez BIGOT Matériaux pour mon stage d'été, je ne m'imaginais pas que j'allais transformer radicalement la façon dont l'entreprise familiale gérait ses processus comptables et RH. Pourtant, c'est exactement ce qui s'est passé."
      },
      {
        type: "heading",
        text: "Le point de départ : des tâches répétitives qui coûtent cher"
      },
      {
        type: "paragraph",
        text: "Dans une PME, chaque heure compte. Et pourtant, j'ai observé que des heures précieuses étaient perdues chaque semaine dans des tâches répétitives : saisie comptable manuelle, traitement de relevés bancaires, génération de documents administratifs, relances clients..."
      },
      {
        type: "paragraph",
        text: "Le problème n'était pas la compétence des personnes, mais simplement que ces tâches n'avaient pas été pensées pour être automatisées. Elles avaient toujours été faites manuellement, donc on continuait comme ça."
      },
      {
        type: "heading",
        text: "La première automatisation : le déclic"
      },
      {
        type: "paragraph",
        text: "J'ai commencé par observer et identifier les tâches les plus chronophages. La saisie comptable répétitive est rapidement apparue comme le candidat parfait pour l'automatisation. J'ai développé une application web complète en Python/Flask qui permet de générer automatiquement les écritures comptables à partir de règles prédéfinies."
      },
      {
        type: "paragraph",
        text: "Résultat ? Une réduction de 80% du temps de saisie. Mais plus important encore : zéro erreur de saisie, et une personne libérée pour se concentrer sur des tâches à plus forte valeur ajoutée."
      },
      {
        type: "heading",
        text: "L'effet domino : de l'automatisation ponctuelle à la transformation"
      },
      {
        type: "paragraph",
        text: "Une fois la première automatisation en place, quelque chose d'intéressant s'est produit : tout le monde a commencé à voir les processus différemment. Au lieu d'accepter les tâches répétitives, on se demandait : 'Est-ce qu'on pourrait automatiser ça aussi ?'"
      },
      {
        type: "list",
        items: [
          "Traitement automatique des relevés bancaires : extraction PDF, mise en forme Excel, préparation import comptable",
          "Système de relances clients automatiques et personnalisées",
          "Génération automatique de procès-verbaux d'assemblées générales",
          "Consolidation automatique de données multi-sources"
        ]
      },
      {
        type: "heading",
        text: "Les leçons apprises"
      },
      {
        type: "paragraph",
        text: "Cette expérience m'a appris trois choses fondamentales sur la transformation digitale des PME :"
      },
      {
        type: "list",
        items: [
          "Commencer petit : une seule automatisation réussie vaut mieux que trois projets ambitieux qui n'aboutissent jamais",
          "L'adoption est clé : la meilleure automatisation du monde ne sert à rien si personne ne l'utilise. L'interface utilisateur et la simplicité sont critiques",
          "Mesurer l'impact : pouvoir montrer concrètement le temps gagné et les erreurs évitées est essentiel pour justifier l'investissement"
        ]
      },
      {
        type: "heading",
        text: "L'IA accessible aux PME"
      },
      {
        type: "paragraph",
        text: "Ce qui est fascinant aujourd'hui, c'est que ces technologies ne sont plus réservées aux grandes entreprises. Avec Python, Flask, des services cloud comme Supabase, et les APIs d'IA modernes, n'importe quelle PME peut se lancer dans l'automatisation."
      },
      {
        type: "paragraph",
        text: "Le vrai défi n'est pas technique, il est culturel : accepter que les processus peuvent être repensés, et investir le temps initial pour créer ces automatisations."
      },
      {
        type: "quote",
        text: "L'IA et l'automatisation ne remplacent pas les humains dans les PME, elles les libèrent pour qu'ils puissent se concentrer sur ce qu'ils font de mieux : la relation client, la stratégie, la créativité."
      },
      {
        type: "heading",
        text: "Et maintenant ?"
      },
      {
        type: "paragraph",
        text: "Cette expérience a renforcé ma conviction : je veux aider les PME à s'approprier ces technologies. Que ce soit en intégrant SKEMA pour une spécialisation en IA & Business Transformation, ou en travaillant directement avec des entreprises, mon objectif est clair : démocratiser l'IA pour les PME."
      },
      {
        type: "paragraph",
        text: "Parce qu'au final, ce ne sont pas les grandes entreprises qui ont le plus à gagner de l'IA. Ce sont les PME, où chaque heure compte, où chaque erreur coûte cher, et où la transformation peut avoir un impact immédiat et mesurable."
      }
    ]
  },
  {
    id: "resilience-sportive-tech",
    title: "Ce que le hockey m'a appris sur la résilience en tech",
    slug: "resilience-sportive-tech",
    excerpt: "Comment surmonter une grave blessure m'a préparé aux défis du développement et de l'entrepreneuriat.",
    date: "2025-09",
    readingTime: "6 min",
    category: "Développement Personnel",
    featured: true,
    published: true,
    content: [
      {
        type: "paragraph",
        text: "2019. J'ai 14 ans, je suis capitaine de mon équipe de hockey, vice-champion de France en salle l'année précédente. Tout va bien. Et puis, une simple chute pendant un match va tout changer."
      },
      {
        type: "heading",
        text: "Le choc : quand tout s'effondre"
      },
      {
        type: "paragraph",
        text: "Une opération du genou. Ça devait être simple. Mais une infection post-opératoire transforme ce qui devait être une petite pause en un cauchemar médical : ré-opération, hospitalisation prolongée, complications..."
      },
      {
        type: "paragraph",
        text: "À 14 ans, j'apprends que mon retour au sport n'est pas garanti. Qu'il va falloir se battre, rééduquer, souffrir, et surtout : ne pas abandonner."
      },
      {
        type: "heading",
        text: "La leçon 1 : L'échec n'est jamais définitif"
      },
      {
        type: "paragraph",
        text: "Trois ans plus tard, je joue à nouveau au hockey. En 2ème division française. Pronostic dépassé."
      },
      {
        type: "paragraph",
        text: "Cette expérience m'a appris quelque chose de fondamental que je retrouve tous les jours dans le développement : un échec n'est jamais la fin de l'histoire. C'est juste un obstacle temporaire qui nécessite de l'adaptation."
      },
      {
        type: "list",
        items: [
          "Un bug que je ne comprends pas ? Je vais le résoudre, ça prendra peut-être des heures, mais je vais y arriver",
          "Une automatisation qui ne fonctionne pas comme prévu ? On itère, on teste, on améliore",
          "Une technologie que je ne maîtrise pas ? Je l'apprends, point"
        ]
      },
      {
        type: "heading",
        text: "La leçon 2 : La progression n'est jamais linéaire"
      },
      {
        type: "paragraph",
        text: "En rééducation, j'ai eu des journées où je progressais. Et des journées où je régressais. Des moments où j'avais l'impression d'aller mieux, puis une douleur qui revenait et me faisait douter de tout."
      },
      {
        type: "paragraph",
        text: "C'est exactement pareil dans l'apprentissage de nouvelles technologies. Certains jours, je comprends tout facilement. D'autres jours, je passe 4 heures sur un problème qui devrait prendre 20 minutes. Et c'est normal."
      },
      {
        type: "quote",
        text: "Ce qui compte, ce n'est pas d'avancer tous les jours. C'est de ne jamais abandonner, même les jours où on recule."
      },
      {
        type: "heading",
        text: "La leçon 3 : L'importance de l'équipe"
      },
      {
        type: "paragraph",
        text: "Ce qui m'a permis de revenir au hockey, ce n'est pas juste ma détermination personnelle. C'est aussi :"
      },
      {
        type: "list",
        items: [
          "Les kinés qui m'ont accompagné semaine après semaine",
          "Mes coéquipiers qui m'ont soutenu et motivé",
          "Mon club qui a cru en mon retour",
          "Ma famille qui n'a jamais douté"
        ]
      },
      {
        type: "paragraph",
        text: "En tech aussi, on ne réussit jamais seul. Les communautés en ligne, les collègues qui prennent le temps d'expliquer, les open source maintainers qui créent des outils incroyables... Tout ça forme un écosystème qui nous permet d'aller plus loin."
      },
      {
        type: "heading",
        text: "La leçon 4 : La modestie face aux défis"
      },
      {
        type: "paragraph",
        text: "Cette expérience m'a aussi appris l'humilité. Avant ma blessure, j'étais confiant, peut-être même un peu arrogant. Après, j'ai compris que je ne contrôlais pas tout, que la fragilité fait partie de la vie."
      },
      {
        type: "paragraph",
        text: "Dans le développement, cette modestie est essentielle. Je ne prétends pas tout savoir. Je suis conscient de mes limites. Et c'est précisément cette conscience qui me pousse à toujours apprendre, à rester curieux, à demander de l'aide quand j'en ai besoin."
      },
      {
        type: "heading",
        text: "Aujourd'hui : appliquer ces leçons"
      },
      {
        type: "paragraph",
        text: "Quand je développe une automatisation complexe et que je bloque sur un problème technique, je repense à cette période. Si j'ai pu revenir au hockey après tout ça, je peux résoudre ce bug."
      },
      {
        type: "paragraph",
        text: "Quand je me lance dans l'apprentissage d'une nouvelle technologie et que je me sens dépassé, je me rappelle que la progression n'est jamais linéaire. Que c'est normal de galérer au début."
      },
      {
        type: "paragraph",
        text: "Quand je travaille sur un projet ambitieux, je n'oublie jamais de demander conseil, de m'appuyer sur la communauté, de partager mes difficultés."
      },
      {
        type: "quote",
        text: "La résilience, ce n'est pas de ne jamais tomber. C'est de toujours se relever. Dans le sport comme dans la tech."
      }
    ]
  },
  {
    id: "automatisation-excel-python",
    title: "Excel vs Python : quand et comment automatiser ?",
    slug: "automatisation-excel-python",
    excerpt: "Guide pratique pour choisir entre VBA et Python selon vos besoins d'automatisation.",
    date: "2025-08",
    readingTime: "10 min",
    category: "Technique",
    featured: false,
    published: true,
    content: [
      {
        type: "paragraph",
        text: "Après avoir développé des dizaines d'automatisations pour BIGOT Matériaux, une question revient constamment : 'Est-ce que je devrais faire ça en Excel/VBA ou en Python ?' Voici mon guide pratique basé sur l'expérience terrain."
      },
      {
        type: "heading",
        text: "Excel/VBA : quand l'utiliser ?"
      },
      {
        type: "paragraph",
        text: "Excel reste un outil incroyablement puissant pour l'automatisation, surtout dans un contexte PME. Voici quand je choisis Excel/VBA :"
      },
      {
        type: "list",
        items: [
          "L'utilisateur final travaille déjà dans Excel quotidiennement",
          "Les données source et destination sont dans Excel",
          "L'automatisation est relativement simple (macros, formules avancées, Power Query)",
          "Vous voulez une adoption immédiate sans formation technique",
          "Le volume de données reste raisonnable (< 100k lignes)"
        ]
      },
      {
        type: "heading",
        text: "Exemple : Relances clients automatiques"
      },
      {
        type: "paragraph",
        text: "J'ai créé une macro VBA qui :"
      },
      {
        type: "list",
        items: [
          "Lit la liste des clients en retard de paiement depuis un export comptable",
          "Génère automatiquement des emails personnalisés",
          "Crée un rapport de suivi dans Excel",
          "Met à jour les statuts de relance"
        ]
      },
      {
        type: "paragraph",
        text: "Pourquoi Excel ici ? Parce que l'utilisateur travaille déjà dans Excel, connaît l'interface, et peut facilement vérifier/modifier les données avant l'envoi."
      },
      {
        type: "code",
        text: `Sub RelancerClients()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets("Relances")

    ' Parcourir les clients en retard
    For Each row In ws.Range("A2:A" & ws.Cells(Rows.Count, 1).End(xlUp).Row)
        If row.Offset(0, 3).Value > 30 Then ' Retard > 30 jours
            Call GenererEmailRelance(row)
        End If
    Next row
End Sub`
      },
      {
        type: "heading",
        text: "Python : quand l'utiliser ?"
      },
      {
        type: "paragraph",
        text: "Python devient le meilleur choix dans ces situations :"
      },
      {
        type: "list",
        items: [
          "Vous devez interagir avec des APIs externes",
          "Le traitement implique des données de sources multiples (PDF, bases de données, web)",
          "Le volume de données est important (> 100k lignes)",
          "Vous avez besoin de fonctionnalités avancées (ML, OCR, scraping)",
          "L'automatisation doit tourner en arrière-plan ou sur un serveur",
          "Vous voulez créer une interface web"
        ]
      },
      {
        type: "heading",
        text: "Exemple : Traitement automatique de relevés bancaires"
      },
      {
        type: "paragraph",
        text: "J'ai développé un script Python qui :"
      },
      {
        type: "list",
        items: [
          "Lit des dizaines de PDF bancaires",
          "Extrait les transactions avec OCR",
          "Nettoie et structure les données avec Pandas",
          "Génère un fichier Excel formaté pour import comptable"
        ]
      },
      {
        type: "paragraph",
        text: "Pourquoi Python ? Parce que gérer l'OCR, le parsing de PDF complexes, et le traitement de gros volumes de données est bien plus simple en Python qu'en VBA."
      },
      {
        type: "code",
        text: `import pandas as pd
import pdfplumber
from pathlib import Path

def extraire_transactions_pdf(pdf_path):
    transactions = []

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            # Extraction et parsing
            text = page.extract_text()
            # ... logique d'extraction

    return pd.DataFrame(transactions)

# Traiter tous les PDFs
dfs = []
for pdf_file in Path("releves/").glob("*.pdf"):
    df = extraire_transactions_pdf(pdf_file)
    dfs.append(df)

# Consolider et exporter
final_df = pd.concat(dfs)
final_df.to_excel("import_comptable.xlsx", index=False)`
      },
      {
        type: "heading",
        text: "L'approche hybride : le meilleur des deux mondes"
      },
      {
        type: "paragraph",
        text: "Souvent, la meilleure solution combine Excel et Python :"
      },
      {
        type: "list",
        items: [
          "Python pour le traitement lourd et complexe",
          "Excel pour l'interface utilisateur et la présentation finale",
          "Python génère des fichiers Excel que l'utilisateur peut consulter/modifier",
          "Excel déclenche des scripts Python via VBA si nécessaire"
        ]
      },
      {
        type: "heading",
        text: "Mon framework de décision"
      },
      {
        type: "paragraph",
        text: "Voici le processus que je suis pour choisir :"
      },
      {
        type: "list",
        items: [
          "Étape 1 : Est-ce que l'utilisateur final vit dans Excel ? → Si oui, privilégier Excel/VBA",
          "Étape 2 : Est-ce que le traitement est complexe (APIs, OCR, ML) ? → Si oui, Python",
          "Étape 3 : Est-ce que le volume de données est important ? → Si oui, Python",
          "Étape 4 : Est-ce que l'automatisation doit tourner sans intervention ? → Si oui, Python",
          "Étape 5 : Sinon, Excel/VBA est probablement le meilleur choix"
        ]
      },
      {
        type: "heading",
        text: "Conseils pratiques"
      },
      {
        type: "paragraph",
        text: "Quelques bonnes pratiques apprises sur le terrain :"
      },
      {
        type: "list",
        items: [
          "Commencez simple : ne pas sur-ingéniériser dès le début",
          "Privilégiez l'adoption : la meilleure solution est celle que les gens utilisent réellement",
          "Documentez : dans 6 mois, vous aurez oublié comment ça marche",
          "Testez avec de vraies données : les cas limites apparaissent toujours en production",
          "Itérez : la première version n'a pas besoin d'être parfaite"
        ]
      },
      {
        type: "quote",
        text: "Le meilleur outil n'est pas celui qui est le plus avancé techniquement, c'est celui qui résout le problème de la façon la plus simple possible."
      }
    ]
  },
  {
    id: "llm-prompt-engineering",
    title: "Prompt Engineering : l'art de parler aux IA",
    slug: "llm-prompt-engineering",
    excerpt: "Mes techniques et bonnes pratiques pour obtenir les meilleurs résultats avec les LLM.",
    date: "2025-07",
    readingTime: "12 min",
    category: "IA",
    featured: false,
    published: true,
    content: [
      {
        type: "paragraph",
        text: "Depuis 2022, j'expérimente quotidiennement avec les LLM (GPT, Claude, etc.). Au fil du temps, j'ai développé des techniques de prompt engineering qui transforment radicalement la qualité des résultats. Voici ce que j'ai appris."
      },
      {
        type: "heading",
        text: "Principe 1 : La spécificité bat la généralité"
      },
      {
        type: "paragraph",
        text: "Mauvais prompt : 'Écris-moi un script Python pour traiter des données.'"
      },
      {
        type: "paragraph",
        text: "Bon prompt : 'Écris un script Python qui lit un fichier CSV contenant des transactions bancaires (colonnes : date, libellé, montant), filtre les transactions > 1000€, et génère un rapport Excel avec une colonne supplémentaire indiquant le mois de la transaction.'"
      },
      {
        type: "paragraph",
        text: "La différence ? Le contexte, les contraintes précises, et le résultat attendu clairement défini."
      },
      {
        type: "heading",
        text: "Principe 2 : Donnez des exemples"
      },
      {
        type: "paragraph",
        text: "Les LLM apprennent incroyablement bien par l'exemple. Au lieu de décrire ce que vous voulez, montrez-le."
      },
      {
        type: "paragraph",
        text: "Exemple de prompt pour formater des données :"
      },
      {
        type: "code",
        text: `J'ai des données de transactions brutes :
"23/01/2025 ACHAT FOURNISSEUR ABC 2500.00"
"24/01/2025 VIREMENT SALAIRE DUPONT 3200.00"

Je veux les formater comme :
Date: 2025-01-23
Type: Achat
Tiers: Fournisseur ABC
Montant: 2500.00

Formate ces nouvelles transactions de la même façon :
"25/01/2025 REMBOURSEMENT CLIENT XYZ 1200.00"
"26/01/2025 ACHAT MATERIEL DEF 890.00"`
      },
      {
        type: "heading",
        text: "Principe 3 : Le chaînage de prompts"
      },
      {
        type: "paragraph",
        text: "Pour les tâches complexes, ne cherchez pas à tout faire en un seul prompt. Décomposez en étapes :"
      },
      {
        type: "list",
        items: [
          "Étape 1 : Analyser le problème et identifier les sous-tâches",
          "Étape 2 : Pour chaque sous-tâche, créer la solution",
          "Étape 3 : Intégrer les solutions ensemble",
          "Étape 4 : Tester et raffiner"
        ]
      },
      {
        type: "paragraph",
        text: "Cette approche donne des résultats bien supérieurs à un prompt géant qui essaie de tout faire d'un coup."
      },
      {
        type: "heading",
        text: "Principe 4 : Définissez le rôle et le contexte"
      },
      {
        type: "paragraph",
        text: "Les LLM performent mieux quand vous leur donnez un rôle et un contexte précis."
      },
      {
        type: "code",
        text: `Tu es un expert en automatisation comptable pour PME.
Tu as 10 ans d'expérience en intégration de systèmes comptables.

Contexte : Je travaille pour une PME de négoce de matériaux qui utilise AS400
comme système comptable. Nous recevons 50+ relevés bancaires PDF par mois.

Question : Comment puis-je automatiser l'extraction et l'import de ces relevés
dans AS400 ?`
      },
      {
        type: "heading",
        text: "Principe 5 : Itérez et raffinez"
      },
      {
        type: "paragraph",
        text: "Le premier résultat est rarement parfait. Voici comment j'itère :"
      },
      {
        type: "list",
        items: [
          "Première passe : obtenir une solution générale",
          "Deuxième passe : 'Améliore cette solution en ajoutant la gestion des erreurs'",
          "Troisième passe : 'Optimise le code pour traiter 1000+ fichiers'",
          "Quatrième passe : 'Ajoute des logs détaillés pour le debugging'"
        ]
      },
      {
        type: "heading",
        text: "Technique avancée 1 : Le prompting structuré"
      },
      {
        type: "paragraph",
        text: "Pour des tâches complexes, j'utilise une structure CRISPE :"
      },
      {
        type: "list",
        items: [
          "C - Contexte : Quelle est la situation ?",
          "R - Rôle : Qui est l'IA dans ce scénario ?",
          "I - Instructions : Que doit-elle faire exactement ?",
          "S - Steps : Quelles étapes suivre ?",
          "P - Persona : Quel style de réponse ?",
          "E - Examples : Des exemples concrets"
        ]
      },
      {
        type: "heading",
        text: "Technique avancée 2 : Le few-shot learning"
      },
      {
        type: "paragraph",
        text: "Plutôt que de décrire la tâche, donnez plusieurs exemples :"
      },
      {
        type: "code",
        text: `Extrait les informations clés de ces factures :

Facture 1:
"FACTURE N°2025-001
CLIENT: ENTREPRISE ABC
DATE: 15/01/2025
MONTANT HT: 2500.00€
TVA: 500.00€
TOTAL TTC: 3000.00€"

Extraction:
{
  "numero": "2025-001",
  "client": "ENTREPRISE ABC",
  "date": "2025-01-15",
  "ht": 2500.00,
  "tva": 500.00,
  "ttc": 3000.00
}

Maintenant extrait de cette nouvelle facture :
[nouvelle facture ici]`
      },
      {
        type: "heading",
        text: "Technique avancée 3 : La validation en boucle"
      },
      {
        type: "paragraph",
        text: "Pour les tâches critiques, faites valider le résultat par l'IA elle-même :"
      },
      {
        type: "list",
        items: [
          "Prompt 1 : Générer le code",
          "Prompt 2 : 'Analyse ce code et identifie les bugs potentiels'",
          "Prompt 3 : 'Corrige les bugs identifiés'",
          "Prompt 4 : 'Vérifie que le code corrigé respecte toutes les contraintes'"
        ]
      },
      {
        type: "heading",
        text: "Mes erreurs de débutant à éviter"
      },
      {
        type: "list",
        items: [
          "Être trop vague : 'Aide-moi à automatiser' → non, soyez précis",
          "Tout demander d'un coup : décomposez les tâches complexes",
          "Ne pas donner de contraintes : précisez les limites, les formats, les cas limites",
          "Ignorer le contexte : donnez toujours le contexte métier",
          "Ne pas vérifier : les LLM peuvent halluciner, vérifiez toujours le code généré"
        ]
      },
      {
        type: "heading",
        text: "Cas pratique : Automatisation d'une tâche comptable"
      },
      {
        type: "paragraph",
        text: "Voici comment j'ai utilisé le prompt engineering pour créer une automatisation :"
      },
      {
        type: "code",
        text: `Prompt 1 (Analyse):
"Je dois automatiser la saisie comptable des notes de frais.
Analyse ce processus et identifie les étapes à automatiser :
1. Réception email avec PDF de note de frais
2. Extraction des informations (date, montant, catégorie, TVA)
3. Validation des montants
4. Génération d'écriture comptable
5. Import dans le système

Quelles sont les étapes les plus critiques ?"

Prompt 2 (Conception):
"Pour l'étape d'extraction PDF, propose une solution Python
utilisant pdfplumber. Le PDF contient :
- En-tête : nom, date
- Tableau : lignes de dépenses avec montant HT, TVA, TTC
- Total en bas

Contraintes :
- Gérer différents formats de PDF
- Détecter les montants incorrects
- Logger toutes les extractions"

Prompt 3 (Implémentation):
"Implémente la fonction extract_note_frais(pdf_path)
qui retourne un dictionnaire avec :
- nom : str
- date : datetime
- lignes : list[dict] avec ht, tva, ttc
- total : float

Ajoute la gestion d'erreurs et les logs."

Prompt 4 (Test):
"Génère des tests unitaires pour cette fonction
en couvrant ces cas :
- PDF valide standard
- PDF avec montants manquants
- PDF avec format de date différent
- PDF corrompu"`
      },
      {
        type: "heading",
        text: "L'avenir : vers des agents autonomes"
      },
      {
        type: "paragraph",
        text: "Au-delà du simple prompt engineering, je commence à expérimenter avec des systèmes d'agents qui :"
      },
      {
        type: "list",
        items: [
          "Décomposent automatiquement les tâches complexes",
          "Utilisent des outils externes (APIs, bases de données)",
          "S'auto-corrigent en validant leurs propres résultats",
          "Apprennent de leurs erreurs précédentes"
        ]
      },
      {
        type: "quote",
        text: "Le prompt engineering n'est pas juste une compétence technique. C'est l'art de communiquer clairement ce que vous voulez, avec des exemples, du contexte, et de la structure."
      },
      {
        type: "heading",
        text: "Conclusion"
      },
      {
        type: "paragraph",
        text: "Le prompt engineering est une compétence qui s'apprend par la pratique. Mes conseils :"
      },
      {
        type: "list",
        items: [
          "Expérimentez quotidiennement",
          "Gardez trace de vos meilleurs prompts",
          "Étudiez les prompts qui fonctionnent bien pour d'autres",
          "N'ayez pas peur d'itérer et de raffiner",
          "Partagez vos découvertes avec la communauté"
        ]
      },
      {
        type: "paragraph",
        text: "Et surtout : restez curieux. Les LLM évoluent constamment, et les techniques qui fonctionnent aujourd'hui seront peut-être obsolètes demain. C'est ça qui rend ce domaine passionnant."
      }
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
