import { config, collection, singleton, fields } from '@keystatic/core'

export default config({
  storage:
    process.env.NODE_ENV === 'production'
      ? {
          kind: 'github',
          repo: { owner: 'gabrielbigot', name: 'Portfolio-gabriel-bigot' },
        }
      : { kind: 'local' },

  ui: {
    brand: { name: 'Portfolio — Gabriel Bigot' },
  },

  singletons: {
    personalInfo: singleton({
      label: 'Informations personnelles',
      path: 'content/personal-info/',
      schema: {
        name: fields.text({ label: 'Nom complet' }),
        firstName: fields.text({ label: 'Prénom' }),
        lastName: fields.text({ label: 'Nom' }),
        title: fields.text({ label: 'Titre professionnel' }),
        tagline: fields.text({ label: 'Tagline', multiline: true }),
        location: fields.text({ label: 'Localisation' }),
        email: fields.text({ label: 'Email' }),
        phone: fields.text({ label: 'Téléphone' }),
        availability: fields.text({ label: 'Disponibilité' }),
        bioShort: fields.text({ label: 'Bio courte', multiline: true }),
        bioFull: fields.text({ label: 'Bio complète', multiline: true }),
        cvUrl: fields.text({ label: 'URL du CV' }),
        objectiveTitle: fields.text({ label: 'Titre objectif' }),
        objectiveText: fields.text({ label: 'Texte objectif', multiline: true }),
        currentRolePosition: fields.text({ label: 'Poste actuel' }),
        currentRoleCompany: fields.text({ label: 'Entreprise actuelle' }),
        currentRoleLocation: fields.text({ label: 'Lieu' }),
        currentRoleStartDate: fields.text({ label: 'Date de début' }),
      },
    }),

    skills: singleton({
      label: 'Compétences',
      path: 'content/skills/',
      schema: {
        languages: fields.array(
          fields.object({
            name: fields.text({ label: 'Langue' }),
            level: fields.text({ label: 'Niveau (ex: Natif, Opérationnel)' }),
            certification: fields.text({ label: 'Certification (optionnel)' }),
          }),
          { label: 'Langues', itemLabel: (props) => props.fields.name.value }
        ),
        soft: fields.array(
          fields.object({
            name: fields.text({ label: 'Compétence' }),
            description: fields.text({ label: 'Description', multiline: true }),
          }),
          { label: 'Soft skills', itemLabel: (props) => props.fields.name.value }
        ),
        technical: fields.array(
          fields.object({
            category: fields.text({ label: 'Catégorie' }),
            skills: fields.array(
              fields.object({
                name: fields.text({ label: 'Nom' }),
                level: fields.number({ label: 'Niveau (0-100)', validation: { min: 0, max: 100 } }),
                description: fields.text({ label: 'Description' }),
              }),
              { label: 'Skills', itemLabel: (props) => props.fields.name.value }
            ),
          }),
          { label: 'Catégories techniques', itemLabel: (props) => props.fields.category.value }
        ),
      },
    }),
  },

  collections: {
    projects: collection({
      label: 'Projets',
      slugField: 'title',
      path: 'content/projects/*',
      schema: {
        title: fields.slug({ name: { label: 'Titre du projet' } }),
        shortDescription: fields.text({ label: 'Description courte', multiline: true }),
        fullDescription: fields.text({ label: 'Description complète', multiline: true }),
        category: fields.text({ label: 'Catégorie principale' }),
        categories: fields.array(fields.text({ label: 'Catégorie' }), {
          label: 'Catégories',
          itemLabel: (props) => props.value,
        }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (props) => props.value,
        }),
        date: fields.text({ label: 'Date (ex: 2025-09)' }),
        company: fields.text({ label: 'Entreprise' }),
        featured: fields.checkbox({ label: 'Projet phare', defaultValue: false }),
        image: fields.text({ label: 'Image (ex: /projects/mon-projet.jpg)' }),
        problem: fields.text({ label: 'Problématique', multiline: true }),
        solution: fields.text({ label: 'Solution apportée', multiline: true }),
        impact: fields.array(fields.text({ label: 'Impact' }), {
          label: 'Impact & Résultats',
          itemLabel: (props) => props.value,
        }),
        technologies: fields.array(
          fields.object({
            name: fields.text({ label: 'Nom' }),
            usage: fields.text({ label: 'Usage' }),
          }),
          { label: 'Technologies', itemLabel: (props) => props.fields.name.value }
        ),
        challenges: fields.array(fields.text({ label: 'Défi' }), {
          label: 'Défis techniques',
          itemLabel: (props) => props.value,
        }),
        learnings: fields.array(fields.text({ label: 'Apprentissage' }), {
          label: 'Apprentissages clés',
          itemLabel: (props) => props.value,
        }),
      },
    }),

    companies: collection({
      label: 'Expériences',
      slugField: 'company',
      path: 'content/companies/*',
      schema: {
        company: fields.slug({ name: { label: 'Nom de l\'entreprise' } }),
        position: fields.text({ label: 'Poste occupé' }),
        location: fields.text({ label: 'Lieu' }),
        startDate: fields.text({ label: 'Date début (YYYY-MM-DD)' }),
        endDate: fields.text({ label: 'Date fin (YYYY-MM-DD)' }),
        current: fields.checkbox({ label: 'Poste actuel', defaultValue: false }),
        type: fields.text({ label: 'Type (Stage, CDI, Job d\'été, Bénévolat...)' }),
        shortDescription: fields.text({ label: 'Description courte', multiline: true }),
        description: fields.text({ label: 'Description complète', multiline: true }),
        logo: fields.text({ label: 'URL du logo (optionnel)' }),
        logoBackground: fields.text({ label: 'Couleur fond logo (optionnel, ex: #ffffff)' }),
        companyUrl: fields.text({ label: 'Site web de l\'entreprise (optionnel)' }),
        technologies: fields.array(fields.text({ label: 'Technologie' }), {
          label: 'Technologies utilisées',
          itemLabel: (props) => props.value,
        }),
        achievements: fields.array(fields.text({ label: 'Réalisation' }), {
          label: 'Réalisations clés',
          itemLabel: (props) => props.value,
        }),
      },
    }),

    blogPosts: collection({
      label: 'Articles de blog',
      slugField: 'title',
      path: 'content/blog/*',
      schema: {
        title: fields.slug({ name: { label: 'Titre de l\'article' } }),
        excerpt: fields.text({ label: 'Résumé (affiché dans les listes)', multiline: true }),
        date: fields.text({ label: 'Date (ex: 2025-10)' }),
        readingTime: fields.text({ label: 'Temps de lecture (ex: 8 min)' }),
        category: fields.text({ label: 'Catégorie' }),
        featured: fields.checkbox({ label: 'Article mis en avant', defaultValue: false }),
        published: fields.checkbox({ label: 'Publié', defaultValue: false }),
        content: fields.document({
          label: 'Contenu',
          formatting: {
            headingLevels: [2, 3],
            inlineMarks: { bold: true, italic: true, code: true },
            listTypes: { ordered: true, unordered: true },
            blockTypes: { blockquote: true, code: true },
          },
          links: true,
          dividers: true,
        }),
      },
    }),

    education: collection({
      label: 'Formation',
      slugField: 'degree',
      path: 'content/education/*',
      schema: {
        degree: fields.slug({ name: { label: 'Diplôme' } }),
        school: fields.text({ label: 'École / Établissement' }),
        location: fields.text({ label: 'Lieu' }),
        startDate: fields.text({ label: 'Année de début' }),
        endDate: fields.text({ label: 'Année de fin' }),
        description: fields.text({ label: 'Description', multiline: true }),
        highlights: fields.array(fields.text({ label: 'Point clé' }), {
          label: 'Points clés',
          itemLabel: (props) => props.value,
        }),
      },
    }),

    achievements: collection({
      label: 'Réalisations',
      slugField: 'title',
      path: 'content/achievements/*',
      schema: {
        title: fields.slug({ name: { label: 'Titre' } }),
        date: fields.text({ label: 'Date / Année' }),
        organization: fields.text({ label: 'Organisation' }),
        description: fields.text({ label: 'Description', multiline: true }),
        icon: fields.text({ label: 'Icône (trophy, certificate, award...)' }),
      },
    }),

    interests: collection({
      label: "Centres d'intérêt",
      slugField: 'name',
      path: 'content/interests/*',
      schema: {
        name: fields.slug({ name: { label: 'Nom' } }),
        icon: fields.text({ label: 'Icône (emoji)' }),
        description: fields.text({ label: 'Description', multiline: true }),
      },
    }),

    timeline: collection({
      label: 'Timeline / Parcours',
      slugField: 'title',
      path: 'content/timeline/*',
      schema: {
        title: fields.slug({ name: { label: 'Titre' } }),
        year: fields.text({ label: 'Année (ex: 2025 ou 2020-2023)' }),
        description: fields.text({ label: 'Description', multiline: true }),
        type: fields.select({
          label: 'Type',
          options: [
            { label: 'Réalisation', value: 'achievement' },
            { label: 'Travail', value: 'work' },
            { label: 'Formation', value: 'education' },
            { label: 'Vie', value: 'life' },
            { label: 'Étape', value: 'milestone' },
          ],
          defaultValue: 'milestone',
        }),
      },
    }),

    socialLinks: collection({
      label: 'Liens sociaux',
      slugField: 'name',
      path: 'content/social-links/*',
      schema: {
        name: fields.slug({ name: { label: 'Nom (GitHub, LinkedIn...)' } }),
        url: fields.text({ label: 'URL' }),
        icon: fields.text({ label: 'Icône (github, linkedin, mail...)' }),
      },
    }),
  },
})
