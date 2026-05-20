import {
  getProject,
  getPersonalInfo,
  getProjects,
  getSkills,
  getSocialLinks,
  getWorkExperience,
} from "@/lib/portfolio-data"

export type PortfolioLocale = "fr" | "en"

const workExperienceEn = [
  {
    position: "Freelance AI & Full-Stack Developer",
    location: "Remote, France",
    startDate: "April 2026",
    endDate: "May 2026",
    description:
      "Freelance mission following a successful internship, requested directly by the client. First paid professional engagement based on AI and full-stack development skills.",
    achievements: [
      "Migrated the n8n + Notion system to a custom Next.js 16 web application deployed on Vercel, replacing a fragile automation setup with a controlled SaaS-style dashboard.",
      "Built a full-stack workflow for RSS monitoring, AI-assisted content creation, LinkedIn and Instagram previews, AI image generation, and direct publishing from the dashboard.",
      "Implemented JWT authentication with strict per-user data isolation for articles, posts, and settings.",
    ],
  },
  {
    position: "Business Development & Digital Automation Assistant",
    location: "Remote — Lille, France",
    startDate: "January 2026",
    endDate: "February 2026",
    description:
      "Seven-week internship in a professional training and coaching company. Mission focused on digital transformation through automation and artificial intelligence.",
    achievements: [
      "Designed and deployed 3 production n8n workflows: automated enrichment of 15,000+ BTP prospects, sector monitoring with AI scoring, and LinkedIn content generation.",
      "Created a Notion hub with 5 interconnected databases as the operating interface for the whole system.",
      "Produced roughly 70 minutes of video tutorials and technical documentation to make the non-technical client autonomous.",
    ],
  },
  {
    position: "HR/Accounting Assistant & Automation Developer",
    location: "Etaples, France",
    startDate: "July 2025",
    endDate: "September 2025",
    description:
      "Built strategic automations to optimize HR and accounting processes in my family-owned SME.",
    achievements: [
      "Created a web application to automate accounting tasks with Python, Flask, and a cloud database.",
      "Developed an automated bank statement processing pipeline: PDF extraction, Excel formatting, and accounting import preparation.",
      "Designed advanced Excel automations for customer reminders, data grouping, calculations, and duplicate removal.",
    ],
  },
  {
    position: "Sales Assistant",
    location: "Le Touquet Paris-Plage, France",
    startDate: "July 2024",
    endDate: "August 2024",
    description: "Summer job in the retail clothing sector.",
    achievements: [
      "Customer relations and personalized advice.",
      "Cash register operations and transaction management.",
      "Merchandising, product presentation, and stock management.",
    ],
  },
  {
    position: "HR & Accounting Assistant",
    location: "Etaples, France",
    startDate: "July 2023",
    endDate: "July 2023",
    description: "First exposure to administrative processes in the family business.",
    achievements: [
      "Archived and organized HR documents.",
      "Handled inventories and stock management.",
      "Discovered internal accounting tools including AS400.",
    ],
  },
  {
    position: "Youth Camp Leader & Coach",
    location: "Le Touquet Paris-Plage, France",
    startDate: "July 2022",
    endDate: "July 2022",
    description: "Supervised young field hockey players and led training sessions.",
    achievements: [
      "Led and supervised groups of young players.",
      "Taught sports techniques and structured training exercises.",
      "Managed group safety and daily activities.",
    ],
  },
]

const technicalSkillsEn = [
  {
    category: "Development & Automation",
    skills: [
      { name: "Python", level: 85, description: "Data scripts, automation, Flask" },
      { name: "Flask", level: 75, description: "Web applications and APIs" },
      { name: "Excel/VBA", level: 90, description: "Advanced automation and complex macros" },
      { name: "UI Automation", level: 80, description: "Interface automation" },
      { name: "n8n", level: 80, description: "Production no-code automation workflows" },
      { name: "API Integration", level: 75, description: "REST, OAuth2, webhooks — Pappers, OpenAI, LinkedIn API v2, Google Sheets" },
      { name: "Next.js / React", level: 75, description: "App Router, Server Components, API routes, Vercel Cron" },
      { name: "TypeScript", level: 72, description: "Strict typing, interfaces, generic types" },
    ],
  },
  {
    category: "Data & Databases",
    skills: [
      { name: "SQL", level: 75, description: "Queries and database management" },
      { name: "Supabase", level: 70, description: "Backend as a Service" },
      { name: "Drizzle ORM", level: 68, description: "Typed ORM, Neon PostgreSQL schema, SQL migrations" },
      { name: "Pandas", level: 80, description: "Data manipulation and analysis" },
      { name: "Advanced Excel", level: 95, description: "Pivot tables, complex formulas, Power Query" },
    ],
  },
  {
    category: "Artificial Intelligence",
    skills: [
      { name: "LLM Prototyping", level: 85, description: "GPT, Claude, API integration" },
      { name: "Prompt Design", level: 90, description: "Prompt optimization and chaining" },
      { name: "OCR & Parsing", level: 80, description: "Document data extraction" },
      { name: "AI Agents", level: 75, description: "Multi-agent systems and workflows" },
    ],
  },
  {
    category: "Tools & Productivity",
    skills: [
      { name: "Microsoft Suite", level: 95, description: "Word, Excel, PowerPoint, Outlook" },
      { name: "Git", level: 70, description: "Version control" },
      { name: "VS Code", level: 85, description: "Development environment" },
      { name: "Advanced Notion", level: 75, description: "Interconnected databases, CRM hub, operating interface" },
    ],
  },
]

const softSkillsEn = [
  { name: "Resilience", description: "Ability to overcome obstacles through sport and recovery" },
  { name: "Teamwork", description: "Field hockey team experience and collective mindset" },
  { name: "Self-learning", description: "Daily AI and automation learning practice" },
  { name: "Problem solving", description: "Analytical approach to identifying and automating processes" },
  { name: "Humility", description: "Awareness of limits and continuous learning" },
  { name: "Collective mindset", description: "Team orientation and knowledge sharing" },
  { name: "Teaching & Training", description: "Video tutorials and technical documentation for non-technical clients" },
  { name: "Consulting posture", description: "Business-first approach before technical implementation" },
]

const projectTranslations: Record<string, { title: string; shortDescription: string; category?: string; categories?: string[]; tags?: string[]; company?: string }> = {
  "veille-automatisee-contenus-linkedin": {
    title: "Automated Monitoring & LinkedIn Content Engine",
    shortDescription:
      "End-to-end automation chain: RSS feeds, AI qualification, LinkedIn drafts, AI images, and validated publishing from a Notion hub.",
    category: "Automation",
    categories: ["Automation", "AI", "No-code"],
  },
  "enrichissement-prospects-btp": {
    title: "Automated Enrichment of a BTP Prospect Database",
    shortDescription:
      "n8n workflow connected to the Pappers API to enrich 15,000+ prospects and enable age-based commercial segmentation.",
    category: "Automation",
    categories: ["Automation", "Data", "Prospecting"],
  },
  "automatisation-rappels-sms-greminders": {
    title: "Automated SMS Reminders — Greminders",
    shortDescription: "Set up Greminders to automatically send SMS and email reminders before appointments, reducing no-shows without custom development.",
    category: "No-code",
    categories: ["No-code", "Automation"],
    tags: ["Greminders", "Google Calendar", "No-code", "SMS", "Automation"],
  },
  "veille-ia-automatisee-n8n": {
    title: "Automated AI Watch — n8n Workflow",
    shortDescription: "Personal n8n workflow generating a daily AI intelligence report through Perplexity Deep Research and Grok, delivered by email.",
    category: "Automation",
    categories: ["Automation", "AI", "Watch"],
    company: "Personal",
  },
  "excel-vba-automatisation-relances": {
    title: "Customer Reminder Automation — Python/FastAPI + React",
    shortDescription: "Automation suite for BIGOT Materiaux: AS/400 data processing with FastAPI/Pandas and formatted Excel generation through a React upload interface.",
    category: "Automation",
    categories: ["Automation", "Data"],
  },
  "as400-beta-2-automatisation-comptable": {
    title: "Accounting App v1 — AS/400 Look & Feel",
    shortDescription: "Web app reproducing key AS/400 workflows and automating recurring accounting entries to reduce manual input time.",
    category: "Web App",
    categories: ["Web App", "Accounting"],
  },
  "as400-horizontal-application-comptabilite-moderne": {
    title: "Accounting App v2 — Horizontal Navigation + AI",
    shortDescription: "Modern accounting app for TAC Hockey with horizontal navigation, conversational AI assistant, Supabase, and PDF/CSV exports.",
    category: "Web App",
    categories: ["Web App", "AI", "Accounting"],
  },
  "veille-hub": {
    title: "Watch Hub — Intelligent Search Engine for AI Monitoring",
    shortDescription: "Personal knowledge tool to retrieve saved AI-related tweets through AI search, annotations, notes, and usage statistics.",
    category: "Personal tool",
    categories: ["Personal tool", "AI", "Search"],
  },
  "unlimited-cognition": {
    title: "Unlimited Cognition",
    shortDescription: "Augmented learning web app: SRS, quizzes, writing, audio, annotations, smart planning, analytics, and AI generation designed to support cognitive effort.",
    category: "Learning",
    categories: ["Learning", "AI", "Web App"],
  },
  "screentune": {
    title: "ScreenTune — Product Demo Studio for Freelancers",
    shortDescription: "Native macOS app to turn screenshots or videos into clear client demos with zooms, pauses, arrows, annotations, styling, and MP4 export.",
    category: "macOS App",
    categories: ["macOS App", "Productivity"],
  },
  "adn-dashboard": {
    title: "ADN Dashboard — Custom AI Web App",
    shortDescription: "Custom web app for ADN POTENTIEL: AI-powered news monitoring, content studio with LinkedIn and Instagram previews, direct publishing, and isolated user accounts.",
    category: "Web App",
    categories: ["Web App", "AI", "Automation"],
  },
  "mecenes-hdf-prospection-enrichissement": {
    title: "Patron Prospecting & Enrichment — Hauts-de-France",
    shortDescription: "Automated workflow to identify potential patron companies and retrieve key contacts, enriching 48 companies in a few minutes.",
    category: "Automation",
    categories: ["Automation", "Prospecting", "AI"],
    tags: ["n8n", "Gemini", "Pappers API", "Google Sheets", "Prospecting", "AI"],
  },
}

export function getLocalizedProjects(locale: PortfolioLocale = "fr") {
  const projects = getProjects()
  if (locale === "fr") {
    return projects
  }

  return projects.map((project) => ({
    ...project,
    ...(projectTranslations[project.slug] ?? {}),
    company: projectTranslations[project.slug]?.company ?? project.company,
  }))
}

export function getLocalizedProject(slug: string, locale: PortfolioLocale = "fr") {
  if (locale === "fr") {
    return getProject(slug)
  }

  return getLocalizedProjects("en").find((project) => project.slug === slug) ?? null
}

export function getEnglishProjectDetails(project: any) {
  const defaults = {
    overview: project.shortDescription,
    challenge:
      "The project started from a concrete operational friction: repetitive work, scattered information, or a workflow that was too fragile to scale reliably.",
    solution:
      "I designed a practical automation-oriented solution combining APIs, AI tools, data handling, and a user interface when needed.",
    outcomes: [
      "Reduced manual work and made the process easier to operate.",
      "Connected business needs with concrete technical implementation.",
      "Delivered a reusable workflow or product that can be maintained and improved.",
    ],
  }

  const details: Record<string, Partial<typeof defaults>> = {
    "veille-automatisee-contenus-linkedin": {
      challenge: "ADN POTENTIEL needed a repeatable way to monitor relevant industry news and transform it into LinkedIn-ready content without manually scanning sources every day.",
      solution: "I built three connected n8n workflows around RSS feeds, AI qualification, content drafting, image generation, and a Notion hub used as the validation interface.",
      outcomes: [
        "Automated the full chain from article discovery to publication-ready LinkedIn drafts.",
        "Kept human validation in the loop through Notion.",
        "Delivered documentation and tutorials so the client could operate the system independently.",
      ],
    },
    "enrichissement-prospects-btp": {
      challenge: "A large BTP prospect database lacked the information needed to prioritize commercial outreach by business owner age.",
      solution: "I connected n8n to the Pappers API and Google Sheets to enrich more than 15,000 prospects and create actionable segmentation.",
      outcomes: [
        "Enabled targeted outreach by age range.",
        "Reached 85%+ completion on the enrichment workflow.",
        "Turned a static prospect file into a usable commercial dataset.",
      ],
    },
    "adn-dashboard": {
      challenge: "The previous n8n + Notion setup was reaching execution limits and could not provide realistic social media previews or direct Instagram publishing.",
      solution: "I built a custom Next.js 16 dashboard with authentication, PostgreSQL storage, AI-assisted monitoring, post generation, previews, scheduling, and publishing workflows.",
      outcomes: [
        "Replaced a fragile automation stack with a controlled web application.",
        "Separated data by user account with JWT authentication.",
        "Created a more scalable foundation for ADN POTENTIEL's content operations.",
      ],
    },
    "veille-ia-automatisee-n8n": {
      challenge: "I needed a reliable way to stay informed about AI news without manually checking many sources every morning.",
      solution: "I built a scheduled n8n workflow orchestrating AI research, report structuring, HTML formatting, and email delivery.",
      outcomes: [
        "Created a daily AI intelligence report.",
        "Combined web and social sources into a structured format.",
        "Improved my personal learning and monitoring workflow.",
      ],
    },
    "veille-hub": {
      challenge: "Saving dozens of AI-related posts per day made retrieval difficult when I needed to find a specific idea later.",
      solution: "I built a personal search and annotation tool with AI-assisted retrieval, notes, and statistics.",
      outcomes: [
        "Made my AI watch searchable and reusable.",
        "Reduced the loss of valuable saved content.",
        "Created a personal knowledge base around fast-moving AI topics.",
      ],
    },
    "unlimited-cognition": {
      challenge: "Most AI learning tools make studying easier by replacing effort, while I wanted AI to support effort and memory.",
      solution: "I built a learning app around SRS, quizzes, writing practice, annotations, planning, analytics, and AI generation.",
      outcomes: [
        "Designed AI as a support for cognitive effort.",
        "Combined multiple study modes in one product.",
        "Explored the link between learning science and AI interfaces.",
      ],
    },
    screentune: {
      challenge: "Client documentation often relies on static screenshots that do not explain gestures, timing, or interface focus clearly enough.",
      solution: "I built a native macOS demo studio to add zooms, pauses, arrows, annotations, visual styling, and MP4 export.",
      outcomes: [
        "Made product explanations clearer for non-technical clients.",
        "Reduced friction in handoff and onboarding materials.",
        "Created a focused tool for freelance delivery workflows.",
      ],
    },
  }

  return {
    ...defaults,
    ...(details[project.slug] ?? {}),
  }
}

export function getPortfolioPageData(locale: PortfolioLocale = "fr") {
  const personalInfo = getPersonalInfo()
  const socialLinks = getSocialLinks()
  const workExperience = getWorkExperience()
  const skills = getSkills()
  const projects = getLocalizedProjects(locale).filter((p) => p.featured)

  if (locale === "fr") {
    return { personalInfo, socialLinks, workExperience, skills, projects }
  }

  return {
    personalInfo: {
      ...personalInfo,
      title: "AI Automation Developer",
      tagline: "Economics and management student applying AI and automation to real business processes",
      availability: "Available now",
      currentRole: {
        ...personalInfo.currentRole,
        position: "Third-year Economics & Management student",
        location: "Lille, France",
      },
    },
    socialLinks,
    workExperience: workExperience.map((job, index) => ({
      ...job,
      ...workExperienceEn[index],
    })),
    skills: {
      ...skills,
      technical: technicalSkillsEn,
      soft: softSkillsEn,
      languages: [
        { name: "French", level: "Native" },
        { name: "English", level: "Working proficiency" },
      ],
    },
    projects: projects.map((project) => ({
      ...project,
      ...(projectTranslations[project.slug] ?? {}),
    })),
  }
}
