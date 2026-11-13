#!/usr/bin/env node
/**
 * check-alfa-tres-cifras.mjs — que nadie pegue un alfa a un color de TRES cifras
 *
 * Ejecutar:  npm run check:alfa-tres-cifras        (lo ejecuta también `npm run build`)
 *            node scripts/check-alfa-tres-cifras.mjs app/x/page.tsx   (ficheros sueltos)
 *
 * QUÉ BUSCA
 * Un fichero que pega un alfa de dos cifras a una propiedad de color —`b.color + 'CC'`,
 * `${info.color}66`— y que, en el mismo fichero, da a esa MISMA propiedad un literal de tres
 * cifras (`color: '#666'`). '#666' + 'CC' es '#666CC', que no es un color: en un SVG se pinta
 * NEGRO y en CSS la declaración se descarta, y nada avisa.
 *
 * DE DÓNDE SALE (cabo C0684, 08/11/2026)
 * Dos casos reparados el mismo día: visualizador-arquitectura-computador (a2c0f1324: el bloque del
 * bus salía negro, `color: '#666'` + 'CC') y visualizador-carbono (2c2af478a: el panel del grafito
 * sin borde, `color: '#555'` + '66'). El censo de aquel día revisó a mano los 22 ficheros que pegan
 * alfa y tienen algún literal de tres cifras: en ninguno más el literal corto llegaba al color que
 * recibe el alfa (eran trazos, ejes, textos sueltos).
 *
 * POR QUÉ BARRE TODO Y NO TIENE PASIVO
 * Liga el literal a la propiedad que recibe el alfa por su NOMBRE, y así no enciende con los trazos
 * y ejes de tres cifras que esos 22 ficheros sí tienen. Medido el 13/11/2026: 0 en el árbol.
 *
 * QUÉ NO VE
 * El alfa pegado a una VARIABLE suelta (`const c = '#666'; c + 'CC'`) o a una reserva
 * (`x?.color ?? '#999'`): el nombre no liga nada. Lo mide por píxel `rellenosInvalidos` de
 * tests/contraste-svg-texto.spec.ts.
 *
 * Escape: «alfa-ok: <razón>» en la línea del literal o en la anterior.
 */
import fs from 'node:fs';
import path from 'node:path';
import { RAIZ, argumentos, objetivos, escapada, esComentario } from './lineas-anadidas.mjs';

const args = argumentos();
const relevante = (f) => /^(app|components|lib|data)\//.test(f) && /\.tsx?$/.test(f);
// Sin pasivo: barre siempre el árbol entero (o los sueltos)
const ficheros = objetivos({ ...args, todo: !args.sueltos.length }, { dirs: ['app', 'components', 'lib', 'data'], relevante });

const ID = '[A-Za-z_$][\\w$]*';
const esc = (t) => t.replace(/[$]/g, '\\$');
/** `objeto.propiedad` que recibe un alfa de dos cifras pegado, en sus dos escrituras. */
const PEGA_CONCAT = new RegExp(`(${ID})\\.(${ID})\\s*\\+\\s*['"][0-9a-fA-F]{2}['"]`, 'g');
const PEGA_PLANTILLA = new RegExp(`\\$\\{[^}]*?(${ID})\\.(${ID})\\s*\\}[0-9a-fA-F]{2}(?![0-9a-zA-Z])`, 'g');

/**
 * La tabla de la que sale el objeto que recibe el alfa: `TABLA.map((b) =>` (o forEach, filter…)
 * o `const b = TABLA.find(…)`. Primera versión (13/11/2026) ligaba solo por el NOMBRE de la
 * propiedad y encendía en 9 sitios sanos: `color` es la clave de cualquier `style={{ color }}` y
 * de otras tablas del mismo fichero que nunca reciben el alfa. Si el objeto llega por una función
 * o por props, no se resuelve y no se juzga (ver «QUÉ NO VE»).
 */
function tablaDe(texto, obj) {
  const o = esc(obj);
  const m = texto.match(new RegExp(`\\b(${ID})(?:\\??\\.[A-Za-z]+\\([^()]*\\))*\\??\\.(?:map|forEach|filter|find|some|flatMap)\\(\\s*\\(?\\s*${o}\\b`))
    || texto.match(new RegExp(`\\b${o}\\s*=\\s*(${ID})\\??\\.(?:find|filter|at)\\(`));
  return m ? m[1] : null;
}

/** El tramo [inicio, fin) del literal de la tabla: desde su `[` o `{` hasta el que lo cierra. */
function tramoDe(texto, tabla) {
  const m = texto.match(new RegExp(`\\b(?:const|let|var)\\s+${esc(tabla)}\\b[^=]*=\\s*`));
  if (!m) return null;
  let i = m.index + m[0].length;
  while (i < texto.length && !'[{'.includes(texto[i])) { if (!/\s/.test(texto[i])) return null; i++; }
  let prof = 0, cad = null;
  for (let j = i; j < texto.length; j++) {
    const c = texto[j];
    if (cad) { if (c === '\\') j++; else if (c === cad) cad = null; continue; }
    if (c === '"' || c === "'" || c === '`') cad = c;
    else if (c === '[' || c === '{') prof++;
    else if ((c === ']' || c === '}') && --prof === 0) return [i, j + 1];
  }
  return null;
}

const rompen = [];
for (const rel of ficheros) {
  const abs = path.resolve(RAIZ, rel);
  if (!fs.existsSync(abs)) continue;
  const texto = fs.readFileSync(abs, 'utf8');
  const pegados = [...texto.matchAll(PEGA_CONCAT), ...texto.matchAll(PEGA_PLANTILLA)];
  if (!pegados.length) continue;
  const lineas = texto.split('\n');
  const vistos = new Set();
  for (const [, obj, prop] of pegados) {
    const tabla = tablaDe(texto, obj);
    const tramo = tabla && tramoDe(texto, tabla);
    if (!tramo || vistos.has(`${tabla}.${prop}`)) continue;
    vistos.add(`${tabla}.${prop}`);
    const literal = new RegExp(`(?:^|[^\\w$])${esc(prop)}\\s*:\\s*['"](#[0-9a-fA-F]{3})['"]`, 'g');
    for (const m of texto.slice(tramo[0], tramo[1]).matchAll(literal)) {
      const i = texto.slice(0, tramo[0] + m.index).split('\n').length - 1 + (m[0].startsWith('\n') ? 1 : 0);
      if (esComentario(lineas[i]) || escapada(lineas, i, 'alfa-ok')) continue;
      rompen.push({ rel, n: i + 1, prop, color: m[1], tabla, texto: lineas[i].trim().slice(0, 100) });
    }
  }
}

if (rompen.length) {
  console.error('\n✗ Alfa pegado a un color de tres cifras — el build se detiene\n');
  for (const c of rompen) console.error(`  ${c.rel}:${c.n}  ${c.prop}: '${c.color}' recibe un alfa pegado (tabla ${c.tabla}) → cinco cifras, que no es un color\n      ${c.texto}`);
  console.error('\nEscribe el color en SEIS cifras (\'#666\' → \'#666666\'): con el alfa pegado da un color');
  console.error('válido. Si ese literal no llega nunca al alfa, «alfa-ok: <razón>» en su línea o en la anterior.\n');
  process.exit(1);
}
console.log(`✓ alfa de tres cifras: ningún color corto recibe un alfa pegado (${ficheros.length} fichero(s))`);
