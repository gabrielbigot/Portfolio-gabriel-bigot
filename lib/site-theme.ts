// Thème du site (content/site/theme.json) : couleurs claires / sombres, arrondi, police. Injecté en CSS dans le layout ; ne change rien tant
// que les valeurs sont celles de globals.css. Modifiable depuis l'éditeur direct (pastille « Thème »).
export type Theme = { light: Record<string, string>; dark: Record<string, string>; radius: string; font: string }

export const FONT_STACKS: Record<string, string> = {
  geist: "",
  serif: 'Athelas, Georgia, "Times New Roman", serif',
  sans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
}
const HEX = /^#[0-9a-fA-F]{3,8}$/
const vars = (m: Record<string, string>) => Object.entries(m).filter(([k, v]) => /^[a-z-]+$/.test(k) && HEX.test(v)).map(([k, v]) => `--${k}:${v};`).join("")

export function themeCss(t: Theme | undefined): string {
  if (!t) return ""
  const radius = /^[0-9.]+(rem|px)$/.test(t.radius || "") ? `--radius:${t.radius};` : ""
  const font = FONT_STACKS[t.font] ? `body,button,input,textarea,select{font-family:${FONT_STACKS[t.font]} !important}` : ""
  return `html:root{${vars(t.light || {})}${radius}}html.dark{${vars(t.dark || {})}}${font}`
}
