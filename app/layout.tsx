import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { metadata as siteMetadata } from "@/lib/data"

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
})

export const metadata: Metadata = {
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
    siteName: "Gabriel Bigot Portfolio",
    images: [
      {
        url: siteMetadata.ogImage,
        width: 1200,
        height: 630,
        alt: "Gabriel Bigot - Développeur d'Automatisations IA",
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${geist.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
