# 🚀 Démarrage - Intégration Notion

## Bienvenue !

Votre portfolio peut maintenant être géré via Notion ! Ce fichier vous guide pour finaliser la configuration.

## 📋 État actuel

### ✅ Déjà configuré :

- ✅ Service d'intégration Notion (`lib/notion.ts`)
- ✅ IDs de vos bases de données récupérés
- ✅ Fichier `.env.local` créé (mais nécessite votre token API)
- ✅ Documentation complète

### ⏳ À faire (3 étapes simples) :

1. **Obtenir votre token Notion API** (2 minutes)
2. **Connecter vos bases à l'intégration** (1 minute)
3. **Tester** (1 minute)

## 🎯 Action rapide (suivez dans l'ordre)

### ÉTAPE 1 : Token API

1. Ouvrez : https://www.notion.so/my-integrations
2. "+ New integration"
3. Name: "Portfolio" → Submit
4. Copiez le token (commence par `secret_...`)
5. Dans `.env.local`, remplacez `YOUR_NOTION_API_KEY` par votre token

### ÉTAPE 2 : Connecter les bases

**Base Projets :**
1. Ouvrez : https://www.notion.so/29efaf44a5f280de95cccd8ddb555923
2. Cliquez "..." (3 points en haut à droite)
3. "+ Add connections" → Sélectionnez "Portfolio"

**Base Blog :**
1. Ouvrez : https://www.notion.so/29efaf44a5f2803c84b7d03f093438a7
2. Cliquez "..." (3 points)
3. "+ Add connections" → Sélectionnez "Portfolio"

### ÉTAPE 3 : Ajouter les propriétés aux bases

Vos bases Notion ont besoin de certaines propriétés (colonnes) pour fonctionner.

**➡️ Consultez `CONFIGURATION_FINALE.md` section "ÉTAPE 3"** pour la liste complète

**Propriétés minimales requises pour Projets :**
- Title (existe déjà)
- Slug (Text)
- ShortDescription (Text)
- Category (Select)
- Status (Select avec options: Draft, Published, Archived)
- Date (Date)

**Propriétés minimales requises pour Blog :**
- Title (existe déjà)
- Slug (Text)
- Excerpt (Text)
- Category (Select)
- Status (Select avec options: Draft, Published, Archived)
- Date (Date)
- ReadingTime (Text)

### ÉTAPE 4 : Test

```bash
cd minimal-portfolio
npm run dev
```

Ouvrez http://localhost:3000 et vérifiez que ça fonctionne !

## 📚 Documentation

| Fichier | Contenu |
|---------|---------|
| **`START_HERE.md`** | 👈 Vous êtes ici - Démarrage rapide |
| **`CONFIGURATION_FINALE.md`** | Guide détaillé étape par étape |
| **`NOTION_SETUP.md`** | Documentation technique complète |
| **`README-NOTION.md`** | Guide d'utilisation quotidienne |

## 🆘 Problème ?

### Les données ne s'affichent pas ?

1. Vérifiez que le token est correct dans `.env.local`
2. Vérifiez que les bases sont connectées (Étape 2)
3. Vérifiez que Status = "Published" dans Notion
4. Redémarrez le serveur (Ctrl+C puis `npm run dev`)

### Erreur "Unauthorized" ?

→ Le token API n'est pas correct
→ Refaites l'Étape 1

### Erreur "Object not found" ?

→ Les bases ne sont pas connectées à l'intégration
→ Refaites l'Étape 2

## ✨ Une fois configuré

### Workflow quotidien :

1. Ouvrir Notion
2. Ajouter un projet/article
3. Remplir les champs
4. Status → "Published"
5. ✅ Apparaît sur le portfolio !

### Fonctionnalités

- ✅ Gestion de contenu via Notion
- ✅ Pas besoin de toucher au code
- ✅ Accessible depuis mobile/tablet
- ✅ Collaboration possible
- ✅ Fallback automatique si Notion ne répond pas

## 🎓 Prochaines étapes

1. **Maintenant** : Suivez les étapes 1-4 ci-dessus
2. **Ensuite** : Ajoutez vos vrais projets dans Notion
3. **Après** : Consultez `README-NOTION.md` pour l'utilisation avancée

---

**Besoin d'aide détaillée ?** → Ouvrez `CONFIGURATION_FINALE.md`
