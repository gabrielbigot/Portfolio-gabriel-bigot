#!/usr/bin/env node
// Vérifie le contenu du site : JSON valides, fichiers du registre présents, et chaque t("clé") du code existe dans strings.json.
import fs from 'node:fs'; import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'); let bad = 0;
const fail = m => { bad++; console.error('✗', m); };
const reg = fs.readFileSync(path.join(ROOT, 'lib/site-content-registry.ts'), 'utf8');
for (const [, file] of reg.matchAll(/file: "([^"]+)"/g)) { const f = path.join(ROOT, 'content/site', file); if (!fs.existsSync(f)) fail('fichier manquant : ' + file); else try { JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { fail('JSON invalide : ' + file + ' — ' + e.message); } }
const strings = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/site/strings.json'), 'utf8'));
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? (/node_modules|\.next/.test(e.name) ? [] : walk(path.join(d, e.name))) : /\.tsx?$/.test(e.name) ? [path.join(d, e.name)] : []);
let n = 0;
for (const f of [...walk(path.join(ROOT, 'app')), ...walk(path.join(ROOT, 'components'))]) {
  const src = fs.readFileSync(f, 'utf8'); const nss = [...src.matchAll(/(?:getT|useT)\("([^"]+)"\)/g)].map(m => m[1]); if (!nss.length) continue;
  for (const [, key] of src.matchAll(/\btr?\("([^"$`]+)"\)/g)) { n++; if (!nss.some(ns => strings[ns] && key in strings[ns])) fail(`${path.relative(ROOT, f)} : texte « ${key} » absent de strings.json`); }
}
console.log(bad ? `${bad} problème(s)` : `✓ contenu valide (${n} textes référencés dans le code)`); process.exit(bad ? 1 : 0);
