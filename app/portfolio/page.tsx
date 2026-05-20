import PortfolioClient from "@/components/PortfolioClient"
import { getPortfolioPageData } from "@/lib/portfolio-i18n"

export default function PortfolioPage() {
  const { personalInfo, socialLinks, workExperience, skills, projects } = getPortfolioPageData("fr")

  return (
    <PortfolioClient
      personalInfo={personalInfo}
      socialLinks={socialLinks}
      workExperience={workExperience}
      skills={skills}
      projects={projects as any}
      locale="fr"
    />
  )
}
