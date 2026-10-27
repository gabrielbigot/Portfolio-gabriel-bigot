// Jev « ambiant » : repère, pendant l'écriture, ce qui mérite un graphique, une source, un plan ou une demande à Claude — sans appel IA ni menu.
// Heuristiques locales et prudentes : elles ne font que PROPOSER (un clic pour accepter, un clic pour ignorer) ; rien n'est inventé,
// les données proposées viennent mot pour mot du texte de l'auteur.
export type DataHit = { text: string; unit: string; n: number; shape: "values" | "time" | "events" }
const UNIT = "%|points?|pts|M€|Md€|Mds?€?|k€|€|millions?|milliards?|M\\$|\\$|heures?|h|ans"
const norm = (s: string) => s.replace(/[  ]/g, " ")
const numOf = (s: string) => s.replace(/\s/g, "").replace(",", ".")

export function detectData(raw: string): DataHit | null {
  const t = norm(raw).replace(/\{\{[KDV][\d-]+\}\}/g, "").replace(/[*`]/g, "")
  if (t.length < 25) return null
  // « respectivement » : « France, Allemagne et Espagne affichent respectivement 12,5, 9,8 et 7,1 % »
  { const m = /([A-ZÉÈÀÂÎÔÛ][^.;:]{3,120}?)\s+(?:affichent|atteignent|comptent|enregistrent|ont|sont|font|représentent|pèsent)?\s*respectivement\s+(?:de\s+|à\s+)?([^.;]{3,120})/iu.exec(t)
    if (m) { const labels = m[1].split(/,\s*|\s+et\s+/).map(x => x.replace(/^(?:la|le|les|l[’'])\s*/i, "").replace(/\s+(?:affichent|atteignent|comptent|enregistrent|ont|sont|font)$/i, "").trim()).filter(x => x.length > 1)
      const nums = [...m[2].matchAll(new RegExp(`(-?\\d+(?:[ ]\\d{3})*(?:[.,]\\d+)?)\\s*(${UNIT})?`, "gu"))], unit = nums.find(x => x[2])?.[2] || ""
      if (labels.length >= 2 && nums.length >= labels.length) return { shape: "values", n: labels.length, unit, text: labels.map((l, i) => `${l.slice(0, 40)} ; ${numOf(nums[i][1])}`).join("\n") } } }
  // « de 8 à 12 % » : deux états (avant / après)
  { const m = new RegExp(`\\bde\\s+(-?\\d+(?:[ ]\\d{3})*(?:[.,]\\d+)?)\\s*(${UNIT})?\\s+(?:à|jusqu['’]à|vers)\\s+(-?\\d+(?:[ ]\\d{3})*(?:[.,]\\d+)?)\\s*(${UNIT})`, "iu").exec(t)
    if (m && !/\b(?:19|20)\d{2}\b[^.]{0,30}\b(?:19|20)\d{2}\b/.test(m[0])) return { shape: "values", n: 2, unit: m[4] || m[2] || "", text: `Avant ; ${numOf(m[1])}\nAprès ; ${numOf(m[3])}` } }
  // évolution : au moins 3 années suivies d'une valeur
  const yrs = [...t.matchAll(new RegExp(`\\b((?:19|20)\\d{2})\\b[^\\d\\n]{1,22}?(-?\\d+(?:[ ]\\d{3})*(?:[.,]\\d+)?)\\s*(${UNIT})?`, "gu"))].filter(m => m[2] !== m[1])
  const seenY = new Set<string>(), tr = yrs.filter(m => !seenY.has(m[1]) && seenY.add(m[1]))
  if (tr.length < 3) { // « 3 M€ en 2019 » : valeur avant l'année
    const rev = [...t.matchAll(new RegExp(`(-?\\d+(?:[ ]\\d{3})*(?:[.,]\\d+)?)\\s*(${UNIT})?\\s*(?:en|de|pour|à|au|fin|début)\\s+((?:19|20)\\d{2})\\b`, "gu"))], seenR = new Set<string>(), rr = rev.filter(m => !seenR.has(m[3]) && seenR.add(m[3]))
    if (rr.length >= 3) return { shape: "time", n: rr.length, unit: rr.find(m => m[2])?.[2] || "", text: rr.map(m => `${m[3]} ; ${numOf(m[1])}`).sort().join("\n") }
  }
  if (tr.length >= 3) { const unit = [...tr.map(m => m[3] || "")].find(Boolean) || ""; return { shape: "time", n: tr.length, unit, text: tr.map(m => `${m[1]} ; ${numOf(m[2])}`).join("\n") } }
  // « 12,5 % des actifs en France, 9,8 % en Allemagne et 7,1 % en Espagne » : valeur d'abord, lieu ou sujet ensuite
  { const vf = [...t.matchAll(new RegExp(`(-?\\d+(?:[ ]\\d{3})*(?:[.,]\\d+)?)\\s*(${UNIT})(?:\\s+(?:des?|du|de la|d['’]|chez les|pour les)\\s+[\\p{L}'’-]+(?:\\s+[\\p{L}'’-]+){0,2})?\\s+(?:en|au|aux|à|chez|pour|dans)\\s+(?:la |le |les |l[’'])?([A-ZÉÈÀÂÎÔÛ][\\p{L}'’-]*(?:\\s+[A-ZÉÈÀ][\\p{L}'’-]*){0,2})`, "gu"))]
    const seenV = new Set<string>(), rowsV = vf.filter(m => !seenV.has(m[3].toLowerCase()) && seenV.add(m[3].toLowerCase()))
    if (rowsV.length >= 3 || (rowsV.length === 2 && /compar|contre|face à|versus|\\bvs\\b|plus que|moins que|devant|derrière|écart|tandis que|alors que/i.test(t))) return { shape: "values", n: rowsV.length, unit: rowsV[0][2], text: rowsV.map(m => `${m[3]} ; ${numOf(m[1])}`).join("\n") } }
  // comparaison : au moins 3 « Libellé … valeur unité » de même unité
  const re = new RegExp(`(?:^|[\\s,;:(])((?:l[’']|la |le |les )?[A-ZÉÈÀÂÎÔÛ][\\p{L}'’.-]*(?:\\s+(?:de |du |des |d[’'])?[A-ZÉÈÀ][\\p{L}'’.-]*){0,3})(?:\\s+(?:affiche|atteint|compte|enregistre|dépasse|représente|pèse|est à|est de))?\\s*(?:\\(|:|=|à|avec|,|pour|environ)?\\s*(-?\\d+(?:[ ]\\d{3})*(?:[.,]\\d+)?)\\s*(${UNIT})`, "gu")
  const rows = [...t.matchAll(re)].map(m => ({ label: m[1].replace(/^(l[’']|la |le |les )/i, "").trim(), v: numOf(m[2]), unit: m[3] }))
  const byUnit = new Map<string, typeof rows>(); for (const r of rows) { if (!byUnit.has(r.unit)) byUnit.set(r.unit, []); byUnit.get(r.unit)!.push(r) }
  const best = [...byUnit.entries()].sort((a, b) => b[1].length - a[1].length)[0]; if (!best) return null
  const seen = new Set<string>(), list = best[1].filter(r => r.label.length > 1 && !seen.has(r.label.toLowerCase()) && seen.add(r.label.toLowerCase()))
  if (list.length < 3 && !(list.length === 2 && /compar|contre|face à|versus|\bvs\b|plus que|moins que|devant|derrière|écart|tandis que|alors que/i.test(t))) return null
  return { shape: "values", n: list.length, unit: best[0], text: list.map(r => `${r.label} ; ${r.v}`).join("\n") }
}
/** liste à puces de lignes « Libellé : valeur » (≥ 3 lignes consécutives) */
export function detectListData(items: string[]): DataHit | null {
  const rows = items.map(i => /^(.{2,60}?)\s*[:=–-]\s*(-?\d+(?:[  ]\d{3})*(?:[.,]\d+)?)\s*(%|M€|Md€|k€|€|points?)?\s*$/.exec(norm(i).replace(/\{\{[KDV][\d-]+\}\}/g, "").replace(/[*`]/g, "").trim())).filter(Boolean) as RegExpExecArray[]
  if (rows.length < 3 || rows.length < items.length - 1) return null
  return { shape: "values", n: rows.length, unit: rows.find(r => r[3])?.[3] || "", text: rows.map(r => `${r[1].trim()} ; ${numOf(r[2])}`).join("\n") }
}
/** chiffre affirmé sans pastille de source */
export function detectUnsourced(text: string) { return /\d[\d  .,]*\s*(%|M€|Md€|k€|€|millions?|milliards?)/.test(text) && !/\{\{[KDV][\d-]+\}\}/.test(text) && text.split(/\s+/).length >= 8 }
const INSTR = /^(écris|ecris|rédige|redige|réécris|reecris|reformule|résume|resume|explique|développe|developpe|raccourcis|traduis|ajoute|fais|donne|propose|génère|genere|écrire|rédiger|améliore|ameliore|compare|illustre|write|rewrite|explain|summari[sz]e|expand|draft)\b/i
export const looksLikeInstruction = (t: string) => { const v = t.trim(); if (/\b(?:graphique|graphe|diagramme|courbe|histogramme|camembert)s?\b/i.test(v)) return false; return v.length >= 12 && v.split(/\s+/).length >= 3 && INSTR.test(v) && !/^\S+\s+(est|sont|était|a|ont)\b/i.test(v) && !/\{\{/.test(v) }
export const words = (t: string) => t.split(/\s+/).filter(Boolean).length

const MONTHS: Record<string, string> = { janvier: "01", "février": "02", fevrier: "02", mars: "03", avril: "04", mai: "05", juin: "06", juillet: "07", "août": "08", aout: "08", septembre: "09", octobre: "10", novembre: "11", "décembre": "12", decembre: "12" }
/** événements datés (au moins 3) → frise chronologique ; la date vient mot pour mot du texte, l'étiquette est le reste de la phrase */
export function detectEvents(raw: string): DataHit | null {
  const t = norm(raw).replace(/\{\{[KDV][\d-]+\}\}/g, "").replace(/[*`]/g, ""), rows: { d: string; l: string }[] = [], seen = new Set<string>()
  for (const sent of t.split(/(?<=[.!?])\s+/)) {
    const m = /(?:le\s+(\d{1,2})(?:er)?\s+)?(janvier|f[ée]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[ée]cembre)\s+((?:19|20)\d{2})|\ben\s+((?:19|20)\d{2})\b/i.exec(sent); if (!m) continue
    const d = m[3] ? `${m[3]}-${MONTHS[m[2].toLowerCase()]}-${String(m[1] || 1).padStart(2, "0")}` : `${m[4]}-01-01`; if (seen.has(d)) continue; seen.add(d)
    const l = sent.replace(m[0], " ").replace(/^\s*(?:en|le|au|dès|depuis|fin|début|à)\b\s*/i, "").replace(/^[\s,;:–-]+|[\s,;:–.-]+$/g, "").replace(/\s{2,}/g, " ").slice(0, 70); if (l.length < 4) continue; rows.push({ d, l: l.charAt(0).toUpperCase() + l.slice(1) })
  }
  if (rows.length < 3) return null; rows.sort((a, b) => a.d.localeCompare(b.d))
  return { shape: "events", n: rows.length, unit: "", text: rows.map(r => `${r.l.replace(/[;]/g, ",")} ; ${r.d}`).join("\n") }
}
/** série de puces « pour / contre » (ou avantages / inconvénients) → tableau à deux colonnes */
export function detectProsCons(items: string[]): { head: string[]; rows: string[][] } | null {
  const pro = /^(?:pour|avantages?|\+|plus)\s*[:–-]?\s*/i, con = /^(?:contre|inconv[ée]nients?|[−-]|moins)\s*[:–-]?\s*/i, P: string[] = [], C: string[] = []
  for (const it of items) { const t = it.trim(); if (pro.test(t) && t.replace(pro, "").length > 3) P.push(t.replace(pro, "")); else if (con.test(t) && t.replace(con, "").length > 3) C.push(t.replace(con, "")); else return null }
  if (!P.length || !C.length) return null
  return { head: ["Pour", "Contre"], rows: Array.from({ length: Math.max(P.length, C.length) }, (_, i) => [P[i] || "", C[i] || ""]) }
}
/** définition d'un terme dans le texte : « X désigne… », « X signifie… » ou « **X** est un… » → entrée de glossaire */
export function detectDefinition(raw: string): { term: string; def: string } | null {
  const t = raw.replace(/\{\{[KDV][\d-]+\}\}/g, "").trim(); if (t.length < 25 || words(t) > 45) return null
  const art = "(?:(?:le|la|les|l[’']|un|une)\\s*)?"
  let m = new RegExp(`^[«"“]?\\s*${art}([\\p{L}'’-]+(?:\\s+[\\p{L}'’-]+){0,2}?)\\s*[»"”]?\\s*(?:\\([^)]{1,20}\\)\\s*)?(?:désigne|signifie|se définit comme|correspond à|renvoie à)\\s+(.+)$`, "iu").exec(t)
  if (!m) m = new RegExp(`^(?:\\*\\*|\\*|[«"“])\\s*${art}([\\p{L}'’-]+(?:\\s+[\\p{L}'’-]+){0,2}?)\\s*(?:\\*\\*|\\*|[»"”])\\s*(?:est|sont)\\s+(.+)$`, "iu").exec(t)
  if (!m) return null
  const term = m[1].trim(), def = m[2].replace(/^[\s:]+/, "").replace(/\*\*|\*/g, "")
  return term.length > 2 && def.length > 8 ? { term: term.charAt(0).toUpperCase() + term.slice(1), def: def.charAt(0).toUpperCase() + def.slice(1) } : null
}
