# 🚀 Guide de Déploiement

## Déploiement sur Vercel

### Variables d'environnement requises

Dans les paramètres de votre projet Vercel, ajoutez ces variables :

#### ✅ Obligatoires (pour le blog et projets)

```
NOTION_API_KEY=secret_xxx...
NOTION_BLOG_DATABASE_ID=xxx...
NOTION_PROJECTS_DATABASE_ID=xxx...
```

#### ⚪ Optionnelles (système de versionnement)

```
NOTION_VERSIONS_DATABASE_ID=xxx...
```

**Note importante :** Si `NOTION_VERSIONS_DATABASE_ID` n'est **PAS** défini, le système de versionnement sera simplement désactivé :
- Pas de badge de version sur les articles
- Pas de lien "Voir l'historique"
- Le site fonctionne normalement sans erreur

C'est une **dégradation gracieuse** : vous pouvez déployer le site maintenant et ajouter le versionnement plus tard.

---

## 🔧 Comment déployer sans le système de versionnement

### Option 1 : Ne pas définir la variable (recommandé)

Dans Vercel, **ne définissez PAS** `NOTION_VERSIONS_DATABASE_ID`.

Le site fonctionnera parfaitement, juste sans les fonctionnalités de versionnement.

### Option 2 : Définir une valeur vide

```
NOTION_VERSIONS_DATABASE_ID=
```

Même résultat que l'option 1.

---

## 📝 Activer le versionnement plus tard

Quand vous serez prêt :

1. **Créez la database "Article Versions"** dans Notion (voir `VERSIONING_QUICKSTART.md`)

2. **Récupérez le Database ID**

3. **Ajoutez la variable dans Vercel** :
   - Allez dans Settings → Environment Variables
   - Ajoutez `NOTION_VERSIONS_DATABASE_ID` avec votre ID
   - Redéployez (Vercel le fait automatiquement)

4. **Créez vos premières versions** dans Notion

5. **C'est tout !** Le système de versionnement sera actif.

---

## ⚠️ Erreurs courantes lors du déploiement

### Erreur 400 : "Could not find property with name or id: Slug"

**Cause :** La variable `NOTION_VERSIONS_DATABASE_ID` est définie mais :
- La database n'existe pas, OU
- La propriété "Slug" n'existe pas dans la database

**Solutions :**

1. **Si vous n'avez pas encore créé la database :**
   - Supprimez la variable `NOTION_VERSIONS_DATABASE_ID` dans Vercel
   - Redéployez
   - Le site fonctionnera sans versionnement

2. **Si vous voulez utiliser le versionnement :**
   - Créez la database avec toutes les propriétés requises (voir `docs/NOTION_VERSIONS_TEMPLATE.md`)
   - Vérifiez que la propriété s'appelle exactement "Slug" (sensible à la casse)
   - Redéployez

---

## 🎯 Checklist de déploiement

### Déploiement minimal (sans versionnement)

- [ ] `NOTION_API_KEY` défini
- [ ] `NOTION_BLOG_DATABASE_ID` défini
- [ ] `NOTION_PROJECTS_DATABASE_ID` défini
- [ ] Database Blog créée dans Notion
- [ ] Database Projects créée dans Notion
- [ ] Au moins un article "Published" dans Blog
- [ ] Au moins un projet dans Projects

### Déploiement avec versionnement

Tout ce qui précède, plus :

- [ ] `NOTION_VERSIONS_DATABASE_ID` défini
- [ ] Database "Article Versions" créée
- [ ] Propriétés correctement configurées (Slug, Version Number, etc.)
- [ ] Au moins une version créée pour tester

---

## 🔍 Vérifier que tout fonctionne

Après déploiement, testez :

1. **Page d'accueil** : `https://votre-site.vercel.app`
2. **Blog** : `https://votre-site.vercel.app/blog`
3. **Un article** : `https://votre-site.vercel.app/blog/[slug]`
4. **Projets** : `https://votre-site.vercel.app/projects`

Si le versionnement est activé, sur un article vous devriez voir :
- Badge de version (ex: "v1.0")
- Date de mise à jour
- Lien "Voir l'historique" (si 2+ versions)

---

## 📊 Logs de déploiement

### Warnings attendus (normaux)

Si `NOTION_VERSIONS_DATABASE_ID` n'est pas défini, vous verrez :

```
Versions database not configured, returning empty array
```

**C'est normal !** Le site fonctionne correctement.

### Warnings si database pas prête

Si la database existe mais n'a pas les bonnes propriétés :

```
Versions database not set up yet for article xxx.
This is normal if you haven't created the database yet.
```

**Action :** Soit créer la database correctement, soit supprimer la variable.

---

## 🚨 En cas de problème

### Le build échoue

1. Vérifiez les logs dans Vercel
2. Assurez-vous que toutes les variables obligatoires sont définies
3. Vérifiez que les Database IDs sont corrects (32 caractères)

### Le site se charge mais pas de contenu

1. Vérifiez que les databases Notion ont au moins une entrée "Published"
2. Vérifiez les permissions de l'intégration Notion
3. Testez l'API key dans un outil comme Postman

### Erreurs 500 sur les pages d'articles

1. Vérifiez les logs Vercel (Functions)
2. Si c'est lié au versionnement, supprimez `NOTION_VERSIONS_DATABASE_ID`
3. Vérifiez que l'article existe dans la database Blog

---

## 🔄 Redeploiement

Vercel redéploie automatiquement à chaque push sur GitHub.

Pour forcer un redéploiement :
1. Allez dans Deployments
2. Cliquez sur "..." sur le dernier déploiement
3. "Redeploy"

---

## 📱 Variables d'environnement par environnement

Vous pouvez définir des variables différentes pour :
- **Production** : votre site principal
- **Preview** : branches de test
- **Development** : local

Utile si vous voulez tester le versionnement en preview avant production.

---

## ✅ Résumé

**Pour déployer maintenant sans versionnement :**
```
NOTION_API_KEY=xxx
NOTION_BLOG_DATABASE_ID=xxx
NOTION_PROJECTS_DATABASE_ID=xxx
```

**Pour ajouter le versionnement plus tard :**
```
+ NOTION_VERSIONS_DATABASE_ID=xxx
```

Le site est conçu pour fonctionner avec ou sans versionnement !
