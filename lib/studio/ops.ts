// Opérations sur un contenu JSON (édition directe sur le site) : modifier une valeur, supprimer / déplacer / dupliquer un élément de liste.
export type Json = null | boolean | number | string | Json[] | { [k: string]: Json }
export type Op =
  | { op: "set"; path: string[]; value: Json }
  | { op: "remove"; path: string[] }
  | { op: "move"; path: string[]; to: number }
  | { op: "duplicate"; path: string[] }
  | { op: "put"; path: string[]; value: Json } // crée ou remplace une clé d'objet
  | { op: "insert"; path: string[]; index?: number; value: Json } // insère dans une liste (path = la liste)

const BAD = new Set(["__proto__", "constructor", "prototype"])
const isIdx = (s: string) => /^\d+$/.test(s)

function walk(root: Json, path: string[]): { parent: any; last: string } {
  if (!path.length) throw new Error("chemin vide")
  let cur: any = root
  for (const seg of path.slice(0, -1)) {
    if (BAD.has(seg)) throw new Error("chemin refusé")
    if (cur === null || typeof cur !== "object" || !(seg in cur)) throw new Error("chemin introuvable : " + path.join(" › "))
    cur = cur[seg]
  }
  const last = path[path.length - 1]; if (BAD.has(last) || cur === null || typeof cur !== "object") throw new Error("chemin introuvable")
  return { parent: cur, last }
}

export function applyOp(data: Json, op: Op): Json {
  const root: Json = JSON.parse(JSON.stringify(data))
  if (op.op === "insert") {
    let cur: any = root; for (const seg of op.path) { if (BAD.has(seg) || cur === null || typeof cur !== "object" || !(seg in cur)) throw new Error("chemin introuvable : " + op.path.join(" › ")); cur = cur[seg] }
    if (!Array.isArray(cur)) throw new Error("ce n'est pas une liste")
    const i = op.index === undefined ? cur.length : Math.max(0, Math.min(cur.length, op.index)); cur.splice(i, 0, JSON.parse(JSON.stringify(op.value))); return root
  }
  if (op.op === "put") {
    const { parent, last } = walk(root, op.path)
    if (Array.isArray(parent)) throw new Error("« put » s'applique à un objet")
    parent[last] = JSON.parse(JSON.stringify(op.value)); return root
  }
  const { parent, last } = walk(root, op.path)
  if (op.op === "set") {
    if (Array.isArray(parent) ? !isIdx(last) || +last >= parent.length : !(last in parent)) throw new Error("champ introuvable : " + op.path.join(" › "))
    if (typeof parent[last] !== typeof op.value || Array.isArray(parent[last]) !== Array.isArray(op.value)) throw new Error("type de valeur différent")
    parent[last] = op.value; return root
  }
  if (op.op === "remove" && !Array.isArray(parent)) { if (!(last in parent)) throw new Error("clé introuvable"); delete parent[last]; return root }
  if (!Array.isArray(parent) || !isIdx(last) || +last >= parent.length) throw new Error("ce n'est pas un élément de liste")
  const i = +last
  if (op.op === "remove") { parent.splice(i, 1); return root }
  if (op.op === "move") { const j = Math.max(0, Math.min(parent.length - 1, op.to)); const [x] = parent.splice(i, 1); parent.splice(j, 0, x); return root }
  if (op.op === "duplicate") {
    const copy = JSON.parse(JSON.stringify(parent[i]))
    if (copy && typeof copy === "object" && !Array.isArray(copy)) {
      // identifiants uniques pour la copie (les pages de projet / d'essai sont indexées par slug)
      const taken = (k: string, v: string) => parent.some((o: any) => o && o[k] === v)
      for (const k of ["slug", "id"]) if (typeof copy[k] === "string" && copy[k]) { let n = 2, v = `${copy[k]}-copie`; while (taken(k, v)) v = `${copy[k]}-copie-${n++}`; copy[k] = v }
      if (typeof copy.featured === "boolean") copy.featured = false
    }
    parent.splice(i + 1, 0, copy); return root
  }
  throw new Error("opération inconnue")
}
