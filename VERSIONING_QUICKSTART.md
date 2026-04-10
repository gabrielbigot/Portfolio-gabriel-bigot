# 🚀 Quick Start - Système de Versionnement

## ✅ Ce qui a été implémenté

Le système de versionnement d'articles est **complètement fonctionnel** avec :

### Fonctionnalités principales
- ✅ Gestion multi-versions dans Notion
- ✅ Affichage de la version actuelle sur chaque article
- ✅ Timeline interactive de toutes les versions
- ✅ Consultation de versions archivées
- ✅ Comparaison visuelle entre versions (diff avec highlighting)
- ✅ Accès public à toutes les versions publiées

### Interface utilisateur
- ✅ Badge de version sur les articles
- ✅ Date de dernière mise à jour
- ✅ Bouton "Voir l'historique" (si versions multiples)
- ✅ Diff visuel : vert pour ajouts, rouge pour suppressions, orange pour modifications
- ✅ Navigation entre versions (précédente/suivante)

---

## 📋 Checklist de mise en route

### Étape 1 : Configuration Notion (⏱️ 5 min)

**1. Créer la database "Article Versions"**

Dans votre workspace Notion :
1. Créez une nouvelle database
2. Nommez-la "Article Versions"
3. Ajoutez ces propriétés exactement :

| Nom propriété | Type |
|---------------|------|
| Title | Title (par défaut) |
| Slug | Text |
| Version Number | Number |
| Version Label | Text |
| Published Date | Date |
| Is Current Version | Checkbox |
| Change Summary | Text |
| Status | Select |

4. Pour la propriété "Status", ajoutez ces 3 options :
   - Published
   - Draft
   - Archived

**2. Récupérer le Database ID**

1. Ouvrez la database dans votre navigateur
2. L'URL ressemble à : `https://www.notion.so/xxxxxx/DATABASE_ID?v=...`
3. Copiez la partie `DATABASE_ID` (32 caractères hexadécimaux)

**3. Configurer la variable d'environnement**

Ajoutez dans votre `.env.local` :

```env
NOTION_VERSIONS_DATABASE_ID=paste_your_database_id_here
```

---

### Étape 2 : Créer votre première version (⏱️ 3 min)

**Exemple avec l'article "Comment l'IA transforme les PME"**

1. Dans la database "Article Versions", créez une nouvelle page
2. Remplissez les propriétés :
   ```
   Slug: ia-pme-transformation
   Version Number: 1
   Version Label: v1.0
   Published Date: 2025-10-01 (date originale)
   Is Current Version: ✅ (coché)
   Change Summary: Version originale
   Status: Published
   ```

3. Dans le corps de la page Notion, copiez le contenu de votre article

4. Sauvegardez

---

### Étape 3 : Tester l'affichage (⏱️ 2 min)

1. Lancez votre serveur de développement :
   ```bash
   npm run dev
   ```

2. Visitez votre article :
   ```
   http://localhost:3000/blog/ia-pme-transformation
   ```

3. **Vous devriez voir :**
   - Badge "v1.0" sous la catégorie
   - Date "Mis à jour le..."
   - Pas encore de bouton "Voir l'historique" (il faut 2+ versions)

---

### Étape 4 : Créer une deuxième version (⏱️ 5 min)

**Simulons une mise à jour de l'article**

1. Dans Notion, **dupliquez** la page v1.0 (clic droit → Duplicate)

2. Sur la copie, modifiez les propriétés :
   ```
   Version Number: 2
   Version Label: v2.0
   Published Date: [aujourd'hui]
   Is Current Version: ✅ (coché)
   Change Summary: Mise à jour des statistiques 2024
   Status: Published
   ```

3. **Important :** Retournez sur la page v1.0 et **décochez** "Is Current Version"

4. Dans le contenu de v2.0, faites une modification visible :
   - Changez une phrase
   - Ajoutez un paragraphe
   - Modifiez une statistique

5. Sauvegardez

---

### Étape 5 : Découvrir les fonctionnalités (⏱️ 5 min)

Rafraîchissez la page de votre article. **Vous devriez maintenant voir :**

✅ **Sur `/blog/ia-pme-transformation` :**
- Badge "v2.0"
- "Mis à jour le [date]"
- Bouton "📜 Voir l'historique (2 versions)"

✅ **Cliquez sur "Voir l'historique" → `/blog/ia-pme-transformation/versions` :**
- Timeline avec v2.0 (Actuelle) et v1.0 (Originale)
- Boutons "Voir" et "Comparer avec v1.0"

✅ **Cliquez sur "Comparer avec v1.0" :**
- Sélecteur de versions : v1.0 → v2.0
- Résumé des changements
- Diff visuel avec highlighting :
  - 🟢 Vert = ajouté
  - 🔴 Rouge = supprimé
  - 🟠 Orange = modifié

✅ **Cliquez sur "Voir" v1.0 :**
- Contenu exact de la version 1.0
- Banner "Vous consultez une version archivée"
- Navigation vers v2.0

---

## 🎯 Prochaines étapes

### Migrer vos articles existants

Pour chaque article de blog que vous voulez versionner :

1. Créez une page dans "Article Versions"
2. Utilisez le même slug que dans votre database Blog
3. Commencez à v1.0
4. Cochez "Is Current Version"
5. Copiez le contenu actuel

**Note :** Vous n'êtes pas obligé de versionner tous les articles immédiatement. Commencez par ceux qui changent le plus souvent.

### Workflow de mise à jour

Quand vous voulez mettre à jour un article :

1. **Dupliquez** la version actuelle dans Notion
2. **Incrémentez** le numéro de version (v2.0 → v3.0)
3. **Mettez à jour** la date et le résumé de changements
4. **Décochez** "Is Current Version" sur l'ancienne
5. **Cochez** "Is Current Version" sur la nouvelle
6. **Modifiez** le contenu
7. Attendez 1h (ou redémarrez le serveur dev) pour voir les changements

---

## 📚 Documentation complète

Pour aller plus loin :

- **Guide utilisateur détaillé** : `VERSIONING_GUIDE.md`
  - Workflows complets
  - Exemples concrets
  - Bonnes pratiques
  - Dépannage

- **Documentation technique** : `docs/VERSIONING_TECHNICAL.md`
  - API complète
  - Types TypeScript
  - Architecture
  - Algorithmes

---

## 🎨 Exemple visuel du résultat

### Sur la page article :
```
┌────────────────────────────────────────────┐
│ [← Retour aux articles]                    │
│                                            │
│ [Technique] 2025-10 8 min                  │
│ [v2.0] 📅 Mis à jour le 15 novembre 2024  │
│ [📜 Voir l'historique (2 versions)]        │
│                                            │
│ Comment l'IA transforme les PME :          │
│ retour d'expérience                        │
│                                            │
│ Mon parcours d'automatisation...           │
└────────────────────────────────────────────┘
```

### Sur la page de comparaison :
```
┌────────────────────────────────────────────┐
│ 🔀 Comparaison des versions                │
│                                            │
│ [v1.0] → [v2.0]                           │
│ Résumé: 1 bloc ajouté, 2 blocs modifiés   │
│                                            │
│ ✅ AJOUTÉ: Paragraphe                      │
│ │ En 2024, les nouvelles statistiques...  │
│                                            │
│ ✏️ MODIFIÉ: Paragraphe                     │
│ │ L'IA améliore de ̶7̶0̶%̶ 80% la...        │
│ │          (rouge)  (vert)                │
└────────────────────────────────────────────┘
```

---

## ❓ FAQ Rapide

**Q : Dois-je versionner tous mes articles ?**
R : Non, uniquement ceux que vous comptez mettre à jour régulièrement.

**Q : Que se passe-t-il si je ne crée aucune version ?**
R : L'article s'affiche normalement, sans badge de version ni lien historique.

**Q : Combien de versions puis-je créer ?**
R : Illimité ! Le système gère n'importe quel nombre de versions.

**Q : Les visiteurs voient-ils les versions "Draft" ?**
R : Non, seules les versions avec Status = "Published" sont visibles.

**Q : Comment supprimer une version ?**
R : Changez son Status à "Archived" ou supprimez la page dans Notion.

**Q : Dois-je redéployer après chaque nouvelle version ?**
R : Non ! Grâce à l'ISR, les changements sont visibles sous 1h max (ou immédiatement en dev avec restart).

---

## ✅ Vérification finale

Avant de considérer le système opérationnel, vérifiez :

- [ ] La variable `NOTION_VERSIONS_DATABASE_ID` est définie dans `.env.local`
- [ ] La database "Article Versions" existe dans Notion
- [ ] Toutes les propriétés sont créées avec les bons types
- [ ] Au moins une version de test est créée
- [ ] Le serveur dev affiche l'article avec le badge de version
- [ ] Le lien "Voir l'historique" fonctionne (si 2+ versions)
- [ ] La comparaison montre bien les différences

---

**🎉 Félicitations ! Votre système de versionnement est opérationnel !**

Pour toute question, consultez :
- `VERSIONING_GUIDE.md` (guide utilisateur)
- `docs/VERSIONING_TECHNICAL.md` (documentation technique)
