#!/usr/bin/env node
// -------------------------------------------------------------------------------------------------
// detectar-duplicados.mjs — Detector de casi-duplicados del catálogo meskeIA (uso interno)
// -------------------------------------------------------------------------------------------------
// FILTRO / GUARDARRAÍL, no generador: NO propone apps nuevas. Avisa de solapes con lo que YA existe
// para no duplicar en silencio al crear apps (complementa /semilla-diaria y /nueva-app-meskeia).
//
// Uso:
//   node scripts/detectar-duplicados.mjs "idea o descripcion libre"   # consulta (preventivo)
//   node scripts/detectar-duplicados.mjs --slug conversor-braille     # vecinos de una app existente
//   node scripts/detectar-duplicados.mjs --pares                      # barrido del catalogo
//   node scripts/detectar-duplicados.mjs --clusters                   # clusteres tematicos + uso 30d
//
// Opciones:
//   --top N          nº de resultados (consulta: 8 · pares: 40 · clusters: 20)
//   --umbral X       similitud mínima 0..1 (consulta: 0.10 · pares y clusters: 0.32)
//   --mismo-modo     (solo --pares) solo pares con el mismo modo (riesgo real de duplicado)
//   --con-familias   (solo --pares) NO ocultar las familias intencionadas (historia, compraventa…)
//   --min-usos N     (solo --clusters) uso mínimo del clúster para emitir veredicto (50)
//
// MODO --clusters (2026-08-24): responde a «¿potenciar o ampliar?», que es una decisión de CLÚSTER
// TEMÁTICO y no de suite. El briefing de /semilla-diaria mide la concentración por suite (top2%),
// pero el patrón «una estrella arrastra y sus hermanas están muertas» vive un nivel más abajo:
// mascotas era 441 usos en calculadora-tamano-adulto-perro frente a 27 repartidos en 7 apps, y para
// verlo había que grepear a mano. Aquí sale solo, cruzando la similitud léxica con el uso real.
//
// LÍMITE HONESTO: la similitud es LÉXICA (TF-IDF + coseno sobre nombre+keywords+slug+descripción),
// no semántica. No capta sinónimos puros ("ración de pienso" ≈ "cantidad de comida para tu perro"
// comparten poco léxico literal). Es una red que atrapa mucho, no un oráculo.
//
// Por eso cada app se etiqueta por MODO según el prefijo del slug:
//   · operativa  → HACE (calcula/convierte/genera/simula…): calculadora, conversor, estimador…
//   · descriptiva→ EXPLICA/CUENTA: visualizador, guia, quiz, tabla…
// Un solape entre una descriptiva y una operativa del mismo tema es, casi siempre, funciones
// DISTINTAS (falso positivo). El script lo marca con «≠modo» para que el juicio lo hagas tú.
// -------------------------------------------------------------------------------------------------

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(__dirname, '..');
const APPS_TS = path.join(RAIZ, 'data', 'applications.ts');
const TURSO_DIR = path.join(RAIZ, '_backups', 'turso');

// -------------------------------------------------------------------------------------------------
// 1. Parseo de data/applications.ts (mismo regex robusto que semilla-diaria.mjs: objetos planos)
// -------------------------------------------------------------------------------------------------
function parsearApps() {
  const txt = readFileSync(APPS_TS, 'utf8');
  const bloques = txt.match(/\{[^{}]*url:\s*"[^"]*"[^{}]*\}/g) || [];
  const apps = [];
  for (const b of bloques) {
    const url = b.match(/url:\s*"([^"]+)"/)?.[1];
    if (!url) continue;
    const name = b.match(/name:\s*"([^"]+)"/)?.[1] || url;
    const description = b.match(/description:\s*"((?:[^"\\]|\\.)*)"/)?.[1] || '';
    const kwRaw = b.match(/keywords:\s*\[([^\]]*)\]/)?.[1] || '';
    const keywords = [...kwRaw.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    const suitesRaw = b.match(/suites:\s*\[([^\]]*)\]/)?.[1] || '';
    const suites = [...suitesRaw.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    const slug = url.replace(/^\/|\/$/g, '');
    apps.push({ name, slug, description, keywords, suites });
  }
  return apps;
}

// -------------------------------------------------------------------------------------------------
// 2. Tokenización (acentos fuera, stopwords fuera, singularización ligera y SIMÉTRICA)
// -------------------------------------------------------------------------------------------------
const STOP = new Set(
  ('a al algo alguna algunas alguno algunos ante antes aqui asi aun cada como con contra cual cuales ' +
   'cuando de del desde donde dos el ella ellas ello ellos en entre era eran eras eres es esa esas ese ' +
   'eso esos esta estas este esto estos fue fueron ha hace hacia han hasta hay la las le les lo los mas ' +
   'me mi mis mucho muchos muy nada ni no nos nuestra nuestro o os otra otras otro otros para pero poco ' +
   'por porque que se sea segun ser si sin sobre solo son su sus tambien te ti tu tus un una unas uno unos ' +
   'y ya tanto toda todas todo todos tras vez cosa cualquier tipo mismo cada segun tu tus para online gratis')
    .split(/\s+/)
);

function quitarAcentos(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Singularización simétrica: se aplica igual a corpus y consulta, así que aunque sea imperfecta
// ("colores"→"colore"), hace coincidir "gastos"↔"gasto", "palabras"↔"palabra", "mascotas"↔"mascota".
function singular(t) {
  if (t.length >= 6 && t.endsWith('es')) return t.slice(0, -2);
  if (t.length >= 5 && t.endsWith('s')) return t.slice(0, -1);
  return t;
}

function tokenizar(texto) {
  const crudo = quitarAcentos(String(texto).toLowerCase())
    .replace(/[^a-z0-9]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const out = [];
  for (const bruto of crudo) {
    if (STOP.has(bruto)) continue;
    if (bruto.length < 2) continue;
    const t = singular(bruto);
    if (t.length < 2 || STOP.has(t)) continue;
    out.push(t);
  }
  return out;
}

// -------------------------------------------------------------------------------------------------
// 3. Frecuencia de términos por app (nombre y keywords pesan más que la descripción)
// -------------------------------------------------------------------------------------------------
const PESOS = { name: 3, keywords: 2, slug: 2, description: 1 };

function docTF(app) {
  const tf = new Map();
  const add = (tokens, w) => { for (const t of tokens) tf.set(t, (tf.get(t) || 0) + w); };
  add(tokenizar(app.name), PESOS.name);
  add(app.keywords.flatMap((k) => tokenizar(k)), PESOS.keywords);
  add(tokenizar(app.slug.replace(/-/g, ' ')), PESOS.slug);
  add(tokenizar(app.description), PESOS.description);
  return tf;
}

// -------------------------------------------------------------------------------------------------
// 4. TF-IDF + vectores unitarios dispersos
// -------------------------------------------------------------------------------------------------
function calcularIDF(tfs) {
  const N = tfs.length;
  const df = new Map();
  for (const tf of tfs) for (const t of tf.keys()) df.set(t, (df.get(t) || 0) + 1);
  const idf = new Map();
  for (const [t, d] of df) idf.set(t, Math.log((N + 1) / (d + 1)) + 1);
  return { idf, df, N };
}

function vector(tf, idf, idfMax) {
  const v = new Map();
  let norm = 0;
  for (const [t, f] of tf) {
    const w = f * (idf.get(t) ?? idfMax); // término de consulta no visto en corpus → idf máximo
    if (!w) continue;
    v.set(t, w);
    norm += w * w;
  }
  norm = Math.sqrt(norm) || 1;
  for (const [t, w] of v) v.set(t, w / norm);
  return v;
}

function coseno(a, b) {
  const [s, l] = a.size < b.size ? [a, b] : [b, a];
  let dot = 0;
  for (const [t, w] of s) { const wb = l.get(t); if (wb) dot += w * wb; }
  return dot;
}

// -------------------------------------------------------------------------------------------------
// 5. Modo (operativa/descriptiva/otra) y familia por prefijo del slug
// -------------------------------------------------------------------------------------------------
const OPERATIVA = new Set([
  'calculadora', 'conversor', 'convertidor', 'generador', 'estimador', 'simulador', 'orientador',
  'planificador', 'selector', 'comparador', 'contador', 'buscador', 'adaptador', 'escalador',
  'medidor', 'analizador', 'recordatorio', 'temporizador', 'cronometro', 'seguimiento', 'tablero',
  'lector', 'detector', 'optimizador',
]);
const DESCRIPTIVA = new Set([
  'visualizador', 'guia', 'quiz', 'curso', 'calendario', 'directorio', 'tabla', 'explicador',
  'mapa', 'ficha', 'glosario',
]);

function modo(slug) {
  const p = slug.split('-')[0];
  if (OPERATIVA.has(p)) return 'operativa';
  if (DESCRIPTIVA.has(p)) return 'descriptiva';
  return 'otra';
}
function etiquetaModo(m) {
  return m === 'operativa' ? 'HACE' : m === 'descriptiva' ? 'EXPLICA' : '—';
}
// Familia intencionada = dos primeros segmentos iguales (visualizador-historia-*, simulador-gastos-*)
function familia(slug) {
  return slug.split('-').slice(0, 2).join('-');
}

function terminosComunes(tfA, tfB, idf, k = 6) {
  const comunes = [];
  for (const t of tfA.keys()) if (tfB.has(t)) comunes.push([t, idf.get(t) || 0]);
  comunes.sort((a, b) => b[1] - a[1]);
  return comunes.slice(0, k).map((x) => x[0]);
}

const pct = (x) => `${Math.round(x * 100)}%`;

// -------------------------------------------------------------------------------------------------
// 6. CLI
// -------------------------------------------------------------------------------------------------
function parseArgs() {
  const argv = process.argv.slice(2);
  const flags = { libres: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--pares') flags.pares = true;
    else if (a === '--clusters') flags.clusters = true;
    else if (a === '--min-usos') flags.minUsos = parseInt(argv[++i], 10);
    else if (a === '--mismo-modo') flags.mismoModo = true;
    else if (a === '--con-familias') flags.conFamilias = true;
    else if (a === '--slug') flags.slug = argv[++i];
    else if (a === '--top') flags.top = parseInt(argv[++i], 10);
    else if (a === '--umbral') flags.umbral = parseFloat(argv[++i]);
    else if (a === '--help' || a === '-h') flags.help = true;
    else flags.libres.push(a);
  }
  return flags;
}

function ayuda() {
  console.log(`
detectar-duplicados.mjs — filtro de casi-duplicados del catálogo meskeIA

  node scripts/detectar-duplicados.mjs "idea libre"        consulta preventiva (top vecinos)
  node scripts/detectar-duplicados.mjs --slug <slug>       vecinos de una app existente
  node scripts/detectar-duplicados.mjs --pares             barrido del catálogo
  node scripts/detectar-duplicados.mjs --clusters          clústeres temáticos + uso 30 d

  --top N   --umbral X (0..1)   --mismo-modo   --con-familias   --min-usos N

Similitud LÉXICA (no semántica). «≠modo» marca solapes entre una app que HACE y otra que EXPLICA:
casi siempre funciones distintas, no un duplicado real.
`);
}

// -------------------------------------------------------------------------------------------------
// 7. Programa
// -------------------------------------------------------------------------------------------------
const flags = parseArgs();
if (flags.help) { ayuda(); process.exit(0); }

const apps = parsearApps();
const tfs = apps.map(docTF);
const { idf, df, N } = calcularIDF(tfs);
const idfMax = Math.log((N + 1) / 1) + 1;
const vecs = tfs.map((tf) => vector(tf, idf, idfMax));

console.log(`\n=== detectar-duplicados · ${apps.length} apps · similitud léxica (TF-IDF) ===`);

// --- 7a. Consulta / slug: vecinos de un vector ---------------------------------------------------
function mostrarVecinos(refTf, refVec, refIdx, refLabel) {
  const top = flags.top || 8;
  const umbral = flags.umbral ?? 0.10;
  const res = [];
  for (let i = 0; i < apps.length; i++) {
    if (i === refIdx) continue;
    const sim = coseno(refVec, vecs[i]);
    if (sim >= umbral) res.push({ i, sim });
  }
  res.sort((a, b) => b.sim - a.sim);

  console.log(`\nConsulta: ${refLabel}`);
  if (!res.length) {
    console.log(`  · sin coincidencias léxicas por encima de ${pct(umbral)} → probablemente hueco real.`);
    return;
  }
  console.log(`  ${res.length} vecino(s) ≥ ${pct(umbral)} (top ${Math.min(top, res.length)}):\n`);
  for (const { i, sim } of res.slice(0, top)) {
    const a = apps[i];
    const m = modo(a.slug);
    const comunes = terminosComunes(refTf, tfs[i], idf);
    console.log(`  ${pct(sim).padStart(4)}  ${etiquetaModo(m).padEnd(7)} ${a.name}`);
    console.log(`        /${a.slug}/  ·  suites: ${a.suites.join(', ') || '—'}`);
    console.log(`        coincide en: ${comunes.join(', ') || '—'}`);
  }
}

// --- 7b. Pares: barrido retrospectivo ------------------------------------------------------------
function mostrarPares() {
  const top = flags.top || 40;
  const umbral = flags.umbral ?? 0.32;

  // Índice invertido con corte de términos ubicuos → candidatos; el coseno se recalcula EXACTO.
  const DF_CUT = Math.max(40, Math.floor(N * 0.12));
  const postings = new Map();
  vecs.forEach((v, i) => {
    for (const [t, w] of v) {
      if ((df.get(t) || 0) > DF_CUT) continue;
      let arr = postings.get(t);
      if (!arr) { arr = []; postings.set(t, arr); }
      arr.push([i, w]);
    }
  });
  const candidatos = new Set();
  for (const arr of postings.values()) {
    for (let x = 0; x < arr.length; x++) {
      for (let y = x + 1; y < arr.length; y++) {
        const a = Math.min(arr[x][0], arr[y][0]);
        const b = Math.max(arr[x][0], arr[y][0]);
        candidatos.add(a * N + b);
      }
    }
  }

  let pares = [];
  for (const key of candidatos) {
    const a = Math.floor(key / N);
    const b = key % N;
    const sim = coseno(vecs[a], vecs[b]);
    if (sim >= umbral) pares.push({ a, b, sim });
  }

  const totalBruto = pares.length;
  let ocultasFamilia = 0;
  let ocultasCruce = 0;
  pares = pares.filter(({ a, b }) => {
    if (!flags.conFamilias && familia(apps[a].slug) === familia(apps[b].slug)) { ocultasFamilia++; return false; }
    if (flags.mismoModo && modo(apps[a].slug) !== modo(apps[b].slug)) { ocultasCruce++; return false; }
    return true;
  });
  pares.sort((x, y) => y.sim - x.sim);

  console.log(`\nBarrido de pares ≥ ${pct(umbral)}: ${totalBruto} candidatos` +
    (ocultasFamilia ? ` · ${ocultasFamilia} de familias intencionadas ocultos (--con-familias para verlos)` : '') +
    (ocultasCruce ? ` · ${ocultasCruce} ≠modo ocultos` : ''));
  if (!pares.length) { console.log('  · nada relevante tras filtrar.'); return; }

  console.log(`  Mostrando top ${Math.min(top, pares.length)} (de ${pares.length}):\n`);
  for (const { a, b, sim } of pares.slice(0, top)) {
    const ma = modo(apps[a].slug), mb = modo(apps[b].slug);
    const marca = ma !== mb ? '  ≠modo (¿funciones distintas?)' : (ma !== 'otra' ? `  =modo (${etiquetaModo(ma)})` : '');
    const comunes = terminosComunes(tfs[a], tfs[b], idf);
    console.log(`  ${pct(sim).padStart(4)}  ${apps[a].name}  ⇄  ${apps[b].name}${marca}`);
    console.log(`        /${apps[a].slug}/  ⇄  /${apps[b].slug}/`);
    console.log(`        coincide en: ${comunes.join(', ') || '—'}`);
  }
}

// --- 7b bis. Clústeres temáticos cruzados con el uso real ----------------------------------------

// Uso 30 d por app desde el dump congelado de Turso: misma fuente y mismos filtros que /digest-diario
// y /semilla-diaria (humanos, sin bots, sin la IP propia, sin páginas institucionales), para que las
// cifras de aquí sean comparables con las de allí y no aparezca una tercera contabilidad.
function usos30dPorApp() {
  if (!existsSync(TURSO_DIR)) return null;
  const files = readdirSync(TURSO_DIR).filter((f) => /^turso-dump-\d{4}-\d{2}-\d{2}\.sql$/.test(f)).sort();
  if (!files.length) return null;
  const dumpPath = path.join(TURSO_DIR, files[files.length - 1]);
  const db = new DatabaseSync(':memory:');
  const cargarDump = db.exec.bind(db); // node:sqlite carga el dump SQL (NO es child_process)
  cargarDump(readFileSync(dumpPath, 'utf8'));
  const one = (s) => db.prepare(s).get();
  const all = (s) => db.prepare(s).all();

  const tieneConfig = one(`SELECT name FROM sqlite_master WHERE type='table' AND name='analytics_config'`);
  const ipExcluida = tieneConfig ? (one(`SELECT valor v FROM analytics_config WHERE clave='ip_excluida'`)?.v ?? null) : null;
  const FILTRO_IP = ipExcluida
    ? ` AND (ip_address IS NULL OR ip_address <> '${String(ipExcluida).replace(/'/g, "''")}')`
    : '';
  const anchor = one(`SELECT MAX(created_at) m FROM uso_aplicaciones`).m;
  const filas = all(`
    SELECT aplicacion app, COUNT(*) usos FROM uso_aplicaciones
    WHERE created_at > datetime('${anchor}','-30 days') AND created_at <= '${anchor}'
      AND modo<>'bot' AND es_propio=0${FILTRO_IP}
      AND aplicacion NOT LIKE 'mcp:%' AND aplicacion NOT LIKE 'pag:%' AND aplicacion <> 'meskeIA'
    GROUP BY aplicacion`);
  return { mapa: new Map(filas.map((r) => [r.app, r.usos])), dump: path.basename(dumpPath), anchor };
}

// Lista de vecinos por app (mismo índice invertido que --pares; el coseno se recalcula EXACTO).
function adyacencia(umbral) {
  const DF_CUT = Math.max(40, Math.floor(N * 0.12));
  const postings = new Map();
  vecs.forEach((v, i) => {
    for (const [t, w] of v) {
      if ((df.get(t) || 0) > DF_CUT) continue;
      let arr = postings.get(t);
      if (!arr) { arr = []; postings.set(t, arr); }
      arr.push([i, w]);
    }
  });

  const calculados = new Set();
  const ady = new Map();
  const enlaza = (a, b, sim) => {
    let arr = ady.get(a);
    if (!arr) { arr = []; ady.set(a, arr); }
    arr.push([b, sim]);
  };
  for (const arr of postings.values()) {
    for (let x = 0; x < arr.length; x++) {
      for (let y = x + 1; y < arr.length; y++) {
        const a = Math.min(arr[x][0], arr[y][0]);
        const b = Math.max(arr[x][0], arr[y][0]);
        const key = a * N + b;
        if (calculados.has(key)) continue;
        calculados.add(key);
        const sim = coseno(vecs[a], vecs[b]);
        if (sim < umbral) continue;
        enlaza(a, b, sim);
        enlaza(b, a, sim);
      }
    }
  }
  return ady;
}

function mediana(nums) {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}

const MAX_MIEMBROS = 15;

function mostrarClusters() {
  const top = flags.top || 20;
  const umbral = flags.umbral ?? 0.32;
  const minUsos = Number.isFinite(flags.minUsos) ? flags.minUsos : 50;

  const trafico = usos30dPorApp();
  const uso = (i) => (trafico ? trafico.mapa.get(apps[i].slug) || 0 : 0);
  const ady = adyacencia(umbral);

  // Clustering «por líder»: el núcleo de cada grupo es la app MÁS USADA que aún no pertenece a
  // ninguno, y se le adjuntan sus vecinos léxicos libres. Anclar en el uso —en vez de tomar
  // componentes conexas— evita el encadenamiento transitivo A~B~C, que fundiría familias enteras
  // en un solo grupo inútil, y deja la estrella en el centro por construcción, que es lo que se
  // quiere leer. Contrapartida honesta: la asignación depende del orden, así que una app puede
  // caer en el grupo del líder más fuerte y no en el que más se le parece.
  const orden = apps.map((_, i) => i).sort((a, b) => uso(b) - uso(a) || a - b);
  const asignado = new Set();
  const grupos = [];
  for (const nucleo of orden) {
    if (asignado.has(nucleo)) continue;
    asignado.add(nucleo);
    const vecinos = (ady.get(nucleo) || [])
      .filter(([j]) => !asignado.has(j))
      .sort((x, y) => y[1] - x[1]);
    if (!vecinos.length) continue;
    const miembros = [nucleo];
    for (const [j] of vecinos) { asignado.add(j); miembros.push(j); }
    grupos.push(miembros);
  }

  const filas = grupos.map((m) => {
    const ms = [...m].sort((a, b) => uso(b) - uso(a));
    const usos = ms.map(uso);
    const total = usos.reduce((a, b) => a + b, 0);
    const pctEstrella = total ? usos[0] / total : 0;
    let veredicto;
    if (!trafico) veredicto = '· sin dump';
    else if (ms.length > MAX_MIEMBROS) veredicto = '· familia grande';
    else if (total < minUsos) veredicto = '· frío';
    else if (ms.length >= 3 && pctEstrella >= 0.6 && mediana(usos.slice(1)) <= 10) veredicto = '⚠ POTENCIAR';
    else veredicto = '≈ repartido';
    return { ms, usos, total, pctEstrella, veredicto };
  });
  filas.sort((a, b) => b.total - a.total || b.ms.length - a.ms.length);

  console.log(`\nClústeres temáticos ≥ ${pct(umbral)}` +
    (trafico ? ` · uso 30 d de ${trafico.dump}` : ' · SIN DUMP: agrupa, pero no juzga'));
  if (!filas.length) { console.log('  · ninguna app tiene vecinos por encima del umbral.'); return; }
  console.log(`  ${filas.length} grupo(s) de 2+ apps · mostrando top ${Math.min(top, filas.length)} por uso total\n`);

  for (const f of filas.slice(0, top)) {
    console.log(`  ${f.veredicto.padEnd(16)} ${String(f.total).padStart(5)} usos30d · ${String(f.ms.length).padStart(2)} apps · ${pct(f.pctEstrella).padStart(4)} en la estrella`);
    // Junto a cada hermana, lo que la ata a la estrella: es lo que permite descartar de un vistazo
    // los falsos positivos del léxico (movimiento CIRCULAR ⇄ economía CIRCULAR no son un clúster).
    const estrella = f.ms[0];
    f.ms.slice(0, MAX_MIEMBROS).forEach((i, k) => {
      const une = k === 0 ? '' : `  · une: ${terminosComunes(tfs[estrella], tfs[i], idf, 3).join(', ') || '—'}`;
      console.log(`      ${String(f.usos[k]).padStart(5)}  /${apps[i].slug}/${une}`);
    });
    if (f.ms.length > MAX_MIEMBROS) console.log(`      … y ${f.ms.length - MAX_MIEMBROS} apps más`);
    console.log('');
  }

  const aPotenciar = filas.filter((f) => f.veredicto === '⚠ POTENCIAR').length;
  console.log(`  ⚠ POTENCIAR = 3+ apps · ${minUsos}+ usos en el grupo · 60%+ del uso en una sola · mediana del resto ≤ 10.`);
  console.log(`    ${aPotenciar} grupo(s) lo cumplen: ahí una app nueva nacería al lado de hermanas que ya nadie abre.`);
  console.log('  · frío = el grupo no llega al uso mínimo. No dice «amplía»: dice que no hay señal para decidir.');
  console.log('  OJO: una app publicada hace pocas semanas aparece en la cola sin serlo. Comprueba su antigüedad');
  console.log('       antes de contarla como muerta (feedback_no_medir_antes_de_madurar).');
}

// --- 7c. Enrutado --------------------------------------------------------------------------------
if (flags.pares) {
  mostrarPares();
} else if (flags.clusters) {
  mostrarClusters();
} else if (flags.slug) {
  const s = flags.slug.replace(/^\/|\/$/g, '');
  const idx = apps.findIndex((a) => a.slug === s);
  if (idx < 0) {
    console.error(`\n[error] no encuentro la app con slug "${s}". Comprueba data/applications.ts.`);
    process.exit(1);
  }
  mostrarVecinos(tfs[idx], vecs[idx], idx, `${apps[idx].name}  (/${s}/, modo ${etiquetaModo(modo(s))})`);
} else if (flags.libres.length) {
  const consulta = flags.libres.join(' ');
  const tf = docTF({ name: consulta, keywords: [], slug: '', description: consulta });
  const vec = vector(tf, idf, idfMax);
  mostrarVecinos(tf, vec, -1, `"${consulta}"`);
} else {
  ayuda();
}

console.log('');
