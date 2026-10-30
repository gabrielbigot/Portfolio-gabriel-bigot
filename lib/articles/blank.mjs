// Dossier vierge créé depuis le studio : même squelette que les dossiers du skill « dossier-article » (couverture, sommaire, deux sections,
// registre vide), avec le moteur d'affichage partagé dans content/articles/_template/build/ (assets/, vendor/).
const esc = t => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
/** @param {{ slug: string, title: string, subtitle: string, date: string, tags?: string[], series?: string, summary?: string, readingMinutes?: number }} o */
export function blankDossier(o) {
  const kicker = o.series === "Essais" ? "Essai" : o.series === "Dossiers" ? "Dossier" : "Article"
  const long = new Date(o.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.subtitle)}">
<meta name="color-scheme" content="light dark">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@500;600&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap">
<link rel="stylesheet" href="assets/article.css">
</head>
<body style="margin:0">
<article class="vra" data-autostart${o.series === "Essais" ? ' data-kind="essay"' : ""}>
<div class="vra-progress" aria-hidden="true"><i></i></div>

<header class="vra-cover">
  <p class="vra-kicker">${esc(kicker)}</p>
  <h1>${esc(o.title)}</h1>
  <p class="vra-dek">${esc(o.subtitle || "Le chapô : la question posée, pourquoi maintenant, ce que ce dossier apporte.")}</p>
  <p class="vra-byline"><span>Par <strong>Gabriel Bigot</strong></span><span>Mis à jour le ${esc(long)}</span></p>
  <div class="vra-toolbar"><button type="button" data-theme-toggle aria-pressed="false">Thème clair / sombre</button></div>
</header>

<div class="vra-shell">
<nav class="vra-toc" aria-label="Sommaire" data-open="false">
  <button type="button" class="vra-toc-toggle" data-toc-toggle aria-expanded="false">Sommaire</button>
  <small>Sommaire</small>
  <ol></ol>
</nav>

<main class="vra-main" id="contenu">

</main>
</div>

<footer class="vra-foot">
  <p>${o.series === "Essais" ? `« ${esc(o.title)} », essai de Gabriel Bigot, ${esc(long)}. Ce texte exprime des convictions personnelles ; le niveau de preuve est précisé dans le texte.` : `« ${esc(o.title)} » — dossier de Gabriel Bigot, ${esc(long)}. Ce dossier ne constitue pas un conseil financier ou juridique.`}</p>
</footer>

<aside id="vra-evidence" role="dialog" aria-label="Fiche de source" hidden>
  <button type="button" class="ev-close" aria-label="Fermer la fiche">×</button>
  <div class="ev-body"></div>
</aside>
</article>

<script src="vendor/d3.min.js"></script>
<script src="data/report-data.js"></script>
<script src="assets/charts.js"></script>
<script src="assets/charts-extra.js"></script>
<script src="assets/charts-more.js"></script>
<script src="assets/article.js"></script>
<script src="assets/explainers.js"></script>
<script src="assets/annotate.js"></script>
</body>
</html>
`
  const meta = { slug: o.slug, title: o.title, subtitle: o.subtitle, summary: o.summary || "", language: "fr", author: "Gabriel Bigot", published: o.date, updated: o.date, tags: o.tags || [], series: o.series || "Dossiers", cover: null, status: "draft", words: 0, readingMinutes: o.readingMinutes || 1, sourceCount: 0, createdInStudio: true }
  const data = `window.VRA_DATA = ${JSON.stringify({ meta, evidence: [], figures: {} })};\n`
  return { html, meta, data }
}

/** Sections de départ (écrites dans l'éditeur d'écriture, donc modifiables et réordonnables) : l'essentiel, comment lire, méthode et limites */
export function starterSections() {
  return {
    order: ["x-essentiel", "x-methode"], hidden: [],
    added: [
      { id: "x-essentiel", kind: "blocks", title: "L'essentiel", blocks: [
        { type: "lede", text: "La réponse directe à la question du dossier, en quelques phrases : ce qui est établi, ce qui est contesté, ce qui reste inconnu." },
        { type: "p", text: "Un premier paragraphe. Tapez / pour ajouter un titre, une liste, un tableau, un graphique, une source ou un encadré." },
        { type: "callout", variant: "keep", title: "Comment lire ce dossier", text: "Les figures encodent l'état de la preuve : **réel**, **estimation**, **prévision**, **calculé**, **affirmation**, **lacune**. Les pastilles K renvoient à une source datée ; les opinions de l'auteur sont dans des encadrés « Position de l'auteur »." },
      ] },
      { id: "x-methode", kind: "blocks", title: "Méthode et limites", blocks: [
        { type: "p", text: "Comment ce dossier a été construit : quelles sources ont été lues, lesquelles n'ont pas pu l'être, ce qui n'a pas été vérifié." },
        { type: "callout", variant: "opinion", title: "Position de l'auteur", text: "Les opinions de l'auteur sont séparées des faits, dans ce type d'encadré." },
      ] },
    ],
  }
}
