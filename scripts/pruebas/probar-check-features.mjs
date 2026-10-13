#!/usr/bin/env node
/**
 * probar-check-features.mjs — le reinyecta a `check:features` el caso del que nació y las
 * formas que NO debe encender.
 *
 * Ejecutar:  npm run features:probar-candado
 *
 * El candado juzga lo que el commit AÑADE, así que cada caso monta un repositorio git temporal:
 * `antes` se commitea, `despues` se deja en el árbol de trabajo, y el candado mira el diff.
 *
 *   1. CASO DE ORIGEN · etiqueta-dgt antes de a97f92ab (`features: []`), como fichero NUEVO.
 *      Debe FALLAR.
 *   2. El mismo, reparado en a97f92ab, como fichero nuevo. Debe CALLAR.
 *   3. El de antes ya commiteado, y el commit solo toca el title. Debe CALLAR: es pasivo.
 *   4. El de antes ya commiteado, y el commit reescribe la lista pero la deja vacía. Debe FALLAR.
 *   5. Fichero nuevo con 3 características. Debe FALLAR.
 *   6. Fichero nuevo con la lista vacía en dos líneas. Debe FALLAR.
 *   7. `features: FUNCIONES` (una constante). Debe CALLAR.
 *   8. `features: [...BASE, 'x']` (un spread). Debe CALLAR.
 *   9. `features-ok: <razón>` en la línea anterior. Debe CALLAR.
 *  10. `features-ok:` a secas. Debe FALLAR.
 *  11. `features: []` dentro de un comentario. Debe CALLAR.
 *  12. `featureList: []` en un layout.tsx nuevo. Debe FALLAR.
 *  13. `features: []` en un page.tsx (datos de la app, no JSON-LD). Debe CALLAR.
 *
 * No escribe NADA en el repositorio: todo vive en directorios temporales.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CANDADO = path.join(RAIZ, 'scripts', 'check-features-jsonld.mjs');

const deGit = (rev, ruta) => execFileSync('git', ['show', `${rev}:${ruta}`], { cwd: RAIZ, encoding: 'utf8' });
const DGT = 'app/etiqueta-dgt/metadata.ts';
const DGT_ANTES = deGit('a97f92ab^', DGT);
const DGT_DESPUES = deGit('a97f92ab', DGT);
if (!/features:\s*\[\s*\]/.test(DGT_ANTES)) {
  console.error('❌ El caso de origen ya no es el que era: etiqueta-dgt antes de a97f92ab no tiene features: []');
  process.exit(1);
}

const META = 'app/prueba/metadata.ts';
const meta = (lista, extra = '') =>
  `import { generateWebAppSchema } from '@/lib/schema-templates';\n${extra}\nexport const jsonLd = generateWebAppSchema({\n  name: 'Prueba',\n  description: 'Prueba',\n  url: 'https://meskeia.com/prueba/',\n  features: ${lista},\n});\n`;

const CASOS = [
  { n: 1, nombre: 'CASO DE ORIGEN · etiqueta-dgt antes de a97f92ab, fichero nuevo', debeFallar: true, despues: { [DGT]: DGT_ANTES } },
  { n: 2, nombre: 'CASO DE ORIGEN REPARADO · etiqueta-dgt en a97f92ab', debeFallar: false, despues: { [DGT]: DGT_DESPUES } },
  {
    n: 3, nombre: 'pasivo: el commit solo toca el title', debeFallar: false,
    antes: { [DGT]: DGT_ANTES },
    despues: { [DGT]: DGT_ANTES.replace(/title:\s*'([^']*)'/, "title: '$1 (retocado)'") },
  },
  {
    n: 4, nombre: 'el commit reescribe la lista y la deja vacía', debeFallar: true,
    antes: { [DGT]: DGT_ANTES },
    despues: { [DGT]: DGT_ANTES.replace(/features:\s*\[\s*\]/, 'features: [ ]') },
  },
  { n: 5, nombre: 'fichero nuevo con 3 características', debeFallar: true, despues: { [META]: meta("['a', 'b', 'c']") } },
  { n: 6, nombre: 'lista vacía en dos líneas', debeFallar: true, despues: { [META]: meta('[\n  ]') } },
  { n: 7, nombre: 'features: FUNCIONES (constante)', debeFallar: false, despues: { [META]: meta('FUNCIONES', "const FUNCIONES = ['a'];") } },
  { n: 8, nombre: "features: [...BASE, 'x'] (spread)", debeFallar: false, despues: { [META]: meta("[...BASE, 'x']", "const BASE = ['a'];") } },
  {
    n: 9, nombre: 'features-ok: con razón', debeFallar: false,
    despues: { [META]: meta('[]').replace('  features:', '  // features-ok: página de redirección, no es una app\n  features:') },
  },
  {
    n: 10, nombre: 'features-ok: a secas', debeFallar: true,
    despues: { [META]: meta('[]').replace('  features:', '  // features-ok:\n  features:') },
  },
  {
    n: 11, nombre: 'features: [] en un comentario', debeFallar: false,
    despues: { [META]: meta("['a', 'b', 'c', 'd']", '// antes era features: []\n/* features: [] */') },
  },
  {
    n: 12, nombre: 'featureList: [] en un layout.tsx nuevo', debeFallar: true,
    despues: { 'app/prueba/layout.tsx': "const ld = { '@type': 'WebApplication', featureList: [] };\nexport default function L() { return null; }\n" },
  },
  {
    n: 13, nombre: 'features: [] en un page.tsx (datos, no JSON-LD)', debeFallar: false,
    despues: { 'app/prueba/page.tsx': 'const modelos = [{ nombre: "x", features: [] }];\nexport default function P() { return null; }\n' },
  },
];

const escribir = (dir, ficheros) => {
  for (const [rel, contenido] of Object.entries(ficheros)) {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), contenido);
  }
};
const gitEn = (dir, args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

let fallos = 0;
for (const c of CASOS) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'candado-features-'));
  try {
    gitEn(dir, ['init', '-q']);
    gitEn(dir, ['config', 'user.email', 'pruebas@localhost']);
    gitEn(dir, ['config', 'user.name', 'pruebas']);
    gitEn(dir, ['config', 'core.autocrlf', 'false']);
    escribir(dir, { 'LEEME.txt': 'base\n', ...(c.antes ?? {}) });
    gitEn(dir, ['add', '-A']);
    gitEn(dir, ['commit', '-q', '-m', 'base']);
    escribir(dir, c.despues);

    let fallo = false;
    let salida = '';
    try {
      salida = execFileSync(process.execPath, [CANDADO, '--raiz', dir], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (e) {
      fallo = true;
      salida = `${e.stdout ?? ''}${e.stderr ?? ''}`;
    }
    const bien = fallo === c.debeFallar;
    if (!bien) fallos++;
    console.log(`${bien ? '✅' : '❌'} ${String(c.n).padStart(2)}. ${c.nombre} — ${c.debeFallar ? 'debe FALLAR' : 'debe CALLAR'}, ${fallo ? 'falla' : 'calla'}`);
    if (!bien || process.env.VER) console.log(salida.split('\n').map((l) => `      ${l}`).join('\n'));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

console.log(fallos ? `\n❌ ${fallos} caso(s) no se comportan como deben` : `\n✅ Los ${CASOS.length} casos se comportan como deben`);
process.exit(fallos ? 1 : 0);
