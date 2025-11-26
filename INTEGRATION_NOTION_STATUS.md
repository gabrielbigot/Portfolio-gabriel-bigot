# État de l'intégration Notion

## ✅ Complété

### 1. Service d'intégration Notion (`lib/notion.ts`)
Fonctions créées :
- `getProjectsFromNotion()` - Récupère tous les projets
- `getBlogPostsFromNotion()` - Récupère tous les articles
- `getProjectBySlug(slug)` - Récupère un projet spécifique
- `getBlogPostBySlug(slug)` - Récupère un article spécifique

### 2. Configuration
- `.env.local.example` - Template de configuration
- Variables d'environnement nécessaires :
  - `NOTION_API_KEY`
  - `NOTION_PROJECTS_DATABASE_ID`
  - `NOTION_BLOG_DATABASE_ID`

### 3. Documentation
- `NOTION_SETUP.md` - Guide complet de configuration (étape par étape)
- `README-NOTION.md` - Guide d'utilisation quotidienne
- Structure des bases de données Notion détaillée

## ⏳ En cours

### Installation des dépendances
```bash
npm install @notionhq/client --legacy-peer-deps
```

## 📝 À faire pour finaliser l'intégration

### 1. Modifier les pages Next.js

Une fois les dépendances installées, vous devrez modifier les pages pour utiliser les données Notion :

#### `app/projects/page.tsx`
```typescript
import { getProjectsFromNotion } from "@/lib/notion"
import { projects as localProjects } from "@/lib/data" // Fallback

export default async function ProjectsPage() {
  // Try to fetch from Notion, fallback to local data
  let projects = []
  try {
    const notionProjects = await getProjectsFromNotion()
    projects = notionProjects.length > 0 ? notionProjects : localProjects
  } catch (error) {
    console.warn("Failed to fetch from Notion, using local data", error)
    projects = localProjects
  }

  return (
    // ... votre JSX existant
  )
}
```

#### `app/blog/page.tsx`
```typescript
import { getBlogPostsFromNotion } from "@/lib/notion"
import { blogPosts as localBlogPosts } from "@/lib/data"

export default async function BlogPage() {
  let blogPosts = []
  try {
    const notionPosts = await getBlogPostsFromNotion()
    blogPosts = notionPosts.length > 0 ? notionPosts : localBlogPosts
  } catch (error) {
    console.warn("Failed to fetch from Notion, using local data", error)
    blogPosts = localBlogPosts
  }

  return (
    // ... votre JSX existant
  )
}
```

#### `app/blog/[slug]/page.tsx`
```typescript
import { getBlogPostBySlug } from "@/lib/notion"
import { blogPosts } from "@/lib/data"

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  let post = null
  try {
    post = await getBlogPostBySlug(params.slug)
  } catch (error) {
    console.warn("Failed to fetch from Notion, using local data", error)
  }

  // Fallback to local data
  if (!post) {
    post = blogPosts.find((p) => p.slug === params.slug)
  }

  // ... reste du code
}
```

#### `app/projects/[slug]/page.tsx`
```typescript
import { getProjectBySlug } from "@/lib/notion"
import { projects } from "@/lib/data"

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  let project = null
  try {
    project = await getProjectBySlug(params.slug)
  } catch (error) {
    console.warn("Failed to fetch from Notion, using local data", error)
  }

  // Fallback to local data
  if (!project) {
    project = projects.find((p) => p.slug === params.slug)
  }

  // ... reste du code
}
```

### 2. Ajouter le revalidation dans Next.js

Pour que les données se mettent à jour automatiquement, ajoutez cette ligne au début de chaque page :

```typescript
export const revalidate = 3600 // Revalider toutes les heures
```

### 3. Créer vos bases de données Notion

Suivez le guide `NOTION_SETUP.md` pour :
1. Créer l'intégration Notion
2. Créer les 2 bases de données (Projets et Blog)
3. Partager les bases avec votre intégration
4. Récupérer les IDs des bases

### 4. Configurer les variables d'environnement

Créez `.env.local` à la racine du projet avec vos vraies valeurs :

```env
NOTION_API_KEY=secret_votre_token_ici
NOTION_PROJECTS_DATABASE_ID=xxxxx
NOTION_BLOG_DATABASE_ID=yyyyy
```

## Structure des bases de données Notion

### Base "Projets"

| Propriété | Type | Requis |
|-----------|------|--------|
| Title | Title | ✅ |
| Slug | Text | ✅ |
| ShortDescription | Text | ✅ |
| Category | Select | ✅ |
| Tags | Multi-select | ✅ |
| Date | Date | ✅ |
| Featured | Checkbox | - |
| Status | Select | ✅ |
| Company | Text | - |
| FullDescription | Text | - |
| Problem | Text | - |
| Solution | Text | - |
| Impact | Text | - |
| Technologies | Text | - |

**Important** : Le Status doit avoir les options : "Draft", "Published", "Archived"

### Base "Articles de Blog"

| Propriété | Type | Requis |
|-----------|------|--------|
| Title | Title | ✅ |
| Slug | Text | ✅ |
| Excerpt | Text | ✅ |
| Date | Date | ✅ |
| ReadingTime | Text | ✅ |
| Category | Select | ✅ |
| Featured | Checkbox | - |
| Status | Select | ✅ |

**Important** : Le contenu de l'article est écrit dans la page Notion elle-même

## Workflow complet

1. **Installation** (une fois)
   - Terminer l'installation npm
   - Créer l'intégration Notion
   - Créer les bases de données
   - Configurer `.env.local`

2. **Modification du code** (une fois)
   - Mettre à jour les pages Next.js pour utiliser Notion
   - Ajouter le revalidation

3. **Utilisation quotidienne**
   - Ajouter/modifier du contenu dans Notion
   - Changer Status à "Published"
   - Le portfolio se met à jour automatiquement

## Avantages de cette approche

✅ **Fallback automatique** : Si Notion n'est pas configuré ou ne répond pas, le site utilise les données locales
✅ **Pas de downtime** : Le site fonctionne toujours, même si Notion est hors ligne
✅ **Migration progressive** : Vous pouvez migrer le contenu progressivement vers Notion
✅ **Backup** : Les données locales servent de backup

## Prochaines étapes

1. Attendre la fin de l'installation npm
2. Créer vos bases de données Notion (suivre NOTION_SETUP.md)
3. Modifier les pages Next.js (code fourni ci-dessus)
4. Tester en local
5. Ajouter votre premier projet/article dans Notion
6. Vérifier que ça s'affiche correctement

## Besoin d'aide ?

- Documentation complète : `NOTION_SETUP.md`
- Guide utilisateur : `README-NOTION.md`
- Code source : `lib/notion.ts`
