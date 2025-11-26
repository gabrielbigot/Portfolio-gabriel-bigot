# 🔧 Documentation Technique - Système de Versionnement

## Quick Start

### 1. Configuration

Ajoutez dans `.env.local` :

```env
NOTION_VERSIONS_DATABASE_ID=your_database_id_here
```

### 2. Propriétés Notion requises

Database "Article Versions" :
- `Title` (title)
- `Slug` (text) - Doit correspondre au slug de l'article
- `Version Number` (number) - 1, 2, 3...
- `Version Label` (text) - "v1.0", "v2.0"...
- `Published Date` (date)
- `Is Current Version` (checkbox)
- `Change Summary` (text)
- `Status` (select: Published/Draft/Archived)

### 3. Usage basique

```typescript
import { getArticleVersions, getCurrentArticleVersion } from '@/lib/notion-versions'
import { compareVersions } from '@/lib/diff-engine'

// Récupérer toutes les versions d'un article
const versions = await getArticleVersions('article-slug')

// Récupérer la version actuelle
const current = await getCurrentArticleVersion('article-slug')

// Comparer deux versions
const v1 = await getArticleVersion('slug', 1)
const v2 = await getArticleVersion('slug', 2)
const diff = compareVersions(v1, v2)
```

---

## Types TypeScript

### ArticleVersion

```typescript
interface ArticleVersion {
  id: string
  articleSlug: string
  versionNumber: number
  versionLabel: string        // "v1.0", "v2.0"
  publishedDate: string
  isCurrentVersion: boolean
  changeSummary: string
  content: ContentBlock[]
  status: 'Published' | 'Draft' | 'Archived'
}
```

### ContentBlock

```typescript
type ContentBlock = {
  type: 'heading_1' | 'heading_2' | 'heading_3' | 'paragraph' |
        'bulleted_list' | 'numbered_list' | 'quote' | 'code' | ...
  text?: string
  items?: string[] | { text: string; checked: boolean }[]
  // ... autres propriétés selon le type
}
```

### BlockDiff

```typescript
interface BlockDiff {
  type: 'added' | 'removed' | 'modified' | 'unchanged'
  blockType: ContentBlock['type']
  oldContent?: ContentBlock
  newContent?: ContentBlock
  wordDiffs?: WordDiff[]      // Pour paragraphes modifiés
  index: number
}
```

---

## API Functions

### `lib/notion-versions.ts`

#### `getArticleVersions(slug: string): Promise<ArticleVersion[]>`
Récupère toutes les versions publiées d'un article, triées par numéro décroissant.

**Paramètres :**
- `slug` : Slug de l'article

**Retour :** Array de versions (vide si aucune version)

---

#### `getArticleVersion(slug: string, versionNumber: number): Promise<ArticleVersion | null>`
Récupère une version spécifique.

**Paramètres :**
- `slug` : Slug de l'article
- `versionNumber` : Numéro de version à récupérer

**Retour :** Version ou `null` si non trouvée

---

#### `getCurrentArticleVersion(slug: string): Promise<ArticleVersion | null>`
Récupère la version actuelle (celle avec `isCurrentVersion = true`).

**Paramètres :**
- `slug` : Slug de l'article

**Retour :** Version actuelle ou la plus récente si aucune n'est marquée

---

#### `articleHasVersions(slug: string): Promise<boolean>`
Vérifie si un article a plusieurs versions.

---

### `lib/diff-engine.ts`

#### `compareVersions(from: ArticleVersion, to: ArticleVersion, options?: DiffOptions): VersionDiff`
Compare deux versions et génère un diff détaillé.

**Paramètres :**
- `from` : Version de base
- `to` : Version à comparer
- `options` : Options de comparaison
  - `compareWords: boolean` - Activer diff mot-à-mot (défaut: true)
  - `ignoreWhitespace: boolean` - Ignorer espaces (défaut: false)

**Retour :**
```typescript
{
  fromVersion: ArticleVersion
  toVersion: ArticleVersion
  changes: BlockDiff[]
  summary: {
    added: number
    removed: number
    modified: number
  }
}
```

---

#### `compareWords(oldText: string, newText: string, options: DiffOptions): WordDiff[]`
Compare deux textes au niveau des mots.

---

#### `getChangeSummary(diff: VersionDiff): string`
Génère un résumé lisible des changements.

**Example :** "2 blocs ajoutés, 1 bloc supprimé, 3 blocs modifiés"

---

## Composants React

### `<DiffViewer />`

Affiche les différences entre deux versions.

```tsx
import DiffViewer from '@/components/DiffViewer'

<DiffViewer
  diff={versionDiff}
  showUnchanged={false}  // Masquer blocs inchangés
/>
```

**Props :**
- `diff: VersionDiff` - Résultat de `compareVersions()`
- `showUnchanged?: boolean` - Afficher blocs inchangés (défaut: false)

**Rendu :**
- Blocs ajoutés : fond vert, bordure verte
- Blocs supprimés : fond rouge, bordure rouge, texte barré
- Blocs modifiés : fond orange, highlighting mot-à-mot

---

### `<VersionTimeline />`

Timeline interactive des versions.

```tsx
import VersionTimeline from '@/components/VersionTimeline'

<VersionTimeline
  versions={allVersions}
  currentVersionNumber={2}
  articleSlug="article-slug"
/>
```

**Props :**
- `versions: ArticleVersion[]` - Toutes les versions
- `currentVersionNumber?: number` - Version à highlighter
- `articleSlug: string` - Slug pour générer les liens

---

### `<VersionBadge />`

Badge affichant le numéro de version.

```tsx
import VersionBadge from '@/components/VersionBadge'

<VersionBadge versionLabel="v2.0" />
```

---

## Routes & Pages

### `/blog/[slug]`
Article principal avec indicateur de version

**Nouvelles fonctionnalités ajoutées :**
- Badge de version actuelle
- Date de dernière mise à jour
- Lien vers historique (si versions multiples)

---

### `/blog/[slug]/versions`
Liste toutes les versions avec timeline interactive

**Features :**
- Timeline chronologique
- Badges "Actuelle" / "Plus récente" / "Originale"
- Liens vers chaque version
- Boutons de comparaison

---

### `/blog/[slug]/versions/[versionNumber]`
Affiche une version archivée spécifique

**Features :**
- Banner d'avertissement (version archivée)
- Navigation version précédente/suivante
- Lien vers comparaison
- Contenu exact de la version

---

### `/blog/[slug]/versions/compare?from=X&to=Y`
Compare deux versions avec diff visuel

**Query params :**
- `from` : Numéro de version de base (required)
- `to` : Numéro de version à comparer (required)

**Features :**
- Sélecteur de versions
- Résumé statistique
- Diff détaillé bloc par bloc
- Quick links vers autres comparaisons

---

## Algorithmes

### LCS (Longest Common Subsequence)

Utilisé pour trouver les blocs communs entre versions et minimiser le nombre de différences détectées.

**Complexité :** O(m × n) où m, n = nombre de blocs

**Avantage :** Détecte les réorganisations de contenu

---

### Levenshtein Distance

Calcule la similarité entre deux chaînes pour déterminer si des blocs sont "similaires" mais modifiés.

**Formule de similarité :**
```typescript
similarity = 1 - (levenshteinDistance / maxLength)
```

**Seuil :** Deux blocs sont considérés similaires si `similarity > 0.5`

---

### Word-level Diff

Pour les paragraphes modifiés, compare mot par mot en utilisant un LCS sur les tableaux de mots.

**Résultat :**
```typescript
[
  { text: "L'IA", type: "unchanged" },
  { text: "augmente", type: "removed" },
  { text: "améliore", type: "added" },
  { text: "la", type: "unchanged" },
  { text: "productivité", type: "unchanged" }
]
```

---

## Performance & Caching

### ISR (Incremental Static Regeneration)

Toutes les pages de versions utilisent ISR avec revalidation de 1 heure :

```typescript
export const revalidate = 3600
```

**Avantages :**
- Pages générées statiquement pour perf max
- Mise à jour automatique toutes les heures
- Pas de rebuild complet nécessaire

---

### Optimisations possibles

1. **Caching des diffs :**
   ```typescript
   // Stocker les diffs calculés en cache
   const cacheKey = `diff-${slug}-${from}-${to}`
   ```

2. **Lazy loading du contenu :**
   ```typescript
   // Charger le contenu complet seulement si nécessaire
   ```

3. **Pagination de la timeline :**
   ```typescript
   // Pour articles avec 50+ versions
   ```

---

## Tests

### Tester localement

1. Créer une database de test dans Notion
2. Ajouter quelques versions de test
3. Lancer le dev server :
   ```bash
   npm run dev
   ```
4. Visiter : `http://localhost:3000/blog/[slug]/versions`

### Cas de test importants

- [ ] Article sans versions (affiche message approprié)
- [ ] Article avec 1 seule version (pas de lien historique)
- [ ] Article avec multiples versions (timeline complète)
- [ ] Comparaison versions identiques (aucune différence)
- [ ] Comparaison avec blocs ajoutés uniquement
- [ ] Comparaison avec blocs supprimés uniquement
- [ ] Comparaison avec modifications textuelles

---

## Troubleshooting

### Debug : Versions pas récupérées

```typescript
// Ajouter logs
console.log('NOTION_VERSIONS_DATABASE_ID:', process.env.NOTION_VERSIONS_DATABASE_ID)
console.log('Versions récupérées:', versions)
```

### Debug : Diff vide

```typescript
// Vérifier contenu
console.log('From content blocks:', fromVersion.content.length)
console.log('To content blocks:', toVersion.content.length)
console.log('Diff changes:', diff.changes.length)
```

### Error: "Cannot find module '@/lib/types/article-version'"

**Solution :** Redémarrer le serveur dev après avoir créé de nouveaux fichiers.

---

## Contribution

### Ajouter un nouveau type de bloc

1. Ajouter le type dans `ContentBlock` (types/article-version.ts)
2. Implémenter le parsing dans `parseBlocksToContent()` (notion-versions.ts)
3. Ajouter le rendu dans `BlockContent` (DiffViewer.tsx)
4. Mettre à jour `getBlockTypeLabel()` pour le label français

### Améliorer l'algorithme de diff

Modifier `compareContentBlocks()` dans `lib/diff-engine.ts`

**Considérations :**
- Maintenir O(n²) max pour performance
- Tester avec des articles réels longs
- Valider les cas edge (blocs vides, contenus identiques)

---

## License

Système développé pour le portfolio de Gabriel Bigot - 2024
