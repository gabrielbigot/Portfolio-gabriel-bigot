"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import ContactForm from "@/components/contact-form"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  date: string
  readingTime: string
  category: string
  published: boolean
}

interface Project {
  id: string
  title: string
  slug: string
  shortDescription: string
  category: string
  tags: string[]
  featured: boolean
}

interface PersonalInfo {
  name: string
  firstName: string
  lastName: string
  title: string
  tagline: string
  location: string
  email: string
  phone: string
  availability: string
  currentRole: {
    position: string
    company: string
    location: string
    startDate: string
    current: boolean
  }
}

interface WorkExperience {
  position: string
  company: string
  location: string
  startDate: string
  endDate?: string
  current: boolean
  description: string
  achievements: string[]
  technologies: string[]
}

interface SocialLink {
  name: string
  url: string
  icon: string
}

interface Skills {
  technical: Array<{
    category: string
    skills: Array<{
      name: string
      level: number
      description: string
    }>
  }>
  soft: Array<{
    name: string
    description: string
  }>
  languages: Array<{
    name: string
    level: string
  }>
}

interface PortfolioClientProps {
  personalInfo: PersonalInfo
  socialLinks: SocialLink[]
  workExperience: WorkExperience[]
  skills: Skills
  blogPosts: BlogPost[]
  projects: Project[]
}

export default function PortfolioClient({
  personalInfo,
  socialLinks,
  workExperience,
  skills,
  blogPosts,
  projects,
}: PortfolioClientProps) {
  const [isDark, setIsDark] = useState(true)
  const [activeSection, setActiveSection] = useState("")
  const sectionsRef = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
  }, [isDark])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up")
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.3, rootMargin: "0px 0px -20% 0px" },
    )

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section)
    })

    return () => observer.disconnect()
  }, [])

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <nav className="fixed left-8 top-1/2 -translate-y-1/2 z-10 hidden lg:block">
        <div className="flex flex-col gap-4">
          {["intro", "work", "skills", "thoughts", "connect"].map((section) => (
            <button
              key={section}
              onClick={() => document.getElementById(section)?.scrollIntoView({ behavior: "smooth" })}
              className={`w-2 h-8 rounded-full transition-all duration-500 ${
                activeSection === section ? "bg-foreground" : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
              aria-label={`Navigate to ${section}`}
            />
          ))}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16">
        <header
          id="intro"
          ref={(el) => (sectionsRef.current[0] = el)}
          className="min-h-screen flex items-center"
        >
          <div className="grid lg:grid-cols-5 gap-12 sm:gap-16 w-full">
            <div className="lg:col-span-3 space-y-6 sm:space-y-8">
              <div className="space-y-3 sm:space-y-2">
                <div className="text-sm text-muted-foreground font-mono tracking-wider">PORTFOLIO / 2025</div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight">
                  {personalInfo.firstName}
                  <br />
                  <span className="text-muted-foreground">{personalInfo.lastName}</span>
                </h1>
              </div>

              <div className="space-y-6 max-w-md">
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                  {personalInfo.tagline}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    {personalInfo.availability}
                  </div>
                  <div>{personalInfo.location}</div>
                </div>

                <div className="flex flex-wrap gap-3 pt-4">
                  <Link
                    href="/projects"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-all duration-300 font-medium"
                  >
                    <span>Voir mes projets</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300"
                  >
                    <span>Mon histoire</span>
                  </Link>
                  <Link
                    href="/#connect"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300"
                  >
                    <span>Contact</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col justify-end space-y-6 sm:space-y-8 mt-8 lg:mt-0">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground font-mono">ACTUELLEMENT</div>
                <div className="space-y-2">
                  <div className="text-foreground">{personalInfo.currentRole.position}</div>
                  <div className="text-muted-foreground">@ {personalInfo.currentRole.company}</div>
                  <div className="text-xs text-muted-foreground">{personalInfo.currentRole.startDate} — Présent</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-sm text-muted-foreground font-mono">EXPERTISE</div>
                <div className="flex flex-wrap gap-2">
                  {["Python", "IA & LLM", "Flask", "Excel/VBA", "Automatisation"].map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 text-xs border border-border rounded-full hover:border-muted-foreground/50 transition-colors duration-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <section
          id="work"
          ref={(el) => (sectionsRef.current[1] = el)}
          className="min-h-screen py-20 sm:py-32"
        >
          <div className="space-y-12 sm:space-y-16">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <h2 className="text-3xl sm:text-4xl font-light">Expériences & Projets</h2>
              <Link
                href="/projects"
                className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 font-mono"
              >
                <span>VOIR TOUS LES PROJETS</span>
                <svg
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div className="relative space-y-0">
              {/* Timeline vertical line */}
              <div className="absolute left-[7px] top-4 bottom-4 w-px bg-border hidden sm:block"></div>

              {workExperience.map((job, index) => (
                <div
                  key={index}
                  className="group relative pb-12 sm:pb-16 last:pb-0"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-6 w-4 h-4 rounded-full border-2 border-border bg-background group-hover:border-foreground group-hover:bg-foreground transition-all duration-500 hidden sm:block z-10"></div>

                  {/* Content */}
                  <div className="sm:pl-12 grid lg:grid-cols-12 gap-4 sm:gap-8">
                    <div className="lg:col-span-2">
                      <div className="text-xl sm:text-2xl font-light text-muted-foreground group-hover:text-foreground transition-colors duration-500">
                        {job.startDate.split(" ")[0]}
                      </div>
                      <div className="text-xs text-muted-foreground/70 mt-1 sm:hidden">
                        {job.startDate} - {job.endDate}
                      </div>
                    </div>

                    <div className="lg:col-span-6 space-y-3">
                      <div>
                        <h3 className="text-lg sm:text-xl font-medium group-hover:text-foreground transition-colors duration-300">
                          {job.position}
                        </h3>
                        <div className="text-muted-foreground">{job.company}</div>
                        <div className="text-xs text-muted-foreground/70 mt-1 hidden sm:block">
                          {job.startDate} - {job.endDate}
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed max-w-lg">{job.description}</p>

                      {job.achievements.length > 0 && (
                        <ul className="space-y-2 mt-4">
                          {job.achievements.slice(0, 3).map((achievement, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex gap-2">
                              <span className="text-foreground/50">•</span>
                              <span>{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="lg:col-span-4 flex flex-wrap gap-2 lg:justify-end mt-2 lg:mt-0">
                      {job.technologies.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 text-xs text-muted-foreground rounded group-hover:text-foreground/80 transition-colors duration-500"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Featured Projects Showcase */}
            <div className="pt-12 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl sm:text-2xl font-light">Projets d'automatisation phares</h3>
                <Link
                  href="/projects"
                  className="group text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
                >
                  <span>Voir tout →</span>
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {projects.slice(0, 2).map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.slug}`}
                      className="group p-6 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs px-2 py-1 bg-foreground/5 border border-border rounded">
                            {project.category}
                          </span>
                          <span className="text-lg">⭐</span>
                        </div>

                        <h4 className="text-lg font-medium group-hover:text-muted-foreground transition-colors duration-300">
                          {project.title}
                        </h4>

                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                          {project.shortDescription}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {project.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-1 border border-border rounded text-muted-foreground/70"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300 pt-2">
                          <span>Découvrir le projet</span>
                          <svg
                            className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="skills"
          ref={(el) => (sectionsRef.current[2] = el)}
          className="py-20 sm:py-32"
        >
          <div className="space-y-12 sm:space-y-16">
            <h2 className="text-3xl sm:text-4xl font-light">Compétences Techniques</h2>

            <div className="grid gap-8 sm:gap-12 lg:grid-cols-2">
              {skills.technical.map((category, index) => (
                <div key={index} className="space-y-6">
                  <h3 className="text-sm text-muted-foreground font-mono tracking-wider">{category.category.toUpperCase()}</h3>

                  <div className="space-y-4">
                    {category.skills.map((skill, skillIndex) => (
                      <div key={skillIndex} className="space-y-2">
                        <div className="flex justify-between items-baseline">
                          <span className="text-foreground">{skill.name}</span>
                          <span className="text-xs text-muted-foreground">{skill.level}%</span>
                        </div>
                        <div className="h-1.5 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-foreground rounded-full transition-all duration-1000"
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">{skill.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t border-border">
              <div className="text-sm text-muted-foreground font-mono mb-4">SOFT SKILLS</div>
              <div className="flex flex-wrap gap-3">
                {skills.soft.map((skill, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 border border-border rounded-lg hover:border-muted-foreground/50 transition-colors duration-300"
                  >
                    <div className="text-sm font-medium">{skill.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="thoughts"
          ref={(el) => (sectionsRef.current[3] = el)}
          className="py-20 sm:py-32"
        >
          <div className="space-y-12 sm:space-y-16">
            <div className="flex items-end justify-between">
              <h2 className="text-3xl sm:text-4xl font-light">Réflexions & Articles</h2>
              <Link
                href="/blog"
                className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 font-mono"
              >
                <span>VOIR TOUS LES ARTICLES</span>
                <svg
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
              {blogPosts.slice(0, 4).map((post, index) => (
                <Link
                  key={index}
                  href={post.published ? `/blog/${post.slug}` : "#"}
                  className={`group relative p-6 sm:p-8 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-500 hover:shadow-lg overflow-hidden ${
                    post.published ? "cursor-pointer" : "cursor-not-allowed opacity-75"
                  }`}
                >
                  {!post.published && (
                    <div className="absolute top-4 right-4">
                      <span className="px-2 py-1 text-xs bg-amber-500/10 text-amber-500 rounded border border-amber-500/20">
                        À venir
                      </span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                      <span>{post.date}</span>
                      <span>{post.readingTime}</span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-medium group-hover:text-muted-foreground transition-colors duration-300">
                      {post.title}
                    </h3>

                    <p className="text-muted-foreground leading-relaxed">{post.excerpt}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-1 bg-background border border-border rounded">
                        {post.category}
                      </span>

                      {post.published && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                          <span>Lire</span>
                          <svg
                            className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="connect" ref={(el) => (sectionsRef.current[4] = el)} className="py-20 sm:py-32">
          <div className="space-y-16 sm:space-y-20">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light">Contactez-moi</h2>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                Toujours intéressé par de nouveaux projets d'automatisation, des stages en IA, et des discussions sur la transformation digitale des PME.
              </p>
            </div>

            <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
              {/* Left column - Contact Form */}
              <div className="lg:col-span-3">
                <div className="space-y-6">
                  <div className="text-sm text-muted-foreground font-mono">FORMULAIRE DE CONTACT</div>
                  <ContactForm />
                </div>
              </div>

              {/* Right column - Contact Info */}
              <div className="lg:col-span-2 space-y-8">
                <div className="space-y-6">
                  <div className="text-sm text-muted-foreground font-mono">CONTACT DIRECT</div>

                  <div className="space-y-4">
                    <Link
                      href={`mailto:${personalInfo.email}`}
                      className="group flex items-start gap-3 text-foreground hover:text-muted-foreground transition-colors duration-300"
                    >
                      <svg
                        className="w-5 h-5 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <div>
                        <div className="text-sm font-medium">Email</div>
                        <div className="text-sm break-all">{personalInfo.email}</div>
                      </div>
                    </Link>

                    <Link
                      href={`tel:${personalInfo.phone}`}
                      className="group flex items-start gap-3 text-foreground hover:text-muted-foreground transition-colors duration-300"
                    >
                      <svg
                        className="w-5 h-5 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <div>
                        <div className="text-sm font-medium">Téléphone</div>
                        <div className="text-sm">{personalInfo.phone}</div>
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="space-y-4 pt-8 border-t border-border">
                  <div className="text-sm text-muted-foreground font-mono">LIENS SOCIAUX</div>

                  <div className="space-y-2">
                    {socialLinks.map((social) => (
                      <Link
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between p-3 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300"
                      >
                        <span className="text-sm">{social.name}</span>
                        <svg
                          className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="p-6 border border-border rounded-lg bg-foreground/[0.02]">
                  <div className="space-y-3">
                    <div className="text-sm font-mono text-muted-foreground">OBJECTIF 2026</div>
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      Recherche activement un stage de 6 semaines (jan-fév 2026) en intégration IA/automatisation en PME ou développement produit IA.
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    href="/cv-gabriel-bigot.pdf"
                    download
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300 hover:shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span>Télécharger mon CV</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="py-12 sm:py-16 border-t border-border">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-8">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">© 2025 {personalInfo.name}. Tous droits réservés.</div>
              <div className="text-xs text-muted-foreground">Développeur d'Automatisations IA • ESDHEM Lille</div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="group p-3 rounded-lg border border-border hover:border-muted-foreground/50 transition-all duration-300"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <svg
                    className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>

              <button className="group p-3 rounded-lg border border-border hover:border-muted-foreground/50 transition-all duration-300">
                <svg
                  className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </footer>
      </main>

      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none"></div>
    </div>
  )
}
