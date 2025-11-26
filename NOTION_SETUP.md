# Configuration Notion pour votre Portfolio

Ce guide vous explique comment configurer Notion pour gérer le contenu de votre portfolio (projets et articles de blog).

## Étape 1 : Créer une intégration Notion

1. Allez sur [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Cliquez sur "+ New integration"
3. Donnez un nom à votre intégration (ex: "Portfolio Integration")
4. Sélectionnez le workspace où vous voulez créer vos bases de données
5. Cliquez sur "Submit"
6. Copiez le **"Internal Integration Token"** (commence par `secret_...`)

## Étape 2 : Créer les bases de données Notion

### Base de données "Projets"

Créez une nouvelle base de données avec les propriétés suivantes :

| Propriété | Type | Description |
|-----------|------|-------------|
| **Title** | Title | Titre du projet |
| **Slug** | Text | URL-friendly slug (ex: "accounting-app") |
| **ShortDescription** | Text | Description courte (1-2 lignes) |
| **FullDescription** | Text | Description complète |
| **Category** | Select | Catégorie (ex: "Automatisation", "IA", "Web") |
| **Tags** | Multi-select | Tags du projet (ex: "Python", "Flask", "IA") |
| **Date** | Date | Date du projet |
| **Company** | Text | Entreprise/client |
| **Featured** | Checkbox | Afficher en vedette ? |
| **Status** | Select | Options: "Draft", "Published", "Archived" |
| **Image** | URL | URL de l'image du projet |
| **Problem** | Text | Problème résolu |
| **Solution** | Text | Solution apportée |
| **Impact** | Text | Liste des impacts (un par ligne) |
| **Technologies** | Text | Technologies utilisées (une par ligne) |
| **Challenges** | Text | Défis rencontrés (un par ligne) |
| **Learnings** | Text | Apprentissages (un par ligne) |

### Base de données "Articles de Blog"

Créez une nouvelle base de données avec les propriétés suivantes :

| Propriété | Type | Description |
|-----------|------|-------------|
| **Title** | Title | Titre de l'article |
| **Slug** | Text | URL-friendly slug (ex: "ia-pme-transformation") |
| **Excerpt** | Text | Extrait/résumé de l'article |
| **Date** | Date | Date de publication |
| **ReadingTime** | Text | Temps de lecture (ex: "8 min") |
| **Category** | Select | Catégorie (ex: "IA & Business", "Technique") |
| **Featured** | Checkbox | Afficher en vedette ? |
| **Status** | Select | Options: "Draft", "Published", "Archived" |

**Important** : Pour les articles, le contenu complet doit être écrit dans la page Notion elle-même, en utilisant les blocs Notion (titres, paragraphes, listes, citations, code).

## Étape 3 : Partager les bases de données avec l'intégration

Pour chaque base de données :

1. Ouvrez la base de données dans Notion
2. Cliquez sur les 3 points (...) en haut à droite
3. Cliquez sur "+ Add connections"
4. Sélectionnez votre intégration ("Portfolio Integration")
5. Cliquez sur "Confirm"

## Étape 4 : Récupérer les IDs des bases de données

Pour chaque base de données :

1. Ouvrez la base de données en pleine page
2. Regardez l'URL dans votre navigateur
3. L'URL ressemble à : `https://www.notion.so/workspace/XXXXX?v=YYYYY`
4. Copiez la partie `XXXXX` (entre le dernier `/` et le `?`) - c'est votre Database ID

## Étape 5 : Configurer les variables d'environnement

1. Dans votre projet, créez un fichier `.env.local` (à la racine de `minimal-portfolio/`)
2. Copiez le contenu de `.env.local.example`
3. Remplacez les valeurs par les vôtres :

```env
NOTION_API_KEY=secret_votre_token_ici
NOTION_PROJECTS_DATABASE_ID=votre_projects_database_id_ici
NOTION_BLOG_DATABASE_ID=votre_blog_database_id_ici
```

## Étape 6 : Tester la connexion

Lancez votre application en mode développement :

```bash
npm run dev
```

Visitez votre portfolio et vérifiez que :
- Les projets s'affichent correctement
- Les articles de blog s'affichent correctement

## Comment ajouter du contenu

### Ajouter un nouveau projet

1. Ouvrez votre base de données "Projets" dans Notion
2. Cliquez sur "+ New" pour créer une nouvelle entrée
3. Remplissez tous les champs
4. Changez le "Status" à "Published"
5. Rafraîchissez votre portfolio (il peut y avoir un délai de quelques secondes)

### Ajouter un nouvel article

1. Ouvrez votre base de données "Articles de Blog" dans Notion
2. Cliquez sur "+ New" pour créer une nouvelle entrée
3. Remplissez les propriétés (Title, Slug, Excerpt, etc.)
4. Écrivez le contenu de l'article dans la page Notion elle-même :
   - Utilisez "Heading 2" pour les titres de sections
   - Utilisez des paragraphes normaux pour le texte
   - Utilisez des listes à puces pour les énumérations
   - Utilisez des blocs "Quote" pour les citations
   - Utilisez des blocs "Code" pour les exemples de code
5. Changez le "Status" à "Published"
6. Rafraîchissez votre portfolio

## Structure de contenu recommandée pour un article

```
# [Le titre est dans les propriétés]

[Paragraphe d'introduction...]

## Heading 1 : Premier titre de section

[Paragraphe...]

- Liste
- d'éléments

## Heading 2 : Deuxième titre de section

[Paragraphe...]

> Citation importante

## Code exemple

\`\`\`python
# Exemple de code
def hello():
    print("Hello world")
\`\`\`
```

## Synchronisation automatique

Le portfolio se synchronise automatiquement avec Notion :
- En mode développement : à chaque refresh de page
- En production : toutes les heures (configurable via `REVALIDATE_INTERVAL`)

Pour forcer une synchronisation immédiate en production, redéployez votre site ou utilisez la fonctionnalité de revalidation de votre hébergeur.

## Dépannage

### Les données ne s'affichent pas

1. Vérifiez que l'intégration a accès aux bases de données (Étape 3)
2. Vérifiez que les variables d'environnement sont correctes
3. Vérifiez que le "Status" des entrées est "Published"
4. Regardez les logs de la console pour les erreurs

### Erreur "Unauthorized"

- Vérifiez que votre `NOTION_API_KEY` est correct
- Vérifiez que l'intégration a bien accès aux bases de données

### Erreur "Object not found"

- Vérifiez que les Database IDs sont corrects
- Assurez-vous d'avoir copié l'ID complet (32 caractères hexadécimaux)

## Ressources

- [Notion API Documentation](https://developers.notion.com)
- [Notion API Reference](https://developers.notion.com/reference)
