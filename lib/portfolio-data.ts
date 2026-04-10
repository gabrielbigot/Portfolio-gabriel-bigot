/**
 * Portfolio Data — reads from Keystatic content JSON files at runtime.
 * Falls back to static lib/data.ts if content files are missing.
 */

import fs from "fs"
import path from "path"
import {
  personalInfo as staticPersonalInfo,
  socialLinks as staticSocialLinks,
  workExperience as staticWorkExperience,
  education as staticEducation,
  skills as staticSkills,
  timeline as staticTimeline,
  achievements as staticAchievements,
  interests as staticInterests,
  companies as staticCompanies,
  projects as staticProjects,
  blogPosts as staticBlogPosts,
} from "./data"

// ── helpers ──────────────────────────────────────────────────────────────────

function readJson<T>(relativePath: string): T | null {
  try {
    const full = path.join(process.cwd(), relativePath)
    return JSON.parse(fs.readFileSync(full, "utf-8")) as T
  } catch {
    return null
  }
}

function readDir<T extends object>(dir: string): Array<{ slug: string } & T> {
  try {
    const full = path.join(process.cwd(), dir)
    const files = fs.readdirSync(full).filter((f) => f.endsWith(".json"))
    const results: Array<{ slug: string } & T> = []
    for (const file of files) {
      const data = readJson<T>(path.join(dir, file))
      if (data) results.push({ slug: file.replace(".json", ""), ...data } as { slug: string } & T)
    }
    return results
  } catch {
    return []
  }
}

// ── personalInfo ─────────────────────────────────────────────────────────────

type CmsPersonalInfo = {
  name: string
  firstName: string
  lastName: string
  title: string
  tagline: string
  location: string
  email: string
  phone: string
  availability: string
  bioShort: string
  bioFull: string
  cvUrl: string
  objectiveTitle: string
  objectiveText: string
  currentRolePosition: string
  currentRoleCompany: string
  currentRoleLocation: string
  currentRoleStartDate: string
}

export function getPersonalInfo() {
  const cms = readJson<CmsPersonalInfo>("content/personal-info/index.json")
  if (!cms) return staticPersonalInfo
  return {
    ...staticPersonalInfo,
    name: cms.name,
    firstName: cms.firstName,
    lastName: cms.lastName,
    title: cms.title,
    tagline: cms.tagline,
    location: cms.location,
    email: cms.email,
    phone: cms.phone,
    availability: cms.availability,
    cvUrl: cms.cvUrl,
    objectiveTitle: cms.objectiveTitle,
    objectiveText: cms.objectiveText,
    bio: { short: cms.bioShort, full: cms.bioFull },
    currentRole: {
      position: cms.currentRolePosition,
      company: cms.currentRoleCompany,
      location: cms.currentRoleLocation,
      startDate: cms.currentRoleStartDate,
      current: true,
    },
  }
}

// ── socialLinks ───────────────────────────────────────────────────────────────

type CmsSocialLink = { name: string; url: string; icon: string }

export function getSocialLinks() {
  const links = readDir<CmsSocialLink>("content/social-links")
  if (links.length === 0) return staticSocialLinks
  return links.map(({ name, url, icon }) => ({ name, url, icon }))
}

// ── workExperience ────────────────────────────────────────────────────────────

export function getWorkExperience() {
  return staticWorkExperience
}

// ── education ─────────────────────────────────────────────────────────────────

type CmsEducation = {
  degree: string
  school: string
  location: string
  startDate: string
  endDate: string
  description: string
  highlights: string[]
}

export function getEducation() {
  const entries = readDir<CmsEducation>("content/education")
  if (entries.length === 0) return staticEducation
  return entries.map(({ degree, school, location, startDate, endDate, description, highlights }) => ({
    degree,
    school,
    location,
    startDate,
    endDate,
    description,
    highlights,
  }))
}

// ── skills ────────────────────────────────────────────────────────────────────

export function getSkills() {
  return staticSkills
}

// ── timeline ──────────────────────────────────────────────────────────────────

type CmsTimeline = {
  title: string
  year: string
  description: string
  type: string
}

export function getTimeline() {
  const entries = readDir<CmsTimeline>("content/timeline")
  if (entries.length === 0) return staticTimeline
  // Sort by year descending (most recent first) to match lib/data.ts order
  return entries
    .map(({ title, year, description, type }) => ({ title, year, description, type }))
    .sort((a, b) => {
      const aYear = parseInt(a.year.split("-")[0], 10)
      const bYear = parseInt(b.year.split("-")[0], 10)
      return bYear - aYear
    })
}

// ── achievements ──────────────────────────────────────────────────────────────

type CmsAchievement = {
  title: string
  organization: string
  date: string
  description: string
  icon: string
}

export function getAchievements() {
  const entries = readDir<CmsAchievement>("content/achievements")
  if (entries.length === 0) return staticAchievements
  return entries.map(({ title, organization, date, description, icon }) => ({
    title,
    organization,
    date,
    description,
    icon,
  }))
}

// ── interests ─────────────────────────────────────────────────────────────────

type CmsInterest = { name: string; icon: string; description: string }

export function getInterests() {
  const entries = readDir<CmsInterest>("content/interests")
  if (entries.length === 0) return staticInterests
  return entries.map(({ name, icon, description }) => ({ name, icon, description }))
}

// ── companies ─────────────────────────────────────────────────────────────────

type CmsCompany = {
  company: string
  position: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  type: string
  shortDescription: string
  description: string
  logo: string
  logoBackground: string
  companyUrl: string
  technologies: string[]
  achievements: string[]
}

export function getCompanies() {
  const entries = readDir<CmsCompany>("content/companies")
  if (entries.length === 0) return staticCompanies
  return entries.map(({ slug, company, position, location, startDate, endDate, current, type, shortDescription, description, logo, logoBackground, companyUrl, technologies, achievements }) => ({
    id: slug,
    slug,
    company,
    position,
    location,
    startDate,
    endDate,
    current,
    type,
    shortDescription,
    description,
    logo: logo || null,
    logoBackground: logoBackground || null,
    companyUrl: companyUrl || null,
    technologies,
    achievements,
    content: [],
  }))
}

export function getCompany(slug: string) {
  const companies = getCompanies()
  return companies.find((c) => c.slug === slug) ?? null
}

export function getCompanyProjects(companySlug: string, companyName?: string) {
  const companies = getCompanies()
  const company = companies.find((c) => c.slug === companySlug)
  const name = companyName ?? company?.company
  if (!name) return []
  // Read projects from CMS
  const projects = getProjects()
  return projects.filter((p) => p.company === name)
}

// ── projects ──────────────────────────────────────────────────────────────────

type CmsProject = {
  title: string
  shortDescription: string
  fullDescription: string
  category: string
  categories: string[]
  tags: string[]
  date: string
  company: string
  featured: boolean
  image: string
  problem: string
  solution: string
  impact: string[]
  technologies: Array<{ name: string; usage: string }>
  challenges: string[]
  learnings: string[]
}

export function getProjects() {
  const entries = readDir<CmsProject>("content/projects")
  if (entries.length === 0) return staticProjects
  return entries.map(({ slug, title, shortDescription, fullDescription, category, categories, tags, date, company, featured, image, problem, solution, impact, technologies, challenges, learnings }) => ({
    id: slug,
    slug,
    title,
    shortDescription,
    fullDescription,
    category,
    categories,
    tags,
    date,
    company,
    featured,
    image: image || undefined,
    problem,
    solution,
    impact,
    technologies,
    challenges,
    learnings,
  }))
}

export function getProject(slug: string) {
  return getProjects().find((p) => p.slug === slug) ?? null
}

// ── blogPosts ─────────────────────────────────────────────────────────────────

export function getBlogPosts() {
  return staticBlogPosts
}

export function getBlogPost(slug: string) {
  return staticBlogPosts.find((p) => p.slug === slug) ?? null
}

// ── aggregate ─────────────────────────────────────────────────────────────────

export function getAllPortfolioData() {
  return {
    personalInfo: getPersonalInfo(),
    socialLinks: getSocialLinks(),
    workExperience: getWorkExperience(),
    education: getEducation(),
    skills: getSkills(),
    timeline: getTimeline(),
    achievements: getAchievements(),
    interests: getInterests(),
  }
}
