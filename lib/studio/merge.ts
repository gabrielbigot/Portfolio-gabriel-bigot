// Fusion à trois voies de contenus JSON (base commune, ma version, version publiée).
// Utilisée quand le site publié a changé pendant que le brouillon contenait des modifications : on fusionne champ par champ
// et on ne signale un conflit que si les deux côtés ont modifié la MÊME valeur différemment.
export type Json = null | boolean | number | string | Json[] | { [k: string]: Json }
export type Merge = { value: Json | undefined; conflicts: string[] }

const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
const isObj = (v: unknown): v is { [k: string]: Json } => !!v && typeof v === "object" && !Array.isArray(v)
const KEYS = ["id", "slug", "key"]

function identityKey(...lists: Json[][]): string | null {
  for (const k of KEYS) {
    if (lists.every(l => l.every(x => isObj(x) && typeof x[k] === "string" && x[k] !== "") && new Set(l.map(x => (x as any)[k])).size === l.length)) return k
  }
  return null
}

export function merge3(base: Json | undefined, ours: Json | undefined, theirs: Json | undefined, path = ""): Merge {
  if (eq(ours, theirs)) return { value: ours, conflicts: [] }
  if (eq(base, ours)) return { value: theirs, conflicts: [] }
  if (eq(base, theirs)) return { value: ours, conflicts: [] }
  const here = path || "(racine)"
  if (isObj(ours) && isObj(theirs) && (base === undefined || isObj(base))) {
    const out: { [k: string]: Json } = {}; const conflicts: string[] = []
    const keys = [...new Set([...Object.keys(ours), ...Object.keys(theirs), ...(isObj(base) ? Object.keys(base) : [])])]
    for (const k of keys) {
      const r = merge3(isObj(base) ? base[k] : undefined, ours[k], theirs[k], path ? `${path} › ${k}` : k)
      if (r.value !== undefined) out[k] = r.value; conflicts.push(...r.conflicts)
    }
    // ordre des clés : celui de ma version, puis les ajouts publiés
    const ordered: { [k: string]: Json } = {}; for (const k of [...Object.keys(ours), ...Object.keys(theirs)]) if (k in out && !(k in ordered)) ordered[k] = out[k]
    for (const k of Object.keys(out)) if (!(k in ordered)) ordered[k] = out[k]
    return { value: ordered, conflicts }
  }
  if (Array.isArray(ours) && Array.isArray(theirs) && (base === undefined || Array.isArray(base))) {
    const b = (base as Json[]) || []
    const key = identityKey(b, ours, theirs)
    if (key) {
      const by = (l: Json[]) => new Map(l.map(x => [(x as any)[key] as string, x]))
      const [mb, mo, mt] = [by(b), by(ours), by(theirs)]
      const ids = [...new Set([...mo.keys(), ...mt.keys(), ...mb.keys()])]
      const out = new Map<string, Json>(); const conflicts: string[] = []
      for (const id of ids) {
        const [x, o, t] = [mb.get(id), mo.get(id), mt.get(id)]
        const label = `${path ? path + " › " : ""}${id}`
        if (o !== undefined && t !== undefined) { const r = merge3(x, o, t, label); out.set(id, r.value as Json); conflicts.push(...r.conflicts) }
        else if (o !== undefined) { if (x === undefined || !eq(x, o)) { out.set(id, o); if (x !== undefined) conflicts.push(`${label} (supprimé côté publié, modifié chez vous)`) } /* sinon : supprimé côté publié, inchangé chez vous */ }
        else if (t !== undefined) { if (x === undefined || !eq(x, t)) { out.set(id, t); if (x !== undefined) conflicts.push(`${label} (supprimé chez vous, modifié côté publié)`) } }
      }
      const order = [...mo.keys(), ...mt.keys()].filter((v, i, a) => a.indexOf(v) === i && out.has(v))
      return { value: order.map(id => out.get(id)!), conflicts }
    }
    if (ours.every(x => typeof x !== "object" || x === null) && theirs.every(x => typeof x !== "object" || x === null) && b.every(x => typeof x !== "object" || x === null)) {
      // listes de valeurs simples : ajouts et retraits des deux côtés
      const removed = new Set([...b.filter(x => !ours.some(y => eq(x, y))), ...b.filter(x => !theirs.some(y => eq(x, y)))].map(x => JSON.stringify(x)))
      const merged = ours.filter(x => !removed.has(JSON.stringify(x)))
      for (const x of theirs) if (!merged.some(y => eq(x, y)) && !removed.has(JSON.stringify(x))) merged.push(x)
      return { value: merged, conflicts: [] }
    }
  }
  return { value: ours, conflicts: [here] } // même valeur modifiée des deux côtés : on garde la vôtre et on signale
}
