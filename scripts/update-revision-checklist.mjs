/**
 * Regenera REVISION-PROGRESO.md a partir de data/applications.ts,
 * preservando el estado [x]/[ ] de las apps ya marcadas en el archivo existente.
 *
 * Uso: node scripts/update-revision-checklist.mjs
 */
import fs from 'fs';

const SUITE_NAMES = {
  accesibilidad: 'Accesibilidad e Inclusión',
  cultura: 'Cultura General',
  diseno: 'Diseño y Contenido',
  estudiantes: 'Estudiantes',
  finanzas: 'Finanzas e Inversión',
  freelance: 'Freelance y Autónomo',
  tecnicas: 'Herramientas Técnicas',
  inmobiliaria: 'Inmobiliaria y Hogar',
  juegos: 'Juegos y Ocio',
  'legal-fiscal': 'Legal, Fiscal y Patrimonio',
  productividad: 'Productividad',
  salud: 'Salud y Bienestar',
  viajes: 'Viajes y Turismo',
};
const suiteOrder = Object.keys(SUITE_NAMES);

// 1. Extraer apps actuales de data/applications.ts
const src = fs.readFileSync('data/applications.ts', 'utf8');
const re = /\{\s*name:\s*"((?:[^"\\]|\\.)*)",\s*suites:\s*\[([^\]]*)\][^{}]*?url:\s*"([^"]*)"/gs;
const all = [...src.matchAll(re)].map(m => ({
  name: m[1],
  suites: m[2].split(',').map(s => s.trim().replace(/['"]/g, '')).filter(Boolean),
  url: m[3],
}));

// 2. Leer estado previo (qué urls estaban marcadas [x])
const checked = new Set();
const progressPath = 'REVISION-PROGRESO.md';
if (fs.existsSync(progressPath)) {
  const prev = fs.readFileSync(progressPath, 'utf8');
  const lineRe = /\| \[x\] \| [^|]+ \| `([^`]+)` \|/g;
  for (const m of prev.matchAll(lineRe)) checked.add(m[1]);
}

// 3. Agrupar por suite primaria
const groups = new Map();
for (const app of all) {
  const primary = app.suites[0];
  if (!groups.has(primary)) groups.set(primary, []);
  groups.get(primary).push(app);
}

// 4. Generar markdown
const totalRevisadas = all.filter(a => checked.has(a.url)).length;
let out = '';
out += '# REVISION-PROGRESO.md — Lista maestra de revisión (todas las apps)\n\n';
out += `> Lista maestra **deduplicada por slug** (\`url\`), generada desde \`data/applications.ts\`.\n`;
out += `> Total de apps: **${all.length}**. Cada app aparece UNA sola vez, agrupada bajo su **suite primaria** (primera suite declarada en \`applications.ts\`), pero la columna "Suites" muestra todas las suites a las que pertenece.\n\n`;
out += `> **Cómo usar este archivo**: al revisar una suite, busca en la columna "Suites" las filas que la contengan (independientemente de bajo qué grupo estén listadas) y marca \`[x]\` las que ya se han revisado (sin importar en qué sesión/suite se hizo). Así una app revisada en una suite no se vuelve a revisar al auditar otra suite a la que también pertenece.\n\n`;
out += `> **Plan**: 1-2 sesiones/día, ~16 apps/sesión (ritmo del piloto).\n\n`;
out += `> **Regenerar este archivo**: \`node scripts/update-revision-checklist.mjs\` — preserva las marcas \`[x]\` existentes y añade apps nuevas que se hayan creado mientras tanto.\n\n`;

out += `## Progreso global\n\n`;
out += `- ✅ Revisadas: ${totalRevisadas} / ${all.length}\n`;
out += `- ⬜ Pendientes: ${all.length - totalRevisadas} / ${all.length}\n\n`;

out += `## Resumen por suite primaria\n\n`;
out += `| Suite primaria | Nº apps |\n|---|---|\n`;
for (const s of suiteOrder) {
  const n = (groups.get(s) || []).length;
  if (n > 0) out += `| ${SUITE_NAMES[s]} (\`${s}\`) | ${n} |\n`;
}
for (const [k, v] of groups) {
  if (!suiteOrder.includes(k)) out += `| ⚠️ \`${k}\` (no estándar) | ${v.length} |\n`;
}
out += `| **Total** | **${all.length}** |\n\n`;

out += `---\n\n`;

for (const s of suiteOrder) {
  const apps = groups.get(s);
  if (!apps || apps.length === 0) continue;
  out += `## ${SUITE_NAMES[s]} (\`${s}\`) — ${apps.length} apps\n\n`;
  out += `| Estado | Nombre | URL | Suites |\n|---|---|---|---|\n`;
  const sorted = [...apps].sort((a, b) => a.name.localeCompare(b.name, 'es'));
  for (const app of sorted) {
    const check = checked.has(app.url) ? '[x]' : '[ ]';
    out += `| ${check} | ${app.name} | \`${app.url}\` | ${app.suites.join(', ')} |\n`;
  }
  out += `\n`;
}

fs.writeFileSync(progressPath, out, 'utf8');
console.log(`OK: ${progressPath} actualizado. Total apps: ${all.length}, revisadas: ${totalRevisadas}.`);
