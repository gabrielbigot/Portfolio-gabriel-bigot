/**
 * Newsletters / Actualités IA
 *
 * Pour ajouter une nouvelle édition chaque semaine :
 * 1. Copier tribune-YYYY-MM-DD.html dans /public/newsletters/
 * 2. Copier tribune-YYYY-MM-DD.pdf  dans /public/newsletters/  (optionnel)
 * 3. Ajouter une entrée en tête de tableau ci-dessous
 */

export type Newsletter = {
  /** Correspond au nom de fichier sans extension, ex: "tribune-2026-03-10" */
  slug: string
  /** Date de publication ISO, ex: "2026-03-10" */
  date: string
  /** Titre court affiché sur la carte */
  title: string
  /** Résumé des sujets couverts dans cette édition */
  description: string
  /** true si le PDF est disponible dans /public/newsletters/<slug>.pdf */
  hasPdf?: boolean
}

export const newsletters: Newsletter[] = [
  {
    slug: "tribune-2026-03-10",
    date: "2026-03-10",
    title: "Tribune IA — 10 mars 2026",
    description: "Open source, modèles de raisonnement, agents autonomes et régulation : le tour d'horizon de la semaine.",
    hasPdf: true,
  },
  // Ajoutez les prochaines éditions ici ↑
]

export function getNewsletter(slug: string): Newsletter | undefined {
  return newsletters.find((n) => n.slug === slug)
}

export function formatNewsletterDate(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  } catch {
    return isoDate
  }
}
