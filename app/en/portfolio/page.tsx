import PortfolioClient from "@/components/PortfolioClient"
import { getPortfolioPageData } from "@/lib/portfolio-i18n"

export const metadata = {
  title: "Gabriel Bigot | AI Automation Developer",
  description: "English portfolio of Gabriel Bigot, focused on AI automation, full-stack tools, and business process transformation.",
}

export default function EnglishPortfolioPage() {
  const { personalInfo, socialLinks, workExperience, skills, projects } = getPortfolioPageData("en")

  return (
    <PortfolioClient
      personalInfo={personalInfo}
      socialLinks={socialLinks}
      workExperience={workExperience}
      skills={skills}
      projects={projects as any}
      locale="en"
    />
  )
}
