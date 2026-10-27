// Stockage du studio : brouillon (ce que vous éditez) et publié (ce que le site public affiche).
//  - FsStore (développement local) : brouillon = fichiers du dossier, publié = dernier commit git.
//  - GithubStore (studio en ligne) : brouillon = branche « studio-draft », publié = branche « main ». « Publier » = un commit sur main
//    qui ne contient QUE les fichiers de contenu modifiés (content/site/*.json, public/uploads/*) ; Vercel redéploie le site public.
import fs from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"
import { merge3 } from "./merge"

export type Change = { path: string; status: "modified" | "added" | "deleted"; before: string | null; after: string | null; binary: boolean }
export type PublishResult = { ok: boolean; note: string; commit?: string }
export interface Store {
  name: "fs" | "github"
  readDraft(p: string): Promise<Buffer | null>
  readPublished(p: string): Promise<Buffer | null>
  writeDraft(p: string, data: Buffer | string): Promise<void>
  deleteDraft(p: string): Promise<void>
  /** données propres au studio (traces de l'IA…) : jamais publiées ; `.studio/<nom>.json` */
  readMeta(name: string): Promise<Buffer | null>
  writeMeta(name: string, data: string): Promise<void>
  changes(): Promise<Change[]>
  /** fichiers modifiés à la fois dans le brouillon et sur le site publié (fusion automatique impossible) */
  conflicts(): Promise<string[]>
  resolve(p: string, choice: "mine" | "theirs"): Promise<void>
  discard(p: string): Promise<void>
  publish(message: string): Promise<PublishResult>
}

export const META_RE = /^[a-z0-9-]{1,40}\.json$/
export const JSON_RE = /^content\/site\/[a-z0-9-]+\.json$/
export const UPLOAD_RE = /^public\/uploads\/[A-Za-z0-9._-]{1,120}$/
// images statiques du site (logos, captures de projets, visuels de pages) : remplaçables à l'identique depuis l'éditeur direct
export const ASSET_RE = /^public\/(about|projects|companies|portfolio|newsletters)\/([A-Za-z0-9._-]{1,80}\/){0,3}[A-Za-z0-9._ -]{1,120}\.(png|jpe?g|webp|gif|avif)$/i
// articles : notes / sous-articles / images attachées (content/articles/<slug>/…) et liste des articles publiés
export const ART_ANN_RE = /^content\/articles\/[a-z0-9-]{3,90}\/annotations\.json$/
export const ART_IMG_RE = /^content\/articles\/[a-z0-9-]{3,90}\/annotation-images\/[a-z0-9]{6,40}\.(png|jpe?g|webp|gif)$/
export const ART_EDITS_RE = /^content\/articles\/[a-z0-9-]{3,90}\/edits\.json$/
// fichiers de base d'un dossier créé depuis le studio (les dossiers importés par `pnpm articles import` restent du code, committé à la main)
export const ART_BASE_RE = /^content\/articles\/[a-z0-9-]{3,90}\/(article\.json|build\/index\.html|build\/data\/report-data\.js)$/
export const ART_MANIFEST = "content/articles.json"
export const isAllowedPath = (p: string) => JSON_RE.test(p) || UPLOAD_RE.test(p) || ASSET_RE.test(p) || ART_ANN_RE.test(p) || ART_IMG_RE.test(p) || ART_EDITS_RE.test(p) || ART_BASE_RE.test(p) || p === ART_MANIFEST
const isBinary = (p: string) => !p.endsWith(".json")
const text = (b: Buffer | null) => (b ? b.toString("utf8") : null)

/* ---------- local : fichiers + git ---------- */
class FsStore implements Store {
  name = "fs" as const
  root = process.cwd()
  git = (...a: string[]) => spawnSync("git", a, { cwd: this.root, encoding: "buffer" })
  async readDraft(p: string) { const f = path.join(this.root, p); return fs.existsSync(f) ? fs.readFileSync(f) : null }
  async readPublished(p: string) { const r = this.git("show", `HEAD:${p}`); return r.status === 0 ? (r.stdout as Buffer) : null }
  async writeDraft(p: string, data: Buffer | string) { const f = path.join(this.root, p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, data) }
  async deleteDraft(p: string) { fs.rmSync(path.join(this.root, p), { force: true }) }
  async readMeta(name: string) { if (!META_RE.test(name)) return null; const f = path.join(this.root, ".studio", name); return fs.existsSync(f) ? fs.readFileSync(f) : null }
  async writeMeta(name: string, data: string) { if (!META_RE.test(name)) throw new Error("nom refusé"); const f = path.join(this.root, ".studio", name); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, data) }
  private candidates() {
    const out = new Set<string>()
    const ls = (d: string, re: RegExp) => { const dir = path.join(this.root, d); if (fs.existsSync(dir)) for (const n of fs.readdirSync(dir)) if (re.test(`${d}/${n}`)) out.add(`${d}/${n}`) }
    ls("content/site", JSON_RE); ls("public/uploads", UPLOAD_RE)
    if (fs.existsSync(path.join(this.root, ART_MANIFEST))) out.add(ART_MANIFEST)
    const ad = path.join(this.root, "content/articles"); if (fs.existsSync(ad)) for (const sl of fs.readdirSync(ad)) { if (ART_ANN_RE.test(`content/articles/${sl}/annotations.json`) && fs.existsSync(path.join(ad, sl, "annotations.json"))) out.add(`content/articles/${sl}/annotations.json`); if (fs.existsSync(path.join(ad, sl, "edits.json"))) out.add(`content/articles/${sl}/edits.json`); try { if (JSON.parse(fs.readFileSync(path.join(ad, sl, "article.json"), "utf8")).createdInStudio) for (const b of ["article.json", "build/index.html", "build/data/report-data.js"]) if (fs.existsSync(path.join(ad, sl, b))) out.add(`content/articles/${sl}/${b}`) } catch { /* pas un dossier du studio */ } ls(`content/articles/${sl}/annotation-images`, ART_IMG_RE) }
    const tracked = this.git("ls-tree", "-r", "--name-only", "HEAD", "--", "content/site", "public/uploads", "content/articles.json", "content/articles").stdout.toString().split("\n").filter(Boolean)
    tracked.filter(isAllowedPath).forEach(p => out.add(p))
    // images statiques remplacées (modifiées ou nouvelles)
    this.git("status", "--porcelain", "-uall", "--", "public/about", "public/projects", "public/companies", "public/portfolio", "public/newsletters").stdout.toString().split("\n").filter(Boolean).forEach(l => { const f = l.slice(3).trim().replace(/^"|"$/g, ""); if (ASSET_RE.test(f)) out.add(f) })
    return [...out]
  }
  async changes() {
    const res: Change[] = []
    for (const p of this.candidates()) {
      const [d, pub] = [await this.readDraft(p), await this.readPublished(p)]
      if (d && pub && d.equals(pub)) continue
      if (!d && !pub) continue
      res.push({ path: p, status: !pub ? "added" : !d ? "deleted" : "modified", before: isBinary(p) ? null : text(pub), after: isBinary(p) ? null : text(d), binary: isBinary(p) })
    }
    return res.sort((a, b) => a.path.localeCompare(b.path))
  }
  async conflicts() { return [] as string[] } // en local, git gère la divergence
  async resolve() { throw new Error("Pas de conflit en stockage local.") }
  async discard(p: string) {
    const pub = await this.readPublished(p); const f = path.join(this.root, p)
    if (pub) { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, pub) }
    else if (UPLOAD_RE.test(p) || ART_IMG_RE.test(p)) fs.rmSync(f, { force: true }) // image jamais publiée : on la retire
    else throw new Error("Ce contenu n'a pas encore de version publiée (jamais commité) : rien à restaurer. Commitez content/site/ une première fois.")
  }
  async publish(message: string): Promise<PublishResult> {
    const ch = await this.changes(); if (!ch.length) return { ok: true, note: "Rien à publier." }
    const paths = ch.map(c => c.path)
    this.git("add", "-A", "--", ...paths)
    const c = this.git("commit", "-m", message, "--", ...paths)
    return c.status === 0 ? { ok: true, note: "Commit local créé (contenu uniquement). Poussez la branche pour mettre en ligne : git push.", commit: this.git("rev-parse", "--short", "HEAD").stdout.toString().trim() } : { ok: false, note: (c.stdout.toString() + c.stderr.toString()).trim() }
  }
}

/* ---------- en ligne : API GitHub ---------- */
class GithubStore implements Store {
  name = "github" as const
  token = process.env.GITHUB_TOKEN || ""
  repo = process.env.GITHUB_REPO || "gabrielbigot/Portfolio-gabriel-bigot"
  main = process.env.PUBLISH_BRANCH || "main"
  draft = process.env.DRAFT_BRANCH || "studio-draft"
  cache = new Map<string, { t: number; v: Buffer | null }>()
  private async api(p: string, init: RequestInit = {}, raw = false) {
    const r = await fetch(`${process.env.GITHUB_API_URL || "https://api.github.com"}/repos/${this.repo}${p}`, { ...init, cache: "no-store", headers: { Authorization: `Bearer ${this.token}`, Accept: raw ? "application/vnd.github.raw" : "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json", ...(init.headers || {}) } })
    return r
  }
  private async json(p: string, init?: RequestInit) { const r = await this.api(p, init); if (!r.ok) throw new Error(`GitHub ${r.status} ${p.split("?")[0]} : ${(await r.text()).slice(0, 200)}`); return r.json() }
  private enc = (p: string) => p.split("/").map(encodeURIComponent).join("/")
  private CONFLICTS = ".studio/conflicts.json" // sur la branche brouillon seulement : jamais publié (hors chemins autorisés)
  private async blobSha(content: Buffer) { return (await this.json(`/git/blobs`, { method: "POST", body: JSON.stringify({ content: content.toString("base64"), encoding: "base64" }) })).sha as string }
  async conflicts(): Promise<string[]> { const b = await this.read(this.draft, this.CONFLICTS); try { return b ? JSON.parse(b.toString("utf8")) : [] } catch { return [] } }
  /**
   * Met le brouillon à niveau avec le site publié : si `main` a avancé (autre publication, modification faite ailleurs), chaque fichier de
   * contenu est repris, ou fusionné champ par champ avec vos modifications. Seules des modifications du MÊME champ des deux côtés
   * donnent un conflit (votre version est gardée et le fichier est signalé). Le code de `main` n'est jamais touché.
   */
  async reconcile() {
    const r = await this.api(`/git/ref/heads/${this.draft}`)
    if (!r.ok) { const m = await this.json(`/git/ref/heads/${this.main}`); await this.json(`/git/refs`, { method: "POST", body: JSON.stringify({ ref: `refs/heads/${this.draft}`, sha: m.object.sha }) }); return }
    const draftHead = (await r.json()).object.sha as string
    const cmp = await this.json(`/compare/${this.draft}...${this.main}`)
    if (!cmp.ahead_by) return
    const baseSha = cmp.merge_base_commit.sha as string
    const dcmp = await this.json(`/compare/${baseSha}...${this.draft}`)
    const paths = [...new Set<string>([...(cmp.files || []), ...(dcmp.files || [])].map((f: any) => f.filename).filter(isAllowedPath))]
    const same = (x: Buffer | null, y: Buffer | null) => (x === null && y === null) || (!!x && !!y && x.equals(y))
    const overrides: { path: string; content: Buffer | null }[] = []; const found: string[] = []
    for (const p of paths) {
      const [b, m, d] = await Promise.all([this.read(baseSha, p), this.read(this.main, p), this.read(this.draft, p)])
      let result: Buffer | null
      if (same(d, b)) result = m
      else if (same(m, b) || same(m, d)) result = d
      else if (JSON_RE.test(p) && b && m && d) {
        try { const g = merge3(JSON.parse(b.toString("utf8")), JSON.parse(d.toString("utf8")), JSON.parse(m.toString("utf8"))); result = Buffer.from(JSON.stringify(g.value, null, 2) + "\n"); if (g.conflicts.length) found.push(p) } catch { result = d; found.push(p) }
      } else { result = d; found.push(p) }
      if (!same(result, m)) overrides.push({ path: p, content: result })
    }
    const prev = await this.conflicts(); const all = [...new Set([...prev, ...found])]
    const entries: any[] = []
    for (const o of overrides) entries.push({ path: o.path, mode: "100644", type: "blob", sha: o.content ? await this.blobSha(o.content) : null })
    const trace = await this.read(this.draft, ".studio/ai-trace.json").catch(() => null); if (trace) entries.push({ path: ".studio/ai-trace.json", mode: "100644", type: "blob", sha: await this.blobSha(trace) }) // la fusion repart de `main` : on reporte les traces de l'IA
    if (all.length) entries.push({ path: this.CONFLICTS, mode: "100644", type: "blob", sha: await this.blobSha(Buffer.from(JSON.stringify(all))) })
    const mainHead = (await this.json(`/git/ref/heads/${this.main}`)).object.sha as string
    const base = await this.json(`/git/commits/${mainHead}`)
    const tree = await this.json(`/git/trees`, { method: "POST", body: JSON.stringify({ base_tree: base.tree.sha, tree: entries }) })
    const commit = await this.json(`/git/commits`, { method: "POST", body: JSON.stringify({ message: "studio : synchroniser avec le site publié", tree: tree.sha, parents: [draftHead, mainHead] }) })
    await this.json(`/git/refs/heads/${this.draft}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha }) })
    this.cache.clear()
  }
  async resolve(p: string, choice: "mine" | "theirs") {
    if (!isAllowedPath(p)) throw new Error("chemin refusé")
    if (choice === "theirs") { const m = await this.readPublished(p); if (m) await this.putFile(p, m); else if (UPLOAD_RE.test(p)) await this.discard(p) }
    const left = (await this.conflicts()).filter(x => x !== p); await this.saveConflicts(left)
  }
  private async saveConflicts(list: string[]) {
    const cur = await this.api(`/contents/${this.enc(this.CONFLICTS)}?ref=${encodeURIComponent(this.draft)}`); const sha = cur.ok ? (await cur.json()).sha : undefined
    if (!list.length) { if (sha) await this.json(`/contents/${this.enc(this.CONFLICTS)}`, { method: "DELETE", body: JSON.stringify({ message: "studio : conflits résolus", sha, branch: this.draft }) }) }
    else await this.json(`/contents/${this.enc(this.CONFLICTS)}`, { method: "PUT", body: JSON.stringify({ message: "studio : conflits", content: Buffer.from(JSON.stringify(list)).toString("base64"), branch: this.draft, ...(sha ? { sha } : {}) }) })
    this.cache.delete(`${this.draft}:${this.CONFLICTS}`)
  }
  private async read(ref: string, p: string, ttl = 0) {
    const k = `${ref}:${p}`; const c = this.cache.get(k); if (ttl && c && Date.now() - c.t < ttl) return c.v
    const r = await this.api(`/contents/${this.enc(p)}?ref=${encodeURIComponent(ref)}`, {}, true)
    const v = r.status === 404 ? null : r.ok ? Buffer.from(await r.arrayBuffer()) : (() => { throw new Error(`GitHub ${r.status} lecture ${p}`) })()
    if (ttl) this.cache.set(k, { t: Date.now(), v }); return v
  }
  async readDraft(p: string) { return this.read(this.draft, p, 2500).catch(async () => this.read(this.main, p)) }
  async readPublished(p: string) { return this.read(this.main, p) }
  async readMeta(name: string) { if (!META_RE.test(name)) return null; return this.read(this.draft, `.studio/${name}`, 1500).catch(() => null) }
  async writeMeta(name: string, data: string) { if (!META_RE.test(name)) throw new Error("nom refusé"); await this.reconcile(); await this.putFile(`.studio/${name}`, Buffer.from(data)) }
  async writeDraft(p: string, data: Buffer | string) { await this.reconcile(); await this.putFile(p, Buffer.from(data)) }
  async deleteDraft(p: string) {
    await this.reconcile(); const cur = await this.api(`/contents/${this.enc(p)}?ref=${encodeURIComponent(this.draft)}`)
    if (cur.ok) await this.json(`/contents/${this.enc(p)}`, { method: "DELETE", body: JSON.stringify({ message: `studio : supprimer ${p}`, sha: (await cur.json()).sha, branch: this.draft }) }); this.cache.delete(`${this.draft}:${p}`)
  }
  private async putFile(p: string, data: Buffer) {
    const cur = await this.api(`/contents/${this.enc(p)}?ref=${encodeURIComponent(this.draft)}`)
    const sha = cur.ok ? (await cur.json()).sha : undefined
    await this.json(`/contents/${this.enc(p)}`, { method: "PUT", body: JSON.stringify({ message: `studio : ${p}`, content: data.toString("base64"), branch: this.draft, ...(sha ? { sha } : {}) }) })
    this.cache.delete(`${this.draft}:${p}`)
  }
  private async files() {
    const cmp = await this.json(`/compare/${this.main}...${this.draft}`)
    return (cmp.files || []).filter((f: any) => isAllowedPath(f.filename)) as { filename: string; status: string; sha: string }[]
  }
  async changes() {
    await this.reconcile()
    const out: Change[] = []
    for (const f of await this.files()) {
      const status = f.status === "added" ? "added" : f.status === "removed" ? "deleted" : "modified"
      const [b, a] = [await this.readPublished(f.filename), await this.read(this.draft, f.filename)]
      out.push({ path: f.filename, status, before: isBinary(f.filename) ? null : text(b), after: isBinary(f.filename) ? null : text(a), binary: isBinary(f.filename) })
    }
    return out.sort((a, b) => a.path.localeCompare(b.path))
  }
  async discard(p: string) {
    const pub = await this.readPublished(p)
    if (pub) await this.writeDraft(p, pub)
    else if (!UPLOAD_RE.test(p) && !ART_IMG_RE.test(p)) throw new Error("Ce contenu n'a pas de version publiée : rien à restaurer.")
    else { const cur = await this.api(`/contents/${this.enc(p)}?ref=${encodeURIComponent(this.draft)}`); if (cur.ok) await this.json(`/contents/${this.enc(p)}`, { method: "DELETE", body: JSON.stringify({ message: `studio : annuler ${p}`, sha: (await cur.json()).sha, branch: this.draft }) }); this.cache.delete(`${this.draft}:${p}`) }
  }
  async publish(message: string): Promise<PublishResult> {
    await this.reconcile()
    const pending = await this.conflicts(); if (pending.length) return { ok: false, note: `Résolvez d'abord ${pending.length} conflit(s) : ${pending.join(", ")}` }
    const files = await this.files(); if (!files.length) return { ok: true, note: "Rien à publier." }
    const head = await this.json(`/git/ref/heads/${this.main}`); const base = await this.json(`/git/commits/${head.object.sha}`)
    const tree = await this.json(`/git/trees`, { method: "POST", body: JSON.stringify({ base_tree: base.tree.sha, tree: files.map(f => ({ path: f.filename, mode: "100644", type: "blob", sha: f.status === "removed" ? null : f.sha })) }) })
    const commit = await this.json(`/git/commits`, { method: "POST", body: JSON.stringify({ message, tree: tree.sha, parents: [head.object.sha] }) })
    await this.json(`/git/refs/heads/${this.main}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha }) })
    await this.json(`/git/refs/heads/${this.draft}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha, force: true }) }) // le brouillon repart de ce qui vient d'être publié
    this.cache.clear()
    return { ok: true, note: "Publié : Vercel redéploie le site public (environ une minute).", commit: commit.sha.slice(0, 7) }
  }
}

let singleton: Store | null = null
export function getStore(): Store {
  if (singleton) return singleton
  const backend = process.env.STUDIO_BACKEND || (process.env.GITHUB_TOKEN ? "github" : "fs")
  if (backend === "fs") { if (process.env.NODE_ENV === "production") throw new Error("Le stockage local n'est disponible qu'en développement."); singleton = new FsStore() }
  else { if (!process.env.GITHUB_TOKEN) throw new Error("GITHUB_TOKEN manquant (jeton d'accès fin, droit « Contents » en lecture/écriture sur le dépôt)."); singleton = new GithubStore() }
  return singleton
}

const jsonCache = new Map<string, { t: number; v: unknown }>()
/** Lecture du brouillon d'un fichier de contenu (undefined si absent) — utilisé par le chargeur du site en mode studio. */
export async function readDraftJson(file: string): Promise<unknown | undefined> {
  const p = `content/site/${file}`; const c = jsonCache.get(p)
  if (c && Date.now() - c.t < (getStore().name === "fs" ? 0 : 1500)) return c.v
  const b = await getStore().readDraft(p); const v = b ? JSON.parse(b.toString("utf8")) : undefined
  jsonCache.set(p, { t: Date.now(), v }); return v
}
export const invalidateDraftCache = () => jsonCache.clear()
