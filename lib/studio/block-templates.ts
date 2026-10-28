// Types de sections qu'on peut ajouter depuis l'éditeur (rendu : components/blocks/Block.tsx).
export type BlockType = { type: string; label: string; hint: string; make: (id: string) => Record<string, unknown> }
export const BLOCK_TYPES: BlockType[] = [
  { type: "heading", label: "Titre de section", hint: "Petit titre, grand titre, sous-titre", make: id => ({ id, type: "heading", eyebrow: "SECTION", title: "Nouveau titre", subtitle: "Un sous-titre qui présente la section." }) },
  { type: "text", label: "Texte", hint: "Titre et paragraphes (**gras**, [lien](adresse))", make: id => ({ id, type: "text", title: "Titre du texte", body: "Écrivez votre texte ici.\n\nUn deuxième paragraphe, avec du **gras** et un [lien](https://example.com)." }) },
  { type: "imageText", label: "Image + texte", hint: "Une image à côté d'un texte", make: id => ({ id, type: "imageText", image: "", alt: "Description de l'image", title: "Titre", body: "Texte à côté de l'image.", side: "right" }) },
  { type: "cards", label: "Cartes", hint: "Grille de cartes (titre, texte, lien)", make: id => ({ id, type: "cards", title: "Titre de la grille", columns: "3", items: [{ title: "Première carte", text: "Description courte.", link: "", image: "", alt: "" }, { title: "Deuxième carte", text: "Description courte.", link: "", image: "", alt: "" }, { title: "Troisième carte", text: "Description courte.", link: "", image: "", alt: "" }] }) },
  { type: "gallery", label: "Galerie d'images", hint: "Images avec légendes", make: id => ({ id, type: "gallery", title: "Galerie", images: [{ image: "", alt: "Image 1", caption: "Légende de l'image" }, { image: "", alt: "Image 2", caption: "Légende de l'image" }, { image: "", alt: "Image 3", caption: "Légende de l'image" }] }) },
  { type: "quote", label: "Citation", hint: "Une phrase mise en avant", make: id => ({ id, type: "quote", text: "Une citation qui compte.", author: "Auteur" }) },
  { type: "cta", label: "Appel à l'action", hint: "Texte et bouton", make: id => ({ id, type: "cta", title: "Travaillons ensemble", text: "Une phrase pour inviter à agir.", label: "Me contacter", link: "mailto:" }) },
  { type: "list", label: "Liste", hint: "Titre et puces", make: id => ({ id, type: "list", title: "Titre de la liste", items: ["Premier point", "Deuxième point", "Troisième point"] }) },
  { type: "divider", label: "Séparateur", hint: "Un trait horizontal", make: id => ({ id, type: "divider" }) },
]
export const newId = () => "cb-" + Math.random().toString(36).slice(2, 8)
export const slugify = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "page"
