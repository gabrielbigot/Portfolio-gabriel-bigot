// Textes des pages (titres, libellés, boutons…) : content/site/strings.json → { espace: { clé: texte } }.
// Serveur : `const t = await getT("page.about")` puis `t("cle")`. Client : `const t = useT("component.PortfolioClient")`.
import { getContent } from "@/lib/site-content"
import { makeT, type Dict } from "@/lib/strings-core"

export type { Dict }

export async function getT(ns: string) {
  const dict = (await getContent("strings")) as Dict
  return makeT(dict, ns)
}
/** Espaces « component.* » : fournis au contexte client par le layout racine. */
export async function getComponentStrings(): Promise<Dict> {
  const dict = (await getContent("strings")) as Dict
  return Object.fromEntries(Object.entries(dict).filter(([k]) => k.startsWith("component.")))
}
