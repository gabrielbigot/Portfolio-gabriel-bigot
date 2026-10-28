#!/usr/bin/env node
/*
 * extract-site-content.mjs — migration ponctuelle : sort le contenu du code (lib/data.ts, project-translations-en.ts, portfolio-i18n.ts)
 * vers des fichiers JSON éditables dans content/site/. Rejouable tant que les anciens fichiers existent (voir git).
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'content', 'site');
fs.mkdirSync(OUT, { recursive: true });
const write = (name, data) => { fs.writeFileSync(path.join(OUT, name + '.json'), JSON.stringify(data, null, 2) + '\n'); console.log('✓', name, JSON.stringify(data).length + ' o'); };

const data = await import(pathToFileURL(path.join(ROOT, 'lib/data.ts')).href);
const KEYS = { personalInfo: 'personal-info', socialLinks: 'social-links', education: 'education', workExperience: 'work-experience', skills: 'skills', timeline: 'timeline', achievements: 'achievements', interests: 'interests', companies: 'companies', projects: 'projects', blogPosts: 'blog-posts', metadata: 'metadata' };
for (const [k, f] of Object.entries(KEYS)) { if (!(k in data)) throw new Error('export manquant : ' + k); write(f, data[k]); }

const tr = await import(pathToFileURL(path.join(ROOT, 'lib/project-translations-en.ts')).href);
write('projects-en', tr.projectTranslationsEn);

// littéraux de portfolio-i18n.ts (non exportés)
const readSrc = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
let src = readSrc('lib/portfolio-i18n.ts');
function literalAfter(marker, from = 0) {
  const i = src.indexOf(marker, from); if (i < 0) throw new Error('marqueur introuvable : ' + marker);
  let p = i + marker.length; while (!'[{'.includes(src[p])) p++;
  const open = src[p], close = open === '[' ? ']' : '}'; let depth = 0, q = p;
  for (; q < src.length; q++) {
    const c = src[q];
    if (c === '"' || c === "'" || c === '`') { const quote = c; q++; while (src[q] !== quote) { if (src[q] === '\\') q++; q++; } continue; }
    if (c === '/' && src[q + 1] === '/') { while (src[q] !== '\n') q++; continue; }
    if (c === '/' && src[q + 1] === '*') { q = src.indexOf('*/', q) + 1; continue; }
    if (c === open) depth++; else if (c === close && --depth === 0) break;
  }
  return new Function('return ' + src.slice(p, q + 1))();
}
const enProfile = {
  personalInfoOverrides: { title: 'AI Automation Developer', tagline: 'Economics and management student applying AI and automation to real business processes', availability: 'Available now', currentRole: { position: 'Third-year Economics & Management student', location: 'Lille, France' } },
  languages: [{ name: 'French', level: 'Native' }, { name: 'English', level: 'Working proficiency' }],
  workExperience: literalAfter('const workExperienceEn = '),
  technicalSkills: literalAfter('const technicalSkillsEn = '),
  softSkills: literalAfter('const softSkillsEn = '),
  curatedProjectLabels: literalAfter('> = ', src.indexOf('const projectTranslations: Record<')),
};
write('en-profile', enProfile);

// contenus écrits en dur dans les pages
const lit = (file, marker, from = 0) => { src = readSrc(file); return literalAfter(marker, from); };
write('about-fr', lit('app/about/page.tsx', '}[] = '));
write('about-en', lit('app/en/about/page.tsx', 'const milestones = '));
write('uses-fr', lit('app/uses/page.tsx', 'UsesCategory[] = '));
write('uses-en', lit('app/en/uses/page.tsx', 'const usesData = '));
write('ui-portfolio', lit('components/PortfolioClient.tsx', 'const portfolioCopy = '));
write('ui-projects', lit('components/ProjectsPageClient.tsx', 'const projectsCopy = '));
