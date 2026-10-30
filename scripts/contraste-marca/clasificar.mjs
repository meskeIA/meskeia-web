/**
 * clasificar.mjs — el clasificador ÚNICO de la campaña de contraste de marca (cabo C0070).
 *
 * Lo importan dos consumidores, y por eso vive aparte:
 *
 *   · `scripts/contraste-marca/campana.mjs` — el script que migra (simulación por defecto).
 *   · `scripts/check-contraste-marca.mjs`   — el candado que impide que vuelva.
 *
 * Si cada uno llevara su copia del criterio, el candado acabaría vigilando una cosa y la
 * campaña migrando otra, y nada lo diría: es la trampa de `scripts/CLAUDE.md` (los parsers
 * copiados que se quedan mudos). Aquí no hay `fs`: entra texto, salen hallazgos.
 *
 * LAS DOS TANDAS
 * ──────────────
 *   1. FONDO: texto blanco sobre la marca. `var(--primary)` / `var(--secondary)` y sus
 *      hexadecimales (#2E86AB, #48A9A6) y `rgb(46,134,171)` / `rgb(72,169,166)` dan 4,11:1 y
 *      2,80:1 con blanco encima en claro, y 2,79:1 y 2,23:1 en oscuro. El sustituto es
 *      `--primary-boton` / `--secondary-boton`, 5,47:1 y 5,15:1 en los dos temas.
 *   2. TEXTO: la marca como color de letra. #2E86AB da 4,11:1 sobre blanco y #48A9A6 2,68:1;
 *      y un hexadecimal escrito a mano, o un `--primary` redeclarado en local sin variante
 *      oscura, se queda en #2E86AB también en oscuro (4,24:1 sobre #1A1A1A, 3,35:1 sobre la
 *      tarjeta). El sustituto es `--primary-texto` / `--secondary-texto`.
 *
 * DEFECTO Y AUTOMÁTICO SON DOS PREGUNTAS DISTINTAS
 * ────────────────────────────────────────────────
 * Cada hallazgo lleva `defecto` (la forma del código demuestra el contraste insuficiente) y
 * `automatico` (el sustituto es seguro sin mirar). El candado rompe por `defecto`; la campaña
 * solo escribe lo `automatico`. Lo que es defecto y no automático es la lista de «casos que no
 * sabe clasificar»: hay que resolverlos a mano o firmarlos antes de enganchar el candado.
 *
 * QUÉ NO ES DEFECTO PROBADO (se lista, no se toca ni rompe)
 * ──────────────────────────────────────────────────────────
 *   · Un fondo de marca sin texto blanco a la vista: barras, puntos, pulgares de deslizador,
 *     o un color heredado del padre que solo el navegador sabe.
 *   · Un tinte (`rgba(…, <0,5)` o dentro de `color-mix`): casi el fondo de la tarjeta.
 *   · `--accent` (#7FB3D3): no tiene token de texto ni de botón. Se cuenta aparte.
 *   · Lo que pinta un `<canvas>` o un `<text>` de SVG: el color no está en un `color:`.
 *   · Un módulo con PALETA PROPIA (redeclara `--primary` a otro tono): ahí `var(--primary)` no
 *     es la marca, y cambiarlo por el token global le cambiaría el color a la app.
 */

// ─── Referencias de marca ──────────────────────────────────────────────────────

const HEX_A_TOKEN = { '2e86ab': 'primary', '48a9a6': 'secondary', '7fb3d3': 'accent' };
const RGB_A_TOKEN = { '46,134,171': 'primary', '72,169,166': 'secondary', '127,179,211': 'accent' };

/**
 * Una referencia a la marca dentro de un valor CSS. Tres formas: el token (con o sin valor de
 * reserva: `var(--primary, #2E86AB)` pinta lo mismo, hallazgo 1670), el hexadecimal y el
 * `rgb()`/`rgba()`. `--primary-boton` no casa: tras el nombre solo se admite `,` o `)`.
 */
const RE_REF = new RegExp(
  String.raw`var\(\s*--(primary|secondary|accent)\s*(?:,(?:[^()]|\([^()]*\))*)?\)` +
    String.raw`|#(2E86AB|48A9A6|7FB3D3)(?![0-9a-f])` +
    String.raw`|rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*([\d.]+)(%?)\s*)?\)`,
  'gi',
);

/**
 * Todas las referencias de marca de un valor, con su posición RELATIVA al valor.
 * `alfa` es 1 salvo en `rgba()`; `tenida` dice si cae dentro de un `color-mix(`.
 */
export function referencias(valor) {
  const tramosMix = tramosDe(valor, /color-mix\(/gi);
  const refs = [];
  for (const m of valor.matchAll(RE_REF)) {
    let token;
    let forma;
    let alfa = 1;
    if (m[1]) {
      token = m[1].toLowerCase();
      forma = 'var';
    } else if (m[2]) {
      token = HEX_A_TOKEN[m[2].toLowerCase()];
      forma = 'hex';
    } else {
      token = RGB_A_TOKEN[`${+m[3]},${+m[4]},${+m[5]}`];
      if (!token) continue;
      forma = 'rgb';
      if (m[6] !== undefined) alfa = m[7] ? parseFloat(m[6]) / 100 : parseFloat(m[6]);
    }
    const desde = m.index;
    const hasta = m.index + m[0].length;
    const tenida = tramosMix.some(([a, b]) => desde > a && hasta <= b);
    refs.push({ token, forma, alfa, desde, hasta, texto: m[0], tenida });
  }
  return refs;
}

/** Tramos [inicio, fin) de las llamadas que casan con `re` (con paréntesis anidados). */
function tramosDe(texto, re) {
  const tramos = [];
  for (const m of texto.matchAll(re)) {
    let prof = 1;
    let j = m.index + m[0].length;
    while (j < texto.length && prof > 0) {
      if (texto[j] === '(') prof++;
      else if (texto[j] === ')') prof--;
      j++;
    }
    tramos.push([m.index, j]);
  }
  return tramos;
}

/** El texto que sustituye a una referencia: el token, o un `color-mix` si llevaba alfa. */
export function sustituto(token, sufijo, alfa = 1) {
  const v = `var(--${token}-${sufijo})`;
  if (alfa >= 1) return v;
  // Sintaxis CSS: el decimal va con punto, no es una cifra para leer
  const pct = Math.round(alfa * 1000) / 10;
  return `color-mix(in srgb, ${v} ${pct}%, transparent)`;
}

// ─── Blanco y luminancia ──────────────────────────────────────────────────────

const RE_BLANCO = /^(white|#fff|#ffffff|rgba?\(\s*255\s*,\s*255\s*,\s*255\s*(,\s*(1|1\.0+|100%)\s*)?\))$/i;
const limpio = (v) => v.replace(/!important/i, '').trim();
export const esBlanco = (v) => v != null && RE_BLANCO.test(limpio(v));

/** Luminancia relativa WCAG de un hexadecimal de 3 o 6 cifras; null si no lo es. */
export function luminancia(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}$/i.test(h)) return null;
  const canal = (i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(0) + 0.7152 * canal(2) + 0.0722 * canal(4);
}

/** Valores admitidos al redeclarar un token de marca en local: la marca en claro y en oscuro. */
const VALORES_DE_MARCA = new Set(['#2e86ab', '#48a9a6', '#3fa5d1', '#5abdb9', '#7fb3d3', '#26718f', '#327874']);

/**
 * ¿El texto (CSS o TSX) redeclara un token de marca a otro tono? Devuelve las redeclaraciones
 * ajenas, o [] si todas son la marca. Un `var(...)` se admite: encadena a otro token.
 */
export function paletaPropia(texto) {
  const ajenas = [];
  // También los `//` del TSX: «curva: '#26718F', // --primary-boton: 5,2:1» no redeclara nada
  const sinComentarios = texto.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:'"`])\/\/[^\n]*/g, '$1');
  const re = /(?:^|[\s;{'"])--(primary|secondary)(-texto|-boton)?['"]?\s*:\s*['"]?([^;'"}\n,]+)/g;
  for (const m of sinComentarios.matchAll(re)) {
    const valor = m[3].replace(/!important/i, '').trim().toLowerCase();
    if (valor.startsWith('var(')) continue;
    if (VALORES_DE_MARCA.has(valor)) continue;
    ajenas.push(`--${m[1]}${m[2] ?? ''}: ${m[3].trim()}`);
  }
  return ajenas;
}

// ─── Parser de CSS con posiciones ─────────────────────────────────────────────

/** El CSS con cada comentario sustituido por espacios de su misma longitud (saltos incluidos). */
function enmascarar(css) {
  return css.replace(/\/\*[\s\S]*?(\*\/|$)/g, (c) => c.replace(/[^\n]/g, ' '));
}

/**
 * Devuelve los bloques del CSS con sus declaraciones y la POSICIÓN ABSOLUTA de cada valor,
 * que es lo que la campaña necesita para reescribir sin tocar nada más. Admite bloques en
 * una sola línea (varias apps los escriben así), `@media` anidados y anidamiento CSS.
 *
 * Se recorre la versión ENMASCARADA (comentarios en blanco, misma longitud), así que una
 * posición vale igual en el original: un `{` citado en un comentario no abre nada.
 */
export function parsearCss(css) {
  const t = enmascarar(css);
  const n = t.length;
  const bloques = [];

  /** Lee un cuerpo desde `i` (tras la `{`) hasta su `}`; devuelve la posición siguiente. */
  function cuerpo(i, bloque, selectorPadre, contexto) {
    let inicio = i;
    while (i < n) {
      const c = t[i];
      if (c === '"' || c === "'") { i = finCadena(t, i); continue; }
      if (c === '{') {
        const crudo = t.slice(inicio, i);
        const preludio = crudo.trim();
        const pos = inicio + (crudo.length - crudo.trimStart().length);
        if (preludio.startsWith('@')) {
          const ctx = { ...contexto, oscuroMedia: contexto.oscuroMedia || /prefers-color-scheme\s*:\s*dark/i.test(preludio) };
          i = cuerpo(i + 1, null, selectorPadre, ctx);
        } else {
          const propio = preludio.replace(/\s+/g, ' ');
          const selector = !selectorPadre ? propio : propio.includes('&') ? propio.replace(/&/g, selectorPadre) : `${selectorPadre} ${propio}`;
          const hijo = { selector, decls: [], linea: lineaDe(css, pos), contexto };
          bloques.push(hijo);
          i = cuerpo(i + 1, hijo, selector, contexto);
          hijo.fin = i; // justo detrás de su `}`: ahí inserta el reparador de C0226
        }
        inicio = i;
        continue;
      }
      if (c === ';' || c === '}') {
        if (bloque) declaracion(bloque, inicio, i);
        i++;
        if (c === '}') return i;
        inicio = i;
        continue;
      }
      i++;
    }
    return i;
  }

  /** Una declaración `prop: valor` entre [a, b); guarda la posición del valor en el original. */
  function declaracion(bloque, a, b) {
    const trozo = t.slice(a, b);
    const k = trozo.indexOf(':');
    if (k === -1) return;
    const prop = trozo.slice(0, k).trim().toLowerCase();
    // Las propiedades personalizadas (`--danger`) también: las lee el censo de C0226
    if (!/^-?[a-z][a-z-]*$/.test(prop) && !/^--[\w-]+$/.test(prop)) return;
    let desde = a + k + 1;
    let hasta = b;
    while (desde < hasta && /\s/.test(t[desde])) desde++;
    while (hasta > desde && /\s/.test(t[hasta - 1])) hasta--;
    const valor = css.slice(desde, hasta);
    if (valor.includes('/*')) return; // un comentario dentro del valor: no se reescribe a ciegas
    bloque.decls.push({ prop, valor, desde, hasta, linea: lineaDe(css, desde) });
  }

  cuerpo(0, null, null, { oscuroMedia: false });
  return bloques;
}

function finCadena(texto, i) {
  const q = texto[i];
  let j = i + 1;
  while (j < texto.length && texto[j] !== q) {
    if (texto[j] === '\\') j++;
    j++;
  }
  return j + 1;
}

/** Línea (desde 1) de una posición. Guarda los saltos del último texto: se llama miles de veces. */
let cacheTexto = null;
let cacheSaltos = [];
function lineaDe(texto, pos) {
  if (texto !== cacheTexto) {
    cacheTexto = texto;
    cacheSaltos = [];
    for (let i = 0; i < texto.length; i++) if (texto[i] === '\n') cacheSaltos.push(i);
  }
  let lo = 0;
  let hi = cacheSaltos.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cacheSaltos[mid] < pos) lo = mid + 1;
    else hi = mid;
  }
  return lo + 1;
}

// ─── Variables propias del módulo ─────────────────────────────────────────────

/**
 * La marca que llega por una VARIABLE PROPIA del módulo (cabo C0502, 30/10/2026): `--cat-notacion:
 * #2E86AB` y luego `background: var(--cat-notacion); color: white`. El análisis de arriba busca
 * la marca en la declaración y no sigue `var(--cat-notacion)`, así que no la veía (hallazgo 3683
 * de quiz-complejidad-algoritmos; el censo de ese día dio cuatro más en tres apps: las insignias
 * de orientador-iva-espana y orientador-tipos-renta-irpf y la celda de simulador-hashing-colisiones).
 *
 * Devuelve el CSS con cada `var(--propia)` sin reserva sustituido por el valor de marca que el
 * módulo le da FUERA del tema oscuro, y la lista de las sustituidas. Un valor de variable cabe en
 * una línea, así que las líneas no se mueven y los hallazgos del CSS sustituido se pueden
 * comparar, línea a línea, con los del original. Fuera: los tokens de marca y sus `-texto` y
 * `-boton`, que ya analiza lo de arriba, y lo que el módulo declara solo en oscuro.
 */
export function conVariablesPropias(css) {
  const propias = new Map();
  for (const b of parsearCss(css)) {
    if (b.contexto.oscuroMedia || RE_TEMA_OSCURO.test(b.selector)) continue;
    for (const d of b.decls) {
      if (!d.prop.startsWith('--') || /^--(primary|secondary|accent)(-texto|-boton)?$/.test(d.prop)) continue;
      if (d.valor.includes('\n')) continue;
      const refs = referencias(d.valor);
      if (refs.length && refs.every((r) => r.token !== 'accent') && !propias.has(d.prop)) propias.set(d.prop, { valor: d.valor, linea: d.linea });
    }
  }
  if (!propias.size) return { css, propias };
  const sustituido = css.replace(/var\(\s*(--[\w-]+)\s*\)/g, (todo, nombre) => (propias.has(nombre) ? propias.get(nombre).valor : todo));
  return { css: sustituido, propias };
}

// ─── Selectores: tema, base y estado ──────────────────────────────────────────

const RE_TEMA_OSCURO =/\[data-theme\s*=\s*["']?dark["']?\s*\]|:global\(\s*\.dark\s*\)/i;
const quitarTema = (s) =>
  s.replace(/:global\(\s*(\[data-theme[^\]]*\])\s*\)/gi, '$1').replace(/\[data-theme[^\]]*\]\s*/gi, '').replace(/:global\(\s*\.dark\s*\)\s*/gi, '').replace(/\s+/g, ' ').trim();
const quitarEstados = (s) => s.replace(/::?[a-z-]+(\((?:[^()]|\([^()]*\))*\))?/gi, '').replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim();

/** Partes de un selector con coma, con su tema (oscuro o no). */
function partes(selector, contexto) {
  return selector.split(',').map((p) => p.trim()).filter(Boolean).map((p) => ({
    texto: p,
    oscuro: contexto.oscuroMedia || RE_TEMA_OSCURO.test(p),
    sinTema: quitarTema(p),
    base: quitarEstados(quitarTema(p)),
  }));
}

/**
 * El estado deshabilitado está exento de contraste en WCAG 1.4.3. Lo que va dentro de un
 * `:not(…)` es justo lo contrario: `.btn:hover:not(:disabled)` es el botón HABILITADO, y la
 * primera versión de esta función lo eximía (46 bloques, 18/10/2026).
 */
const esDeshabilitado = (p) => /:disabled|\[disabled|\[aria-disabled|disabled/i.test(p.replace(/:not\((?:[^()]|\([^()]*\))*\)/gi, ''));

/**
 * Variantes de una base para buscar su color: `.grid .btn.activo` se busca también como
 * `.grid .btn` y `.grid .activo`. Es como se reparte el estilo de un botón entre su clase
 * base y la del estado.
 */
function variantes(base) {
  const m = base.match(/^(.*?)((?:\.[A-Za-z0-9_-]+){2,})$/);
  if (!m) return [];
  const clases = m[2].match(/\.[A-Za-z0-9_-]+/g);
  return clases.map((c) => `${m[1]}${c}`);
}

// ─── Análisis de una hoja ─────────────────────────────────────────────────────

const PROPS_FONDO = /^background(-color|-image)?$/;
const PROPS_TEXTO = /^(color|-webkit-text-fill-color)$/;
const PROPS_BORDE = /^(border|border-color|outline-color)$/;

/**
 * Analiza una hoja `.module.css`. Devuelve:
 *   hallazgos  — [{ tanda, linea, selector, prop, motivo, defecto, automatico, ediciones }]
 *   aparte     — [{ tipo, linea, selector, detalle }] (acento, svg, tintes, fondo sin texto)
 *
 * `ediciones` son { desde, hasta, nuevo } en posiciones absolutas del texto recibido.
 */
export function analizarCss(css) {
  const bloques = parsearCss(css);
  const lineas = css.split('\n');

  // Color de texto conocido por selector (con estado) y por base, en cada tema.
  const color = { claro: new Map(), oscuro: new Map() };
  const fondoEnOscuro = new Set();
  for (const b of bloques) {
    const c = [...b.decls].reverse().find((d) => d.prop === 'color');
    const tieneFondo = b.decls.some((d) => PROPS_FONDO.test(d.prop));
    for (const p of partes(b.selector, b.contexto)) {
      const mapa = p.oscuro ? color.oscuro : color.claro;
      if (c) {
        mapa.set(p.sinTema, c.valor);
        if (p.sinTema === p.base || !mapa.has(`base:${p.base}`)) mapa.set(`base:${p.base}`, c.valor);
      }
      if (p.oscuro && tieneFondo) {
        fondoEnOscuro.add(p.sinTema);
        fondoEnOscuro.add(`base:${p.base}`);
      }
    }
  }

  /** El color de texto que pinta una parte de selector, o null si no se sabe. */
  function colorDe(p, propio) {
    if (propio) return propio.valor;
    const mapas = p.oscuro ? [color.oscuro, color.claro] : [color.claro];
    for (const mapa of mapas) {
      if (mapa.has(p.sinTema)) return mapa.get(p.sinTema);
      if (mapa.has(`base:${p.base}`)) return mapa.get(`base:${p.base}`);
      for (const v of variantes(p.base)) if (mapa.has(`base:${v}`)) return mapa.get(`base:${v}`);
    }
    return null;
  }

  const hallazgos = [];
  const aparte = [];

  for (const b of bloques) {
    const ps = partes(b.selector, b.contexto);
    const propio = [...b.decls].reverse().find((d) => d.prop === 'color');
    const clipTexto = b.decls.some((d) => /^(-webkit-)?background-clip$/.test(d.prop) && /text/i.test(d.valor));
    const escape = escapeEn(lineas, b.linea, b.decls);
    const deshabilitado = ps.every((p) => esDeshabilitado(p.texto));

    // ── Tanda 1: fondo de marca con texto blanco ──
    const declsFondo = b.decls.filter((d) => PROPS_FONDO.test(d.prop));
    const refsFondo = declsFondo.flatMap((d) => referencias(d.valor).map((r) => ({ ...r, decl: d })));
    if (refsFondo.length && !clipTexto) {
      const colores = ps.map((p) => colorDe(p, propio));
      const blanco = colores.some(esBlanco);
      const solidas = refsFondo.filter((r) => !r.tenida && r.alfa >= 0.5 && r.token !== 'accent');
      const acento = refsFondo.filter((r) => r.token === 'accent' && !r.tenida && r.alfa >= 0.5);
      if (!blanco) {
        if (solidas.length) aparte.push({ tipo: 'fondo de marca sin texto blanco a la vista', linea: b.linea, selector: b.selector, detalle: colores.find(Boolean) ?? 'color heredado' });
      } else if (deshabilitado) {
        aparte.push({ tipo: 'deshabilitado (exento en WCAG)', linea: b.linea, selector: b.selector, detalle: '' });
      } else if (solidas.length || acento.length) {
        const motivos = [];
        if (acento.length) motivos.push('lleva --accent (#7FB3D3), que no tiene token de botón');
        if (solidas.some((r) => r.alfa < 1)) motivos.push('fondo de marca translúcido: con alfa no hay sustituto que garantice 4,5:1');
        if (refsFondo.some((r) => r.tenida || (r.alfa < 0.5 && r.token !== 'accent'))) {
          if (solidas.length) motivos.push('mezcla un tinte con la marca sólida');
        }
        // Una parada clara en el degradado deja el blanco ilegible pase lo que pase con la marca
        for (const d of declsFondo) {
          for (const h of d.valor.matchAll(/#([0-9a-f]{3}|[0-9a-f]{6})(?![0-9a-f])/gi)) {
            if (HEX_A_TOKEN[h[1].toLowerCase()]) continue;
            const L = luminancia(h[0]);
            if (L !== null && 1.05 / (L + 0.05) < 4.5) motivos.push(`el degradado tiene una parada clara (${h[0]})`);
          }
        }
        // En oscuro el texto deja de ser blanco y no hay fondo propio: el -boton quedaría debajo
        for (const p of ps) {
          if (p.oscuro) continue;
          const cOsc = color.oscuro.get(p.sinTema) ?? color.oscuro.get(`base:${p.base}`);
          const fondoOsc = fondoEnOscuro.has(p.sinTema) || fondoEnOscuro.has(`base:${p.base}`);
          if (cOsc && !esBlanco(cOsc) && !fondoOsc) motivos.push(`en oscuro el texto pasa a ${cOsc} sin cambiar de fondo`);
        }
        const automatico = motivos.length === 0;
        const ediciones = [];
        if (automatico) {
          for (const r of solidas) {
            ediciones.push({ desde: r.decl.desde + r.desde, hasta: r.decl.desde + r.hasta, nuevo: sustituto(r.token, 'boton'), viejo: r.texto });
          }
          // El borde del mismo botón, si repite la referencia del fondo, la sigue: si no, queda un
          // anillo más claro alrededor (es lo que hizo a mano 8f5eb9b7).
          const textosFondo = new Set(solidas.map((r) => r.texto.toLowerCase()));
          for (const d of b.decls.filter((x) => PROPS_BORDE.test(x.prop))) {
            for (const r of referencias(d.valor)) {
              if (r.tenida || r.alfa < 1 || r.token === 'accent' || !textosFondo.has(r.texto.toLowerCase())) continue;
              ediciones.push({ desde: d.desde + r.desde, hasta: d.desde + r.hasta, nuevo: sustituto(r.token, 'boton'), viejo: r.texto });
            }
          }
        }
        hallazgos.push({
          tanda: 1,
          linea: b.linea,
          selector: b.selector,
          prop: declsFondo.map((d) => d.prop).join(', '),
          valor: declsFondo.map((d) => d.valor).join(' · '),
          motivo: motivos.join('; '),
          defecto: solidas.length > 0 || acento.length > 0,
          automatico,
          escape,
          ediciones,
        });
      } else if (refsFondo.some((r) => !r.tenida && r.alfa < 0.5)) {
        aparte.push({ tipo: 'tinte de marca con texto blanco', linea: b.linea, selector: b.selector, detalle: declsFondo.map((d) => d.valor).join(' · ') });
      }
    }

    // ── Tanda 2: marca como color de texto ──
    const fondoPropio = declsFondo.map((d) => d.valor).join(' ');
    for (const d of b.decls) {
      const esTexto = PROPS_TEXTO.test(d.prop) || (clipTexto && PROPS_FONDO.test(d.prop));
      if (!esTexto) {
        if (d.prop === 'fill' && /text|label|etiqueta|rotulo|valor|titulo/i.test(b.selector) && referencias(d.valor).length) {
          aparte.push({ tipo: 'svg: texto pintado con fill', linea: d.linea, selector: b.selector, detalle: d.valor });
        }
        continue;
      }
      const refs = referencias(d.valor);
      if (!refs.length) continue;
      const marca = refs.filter((r) => r.token !== 'accent' && !r.tenida);
      // En oscuro #7FB3D3 cumple (7,8:1 sobre #1A1A1A): solo se cuenta el acento en claro
      if (refs.some((r) => r.token === 'accent' && !r.tenida) && !ps.every((p) => p.oscuro)) {
        aparte.push({ tipo: '--accent como texto en claro (2,2:1 sobre blanco, sin token)', linea: d.linea, selector: b.selector, detalle: d.valor });
      }
      if (!marca.length) continue;
      const motivos = [];
      if (marca.some((r) => r.alfa < 1)) motivos.push('texto de marca translúcido');
      if (!clipTexto && fondoPropio) {
        const oscuro = ps.every((p) => p.oscuro);
        if (!oscuro && (referencias(fondoPropio).some((r) => !r.tenida && r.alfa >= 0.5) || /--hero-bg/.test(fondoPropio))) {
          motivos.push('el propio bloque pone un fondo de marca u oscuro: el token de texto es para fondo claro');
        }
        for (const h of fondoPropio.matchAll(/#([0-9a-f]{3}|[0-9a-f]{6})(?![0-9a-f])/gi)) {
          const L = luminancia(h[0]);
          if (L === null || HEX_A_TOKEN[h[1].toLowerCase()]) continue;
          if (!oscuro && L < 0.3) motivos.push(`fondo propio oscuro (${h[0]})`);
          if (oscuro && L > 0.3) motivos.push(`fondo propio claro en tema oscuro (${h[0]})`);
        }
      }
      const automatico = motivos.length === 0;
      // Un fondo claro FIJO (un literal, sin override oscuro que lo cambie ni que cambie el color)
      // sigue claro en oscuro, donde `-texto` se aclara a #3FA5D1: sobre blanco, 2,6:1. Ahí el
      // token es `-boton`, el mismo #26718F en los dos temas (5,47:1). Salió de los 21 bloques
      // `.ctaButton { background: white; color: var(--primary) }` de los cursos (18/10/2026).
      const fondoClaroFijo =
        !clipTexto &&
        !ps.every((p) => p.oscuro) &&
        [...fondoPropio.matchAll(/#[0-9a-f]{6}(?![0-9a-f])|#[0-9a-f]{3}(?![0-9a-f])|\bwhite\b/gi)].some((h) => luminancia(h[0].toLowerCase() === 'white' ? '#ffffff' : h[0]) > 0.5) &&
        ps.every((p) => !fondoEnOscuro.has(p.sinTema) && !fondoEnOscuro.has(`base:${p.base}`) && !color.oscuro.has(p.sinTema) && !color.oscuro.has(`base:${p.base}`));
      const sufijo = fondoClaroFijo ? 'boton' : 'texto';
      hallazgos.push({
        tanda: 2,
        linea: d.linea,
        selector: b.selector,
        prop: d.prop,
        valor: d.valor,
        motivo: motivos.join('; '),
        defecto: true,
        automatico,
        escape: escape ?? escapeEn(lineas, d.linea, []),
        ediciones: automatico
          ? marca.map((r) => ({ desde: d.desde + r.desde, hasta: d.desde + r.hasta, nuevo: sustituto(r.token, sufijo), viejo: r.texto }))
          : [],
      });
    }
  }

  return { hallazgos, aparte };
}

// ─── TSX: estilo en línea ─────────────────────────────────────────────────────

/**
 * Analiza los `style={{ … }}` de un `.tsx`, también los que ocupan varias líneas (129 ficheros
 * los escriben así). Lo demás que lleve la marca —datos de gráficas, un lienzo, un `<text>` de
 * SVG— va a `aparte`: el color de un lienzo no está en un `color:` y ningún sustituto
 * mecánico sirve (simulador-lentes-opticas, inspector 03/10/2026).
 */
export function analizarTsx(tsx) {
  const hallazgos = [];
  const aparte = [];
  const lineas = tsx.split('\n');
  const cubiertos = [];

  for (const m of tsx.matchAll(/style=\{\{/g)) {
    const inicio = m.index + m[0].length;
    const fin = cierreObjeto(tsx, inicio);
    if (fin === -1) continue;
    cubiertos.push([m.index, fin]);
    const props = propiedadesObjeto(tsx, inicio, fin);
    const colorProp = props.find((p) => p.clave === 'color');
    const blanco = colorProp && cadenas(tsx, colorProp.desde, colorProp.hasta).some((c) => esBlanco(c.texto));
    const linea = lineaDe(tsx, m.index);
    const escape = escapeEn(lineas, linea, []);

    for (const p of props) {
      const esFondo = /^background(Color|Image)?$/.test(p.clave);
      const esTexto = p.clave === 'color' || p.clave === 'WebkitTextFillColor';
      if (!esFondo && !esTexto) continue;
      if (esFondo && !blanco) continue;
      const refs = cadenas(tsx, p.desde, p.hasta).flatMap((c) => referencias(c.texto).map((r) => ({ ...r, base: c.desde })));
      const marca = refs.filter((r) => r.token !== 'accent' && !r.tenida && r.alfa >= (esFondo ? 0.5 : 1));
      if (refs.some((r) => r.token === 'accent')) {
        aparte.push({ tipo: '--accent en estilo en línea', linea: lineaDe(tsx, p.desde), selector: 'style={{…}}', detalle: tsx.slice(p.desde, p.hasta).trim() });
      }
      if (!marca.length) continue;
      const translucido = marca.some((r) => r.alfa < 1);
      const tanda = esFondo ? 1 : 2;
      hallazgos.push({
        tanda,
        linea: lineaDe(tsx, p.desde),
        selector: 'style={{…}}',
        prop: p.clave,
        valor: tsx.slice(p.desde, p.hasta).trim(),
        motivo: translucido ? 'color de marca translúcido' : '',
        defecto: true,
        automatico: !translucido,
        escape,
        ediciones: translucido
          ? []
          : marca.map((r) => ({ desde: r.base + r.desde, hasta: r.base + r.hasta, nuevo: sustituto(r.token, tanda === 1 ? 'boton' : 'texto'), viejo: r.texto })),
      });
    }
  }

  // Lo que queda fuera de un style={{}}: se cuenta, no se toca
  const dentro = (pos) => cubiertos.some(([a, b]) => pos >= a && pos < b);
  // El color de un lienzo suele ir en una constante lejos del `fillStyle`: basta con que el
  // fichero pinte texto en <canvas> para que cualquier literal de marca pueda acabar en una letra.
  const lienzo = /\.fillText\s*\(/.test(tsx);
  for (const m of tsx.matchAll(RE_REF)) {
    if (dentro(m.index)) continue;
    const r = referencias(m[0])[0];
    if (!r) continue;
    const linea = lineaDe(tsx, m.index);
    const texto = lineas[linea - 1] ?? '';
    let tipo = 'marca en el TSX fuera de un estilo (datos, gráfica, prop)';
    if (/<text\b|fill=/.test(texto)) tipo = 'svg: fill en el JSX';
    else if (lienzo) tipo = 'lienzo: el fichero pinta texto en <canvas> y lleva la marca';
    aparte.push({ tipo, linea, selector: '', detalle: texto.trim().slice(0, 120) });
  }

  return { hallazgos, aparte };
}

/** Posición de la `}}` que cierra un objeto abierto en `inicio` (tras `{{`), o -1. */
function cierreObjeto(t, inicio) {
  let prof = 1;
  let i = inicio;
  while (i < t.length) {
    const c = t[i];
    if (c === '"' || c === "'") { i = finCadena(t, i); continue; }
    if (c === '`') { i = finPlantilla(t, i); continue; }
    if (c === '/' && t[i + 1] === '/') { const f = t.indexOf('\n', i); i = f === -1 ? t.length : f; continue; }
    if (c === '/' && t[i + 1] === '*') { const f = t.indexOf('*/', i + 2); i = f === -1 ? t.length : f + 2; continue; }
    if (c === '{') prof++;
    else if (c === '}') {
      prof--;
      if (prof === 0) return t[i + 1] === '}' ? i : -1;
    }
    i++;
  }
  return -1;
}

function finPlantilla(t, i) {
  let j = i + 1;
  while (j < t.length && t[j] !== '`') {
    if (t[j] === '\\') { j += 2; continue; }
    if (t[j] === '$' && t[j + 1] === '{') {
      let prof = 1;
      j += 2;
      while (j < t.length && prof > 0) {
        if (t[j] === '{') prof++;
        else if (t[j] === '}') prof--;
        else if (t[j] === '`') j = finPlantilla(t, j) - 1;
        j++;
      }
      continue;
    }
    j++;
  }
  return j + 1;
}

/** Propiedades de primer nivel de un objeto JS: { clave, desde, hasta } del valor. */
function propiedadesObjeto(t, inicio, fin) {
  const props = [];
  let i = inicio;
  while (i < fin) {
    // clave
    const resto = t.slice(i, fin);
    const mk = resto.match(/^[\s,]*(?:(['"])([A-Za-z-]+)\1|([A-Za-z_$][\w$]*))\s*:/);
    if (!mk) {
      // spread u otra cosa: saltar hasta la siguiente coma de primer nivel
      i = siguienteComa(t, i, fin) + 1;
      continue;
    }
    const clave = mk[2] ?? mk[3];
    const desde = i + mk[0].length;
    const hasta = siguienteComa(t, desde, fin);
    props.push({ clave, desde, hasta });
    i = hasta + 1;
  }
  return props;
}

function siguienteComa(t, i, fin) {
  let prof = 0;
  while (i < fin) {
    const c = t[i];
    if (c === '"' || c === "'") { i = finCadena(t, i); continue; }
    if (c === '`') { i = finPlantilla(t, i); continue; }
    if (c === '(' || c === '[' || c === '{') prof++;
    else if (c === ')' || c === ']' || c === '}') prof--;
    else if (c === ',' && prof === 0) return i;
    i++;
  }
  return fin;
}

/** Literales de cadena (sin comillas) dentro de [desde, hasta), con su posición absoluta. */
function cadenas(t, desde, hasta) {
  const res = [];
  let i = desde;
  while (i < hasta) {
    const c = t[i];
    if (c === '"' || c === "'" || c === '`') {
      const f = c === '`' ? finPlantilla(t, i) : finCadena(t, i);
      res.push({ texto: t.slice(i + 1, f - 1), desde: i + 1 });
      i = f;
      continue;
    }
    i++;
  }
  return res;
}

// ─── Escape ───────────────────────────────────────────────────────────────────

/**
 * `marca-ok: <razón>` en la línea, en el comentario que la precede o en el del selector.
 * La razón tiene que ser palabras: la marca a secas da 'sin razón' y el candado rompe igual,
 * como en `check:legal` y `check:contraste-cabeceras`.
 */
export function escapeEn(lineas, n, decls) {
  const trozos = [lineas[n - 1] ?? ''];
  let i = n - 2;
  while (i >= 0 && (lineas[i] ?? '').trim() === '') i--;
  if (i >= 0 && /\*\/|\/\/|marca-ok/.test(lineas[i] ?? '')) {
    let j = i;
    const suelo = Math.max(0, i - 10);
    while (j > suelo && !/\/\*|\{\/\*|\/\//.test(lineas[j] ?? '')) j--;
    trozos.push(lineas.slice(j, i + 1).join('\n'));
  }
  for (const d of decls) trozos.push(lineas[d.linea - 1] ?? '');
  const texto = trozos.join('\n');
  const m = texto.match(/marca-ok:([^\n]*)/);
  if (!m) return null;
  const razon = m[1].replace(/\*\/.*$/, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').trim();
  return /\p{L}{3,}/u.test(razon) ? 'firmado' : 'sin razón';
}

// ─── Aplicar ──────────────────────────────────────────────────────────────────

/** Aplica ediciones { desde, hasta, nuevo } de atrás adelante. Rechaza solapes. */
export function aplicar(texto, ediciones) {
  const orden = [...ediciones].sort((a, b) => b.desde - a.desde);
  let salida = texto;
  let limite = Infinity;
  for (const e of orden) {
    if (e.hasta > limite) throw new Error(`ediciones solapadas en ${e.desde}-${e.hasta}`);
    if (salida.slice(e.desde, e.hasta) !== e.viejo) throw new Error(`la edición en ${e.desde} no encuentra «${e.viejo}»`);
    salida = salida.slice(0, e.desde) + e.nuevo + salida.slice(e.hasta);
    limite = e.desde;
  }
  return salida;
}
