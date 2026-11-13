#!/usr/bin/env node
/**
 * probar-check-alfa-tres-cifras.mjs — le reinyecta a `check:alfa-tres-cifras` los dos casos de los
 * que nació (C0684, 08/11/2026) y las formas que NO debe encender.
 *
 * Ejecutar:  npm run alfa-tres-cifras:probar-candado
 *
 *   1. CASO DE ORIGEN · visualizador-arquitectura-computador antes de a2c0f1324 (`color: '#666'`
 *      en BLOQUES_VN, que el diagrama pinta con `b.color + 'CC'`). FALLA.
 *   2. El mismo, reparado en a2c0f1324. CALLA.
 *   3. CASO DE ORIGEN · visualizador-carbono antes de 2c2af478a (`color: '#555'` en ALOTROPOS, y
 *      `alotropoInfo.color + '66'` con alotropoInfo = ALOTROPOS.find(…)). FALLA.
 *   4. El mismo, reparado en 2c2af478a. CALLA.
 *   5-7. Los tres ficheros de hoy en los que la PRIMERA versión (ligar solo por el nombre de la
 *      propiedad) encendía en falso: visualizador-optica, visualizador-indice-glucemico y
 *      HistoriaInteractivo (style={{ color: '#fff' }}, tablas que nunca reciben el alfa). CALLA.
 *   8. La forma en plantilla, `${b.color}55`, sobre una tabla con un color corto. FALLA.
 *   9. Lo mismo con «alfa-ok: <razón>» en la línea anterior. CALLA.
 *  10. «alfa-ok:» a secas. FALLA.
 *  11. Un color de seis cifras en la tabla. CALLA.
 *
 * No escribe NADA en el repositorio: los ficheros van a un directorio temporal.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CANDADO = path.join(RAIZ, 'scripts', 'check-alfa-tres-cifras.mjs');
const deGit = (rev, ruta) => execFileSync('git', ['show', `${rev}:${ruta}`], { cwd: RAIZ, encoding: 'utf8' });
const hoy = (ruta) => fs.readFileSync(path.join(RAIZ, ruta), 'utf8');

const ARQ = 'app/visualizador-arquitectura-computador/page.tsx';
const CARB = 'app/visualizador-carbono/page.tsx';
const ARQ_ANTES = deGit('a2c0f1324^', ARQ);
const CARB_ANTES = deGit('2c2af478a^', CARB);
if (!ARQ_ANTES.includes("color: '#666'") || !ARQ_ANTES.includes("b.color + 'CC'")) { console.error('❌ arquitectura-computador antes de a2c0f1324 ya no es el caso de origen'); process.exit(1); }
if (!CARB_ANTES.includes("color: '#555'") || !CARB_ANTES.includes("alotropoInfo.color + '66'")) { console.error('❌ carbono antes de 2c2af478a ya no es el caso de origen'); process.exit(1); }

const sintetico = (fila, previa = '') => `const TABLA = [\n  { id: 'a', color: '#2E86AB' },\n${previa}${fila}\n];\nexport function V() {\n  return TABLA.map((b) => <div key={b.id} style={{ background: \`\${b.color}55\` }} />);\n}\n`;

const CASOS = [
  { n: 1, nombre: 'CASO DE ORIGEN · arquitectura-computador antes de a2c0f1324', falla: true, txt: ARQ_ANTES },
  { n: 2, nombre: 'arquitectura-computador reparado en a2c0f1324', falla: false, txt: deGit('a2c0f1324', ARQ) },
  { n: 3, nombre: 'CASO DE ORIGEN · carbono antes de 2c2af478a', falla: true, txt: CARB_ANTES },
  { n: 4, nombre: 'carbono reparado en 2c2af478a', falla: false, txt: deGit('2c2af478a', CARB) },
  { n: 5, nombre: 'falso positivo de la 1.ª versión · visualizador-optica de hoy', falla: false, txt: hoy('app/visualizador-optica/page.tsx') },
  { n: 6, nombre: 'falso positivo de la 1.ª versión · visualizador-indice-glucemico de hoy', falla: false, txt: hoy('app/visualizador-indice-glucemico/page.tsx') },
  { n: 7, nombre: 'falso positivo de la 1.ª versión · HistoriaInteractivo de hoy', falla: false, txt: hoy('app/visualizador-historia/[slug]/HistoriaInteractivo.tsx') },
  { n: 8, nombre: 'plantilla `${b.color}55` sobre un color corto', falla: true, txt: sintetico("  { id: 'b', color: '#999' },") },
  { n: 9, nombre: 'alfa-ok: con razón', falla: false, txt: sintetico("  { id: 'b', color: '#999' },", '  // alfa-ok: esta fila se filtra antes de pintarse, nunca recibe el alfa\n') },
  { n: 10, nombre: 'alfa-ok: a secas', falla: true, txt: sintetico("  { id: 'b', color: '#999' },", '  // alfa-ok:\n') },
  { n: 11, nombre: 'color de seis cifras', falla: false, txt: sintetico("  { id: 'b', color: '#999999' },") },
];

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'alfa-tres-cifras-'));
let mal = 0;
try {
  for (const c of CASOS) {
    const f = path.join(dir, `caso-${c.n}.tsx`);
    fs.writeFileSync(f, c.txt);
    const r = spawnSync(process.execPath, [CANDADO, f], { cwd: RAIZ, encoding: 'utf8' });
    const fallo = r.status !== 0;
    const ok = fallo === c.falla;
    if (!ok) mal++;
    console.log(`${ok ? '✓' : '✖'} ${c.n}. ${c.nombre} → ${fallo ? 'FALLA' : 'calla'}${ok ? '' : ` (se esperaba ${c.falla ? 'FALLA' : 'calla'})\n${r.stdout}${r.stderr}`}`);
  }
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
console.log(mal ? `\n❌ ${mal} caso(s) mal: el candado NO es fiable` : `\n✅ ${CASOS.length} casos como se esperaba`);
process.exit(mal ? 1 : 0);
