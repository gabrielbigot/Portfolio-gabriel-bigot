"use client"

import { useT } from "@/components/strings-provider"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { MouseEvent } from "react"
import { useEffect, useRef, useState } from "react"
import ContactForm from "@/components/contact-form"
import AsciiField from "@/components/AsciiField"

interface Project {
  id: string
  title: string
  slug: string
  shortDescription: string
  category: string
  categories?: string[]
  tags: string[]
  featured: boolean
  image?: string
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
  objectiveTitle?: string
  objectiveText?: string
  cvUrl?: string
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
  projects: Project[]
  locale?: "fr" | "en"
  /** textes d'interface (content/site/ui-portfolio.json) */
  ui: Record<"fr" | "en", any>
  /** sections ajoutées (content/site/pages.json) */
  extra?: React.ReactNode
}

const extractYear = (dateString: string): string => {
  // Handle formats like "Juillet 2025", "2025", "Septembre 2025", etc.
  const yearMatch = dateString.match(/\d{4}/)
  return yearMatch ? yearMatch[0] : dateString
}

export default function PortfolioClient({
  personalInfo,
  socialLinks,
  workExperience,
  skills,
  projects,
  locale = "fr",
  ui,
  extra,
}: PortfolioClientProps) {
  const t = useT("component.PortfolioClient")
  const router = useRouter()
  const copy = ui[locale]
  const [isDark, setIsDark] = useState(true)
  const [activeSection, setActiveSection] = useState("")
  const [isSwitchingLanguage, setIsSwitchingLanguage] = useState(false)
  const [streamedLanguageText, setStreamedLanguageText] = useState("")
  const sectionsRef = useRef<(HTMLElement | null)[]>([])
  const routePrefix = locale === "en" ? "/en" : ""

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

  useEffect(() => {
    if (!isSwitchingLanguage) return

    let index = 0
    const message = copy.languageTransition
    setStreamedLanguageText("")

    const streamInterval = window.setInterval(() => {
      index += 1
      setStreamedLanguageText(message.slice(0, index))

      if (index >= message.length) {
        window.clearInterval(streamInterval)
        window.setTimeout(() => {
          router.push(copy.languageHref)
        }, 280)
      }
    }, 24)

    return () => window.clearInterval(streamInterval)
  }, [copy.languageHref, copy.languageTransition, isSwitchingLanguage, router])

  const handleLanguageSwitch = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    if (isSwitchingLanguage) return
    setIsSwitchingLanguage(true)
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <Link
        href={copy.languageHref}
        onClick={handleLanguageSwitch}
        className="fixed right-6 top-6 z-50 inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-foreground/[0.06] backdrop-blur-xl backdrop-saturate-150 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] px-3 py-1.5 text-xs font-mono text-muted-foreground transition-colors duration-300 hover:border-foreground/30 hover:text-foreground"
        aria-label={copy.languageLabel}
      >
        <span>{locale.toUpperCase()}</span>
        <span className="text-muted-foreground/40">/</span>
        <span>{copy.languageCode}</span>
      </Link>

      {isSwitchingLanguage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-md">
          <div className="w-[min(92vw,32rem)] rounded-lg border border-border bg-background/90 p-5 shadow-2xl">
            <div className="mb-3 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span>{locale === "fr" ? t("ai-translation") : t("traduction-ia")}</span>
            </div>
            <div className="min-h-8 text-lg text-foreground">
              {streamedLanguageText}
              <span className="ml-1 inline-block h-5 w-2 translate-y-0.5 bg-foreground animate-pulse" />
            </div>
          </div>
        </div>
      )}

      <nav className="fixed left-8 top-1/2 -translate-y-1/2 z-10 hidden lg:block">
        <div className="flex flex-col gap-4 rounded-full border border-foreground/15 bg-foreground/[0.06] backdrop-blur-xl backdrop-saturate-150 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] px-2.5 py-4">
          {["intro", "essays", "work", "skills", "connect"].map((section) => (
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

      <AsciiField className="absolute inset-x-0 top-0 z-0 h-screen w-full opacity-[0.16] sm:opacity-[0.3]" />

      <main className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 lg:px-16">
        <header
          id="intro"
          ref={(el) => {
            sectionsRef.current[0] = el
          }}
          className="min-h-screen flex items-center"
        >
          <div className="w-full max-w-xl space-y-8 sm:space-y-10">
            <div className="space-y-3 sm:space-y-2">
              <div className="text-sm text-muted-foreground font-mono tracking-wider">{t("portfolio-2026")}</div>
              <h1 className="font-editorial text-5xl sm:text-6xl lg:text-7xl leading-[0.95]">
                {personalInfo.firstName}
                <br />
                <span className="text-muted-foreground">{personalInfo.lastName}</span>
              </h1>
            </div>

            <div className="space-y-5">
              <p className="font-editorial text-xl sm:text-2xl text-foreground/85 leading-snug">
                {personalInfo.tagline}
              </p>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {personalInfo.currentRole.position} @ {personalInfo.currentRole.company} · {personalInfo.currentRole.startDate} — {copy.present}
                <br />
                {copy.expertiseItems.join(" · ")}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                  {personalInfo.availability}
                </div>
                <div>{personalInfo.location}</div>
              </div>
            </div>

            <nav className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-base">
              {[
                { href: "/articles", label: copy.essaysCta },
                { href: `${routePrefix}/projects`, label: copy.projectsCta },
                { href: `${routePrefix}/about`, label: copy.aboutCta },
                { href: `${routePrefix}/uses`, label: copy.usesCta },
                { href: "#connect", label: copy.contactCta },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="underline decoration-border underline-offset-[6px] transition-colors duration-300 hover:decoration-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <section
          id="essays"
          ref={(el) => {
            sectionsRef.current[2] = el
          }}
          className="py-20 sm:py-32"
        >
          <div className="border-y border-border py-12 sm:py-16">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-end">
              <div className="lg:col-span-5 space-y-5">
                <div className="text-xs font-mono tracking-[0.18em] text-accent uppercase">{t("01-journal")}</div>
                <h2 className="font-editorial text-4xl sm:text-5xl leading-[1.02]">{copy.essaysTitle}</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">{copy.essaysIntro}</p>
                <Link href="/articles" className="inline-flex items-center gap-2 border-b border-accent pb-1 text-sm text-foreground hover:text-accent transition-colors">
                  {copy.allEssays} <span aria-hidden="true">→</span>
                </Link>
              </div>
              <Link href="/articles" className="group lg:col-span-7 block lg:border-l lg:border-border lg:pl-12">
                <div className="text-xs font-mono tracking-[0.16em] text-muted-foreground uppercase mb-5">{copy.latestEssay} / 2025</div>
                <h3 className="font-editorial text-3xl sm:text-4xl leading-tight group-hover:text-accent transition-colors duration-300">{t("l-ia-ne-doit-pas-penser")}</h3>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">{t("comment-construire-des-outils-qui-augmentent")}</p>
                <div className="mt-8 flex items-center gap-3 text-sm text-foreground group-hover:text-accent transition-colors">
                  <span>{copy.readEssay}</span><span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <section
          id="work"
          ref={(el) => {
            sectionsRef.current[1] = el
          }}
          className="py-20 sm:py-32"
        >
          <div className="space-y-12 sm:space-y-16">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <h2 className="text-3xl sm:text-4xl font-light">{copy.workTitle}</h2>
              <Link
                href={`${routePrefix}/projects`}
                className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 font-mono"
              >
                <span>{copy.viewAllProjects}</span>
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

            <div className="divide-y divide-border border-y border-border">
              {workExperience.map((job, index) => (
                <div key={index} className="grid gap-2 py-6 sm:grid-cols-[5rem_1fr] sm:gap-8">
                  <div className="text-sm font-mono text-muted-foreground">{extractYear(job.startDate)}</div>
                  <div className="space-y-2">
                    <h3 className="font-editorial text-xl">
                      {job.position}
                      <span className="text-muted-foreground"> · {job.company}</span>
                    </h3>
                    <p className="max-w-xl leading-relaxed text-muted-foreground">{job.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA: dive deeper into work experience */}
            <div className="pt-4">
              <Link
                href={locale === "en" ? "/en/work" : "/work"}
                className="group inline-flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                <span className="text-base border-b border-dashed border-muted-foreground/40 group-hover:border-foreground transition-colors duration-300">
                  {copy.exploreWork}
                </span>
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

            {/* Featured Projects Showcase */}
            <div className="pt-12 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl sm:text-2xl font-light">{copy.featuredProjects}</h3>
                <Link
                  href={`${routePrefix}/projects`}
                  className="group text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
                >
                  <span>{copy.viewAll}</span>
                </Link>
              </div>

              <div className="divide-y divide-border border-y border-border">
                {projects.slice(0, 3).map((project) => (
                  <Link
                    key={project.id}
                    href={`${routePrefix}/projects/${project.slug}`}
                    className="group grid gap-2 py-6 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-8"
                  >
                    <div className="space-y-2">
                      <h4 className="font-editorial text-xl transition-colors duration-300 group-hover:text-muted-foreground">
                        {project.title}
                      </h4>
                      <p className="max-w-xl leading-relaxed text-muted-foreground">{project.shortDescription}</p>
                    </div>
                    <span aria-hidden="true" className="text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-foreground">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="skills"
          ref={(el) => {
            sectionsRef.current[3] = el
          }}
          className="py-20 sm:py-32"
        >
          <div className="space-y-12 sm:space-y-16">
            <h2 className="text-3xl sm:text-4xl font-light">{copy.skillsTitle}</h2>

            <div className="grid gap-10 lg:grid-cols-2">
              {skills.technical.map((category, index) => (
                <div key={index} className="space-y-4">
                  <h3 className="text-sm text-muted-foreground font-mono tracking-wider">{category.category.toUpperCase()}</h3>
                  <dl className="space-y-3">
                    {category.skills.map((skill, skillIndex) => (
                      <div key={skillIndex}>
                        <dt className="text-foreground">{skill.name}</dt>
                        <dd className="text-sm leading-relaxed text-muted-foreground">{skill.description}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>

            <p className="border-t border-border pt-8 text-muted-foreground">
              <span className="mr-3 text-sm font-mono">{copy.softSkills}</span>
              {skills.soft.map((skill) => skill.name).join(" · ")}
            </p>
          </div>
        </section>

        <section
          id="connect"
          ref={(el) => {
            sectionsRef.current[4] = el
          }}
          className="py-20 sm:py-32"
        >
          <div className="space-y-16 sm:space-y-20">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light">{copy.contactTitle}</h2>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                {copy.contactIntro}
              </p>
            </div>

            <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
              {/* Left column - Contact Form */}
              <div className="lg:col-span-3">
                <div className="space-y-6">
                  <div className="text-sm text-muted-foreground font-mono">{copy.contactForm}</div>
                  <ContactForm locale={locale} />
                </div>
              </div>

              {/* Right column - Contact Info */}
              <div className="lg:col-span-2 space-y-8">
                <div className="space-y-6">
                  <div className="text-sm text-muted-foreground font-mono">{copy.directContact}</div>

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
                        <div className="text-sm font-medium">{t("email")}</div>
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
                        <div className="text-sm font-medium">{copy.phone}</div>
                        <div className="text-sm">{personalInfo.phone}</div>
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="space-y-4 pt-8 border-t border-border">
                  <div className="text-sm text-muted-foreground font-mono">{copy.socialLinks}</div>

                  <div className="space-y-2">
                    {socialLinks.map((social) => (
                      <a
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
                      </a>
                    ))}
                  </div>
                </div>


                <div className="pt-4">
                  <Link
                    href={personalInfo.cvUrl || "/cv-gabriel-bigot.pdf"}
                    download={!personalInfo.cvUrl?.startsWith("http")}
                    target={personalInfo.cvUrl?.startsWith("http") ? "_blank" : undefined}
                    rel={personalInfo.cvUrl?.startsWith("http") ? t("noopener-noreferrer") : undefined}
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
                    <span>{copy.downloadCv}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="py-12 sm:py-16 border-t border-border">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-8">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">© 2025 {personalInfo.name}. {copy.footerRights}</div>
              <div className="text-xs text-muted-foreground">{copy.footerRole}</div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="group p-3 rounded-lg border border-border hover:border-muted-foreground/50 transition-all duration-300"
                aria-label={t("toggle-theme")}
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
        {extra}
      </main>

      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none"></div>
    </div>
  )
}
