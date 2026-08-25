#!/usr/bin/env node
/**
 * check-a11y-jsx.mjs — las tres reglas JSX obligatorias, sobre lo que toca el commit
 *
 * Ejecutar:  npm run check:a11y-jsx              (lo ejecuta también `npm run build`)
 *            npm run check:a11y-jsx -- --todo    (catálogo entero: informa, NO rompe)
 *            node scripts/check-a11y-jsx.mjs app/x/page.tsx   (ficheros sueltos)
 *
 * QUÉ HACE
 * ────────
 * Mira los .tsx que el commit toca (modificados, en staging o sin seguir) y verifica las
 * tres reglas del CLAUDE.md §5 **en las líneas que el commit añade**, no en el fichero
 * entero. Igual que check-secrets, y por la misma razón: el catálogo arrastra un pasivo
 * enorme —solo `lupa-digital` tiene 10 emojis sin aria-hidden, y está recién inspeccionada—,
 * así que un candado por fichero rompería el build cada vez que se tocase una app antigua
 * por un motivo que nada tiene que ver. Un candado que estorba se acaba desactivando.
 * Juzgando lo que se escribe hoy, el pasivo se drena solo según se van tocando las apps.
 * Lo que ese fichero arrastre fuera del diff se cuenta y se dice, pero no detiene nada.
 *
 * Solo dos de las tres reglas rompen el build, y a propósito:
 *
 *   ROMPE   1. <button> sin type=            → la corrección es unívoca: type="button"
 *   ROMPE   2. emoji JUNTO A TEXTO sin aria-hidden
 *   AVISA   3. botón con onClick + className condicional y sin ningún aria-* ni role
 *   AVISA   4. emoji en nodo propio, sin aria-hidden y sin aria-label
 *   AVISA   5. aria-pressed en un botón que al pulsarlo se deshabilita (no se despulsa)
 *
 * Las tres últimas exigen criterio y no se pueden resolver a ciegas: un `aria-pressed` en un
 * botón de ACCIÓN es una regresión, no una mejora (el teclado de calculadora-jugada-scrabble
 * es el caso que lo demostró), y un emoji solo puede ser decorativo o portar información,
 * que se arreglan al revés. Un candado que grita por lo que no sabe resolver acaba
 * desactivado, así que esas tres se cuentan y se listan, pero dejan pasar el build.
 *
 * La 5 se añadió el 24/08/2026 por el hallazgo 285 del Inspector: las cuatro opciones de
 * `quiz-simbolos-quimicos` llevaban `aria-pressed` siendo botones de acción, y la regla 3 no
 * podía verlo porque solo salta cuando el botón no tiene NINGÚN `aria-*` — allí había uno,
 * del tipo equivocado. Su criterio está en `seDeshabilitaAlPulsarse`, y su caso de prueba en
 * `scripts/pruebas/a11y-regla5.tsx`: dos botones que debe cazar y dos que debe dejar pasar.
 *
 * Escape para el falso positivo: «a11y-ok: <razón>» en la línea o en la anterior.
 *
 * QUÉ NO HACE
 * ───────────
 * · No mira el catálogo entero en cada build, solo lo que cambia. El pasivo de las ~1.100
 *   apps anteriores es una campaña aparte: `--todo` lo mide, pero no rompe nada.
 * · No se ejecuta en Vercel (ver abajo).
 * · No sustituye a `npm run test:a11y` (axe sobre el navegador): esto es análisis del
 *   código fuente y solo ve estas tres reglas.
 * · Un <button {...props}> se omite: no se puede saber si el spread trae el type.
 *
 * POR QUÉ NO IMPORTA EL ESCÁNER DE LA SKILL
 * ─────────────────────────────────────────
 * La skill /audit-accesibilidad-jsx tiene un escáner equivalente, pero vive en
 * ~/.claude/skills/, fuera del repositorio: no viaja con el clon, así que un build en otra
 * máquina se rompería por un fichero que no existe. El análisis se reimplementa aquí.
 *
 * ⚠️ Lo que sí se hereda de ella es la lección: NO escanear con grep por línea. Se intentó
 * el 16/08/2026 y es inservible — los `<` y `>` de genéricos y comparaciones de TypeScript
 * parecen etiquetas JSX, y un <button> repartido en varias líneas se marca como «sin type»
 * cuando el type está en la línea siguiente. Aquel barrido dio 489 emojis y 0 verdaderos.
 * Aquí se parsea TSX con el TypeScript del propio proyecto.
 *
 * DE DÓNDE SALE (2026-08-23)
 * ──────────────────────────
 * La tanda del Inspector del 21/08 dejó 15 hallazgos de accesibilidad repartidos por
 * 10 de 10 apps inspeccionadas: siempre las mismas tres reglas. No era que el candado
 * fallara, es que no había candado. La skill /audit-accesibilidad-jsx solo mira las apps de
 * los últimos 60 días, y aquellas eran de febrero-mayo, así que el catálogo antiguo no había
 * pasado nunca por ella. Con una fuga añadida: simulador-puertas-logicas se creó el 18/08,
 * DESPUÉS del audit del 16/08, y traía uno igual.
 *
 * Es la regla del CLAUDE.md aplicada a sí misma: si la invariante puede repetirse, deja de
 * ser un recordatorio y se convierte en un check-*.mjs que rompe el build.
 */

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ts = createRequire(path.join(RAIZ, 'package.json'))('typescript');

const TODO = process.argv.includes('--todo');
const SUELTOS = process.argv.slice(2).filter(a => !a.startsWith('--'));

// En Vercel no se ejecuta: allí el clon es shallow y `git diff HEAD` no significa lo mismo,
// y el build local —que es donde manda el flujo del proyecto— ya lo ha pasado antes del push.
if (process.env.VERCEL) {
  console.log('✓ a11y JSX: omitido en Vercel (se valida en local antes de subir)');
  process.exit(0);
}

/**
 * Un emoji de verdad.
 *
 * `Extended_Pictographic` es más ancho de lo que parece: incluye © ® ™ y **el bloque entero
 * de flechas** (U+2190–U+21FF). Una flecha así no es decoración: en «peso↔volumen» o
 * «°C ↔ °F» es contenido, y envolverla en un `<span aria-hidden>` la borraría para quien usa
 * lector de pantalla. Se descuentan antes de decidir. Los emojis de flecha que SÍ son
 * decorativos —⬆️ ⬇️ ➡️— viven fuera de ese bloque y siguen detectándose.
 * (Falso positivo encontrado el 23/08/2026 en `calculadora-cocina`.)
 */
const PICTOGRAFICO = /\p{Extended_Pictographic}/u;
const NO_SON_EMOJI = /[©®™←-⇿]/g;
const esEmoji = (t) => PICTOGRAFICO.test(t.replace(NO_SON_EMOJI, ''));
/**
 * Si al quitar todo esto no queda nada, el nodo es SOLO emoji (y entonces es un aviso, no
 * un error). Hay que descontar también las piezas que no son pictogramas pero forman parte
 * de uno: el ZWJ que une 🧑‍🔬, el selector de variación y el modificador de tono de piel.
 * Sin el ZWJ, 🧑‍🔬 en un nodo propio se clasificaba como «emoji junto a texto» y el candado
 * pedía envolverlo en un <span>, que es la corrección equivocada.
 */
const SOLO_EMOJI = /[\p{Extended_Pictographic}\p{Emoji_Modifier}️‍⃣\s]/gu;
const ARIA_ESTADO = ['aria-pressed', 'aria-selected', 'aria-checked', 'aria-expanded'];

/**
 * ¿La expresión de un atributo JSX, ya sin las llaves? `null` si el atributo no la tiene.
 */
function expresionDe(atributo) {
  const ini = atributo && atributo.initializer;
  return ini && ts.isJsxExpression(ini) && ini.expression ? ini.expression : null;
}

const textoPlano = (nodo) => (nodo ? nodo.getText().replace(/\s+/g, ' ').trim() : '');
const esNulo = (nodo) =>
  nodo && (nodo.kind === ts.SyntaxKind.NullKeyword || textoPlano(nodo) === 'undefined');

/** Operandos de una cadena de `||`, aplanada. */
function operandosOr(nodo) {
  if (nodo && ts.isBinaryExpression(nodo) && nodo.operatorToken.kind === ts.SyntaxKind.BarBarToken)
    return [...operandosOr(nodo.left), ...operandosOr(nodo.right)];
  if (nodo && ts.isParenthesizedExpression(nodo)) return operandosOr(nodo.expression);
  return [nodo];
}

/**
 * ¿`disabled` es NECESARIAMENTE verdadero cuando `aria-pressed` lo es? Es decir: pulsar el
 * botón lo deshabilita, así que no hay forma de despulsarlo — y entonces no es un conmutador
 * por mucho que lleve el atributo de uno.
 *
 * Solo devuelve `true` cuando puede DEMOSTRARLO por la forma de las dos expresiones. Ante la
 * duda calla, porque un aviso que acierta una de cada cuatro veces acaba desactivando el
 * candado entero. Las tres formas que sí se pueden afirmar:
 *
 *   1. Son la misma expresión:  aria-pressed={activo}    disabled={activo}
 *   2. `disabled` la contiene como operando de un `||` de primer nivel:
 *      aria-pressed={reproduciendo}   disabled={reproduciendo || sinVidas}
 *   3. `aria-pressed` compara algo con un valor y `disabled` dice que ese algo no es nulo:
 *      aria-pressed={seleccionada === opcion}   disabled={seleccionada !== null}
 *
 * Lo que deja pasar a propósito, porque ahí el botón SÍ se puede despulsar: que el estado
 * aparezca negado (`disabled={animando && !autoplay}`) o dentro de un `&&` que lo excluya
 * (`disabled={!seleccionados.includes(f.id) && tope}`).
 */
function seDeshabilitaAlPulsarse(pressed, disabled) {
  if (!pressed || !disabled) return false;
  const p = textoPlano(pressed);

  // 1 y 2 — la misma expresión, sola o como rama de un ||
  if (operandosOr(disabled).some(o => textoPlano(o) === p)) return true;

  // 3 — «X === algo» pulsado y «X !== null» deshabilitado
  if (
    ts.isBinaryExpression(pressed) &&
    pressed.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken &&
    !esNulo(pressed.right) &&
    ts.isBinaryExpression(disabled) &&
    disabled.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsEqualsToken &&
    esNulo(disabled.right) &&
    textoPlano(disabled.left) === textoPlano(pressed.left)
  ) {
    return true;
  }

  return false;
}

// ─── Qué ficheros mirar ───────────────────────────────────────────────────────

const relevante = (f) => f.endsWith('.tsx') && (f.startsWith('app/') || f.startsWith('components/'));

function git(args) {
  return execFileSync('git', args, { cwd: RAIZ, encoding: 'utf8' })
    .split('\n').map(s => s.trim()).filter(Boolean);
}

/**
 * Líneas que el commit añade o modifica en un fichero, en su numeración ACTUAL.
 * `null` significa «todas»: fichero sin seguir, suelto o barrido completo.
 */
function lineasTocadas(rel) {
  let diff;
  try {
    diff = git(['diff', '--unified=0', '--no-color', 'HEAD', '--', rel]);
  } catch { return null; }
  if (!diff.length) return null;   // sin seguir: todo es nuevo
  const tocadas = new Set();
  for (const linea of diff) {
    const m = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/.exec(linea);
    if (!m) continue;
    const desde = Number(m[1]);
    const cuantas = m[2] === undefined ? 1 : Number(m[2]);
    for (let i = 0; i < cuantas; i++) tocadas.add(desde + i);
  }
  return tocadas;
}

function objetivos() {
  if (SUELTOS.length) return SUELTOS.map(f => f.replace(/\\/g, '/'));
  if (TODO) {
    const todos = [];
    const rec = (dir) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const abs = path.join(dir, e.name);
        if (e.isDirectory()) rec(abs);
        else if (e.name.endsWith('.tsx')) todos.push(path.relative(RAIZ, abs).replace(/\\/g, '/'));
      }
    };
    rec(path.join(RAIZ, 'app'));
    rec(path.join(RAIZ, 'components'));
    return todos;
  }
  try {
    const cambiados = git(['diff', '--name-only', '--diff-filter=ACM', 'HEAD']);
    const nuevos = git(['ls-files', '--others', '--exclude-standard']);
    return [...new Set([...cambiados, ...nuevos])].filter(relevante);
  } catch {
    console.log('✓ a11y JSX: omitido (no se pudo consultar git)');
    process.exit(0);
  }
}

// ─── Análisis ─────────────────────────────────────────────────────────────────

/** nombre → nodo del atributo, más si la etiqueta trae un spread */
function atributos(apertura) {
  const m = new Map();
  let spread = false;
  for (const a of apertura.attributes.properties) {
    if (ts.isJsxAttribute(a) && a.name) m.set(a.name.getText(), a);
    else if (ts.isJsxSpreadAttribute(a)) spread = true;
  }
  return { m, spread };
}

const errores = [];   // en líneas del commit y con corrección unívoca → rompen el build
const avisos = [];    // en líneas del commit pero piden criterio → se listan y dejan pasar
const pasivo = [];    // incumplimientos que el fichero ya arrastraba → solo se cuentan

const TODAS = SUELTOS.length > 0 || TODO;

for (const rel of objetivos()) {
  const abs = path.join(RAIZ, rel);
  if (!fs.existsSync(abs)) continue;
  const texto = fs.readFileSync(abs, 'utf8');
  const lineas = texto.split('\n');
  const tocadas = TODAS ? null : lineasTocadas(rel);
  const sf = ts.createSourceFile(rel, texto, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const ln = (n) => sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
  const lnFin = (n) => sf.getLineAndCharacterOfPosition(n.getEnd()).line + 1;
  /** el escape vale en la línea del hallazgo o en la anterior */
  const exento = (l) => /a11y-ok/.test(lineas[l - 1] || '') || /a11y-ok/.test(lineas[l - 2] || '');
  /**
   * ¿Lo escribe este commit? Se mira el rango ENTERO del nodo, no su primera línea: un
   * <button> abierto en L181 y tocado en L183 es código de este commit igualmente.
   */
  const esDeAhora = (n) => {
    if (tocadas === null) return true;
    for (let l = ln(n); l <= lnFin(n); l++) if (tocadas.has(l)) return true;
    return false;
  };
  const apuntar = (lista, n, regla, detalle) => {
    const l = ln(n);
    if (exento(l)) return;
    (esDeAhora(n) ? lista : pasivo).push({ rel, l, regla, detalle });
  };

  const visitar = (n) => {
    // Reglas 1 y 3: etiquetas <button>
    if ((ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) && n.tagName.getText() === 'button') {
      const { m: at, spread } = atributos(n);
      if (!at.has('type') && !spread)
        apuntar(errores, n, 'button sin type', 'añade type="button"');
      const tieneEstado = ARIA_ESTADO.some(k => at.has(k)) || at.has('role');
      if (at.has('onClick') && !tieneEstado) {
        const cls = at.get('className') ? at.get('className').getText() : '';
        if (/\?|&&/.test(cls))
          apuntar(avisos, n, 'toggle sin aria-pressed', 'className=' + cls.slice(0, 60));
      }
      /**
       * Regla 5 — `aria-pressed` que SOBRA. Un conmutador que queda deshabilitado en cuanto
       * lo pulsas no es un conmutador: no hay forma de despulsarlo. Es un botón de acción
       * con el atributo de otro patrón, y el CLAUDE.md §5 avisa de que eso es una regresión
       * y no una mejora.
       *
       * Sale del hallazgo 285 (24/08/2026): las cuatro opciones de `quiz-simbolos-quimicos`
       * llevaban `aria-pressed={seleccionada === opcion}` y `disabled={seleccionada !== null}`,
       * así que un lector de pantalla anunciaba las cuatro como «botón de alternar, no
       * pulsado» antes de contestar. La regla 3 no podía verlo: solo salta cuando el botón no
       * tiene NINGÚN aria-*, y aquí tenía uno, del tipo equivocado.
       *
       * Avisa y no rompe, como las otras de criterio: `disabled` también se usa para «aún no
       * se puede», y ahí un aria-pressed puede ser correcto.
       */
      if (at.has('aria-pressed') && at.has('disabled')) {
        const pressed = expresionDe(at.get('aria-pressed'));
        const disabled = expresionDe(at.get('disabled'));
        if (seDeshabilitaAlPulsarse(pressed, disabled)) {
          apuntar(avisos, n, 'aria-pressed en un botón que no se puede despulsar',
                  `disabled={${textoPlano(disabled).slice(0, 50)}} lo deja fijo al pulsarlo`);
        }
      }
    }

    // Reglas 2 y 4: emojis en texto JSX
    if (ts.isJsxText(n) && esEmoji(n.text)) {
      const padre = n.parent;
      const apertura = padre && ts.isJsxElement(padre) ? padre.openingElement : null;
      const at = apertura ? atributos(apertura).m : new Map();
      if (!at.has('aria-hidden')) {
        const soloEmoji = n.text.replace(SOLO_EMOJI, '') === '';
        const txt = n.text.trim().replace(/\s+/g, ' ').slice(0, 45);
        if (soloEmoji) {
          // Excepción del CLAUDE.md: un emoji solo que YA tiene aria-label no se envuelve
          if (!at.has('aria-label'))
            apuntar(avisos, n, 'emoji en nodo propio',
              '«' + txt + '» ¿decorativo (aria-hidden) o informativo (aria-label)?');
        } else {
          apuntar(errores, n, 'emoji junto a texto', '«' + txt + '» → <span aria-hidden="true">');
        }
      }
    }

    ts.forEachChild(n, visitar);
  };
  visitar(sf);
}

// ─── Salida ───────────────────────────────────────────────────────────────────

function agrupar(arr) {
  const porFichero = new Map();
  for (const e of arr) {
    if (!porFichero.has(e.rel)) porFichero.set(e.rel, []);
    porFichero.get(e.rel).push(e);
  }
  return porFichero;
}

function listar(arr, escribir) {
  for (const [rel, es] of agrupar(arr)) {
    escribir('\n  ' + rel);
    for (const e of es.sort((a, b) => a.l - b.l))
      escribir('    L' + e.l + '  ' + e.regla + ' · ' + e.detalle);
  }
}

/** Los avisos completos solo cuando NO hay errores: si el build se detiene, lo que hay que
 *  leer es lo que lo detiene, y una lista larga de «piden criterio» encima lo sepulta. */
function avisosCompletos() {
  if (!avisos.length) return;
  console.log('\n· a11y JSX — ' + avisos.length + ' caso(s) que piden criterio (NO rompen el build):');
  listar(avisos, s => console.log(s));
  console.log('');
}

/**
 * El pasivo se cuenta, nunca se lista entero ni detiene nada: son incumplimientos que el
 * fichero ya traía de antes y que este commit no ha escrito. Se dice para que no pase por
 * limpio lo que no lo está, y para que se vea encogerse.
 */
function pasivoResumido() {
  if (!pasivo.length) return;
  const porFichero = agrupar(pasivo);
  console.log('· a11y JSX — pasivo anterior, fuera de este commit (no detiene el build):');
  for (const [rel, es] of porFichero)
    console.log('    ' + rel + ' arrastra ' + es.length + ' caso(s)');
  console.log('  Se ven con: node scripts/check-a11y-jsx.mjs <fichero>');
}

if (TODO) {
  avisosCompletos();
  console.log('\n── Barrido completo: ' + errores.length + ' incumplimiento(s) de las dos reglas unívocas');
  listar(errores, s => console.log(s));
  console.log('\n(modo --todo: mide el pasivo del catálogo, no rompe el build)\n');
  process.exit(0);
}

if (!errores.length) {
  avisosCompletos();
  pasivoResumido();
  console.log('✓ a11y JSX: las tres reglas obligatorias, en orden en lo que toca este commit');
  process.exit(0);
}

console.error('\n✗ Accesibilidad JSX — el build se detiene\n');
listar(errores, s => console.error(s));
console.error('\nReglas obligatorias del CLAUDE.md §5. Si algún caso es un falso positivo,');
console.error('escribe «a11y-ok: <razón>» en esa línea o en la anterior.');
if (avisos.length)
  console.error('\nHay además ' + avisos.length + ' caso(s) que piden criterio; se listan cuando el build pase.');
console.error('');
process.exit(1);
