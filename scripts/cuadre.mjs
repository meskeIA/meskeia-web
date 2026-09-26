#!/usr/bin/env node
/**
 * cuadre.mjs — cuadra lo que pediste con lo que se tocó, y calla si cuadra
 *
 * Ejecutar:  npm run cuadre                    (lo que lleva la sesión actual)
 *            npm run cuadre:probar-candado     (las cinco trampas)
 *            node scripts/cuadre.mjs --simular 400   (reinyecta commits reales)
 *
 * Lo ejecuta además el `pre-commit`, que es donde BLOQUEA.
 *
 * QUÉ CUBRE, Y QUÉ NO
 * ───────────────────
 * Cubre UNA clase de fallo: **se coló algo que nadie pidió**. No cubre «lo que pedí está
 * mal» —de eso responde el Inspector—, y una fórmula fiscal equivocada no produce ninguna
 * sorpresa: el Cuadre diría «todo normal» con toda la razón.
 *
 * Los 17 candados del proyecto comprueban propiedades POSITIVAS enumeradas de antemano:
 * dicen «esto debe estar, y está». Ninguno dice «aquí hay algo que no debería estar» ni
 * «aquí falta algo que antes estaba» (`grep diff-filter=D scripts/check-*.mjs` devuelve 0).
 * El caso que mejor lo enseña es `check-csp.mjs`: exige que todo dominio cargado esté
 * PERMITIDO en la política. Es coherencia, no novedad — añadir la llamada y el permiso a la
 * vez le cuadra. Este cuenta la novedad.
 *
 * LAS TRES PROPIEDADES QUE LO SOSTIENEN
 * ─────────────────────────────────────
 * 1. CUENTA, NO OPINA. No juzga si el código es bueno. Si emitiera un juicio sería Claude
 *    auditando a Claude, con los mismos puntos ciegos, y añadiría confianza en vez de
 *    información. Pone las dos columnas —lo que pediste, lo que se tocó— y el juicio lo
 *    pone quien sabe lo que pidió.
 * 2. LO QUE PEDISTE VIENE DE TI, LITERAL. Lo recoge el hook `UserPromptSubmit` tal cual se
 *    escribió. Si el lado izquierdo de la comparación lo resumiera el modelo, volvería a
 *    ser el auditado describiendo su propio encargo.
 * 3. EL AVISO NO VIAJA POR EL CANAL QUE AUDITA. Un aviso impreso en la salida de una
 *    herramienta lo lee Claude, y por tanto Claude podría no transmitirlo. El toast de
 *    Windows sale por una puerta que la sesión no controla, y sale SIEMPRE que el Cuadre
 *    habla — también cuando el hallazgo se autoriza con CUADRE_OK. Si no saliera al
 *    autorizar, autorizar sería la forma de silenciarlo.
 *
 * EL LÍMITE, DICHO SIN ADORNOS
 * ────────────────────────────
 * No se puede impedir que el auditado se salte a su auditor: los commits los teclea Claude,
 * y todo escape que exista es un escape que Claude puede teclear. Lo que sí se garantiza es
 * que no lo haga en SILENCIO: el toast sale antes del bloqueo, y `--sesion` reconcilia al
 * cerrar (sorpresa commiteada que ninguna sesión autorizó = alguien pasó por encima del
 * pre-commit). Hasta el 26/09/2026 se infería de que la sesión no tuviera actas, y con dos
 * sesiones abiertas daba puenteo sobre commits autorizados: `reconciliar` en el motor.
 *
 * EL PRECIO ACEPTADO (15/09/2026)
 * ───────────────────────────────
 * El radio del cambio NO dispara. Medido sobre 100 commits: mediana 4 áreas, p95 10, y los
 * 4 que pasan de 12 son lotes legítimos («los 26 hallazgos», «17 apps Latam»). Contado, un
 * cambio desbocado y una reparación en lote son el mismo número. Consecuencia asumida: un
 * cambio que toque 40 ficheros sin borrar nada, sin añadir dependencias y sin desarmar
 * ningún candado pasa en absoluto silencio. Es el precio de que el 2 % que sí habla sea
 * creíble. El radio se imprime en el acta, como contexto, cuando otra regla habla.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  contar,
  autoverificar,
  dentroDe,
  elegirSesion,
  autorizadosVigentes,
  reconciliar,
} from './cuadre-motor.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR_ESTADO = path.join(RAIZ, 'scratch', 'cuadre');
const DIR_ACTAS = path.join(DIR_ESTADO, 'actas');
const REGISTRO = path.join(DIR_ESTADO, 'registro.json');
const TOAST = path.join(process.env.USERPROFILE || process.env.HOME || '', '.claude', 'scripts', 'toast-notify.ps1');

/** A los 50 commits mudos el acta pide la trampa; a los 100, la lectura por defecto se invierte. */
const MUDEZ_AVISO = 50;
const MUDEZ_SOSPECHA = 100;

// ---------------------------------------------------------------------------
// Git y ficheros
// ---------------------------------------------------------------------------

function git(...args) {
  return execFileSync('git', args, { cwd: RAIZ, encoding: 'utf8', maxBuffer: 1 << 28 });
}

function gitSilencioso(...args) {
  try {
    return git(...args);
  } catch {
    return null;
  }
}

/**
 * Lector de contenidos cacheado.
 *
 * `rev` puede ser una revisión de git, la cadena vacía —que es el índice, o sea lo que está
 * preparado para commit— o `WT` para el árbol de trabajo, que es lo que importa al cerrar
 * una sesión: ahí lo interesante suele ser justo lo que aún no se ha preparado.
 */
function lector() {
  const cache = new Map();
  return (rev, ruta) => {
    const clave = `${rev}:${ruta}`;
    if (!cache.has(clave)) {
      if (rev === 'WT') {
        let contenido = null;
        try {
          contenido = fs.readFileSync(path.join(RAIZ, ruta), 'utf8');
        } catch {
          contenido = null; // borrado o ilegible
        }
        cache.set(clave, contenido);
      } else {
        cache.set(clave, gitSilencioso('show', `${rev}:${ruta}`));
      }
    }
    return cache.get(clave);
  };
}

/** Convierte la salida de `--name-status` en la lista que entiende el motor. */
function ficherosDe(salida) {
  return (salida || '')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((linea) => {
      const partes = linea.split('\t');
      return { estado: partes[0][0], ruta: partes[partes.length - 1].replace(/\\/g, '/') };
    });
}

/**
 * Qué ficheros merece la pena abrir enteros.
 *
 * R4 y R7 solo pueden disparar si el diff trae una línea «-» con una guardia o una «+» con
 * un escape: es condición necesaria, así que filtrar por ahí no pierde ningún hallazgo y
 * evita leer las dos versiones de cada fichero tocado. Sin esto, reinyectar 400 commits
 * costaba minutos.
 */
const PISTAS_MENOS = /<DisclaimerCard|<LegalNotice|<DataReference|<RegionBadge|<Footer|<RelatedApps|<ShareCard|role="alert"|aria-live/;
const PISTAS_MAS = /@ts-ignore|eslint-disable|pragma: allowlist-secret|parser-ok:|a11y-ok:|minimo-ok:|og-ok:|hidratacion-ok:|@disclaimer: exempt/;
const SIEMPRE = new Set([
  'package.json',
  'next.config.ts',
  'vercel.json',
  'data/applications.ts',
  'data/implemented-apps.ts',
  'data/app-relations.ts',
  'data/stemum.ts',
  'data/coquinum.ts',
]);

function candidatos(diff) {
  const elegidos = new Set(SIEMPRE);
  let actual = null;
  for (const linea of (diff || '').split('\n')) {
    if (linea.startsWith('+++ b/')) {
      actual = linea.slice(6).trim();
      continue;
    }
    if (!actual) continue;
    if (linea.startsWith('-') && !linea.startsWith('---') && PISTAS_MENOS.test(linea)) elegidos.add(actual);
    if (linea.startsWith('+') && !linea.startsWith('+++') && PISTAS_MAS.test(linea)) elegidos.add(actual);
  }
  return elegidos;
}

/** Cuenta las sorpresas entre dos revisiones, abriendo solo los ficheros que pueden importar. */
function cuadrarRevisiones({ base, destino, ficheros, diff, ficherosFuera = [] }) {
  const abrir = lector();
  const utiles = candidatos(diff);
  const permitido = (ruta) => utiles.has(ruta);
  return contar({
    ficheros,
    leerAntes: (r) => (permitido(r) ? abrir(base, r) : null),
    leerDespues: (r) => (permitido(r) ? abrir(destino, r) : null),
    ficherosFuera,
  });
}

// ---------------------------------------------------------------------------
// Estado de sesión y registro
// ---------------------------------------------------------------------------

function leerJson(ruta, porDefecto) {
  try {
    return JSON.parse(fs.readFileSync(ruta, 'utf8'));
  } catch {
    return porDefecto;
  }
}

function escribirJson(ruta, datos) {
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  const temporal = `${ruta}.tmp`;
  fs.writeFileSync(temporal, JSON.stringify(datos, null, 2), 'utf8');
  fs.renameSync(temporal, ruta);
}

/** Todos los ficheros de sesión, con su contenido y cuándo se escribieron por última vez. */
function sesionesEnDisco() {
  if (!fs.existsSync(DIR_ESTADO)) return [];
  return fs
    .readdirSync(DIR_ESTADO)
    .filter((n) => n.startsWith('sesion-') && n.endsWith('.json'))
    .map((n) => {
      const ruta = path.join(DIR_ESTADO, n);
      return { ruta, mtime: fs.statSync(ruta).mtimeMs, datos: leerJson(ruta, null) };
    })
    .filter((s) => s.datos);
}

/**
 * La sesión de este proceso. El id llega por argumento en el cierre y por el entorno en el
 * pre-commit (git lo hereda de la orden de Claude Code); sin él, la más recientemente tocada.
 * Por qué ya no basta con la más reciente: cabecera de «Varias sesiones» en `cuadre-motor.mjs`.
 */
export function sesionActual(id = process.env.CLAUDE_CODE_SESSION_ID) {
  const elegida = elegirSesion(id, sesionesEnDisco());
  return elegida ? { ...elegida.datos, _ruta: elegida.ruta } : null;
}

export function guardarSesion(sesion) {
  const { _ruta, ...datos } = sesion;
  escribirJson(_ruta || path.join(DIR_ESTADO, `sesion-${datos.sesion}.json`), datos);
}

function registro() {
  return leerJson(REGISTRO, { commitsMudos: 0, totalDisparos: 0, ultimoDisparo: null });
}

/**
 * Ficheros que la sesión ha ESCRITO fuera del repositorio (regla 9).
 *
 * Sale del transcript que escribe el harness, no de instrumentar cada escritura: un hook en
 * cada Write costaría el arranque de Node en cada edición, y el dato ya está escrito.
 * Solo cuentan las escrituras — Claude lee a diario en Vigilancia, en markets o en la
 * agenda, y leer no cambia nada. Se ignoran el propio directorio de trabajo temporal y los
 * directorios adicionales cuando la sesión los tenía declarados como suyos.
 */
const HERRAMIENTAS_QUE_ESCRIBEN = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit']);

/**
 * Los directorios que el usuario ha declarado suyos en `~/.claude/settings.json`
 * (`additionalDirectories`: Vigilancia, markets, vigia-normativo, .claude…) NO son «fuera de
 * ámbito»: escribir la entrada de la Agenda en la misma sesión en que se toma la decisión es
 * una regla del propio proyecto, y una sesión normal la cumple. Sin esta excepción, la regla 9
 * cantaría en casi todas —empezando por la que la creó— y una regla que canta siempre se
 * desactiva en dos semanas.
 *
 * Lo que queda cubierto es lo que de verdad se sale del mapa: una escritura en un sitio que
 * nadie ha declarado.
 */
function ambitoDeclarado() {
  const ambito = [RAIZ];
  try {
    const ajustes = JSON.parse(
      fs.readFileSync(path.join(process.env.USERPROFILE || process.env.HOME || '', '.claude', 'settings.json'), 'utf8'),
    );
    for (const d of ajustes?.permissions?.additionalDirectories || []) ambito.push(path.resolve(d));
  } catch {
    /* sin ajustes legibles, solo cuenta el repositorio */
  }
  return ambito;
}

function escriturasFuera(rutaTranscript) {
  if (!rutaTranscript || !fs.existsSync(rutaTranscript)) return [];
  let crudo;
  try {
    crudo = fs.readFileSync(rutaTranscript, 'utf8');
  } catch {
    return [];
  }
  const fuera = new Set();
  const ambito = ambitoDeclarado();
  for (const linea of crudo.split('\n')) {
    if (!linea.includes('"tool_use"') || !linea.includes('"file_path"')) continue;
    let registroLinea;
    try {
      registroLinea = JSON.parse(linea);
    } catch {
      continue;
    }
    const bloques = registroLinea?.message?.content;
    if (!Array.isArray(bloques)) continue;
    for (const b of bloques) {
      if (b?.type !== 'tool_use' || !HERRAMIENTAS_QUE_ESCRIBEN.has(b.name)) continue;
      const destino = b.input?.file_path || b.input?.notebook_path;
      if (!destino) continue;
      const abs = path.resolve(destino);
      const declarado = ambito.some((d) => dentroDe(abs, d));
      const esTemporal = /[\\/]Temp[\\/]claude[\\/]/i.test(abs);
      if (!declarado && !esTemporal) fuera.add(abs.replace(/\\/g, '/'));
    }
  }
  return [...fuera];
}

// ---------------------------------------------------------------------------
// Salida: acta, toast e informe de cinco líneas
// ---------------------------------------------------------------------------

/**
 * El aviso que no viaja por el canal auditado.
 *
 * Se espera a que PowerShell TERMINE, y no es un detalle: la primera versión lo lanzaba
 * `detached` con `unref()` y salía al instante, así que el proceso —y todo su árbol— se
 * desmontaba en el segundo largo que BurntToast tarda en arrancar y emitir. Resultado el
 * 16/09/2026: el candado bloqueaba, escribía el acta, decía «toast enviado»… y en la pantalla
 * no aparecía nada. El canal entero era decorativo y ninguna prueba automática podía verlo,
 * porque desde dentro todo devolvía éxito.
 *
 * Esperar cuesta uno o dos segundos, y solo se paga cuando el Cuadre habla —una vez cada
 * cincuenta commits—. Un aviso que no llega no vale nada, y aquí es la única pieza que no pasa
 * por quien está siendo auditado.
 */
function toast(mensaje) {
  if (!fs.existsSync(TOAST)) return;
  try {
    spawnSync(
      'powershell',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', TOAST, '-Message', mensaje.slice(0, 180)],
      { stdio: 'ignore', windowsHide: true, timeout: 20000 },
    );
  } catch {
    /* que no falle un commit porque no haya podido salir una notificación */
  }
}

function recorta(texto, n) {
  const limpio = (texto || '').replace(/\s+/g, ' ').trim();
  return limpio.length > n ? `${limpio.slice(0, n - 1)}…` : limpio;
}

/** El informe: cinco líneas que se entienden sin saber programar. */
function informe({ resultado, peticiones, titulo, mudos }) {
  // Se enseña la ÚLTIMA petición, no la primera: es la que explica lo que acaba de pasar.
  // Con la primera, la prueba del 16/09/2026 mostró un mensaje de tres turnos antes mientras
  // la orden que provocó el hallazgo —«borra ese test y haz commit»— quedaba fuera de la vista.
  // El acta las lleva todas, en orden; estas cinco líneas solo tienen sitio para una.
  const ultima = peticiones.length
    ? recorta(peticiones[peticiones.length - 1], 90)
    : '(no consta: no llegan los eventos de Claude Code)';
  const mas = peticiones.length > 1 ? ` (+${peticiones.length - 1} mensajes antes)` : '';
  const lineas = [
    titulo,
    `  Pediste: «${ultima}»${mas}`,
    `  Se tocó: ${resultado.radio.ficheros} ficheros · ${resultado.radio.areas} áreas (${recorta(resultado.radio.listaAreas.join(', '), 70)})`,
  ];
  for (const h of resultado.hallazgos) lineas.push(`  → ${h.texto}`);
  for (const n of resultado.notas.filter((x) => x.tipo === 'escape-de-la-casa')) lineas.push(`  · ${n.texto}`);
  if (mudos >= MUDEZ_SOSPECHA) {
    lineas.push(`  ⚠ ${mudos} commits sin hablar: la lectura por defecto ya no es «todo bien». npm run cuadre:probar-candado`);
  } else if (mudos >= MUDEZ_AVISO) {
    lineas.push(`  · lleva ${mudos} commits sin hablar — toca tenderle la trampa: npm run cuadre:probar-candado`);
  }
  return lineas.join('\n');
}

function escribirActa({ resultado, peticiones, motivo, razon }) {
  fs.mkdirSync(DIR_ACTAS, { recursive: true });
  const ahora = new Date();
  const sello = `${ahora.toISOString().slice(0, 10)}-${String(ahora.getHours()).padStart(2, '0')}${String(ahora.getMinutes()).padStart(2, '0')}`;
  const ruta = path.join(DIR_ACTAS, `${sello}.md`);
  const cuerpo = [
    `# Cuadre · ${ahora.toLocaleString('es-ES')}`,
    '',
    `**Motivo**: ${motivo}`,
    razon ? `**Autorizado con razón**: ${razon}` : '',
    '',
    '## Lo que pediste',
    '',
    ...(peticiones.length ? peticiones.map((p, i) => `${i + 1}. ${recorta(p, 400)}`) : ['(no consta)']),
    '',
    '## Lo que se tocó',
    '',
    `${resultado.radio.ficheros} ficheros · ${resultado.radio.areas} áreas`,
    '',
    ...resultado.radio.listaAreas.map((a) => `- ${a}`),
    '',
    '## Sorpresas',
    '',
    ...(resultado.hallazgos.length
      ? resultado.hallazgos.map((h) => `- **${h.regla}** · ${h.texto}  \`${h.huella}\``)
      : ['(ninguna)']),
    '',
    '## Contexto (no bloquea)',
    '',
    ...(resultado.notas.length ? resultado.notas.map((n) => `- ${n.tipo}: ${n.texto}`) : ['(nada que nombrar)']),
    '',
  ]
    .filter((l) => l !== '')
    .join('\n');
  fs.writeFileSync(ruta, `${cuerpo}\n`, 'utf8');
  return path.relative(RAIZ, ruta).replace(/\\/g, '/');
}

// ---------------------------------------------------------------------------
// Modo: --simular N  (la prueba de especificidad)
// ---------------------------------------------------------------------------

function modoSimular(n) {
  const commits = git('log', `-${n}`, '--format=%h\t%s')
    .trim()
    .split('\n')
    .map((l) => ({ h: l.slice(0, l.indexOf('\t')), s: l.slice(l.indexOf('\t') + 1) }));

  const hablan = [];
  for (const { h, s } of commits) {
    const ficheros = ficherosDe(gitSilencioso('show', '--format=', '--name-status', h));
    if (ficheros.length === 0) continue;
    const diff = gitSilencioso('show', '--format=', '--unified=0', '--no-color', h) || '';
    const resultado = cuadrarRevisiones({ base: `${h}~1`, destino: h, ficheros, diff });
    if (resultado.hallazgos.length > 0) {
      hablan.push({ h, s, hallazgos: resultado.hallazgos });
    }
  }

  console.log(`Reinyectados ${commits.length} commits reales.\n`);
  for (const c of hablan) {
    console.log(`  ${c.h} ${recorta(c.s, 56)}`);
    for (const x of c.hallazgos) console.log(`      ${x.regla}: ${recorta(x.texto, 84)}`);
  }
  console.log(`\nSIMULACION: ${hablan.length} de ${commits.length}`);
  return 0;
}

// ---------------------------------------------------------------------------
// Modo: --pre-commit  (el único que bloquea)
// ---------------------------------------------------------------------------

/**
 * Antes de contar nada, el contador se tiende a sí mismo las cuatro trampas.
 *
 * Cuesta menos de un milisegundo y es lo que separa «no hay sorpresas» de «no he mirado».
 * Si falla, NO se deja pasar el commit dando silencio por bueno: se dice que está roto.
 */
function autoverificarOMorir() {
  const fallos = autoverificar();
  if (fallos.length === 0) return true;
  toast(`Cuadre ROTO: ${fallos[0]}`);
  console.log('');
  console.log('✖ CUADRE ROTO — no ha pasado sus propias trampas, así que su silencio no vale nada:');
  for (const f of fallos) console.log(`   · ${f}`);
  console.log('');
  console.log('  Repáralo antes de seguir:  npm run cuadre:probar-candado');
  console.log('');
  return false;
}

/**
 * Avisa si los eventos de Claude Code no están llegando.
 *
 * Sin ellos el Cuadre sigue contando —el `pre-commit` es un hook de git y no depende de la
 * sesión— pero se queda CIEGO de la mitad izquierda: no sabe qué se pidió ni dónde empezó la
 * sesión, y compara contra HEAD en vez de contra el punto de partida. El 16/09/2026 se probó a
 * declarar los hooks en `.claude/settings.json` del proyecto y no llegaron a cargar: no falló
 * nada, simplemente dejaron de registrarse las peticiones. Esto es lo que impide que esa avería
 * vuelva a pasar desapercibida.
 */
function avisarSiNoLleganLosEventos(sesion) {
  if (sesion?.base) return;
  console.log('');
  console.log('⚠ CUADRE a medias — no llegan los eventos de Claude Code, así que no sabe qué se pidió.');
  console.log('  Sigue contando lo que se toca, pero compara contra HEAD, no contra el inicio de la sesión.');
  console.log('  Revisa los cuatro hooks (SessionStart, UserPromptSubmit, SessionEnd, PreToolUse) en');
  console.log('  ~/.claude/settings.json — se comprueban con: npm run hooks:install');
  console.log('');
}

function modoPreCommit() {
  if (!autoverificarOMorir()) return 1;
  const sesion = sesionActual();
  avisarSiNoLleganLosEventos(sesion);
  const base = sesion?.base && gitSilencioso('cat-file', '-e', `${sesion.base}^{commit}`) !== null ? sesion.base : 'HEAD';
  const peticiones = sesion?.peticiones || [];
  // Las de TODAS las sesiones abiertas desde que empezó esta: la base de una sesión larga
  // abarca los commits de las demás, y sin ellas un CUADRE_OK ajeno volvería a bloquear aquí.
  const propios = new Set(sesion?.autorizados || []);
  const autorizados = autorizadosVigentes(sesion, sesionesEnDisco());

  const ficheros = ficherosDe(gitSilencioso('diff', '--cached', '--name-status', base));
  if (ficheros.length === 0) return 0;

  const diff = gitSilencioso('diff', '--cached', '--unified=0', '--no-color', base) || '';
  const resultado = cuadrarRevisiones({
    base,
    destino: '',
    ficheros,
    diff,
    ficherosFuera: escriturasFuera(sesion?.transcript),
  });

  const nuevos = resultado.hallazgos.filter((h) => !autorizados.has(h.huella));
  const repetidos = resultado.hallazgos.filter((h) => autorizados.has(h.huella));
  const reg = registro();

  if (nuevos.length === 0) {
    reg.commitsMudos += 1;
    escribirJson(REGISTRO, reg);
    // Autorizado no es lo mismo que invisible. El visto bueno evita que el mismo hecho
    // bloquee dos veces —sin eso, un lote de 40 ficheros bloquearía en bucle— pero el hecho
    // se sigue nombrando en cada commit que lo lleve encima. Lo descubrió la prueba del
    // 16/09/2026: autorizado un borrado de test, el segundo intento pasó en SILENCIO ABSOLUTO,
    // que es exactamente lo que este candado existe para que no ocurra.
    for (const h of repetidos) {
      console.log(`· Cuadre: ${h.texto} — ya autorizado ${propios.has(h.huella) ? 'en esta sesión' : 'en otra sesión'}`);
    }
    return 0; // el silencio es el estado normal cuando no queda nada que contar
  }

  const razon = process.env.CUADRE_OK;
  const soloNuevos = { ...resultado, hallazgos: nuevos };
  const acta = escribirActa({
    resultado: soloNuevos,
    peticiones,
    motivo: razon ? 'pre-commit · autorizado con CUADRE_OK' : 'pre-commit · commit bloqueado',
    razon,
  });

  reg.totalDisparos += 1;
  reg.ultimoDisparo = new Date().toISOString();
  const mudos = reg.commitsMudos;
  reg.commitsMudos = 0;
  escribirJson(REGISTRO, reg);

  if (sesion) {
    sesion.actas = [...(sesion.actas || []), acta];
    if (razon) sesion.autorizados = [...propios, ...nuevos.map((h) => h.huella)];
    guardarSesion(sesion);
  }

  // El toast sale SIEMPRE que el Cuadre habla, también al autorizar: si callara al
  // autorizar, autorizar sería la forma de silenciarlo.
  const resumen = nuevos.length === 1 ? nuevos[0].texto : `${nuevos.length} sorpresas`;
  toast(razon ? `Cuadre (autorizado): ${resumen}` : `Cuadre: ${resumen} — commit bloqueado`);

  const titulo = razon
    ? `⚠ CUADRE — ${nuevos.length} sorpresa(s), autorizadas: ${recorta(razon, 60)}`
    : `✖ CUADRE — ${nuevos.length} sorpresa(s) en este commit`;
  console.log(`\n${informe({ resultado: soloNuevos, peticiones, titulo, mudos })}`);
  console.log(`  Acta: ${acta}`);

  if (razon) return 0;

  console.log('');
  console.log('  El commit NO se ha hecho. Dos salidas:');
  console.log('   · corregirlo, si la sorpresa no debía estar;');
  console.log('   · autorizarlo dejando la razón escrita en el acta:');
  console.log('       CUADRE_OK="por qué es correcto" git commit -m "…"');
  console.log('  No uses --no-verify: desarma también el guardián de secretos y los goldens.');
  console.log('');
  return 1;
}

// ---------------------------------------------------------------------------
// Modo: --sesion  (cierre de sesión: no bloquea, reconcilia)
// ---------------------------------------------------------------------------

function modoSesion({ silencioSiNada = true, id } = {}) {
  if (!autoverificarOMorir()) return 1;
  const sesion = sesionActual(id);
  if (!sesion?.base) return 0;
  if (gitSilencioso('cat-file', '-e', `${sesion.base}^{commit}`) === null) return 0;

  const ficheros = ficherosDe(gitSilencioso('diff', '--name-status', sesion.base));
  if (ficheros.length === 0 && escriturasFuera(sesion.transcript).length === 0) {
    if (!silencioSiNada) console.log('El Cuadre no tiene nada que decir: la sesión no ha cambiado nada.');
    return 0;
  }

  const diff = gitSilencioso('diff', '--unified=0', '--no-color', sesion.base) || '';
  const resultado = cuadrarRevisiones({
    base: sesion.base,
    destino: 'WT',
    ficheros,
    diff,
    ficherosFuera: escriturasFuera(sesion.transcript),
  });

  // Reconciliación: una sorpresa YA COMMITEADA que ninguna sesión autorizó solo puede haber
  // llegado por encima del pre-commit. Se cuenta también base → HEAD para separarla de lo que
  // aún no se ha commiteado; solo hace falta si queda algo vivo, que es lo raro.
  const autorizados = autorizadosVigentes(sesion, sesionesEnDisco());
  let huellasCommiteadas = new Set();
  if (resultado.hallazgos.some((h) => !autorizados.has(h.huella))) {
    const ficherosCommit = ficherosDe(gitSilencioso('diff', '--name-status', sesion.base, 'HEAD'));
    const diffCommit = gitSilencioso('diff', '--unified=0', '--no-color', sesion.base, 'HEAD') || '';
    const enCommits = cuadrarRevisiones({ base: sesion.base, destino: 'HEAD', ficheros: ficherosCommit, diff: diffCommit });
    huellasCommiteadas = new Set(enCommits.hallazgos.map((h) => h.huella));
  }
  const { vivos, commiteados } = reconciliar({ hallazgos: resultado.hallazgos, huellasCommiteadas, autorizados });
  const puenteado = commiteados.length > 0;

  if (vivos.length === 0) {
    if (!silencioSiNada) {
      console.log(`El Cuadre no tiene nada que decir: ${resultado.radio.ficheros} ficheros, ${resultado.radio.areas} áreas, ninguna sorpresa.`);
    }
    return 0;
  }

  const soloVivos = { ...resultado, hallazgos: vivos };
  const sinCommitear = vivos.length - commiteados.length;
  const acta = escribirActa({
    resultado: soloVivos,
    peticiones: sesion.peticiones || [],
    motivo: puenteado
      ? `cierre de sesión ${sesion.sesion} · HAY COMMITS SIN PASAR POR EL PRE-COMMIT`
      : `cierre de sesión ${sesion.sesion} · sin commitear`,
  });
  sesion.actas = [...(sesion.actas || []), acta];
  guardarSesion(sesion);

  const cabecera = puenteado
    ? `✖ CUADRE — ${commiteados.length} sorpresa(s) YA COMMITEADAS que ninguna sesión autorizó${sinCommitear ? ` (y ${sinCommitear} sin commitear)` : ''}`
    : `⚠ CUADRE — ${vivos.length} sorpresa(s) al cerrar la sesión`;
  toast(
    puenteado
      ? `Cuadre: ${commiteados.length} sorpresa(s) commiteadas sin pasar el candado`
      : `Cuadre: ${vivos.length} sorpresa(s) sin commitear`,
  );
  console.log(`
${informe({ resultado: soloVivos, peticiones: sesion.peticiones || [], titulo: cabecera, mudos: registro().commitsMudos })}`);
  console.log(`  Acta: ${acta}`);
  return 0;
}

// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const modo = args[0] || '--sesion';

if (modo === '--simular') {
  process.exit(modoSimular(Number(args[1] || 400)));
} else if (modo === '--pre-commit') {
  process.exit(modoPreCommit());
} else if (modo === '--sesion') {
  process.exit(modoSesion({ silencioSiNada: false }));
} else if (modo === '--cierre') {
  // El hook de cierre pasa el id de la sesión que se cierra: sin él se evaluaba la última
  // tocada, que al cerrar varias seguidas es la que se cerró ANTES (26/09/2026).
  process.exit(modoSesion({ silencioSiNada: true, id: args[1] || undefined }));
} else {
  console.log('Uso: node scripts/cuadre.mjs [--sesion | --pre-commit | --cierre | --simular N]');
  process.exit(1);
}
