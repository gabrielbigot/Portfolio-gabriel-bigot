# Configuration Finale - Notion Integration

## ✅ Ce qui est déjà fait

1. ✅ Service d'intégration Notion créé (`lib/notion.ts`)
2. ✅ Fichier `.env.local` créé avec vos IDs de bases de données
3. ✅ Documentation complète créée
4. ✅ IDs de vos bases récupérés :
   - Projets : `29efaf44a5f280de95cccd8ddb555923`
   - Blog : `29efaf44a5f2803c84b7d03f093438a7`

## 🔑 ÉTAPE 1 : Obtenir votre token Notion (IMPORTANT)

### Actions à faire :

1. Allez sur **[https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)**

2. Cliquez sur **"+ New integration"**

3. Remplissez :
   - **Name** : Portfolio
   - **Associated workspace** : Sélectionnez votre workspace
   - **Type** : Internal

4. Cliquez sur **"Submit"**

5. Vous verrez **"Internal Integration Token"** (commence par `secret_...`)
   - **COPIEZ CE TOKEN** ⚠️

6. Ouvrez le fichier `.env.local` dans votre projet

7. Remplacez la ligne :
   ```env
   NOTION_API_KEY=YOUR_NOTION_API_KEY
   ```

   Par :
   ```env
   NOTION_API_KEY=secret_votre_token_copié_ici
   ```

## 🔗 ÉTAPE 2 : Connecter vos bases de données à l'intégration

### Pour la base "Projets" :

1. Ouvrez votre base Projets : https://www.notion.so/29efaf44a5f280de95cccd8ddb555923

2. Cliquez sur les **3 points (...)** en haut à droite

3. Sélectionnez **"+ Add connections"**

4. Cherchez et sélectionnez **"Portfolio"** (votre intégration)

5. Cliquez sur **"Confirm"**

### Pour la base "Blog" :

1. Ouvrez votre base Blog : https://www.notion.so/29efaf44a5f2803c84b7d03f093438a7

2. Cliquez sur les **3 points (...)** en haut à droite

3. Sélectionnez **"+ Add connections"**

4. Cherchez et sélectionnez **"Portfolio"**

5. Cliquez sur **"Confirm"**

## 📊 ÉTAPE 3 : Structurer vos bases de données Notion

### Base "Projets" - Propriétés requises :

Ajoutez ces propriétés à votre base si elles n'existent pas :

| Nom de la propriété | Type | Description |
|---------------------|------|-------------|
| **Title** | Title | Titre du projet (déjà créé par défaut) |
| **Slug** | Text | URL-friendly (ex: "accounting-app") |
| **ShortDescription** | Text | Description courte du projet |
| **FullDescription** | Text | Description complète |
| **Category** | Select | Type de projet (Automatisation, IA, Web, etc.) |
| **Tags** | Multi-select | Technologies (Python, Flask, React, etc.) |
| **Date** | Date | Date du projet |
| **Company** | Text | Nom de l'entreprise |
| **Featured** | Checkbox | Mettre en avant ? |
| **Status** | Select | Draft / Published / Archived |
| **Image** | URL | Lien vers l'image |
| **Problem** | Text | Problème résolu |
| **Solution** | Text | Solution apportée |
| **Impact** | Text | Liste des impacts (un par ligne) |
| **Technologies** | Text | Technologies (une par ligne) |
| **Challenges** | Text | Défis rencontrés (un par ligne) |
| **Learnings** | Text | Apprentissages (un par ligne) |

**Pour le champ Status, créez ces options :**
- Draft
- Published
- Archived

### Base "Blog" - Propriétés requises :

| Nom de la propriété | Type | Description |
|---------------------|------|-------------|
| **Title** | Title | Titre de l'article |
| **Slug** | Text | URL-friendly (ex: "ia-pme-transformation") |
| **Excerpt** | Text | Résumé de l'article |
| **Date** | Date | Date de publication |
| **ReadingTime** | Text | Temps de lecture (ex: "8 min") |
| **Category** | Select | IA & Business / Technique / etc. |
| **Featured** | Checkbox | Mettre en avant ? |
| **Status** | Select | Draft / Published / Archived |

**Pour le contenu de l'article**, écrivez-le directement dans la page Notion en utilisant :
- Heading 2 pour les titres
- Paragraphes pour le texte
- Bullet points pour les listes
- Quote blocks pour les citations
- Code blocks pour le code

## 🧪 ÉTAPE 4 : Tester avec un projet de test

### Créez un projet de test :

1. Ouvrez votre base Projets
2. Cliquez sur "+ New"
3. Remplissez :
   - **Title** : Test Project
   - **Slug** : test-project
   - **ShortDescription** : Ceci est un projet de test
   - **Category** : Test
   - **Status** : **Published** ⚠️ (Important !)
   - **Date** : Aujourd'hui
4. Sauvegardez

### Lancez votre portfolio :

```bash
cd minimal-portfolio
npm run dev
```

### Vérifiez :

1. Ouvrez http://localhost:3000
2. Allez à la section Projets
3. Vous devriez voir votre "Test Project" apparaître !

## 🐛 Dépannage

### "Les projets ne s'affichent pas"

1. ✅ Vérifiez que le Status du projet est "Published"
2. ✅ Vérifiez que l'intégration a accès aux bases (Étape 2)
3. ✅ Vérifiez le token dans `.env.local`
4. ✅ Redémarrez le serveur de développement (Ctrl+C puis npm run dev)

### "Erreur 401 Unauthorized"

- Le token API est incorrect ou manquant
- Vérifiez `.env.local` et assurez-vous que le token commence par `secret_`

### "Erreur 404 Object not found"

- Les IDs des bases de données sont incorrects (mais normalement ils sont bons !)
- L'intégration n'a pas accès aux bases (refaire Étape 2)

### "Les propriétés sont undefined"

- Il manque des propriétés dans vos bases Notion
- Vérifiez que les noms des propriétés correspondent exactement (respect de la casse)

## 📝 Exemple de projet complet

Voici un exemple de projet bien rempli :

```
Title: Application de Comptabilité Automatisée
Slug: comptabilite-app
ShortDescription: Application web complète pour automatiser les processus comptables
FullDescription: Développement d'une application permettant d'automatiser l'ensemble du processus de saisie comptable pour BIGOT Matériaux.
Category: Automatisation
Tags: Python, Flask, Supabase, IA
Date: 2025-09-01
Company: BIGOT Matériaux
Featured: ✓
Status: Published
Image: https://example.com/image.jpg
Problem: Les saisies comptables répétitives prenaient plusieurs heures par semaine
Solution: Application web avec interface intuitive générant automatiquement les écritures
Impact:
- Réduction de 80% du temps de saisie
- Élimination des erreurs de saisie
- Interface accessible aux non-techniciens
Technologies:
- Python: Backend et logique métier
- Flask: Framework web
- Supabase: Base de données cloud
Challenges:
- Comprendre les règles comptables complexes
- Assurer la fiabilité des générations
Learnings:
- Architecture d'applications web Python
- Gestion de base de données cloud
```

## 🚀 Une fois que tout fonctionne

### Ajoutez vos vrais projets :

1. Créez une nouvelle ligne dans la base Projets
2. Remplissez tous les champs
3. Status → "Published"
4. Rafraîchissez votre portfolio

### Ajoutez vos vrais articles :

1. Créez une nouvelle page dans la base Blog
2. Remplissez les propriétés
3. Écrivez le contenu dans la page
4. Status → "Published"
5. Rafraîchissez votre portfolio

## 📞 Besoin d'aide ?

Si vous rencontrez des problèmes :

1. Consultez `NOTION_SETUP.md` pour plus de détails techniques
2. Vérifiez la console de développement pour les erreurs
3. Assurez-vous que toutes les étapes ci-dessus sont complétées

---

**Prochain fichier à consulter** : `README-NOTION.md` pour l'utilisation quotidienne
