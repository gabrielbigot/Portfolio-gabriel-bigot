# Articles (dossiers sourcés)

Distincts des essais (`/blog`). Chaque article est une page HTML autonome (graphiques, sources) enrichie par le moteur de notes : notes de l'auteur, images, sous-articles récursifs.

## Où vit quoi
- `articles-src/<slug>/` — sources et construction (hors dépôt, skill `dossier-article`).
- `content/articles/<slug>/` — `article.json`, `build/` (HTML + assets), `annotations.json`, `annotation-images/`.
- `content/articles.json` — liste ; `status: "public"` = visible sur le site public après publication.
- `public/articles/` — **généré** au build (ignoré par git), uniquement pour les articles publics.

## Flux
1. Construire l'article dans `articles-src/`, puis `pnpm articles import <slug> [--rebuild]` (reste en **brouillon**).
2. Dans le studio (`STUDIO_MODE=1`, en local ou en ligne) : panneau « Articles (dossiers) » → « Ouvrir et annoter ». Sélectionner du texte pour créer une note, une image ou un sous-article. Tout est enregistré dans le brouillon du studio, comme le reste du site.
3. « Marquer comme public » règle le statut ; rien ne change sur le site public avant « Publier… » (un seul commit sur `main` : manifeste, notes, sous-articles, images).
4. Au build public, `pnpm articles build-public` génère `public/articles/` : article, notes dont le statut est « public », sous-articles publics, images utilisées.

## Édition directe (comme le reste du portfolio)
Dans le studio, `/articles/<slug>` et chaque sous-page (`/s/<id>`) sont éditables :
- **Texte** : cliquer un titre, paragraphe, puce ou légende, modifier, sortir du champ → enregistré. Mise en forme limitée (gras, italique, liens, pastilles de source conservées). `Échap` annule, `Entrée` valide.
- **Sections** : survoler → ↑ ↓, **Masquer** (récupérable via le bandeau « Rétablir »), **+ Section** (texte, image + texte, citation, liste), ⧉ dupliquer et Supprimer pour les sections ajoutées. La numérotation et le sommaire se recalculent.
- Pastille **✎ Éditer / Notes** en bas à gauche : « Notes » rend la sélection de texte aux notes, images et sous-articles.
- Stockage : `content/articles/<slug>/edits.json` (par page : texte, ordre, masquées, ajoutées), appliqué par `lib/articles/edits.mjs` à la copie privée **et** au build public. Un texte modifié dont l'original a changé (après un nouvel `import --rebuild`) est ignoré (liseré jaune en édition).
- Non modifiables : graphiques et tableaux de données (liés aux données de l'article) ; les sections d'origine se masquent mais ne se dupliquent pas.

## Règles
- Les échanges avec l'IA ne sont jamais conservés ni publiés (l'assistant IA a été retiré).
- `article.json` et `build/` vont dans le dépôt avec le code (commit manuel) ; le studio ne publie que manifeste, notes et images.
- Le dépôt est public : les fichiers d'un article en brouillon y seraient lisibles. Passez le dépôt en privé avant de les committer si cela compte.
- `pnpm articles list` résume l'état.
