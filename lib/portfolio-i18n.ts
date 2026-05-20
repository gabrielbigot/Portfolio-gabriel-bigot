import {
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
