#!/usr/bin/env node
/**
 * Candado: los lectores del canal IA no pueden divergir del clasificador.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * DE QUÉ CASO SALE (18/09/2026, ciclo SEO mensual)
 *
 * El 14/09/2026 se saneó el foso IA: `modo='chatgpt'` dejó de contar por la cara y pasó a
 * exigir la MISMA lista blanca de user-agent que el MCP, porque las routes de
 * `app/api/chatgpt/*` son públicas y el CORS no protege una llamada de servidor a servidor.
 * Aquel día se tocaron TRES sitios —`lib/analytics-rollup.ts`, `scripts/digest-diario.mjs` y
 * `scripts/analizar-ia-paginas.mjs`— y la memoria del proyecto quedó avisando: «las TRES a la
 * vez, o divergen».
 *
 * Eran CUATRO. `scripts/cruce-seo.mjs` se quedó fuera y siguió sumando `modo='chatgpt'` sin
 * filtro, así que el ciclo SEO del 18/09 declaró **439 visitas de canal IA donde el foso real
 * era 359**. Las 80 sobrantes no eran ruido repartido: **79 eran un único GPT llamando a la
 * Action de `estimador-impuesto-sucesiones`** —79 de las 81 visitas de esa app; las otras 2
 * humanas— y el informe las presentaba en cabeza de su sección 4 como la mayor conquista del
 * canal IA. Cuatro días de divergencia bastaron para que la métrica que decide la inversión
 * en el foso dijera un 22 % más de lo que había.
 *
 * Nadie lo vio porque **el número que salía era plausible**. Es la misma forma del caso del
 * 30/07/2026 en el dashboard (Resumen IA y Últimos Registros contando distinto), que se cerró
 * exportando `mcpEsClienteIdentificado` para que el lado TypeScript compartiera una sola
 * implementación. Del lado de los scripts no se podía: son `.mjs` ejecutados con node y no
 * pueden importar el `.ts`, así que las copias son deliberadas — y por eso hacía falta algo
 * que las compare.
 *
 * QUÉ EXIGE — dos reglas, las dos comparando CONJUNTOS, no líneas
 *
 *   1. Todos los consumidores declaran EXACTAMENTE los mismos UA que la fuente
 *      (`lib/analytics-rollup.ts`). Sobra uno o falta uno, y rompe.
 *   2. Un consumidor que trate `modo='chatgpt'` como canal IA tiene que someterlo a su lista
 *      blanca. Ésta es la regla que caza el caso de origen: en `cruce-seo.mjs` la línea
 *      `if (modo === 'referral-ia' || modo === 'chatgpt') a.ia30 += n;` no tenía ninguna marca
 *      de lista blanca a la vista.
 *
 * Y una tercera condición, que es la que impide que este candado se vuelva un adorno: si no
 * consigue LEER el conjunto de un fichero declarado, **falla**. Un validador que devuelve
 * «0 errores» tiene que poder distinguir entre «está bien» y «no he mirado» — la lección del
 * `tsc` ciego del 14/08/2026 (§TypeScript del CLAUDE.md). Si mañana alguien escribe la lista
 * en una sintaxis nueva, este script dice que no sabe leerla en vez de aprobarla.
 *
 * QUÉ **NO** MIRA
 *  · No decide QUÉ UA merecen lista blanca: eso es criterio, y su sitio es la fuente. Aquí
 *    solo se comprueba que los cuatro digan lo mismo.
 *  · No mira la ESCRITURA. Que las routes capturen el user-agent lo vigila
 *    `check-analytics-gpt.mjs` (14/09/2026), que es el candado complementario: uno cuida que
 *    se sepa quién llama, éste que todos los lectores lo interpreten igual.
 *  · No comprueba `modo='mcp'` con el mismo rigor que `chatgpt`: el MCP lleva lista blanca
 *    desde el 30/07/2026 en los cuatro sitios y no ha divergido nunca. Si algún día lo hace,
 *    la regla 1 lo caza igual, porque el conjunto es el mismo para los dos modos.
 *  · `scripts/cruce-seo.mjs` está **gitignored** (su serie y su script son locales), así que
 *    aquí es OPCIONAL: si está, se verifica; si no, se dice y no se rompe nada. De lo
 *    contrario este candado rompería el build en Vercel y en cualquier clon nuevo.
 *
 * SIN PASIVO: los cuatro sitios quedaron alineados el 18/09/2026, así que solo puede
 * encenderlo un cambio nuevo. Escape: `clasificador-ia-ok: <razón>` en esa línea o la anterior.
 *
 * Uso:  node scripts/check-clasificador-ia.mjs  ·  --raiz <dir> para auditar una copia
 *       (lo usa `npm run clasificador-ia:probar-candado`, que le reinyecta el caso de origen).
 * ─────────────────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const iRaiz = argv.indexOf('--raiz');
const RAIZ = iRaiz !== -1
  ? path.resolve(argv[iRaiz + 1])
  : path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const ESCAPE = /clasificador-ia-ok:/;

/** La fuente del criterio en el runtime; el resto son copias que deben coincidir con ella. */
const FUENTE = 'lib/analytics-rollup.ts';

/**
 * Consumidores del criterio. Añadir una copia nueva = añadir su entrada aquí.
 *
 * ⚠️ `soloLocal` = el fichero está **gitignored**, así que NO existe en el clon de Vercel ni en
 * una máquina recién clonada. Ahí se omite con un aviso; en local, donde sí está, se verifica.
 *
 * Esta marca no es cosmética: la primera versión de este candado daba `digest-diario.mjs` por
 * versionado, y el despliegue del 18/09/2026 **falló en Vercel** con «el fichero no existe»
 * —commit 75a49542, el que introdujo el candado—. El error de fondo no fue la marca mal puesta
 * sino haberla SUPUESTO: la lista de qué está versionado se le pregunta a git, no a la memoria.
 * Por eso la prueba nº 7 del probador reconstruye ahora el árbol real con `git ls-files` en vez
 * de retirar a mano el fichero que yo creía que era el único ausente.
 */
const CONSUMIDORES = [
  { ruta: 'scripts/digest-diario.mjs', soloLocal: true },
  { ruta: 'scripts/analizar-ia-paginas.mjs', soloLocal: false },
  { ruta: 'scripts/cruce-seo.mjs', soloLocal: true },
];

/**
 * Nombre de una constante que declara la lista blanca. Acotar la búsqueda a SU valor es
 * imprescindible: la primera versión de este candado barría el fichero entero y se traía
 * cualquier `LIKE '…%'` que hubiera cerca —`'pag:%'`, `'mcp:%'`, `'related%'` en
 * `digest-diario.mjs`— y los `nombre:` del array («Claude», «ChatGPT»), así que declaraba
 * divergencia donde no había. Un candado que grita de más se desactiva igual que uno que calla.
 */
// El prefijo va OPCIONAL a propósito (`[A-Z0-9_]*`, no `[A-Z][A-Z0-9_]*`): con un carácter
// obligatorio delante, `UA_IA_OK` —el nombre que usa `cruce-seo.mjs`, y precisamente la copia
// del caso de origen— no casaba, y el candado lo reportaba como «no sé leer su lista blanca».
const NOMBRE_LISTA = /\b(?:const|let|var)?\s*([A-Z0-9_]*(?:CLIENTES_IA|LISTA_BLANCA|UA_IA_OK)[A-Z0-9_]*)\s*=/g;

/**
 * Devuelve el texto del valor que empieza en `i`, equilibrando delimitadores y parando en el
 * `;` de nivel 0. Hace falta porque los valores son multilínea en tres de las cuatro copias
 * (array de objetos, template literal de SQL) y cortar por la primera `;` o por N caracteres
 * partiría la declaración por la mitad — y media lista leída es peor que ninguna.
 */
function valorDesde(texto, i) {
  let nivel = 0;
  let comilla = null;
  for (let j = i; j < texto.length; j++) {
    const c = texto[j];
    if (comilla) {
      if (c === '\\') { j++; continue; }
      if (c === comilla) comilla = null;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') { comilla = c; continue; }
    if (c === '[' || c === '{' || c === '(') nivel++;
    else if (c === ']' || c === '}' || c === ')') nivel--;
    else if (c === ';' && nivel <= 0) return texto.slice(i, j);
  }
  return texto.slice(i);
}

/**
 * Extrae el conjunto de UA declarado en un fichero, admitiendo las CUATRO sintaxis que las
 * copias usan hoy, y SOLO dentro del valor de una constante de lista blanca.
 *
 * Si no encuentra nada, devuelve un conjunto vacío y quien llama DEBE tratarlo como fallo:
 * «no sé leer este fichero» no es «este fichero está bien».
 */
function extraerUA(texto) {
  const ua = new Set();
  const patrones = [];
  NOMBRE_LISTA.lastIndex = 0;

  for (const m of texto.matchAll(NOMBRE_LISTA)) {
    const valor = valorDesde(texto, m.index + m[0].length);

    // A) Alternancia dentro de un regex:  /^(Claude-User|openai-mcp|MistralAI-MCPClient)/i
    for (const r of valor.matchAll(/\/\^\(([A-Za-z0-9|_.\-]+)\)\//g)) {
      const partes = r[1].split('|').map((s) => s.trim()).filter(Boolean);
      if (partes.length) { partes.forEach((p) => ua.add(p)); patrones.push('regex ^(A|B|C)'); }
    }

    // B) Array de objetos:  [{ ua: 'Claude-User', nombre: 'Claude' }, …]
    //    Solo el campo `ua`; el `nombre` es la etiqueta para pantalla, no el user-agent.
    const porCampo = [...valor.matchAll(/\bua\s*:\s*['"`]([^'"`]+)['"`]/g)];
    if (porCampo.length) { porCampo.forEach((r) => ua.add(r[1])); patrones.push('campo ua:'); }

    // C) SQL:  … LIKE 'Claude-User%' OR … LIKE 'openai-mcp%'
    const porLike = [...valor.matchAll(/LIKE\s*'([^%']+)%'/g)];
    if (porLike.length) { porLike.forEach((r) => ua.add(r[1])); patrones.push("SQL LIKE 'A%'"); }

    // D) Array de cadenas sueltas:  ['Claude-User', 'openai-mcp']
    //    Solo si ninguna de las formas anteriores ha leído nada de este valor: si las hay,
    //    las cadenas restantes son etiquetas o trozos de SQL, no user-agents.
    if (!porCampo.length && !porLike.length && /^\s*\[/.test(valor)) {
      const sueltas = [...valor.matchAll(/['"`]([^'"`]+)['"`]/g)];
      if (sueltas.length) { sueltas.forEach((r) => ua.add(r[1])); patrones.push('array de cadenas'); }
    }
  }

  return { ua, patrones: [...new Set(patrones)] };
}

/** Líneas que tratan `chatgpt` como MODO (no el referrer 'chatgpt.com', que es otra cosa). */
function lineasModoChatgpt(lineas) {
  const salida = [];
  for (let i = 0; i < lineas.length; i++) {
    const l = lineas[i];
    if (!/chatgpt/i.test(l)) continue;
    // El referrer de una visita con clic: `ref === 'chatgpt.com'`. No es el modo.
    if (/chatgpt\.com/.test(l)) continue;
    // Solo cuenta cuando se compara contra el campo `modo`.
    if (!/modo\s*(?:===?|=)\s*['"`]chatgpt['"`]|modo\s*IN\s*\([^)]*chatgpt/i.test(l)) continue;
    salida.push({ n: i + 1, texto: l });
  }
  return salida;
}

const fallos = [];
const avisos = [];

// ── Lectura de la fuente ──────────────────────────────────────────────────────

const absFuente = path.join(RAIZ, FUENTE);
if (!existsSync(absFuente)) {
  console.error(`❌ Clasificador IA: no existe la FUENTE ${FUENTE}.`);
  console.error('   Si se ha movido, actualizar la constante FUENTE de este candado.');
  process.exit(1);
}
const textoFuente = readFileSync(absFuente, 'utf8');
const { ua: uaFuente, patrones: patFuente } = extraerUA(textoFuente);

if (uaFuente.size === 0) {
  console.error(`❌ Clasificador IA: no sé leer la lista blanca de la FUENTE (${FUENTE}).`);
  console.error('   El candado NO puede aprobar lo que no ha sabido leer (ver la cabecera).');
  console.error('   Si la sintaxis ha cambiado, añadir su patrón a extraerUA().');
  process.exit(1);
}

// ── Regla 1 y 2 sobre cada consumidor ─────────────────────────────────────────

const listaFuente = [...uaFuente].sort();

for (const { ruta, soloLocal } of CONSUMIDORES) {
  const abs = path.join(RAIZ, ruta);
  if (!existsSync(abs)) {
    if (soloLocal) { avisos.push(`${ruta} no está en el árbol (es gitignored) — no verificado`); continue; }
    fallos.push({
      ruta,
      que: 'el fichero no existe',
      detalle: `si se ha movido o renombrado, actualizar CONSUMIDORES; si se ha vuelto gitignored,
     marcarlo \`soloLocal: true\` — pero COMPROBÁNDOLO con \`git ls-files\`, no de memoria.`,
    });
    continue;
  }

  const texto = readFileSync(abs, 'utf8');
  const lineas = texto.split('\n');
  const escapado = (n) => ESCAPE.test(lineas[n - 1] || '') || ESCAPE.test(lineas[n - 2] || '');

  // REGLA 1 — el conjunto tiene que ser el mismo
  const { ua, patrones } = extraerUA(texto);
  if (ua.size === 0) {
    fallos.push({
      ruta,
      que: 'no sé leer su lista blanca',
      detalle: `declara \`chatgpt\`/\`mcp\` pero no reconozco ninguna de las 4 sintaxis conocidas.
     Añadir su patrón a extraerUA() de este candado, o la copia no se está verificando.`,
    });
  } else {
    const lista = [...ua].sort();
    const faltan = listaFuente.filter((x) => !ua.has(x));
    const sobran = lista.filter((x) => !uaFuente.has(x));
    if (faltan.length || sobran.length) {
      fallos.push({
        ruta,
        que: 'su lista blanca NO coincide con la fuente',
        detalle: `fuente (${FUENTE}): ${listaFuente.join(', ')}
     aquí:   ${lista.join(', ')}${faltan.length ? `\n     ⤳ FALTAN: ${faltan.join(', ')}` : ''}${sobran.length ? `\n     ⤳ SOBRAN: ${sobran.join(', ')}` : ''}
     Al tocar una copia hay que tocar las ${CONSUMIDORES.length + 1} a la vez, o divergen.`,
      });
    }
  }

  // REGLA 2 — `modo='chatgpt'` tiene que pasar por la lista blanca
  // Marcas admitidas: cualquier UA del conjunto, el identificador de la lista, o la función
  // del runtime. Ventana de ±12 líneas: la comprobación y el uso van juntos en las 4 copias.
  const marcas = [
    ...listaFuente.map((u) => u.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
    'MCP_CLIENTES_IA', 'UA_IA_OK', 'GPT_IDENT', 'MCP_IDENT', 'FOSO',
    'mcpEsClienteIdentificado', 'uaCliente', 'nUaIA', 'clasificarIA',
  ];
  const reMarca = new RegExp(marcas.join('|'), 'i');

  for (const { n, texto: linea } of lineasModoChatgpt(lineas)) {
    if (escapado(n)) continue;
    const desde = Math.max(0, n - 13);
    const hasta = Math.min(lineas.length, n + 12);
    const ventana = lineas.slice(desde, hasta).join('\n');
    if (!reMarca.test(ventana)) {
      fallos.push({
        ruta,
        que: `trata modo='chatgpt' como canal IA sin lista blanca (línea ${n})`,
        detalle: `${linea.trim()}
     El endpoint de las Actions es público: sin UA atribuible no se puede afirmar que haya
     una IA al otro lado. Es el caso del 18/09/2026 — 79 de 80 visitas de un solo GPT.`,
      });
    }
  }
}

// ── Salida ────────────────────────────────────────────────────────────────────

for (const a of avisos) console.log(`ℹ️  Clasificador IA: ${a}`);

if (fallos.length) {
  console.error(`\n❌ Clasificador IA: ${fallos.length} problema(s) — los lectores del canal IA han divergido.\n`);
  for (const f of fallos) {
    console.error(`   ${f.ruta}: ${f.que}`);
    console.error(`     ${f.detalle}\n`);
  }
  console.error('   Por qué rompe el build: el foso IA es la métrica que decide si se invierte en');
  console.error('   el canal, y una divergencia entre lectores la mueve sin que nadie lo note.');
  console.error('   Falso positivo: `clasificador-ia-ok: <razón>` en esa línea o en la anterior.\n');
  process.exit(1);
}

const verificados = CONSUMIDORES.filter((c) => existsSync(path.join(RAIZ, c.ruta))).length;
console.log(
  `✅ Clasificador IA: ${verificados + 1} lectores con la misma lista blanca ` +
  `(${listaFuente.join(', ')}) y \`chatgpt\` sujeto a ella en todos`
);
