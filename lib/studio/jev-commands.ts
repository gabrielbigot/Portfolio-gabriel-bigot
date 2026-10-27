import { looksLikeInstruction } from "@/lib/studio/jev-detect"
// Jev : consignes en français tapées dans un bloc (« mets le mot "philanthrope" en gras », « remplace A par B », « c'est quoi X ? »).
// Les mises en forme sont appliquées localement (instantané, sans IA) ; les questions de définition passent par Claude, sur confirmation.
export type Cmd =
  | { kind: "format"; style: "bold" | "italic" | "code"; target: string }
  | { kind: "link"; target: string; url: string }
  | { kind: "replace"; from: string; to: string }
  | { kind: "delete"; target: string }
  | { kind: "define"; term: string }
  | { kind: "convert"; to: "quote" | "callout" | "bullet" | "number" | "h3" | "lede" | "p" }      // met le bloc du dessus sous une autre forme
  | { kind: "unlist" }                                                                                  // liste du dessus → paragraphe
  | { kind: "wrapAll"; style: "bold" | "italic" }                                                       // tout le paragraphe du dessus
  | { kind: "unformat"; style: "bold" | "italic"; target: string }
  | { kind: "move"; dir: "up" | "down" }
  | { kind: "merge" }
  | { kind: "splitSection" }
  | { kind: "delSection"; title: string }
  | { kind: "delLast" }
  | { kind: "aiEdit"; op: "shorten" | "simplify" | "direct" | "translate" | "fix" | "rewrite"; lang?: string; sel?: boolean }
  | { kind: "continue" }
  | { kind: "chart"; topic?: string; gallery?: boolean }
  | { kind: "togallery" }                                  // remplace le graphique dessiné par Claude par un graphique de la galerie
  | { kind: "figedit"; instruction: string }               // modifie le graphique dessiné par Claude                                     // graphique à partir de la sélection / du paragraphe du dessus
  | { kind: "explain" }                                   // explique la sélection épinglée
  | { kind: "cite" }                                      // source pour la sélection épinglée
  | { kind: "insert"; type: "p" | "ul" | "quote" | "callout"; text: string }
  | { kind: "titles" }
  | { kind: "summary" }
  | { kind: "conclusion" }
  | { kind: "review"; scope: "section" | "article" }
  | { kind: "sources"; topic: string }
  | { kind: "figtype"; type: string }
const Q = `[«"“'‘]?`, QE = `[»"”'’]?`
const STYLE: Record<string, "bold" | "italic" | "code"> = { gras: "bold", italique: "italic", "italique ": "italic", code: "code", "évidence": "bold" }
const clean = (s: string) => s.replace(/[«»"“”]/g, "").replace(/\s+/g, " ").trim().replace(/[.!]+$/, "")

/** politesse et infinitif → impératif : « peux-tu faire un graphique… » devient « fais un graphique… » */
const INF: Record<string, string> = { faire: "fais", "créer": "crée", creer: "crée", "générer": "génère", generer: "génère", construire: "construis", dessiner: "dessine", tracer: "trace", montrer: "montre", afficher: "affiche", visualiser: "visualise", mettre: "mets", ajouter: "ajoute", supprimer: "supprime", remplacer: "remplace", raccourcir: "raccourcis", simplifier: "simplifie", reformuler: "reformule", corriger: "corrige", traduire: "traduis", expliquer: "explique", continuer: "continue", "résumer": "résume", relire: "relis", "déplacer": "déplace", transformer: "transforme", fusionner: "fusionne", couper: "coupe", "trouver": "trouve", chercher: "cherche", prendre: "prends", utiliser: "utilise" }
export function normalizeAsk(raw: string): string {
  let t = raw.replace(/[\u00a0\u202f]/g, " ").trim().replace(/[\s,;]+(?:s['’]il (?:te|vous) pla[iî]t|stp|svp|merci|please)\s*[.!?]*$/i, "").replace(/[?!]+$/, "")
  t = t.replace(/^(?:jev[,:]?\s*)/i, "").replace(/^(?:est-ce que\s+)?(?:tu\s+)?(?:peux|pourrais|pouvez|pourriez|veux|voudrais|voulez)[- ]?(?:tu|vous)?\s+(?:me\s+|nous\s+)?/i, "").replace(/^(?:j['’]aimerais(?: bien)? que (?:tu|vous)\s+|je voudrais que (?:tu|vous)\s+|il faudrait\s+)/i, "")
  const m = /^([\p{L}]+)(\s.*)?$/u.exec(t); if (m && INF[m[1].toLowerCase()]) t = INF[m[1].toLowerCase()] + (m[2] || "")
  return t.trim()
}
export const SEL = "@sel" // la sélection épinglée (« ça », « ce passage »…)
const PRON = /^(?:ça|ca|cela|ceci|ce passage|cette phrase|ce texte|cette expression|la sélection|le passage|ce mot|ce terme|ces mots)$/i
export function parseCommand(raw: string): Cmd | null {
  const t0 = normalizeAsk(raw.replace(/\{\{[KDV][\d-]+\}\}/g, "")).replace(/[.!]+$/, "")
  let mm: RegExpExecArray | null
  if ((mm = /^(?:mets?|met|passe|mettre)(?:[- ](?:le|la|ça|ca|cela|ceci))?\s+en\s+(gras|italique|code)$/i.exec(t0))) return { kind: "format", style: mm[1].toLowerCase() === "gras" ? "bold" : mm[1].toLowerCase() === "italique" ? "italic" : "code", target: SEL }
  if ((mm = /^(?:mets?|ajoute|fais)\s+(?:un\s+)?lien\s+(?:vers|sur|avec)\s+(https?:\/\/\S+)$/i.exec(t0))) return { kind: "link", target: SEL, url: mm[1] }
  if ((mm = /^(?:mets?|ajoute|fais)\s+(?:un\s+)?lien\s+(?:dessus|dessous|là)\s+(?:vers|avec)\s+(https?:\/\/\S+)$/i.exec(t0))) return { kind: "link", target: SEL, url: mm[1] }
  if (/^(?:prends?|prend|utilise|utiliser|mets?|passe|remplace(?:-le)?|refais(?:-le)?)\s*(?:le|ce|ça|ca|cela)?\s*(?:graphique|graph|figure)?\s*(?:par|en|avec|depuis|dans|de|d['’])?\s*(?:un\s+(?:graphique\s+)?)?(?:de |dans |avec |depuis |dans )?(?:ma|la|le|mon)?\s*(?:galerie|biblioth[èe]que)(?:\s+de graphiques)?$/i.test(t0)) return { kind: "togallery" }
  if ((mm = /^(?:fais|fait|fais-moi|cr[ée]e|g[ée]n[èe]re|construis|dessine|trace|montre|affiche|visualise|mets)\s+(?:moi\s+)?(?:un|une|le|la|ce|cette|des)?\s*(?:graphique|graphe|diagramme|courbe|histogramme|visualisation|camembert)(?:\s+(?:de|du|des|pour|avec|sur|à propos de|concernant|à partir de)\s+(.{2,100}))?$/i.exec(t0))) {
    const gal = /(?:galerie|biblioth[èe]que)/i.test(t0), arg = (mm[1] || "").replace(/\s*(?:dans|avec|depuis|de)\s+(?:ma|la|le|mon)\s*(?:galerie|biblioth[èe]que)\s*$/i, "").trim(); if (!arg || /^(?:ça|ca|cela|ceci|ce passage|cette phrase|ces chiffres|ces donn[ée]es|la s[ée]lection)$/i.test(arg)) return gal ? { kind: "chart", gallery: true } : { kind: "chart" }
    const topic = arg.replace(/^(?:tout\s+)?ce qui (?:concerne|touche|parle de|porte sur)\s+/i, "").replace(/^(?:les?|la|l['’]|du|des|de la|d['’])\s*/i, "").trim()
    return topic.length >= 2 ? { kind: "chart", topic, ...(gal ? { gallery: true } : {}) } : gal ? { kind: "chart", gallery: true } : { kind: "chart" } }
  if (/^(?:explique|expliquer|explique-moi|développe)\s+(?:ça|ca|ceci|cela|ce passage|cette phrase|ce texte|la sélection)$/i.test(t0)) return { kind: "explain" }
  if (/^(?:c['’]est quoi|que veut dire|que signifie|qu['’]est[- ]ce que (?:c['’]est|ça veut dire))\s+(?:ça|ca|ceci|cela)\s*\??$/i.test(t0)) return { kind: "define", term: SEL }
  if (/^(?:cite|trouve|cherche|ajoute|mets|donne(?:-moi)?)\s+(?:une\s+)?source\s+(?:pour|sur|à|de)\s+(?:ça|ca|ceci|cela|ce passage|cette phrase|cette affirmation)$/i.test(t0)) return { kind: "cite" }
  if ((mm = /^(raccourcis|simplifie|reformule|corrige|traduis)\s+(?:ça|ca|ceci|cela|ce passage|cette phrase|la sélection)(?:\s+(?:en|vers)\s+(\p{L}+))?$/iu.exec(t0))) { const v = mm[1].toLowerCase(); return { kind: "aiEdit", sel: true, op: v === "raccourcis" ? "shorten" : v === "simplifie" ? "simplify" : v === "corrige" ? "fix" : v === "traduis" ? "translate" : "rewrite", ...(mm[2] ? { lang: mm[2] } : {}) } }
  const c = parse(normalizeAsk(raw)); if (!c) return null
  if ((c.kind === "format" || c.kind === "link" || c.kind === "delete" || c.kind === "unformat") && PRON.test(c.target)) c.target = SEL
  if (c.kind === "replace" && PRON.test(c.from)) c.from = SEL
  const len = c.kind === "replace" ? c.from.length : c.kind === "define" ? c.term.length : c.kind === "format" || c.kind === "link" || c.kind === "delete" || c.kind === "unformat" ? c.target.length : c.kind === "delSection" ? c.title.length : c.kind === "sources" ? c.topic.length : 9
  return len >= 2 ? c : null
}
const CONVERT: Record<string, Extract<Cmd, { kind: "convert" }>["to"]> = { citation: "quote", "encadré": "callout", encadre: "callout", liste: "bullet", "liste à puces": "bullet", "liste numérotée": "number", "sous-titre": "h3", "chapô": "lede", chapo: "lede", texte: "p", paragraphe: "p" }
const FIG: Record<string, string> = { courbe: "lines", ligne: "lines", lignes: "lines", barres: "bars", histogramme: "bars", points: "dotplot", "nuage de points": "dotplot", lollipop: "lollipop", camembert: "donut", anneau: "donut", donut: "donut", cascade: "waterfall", "haltères": "dumbbell", halteres: "dumbbell", waffle: "waffle", treemap: "treemap", podium: "podium" }
function parse(raw: string): Cmd | null {
  const t = raw.replace(/[  ]/g, " ").replace(/\{\{[KDV][\d-]+\}\}/g, "").trim().replace(/[.!]+$/, "")
  if (t.length < 6 || t.length > 220) return null
  let m: RegExpExecArray | null
  if ((m = /^(?:mets?|passe|transforme|convertis|change)\s+(?:ce|le|cet)\s+(?:paragraphe|texte|bloc|passage)\s+en\s+(citation|encadré|encadre|liste numérotée|liste à puces|liste|sous-titre|chapô|chapo|texte)$/i.exec(t))) return { kind: "convert", to: CONVERT[m[1].toLowerCase()] }
  if (/^(?:transforme|convertis|mets?|passe)\s+(?:la\s+)?liste\s+en\s+(?:paragraphe|texte)$/i.test(t)) return { kind: "unlist" }
  if ((m = /^(?:mets?|passe)\s+(?:tout\s+)?(?:le|ce)\s+(?:paragraphe|texte|bloc)\s+en\s+(gras|italique)$/i.exec(t))) return { kind: "wrapAll", style: m[1].toLowerCase() === "gras" ? "bold" : "italic" }
  if ((m = new RegExp(`^(?:enl[eè]ve|retire|supprime)\\s+(?:le\\s+)?(gras|italique)\\s+(?:de|sur|du mot|du)\\s+${Q}(.+?)${QE}$`, "i").exec(t))) return { kind: "unformat", style: m[1].toLowerCase() === "gras" ? "bold" : "italic", target: clean(m[2]) }
  if ((m = /^(?:monte|remonte|descends?|descend|d[ée]place)\s+(?:ce|le)\s+(?:paragraphe|bloc|texte)(?:\s+(?:vers\s+)?(?:le\s+)?(haut|bas))?$/i.exec(t))) return { kind: "move", dir: /^(?:descend)/i.test(t) || m[1] === "bas" ? "down" : "up" }
  if (/^fusionne\s+(?:ce\s+(?:paragraphe|bloc)\s+)?avec\s+(?:le|l[’'])\s*(?:paragraphe\s+)?pr[ée]c[ée]dent$/i.test(t)) return { kind: "merge" }
  if (/^(?:coupe|scinde|d[ée]coupe|s[ée]pare)\s+(?:la\s+)?section\s+(?:ici|à cet endroit|en deux)$/i.test(t)) return { kind: "splitSection" }
  if ((m = new RegExp(`^supprime\\s+la\\s+section\\s+${Q}(.+?)${QE}$`, "i").exec(t))) return { kind: "delSection", title: clean(m[1]) }
  if (/^supprime\s+le\s+dernier\s+(?:paragraphe|bloc)$/i.test(t)) return { kind: "delLast" }
  if (/^(?:raccourcis|r[ée]sume)\s+(?:ce|le|cet?)\s+(?:paragraphe|texte|passage|bloc)$/i.test(t) || /^(?:raccourcis|r[ée]duis)$/i.test(t)) return { kind: "aiEdit", op: "shorten" }
  if (/^simplifie(?:\s+(?:ce|le)\s+(?:paragraphe|texte|passage))?$/i.test(t)) return { kind: "aiEdit", op: "simplify" }
  if (/^(?:rends?|fais)\s+(?:ce|le)\s+(?:paragraphe|texte|passage)\s+plus\s+(?:direct|percutant|clair|court|simple)$/i.test(t) || /^plus direct$/i.test(t)) return { kind: "aiEdit", op: "direct" }
  if (/^corrige\s+(?:les\s+)?(?:fautes|orthographe)(?:\s+(?:du|de ce)\s+(?:paragraphe|texte))?$/i.test(t)) return { kind: "aiEdit", op: "fix" }
  if ((m = /^traduis(?:\s+(?:ce|le)\s+(?:paragraphe|texte|passage))?\s+(?:en|vers)\s+(\p{L}+)$/iu.exec(t))) return { kind: "aiEdit", op: "translate", lang: m[1] }
  if (/^reformule(?:\s+(?:ce|le)\s+(?:paragraphe|texte|passage))?$/i.test(t)) return { kind: "aiEdit", op: "rewrite" }
  if (/^(?:continue|poursuis|poursuivre|la suite|continue\s+(?:le|ce)\s+(?:paragraphe|texte|passage))$/i.test(t)) return { kind: "continue" }
  if (/^(?:donne[- ]moi|propose(?:-moi)?)\s+(?:\d+\s+)?titres?(?:\s+possibles?)?\s+pour\s+cette\s+section$/i.test(t) || /^(?:trouve|cherche)\s+(?:un|des)\s+titres?(?:\s+pour\s+cette\s+section)?$/i.test(t)) return { kind: "titles" }
  if (/^r[ée]sume\s+l[’']article(?:\s+en\s+\d+\s+phrases?)?$/i.test(t)) return { kind: "summary" }
  if (/^(?:ajoute|écris|ecris|fais)\s+(?:une\s+)?conclusion$|^ajoute\s+(?:un\s+)?(?:«\s*)?[àa] retenir(?:\s*»)?$/i.test(t)) return { kind: "conclusion" }
  if (/^relis\s+(?:la\s+section|cette\s+section)$/i.test(t)) return { kind: "review", scope: "section" }
  if (/^relis\s+(?:l[’']article|tout)$/i.test(t)) return { kind: "review", scope: "article" }
  if ((m = new RegExp(`^(?:cherche|trouve|propose)(?:-moi)?\\s+(?:des\\s+)?(?:sources?|pistes?)\\s+(?:sur|pour|à propos de)\\s+${Q}(.+?)${QE}$`, "i").exec(t)) && m[1].length >= 3) return { kind: "sources", topic: clean(m[1]) }
  if ((m = new RegExp(`^(?:mets?|passe|transforme)(?:-le)?\\s+(?:cette\\s+figure\\s+|le\\s+graphique\\s+)?en\\s+(courbe|ligne|lignes|barres|histogramme|points|nuage de points|lollipop|camembert|anneau|donut|cascade|haltères|halteres|waffle|treemap|podium)$`, "i").exec(t))) return { kind: "figtype", type: FIG[m[1].toLowerCase()] }
  m = new RegExp(`^(?:mets?|met|passe|écris|ecris|formate|mettre)\\s+(?:le mot|les mots|l[’']expression|la phrase|le terme|le nom)?\\s*${Q}(.+?)${QE}\\s+en\\s+(gras|italique|code|évidence)\\s*[.!]?$`, "i").exec(t)
  if (m) return { kind: "format", style: STYLE[m[2].toLowerCase()], target: clean(m[1]) }
  m = new RegExp(`^(?:mets?|met|passe|mettre)\\s+en\\s+(gras|italique|code|évidence)\\s+(?:le mot|les mots|l[’']expression|le terme|la phrase)?\\s*${Q}(.+?)${QE}\\s*[.!]?$`, "i").exec(t)
  if (m) return { kind: "format", style: STYLE[m[1].toLowerCase()], target: clean(m[2]) }
  m = new RegExp(`^(?:mets?|met|ajoute|fais|mettre)\\s+(?:un\\s+)?lien\\s+(?:sur|vers|pour)\\s+${Q}(.+?)${QE}\\s+(?:vers|avec|:|→)\\s*(https?:\\/\\/\\S+)\\s*$`, "i").exec(t)
  if (m) return { kind: "link", target: clean(m[1]), url: m[2] }
  m = new RegExp(`^remplace\\s+(?:le mot\\s+|l[’']expression\\s+)?${Q}(.+?)${QE}\\s+par\\s+${Q}(.+?)${QE}\\s*[.!]?$`, "i").exec(t)
  if (m) return { kind: "replace", from: clean(m[1]), to: clean(m[2]) }
  m = new RegExp(`^(?:supprime|enl[eè]ve|retire|efface)\\s+(?:le mot\\s+|l[’']expression\\s+|le terme\\s+)?${Q}(.+?)${QE}\\s*[.!]?$`, "i").exec(t)
  if (m && m[1].split(/\s+/).length <= 8) return { kind: "delete", target: clean(m[1]) }
  m = new RegExp(`^(?:c[’']est quoi|qu[’']est[- ]ce qu(?:e|[’']un|[’']une|[’'])|que (?:veut dire|signifie)|définis|definis|d[ée]finition (?:de|du|d[’'])|qui est|c[’']est quoi (?:un|une|le|la|l[’']|les|des)?)\\s*(?:le mot |un |une |le |la |les |l[’']|d[’']|du |de la |des )?${Q}(.+?)${QE}\\s*\\??\\s*$`, "i").exec(t)
  if (m && m[1].split(/\s+/).length <= 6) return { kind: "define", term: clean(m[1]).replace(/\s*\?$/, "") }
  m = /^(.{2,40}?)\s*,?\s*c[’']est quoi\s*\??$/i.exec(t)
  if (m) return { kind: "define", term: clean(m[1]) }
  return null
}

type Blk = { id: string; k: string; text: string; ver: number }
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
const TEXTY = new Set(["p", "lede", "h2", "h3", "bullet", "number", "quote", "callout"])
/** applique la consigne au bloc le plus proche (avant, puis après) qui contient la cible ; renvoie les blocs modifiés ou null */
/** texte brut (sans balisage Markdown du modèle) + table de correspondance vers les positions dans le texte Markdown */
function plainMap(md: string) {
  let plain = ""; const map: number[] = []; let i = 0
  while (i < md.length) {
    const c = md[i]
    if (c === "\\" && i + 1 < md.length) { plain += md[i + 1]; map.push(i + 1); i += 2; continue }
    if (c === "{" && md[i + 1] === "{") { const m = /^\{\{[KDV][\d-]+\}\}/.exec(md.slice(i)); if (m) { i += m[0].length; continue } }
    if (c === "*" || c === "`") { i++; continue }
    if (c === "[") { const m = /^\[((?:\\.|[^\]\\])+)\]\(([^)\s]+)\)/.exec(md.slice(i)); if (m) { for (let k = 0; k < m[1].length; k++) { plain += m[1][k]; map.push(i + 1 + k) } i += m[0].length; continue } }
    plain += c; map.push(i); i++
  }
  return { plain, map }
}
/** étend [from, to[ pour ne couper ni un lien, ni un passage en gras / italique / code (on enveloppe alors l'ensemble) */
function expandTokens(md: string, from: number, to: number): [number, number] {
  const spans: [number, number][] = []
  for (const re of [/\[(?:\\.|[^\]\\])+\]\([^)\s]+\)/g, /\*\*[^*]+\*\*/g, /(?<!\*)\*[^*\n]+\*(?!\*)/g, /`[^`]+`/g]) for (const m of md.matchAll(re)) spans.push([m.index!, m.index! + m[0].length])
  let changed = true
  while (changed) { changed = false; for (const [a, b] of spans) { if (from > a && from < b) { from = a; changed = true } if (to > a && to < b) { to = b; changed = true } } }
  return [from, to]
}
const sp = (t: string) => t.replace(/[\u00a0\u202f]/g, " ")
/** position [début, fin[ d'un texte brut dans un texte Markdown (insensible aux balises et aux espaces insécables) */
export function findInMd(md: string, plainTarget: string): [number, number] | null {
  const { plain, map } = plainMap(md), a = sp(plain), t = sp(plainTarget).trim(); if (t.length < 2) return null
  let k = a.indexOf(t); if (k < 0) k = a.toLowerCase().indexOf(t.toLowerCase()); if (k < 0) return null
  return [map[k], map[k + t.length - 1] + 1]
}
/** applique la consigne au bloc le plus proche (avant, puis après) qui contient la cible ; « @sel » = la sélection épinglée (dans son bloc) */
export function applyCommand<T extends Blk>(cmd: Cmd, blocks: T[], fromId: string, sel?: { blockId: string; text: string }): { blocks: T[]; hitId: string } | null {
  if (cmd.kind !== "format" && cmd.kind !== "link" && cmd.kind !== "replace" && cmd.kind !== "delete" && cmd.kind !== "unformat") return null
  const target = cmd.kind === "replace" ? cmd.from : cmd.target, isSel = target === SEL
  if (isSel && !sel) return null
  const i0 = blocks.findIndex(b => b.id === fromId)
  const order = isSel ? blocks.filter(b => b.id === sel!.blockId) : [...blocks.slice(0, Math.max(i0, 0)).reverse(), ...blocks.slice(i0 + 1)].filter(b => TEXTY.has(b.k) && b.id !== fromId)
  const re = isSel ? null : new RegExp(`(?<![\\w*])${esc(target)}(?![\\w*])`, "iu")
  const unf = cmd.kind === "unformat" && !isSel ? new RegExp(cmd.style === "bold" ? `\\*\\*(${esc(target)})\\*\\*` : `(?<!\\*)\\*(${esc(target)})\\*(?!\\*)`, "iu") : null
  for (const b of order) {
    let from: number, to: number
    if (isSel) { const loc = findInMd(b.text, sel!.text); if (!loc) continue; [from, to] = expandTokens(b.text, loc[0], loc[1]) }
    else if (unf) { const m = unf.exec(b.text); if (!m) continue; const text = b.text.slice(0, m.index) + m[1] + b.text.slice(m.index + m[0].length); return { blocks: blocks.map(x => x.id === b.id ? { ...x, text, ver: x.ver + 1 } : x), hitId: b.id } }
    else { const m = re!.exec(b.text); if (!m) continue; from = m.index; to = m.index + m[0].length }
    const w = b.text.slice(from, to); let rep: string
    if (cmd.kind === "unformat") rep = w.replace(cmd.style === "bold" ? /\*\*/g : /(?<!\*)\*(?!\*)/g, "")
    else if (cmd.kind === "format") { const inner = cmd.style === "bold" ? w.replace(/\*\*/g, "") : cmd.style === "italic" ? w.replace(/(?<!\*)\*(?!\*)/g, "") : w.replace(/`/g, ""); rep = cmd.style === "bold" ? `**${inner}**` : cmd.style === "italic" ? `*${inner}*` : `\`${inner}\`` }
    else if (cmd.kind === "link") rep = `[${w}](${cmd.url})`
    else if (cmd.kind === "replace") rep = cmd.to
    else rep = ""
    const text = (b.text.slice(0, from) + rep + b.text.slice(to)).replace(/\s{2,}/g, " ").replace(/\s+([,.;:!?])/g, "$1")
    return { blocks: blocks.map(x => x.id === b.id ? { ...x, text, ver: x.ver + 1 } : x), hitId: b.id }
  }
  return null
}
const FREE = /^(?:peux-tu|pourrais-tu|tu peux|s['’]il (?:te|vous) pla[iî]t|stp|merci de|jev,?)?\s*(?:met\w*|pass\w*|ajout\w*|enl[eè]v\w*|retir\w*|supprim\w*|efface\w*|d[ée]plac\w*|remplac\w*|transform\w*|convert\w*|fai\w*|rend\w*|souligne\w*|surlign\w*|color\w*|num[ée]rot\w*|rang\w*|tri\w*|regroup\w*|s[ée]par\w*|fusionn\w*|coup\w*|dupliqu\w*|copi\w*|corrig\w*|v[ée]rifi\w*|ins[eè]r\w*|plac\w*|chang\w*|modifi\w*|rajout\w*|invers\w*|mont\w*|descend\w*|fait|g[ée]n[èe]re\w*|cr[ée]e\w*|construi\w*|dessin\w*|trac\w*|montr\w*|affich\w*|visualis\w*|illustr\w*|compar\w*|synth[ée]tis\w*)\b/i
/** consigne d'édition en français que les règles locales ne comprennent pas (à interpréter par Claude, sur confirmation) */
/** une phrase qui renvoie à la sélection épinglée (« ça », « ce passage »…) */
export const refersToSel = (raw: string) => /(?:^|[\s'’])(?:ça|ca|cela|ceci|ce passage|cette phrase|ce texte|la sélection)(?=$|[\s.,;!?])/i.test(raw)
export const looksFreeInstruction = (raw: string) => {
  const clean = raw.replace(/\{\{[KDV][\d-]+\}\}/g, "").trim(), t = normalizeAsk(clean), polite = t.length < clean.replace(/[?!]+$/, "").length - 5 // une formule de politesse a été retirée : c'est une demande
  if (t.length < 10 || t.length > 240 || t.split(/\s+/).length < (polite ? 2 : 3) || parseCommand(clean) || looksLikeInstruction(t)) return false
  return FREE.test(t) || (polite && !/\?\s*$/.test(clean.replace(/\s+(?:s['’]il (?:te|vous) pla[iî]t|stp|merci)\s*\??$/i, "")) || polite && /^(?:peux|pourrais|pouvez|pourriez|veux|voudrais|voulez)/i.test(clean))
}
const STY = { bold: "gras", italic: "italique", code: "code" }
const q = (x: string) => x === SEL ? "la sélection épinglée" : `« ${x} »`
export function describe(c: Cmd): string {
  switch (c.kind) {
    case "format": return `mettre ${q(c.target)} en ${STY[c.style]}`
    case "link": return `faire de ${q(c.target)} un lien`
    case "replace": return `remplacer ${q(c.from)} par « ${c.to} »`
    case "delete": return `supprimer ${q(c.target)}`
    case "unformat": return `enlever le ${STY[c.style]} de ${q(c.target)}`
    case "define": return `définir ${q(c.term)}`
    case "convert": return `mettre le paragraphe du dessus en ${{ quote: "citation", callout: "encadré", bullet: "liste", number: "liste numérotée", h3: "sous-titre", lede: "chapô", p: "texte" }[c.to]}`
    case "unlist": return "transformer la liste du dessus en paragraphe"
    case "wrapAll": return `mettre tout le paragraphe du dessus en ${STY[c.style]}`
    case "move": return `${c.dir === "up" ? "monter" : "descendre"} le paragraphe du dessus`
    case "merge": return "fusionner le paragraphe du dessus avec le précédent"
    case "splitSection": return "couper la section ici (la suite devient une nouvelle section)"
    case "delSection": return `supprimer la section « ${c.title} »`
    case "delLast": return "supprimer le dernier paragraphe de la section"
    case "aiEdit": return `${{ shorten: "raccourcir", simplify: "simplifier", direct: "rendre plus direct", translate: `traduire en ${c.lang || ""}`, fix: "corriger les fautes de", rewrite: "reformuler" }[c.op]} le paragraphe du dessus (Claude)`
    case "insert": return `insérer un bloc : « ${c.text.slice(0, 60)} »`
    case "togallery": return "remplacer le graphique dessiné par Claude par un graphique de la galerie"
    case "figedit": return `modifier le graphique dessiné par Claude : « ${c.instruction.slice(0, 60)} »`
    case "chart": return (c.gallery ? "[galerie] " : "") + (c.topic ? `créer un graphique à partir des chiffres de l'article sur « ${c.topic} »` : "créer un graphique à partir des chiffres de la sélection (ou du paragraphe du dessus)")
    case "explain": return "expliquer la sélection épinglée (Claude)"
    case "cite": return "chercher une source pour la sélection épinglée"
    case "continue": return "continuer le paragraphe du dessus (Claude)"
    case "titles": return "proposer 3 titres pour cette section (Claude)"
    case "summary": return "résumer l'article en 3 phrases (Claude)"
    case "conclusion": return "ajouter une section « À retenir » en fin d'article (Claude)"
    case "review": return c.scope === "section" ? "relire la section" : "relire l'article"
    case "sources": return `proposer des pistes de sources sur « ${c.topic} » (Claude, à vérifier)`
    case "figtype": return `passer la figure en « ${c.type} » (Claude, mêmes données)`
  }
}
