// Assistant d'écriture du studio (Claude) : réécrit ou génère le texte d'un champ sur consigne de l'utilisateur.
// Studio seulement (routes /api/studio/*) ; la clé n'existe que dans le projet studio (ANTHROPIC_API_KEY). Rien n'est journalisé.
const calls: number[] = []
/** texte d'une réponse : tous les blocs « text » (un bloc de réflexion peut précéder la réponse) */
const textOf = (j: any): string => (Array.isArray(j?.content) ? j.content.filter((c: any) => c?.type === "text" && typeof c.text === "string").map((c: any) => c.text).join("\n") : "")
/** message d'erreur de l'API Claude, avec le détail renvoyé (ex. paramètre refusé, modèle inconnu) */
async function apiError(r: Response) {
  let d = ""; try { const j = await r.json(); d = String(j?.error?.message || "").slice(0, 220) } catch { /* corps illisible */ }
  return `Claude : erreur ${r.status}${r.status === 401 ? " (clé refusée)" : r.status === 429 ? " (trop de demandes)" : ""}${d ? " — " + d : ""}`
}
export const aiEnabled = () => !!process.env.ANTHROPIC_API_KEY
export const aiModel = () => process.env.STUDIO_AI_MODEL || "claude-sonnet-5-5"
export const stripMarks = (t: string) => t.replace(/[⁠​-‍﻿]/g, "")

const SYSTEM = `Tu es l'assistant d'écriture d'un studio d'édition de portfolio (site personnel d'un étudiant en économie-gestion qui construit des automatisations IA). L'utilisateur modifie un texte directement dans la page. Tu reçois : le TEXTE ACTUEL du champ (peut être vide), une CONSIGNE, et un CONTEXTE (page, champ).
Réponds UNIQUEMENT par le nouveau texte, prêt à être inséré à la place du texte actuel : aucune explication, aucun guillemet autour, aucune balise, pas de markdown sauf si le texte actuel en contient.
Même langue que le texte actuel, sinon que la consigne (français par défaut). Garde le registre et la longueur adaptés au champ : un titre reste un titre, un bouton reste court.
N'invente jamais de faits, de chiffres, de dates ou de sources : si la consigne demande une information que tu ne peux pas connaître, écris un texte neutre qui ne l'affirme pas.
Si le CONTEXTE contient une SÉLECTION ÉPINGLÉE, c'est le passage dont l'auteur parle : tiens-en compte même s'il ne le désigne pas explicitement dans sa demande.
Si la consigne est impossible ou n'a pas de sens pour ce champ, réponds exactement « [[REFUS]] » suivi d'une courte raison.`

export async function runAi(input: { instruction: string; original: string; context: string; multiline: boolean }): Promise<{ text: string; model: string }> {
  if (!aiEnabled()) throw new Error("Clé IA absente : ajoutez ANTHROPIC_API_KEY dans les variables d'environnement du studio.")
  const now = Date.now(); while (calls.length && now - calls[0] > 3600_000) calls.shift()
  if (calls.length >= 60) throw new Error("Limite de 60 demandes à l'IA par heure atteinte.")
  const instruction = stripMarks(input.instruction).trim().slice(0, 2000), original = stripMarks(input.original).slice(0, 8000), context = input.context.slice(0, 1500)
  if (!instruction) throw new Error("consigne vide")
  calls.push(now)
  const model = aiModel()
  const r = await fetch(`${process.env.ANTHROPIC_API_URL || "https://api.anthropic.com"}/v1/messages`, {
    method: "POST", signal: AbortSignal.timeout(45_000), cache: "no-store",
    headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY!, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model, max_tokens: input.multiline ? 2000 : 900, system: SYSTEM + (input.multiline ? "\nLe champ accepte plusieurs paragraphes (sépare-les par une ligne vide)." : "\nLe champ est sur une seule ligne : ne mets aucun retour à la ligne."),
      messages: [{ role: "user", content: `CONTEXTE : ${context || "—"}\n\nTEXTE ACTUEL :\n<<<\n${original}\n>>>\n\nCONSIGNE : ${instruction}` }] }),
  })
  if (!r.ok) throw new Error(await apiError(r))
  const j = await r.json(); let text = stripMarks(textOf(j)).trim()
  if (/^\[\[REFUS\]\]/.test(text)) throw new Error("Refusé : " + (text.replace(/^\[\[REFUS\]\]\s*/, "").slice(0, 200) || "consigne impossible pour ce champ"))
  if (!input.multiline) text = text.replace(/\s*\n+\s*/g, " ")
  text = text.replace(/^["«]\s*|\s*["»]$/g, "").trim()
  if (!text) throw new Error(`réponse vide${j?.stop_reason ? ` (arrêt : ${j.stop_reason}${j.stop_reason === "max_tokens" ? " — le modèle a épuisé sa limite avant de répondre" : ""})` : ""}`)
  return { text: text.slice(0, 8000), model }
}

/* ---------- création de zéro : sections et essais ---------- */
const str = (v: unknown, n: number) => stripMarks(typeof v === "string" ? v : "").trim().slice(0, n)
const link = (v: unknown) => { const s = str(v, 300); return /^(https?:\/\/|mailto:|\/[A-Za-z0-9/_#?=&.-]*$|#)/.test(s) ? s : "" }
const jsonOf = (t: string) => { const a = t.indexOf("{"), b = t.lastIndexOf("}"); if (a < 0 || b <= a) throw new Error("réponse illisible"); try { return JSON.parse(t.slice(a, b + 1)) } catch { throw new Error("réponse illisible") } }
async function ask(system: string, user: string, maxTokens: number, _temperature = 0.6) {
  if (!aiEnabled()) throw new Error("Clé IA absente : ajoutez ANTHROPIC_API_KEY dans les variables d'environnement du studio.")
  const now = Date.now(); while (calls.length && now - calls[0] > 3600_000) calls.shift()
  if (calls.length >= 60) throw new Error("Limite de 60 demandes à l'IA par heure atteinte."); calls.push(now)
  const r = await fetch(`${process.env.ANTHROPIC_API_URL || "https://api.anthropic.com"}/v1/messages`, { method: "POST", signal: AbortSignal.timeout(90_000), cache: "no-store", headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY!, "anthropic-version": "2023-06-01" }, body: JSON.stringify({ model: aiModel(), max_tokens: maxTokens, system, messages: [{ role: "user", content: user }] }) })
  if (!r.ok) throw new Error(await apiError(r))
  return textOf(await r.json())
}
const FREE = "N'invente jamais de faits, de chiffres, de dates, de noms ni de liens : si une information manque, écris un texte qui ne l'affirme pas, ou laisse un marqueur « [à compléter] ». Ne dis rien de personnel qui ne figure pas dans la demande ou le contexte."

const SECTION_SYSTEM = `Tu écris UNE section pour le portfolio d'un étudiant en économie-gestion qui construit des automatisations IA. Réponds UNIQUEMENT par un objet JSON (pas de markdown, pas de commentaire).
Types possibles et champs :
- {"type":"heading","eyebrow":"MOT-CLÉ","title":"…","subtitle":"…"}
- {"type":"text","title":"…","body":"paragraphes séparés par une ligne vide ; **gras** et [texte](https://…) autorisés"}
- {"type":"imageText","title":"…","body":"…","alt":"description de l'image à choisir","side":"left|right"}
- {"type":"cards","title":"…","columns":"2|3|4","items":[{"title":"…","text":"…","link":""}]} (2 à 6 cartes)
- {"type":"quote","text":"…","author":"…"}
- {"type":"cta","title":"…","text":"…","label":"texte du bouton","link":"mailto:ou https://…"}
- {"type":"list","title":"…","items":["…"]} (3 à 10 puces)
Si un type est demandé, utilise-le ; sinon choisis le plus adapté. Français par défaut. Titres courts. ${FREE} Laisse "link" vide si tu ne connais pas l'adresse.`
export async function runAiSection(input: { prompt: string; type?: string; context: string }) {
  const prompt = stripMarks(input.prompt).trim().slice(0, 3000); if (!prompt) throw new Error("demande vide")
  const o = jsonOf(await ask(SECTION_SYSTEM, `PAGE ET CONTEXTE : ${input.context.slice(0, 1200) || "—"}\n\nTYPE DEMANDÉ : ${input.type || "au choix"}\n\nDEMANDE : ${prompt}`, 2200))
  const t = String(o?.type || ""), out: Record<string, unknown> = { type: t }
  if (t === "heading") Object.assign(out, { eyebrow: str(o.eyebrow, 40), title: str(o.title, 140), subtitle: str(o.subtitle, 300) })
  else if (t === "text") Object.assign(out, { title: str(o.title, 140), body: str(o.body, 6000) })
  else if (t === "imageText") Object.assign(out, { image: "", alt: str(o.alt, 200), title: str(o.title, 140), body: str(o.body, 3000), side: o.side === "left" ? "left" : "right" })
  else if (t === "cards") Object.assign(out, { title: str(o.title, 140), columns: ["2", "3", "4"].includes(String(o.columns)) ? String(o.columns) : "3", items: (Array.isArray(o.items) ? o.items : []).slice(0, 6).map((c: any) => ({ title: str(c?.title, 100), text: str(c?.text, 400), link: link(c?.link), image: "", alt: "" })) })
  else if (t === "quote") Object.assign(out, { text: str(o.text, 500), author: str(o.author, 100) })
  else if (t === "cta") Object.assign(out, { title: str(o.title, 140), text: str(o.text, 300), label: str(o.label, 60), link: link(o.link) })
  else if (t === "list") Object.assign(out, { title: str(o.title, 140), items: (Array.isArray(o.items) ? o.items : []).slice(0, 10).map((x: unknown) => str(x, 240)).filter(Boolean) })
  else throw new Error("type de section non reconnu")
  return { block: out, model: aiModel() }
}

const ESSAY_SYSTEM = `Tu rédiges un brouillon d'essai pour le portfolio d'un étudiant en économie-gestion (idées sur l'IA, la technologie, le marché, l'éthique). Réponds UNIQUEMENT par un objet JSON :
{"title":"…","excerpt":"2 phrases d'accroche","category":"Vision|Marché|Technique|Éthique|…","content":[{"type":"paragraph","text":"…"},{"type":"heading","text":"…"},{"type":"list","items":["…"]},{"type":"quote","text":"…"}]}
Écris à la première personne, ton direct et réfléchi, en français, 6 à 20 blocs selon la demande. Un « heading » ouvre chaque partie. ${FREE} Si un argument demande une preuve, formule-le comme une conviction et ajoute à la fin « [source à ajouter] ». C'est un brouillon : l'auteur le relira et l'adaptera.`
export async function runAiEssay(input: { prompt: string; categories: string[] }) {
  const prompt = stripMarks(input.prompt).trim().slice(0, 4000); if (!prompt) throw new Error("demande vide")
  const o = jsonOf(await ask(ESSAY_SYSTEM + `\nCatégories existantes : ${input.categories.join(", ") || "—"}.`, `DEMANDE : ${prompt}`, 4500, 0.7))
  const content: { type: string; text?: string; items?: string[] }[] = []
  for (const c of (Array.isArray(o.content) ? o.content : []).slice(0, 40)) {
    if (c?.type === "paragraph" || c?.type === "heading" || c?.type === "quote") { const t = str(c.text, 3500); if (t) content.push({ type: c.type, text: t }) }
    else if (c?.type === "list") { const items = (Array.isArray(c.items) ? c.items : []).slice(0, 12).map((x: unknown) => str(x, 300)).filter(Boolean); if (items.length) content.push({ type: "list", items }) }
  }
  const title = str(o.title, 140); if (!title || content.length < 2) throw new Error("essai incomplet : réessayez en précisant la demande")
  return { title, excerpt: str(o.excerpt, 400), category: str(o.category, 30) || "Vision", content, model: aiModel() }
}

/* ---------- conversion d'une figure vers un autre type de graphique ---------- */
const CHART_SYSTEM = `Tu convertis la description JSON d'une figure d'un moteur de graphiques vers un AUTRE type de graphique, SANS changer les données : mêmes valeurs numériques, mêmes étiquettes, mêmes clés "src" (K1, D2…), mêmes "state". Tu reçois la figure d'origine, le type cible et son contrat de données (liste des champs). Réponds UNIQUEMENT par l'objet JSON de la figure convertie, avec "type" égal au type cible et un "label" (texte alternatif d'une phrase).
Règles : n'invente AUCUNE donnée, aucune valeur, aucune source ; si un champ du contrat ne peut pas être déduit de l'origine, omets-le ; regroupe ou réordonne les mêmes données si la forme l'exige ; garde les unités. Si la conversion est impossible sans inventer, réponds {"impossible":"raison courte"}.`
export async function runAiChart(input: { figure: unknown; target: string; contract: string; evidence: Set<string> }) {
  const raw = jsonOf(await ask(CHART_SYSTEM, `TYPE CIBLE : ${input.target}\nCONTRAT : ${input.contract}\n\nFIGURE D'ORIGINE :\n${JSON.stringify(input.figure).slice(0, 30000)}`, 4500, 0.2))
  if (raw && typeof raw.impossible === "string") throw new Error("Conversion impossible : " + str(raw.impossible, 200))
  if (!raw || raw.type !== input.target || typeof raw !== "object") throw new Error("réponse illisible : type différent de la cible")
  if (JSON.stringify(raw).length > 80000) throw new Error("figure trop volumineuse")
  let bad = ""; const walk = (o: any) => { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) { if ((k === "src" || k === "markerSrc") && typeof v === "string" && !input.evidence.has(v)) bad = v; else walk(v) } }; walk(raw)
  if (bad) throw new Error(`réponse refusée : la source « ${bad} » n'existe pas dans le registre de l'article`)
  return { figure: raw as Record<string, unknown>, model: aiModel() }
}

/* ---------- plan guidé par le modèle de décision (format conseillé pour chaque partie) ---------- */
const PLAN_FORMATS = ["paragraphe", "liste", "tableau", "citation", "image", "graphique", "schéma"] as const
const PLAN_SYSTEM = `Tu aides un auteur à structurer un texte (essai ou dossier) AVANT de l'écrire. Pour chaque partie, tu choisis le MEILLEUR FORMAT de présentation et tu dis pourquoi, comme un modèle de décision : le format découle de ce que la partie doit faire comprendre.
Réponds UNIQUEMENT par un objet JSON : {"title":"titre du texte","thesis":"thèse en une phrase","sections":[{"heading":"titre de la partie (une affirmation)","goal":"ce que le lecteur doit comprendre","format":"paragraphe|liste|tableau|citation|image|graphique|schéma","why":"pourquoi ce format, en une phrase","intent":"(si format = graphique) un identifiant parmi la liste fournie","needs":"(si graphique ou tableau) quelles données il faudra, SANS les inventer"}]}
4 à 9 parties. Alterne les formats : pas plus de la moitié en « paragraphe ». Un graphique n'est justifié que si une comparaison, une évolution ou une répartition chiffrée est au cœur de la partie. ${FREE}`
export type PlanSection = { heading: string; goal: string; format: string; why: string; needs: string; intent: string; chart: { intent: string; label: string; options: { type: string; when: string; fresh: boolean }[] } | null }
export async function runAiPlan(input: { prompt: string; intents: { id: string; label: string }[]; options: (id: string) => { type: string; when: string; fresh: boolean }[] }) {
  const prompt = stripMarks(input.prompt).trim().slice(0, 4000); if (!prompt) throw new Error("demande vide")
  const o = jsonOf(await ask(PLAN_SYSTEM + `\nIntentions de graphique disponibles :\n${input.intents.map(i => `- ${i.id} : ${i.label}`).join("\n")}`, `SUJET : ${prompt}`, 3000, 0.5))
  const ids = new Map(input.intents.map(i => [i.id, i.label])), sections: PlanSection[] = []
  for (const s of (Array.isArray(o.sections) ? o.sections : []).slice(0, 10)) {
    const heading = str(s?.heading, 160); if (!heading) continue
    const format = (PLAN_FORMATS as readonly string[]).includes(String(s?.format)) ? String(s.format) : "paragraphe", intent = ids.has(String(s?.intent)) ? String(s.intent) : ""
    sections.push({ heading, goal: str(s?.goal, 300), format, why: str(s?.why, 300), needs: str(s?.needs, 300), intent, chart: format === "graphique" && intent ? { intent, label: ids.get(intent)!, options: input.options(intent) } : null })
  }
  if (sections.length < 2) throw new Error("plan incomplet : précisez le sujet")
  return { title: str(o.title, 140), thesis: str(o.thesis, 400), sections, model: aiModel() }
}

/* ---------- Jev : consigne libre → actions structurées (jamais de texte inventé : seules les actions de la liste sont possibles) ---------- */
const JEV_SYSTEM = `Les consignes peuvent contenir des fautes de frappe ou être familières : interprète l'intention. Tu traduis une consigne d'édition écrite en français par l'auteur d'un article en une liste d'ACTIONS structurées. Tu ne modifies rien toi-même.
Réponds UNIQUEMENT par un objet JSON : {"actions":[…],"reason":""}. Actions possibles (champ "kind") :
- {"kind":"format","style":"bold|italic|code","target":"texte exact à mettre en forme, ou \"@sel\" pour la sélection épinglée"}
- {"kind":"unformat","style":"bold|italic","target":"texte exact"}
- {"kind":"link","target":"texte exact","url":"https://…"} (seulement si l'adresse figure dans la consigne)
- {"kind":"replace","from":"texte exact","to":"nouveau texte"}   - {"kind":"delete","target":"texte exact"}
- {"kind":"convert","to":"quote|callout|bullet|number|h3|lede|p"} (paragraphe du dessus)   - {"kind":"unlist"}   - {"kind":"wrapAll","style":"bold|italic"}
- {"kind":"move","dir":"up|down"}   - {"kind":"merge"}   - {"kind":"splitSection"}   - {"kind":"delSection","title":"fragment du titre"}   - {"kind":"delLast"}
- {"kind":"aiEdit","op":"shorten|simplify|direct|fix|rewrite"} ou {"kind":"aiEdit","op":"translate","lang":"anglais"}   - {"kind":"continue"}
- {"kind":"titles"}   - {"kind":"summary"}   - {"kind":"conclusion"}   - {"kind":"review","scope":"section|article"}   - {"kind":"sources","topic":"sujet"}
- {"kind":"togallery"} (remplacer le graphique dessiné par un graphique de la galerie : « prends un graphique de ma galerie »)
- {"kind":"figedit","instruction":"modification voulue"} (changer un graphique déjà dessiné : couleurs, simplification, légende, titre…)
- {"kind":"chart","gallery":"true","topic":"sujet, seulement si la consigne vise un thème de l'article plutôt que la sélection"} (créer un graphique à partir des chiffres de la sélection épinglée ou du paragraphe du dessus ; « fais/fait/génère/dessine un graphique »)
- {"kind":"figtype","type":"lines|bars|dotplot|donut|waterfall|dumbbell|lollipop|waffle|treemap|podium"}   - {"kind":"define","term":"mot"}
- {"kind":"insert","type":"p|ul|quote|callout","text":"texte à insérer, repris des mots de l'auteur"} (ajoute un bloc sous le paragraphe du dessus)
Si une SÉLECTION ÉPINGLÉE est fournie, la consigne porte sur elle MÊME SI elle ne la désigne pas explicitement ; « ça », « ceci », « ce passage », « cette phrase » la désignent aussi : utilise alors "@sel" comme target ou from (ou {"kind":"aiEdit","sel":"true",…} pour la réécrire, {"kind":"explain"} pour l'expliquer, {"kind":"cite"} pour lui chercher une source).
Règles : "target", "from" et "delete" doivent reprendre des mots EXISTANTS du texte fourni (copie exacte) ; si la consigne est ambiguë, impossible ou demande d'inventer des faits, réponds {"actions":[],"reason":"explication courte en français"}. 1 à 4 actions maximum. N'invente aucune donnée.`
const JEV_KINDS: Record<string, string[]> = { format: ["style", "target"], unformat: ["style", "target"], link: ["target", "url"], replace: ["from", "to"], delete: ["target"], convert: ["to"], unlist: [], wrapAll: ["style"], move: ["dir"], merge: [], splitSection: [], delSection: ["title"], delLast: [], aiEdit: ["op", "lang", "sel"], continue: [], explain: [], cite: [], chart: ["topic", "gallery"], togallery: [], figedit: ["instruction"], titles: [], summary: [], conclusion: [], review: ["scope"], sources: ["topic"], figtype: ["type"], define: ["term"], insert: ["type", "text"] }
export async function runAiJev(input: { text: string; nearby: string[]; sections: string[]; selection?: string }) {
  const text = stripMarks(input.text).trim().slice(0, 300); if (!text) throw new Error("consigne vide")
  const o = jsonOf(await ask(JEV_SYSTEM, `CONSIGNE : ${text}\n\n${input.selection ? `SÉLECTION ÉPINGLÉE : « ${stripMarks(input.selection).slice(0, 600)} »\n\n` : ""}SECTIONS : ${input.sections.slice(0, 40).map(s => stripMarks(s).slice(0, 80)).join(" | ")}\n\nPARAGRAPHES AU-DESSUS (du plus proche au plus lointain) :\n${input.nearby.slice(0, 6).map((t, i) => `[${i + 1}] ${stripMarks(t).slice(0, 700)}`).join("\n")}`, 700, 0))
  const actions: Record<string, string>[] = []
  for (const a of (Array.isArray(o.actions) ? o.actions : []).slice(0, 4)) { const k = String(a?.kind), keys = JEV_KINDS[k]; if (!keys) continue; const c: Record<string, string> = { kind: k }; for (const f of keys) if (typeof a[f] === "string") c[f] = stripMarks(a[f]).slice(0, 800); actions.push(c) }
  return { actions, reason: str(o.reason, 300), model: aiModel() }
}

/* ---------- extraction de chiffres d'un passage (pour en faire un graphique) : aucune valeur ne peut venir d'ailleurs que du texte ---------- */
const EXTRACT_SYSTEM = `Tu extrais d'un passage les valeurs chiffrées qui peuvent former un graphique. Réponds UNIQUEMENT par un objet JSON : {"title":"affirmation qui résume ce que montre le graphique (12 mots max)","unit":"unité commune ou chaîne vide","rows":[{"label":"libellé court","value":nombre}]}.
Règles STRICTES : chaque "value" doit être un nombre qui figure EXPLICITEMENT dans le passage ; chaque "label" désigne ce que ce nombre mesure d'après le passage (2 à 5 mots) ; n'invente, ne déduis et ne calcule aucune valeur ; 2 à 12 lignes ; si le passage ne contient pas au moins deux valeurs comparables, réponds {"title":"","unit":"","rows":[]}.`
export async function runAiExtract(input: { text: string; topic?: string }) {
  const text = stripMarks(input.text).trim().slice(0, 4000); if (!text) throw new Error("passage vide")
  const o = jsonOf(await ask(EXTRACT_SYSTEM, `${input.topic ? `SUJET À ILLUSTRER : « ${stripMarks(input.topic).slice(0, 100)} » (ne garde que les valeurs qui le concernent)\n\n` : ""}PASSAGE :\n${text}`, 800, 0)), digits = text.replace(/[\s  ]/g, "").replace(/,/g, ".")
  const inText = (v: number) => new RegExp("(?<![\\d.])" + String(v).replace(/\./g, "\\.") + "(?![\\d])").test(digits)
  const rows = (Array.isArray(o.rows) ? o.rows : []).slice(0, 12).map((r: any) => ({ label: str(r?.label, 50), value: typeof r?.value === "number" ? r.value : parseFloat(String(r?.value).replace(",", ".")) })).filter((r: { label: string; value: number }) => r.label && Number.isFinite(r.value) && inText(r.value))
  return { title: str(o.title, 140), unit: str(o.unit, 20), rows, model: aiModel() }
}

/* ---------- graphique ou schéma dessiné par Claude (SVG) ---------- */
const FIGURE_SYSTEM = `Tu dessines UN graphique ou schéma en SVG pour un article, à partir du TEXTE SOURCE fourni (et de la demande de l'auteur). Tu réponds en DEUX parties :
1) une ligne JSON : {"title":"affirmation que le graphique démontre (14 mots max)","reading":"comment le lire et ses limites, 1 à 2 phrases","unit":"unité ou vide","rows":[{"label":"…","value":nombre}]}  (rows = les valeurs chiffrées utilisées ; [] pour un schéma sans chiffres)
2) puis, sur les lignes suivantes, après une ligne contenant exactement ---SVG--- : le code SVG seul.
Règles du SVG : viewBox="0 0 760 H" (H entre 260 et 460), width="100%", role="img", avec <title> et <desc> ; AUCUN script, style, image, foreignObject, use, lien externe. Éléments permis : svg g path rect circle ellipse line polyline polygon text tspan defs linearGradient stop clipPath marker.
Couleurs UNIQUEMENT par variables CSS avec repli : encre var(--vra-ink,#29292b), texte secondaire var(--vra-mid,#67676a), traits var(--vra-line,#d5d0c5), accents var(--vra-c1,#1f5d6e) var(--vra-c2,#5a8a66) var(--vra-c3,#b5532a) var(--vra-c4,#a87c12) var(--vra-c5,#6c5b96), jamais de fond opaque. Police : font-family="var(--vra-sans,system-ui,sans-serif)", taille ≥ 12. Étiquette chaque barre ou point avec sa valeur ; barres sur base zéro ; pas de 3D ni de décor ; lisible en largeur réduite.
Règles de fond STRICTES : n'utilise que des chiffres écrits dans le TEXTE SOURCE ; n'invente, ne déduis et ne calcule aucune valeur (les graduations d'axe sont permises) ; si le texte ne permet pas un graphique honnête, réponds seulement {"title":"","reading":"","unit":"","rows":[],"reason":"explication courte"} sans SVG.`
export async function runAiFigure(input: { request: string; source: string; topic?: string; previous?: string; instruction?: string }) {
  const request = stripMarks(input.request).trim().slice(0, 400), source = stripMarks(input.source).trim().slice(0, 6000)
  if (!source) throw new Error("rien à illustrer : le texte source est vide")
  const user = `DEMANDE : ${request || "un graphique adapté"}${input.topic ? `\nSUJET : ${stripMarks(input.topic).slice(0, 100)}` : ""}\n\nTEXTE SOURCE :\n${source}${input.previous ? `\n\nSVG ACTUEL (à modifier) :\n${input.previous.slice(0, 20000)}\n\nMODIFICATION DEMANDÉE : ${stripMarks(input.instruction || "").slice(0, 300)}\nRéponds avec le graphique complet modifié.` : ""}`
  const raw = await ask(FIGURE_SYSTEM, user, 7000, 0.3), cut = raw.indexOf("---SVG---"), head = cut >= 0 ? raw.slice(0, cut) : raw, svgRaw = cut >= 0 ? raw.slice(cut + 9) : ""
  const meta = jsonOf(head); if (!svgRaw.trim() || !meta.title) throw new Error(str(meta.reason, 240) || "Claude n'a pas pu dessiner un graphique honnête avec ce texte (pas assez de données)")
  const digits = source.replace(/[\s  ]/g, "").replace(/,/g, "."), nums = [...new Set([...svgRaw.matchAll(/>\s*(-?\d+(?:[.,]\d+)?)\s*[%a-zéè€$ ]{0,6}\s*</g)].map(m => m[1].replace(",", ".")))]
  const unverified = nums.filter(n => n.length >= 2 && !new RegExp("(?<![\\d.])" + n.replace(/\./g, "\\.") + "(?![\\d])").test(digits)).slice(0, 12)
  return { title: str(meta.title, 200), reading: str(meta.reading, 600), unit: str(meta.unit, 20), rows: (Array.isArray(meta.rows) ? meta.rows : []).slice(0, 20).map((r: any) => ({ label: str(r?.label, 60), value: Number(r?.value) })).filter((r: { label: string; value: number }) => r.label && Number.isFinite(r.value)), svg: svgRaw.trim(), unverified, model: aiModel() }
}
