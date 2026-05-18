# Gestion de votre Portfolio via Notion

Ce portfolio est maintenant connecté à Notion, ce qui vous permet de gérer facilement le contenu de vos projets et articles de blog directement depuis Notion.

## Avantages de l'intégration Notion

- ✅ Interface familière et intuitive
- ✅ Modifier le contenu depuis n'importe quel appareil (mobile, tablet, desktop)
- ✅ Collaboration possible avec d'autres personnes
- ✅ Pas besoin de toucher au code pour ajouter/modifier du contenu
- ✅ Prévisualisation en temps réel dans Notion
- ✅ Synchronisation automatique avec le portfolio

## Configuration rapide (3 étapes)

### 1. Créer l'intégration Notion

1. Allez sur [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Cliquez sur "+ New integration"
3. Nom : "Portfolio"
4. Copiez le token (commence par `secret_...`)

### 2. Créer les bases de données

**Template disponible** : Dupliquez ce modèle Notion pour avoir les bases de données prêtes à l'emploi :

👉 [Lien vers le template Notion - À créer]

Ou créez-les manuellement (voir `NOTION_SETUP.md` pour les détails complets)

### 3. Configurer les variables d'environnement

Créez un fichier `.env.local` :

```env
NOTION_API_KEY=secret_votre_token
NOTION_PROJECTS_DATABASE_ID=id_de_votre_base_projets
NOTION_BLOG_DATABASE_ID=id_de_votre_base_articles
```

## Utilisation quotidienne

### Ajouter un nouveau projet

1. Ouvrez votre base "Projets" dans Notion
2. Cliquez sur "+ New"
3. Remplissez les champs :
   - **Title** : Nom du projet
   - **Slug** : URL (ex: "mon-projet")
   - **Short Description** : Description courte
   - **Category** : Type de projet
   - **Tags** : Technologies utilisées
   - **Featured** : ✓ pour le mettre en avant
   - **Status** : "Published" pour le publier
4. Sauvegardez
5. Votre projet apparaît automatiquement sur le portfolio !

### Ajouter un nouvel article

1. Ouvrez votre base "Articles" dans Notion
2. Cliquez sur "+ New"
3. Remplissez les propriétés dans la base de données
4. Écrivez l'article directement dans la page Notion :
   - Utilisez les titres (Heading 2, Heading 3)
   - Ajoutez des paragraphes
   - Insérez des listes
   - Ajoutez des citations avec le bloc "Quote"
   - Insérez du code avec le bloc "Code"
5. Changez **Status** à "Published"
6. L'article apparaît sur votre blog !

### Modifier du contenu existant

1. Ouvrez l'entrée dans Notion
2. Modifiez le contenu
3. Sauvegardez
4. Les changements sont automatiquement synchronisés

### Retirer du contenu

1. Ouvrez l'entrée dans Notion
2. Changez **Status** à "Draft" ou "Archived"
3. Le contenu disparaît du portfolio

## Exemples de contenu

### Exemple de projet

```
Title: Application de Comptabilité Automatisée
Slug: comptabilite-app
Short Description: Automatisation complète des processus comptables
Category: Automatisation
Tags: Python, Flask, Supabase
Date: 2025-09
Company: BIGOT Matériaux
Featured: ✓
Status: Published

Problem: Les saisies comptables prenaient plusieurs heures par semaine
Solution: Application web générant automatiquement les écritures
Impact:
- Réduction de 80% du temps de saisie
- Élimination des erreurs
- Interface accessible aux non-techniciens
```

### Exemple d'article

```
Title: Comment l'IA transforme les PME
Slug: ia-pme-transformation
Excerpt: Mon parcours d'automatisation dans une PME familiale
Category: IA & Business
Reading Time: 8 min
Featured: ✓
Status: Published

[Contenu dans la page Notion]

## Introduction

Mon expérience chez BIGOT Matériaux m'a appris...

## Les défis des PME

Dans une PME, chaque heure compte...

- Premier défi
- Deuxième défi

> Citation importante

## Conclusion

L'IA est accessible à toutes les PME...
```

## Fonctionnalités avancées

### Fallback vers données locales

Si Notion n'est pas configuré, le portfolio utilise automatiquement les données dans `lib/data.ts`. Cela vous permet de :
- Tester le site sans configurer Notion
- Avoir un backup des données
- Migrer progressivement vers Notion

### Synchronisation

- **Développement** : Données rafraîchies à chaque rechargement
- **Production** : Cache d'1 heure (configurable)

### Prévisualisation

Utilisez le statut "Draft" pour travailler sur du contenu sans le publier.

## Dépannage

### "Les projets ne s'affichent pas"

1. Vérifiez que l'intégration a accès à la base de données :
   - Ouvrez la base dans Notion
   - Cliquez sur "..." → "Add connections"
   - Sélectionnez votre intégration

2. Vérifiez que le statut est "Published"

### "Erreur d'authentification"

- Vérifiez le `NOTION_API_KEY` dans `.env.local`
- Regénérez un nouveau token si nécessaire

### "Contenu non mis à jour"

- En développement : Rafraîchissez la page (Ctrl+R)
- En production : Attendez 1h ou redéployez le site

## Migration depuis les données locales

Si vous avez déjà du contenu dans `lib/data.ts` :

1. Créez les entrées correspondantes dans Notion
2. Copiez-collez le contenu
3. Vérifiez que tout s'affiche correctement
4. Les données Notion remplaceront automatiquement les données locales

## Ressources

- [Documentation Notion complète](./NOTION_SETUP.md)
- [Notion API Docs](https://developers.notion.com)
- [Template Notion](# - À créer)

## Support

Pour toute question ou problème :
1. Consultez `NOTION_SETUP.md` pour les détails techniques
2. Vérifiez les logs de la console
3. Ouvrez une issue sur GitHub
