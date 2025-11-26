# 📚 Guide du Système de Versionnement d'Articles

## Vue d'ensemble

Ce système de versionnement vous permet de gérer plusieurs versions de vos articles de blog, avec la possibilité de visualiser l'historique complet, consulter d'anciennes versions et comparer les différences entre versions avec un affichage visuel (diff).

## 🎯 Fonctionnalités

- ✅ **Gestion multi-versions** : Stockez et gérez plusieurs versions d'un même article
- ✅ **Diff visuel** : Comparez deux versions avec highlighting des ajouts (vert) et suppressions (rouge)
- ✅ **Timeline interactive** : Naviguez facilement entre les différentes versions
- ✅ **Badges de version** : Affichez clairement la version actuelle sur chaque article
- ✅ **Historique public** : Les visiteurs peuvent consulter toutes les versions publiées
- ✅ **Résumé des changements** : Chaque version peut inclure un résumé des modifications

---

## 🔧 Configuration Notion

### Étape 1 : Créer la database "Article Versions"

Dans Notion, créez une nouvelle database avec les propriétés suivantes :

| Propriété | Type | Description | Obligatoire |
|-----------|------|-------------|-------------|
| **Title** | Title | Titre de la version (auto-généré) | ✅ |
| **Slug** | Text | Slug de l'article (ex: "ia-pme-transformation") | ✅ |
| **Version Number** | Number | Numéro de version (1, 2, 3...) | ✅ |
| **Version Label** | Text | Label affiché (ex: "v1.0", "v2.0") | ✅ |
| **Published Date** | Date | Date de publication de cette version | ✅ |
| **Is Current Version** | Checkbox | Marquer comme version actuelle | ✅ |
| **Change Summary** | Text | Résumé des modifications apportées | ⚪ |
| **Status** | Select | Published / Draft / Archived | ✅ |

**Options pour Status :**
- ✅ Published
- 📝 Draft
- 🗄️ Archived

### Étape 2 : Ajouter la variable d'environnement

Dans votre fichier `.env.local`, ajoutez :

```env
NOTION_VERSIONS_DATABASE_ID=votre_database_id_ici
```

**Comment trouver le Database ID :**
1. Ouvrez votre database Notion dans le navigateur
2. L'URL ressemble à : `https://www.notion.so/WORKSPACE_ID/DATABASE_ID?v=...`
3. Copiez la partie `DATABASE_ID` (32 caractères)

### Étape 3 : Structure du contenu

Le contenu de chaque version se trouve dans le **corps de la page Notion** (sous les propriétés). Utilisez les blocs Notion habituels :

- 📝 Paragraphes
- 🔤 Titres (H1, H2, H3)
- 📋 Listes (à puces, numérotées)
- 💬 Citations
- 💡 Callouts
- 💻 Blocs de code
- 🖼️ Images
- Et plus encore...

---

## 📝 Workflow : Créer une nouvelle version

### Scénario : Vous voulez mettre à jour un article existant

**Exemple :** Votre article "Comment l'IA transforme les PME" a besoin d'être mis à jour avec de nouvelles statistiques.

#### Option 1 : Première version (migration)

Si c'est la **première fois** que vous utilisez le système pour cet article :

1. **Créez la version originale (v1.0)**
   - Ouvrez la database "Article Versions"
   - Créez une nouvelle page
   - Remplissez :
     - Slug: `ia-pme-transformation`
     - Version Number: `1`
     - Version Label: `v1.0`
     - Published Date: Date de publication originale
     - Is Current Version: ✅ (coché)
     - Change Summary: "Version originale"
     - Status: Published
   - Copiez le contenu actuel de l'article dans le corps de la page

2. **Créez la nouvelle version (v2.0)**
   - Créez une autre page dans "Article Versions"
   - Remplissez :
     - Slug: `ia-pme-transformation` (même slug)
     - Version Number: `2`
     - Version Label: `v2.0`
     - Published Date: Date d'aujourd'hui
     - Is Current Version: ✅ (coché)
     - Change Summary: "Mise à jour des statistiques 2024"
     - Status: Published
   - Écrivez le nouveau contenu avec vos modifications

3. **Décochez "Is Current Version" pour v1.0**
   - Retournez sur la page v1.0
   - Décochez "Is Current Version"
   - Seule la v2.0 doit avoir cette case cochée

#### Option 2 : Versions suivantes

Pour les versions suivantes (v2.0 → v3.0) :

1. **Dupliquez la version actuelle**
   - Trouvez la version actuelle (celle avec "Is Current Version" coché)
   - Dupliquez la page (dans Notion : `...` → Duplicate)

2. **Modifiez les propriétés de la copie**
   - Version Number: `3` (incrémentez)
   - Version Label: `v3.0`
   - Published Date: Date d'aujourd'hui
   - Change Summary: Décrivez vos modifications
   - Is Current Version: ✅ (gardez coché)

3. **Décochez l'ancienne version**
   - Retournez sur la v2.0
   - Décochez "Is Current Version"

4. **Modifiez le contenu**
   - Dans la nouvelle page (v3.0), modifiez le contenu comme vous le souhaitez

---

## 🎨 Interface Utilisateur

### Sur la page d'article principale

Les visiteurs verront :

```
┌─────────────────────────────────────┐
│ [v2.0] Mis à jour le 15 nov 2024   │
│ [📜 Voir l'historique (3 versions)] │
│                                     │
│ [Titre de l'article]                │
└─────────────────────────────────────┘
```

### Page d'historique (`/blog/[slug]/versions`)

Timeline interactive montrant toutes les versions :

```
● v3.0 - 15 déc 2024 [Actuelle]
  └ Ajout de nouveaux cas d'usage
  [Voir] [Comparer avec v2.0]

○ v2.0 - 15 nov 2024
  └ Mise à jour statistiques 2024
  [Voir] [Comparer avec v1.0]

○ v1.0 - 10 sep 2024 [Originale]
  └ Publication initiale
  [Voir]
```

### Page de version spécifique (`/blog/[slug]/versions/2`)

Affiche le contenu exact de la version 2 avec :
- Banner indiquant qu'il s'agit d'une version archivée
- Navigation vers version précédente/suivante
- Bouton pour comparer avec la version actuelle

### Page de comparaison (`/blog/[slug]/versions/compare?from=1&to=2`)

Affiche un diff visuel avec :
- ✅ **Blocs ajoutés** (fond vert clair, bordure verte)
- ❌ **Blocs supprimés** (fond rouge clair, bordure rouge, texte barré)
- ✏️ **Blocs modifiés** (fond orange clair, highlighting mot par mot)

---

## 🔍 Exemples d'utilisation

### Exemple 1 : Mise à jour statistiques

**Situation :** Vos statistiques d'automatisation sont passées de 70% à 80%

**Actions :**
1. Dupliquer la version actuelle
2. Incrémenter le numéro de version (v2.1)
3. Change Summary: "Mise à jour : gains d'automatisation de 70% → 80%"
4. Modifier le contenu avec les nouvelles données
5. Décocher l'ancienne version

**Résultat :** Les visiteurs verront :
- Dans le diff : Le paragraphe modifié avec "70%" en rouge barré et "80%" en vert
- Le résumé : "1 bloc modifié"

### Exemple 2 : Ajout de section complète

**Situation :** Vous voulez ajouter une nouvelle section "Les limites de l'IA"

**Actions :**
1. Créer une nouvelle version (v2.2)
2. Change Summary: "Ajout d'une section sur les limites et précautions"
3. Ajouter la nouvelle section dans le contenu

**Résultat :** Dans le diff :
- Nouveau titre "Les limites de l'IA" en vert
- Nouveaux paragraphes en vert
- Indication "3 blocs ajoutés"

### Exemple 3 : Correction d'erreurs

**Situation :** Vous avez détecté une erreur factuelle à corriger

**Actions :**
1. Créer v2.1.1 (version de correctif)
2. Change Summary: "Correction : date incorrecte de l'événement"
3. Modifier uniquement le paragraphe concerné

**Résultat :** Diff montrant précisément la phrase modifiée

---

## 🚀 Routes disponibles

| Route | Description |
|-------|-------------|
| `/blog/[slug]` | Article avec version actuelle + lien historique |
| `/blog/[slug]/versions` | Timeline de toutes les versions |
| `/blog/[slug]/versions/[num]` | Consultation d'une version spécifique |
| `/blog/[slug]/versions/compare` | Comparaison entre 2 versions |

**Paramètres de comparaison :**
- `?from=1&to=2` : Compare version 1 avec version 2

---

## 💡 Bonnes pratiques

### Numérotation des versions

Utilisez une numérotation sémantique :

- **v1.0, v2.0, v3.0** : Changements majeurs (nouvelle structure, refonte complète)
- **v1.1, v1.2, v1.3** : Ajouts de contenu (nouvelles sections, exemples)
- **v1.0.1, v1.0.2** : Corrections mineures (typos, erreurs factuelles)

### Résumés de changements

Soyez précis dans vos Change Summary :

✅ **Bon :** "Mise à jour des statistiques 2024 + ajout d'un cas d'usage sur la santé"
❌ **Mauvais :** "Modifications"

✅ **Bon :** "Correction : le taux de croissance était de 45% et non 54%"
❌ **Mauvais :** "Fix"

### Quand créer une nouvelle version ?

**OUI, créez une version quand :**
- Vous ajoutez de nouvelles informations substantielles
- Vous mettez à jour des données/statistiques
- Vous corrigez des erreurs significatives
- Vous ajoutez/supprimez des sections

**NON, pas besoin de version pour :**
- Correction de fautes de frappe minimes
- Reformulation stylistique sans changement de fond
- Ajustements de mise en forme uniquement

---

## 🐛 Dépannage

### Problème : "Aucune version disponible"

**Causes possibles :**
1. La database ID n'est pas configurée dans `.env.local`
2. Aucune version n'a été créée avec le bon slug
3. Toutes les versions sont en status "Draft" au lieu de "Published"

**Solution :**
- Vérifiez que `NOTION_VERSIONS_DATABASE_ID` est bien défini
- Vérifiez que le slug correspond exactement (sensible à la casse)
- Assurez-vous qu'au moins une version est "Published"

### Problème : La mauvaise version s'affiche comme "actuelle"

**Cause :** Plusieurs versions ont "Is Current Version" coché

**Solution :**
- Décochez toutes les cases "Is Current Version"
- Cochez uniquement celle que vous voulez comme actuelle
- Attendez le revalidation (max 1 heure) ou relancez le serveur dev

### Problème : Le diff ne montre aucune différence alors qu'il y en a

**Cause possible :** Les deux versions comparées sont identiques

**Solution :**
- Vérifiez que vous comparez bien les bonnes versions
- Assurez-vous que le contenu a effectivement été modifié dans Notion

---

## 📊 Architecture technique

### Fichiers créés

```
lib/
├── types/
│   └── article-version.ts       # Types TypeScript pour le versionnement
├── notion-versions.ts            # API Notion pour récupérer les versions
└── diff-engine.ts                # Algorithme de comparaison (LCS, diff)

components/
├── DiffViewer.tsx                # Affichage visuel des différences
├── VersionTimeline.tsx           # Timeline interactive des versions
└── VersionBadge.tsx              # Badge de version

app/blog/[slug]/
├── page.tsx                      # Article (modifié avec intégration versions)
└── versions/
    ├── page.tsx                  # Liste des versions
    ├── [versionNumber]/
    │   └── page.tsx              # Consultation d'une version
    └── compare/
        └── page.tsx              # Comparaison de versions
```

### Algorithmes utilisés

1. **LCS (Longest Common Subsequence)** : Pour trouver les blocs communs entre versions
2. **Levenshtein Distance** : Pour calculer la similarité textuelle
3. **Word-level diff** : Comparaison mot par mot pour les paragraphes modifiés

---

## 🎓 Ressources

- [Documentation Notion API](https://developers.notion.com/)
- [Next.js Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [Algorithme LCS expliqué](https://en.wikipedia.org/wiki/Longest_common_subsequence)

---

## ✨ Fonctionnalités futures possibles

Idées d'améliorations pour plus tard :

- [ ] Restauration d'une ancienne version en un clic
- [ ] Export PDF d'une version spécifique
- [ ] Notification automatique aux abonnés lors d'une mise à jour
- [ ] Comparaison de versions non-consécutives (v1.0 vs v3.0)
- [ ] Diff avec vue côte-à-côte (split view)
- [ ] Annotation des changements par les lecteurs
- [ ] Statistiques : versions les plus consultées

---

**Créé pour Gabriel Bigot | Portfolio 2024**
