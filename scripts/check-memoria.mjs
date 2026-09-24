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
 *   7. MEMORY.md con margen sobre los DOS techos —caracteres y líneas—, y su serie (delta por sesión)
 *   8. Ninguna autorreferencia [[a-sí-mismo]]
 *   9. Ningún `node scripts/…` citado que apunte a un script inexistente
 *  10. Pronóstico de RITMO: días hasta el techo del hook al ritmo actual de fichas nuevas
 *  11. FRENOS: cada freno de la lista sigue en la línea de su ficha (y avisa de los no vigilados)
 *
 * ⚠️ Al probar con MEMORIA_DIR, pasar también SERIE_MEMORIA a una ruta desechable: si no, la
 * ejecución escribe su lectura en la serie real y mete una entrada falsa del día. Se repara
 * volviendo a ejecutar el candado normal (la entrada del día se sobrescribe), pero es más
 * limpio no ensuciarla. Descubierto probando el techo de líneas el 28/08/2026. Por lo mismo,
 * FRENOS_MEMORIA apunta a otra lista de frenos.
 *
 * Pruebas: `npm run memoria:probar-ritmo` (pronóstico) y `npm run memoria:probar-frenos`
 * (frenos, con el caso de origen del 23/09/2026 reinyectado).
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const VERBOSE = process.argv.includes('--verbose');
const REPO = path.resolve(import.meta.dirname, '..');

// Umbrales del índice, en CARACTERES (unidades UTF-16, `texto.length`), que es como mide el
// propio Claude Code. Los tres salen del harness, no del tamaño que tuviera el índice un día:
//
//   · LÍMITE DE LECTURA — 25.000 car. Por encima, MEMORY.md deja de cargarse entero.
//   · TECHO DEL HOOK — 20.000 car. (80 %). Desde ahí un hook INTERNO de Claude Code (no está en
//     ningún settings.json) responde a cada edición del índice con «Compact it to under 17.1KB
//     now». Es el techo real: pasado este punto, la poda la impone el hook a mitad de la tarea
//     que sea, con prisa y sin revisión.
//   · AVISO — 17.500 car. (70 %), el objetivo que pide ese mismo hook. Deja ~2.500 caracteres
//     —un mes al ritmo de septiembre— para hacer la poda en una sesión dedicada, antes que él.
//
// El caso de origen (23/09/2026): el índice pasó el techo del hook, el hook saltó en mitad de
// una sesión sobre el Inspector y se compactó en UN minuto de 21.749 B a 14.790 B. Ningún
// enlace se perdió, pero sí la mitad de los 31 vetos que la recomposición de agosto había
// dejado en el índice a propósito. Se reparó el 24/09. El aviso de entonces estaba en 20.740 B
// (≈19.900 car.): el mismo punto que el hook, así que nunca dejaba margen para anticiparse.
//
// ⚠️ Medido en caracteres y no en bytes porque el hook dijo «20.4KB» con el índice en 21.749 B
// y 20.877 caracteres (20.877 / 1024 = 20,4). En bytes, los acentos y emojis del índice pesan
// un 4 % más y los umbrales quedaban desplazados respecto al hook.
//
// ⚠️ No es la trampa del 17.100 del 11/08, aunque el número se parezca: aquel era el tamaño en
// que quedó el índice tras una consolidación («como quedó aquel día») y se cruzaba a los pocos
// días. Este es un objetivo que fija el harness desde fuera y que no se mueve cuando se poda.
const LIMITE_LECTURA = 25_000;                               // car. — el «24.4KB read limit»
const TECHO_HOOK = Math.round(LIMITE_LECTURA * 0.80);        // 20.000 car. — el hook impone la poda
const UMBRAL_AVISO = Math.round(LIMITE_LECTURA * 0.70);      // 17.500 car. — el objetivo del hook

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
const caracteresIndice = indice.length;   // unidades UTF-16, como las cuenta el hook
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

  // Los wikilinks se buscan FUERA del código. `[[ ]]` es sintaxis de bash, y una ficha que
  // cite un cambio del changelog sobre ella la escribe entre backticks: el candado la leía
  // como un wikilink de destino vacío y cantaba "Wikilink roto → [[]]" sin que hubiera nada
  // roto (14/09/2026, reference_revision_mensual_claude_code). Un error que no existe acaba
  // enseñando a ignorar el candado, que es justo lo que no puede pasar con un validador.
  const sinCodigo = raw.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
  for (const m of sinCodigo.matchAll(/\[\[([^\]]+)\]\]/g)) {
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
// Punto de millar siempre: `toLocaleString('es-ES')` no agrupa las cifras de cuatro dígitos
const miles = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
if (caracteresIndice > LIMITE_LECTURA) {
  errores.push(`MEMORY.md tiene ${miles(caracteresIndice)} car. y supera el LÍMITE DE LECTURA (${miles(LIMITE_LECTURA)}): deja de cargarse entero`);
} else if (caracteresIndice > TECHO_HOOK) {
  errores.push(`MEMORY.md tiene ${miles(caracteresIndice)} car. y pasa el TECHO DEL HOOK (${miles(TECHO_HOOK)}): cada edición del índice pedirá compactar YA. ` +
    `Sesión dedicada de poda ahora, moviendo solo detalle a las fichas; los frenos los vigila la comprobación 11`);
} else if (caracteresIndice > UMBRAL_AVISO) {
  avisos.push(`MEMORY.md tiene ${miles(caracteresIndice)} car., por encima del objetivo del hook (${miles(UMBRAL_AVISO)}). ` +
    `Programar una sesión dedicada de poda antes de los ${miles(TECHO_HOOK)}, donde el hook la impone a mitad de otra tarea`);
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
serie = [...serie.filter(l => l.fecha !== hoy), { fecha: hoy, bytes: bytesIndice, caracteres: caracteresIndice, fichas: ficheros.length }].slice(-MAX_SERIE);
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
//
// Desde el 24/09/2026 cuenta los días hasta el TECHO DEL HOOK, no hasta el aviso: el aviso
// pasó a estar a un mes del techo a propósito, y medir hasta él haría sonar este pronóstico
// casi siempre (un color que sale siempre no informa).
const DIAS_MARGEN_MINIMO = 45;    // por debajo, el aviso todavía da tiempo a reaccionar
const MIN_LECTURAS = 4;           // con menos, la pendiente es ruido
const decimal = n => new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

let ritmoTexto = '';
if (serie.length >= MIN_LECTURAS) {
  const prim = serie[0];
  const ult = serie[serie.length - 1];
  const dias = (new Date(ult.fecha) - new Date(prim.fecha)) / 86400000;
  const nuevasFichas = ult.fichas - prim.fichas;
  if (dias >= 7 && nuevasFichas > 0) {
    const fichasDia = nuevasFichas / dias;
    const costeFicha = caracteresIndice / Math.max(ficheros.length, 1);
    const caracteresDia = fichasDia * costeFicha;
    const diasTecho = Math.round((TECHO_HOOK - caracteresIndice) / caracteresDia);
    ritmoTexto = `\n   Ritmo: ${decimal(fichasDia)} fichas/día · ${Math.round(caracteresDia)} car./día · ` +
      (diasTecho > 0 ? `~${diasTecho} días hasta el techo del hook` : 'el techo del hook YA está superado');
    if (diasTecho > 0 && diasTecho < DIAS_MARGEN_MINIMO) {
      avisos.push(
        `A este ritmo (${decimal(fichasDia)} fichas/día) el índice llega al techo del hook en ~${diasTecho} días. ` +
        `Antes de crear ficha, mirar la regla de destino de la cabecera de MEMORY.md: un candado, ` +
        `la skill o la agenda no cuestan un solo carácter de índice.`
      );
    }
  }
}

// --- 11: FRENOS del índice ---
//
// Un freno es la anotación que impide proponer algo ya descartado —«NO», «DESCARTADO»,
// «CERRADO»— o su contrafreno, el «salvo…» que impide aplicarlo de más. Es lo único que
// justifica una línea del índice (cabecera de MEMORY.md), y también lo primero que se lleva
// una compactación con prisa, porque las líneas que explican un freno son las más largas.
//
// El caso de origen (23/09/2026): el hook del techo saltó a mitad de otra tarea, el índice se
// compactó en un minuto y ningún enlace se perdió, así que las comprobaciones 1 a 10 dieron
// verde. Pero «plano en pág. 2+ → NO», la lista de los clústers cerrados o «si el tercero ES la
// app, se RETIRA» desaparecieron. El texto seguía en las fichas, y no bastaba: en 248
// transcripciones no hay ni una ficha recuperada sola, así que una ficha solo se lee cuando la
// línea del índice da motivo, y una etiqueta pelada no lo da. Es el precedente del Cuadre
// —comparar lo que había con lo que queda—, pero contra una lista declarada, porque el índice
// vive fuera del repositorio y no hay un «antes» de git con el que comparar.
//
// La lista vive en `_private/` (el repositorio es público, y los frenos son decisiones de
// producto). Cada entrada ata unas frases a la línea que enlaza su ficha: moverlas a otra
// línea también cuenta como perderlas, porque el freno tiene que estar donde se lee la ficha.
// Se compara sin mayúsculas, negritas, backticks ni espacios dobles, para que reformatear no
// dispare y reescribir el freno sí.
//
// Retirar un freno a propósito es quitarlo de la lista: una decisión explícita, no un efecto
// secundario. Y como un candado que solo vigila lo declarado no puede echar de menos lo que
// nadie declaró, avisa también de los tramos del índice con un freno en MAYÚSCULAS cuya ficha
// no tiene entrada: así la lista no envejece en silencio.
const FRENOS = process.env.FRENOS_MEMORIA || path.join(REPO, '_private', 'frenos-indice-memoria.json');
const PALABRA_FRENO = /\b(NO|NUNCA|DESCARTAD[OA]S?|CERRAD[OA]S?|VETAD[OA]S?|RETIRA|MUERT[OA]S?|DESESTIMAD[OA]S?)\b/;
const normalizar = s => s.normalize('NFC').replace(/[*`]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();

let frenos = null;
try {
  frenos = JSON.parse(fs.readFileSync(FRENOS, 'utf8')).frenos;
  if (!Array.isArray(frenos) || !frenos.length) throw new Error('la lista está vacía');
} catch (e) {
  // Plantarse, no dar verde: sin lista este candado no mira nada, y callar sería mentir
  errores.push(`No se puede leer la lista de frenos (${path.relative(os.homedir(), FRENOS)}): ${e.message}. Sin ella la comprobación 11 no vigila nada`);
  frenos = null;
}

let nFrases = 0;
if (frenos) {
  const lineasTexto = indice.split('\n');
  for (const freno of frenos) {
    const ficha = freno.ficha ?? null;
    if (ficha && !ficheros.includes(ficha)) {
      errores.push(`La lista de frenos cita una ficha que no existe: ${ficha} — lista desfasada`);
      continue;
    }
    // Sin ficha, el freno puede estar en cualquier sitio (cabecera, líneas sin enlace)
    const donde = ficha ? lineasTexto.filter(l => l.includes(`](${ficha})`)) : [indice];
    if (!donde.length) continue;   // ficha sin enlace: ya lo dice la comprobación 1
    const texto = normalizar(donde.join('\n'));
    for (const frase of freno.frases ?? []) {
      nFrases++;
      if (!texto.includes(normalizar(frase))) {
        errores.push(`Freno perdido en MEMORY.md: «${frase}» (${ficha ?? 'fuera de las líneas de ficha'}). ` +
          `Si se retira a propósito, quitarlo de ${path.relative(REPO, FRENOS)}`);
      }
    }
  }

  // Tramo = desde el enlace de una ficha hasta el siguiente enlace o el final de la línea
  const vigiladas = new Set(frenos.map(f => f.ficha).filter(Boolean));
  for (const linea of lineasTexto) {
    const enlaces = [...linea.matchAll(/\[[^\]]*\]\(([^)]+\.md)\)/g)];
    enlaces.forEach((m, i) => {
      const tramo = linea.slice(m.index, i + 1 < enlaces.length ? enlaces[i + 1].index : linea.length);
      const palabra = tramo.replace(/\([^)]*\.md\)/, '').match(PALABRA_FRENO)?.[0];
      if (palabra && !vigiladas.has(m[1])) {
        avisos.push(`Freno sin vigilar: el tramo de ${m[1]} dice «${palabra}» y la ficha no tiene entrada en ${path.relative(REPO, FRENOS)}`);
      }
    });
  }
}

// --- Informe ---
const pct = Math.round((caracteresIndice / LIMITE_LECTURA) * 100);
const pctLineas = Math.round((lineasIndice / LINEAS_ERROR) * 100);
const frenosTexto = frenos ? ` · ${nFrases} frenos vigilados` : '';
console.log(`\n🧾 Memoria del proyecto — ${path.relative(os.homedir(), DIR)}`);
console.log(`   ${ficheros.length} fichas · MEMORY.md ${miles(caracteresIndice)} car. (${pct} % del límite; techo del hook a ${miles(TECHO_HOOK - caracteresIndice)}) · ${lineasIndice}/${LINEAS_ERROR} líneas (${pctLineas} %) · ${enlazados.size} enlaces${frenosTexto}${deltaTexto}${ritmoTexto}`);

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
console.log(`\n✅ Sin huérfanos, sin enlaces rotos, sin punteros externos muertos, sin frenos perdidos.\n`);
