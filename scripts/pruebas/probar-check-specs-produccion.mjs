#!/usr/bin/env node
/**
 * probar-check-specs-produccion.mjs — le reinyecta a `check:specs-produccion` los casos de los
 * que nació (P004 del repaso de procesos, 08/11/2026) y las formas que NO debe encender.
 *
 * Ejecutar:  npm run specs-produccion:probar-candado      (VER=1 imprime la salida de todos)
 *
 * El candado juzga lo que el commit AÑADE, así que cada caso monta un repositorio git temporal:
 * `antes` se commitea, `despues` se deja en el árbol de trabajo, y el candado mira el diff.
 * «Reinyectar» es eso: commitear el spec ARREGLADO y deshacer el arreglo en el árbol, que es
 * exactamente el commit que escribió la trampa.
 *
 *   1-2. CASO DE ORIGEN · a57337a0c, orientacion-tramitacion-herencias: `[class*="OrientacionHerencias"]`.
 *        Sin el arreglo, FALLA; el spec arreglado como fichero nuevo CALLA (su comentario cita la forma).
 *   3-4. CASO DE ORIGEN · c0f8ad3b9, guias-cifra-fichas-familia: `__${fin}$`. Igual.
 *   5-6. CASO DE ORIGEN · 10b6d8a2d, las portadas de portal: waitForLoadState('networkidle'). Igual.
 *   7.   Pasivo: el spec sin el arreglo de 10b6d8a2d ya commiteado, y el commit solo añade un comentario. CALLA.
 *   8-9. `produccion-ok: <razón>` CALLA; `produccion-ok:` a secas FALLA.
 *   10.  Espías y claves internas (`w.__tono`, `__reactProps$`, `'__reactProps'`, `VentanaMorse['__morse']`,
 *        `'__next-route-announcer__'`, `#__next`). CALLA.
 *   11.  Colas camelCase con mayúscula (`[class*="calcBtn"]:not([class*="Ghost"])`). CALLA.
 *   12.  La receta: `[class$="_card"]` y `selectorDelModulo`. CALLA.
 *   13.  `/__card$/`, expresión regular literal. FALLA.
 *   14.  `[class*="page-module"]`. FALLA.
 *   15.  `page.goto(url, { waitUntil: 'networkidle' })`. FALLA.
 *   16.  'networkidle' en un comentario y dentro del título de un test. CALLA.
 *   17.  'networkidle' en un fichero fuera de tests/. CALLA.
 *   18.  `[class*="DataReference"]`, módulo de un componente compartido. FALLA.
 *
 * No escribe NADA en el repositorio: todo vive en directorios temporales.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CANDADO = path.join(RAIZ, 'scripts', 'check-specs-produccion.mjs');

const deGit = (rev, ruta) => execFileSync('git', ['show', `${rev}:${ruta}`], { cwd: RAIZ, encoding: 'utf8' });
const version = (rev, ruta) => ({ [ruta]: deGit(rev, ruta) });

const HERENCIAS = 'tests/apps/orientacion-tramitacion-herencias.spec.ts';
const FICHAS = 'tests/apps/guias-cifra-fichas-familia.spec.ts';
const PORTADAS = 'tests/apps/anio-fecha-legal-hidratacion.spec.ts';

// Que los casos de origen sigan siendo los que eran: si el historial cambia, mejor plantarse.
const comprobar = (rev, ruta, trozo) => {
  if (!deGit(rev, ruta).includes(trozo)) {
    console.error(`❌ El caso de origen ya no es el que era: ${ruta} en ${rev} no contiene «${trozo}»`);
    process.exit(1);
  }
};
comprobar('a57337a0c^', HERENCIAS, '[class*="OrientacionHerencias"]');
comprobar('c0f8ad3b9^', FICHAS, 'new RegExp(`__${fin}$`)');
comprobar('10b6d8a2d^', PORTADAS, "waitForLoadState('networkidle')");

const SPEC = 'tests/apps/prueba.spec.ts';
const spec = (cuerpo) => ({
  [SPEC]: `import { test, expect } from '@playwright/test';\n\ntest('prueba', async ({ page }) => {\n${cuerpo}\n});\n`,
});

const CASOS = [
  { n: 1, nombre: 'CASO DE ORIGEN · a57337a0c sin el arreglo ([class*="OrientacionHerencias"])', debeFallar: true, antes: version('a57337a0c', HERENCIAS), despues: version('a57337a0c^', HERENCIAS) },
  { n: 2, nombre: 'a57337a0c arreglado, como fichero nuevo', debeFallar: false, despues: version('a57337a0c', HERENCIAS) },
  { n: 3, nombre: 'CASO DE ORIGEN · c0f8ad3b9 sin el arreglo (`__${fin}$`)', debeFallar: true, antes: version('c0f8ad3b9', FICHAS), despues: version('c0f8ad3b9^', FICHAS) },
  { n: 4, nombre: 'c0f8ad3b9 arreglado, como fichero nuevo', debeFallar: false, despues: version('c0f8ad3b9', FICHAS) },
  { n: 5, nombre: "CASO DE ORIGEN · 10b6d8a2d sin el arreglo (waitForLoadState('networkidle'))", debeFallar: true, antes: version('10b6d8a2d', PORTADAS), despues: version('10b6d8a2d^', PORTADAS) },
  { n: 6, nombre: '10b6d8a2d arreglado, como fichero nuevo', debeFallar: false, despues: version('10b6d8a2d', PORTADAS) },
  {
    n: 7, nombre: 'pasivo: el commit solo añade un comentario a un spec con networkidle', debeFallar: false,
    antes: version('10b6d8a2d^', PORTADAS),
    despues: { [PORTADAS]: deGit('10b6d8a2d^', PORTADAS).replace(/^(import .*\n)/, '$1// retocado\n') },
  },
  {
    n: 8, nombre: 'produccion-ok: con razón', debeFallar: false,
    despues: spec("  // produccion-ok: la página no tiene <Link>, no hay prefetch que deje la red colgada\n  await page.waitForLoadState('networkidle');"),
  },
  {
    n: 9, nombre: 'produccion-ok: a secas', debeFallar: true,
    despues: spec("  // produccion-ok:\n  await page.waitForLoadState('networkidle');"),
  },
  {
    n: 10, nombre: 'espías en window y claves internas', debeFallar: false,
    despues: spec([
      "  type VentanaMorse = { __morse: number };",
      "  const m: VentanaMorse['__morse'] = 1;",
      "  await page.evaluate(() => { (window as unknown as { __tono: number }).__tono = 1; });",
      "  await page.evaluate(() => Object.keys(document.body).some((k) => k.startsWith('__reactProps$') || k.startsWith('__reactProps')));",
      "  await page.locator('#__next').count();",
      "  await page.locator('[role=alert]').filter({ hasNot: page.locator('#x') }).evaluateAll((r) => r.filter((e) => e.id !== '__next-route-announcer__'));",
      "  await page.addInitScript(`window.__espia = []`);",
      '  expect(m).toBe(1);',
    ].join('\n')),
  },
  {
    n: 11, nombre: 'colas camelCase con mayúscula', debeFallar: false,
    despues: spec("  await page.locator('[class*=\"calcBtn\"]:not([class*=\"Ghost\"])').click();\n  await page.locator('[class*=\"_modal\"]:not([class*=\"Overlay\"])').count();"),
  },
  {
    n: 12, nombre: 'la receta: [class$="_card"] y selectorDelModulo', debeFallar: false,
    despues: spec("  const mod = await selectorDelModulo(page.locator('h1'), 'titulo');\n  await page.locator(`${mod}[class$=\"_card\"]`).count();\n  await page.locator('[class$=\"_card\"]').count();"),
  },
  {
    n: 13, nombre: '/__card$/, expresión regular literal', debeFallar: true,
    despues: spec("  await page.evaluate(() => [...document.querySelectorAll('[class]')].filter((e) => /__card$/.test(e.className)).length);"),
  },
  {
    n: 14, nombre: '[class*="page-module"]', debeFallar: true,
    despues: spec("  await page.locator('[class*=\"page-module\"]').count();"),
  },
  {
    n: 15, nombre: "goto con waitUntil: 'networkidle'", debeFallar: true,
    despues: spec("  await page.goto('/calculadora-iva/', { waitUntil: 'networkidle' });"),
  },
  {
    n: 16, nombre: "'networkidle' en un comentario y dentro de un título", debeFallar: false,
    despues: {
      [SPEC]: "import { test } from '@playwright/test';\n\n// NO 'networkidle': en producción no llega nunca\ntest('mide tras networkidle no, tras esperarPaginaAsentada', async ({ page }) => {\n  await page.goto('/');\n});\n",
    },
  },
  {
    n: 17, nombre: "'networkidle' fuera de tests/", debeFallar: false,
    despues: { 'scripts/x.mjs': "await page.waitForLoadState('networkidle');\n" },
  },
  {
    n: 18, nombre: '[class*="DataReference"], módulo de un componente compartido', debeFallar: true,
    despues: spec("  await page.locator('[class*=\"DataReference\"]').count();"),
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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'candado-specs-produccion-'));
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
