// Registre des contenus éditables du site : une clé = un fichier JSON dans content/site/.
// Utilisé par le chargeur (lib/site-content.ts) et par le studio (/studio).
export type ContentGroup = "Profil" | "Projets & expérience" | "Articles" | "Pages" | "Interface" | "Anglais"
export type ContentDef = { key: string; file: string; label: string; group: ContentGroup; hint?: string; preview?: string }

export const CONTENT: ContentDef[] = [
  { key: "personalInfo", file: "personal-info.json", label: "Informations personnelles", group: "Profil", hint: "Nom, titre, accroche, rôle actuel, contact.", preview: "/portfolio" },
  { key: "socialLinks", file: "social-links.json", label: "Réseaux et liens", group: "Profil", preview: "/portfolio" },
  { key: "skills", file: "skills.json", label: "Compétences", group: "Profil", preview: "/portfolio" },
  { key: "education", file: "education.json", label: "Formation", group: "Profil", preview: "/portfolio" },
  { key: "interests", file: "interests.json", label: "Centres d'intérêt", group: "Profil", preview: "/portfolio" },
  { key: "achievements", file: "achievements.json", label: "Réalisations", group: "Profil", preview: "/portfolio" },
  { key: "timeline", file: "timeline.json", label: "Chronologie", group: "Profil", preview: "/portfolio" },
  { key: "workExperience", file: "work-experience.json", label: "Expériences (résumé)", group: "Projets & expérience", preview: "/portfolio" },
  { key: "companies", file: "companies.json", label: "Entreprises (pages « work »)", group: "Projets & expérience", preview: "/work" },
  { key: "projects", file: "projects.json", label: "Projets", group: "Projets & expérience", hint: "Chaque projet : texte, images, étapes, technologies.", preview: "/projects" },
  { key: "pages", file: "pages.json", label: "Nouvelles pages et sections ajoutées", group: "Pages", hint: "Pages créées (/p/…) et sections ajoutées aux pages existantes. Plus pratique : l'éditeur direct (survol d'une section → « + Ajouter une section »).", preview: "/portfolio" },
  { key: "layout", file: "layout.json", label: "Mise en page : ordre, masquage, fonds, espacements", group: "Pages", hint: "Réglages par page et par section. Plus pratique : l'éditeur direct.", preview: "/portfolio" },
  { key: "theme", file: "theme.json", label: "Thème : couleurs, arrondi, police", group: "Interface", hint: "Couleurs du site en clair et en sombre. Plus pratique : pastille « Thème » de l'éditeur direct.", preview: "/portfolio" },
  { key: "strings", file: "strings.json", label: "Tous les textes des pages (titres, boutons, légendes…)", group: "Interface", hint: "Un bloc par page ou composant ; chaque ligne est un texte affiché sur le site.", preview: "/portfolio" },
  { key: "uiPortfolio", file: "ui-portfolio.json", label: "Textes de la page d'accueil (FR/EN)", group: "Interface", preview: "/portfolio" },
  { key: "uiProjects", file: "ui-projects.json", label: "Textes de la page projets (FR/EN)", group: "Interface", preview: "/projects" },
  { key: "metadata", file: "metadata.json", label: "Référencement (titre, description, image)", group: "Interface", preview: "/portfolio" },
  { key: "enProfile", file: "en-profile.json", label: "Profil en anglais", group: "Anglais", preview: "/en/portfolio" },
  { key: "companiesEn", file: "companies-en.json", label: "Expériences en anglais (page /en/work)", group: "Anglais", preview: "/en/work" },
  { key: "projectsEn", file: "projects-en.json", label: "Projets en anglais", group: "Anglais", preview: "/en/projects" },
]
export const CONTENT_BY_KEY = Object.fromEntries(CONTENT.map(c => [c.key, c])) as Record<string, ContentDef>
export const contentPath = (file: string) => `content/site/${file}`
