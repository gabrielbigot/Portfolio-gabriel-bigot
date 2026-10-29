import { stripDeep } from "@/lib/studio/stega"
import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { Newsreader } from "next/font/google"
import "./globals.css"
import { getSiteMetadata } from "@/lib/portfolio-data"
import { getComponentStrings } from "@/lib/strings"
import { getContent } from "@/lib/site-content"
import { themeCss } from "@/lib/site-theme"
import LayoutRules from "@/components/blocks/LayoutRules"
import { StringsProvider } from "@/components/strings-provider"
import { studioEnabled } from "@/lib/studio/guard"
import InlineEditorLoader from "@/components/studio/InlineEditorLoader"
import ThemeToggle from "@/components/ThemeToggle"

const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader", display: "swap", style: ["normal", "italic"] })

export async function generateMetadata(): Promise<Metadata> {
  const siteMetadata = await getSiteMetadata()
  return stripDeep({
  title: siteMetadata.siteTitle,
  description: siteMetadata.siteDescription,
  keywords: siteMetadata.siteKeywords,
  authors: [{ name: "Gabriel Bigot" }],
  creator: "Gabriel Bigot",
  metadataBase: new URL(siteMetadata.siteUrl),

  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteMetadata.siteUrl,
    title: siteMetadata.siteTitle,
    description: siteMetadata.siteDescription,
    siteName: siteMetadata.siteName,
    images: [
      {
        url: siteMetadata.ogImage,
        width: 1200,
        height: 630,
        alt: siteMetadata.ogImageAlt,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: siteMetadata.siteTitle,
    description: siteMetadata.siteDescription,
    creator: siteMetadata.twitterHandle,
    images: [siteMetadata.ogImage],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  verification: {
    // Google Search Console verification - À ajouter plus tard
    // google: "your-google-verification-code",
  },
  })
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${GeistSans.variable} ${newsreader.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: "try{var s=localStorage,t=s.getItem('theme')||s.getItem('vra-theme');if(t&&!s.getItem('theme'))s.setItem('theme',t);if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}" }} /><style id="site-theme" dangerouslySetInnerHTML={{ __html: themeCss((await getContent("theme")) as any) }} /></head>
      <body className="font-sans antialiased"><StringsProvider dict={await getComponentStrings()}><LayoutRules all={((await getContent("layout")) as any).rules} />{children}</StringsProvider><ThemeToggle />{studioEnabled() && <InlineEditorLoader />}</body>
    </html>
  )
}
