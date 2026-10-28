// Différence mot à mot (aperçu avant application) : plus longue sous-suite commune, bornée pour rester instantanée.
export type Seg = { t: "same" | "del" | "add"; v: string }
const tok = (s: string) => s.match(/\s+|[^\s]+/g) || []
export function wordDiff(a: string, b: string): Seg[] {
  const x = tok(a).slice(0, 600), y = tok(b).slice(0, 600), n = x.length, m = y.length
  const L: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = x[i] === y[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1])
  const out: Seg[] = [], push = (t: Seg["t"], v: string) => { const l = out[out.length - 1]; if (l && l.t === t) l.v += v; else out.push({ t, v }) }
  let i = 0, j = 0
  while (i < n && j < m) { if (x[i] === y[j]) { push("same", x[i]); i++; j++ } else if (L[i + 1][j] >= L[i][j + 1]) { push("del", x[i]); i++ } else { push("add", y[j]); j++ } }
  while (i < n) push("del", x[i++]); while (j < m) push("add", y[j++])
  return out
}
