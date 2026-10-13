#!/usr/bin/env node
/**
 * probar-check-bailout.mjs — le reinyecta a `check:bailout` el caso del que nació y las formas
 * que NO debe encender.
 *
 * Ejecutar:  npm run bailout:probar-candado
 *
 * Cada caso monta un árbol de HTML falso (60 páginas sin bailout más las del caso) en un
 * directorio temporal y le pasa `--dir`. El fragmento es el que dejó `next build` el 13/10/2026
 * en estimador-cartera-inversion.html, copiado tal cual.
 *
 *   1. CASO DE ORIGEN · ese fragmento en una página que no está declarada. Debe FALLAR.
 *   2. El mismo en estimador-cartera-inversion, que sí lo está. Debe CALLAR.
 *   3. Ninguna página con bailout. Debe CALLAR (y avisar de que cartera sobra en la lista).
 *   4. Bailout en una ruta anidada (guia/x). Debe FALLAR.
 *   5. La palabra BAILOUT en un .txt o .rsc, no en un .html. Debe CALLAR.
 *   6. SE PLANTA · un árbol con 10 HTML no es un build completo.
 *   7. SE PLANTA · el directorio no existe.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CANDADO = path.join(RAIZ, 'scripts', 'check-bailout-prerender.mjs');

const FRAGMENTO = '</aside><!--$!--><template data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING"></template><!--/$--><div class="mainContent">';
const pagina = (cuerpo = '<main>contenido</main>') => `<!DOCTYPE html><html><body>${cuerpo}</body></html>`;
const relleno = (n = 60) => Object.fromEntries(Array.from({ length: n }, (_, i) => [`app-${i}.html`, pagina()]));

const CASOS = [
  { n: 1, nombre: 'CASO DE ORIGEN · el fragmento en una página sin declarar', debeFallar: true, ficheros: { ...relleno(), 'simulador-nuevo.html': pagina(FRAGMENTO) } },
  { n: 2, nombre: 'el fragmento en estimador-cartera-inversion (declarada)', debeFallar: false, ficheros: { ...relleno(), 'estimador-cartera-inversion.html': pagina(FRAGMENTO) } },
  { n: 3, nombre: 'ninguna página con bailout', debeFallar: false, avisa: /ya no tiene bailout/, ficheros: relleno() },
  { n: 4, nombre: 'bailout en una ruta anidada', debeFallar: true, ficheros: { ...relleno(), 'guia/x.html': pagina(FRAGMENTO) } },
  { n: 5, nombre: 'BAILOUT en un .txt y un .rsc, no en .html', debeFallar: false, ficheros: { ...relleno(), 'x.txt': FRAGMENTO, 'x.rsc': FRAGMENTO } },
  { n: 6, nombre: 'SE PLANTA · solo 10 HTML', debeFallar: true, ficheros: relleno(10) },
  { n: 7, nombre: 'SE PLANTA · el directorio no existe', debeFallar: true, ficheros: null },
];

let fallos = 0;
for (const c of CASOS) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'candado-bailout-'));
  const dir = path.join(base, 'app');
  try {
    if (c.ficheros) {
      for (const [rel, contenido] of Object.entries(c.ficheros)) {
        fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
        fs.writeFileSync(path.join(dir, rel), contenido);
      }
    }
    let fallo = false;
    let salida = '';
    try {
      salida = execFileSync(process.execPath, [CANDADO, '--dir', dir], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (e) {
      fallo = true;
      salida = `${e.stdout ?? ''}${e.stderr ?? ''}`;
    }
    const bien = fallo === c.debeFallar && (!c.avisa || c.avisa.test(salida));
    if (!bien) fallos++;
    console.log(`${bien ? '✅' : '❌'} ${c.n}. ${c.nombre} — ${c.debeFallar ? 'debe FALLAR' : 'debe CALLAR'}, ${fallo ? 'falla' : 'calla'}`);
    if (!bien || process.env.VER) console.log(salida.split('\n').map((l) => `      ${l}`).join('\n'));
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
}

console.log(fallos ? `\n❌ ${fallos} caso(s) no se comportan como deben` : `\n✅ Los ${CASOS.length} casos se comportan como deben`);
process.exit(fallos ? 1 : 0);
