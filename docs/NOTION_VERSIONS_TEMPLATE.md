# 📋 Template Notion : Article Versions Database

## Structure de la database

Copiez cette structure exacte dans votre workspace Notion.

### Propriétés (Properties)

| Property Name | Type | Configuration | Obligatoire |
|---------------|------|---------------|-------------|
| **Title** | Title | Auto-généré ou manuel | ✅ |
| **Slug** | Text | - | ✅ |
| **Version Number** | Number | Format: Number | ✅ |
| **Version Label** | Text | - | ✅ |
| **Published Date** | Date | Include time: No | ✅ |
| **Is Current Version** | Checkbox | - | ✅ |
| **Change Summary** | Text | - | Recommandé |
| **Status** | Select | Options ci-dessous | ✅ |

### Configuration Select "Status"

Créez ces 3 options :
1. **Published** (couleur verte recommandée)
2. **Draft** (couleur jaune recommandée)
3. **Archived** (couleur grise recommandée)

---

## Exemples de pages

### Exemple 1 : Version originale

**Properties :**
```
Title: Comment l'IA transforme les PME - v1.0
Slug: ia-pme-transformation
Version Number: 1
Version Label: v1.0
Published Date: 2025-10-01
Is Current Version: ☐ (décoché car remplacée par v2.0)
Change Summary: Version originale de l'article
Status: Published
```

**Content (dans le corps de la page) :**
```
# Le point de départ : des tâches répétitives qui coûtent cher

Dans une PME, chaque heure compte. Et pourtant, j'ai observé que des heures
précieuses étaient perdues chaque semaine dans des tâches répétitives...

[Reste du contenu de la v1.0]
```

---

### Exemple 2 : Mise à jour majeure

**Properties :**
```
Title: Comment l'IA transforme les PME - v2.0
Slug: ia-pme-transformation
Version Number: 2
Version Label: v2.0
Published Date: 2024-11-15
Is Current Version: ☑ (coché)
Change Summary: Mise à jour des statistiques 2024 + ajout cas d'usage santé
Status: Published
```

**Content :**
```
# Le point de départ : des tâches répétitives qui coûtent cher

Dans une PME, chaque heure compte. Et pourtant, j'ai observé que des heures
précieuses étaient perdues chaque semaine dans des tâches répétitives...

# Nouveau cas d'usage : secteur de la santé

En 2024, nous avons étendu ces automatisations au secteur de la santé...
[Nouveau contenu]

[Reste du contenu mis à jour]
```

---

### Exemple 3 : Correctif mineur

**Properties :**
```
Title: Comment l'IA transforme les PME - v2.0.1
Slug: ia-pme-transformation
Version Number: 2.01
Version Label: v2.0.1
Published Date: 2024-11-20
Is Current Version: ☑ (coché)
Change Summary: Correction : taux de gain était 80% et non 70%
Status: Published
```

---

## Conventions de nommage

### Pour le Title
Format recommandé : `[Titre Article] - [Version Label]`

Exemples :
- `Comment l'IA transforme les PME - v1.0`
- `Excel vs Python - v2.1`
- `Prompt Engineering - v3.0.2`

### Pour le Slug
**Doit être identique au slug de l'article dans votre database Blog.**

Exemples corrects :
```
Article Blog slug: ia-pme-transformation
Version slug:      ia-pme-transformation  ✅

Article Blog slug: excel-vs-python
Version slug:      excel-vs-python        ✅
```

Exemples incorrects :
```
Article Blog slug: ia-pme-transformation
Version slug:      ia-pme                 ❌ (trop court)

Article Blog slug: excel-vs-python
Version slug:      Excel-vs-Python        ❌ (casse différente)
```

### Pour Version Number

Utilisez la numérotation sémantique :

| Type de changement | Version Number | Version Label |
|-------------------|----------------|---------------|
| Version initiale | 1 | v1.0 |
| Mise à jour majeure | 2 | v2.0 |
| Mise à jour mineure | 2.1 | v2.1 |
| Correctif | 2.11 ou 2.01 | v2.0.1 ou v2.1.1 |

**Important :** Version Number doit être un nombre décimal, pas une string.
- ✅ `2.1` (correct)
- ❌ `"2.1"` (incorrect - pas de guillemets)

### Pour Version Label

Format libre, mais recommandé :
- `v1.0`, `v2.0`, `v3.0` pour versions majeures
- `v2.1`, `v2.2` pour versions mineures
- `v2.0.1`, `v2.0.2` pour correctifs

### Pour Change Summary

Soyez descriptif et spécifique :

✅ **Bons exemples :**
- "Mise à jour des statistiques Q4 2024 + ajout section IA dans la santé"
- "Correction de l'erreur sur le taux de croissance (45% → 54%)"
- "Ajout de 3 nouveaux cas d'usage + mise à jour des captures d'écran"
- "Refonte complète de la section 'Limitations' avec nouveaux exemples"

❌ **Mauvais exemples :**
- "Mise à jour" (trop vague)
- "Modifications" (pas informatif)
- "Fix" (en anglais et trop court)
- "" (vide - éviter si possible)

---

## Workflow typique

### Scénario 1 : Premier article versionné

1. Créer une page "Article Versions"
2. Remplir :
   - Slug: identique à l'article
   - Version Number: 1
   - Version Label: v1.0
   - Is Current Version: ✅
   - Status: Published
3. Copier le contenu actuel de l'article

### Scénario 2 : Mise à jour d'un article

1. **Dupliquer** la version actuelle
2. Sur la nouvelle page :
   - Version Number: incrémenter (ex: 2)
   - Version Label: mettre à jour (ex: v2.0)
   - Published Date: date du jour
   - Change Summary: décrire les changements
   - Is Current Version: ✅ (garder coché)
3. Sur l'ancienne page :
   - Is Current Version: ☐ (décocher)
4. Modifier le contenu de la nouvelle version

### Scénario 3 : Archiver une version

1. Ouvrir la page de la version
2. Status: changer de "Published" à "Archived"
3. La version n'apparaîtra plus publiquement

---

## Vues Notion recommandées

### Vue 1 : Par article (vue principale)

**Type :** Table
**Grouper par :** Slug
**Trier par :** Version Number (décroissant)
**Filtrer :** Status = Published

Cette vue affiche tous les articles avec leurs versions, groupés ensemble.

### Vue 2 : Versions actuelles

**Type :** Table
**Filtrer :**
- Is Current Version = ✅
- Status = Published
**Trier par :** Published Date (décroissant)

Affiche uniquement les versions actuelles de chaque article.

### Vue 3 : Brouillons

**Type :** Table
**Filtrer :** Status = Draft
**Trier par :** Published Date (décroissant)

Pour gérer vos versions en préparation.

### Vue 4 : Timeline

**Type :** Timeline
**Propriété de date :** Published Date
**Filtrer :** Status = Published

Visualisation chronologique de toutes les publications de versions.

---

## Checklist de validation

Avant de publier une nouvelle version, vérifiez :

- [ ] Le Slug correspond exactement à celui de la database Blog
- [ ] Version Number est bien un nombre (pas de texte)
- [ ] Version Label est cohérent avec Version Number
- [ ] Published Date est correcte
- [ ] Une seule version a "Is Current Version" coché pour cet article
- [ ] Change Summary est rempli et descriptif
- [ ] Status est "Published"
- [ ] Le contenu est bien dans le corps de la page
- [ ] L'ancienne version a "Is Current Version" décoché

---

## Exemples complets pour différents types d'articles

### Article technique avec mises à jour fréquentes

```
v3.2 - 2024-12-01 [Actuelle]
└ Ajout compatibilité Python 3.12

v3.1 - 2024-11-15
└ Mise à jour des dépendances + nouveaux exemples

v3.0 - 2024-10-01
└ Refonte complète avec nouvelles APIs

v2.0 - 2024-06-15
└ Ajout section performance

v1.0 - 2024-01-10
└ Version initiale
```

### Article d'opinion/expérience avec peu de mises à jour

```
v1.1 - 2024-11-20 [Actuelle]
└ Correction typos + précisions sur dates

v1.0 - 2024-09-15
└ Publication originale
```

### Article avec correctifs rapides

```
v2.0.3 - 2024-12-03 [Actuelle]
└ Fix: lien cassé vers ressources externes

v2.0.2 - 2024-12-01
└ Correction graphique mal affiché

v2.0.1 - 2024-11-29
└ Typo: "automatisaton" → "automatisation"

v2.0 - 2024-11-25
└ Mise à jour majeure du contenu

v1.0 - 2024-10-01
└ Version originale
```

---

## Import dans Notion

Pour importer ce template :

1. Créez une nouvelle database dans votre workspace
2. Ajoutez les propriétés une par une selon le tableau ci-dessus
3. Créez quelques pages de test
4. Configurez les vues recommandées
5. Testez en créant 2 versions d'un même article

---

## Support

En cas de problème :
- Vérifiez que toutes les propriétés ont les bons types
- Assurez-vous que le Database ID est correct dans `.env.local`
- Consultez `VERSIONING_GUIDE.md` pour le dépannage complet

---

**Template créé pour Gabriel Bigot | 2024**
