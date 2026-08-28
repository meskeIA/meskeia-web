#!/usr/bin/env node
/**
 * check-memoria.mjs — candado de higiene de la memoria del proyecto.
 *
 * Verifica la SALIDA, no que un proceso terminara: cuenta ficheros, comprueba
 * las condiciones negativas (lo que NO debe existir) y falla con exit 1.
 *
 * Uso:  npm run check:memoria
 *       node scripts/check-memoria.mjs --verbose
 *       MEMORIA_DIR=/otra/ruta node scripts/check-memoria.mjs
 *
 * Comprobaciones:
 *   1. Ningún fichero huérfano (todos enlazados desde MEMORY.md)
 *   2. Ningún enlace de MEMORY.md apunta a un fichero inexistente
 *   3. Ningún wikilink [[x]] sin destino
 *   4. `name:` del frontmatter == nombre de fichero
 *   5. Frontmatter mínimo presente (name, description, type)
 *   6. Punteros externos vivos (agenda.json, _private/, scripts/, código, CLAUDE.md)
 *   7. MEMORY.md con margen sobre los DOS techos —bytes y líneas—, y su serie (delta por sesión)
 *   8. Ninguna autorreferencia [[a-sí-mismo]]
 *   9. Ningún `node scripts/…` citado que apunte a un script inexistente
 *  10. Pronóstico de RITMO: días hasta el umbral al ritmo actual de fichas nuevas
 *
 * ⚠️ Al probar con MEMORIA_DIR, pasar también SERIE_MEMORIA a una ruta desechable: si no, la
 * ejecución escribe su lectura en la serie real y mete una entrada falsa del día. Se repara
 * volviendo a ejecutar el candado normal (la entrada del día se sobrescribe), pero es más
 * limpio no ensuciarla. Descubierto probando el techo de líneas el 28/08/2026.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const VERBOSE = process.argv.includes('--verbose');
const REPO = path.resolve(import.meta.dirname, '..');

// Umbrales del índice. El único dato duro es el LÍMITE DE LECTURA: a partir de ~24,4 KB
// MEMORY.md deja de cargarse entero, y ahí sí se pierde memoria de verdad.
//
// Los otros dos se derivan de él (85% y 94%), NO del tamaño que tuviera el índice un día
// concreto. Hasta el 11/08/2026 el aviso estaba en 17.100 B, que eran los 17.086 B en que
// quedó el índice tras la consolidación del 06/08 redondeados: un umbral fijado en "como
// quedó aquel día" se cruza a los pocos días y avisa para siempre. Salía en cada ejecución
// desde entonces, que es la definición de un semáforo que ha dejado de informar
// (feedback_semaforo_color_que_informa). Recalibrado con fundamento: el aviso avisa cuando
// queda poco margen real, no cuando el índice ha vuelto a crecer.
const UMBRAL_ERROR = 24_400;                              // límite de lectura (dato duro)
const UMBRAL_AVISO = Math.round(UMBRAL_ERROR * 0.85);     // 20.740 B — margen para reaccionar
const UMBRAL_CRITICO = Math.round(UMBRAL_ERROR * 0.94);   // 22.936 B — ya casi sin margen

// El límite NO es solo de tamaño. La documentación oficial dice: «The first 200 lines of
// MEMORY.md, or the first 25KB, whichever comes first» — son DOS techos y basta con tocar uno.
// Hasta el 28/08/2026 aquí solo se vigilaban los bytes, así que el candado podía dar verde
// mientras el índice se truncaba por líneas y nadie se enteraba. Hoy van casi parejos (129
// líneas = 64 %, 16.914 B = 66 %), pero un índice de entradas cortas cruzaría antes el de
// líneas, y uno de entradas largas antes el de bytes. Se vigilan los dos.
const LINEAS_ERROR = 200;
const LINEAS_AVISO = Math.round(LINEAS_ERROR * 0.85);     // 170
const LINEAS_CRITICO = Math.round(LINEAS_ERROR * 0.94);   // 188

// Lo que de verdad informa no es el nivel (constante durante semanas) sino el DELTA: el
// índice pasó de 17.086 B a 19.450 en 5 días, y tres cuartas partes de esa subida no fueron
// fichas nuevas sino entradas viejas engordando al editarlas. Un salto grande en una sesión
// es accionable; un número alto y quieto no.
const SALTO_ACCIONABLE = 600;                             // B desde la lectura anterior
// SERIE_MEMORIA permite apuntar a una serie desechable: es lo que hace posible
// `npm run memoria:probar-ritmo`, que reinyecta series sintéticas y exige que el pronóstico
// dispare donde debe y calle donde debe, sin tocar la serie real.
const SERIE = process.env.SERIE_MEMORIA || path.join(REPO, '_private', 'serie-indice-memoria.json');
const MAX_SERIE = 30;

// Tokens con forma de memoria que NO lo son (nombres de campo, variables…)
const FALSOS_POSITIVOS = new Set([
  'user_agent', 'user_id', 'user_prompt', 'user_config', 'user_login', 'user_path',
  'user_system_prompt', 'project_id', 'project_name', 'project_type', 'project_root',
]);

// Dónde se busca a memorias citadas desde fuera de la carpeta
const FUENTES_EXTERNAS = [
  path.join(os.homedir(), 'Mis Desarrollos', 'Vigilancia', 'Centro de Mando', 'agenda.json'),
  path.join(os.homedir(), '.claude', 'CLAUDE.md'),
  path.join(REPO, 'CLAUDE.md'),
  path.join(REPO, '_private'),
  path.join(REPO, 'scripts'),
  path.join(REPO, 'components'),
  path.join(REPO, 'lib'),
];

function localizarMemoria() {
  if (process.env.MEMORIA_DIR) return process.env.MEMORIA_DIR;
  const proyectos = path.join(os.homedir(), '.claude', 'projects');
  const derivada = path.join(proyectos, REPO.replace(/[:\\/]/g, '-'), 'memory');
  if (fs.existsSync(path.join(derivada, 'MEMORY.md'))) return derivada;
  // Fallback: cualquier carpeta de proyecto cuyo nombre acabe en el del repo
  if (fs.existsSync(proyectos)) {
    const base = path.basename(REPO);
    for (const d of fs.readdirSync(proyectos)) {
      const cand = path.join(proyectos, d, 'memory');
      if (d.endsWith(base) && fs.existsSync(path.join(cand, 'MEMORY.md'))) return cand;
    }
  }
  return null;
}

function ficherosDe(destino) {
  if (!fs.existsSync(destino)) return [];
  if (fs.statSync(destino).isFile()) return [destino];
  const salida = [];
  for (const entrada of fs.readdirSync(destino, { withFileTypes: true })) {
    const p = path.join(destino, entrada.name);
    if (entrada.isDirectory()) salida.push(...ficherosDe(p));
    else if (/\.(md|mjs|js|ts|tsx|json)$/.test(entrada.name)) salida.push(p);
  }
  return salida;
}

const DIR = localizarMemoria();
if (!DIR) {
  console.error('✖ No se encuentra la carpeta de memoria. Define MEMORIA_DIR.');
  process.exit(1);
}

const errores = [];
const avisos = [];

const indice = fs.readFileSync(path.join(DIR, 'MEMORY.md'), 'utf8');
const bytesIndice = Buffer.byteLength(indice, 'utf8');
const ficheros = fs.readdirSync(DIR).filter(f => f.endsWith('.md') && f !== 'MEMORY.md');
const slugs = new Set(ficheros.map(f => f.replace(/\.md$/, '')));

// --- 1 y 2: enlaces del índice ---
const enlazados = new Set([...indice.matchAll(/\]\(([^)]+\.md)\)/g)].map(m => m[1]));
for (const f of ficheros) {
  if (!enlazados.has(f)) errores.push(`Huérfano (sin enlace en MEMORY.md): ${f}`);
}
for (const e of enlazados) {
  if (!ficheros.includes(e)) errores.push(`MEMORY.md enlaza a un fichero inexistente: ${e}`);
}

// --- 3, 4, 5 y 8: contenido de cada ficha ---
for (const f of ficheros) {
  const raw = fs.readFileSync(path.join(DIR, f), 'utf8');
  const slug = f.replace(/\.md$/, '');

  const name = (raw.match(/^name:\s*(.*)$/m) || [])[1]?.trim().replace(/^["']|["']$/g, '');
  if (!name) errores.push(`Sin campo name: ${f}`);
  else if (name !== slug) errores.push(`name: desalineado en ${f} → "${name}"`);

  if (!/^description:\s*\S/m.test(raw)) errores.push(`Sin description: ${f}`);
  if (!/^\s*type:\s*(user|feedback|project|reference)\s*$/m.test(raw)) {
    avisos.push(`type ausente o no estándar: ${f}`);
  }

  for (const m of raw.matchAll(/\[\[([^\]]+)\]\]/g)) {
    const destino = m[1].trim();
    if (destino === slug) errores.push(`Autorreferencia [[${destino}]] en ${f}`);
    else if (!slugs.has(destino)) errores.push(`Wikilink roto: ${f} → [[${destino}]]`);
  }
}

// --- 9: scripts que una ficha ofrece ejecutar y ya no existen ---
//
// Una ficha que dice `node scripts/loquesea.mjs` cuando ese script se borró no ocupa sitio:
// MIENTE, y el comando falla en manos de quien la crea. Salió de la auditoría del 11/08/2026:
// dos scripts anunciados como "reutilizables" llevaban un mes borrados, y un tercero se
// ofrecía como la herramienta de auditoría de los schemas de ChatGPT.
//
// Deliberadamente ACOTADO a la forma ejecutable (`node scripts/…`). La primera versión barría
// toda ruta citada en prosa y daba 10 avisos sin un solo hallazgo real —globs recortados,
// placeholders, rutas aún por construir y las propias notas de corrección—: un candado que
// avisa siempre deja de informar, que es justo lo que dice feedback_semaforo_color_que_informa.
const DEFUNCION = /\b(borrad|borró|borro|eliminad|eliminó|eliminaron|elimino|ya no (existe|hay|está|vive)|no existe|desaparec|revertid|se retiró|retirad|NO recrear)\b/i;
const COMANDO = /\bnode\s+(scripts\/[A-Za-z0-9_.\/-]+\.(?:mjs|js))/g;
const scriptsMuertos = new Map();

for (const f of ficheros) {
  for (const linea of fs.readFileSync(path.join(DIR, f), 'utf8').split(/\r?\n/)) {
    if (DEFUNCION.test(linea)) continue;   // la ficha ya dice que no existe: cuenta la verdad
    for (const m of linea.matchAll(COMANDO)) {
      if (fs.existsSync(path.join(REPO, m[1]))) continue;
      if (!scriptsMuertos.has(f)) scriptsMuertos.set(f, new Set());
      scriptsMuertos.get(f).add(m[1]);
    }
  }
}
for (const [f, rutas] of scriptsMuertos) {
  errores.push(`${f} ofrece ejecutar un script que ya no existe: ${[...rutas].join(', ')}`);
}

// --- 6: punteros externos vivos ---
const rotosExternos = new Map();
for (const fuente of FUENTES_EXTERNAS) {
  for (const fichero of ficherosDe(fuente)) {
    let texto;
    try { texto = fs.readFileSync(fichero, 'utf8'); } catch { continue; }
    for (const m of texto.matchAll(/\b(?:project|feedback|reference|user)_[a-z0-9_-]+/g)) {
      const token = m[0].replace(/\.md$/, '');
      if (FALSOS_POSITIVOS.has(token)) continue;
      // Vale si existe tal cual, o si es el prefijo de un fichero real (token cortado por un guion)
      if (slugs.has(token) || [...slugs].some(s => s.startsWith(token))) continue;
      const rel = path.relative(os.homedir(), fichero);
      if (!rotosExternos.has(token)) rotosExternos.set(token, new Set());
      rotosExternos.get(token).add(rel);
    }
  }
}
for (const [token, donde] of rotosExternos) {
  errores.push(`Puntero externo a una memoria que ya no existe: ${token} (en ${[...donde].join(', ')})`);
}

// --- 7: tamaño del índice, y su serie ---
if (bytesIndice > UMBRAL_ERROR) {
  errores.push(`MEMORY.md ${bytesIndice} B supera el LÍMITE DE LECTURA (${UMBRAL_ERROR} B): deja de cargarse entero`);
} else if (bytesIndice > UMBRAL_CRITICO) {
  errores.push(`MEMORY.md ${bytesIndice} B roza el límite de lectura (${UMBRAL_ERROR} B) — podar YA`);
} else if (bytesIndice > UMBRAL_AVISO) {
  avisos.push(`MEMORY.md ${bytesIndice} B pasa del 85% del límite de lectura (${UMBRAL_AVISO} B) — queda poco margen`);
}

// El segundo techo: LÍNEAS. Se cruza el que llegue antes, así que se comprueban por separado.
const lineasIndice = indice.split('\n').length;
if (lineasIndice > LINEAS_ERROR) {
  errores.push(`MEMORY.md tiene ${lineasIndice} líneas y supera el LÍMITE DE ${LINEAS_ERROR}: lo que pasa de ahí NO se carga`);
} else if (lineasIndice > LINEAS_CRITICO) {
  errores.push(`MEMORY.md tiene ${lineasIndice} líneas y roza el límite de ${LINEAS_ERROR} — agrupar entradas YA`);
} else if (lineasIndice > LINEAS_AVISO) {
  avisos.push(`MEMORY.md tiene ${lineasIndice} líneas, pasa del 85% del límite de ${LINEAS_ERROR} — agrupar varias fichas por línea`);
}

// Serie: una entrada por día (la del día se sobrescribe si se ejecuta varias veces).
const hoy = new Date().toISOString().slice(0, 10);
let serie = [];
try { serie = JSON.parse(fs.readFileSync(SERIE, 'utf8')).lecturas ?? []; } catch { /* primera vez */ }
const previa = serie.filter(l => l.fecha !== hoy).at(-1);
serie = [...serie.filter(l => l.fecha !== hoy), { fecha: hoy, bytes: bytesIndice, fichas: ficheros.length }].slice(-MAX_SERIE);
try {
  fs.mkdirSync(path.dirname(SERIE), { recursive: true });
  fs.writeFileSync(SERIE, JSON.stringify({ lecturas: serie }, null, 1));
} catch { /* si _private no es escribible, la serie es prescindible */ }

let deltaTexto = '';
if (previa) {
  const d = bytesIndice - previa.bytes;
  const df = ficheros.length - previa.fichas;
  const signo = d > 0 ? '+' : '';
  deltaTexto = ` · ${signo}${d} B desde ${previa.fecha} (${signo}${df} fichas)`;
  if (d >= SALTO_ACCIONABLE) {
    const porFichas = df > 0 ? ` Solo ${df} ficha(s) nueva(s): el resto es engorde de entradas ya existentes.` : '';
    avisos.push(`El índice creció ${d} B desde ${previa.fecha}.${porFichas} Mirar qué entradas se han cargado de contenido.`);
  }
}

// --- 10: pronóstico de RITMO ---
//
// El nivel del índice no informa: es constante durante semanas y depende de cuándo se podó
// por última vez. Lo que decide si esto vuelve a romperse es el RITMO al que entran fichas,
// porque el índice tiene que enumerarlas todas. Medido el 28/08/2026: 1,55 fichas/día a 94 B
// cada una son 145 B/día, y desde 16.001 B eso agota el margen en 33 días. Por eso el
// pronóstico se IMPRIME siempre, en días: un número que cambia con el comportamiento informa,
// y un porcentaje quieto no (feedback_semaforo_color_que_informa).
//
// Se calcula sobre FICHAS, no sobre bytes: una poda hunde los bytes y falsearía la
// pendiente —la del 28/08 fueron −5.188 B en un día—, mientras que el recuento de fichas
// sube de forma monótona y sobrevive a las podas.
//
// El aviso NO dice "poda": dice dónde va lo que entra. Podar es tratar el stock; el flujo se
// trata en el origen, con la regla de destino de la cabecera de MEMORY.md. Fundir fichas se
// midió y compra poco: al 50 % pasaba de 33 a 72 días, menos que bajar el flujo un 60 %.
const DIAS_MARGEN_MINIMO = 45;    // por debajo, el aviso todavía da tiempo a reaccionar
const MIN_LECTURAS = 4;           // con menos, la pendiente es ruido

let ritmoTexto = '';
if (serie.length >= MIN_LECTURAS) {
  const prim = serie[0];
  const ult = serie[serie.length - 1];
  const dias = (new Date(ult.fecha) - new Date(prim.fecha)) / 86400000;
  const nuevasFichas = ult.fichas - prim.fichas;
  if (dias >= 7 && nuevasFichas > 0) {
    const fichasDia = nuevasFichas / dias;
    const costeFicha = bytesIndice / Math.max(ficheros.length, 1);
    const bytesDia = fichasDia * costeFicha;
    const diasAviso = Math.round((UMBRAL_AVISO - bytesIndice) / bytesDia);
    ritmoTexto = `\n   Ritmo: ${fichasDia.toFixed(2)} fichas/día · ${Math.round(bytesDia)} B/día · ` +
      (diasAviso > 0 ? `~${diasAviso} días hasta el aviso` : 'el aviso YA está superado');
    if (diasAviso > 0 && diasAviso < DIAS_MARGEN_MINIMO) {
      avisos.push(
        `A este ritmo (${fichasDia.toFixed(2)} fichas/día) el índice llega al umbral de aviso en ~${diasAviso} días. ` +
        `Antes de crear ficha, mirar la regla de destino de la cabecera de MEMORY.md: un candado, ` +
        `el CLAUDE.md del directorio o la skill no cuestan un solo byte de índice.`
      );
    }
  }
}

// --- Informe ---
const pct = ((bytesIndice / UMBRAL_ERROR) * 100).toFixed(0);
const pctLineas = ((lineasIndice / LINEAS_ERROR) * 100).toFixed(0);
console.log(`\n🧾 Memoria del proyecto — ${path.relative(os.homedir(), DIR)}`);
console.log(`   ${ficheros.length} fichas · MEMORY.md ${(bytesIndice / 1024).toFixed(1)} KB (${pct}%) · ${lineasIndice}/${LINEAS_ERROR} líneas (${pctLineas}%) · ${enlazados.size} enlaces${deltaTexto}${ritmoTexto}`);

if (VERBOSE) {
  const porTipo = {};
  for (const f of ficheros) porTipo[f.split('_')[0]] = (porTipo[f.split('_')[0]] || 0) + 1;
  console.log(`   Por tipo: ${Object.entries(porTipo).map(([t, n]) => `${t} ${n}`).join(' · ')}`);
  console.log(`   Punteros externos comprobados: ${FUENTES_EXTERNAS.filter(fs.existsSync).length}/${FUENTES_EXTERNAS.length} fuentes`);
}

if (avisos.length) {
  console.log(`\n⚠️  ${avisos.length} aviso(s):`);
  avisos.forEach(a => console.log(`   · ${a}`));
}
if (errores.length) {
  console.log(`\n✖ ${errores.length} error(es):`);
  errores.forEach(e => console.log(`   · ${e}`));
  console.log('');
  process.exit(1);
}
console.log(`\n✅ Sin huérfanos, sin enlaces rotos, sin punteros externos muertos.\n`);
