# Portfolio de Gabriel Bigot

Site personnel présentant mes projets d'automatisation et d'IA, mes expériences et mes essais.

- **Site** : https://gabriel-bigot-portfolio.vercel.app/portfolio
- **Langues** : français (par défaut) et anglais (`/en`)

## Pile technique
Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, déploiement sur Vercel.

## Où modifier le contenu
Tout le contenu est dans `lib/data.ts` (identité, formation, expériences, compétences, projets, essais, frise, entreprises).

| Pour… | Modifier |
|---|---|
| ajouter ou éditer un projet | `projects` dans `lib/data.ts` (champs `featured` pour les projets phares, `status` : `actif` ou `archive`) |
| la version anglaise d'un projet | `lib/project-translations-en.ts` (clé = `slug`) |
| les textes de l'interface en anglais | `lib/portfolio-i18n.ts` |
| les images et vidéos d'un projet | `public/projects/<slug>/` |

## Développement
```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build
```

## Confidentialité
Le dépôt est **public** : ne jamais y committer de clé, de date de naissance, d'adresse, de capture contenant des données réelles ou de document personnel. Les statuts, chiffres et affirmations publiés doivent pouvoir être sourcés.

## Documentation
Les notes de migration Notion et de versionnement des articles sont dans `docs/notion/`.
