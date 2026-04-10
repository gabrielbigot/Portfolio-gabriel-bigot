export interface ImageDetails {
  src: string
  alt: string
  title?: string
  description?: string
  tags?: string[]
  link?: string
}

// Ajoutez les détails pour chaque image ici
// Pour l'instant, je vais créer quelques exemples
// Vous pourrez compléter avec vos vraies données
export const imageDetails: Record<string, ImageDetails> = {
  "/portfolio/37362834_2020050544991067_2388667480672305152_n.jpg": {
    src: "/portfolio/37362834_2020050544991067_2388667480672305152_n.jpg",
    alt: "Hockey sur gazon",
    title: "Championnat de hockey",
    description: "Moment marquant lors d'un match de hockey sur gazon. Une passion qui m'a forgé et enseigné la discipline, le travail d'équipe et la persévérance.",
    tags: ["Sport", "Hockey", "Équipe"],
  },
  "/portfolio/460968232_3917956541867115_3586079804302855380_n.jpg": {
    src: "/portfolio/460968232_3917956541867115_3586079804302855380_n.jpg",
    alt: "Projet récent",
    title: "Projet récent",
    description: "Description de ce projet...",
    tags: ["Développement", "IA"],
  },
  // Ajoutez d'autres images ici...
  // Pour les images sans détails spécifiques, on utilisera des valeurs par défaut
}

// Fonction pour obtenir les détails d'une image
// Retourne des valeurs par défaut si l'image n'est pas dans le dictionnaire
export function getImageDetails(src: string): ImageDetails {
  const details = imageDetails[src]

  if (details) {
    return details
  }

  // Valeurs par défaut pour les images sans détails spécifiques
  return {
    src,
    alt: "Image du portfolio",
    title: "Projet portfolio",
    description: "Cliquez pour voir plus de détails sur ce projet.",
    tags: ["Portfolio"],
  }
}
