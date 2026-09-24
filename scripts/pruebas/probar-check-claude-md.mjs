#!/usr/bin/env node
/**
 * probar-check-claude-md.mjs — le tiende a `check:claude-md` las trampas de las que nació
 *
 * Ejecutar:  npm run claude-md:probar-candado
 *
 * POR QUÉ EXISTE
 * ──────────────
 * Un candado que nunca ha fallado no ha demostrado nada. El 24/09/2026 la lista de
 * obligaciones casó a la primera con las 411 frases del CLAUDE.md, y eso igual puede ser que
 * está bien escrita que que no está mirando. Aquí se le reinyectan las formas de fallo que
 * tiene que ver, y la simétrica que tiene que callar:
 *
 *   1. EL CLAUDE.md REAL — tiene que CALLAR (ningún error; los avisos del molde no cuentan).
 *   2. QUITAR UNA OBLIGACIÓN — la prohibición del violeta #7C3AED desaparece de «Identidad
 *      visual». Tiene que FALLAR y nombrarla.
 *   3. MOVERLA DE SECCIÓN — el `--no-verify` PROHIBIDO sale del pre-commit y acaba en «Archivos
 *      Auxiliares». El texto sigue en el fichero, que es justo lo que el 23/09 hizo pasar la
 *      compactación de memoria por buena. Tiene que FALLAR y decir adónde fue.
 *   4. REFORMATEAR — sin negritas, con dobles espacios y con cada párrafo reflujado en una sola
 *      línea. Tiene que CALLAR: un candado que grita al reformatear se desactiva.
 *   5. CITAR UN `npm run` QUE NO EXISTE. Tiene que FALLAR y nombrarlo.
 *   6. CITAR UN SCRIPT QUE NO EXISTE. Tiene que FALLAR y nombrarlo.
 *   7. UN CANDADO QUE NO ESTÁ EN EL BUILD — una sección «### Candado de…» cuyo comando existe
 *      pero no está en la cadena de `npm run build`. Tiene que FALLAR.
 *   8. UNA SECCIÓN QUE DESAPARECE — «### Regla multi-suite» cambia de nombre. Tiene que FALLAR.
 *   9. MOLDE ROTO — una sección de candado engordada por encima de 1.200 B. Tiene que AVISAR
 *      y CALLAR: el molde es aviso, no candado.
 *
 * Trabaja sobre copias en un directorio temporal: no escribe NADA en el repositorio.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CANDADO = path.join(RAIZ, 'scripts/check-claude-md.mjs');
const ORIGINAL = fs.readFileSync(path.join(RAIZ, 'CLAUDE.md'), 'utf8');

/** Sustituye una vez y se planta si no encuentra el texto: una trampa que no se monta no prueba nada. */
function sustituir(texto, buscado, puesto) {
  if (!texto.includes(buscado)) throw new Error(`la trampa no se pudo montar: no encuentro «${buscado.slice(0, 60)}»`);
  return texto.replace(buscado, puesto);
}

/** Mueve la línea que contiene `marca` al final de la sección cuyo encabezado es `destino`. */
function moverLinea(texto, marca, destino) {
  const lineas = texto.split('\n');
  const i = lineas.findIndex(l => l.includes(marca));
  if (i < 0) throw new Error(`la trampa no se pudo montar: no encuentro «${marca}»`);
  const [linea] = lineas.splice(i, 1);
  const d = lineas.findIndex(l => l.startsWith(destino));
  if (d < 0) throw new Error(`la trampa no se pudo montar: no encuentro la sección «${destino}»`);
  lineas.splice(d + 2, 0, linea, '');
  return lineas.join('\n');
}

/** Quita negritas, dobla espacios y reflúa cada párrafo de prosa en una sola línea. */
function reformatear(texto) {
  const salida = [];
  let enCodigo = false;
  const esBloque = l => /^\s*(#|\||[-*] |\d+\.|```|<!--)/.test(l);
  for (const linea of texto.replace(/\*\*/g, '').split('\n')) {
    if (/^\s*```/.test(linea)) enCodigo = !enCodigo;
    const previa = salida[salida.length - 1];
    const puedeUnir = !enCodigo && previa !== undefined && previa.trim() !== '' && linea.trim() !== ''
      && !/^\s*(#|\||```)/.test(previa) && !esBloque(linea);
    if (puedeUnir && /^\s*>/.test(linea) && /^\s*>/.test(previa)) {
      salida[salida.length - 1] = `${previa}  ${linea.replace(/^\s*>\s?/, '')}`;
    } else if (puedeUnir && !/^\s*>/.test(linea) && !/^\s*>/.test(previa)) {
      salida[salida.length - 1] = `${previa}  ${linea.trim()}`;
    } else {
      salida.push(linea);
    }
  }
  return salida.join('\n');
}

const CASOS = [
  {
    n: 1, nombre: 'el CLAUDE.md real', debeFallar: false,
    texto: () => ORIGINAL,
  },
  {
    n: 2, nombre: 'quitar una obligación (la prohibición del violeta #7C3AED)', debeFallar: true,
    texto: () => sustituir(ORIGINAL, '`#7C3AED` (violeta) y ', ''),
    esperado: /Obligación perdida: «#7C3AED»/,
  },
  {
    n: 3, nombre: 'mover el --no-verify PROHIBIDO a otra sección', debeFallar: true,
    texto: () => moverLinea(ORIGINAL, 'está PROHIBIDO** y lo rechaza', '## Archivos Auxiliares'),
    esperado: /fuera de su sección: «git commit --no-verify está PROHIBIDO».*está en «Archivos Auxiliares»/,
  },
  {
    n: 4, nombre: 'reformatear: sin negritas, dobles espacios, párrafos reflujados', debeFallar: false,
    texto: () => reformatear(ORIGINAL),
    // Que la trampa de verdad cambió el fichero: si no, callar no demostraría nada
    comprobar: t => t !== ORIGINAL && !t.includes('**') && t.split('\n').length < ORIGINAL.split('\n').length - 100,
  },
  {
    n: 5, nombre: 'citar un npm run que no existe', debeFallar: true,
    texto: () => sustituir(ORIGINAL, '## Archivos Auxiliares\n', '## Archivos Auxiliares\n\nSe comprueba con `npm run check:inventado`.\n'),
    esperado: /«npm run check:inventado» no está en package\.json/,
  },
  {
    n: 6, nombre: 'citar un script que no existe', debeFallar: true,
    texto: () => sustituir(ORIGINAL, '## Archivos Auxiliares\n', '## Archivos Auxiliares\n\nLo genera `scripts/generar-inventado.mjs`.\n'),
    esperado: /ruta que no existe: scripts\/generar-inventado\.mjs/,
  },
  {
    n: 7, nombre: 'una sección de candado cuyo comando no está en el build', debeFallar: true,
    texto: () => sustituir(ORIGINAL, '### TypeScript\n',
      '### Candado de prueba\n\n`npm run check:memoria` — rompe el build si algo. Salió del caso de prueba.\n\n### TypeScript\n'),
    esperado: /«Candado de prueba» afirma que rompe el build, pero «check:memoria» no está en la cadena/,
  },
  {
    n: 8, nombre: 'una sección que cambia de nombre', debeFallar: true,
    texto: () => sustituir(ORIGINAL, '### Regla multi-suite', '### Varias suites'),
    esperado: /Sección desaparecida: «Regla multi-suite»/,
  },
  {
    n: 9, nombre: 'una sección de candado engordada (el molde avisa y no rompe)', debeFallar: false,
    // Al final de la sección, sea cual sea la que venga detrás
    texto: () => {
      const inicio = ORIGINAL.indexOf('### Candado de la tarjeta social\n');
      const fin = ORIGINAL.indexOf('\n#', inicio + 1);
      if (inicio < 0 || fin < 0) throw new Error('la trampa no se pudo montar: no encuentro la tarjeta social');
      return `${ORIGINAL.slice(0, fin)}\n${'Crónica que debería vivir en la cabecera del script. '.repeat(30)}\n${ORIGINAL.slice(fin)}`;
    },
    esperado: /Molde: «Candado de la tarjeta social» ocupa [\d.]+ B/,
    // Y que el aviso lo encienda la trampa, no un tamaño que ya traía el fichero real: el
    // tamaño avisado tiene que ser mayor que el que avisaba (o no) el caso 1
    comprobarSalida: (salida, salidas) => bytesAvisados(salida) > (bytesAvisados(salidas[1]) ?? 0),
  },
];

function bytesAvisados(salida = '') {
  const m = salida.match(/Molde: «Candado de la tarjeta social» ocupa ([\d.]+) B/);
  return m ? Number(m[1].replace(/\./g, '')) : null;
}

function ejecutar(fichero) {
  try {
    const out = execFileSync(process.execPath, [CANDADO, '--fichero', fichero], { cwd: RAIZ, stdio: 'pipe' });
    return { falla: false, salida: String(out) };
  } catch (e) {
    return { falla: true, salida: String(e.stdout ?? '') + String(e.stderr ?? '') };
  }
}

let fallos = 0;
const salidas = {};
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-md-candado-'));

try {
  for (const caso of CASOS) {
    let texto;
    try {
      texto = caso.texto();
    } catch (e) {
      fallos++;
      console.log(`  ✗ caso ${caso.n} · ${caso.nombre}\n      ${e.message}`);
      continue;
    }
    if (caso.comprobar && !caso.comprobar(texto)) {
      fallos++;
      console.log(`  ✗ caso ${caso.n} · ${caso.nombre}\n      la trampa no cambió el fichero como debía`);
      continue;
    }
    const fichero = path.join(base, `caso-${caso.n}.md`);
    fs.writeFileSync(fichero, texto, 'utf8');
    const r = ejecutar(fichero);
    salidas[caso.n] = r.salida;
    const bien = r.falla === caso.debeFallar && (!caso.esperado || caso.esperado.test(r.salida))
      && (!caso.comprobarSalida || caso.comprobarSalida(r.salida, salidas));
    if (bien) {
      console.log(`  ✓ caso ${caso.n} · ${caso.nombre}`);
    } else {
      fallos++;
      console.log(`  ✗ caso ${caso.n} · ${caso.nombre}`);
      console.log(`      esperado: ${caso.debeFallar ? 'que SE ENCIENDA' : 'que CALLE'}` +
        (caso.esperado ? ` y que la salida case con ${caso.esperado}` : ''));
      console.log(`      obtenido: ${r.falla ? 'se encendió' : 'calló'}`);
      console.log(r.salida.split('\n').map(l => '      ' + l).join('\n'));
    }
  }
} finally {
  fs.rmSync(base, { recursive: true, force: true });
}

const deben = CASOS.filter(c => c.debeFallar).length;
console.log(
  fallos === 0
    ? `\n✓ el candado se enciende en los ${deben} casos que debe y calla en los ${CASOS.length - deben} que debe`
    : `\n✗ ${fallos} comprobación(es) del candado no salieron como debían`,
);
process.exit(fallos === 0 ? 0 : 1);
