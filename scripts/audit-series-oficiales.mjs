#!/usr/bin/env node
/**
 * Auditoría de las SERIES OFICIALES de `data/` contra la API JSON del INE
 *
 * Ejecutar:  npm run audit:series-oficiales            (coteja)
 *            npm run audit:series-oficiales -- --probar (reinyecta los casos de origen)
 *
 * QUÉ COMPRUEBA
 * ─────────────
 * Que cada serie numérica que una app saca del INE diga lo mismo que el INE, y que no falte
 * ningún dato DEFINITIVO ya publicado. Importa los módulos .ts tal cual (Node 24 los carga), así
 * que coteja los mismos objetos que usan las apps, sin regex intermedio:
 *
 *   · `data/ipc-ine.ts` (IPC_DATA, medias anuales, base 2025) frente a la media de los 12 índices
 *     mensuales de la tabla 24077. Por COCIENTES año a año, no por valores sueltos: es lo que la
 *     app usa y lo que delata un empalme roto (regla de `data/CLAUDE.md`).
 *   · `data/fiscal/alquiler.ts` (IPC_INTERANUAL_POR_MES) frente a la variación anual oficial de la
 *     tabla 76134. Dato a dato, sin tolerancia: el INE publica una décima y la app la aplica tal cual.
 *   · `data/fiscal/alquiler.ts` (IRAV_POR_TRIMESTRE) frente a la media de los tres IRAV mensuales
 *     de la tabla 72975. Coteja lo que el módulo DICE hacer; si el cabo C0195 (¿media trimestral o
 *     último mensual?) cambia el método, se cambia este comparador en el mismo commit.
 *
 * SOLO LEE. No escribe en `data/` ni en ningún otro sitio: es dato YMYL y nivel 3 de la frontera
 * de decisión, así que cada corrección se aplica en `/triaje-fiscal` con la fuente consultada en
 * sesión y el OK del usuario.
 *
 * Salida: 0 = todo cuadra · 1 = discrepancias o datos que faltan · 2 = el INSTRUMENTO falló
 * (red, tabla reorganizada, serie que ya no existe). Con 2, ningún «cuadra» de esa serie vale nada.
 *
 * POR QUÉ NO ES UN CANDADO DEL BUILD
 * ──────────────────────────────────
 * Depende de la red, como `audit:fiscal-fuentes`: un candado que rompe el build porque el INE
 * tarda en responder acaba desactivado. Se ejecuta en el PASO 3.ter de `/triaje-fiscal`.
 *
 * PROVISIONALES: el INE sirve el indicador adelantado con `FK_TipoDato` distinto de 1. Se listan
 * aparte y NO cuentan como «falta»: un dato provisional no se incorpora a una serie que la app
 * aplica a un contrato.
 *
 * DE DÓNDE SALE (10/10/2026, S0191, sesión de frontera)
 * ─────────────────────────────────────────────────────
 * Tres cotejos de estas series y los tres encontraron algo: 9 valores mal en `alquiler.ts` (julio
 * de 2026, a mano contra varipc); dos eslabones mal empalmados (2001 y 2013) en `ipc-ine.ts`
 * (19/09, a mano); y la F0 de este script, que destapó 2024-07 y 2024-08 mal en `alquiler.ts`
 * —la corrección de julio solo cubrió jun-2025 → feb-2026— más agosto de 2026 publicado y sin
 * recoger (cabos C0194 y C0195). Ningún sello ni ningún candado lo veía: el módulo estaba
 * «verificado» el 11/09.
 *
 * Fuera, a propósito: `data/fiscal/esperanza-vida.ts` (un único valor de una nota de prensa
 * anual, con su entrada `esperanza-vida-ine` en la Agenda) y `smi`/`iprem`, que son norma del
 * BOE y no estadística: esos los cubre `audit:fiscal-fuentes`.
 */
import { IPC_DATA } from '../data/ipc-ine.ts';
import { IPC_INTERANUAL_POR_MES, IRAV_POR_TRIMESTRE } from '../data/fiscal/alquiler.ts';

const API = 'https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA';
const PROBAR = process.argv.includes('--probar');

const fmt = (n, d = 2) =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
const clave = (a, m) => `${a}-${String(m).padStart(2, '0')}`;

/** El IRAV no existe antes de este mes: las claves anteriores del módulo no son cotejables. */
const IRAV_PRIMER_MES = '2024-11';
/** Lo que el redondeo a 4 decimales de IPC_DATA puede explicar en un cociente anual. */
const TOLERANCIA_COCIENTE_PCT = 0.01;

class InstrumentoRoto extends Error {}

/**
 * Descarga una serie y comprueba que es la que creemos. El COD es fijo a propósito: si el INE
 * reorganiza la tabla (ya pasó en junio de 2026), el script debe fallar con 2, no cotejar contra
 * otra serie que se llame parecido.
 */
async function serieINE(tabla, cod, nombreEsperado, nult, minimoDatos) {
  let series;
  try {
    const r = await fetch(`${API}/${tabla}?nult=${nult}`, { signal: AbortSignal.timeout(60_000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    series = await r.json();
  } catch (e) {
    throw new InstrumentoRoto(`tabla ${tabla}: ${e.message}`);
  }
  const s = Array.isArray(series) ? series.find((x) => x.COD === cod) : undefined;
  if (!s) throw new InstrumentoRoto(`tabla ${tabla}: ya no sirve la serie ${cod} (¿reorganización del INE?)`);
  if (!nombreEsperado.test(s.Nombre)) throw new InstrumentoRoto(`tabla ${tabla}: ${cod} se llama ahora «${s.Nombre.trim()}»`);
  const definitivos = new Map();
  const provisionales = new Map();
  for (const d of s.Data) {
    if (d.Valor === null || d.Secreto) continue;
    (d.FK_TipoDato === 1 ? definitivos : provisionales).set(clave(d.Anyo, d.FK_Periodo), d.Valor);
  }
  if (definitivos.size < minimoDatos) {
    throw new InstrumentoRoto(`tabla ${tabla}: ${definitivos.size} datos definitivos, se esperaban ≥ ${minimoDatos}`);
  }
  return { cod, nombre: s.Nombre.trim(), definitivos, provisionales };
}

// ── Comparadores: funciones puras (datos propios + serie INE → incidencias) ─────────────────────

function cotejarCocientesAnuales(propia, ine) {
  const media = {};
  const anios = new Set([...ine.definitivos.keys()].map((k) => Number(k.slice(0, 4))));
  for (const a of anios) {
    const v = Array.from({ length: 12 }, (_, i) => ine.definitivos.get(clave(a, i + 1)));
    if (v.every((x) => x !== undefined)) media[a] = v.reduce((s, x) => s + x, 0) / 12;
  }
  const incidencias = [];
  const filas = [];
  if (Math.abs((propia[2025] ?? NaN) - 100) > 1e-9) {
    incidencias.push('2025 no vale 100: la serie no está en la base que declara');
  }
  let maxDif = 0;
  for (const a of Object.keys(media).map(Number).sort()) {
    if (!(a - 1 in media) || !(a in propia) || !(a - 1 in propia)) continue;
    const dif = ((propia[a] / propia[a - 1]) / (media[a] / media[a - 1]) - 1) * 100;
    maxDif = Math.max(maxDif, Math.abs(dif));
    if (Math.abs(dif) > TOLERANCIA_COCIENTE_PCT) {
      incidencias.push(`${a}/${a - 1}: el cociente se desvía ${fmt(dif, 3)} % del INE (eslabón mal empalmado)`);
    }
  }
  const ultimoINE = Math.max(...Object.keys(media).map(Number));
  const ultimoPropio = Math.max(...Object.keys(propia).map(Number));
  if (ultimoINE > ultimoPropio) {
    incidencias.push(`FALTA ${ultimoINE}: el INE ya tiene los 12 meses definitivos y la serie acaba en ${ultimoPropio}`);
  }
  filas.push(`desviación máxima de cociente: ${fmt(maxDif, 4)} % · último año completo en el INE ${ultimoINE}, en la serie ${ultimoPropio}`);
  return { incidencias, filas };
}

function cotejarMensualExacto(propia, ine, desde) {
  const incidencias = [];
  let iguales = 0;
  for (const [k, v] of Object.entries(propia)) {
    const oficial = ine.definitivos.get(k);
    if (oficial === undefined) continue;
    if (Math.abs(v - oficial) > 1e-9) incidencias.push(`${k}: la serie dice ${fmt(v, 1)} y el INE publica ${fmt(oficial, 1)}`);
    else iguales++;
  }
  for (const k of [...ine.definitivos.keys()].sort()) {
    if (k >= desde && !(k in propia)) incidencias.push(`FALTA ${k}: el INE publica ${fmt(ine.definitivos.get(k), 1)} (definitivo)`);
  }
  return { incidencias, filas: [`${iguales} meses idénticos al INE`] };
}

function cotejarMediaTrimestral(propia, ine) {
  const incidencias = [];
  const filas = [];
  const noCotejables = [];
  for (const [q, v] of Object.entries(propia).sort()) {
    const [a, t] = q.split('-Q').map(Number);
    const ks = [1, 2, 3].map((i) => clave(a, (t - 1) * 3 + i));
    if (ks[0] < IRAV_PRIMER_MES) { noCotejables.push(q); continue; }
    const meses = ks.map((k) => ine.definitivos.get(k));
    if (meses.some((x) => x === undefined)) { filas.push(`${q}: el INE no tiene los tres meses definitivos`); continue; }
    const media = Math.round((meses.reduce((s, x) => s + x, 0) / 3) * 100) / 100;
    if (Math.abs(v - media) > 0.005) {
      incidencias.push(`${q}: la serie dice ${fmt(v)} y la media INE es ${fmt(media)} (${meses.map((x) => fmt(x)).join(' · ')})`);
    }
  }
  const ultimo = Object.keys(propia).sort().at(-1);
  const [ua, ut] = ultimo.split('-Q').map(Number);
  const siguiente = ut === 4 ? `${ua + 1}-Q1` : `${ua}-Q${ut + 1}`;
  const [sa, st] = siguiente.split('-Q').map(Number);
  const mesesSig = [1, 2, 3].map((i) => ine.definitivos.get(clave(sa, (st - 1) * 3 + i)));
  if (mesesSig.every((x) => x !== undefined)) {
    incidencias.push(`FALTA ${siguiente}: el INE ya tiene sus tres meses (${mesesSig.map((x) => fmt(x)).join(' · ')})`);
  } else {
    const publicados = mesesSig.filter((x) => x !== undefined).length;
    filas.push(`${siguiente} en curso: ${publicados} de 3 meses publicados`);
  }
  if (noCotejables.length) {
    filas.push(`no cotejables (anteriores al primer IRAV, ${IRAV_PRIMER_MES}): ${noCotejables.join(', ')} — ver cabo C0195`);
  }
  return { incidencias, filas };
}

// ── Las series que se vigilan ───────────────────────────────────────────────────────────────────

const SERIES = [
  {
    nombre: 'data/ipc-ine.ts · IPC_DATA (medias anuales)',
    datos: IPC_DATA,
    fuente: () => serieINE(24077, 'IPC290751', /Índice general\. Índice/, 400, 280), // la tabla empieza en 2002-01
    cotejar: cotejarCocientesAnuales,
  },
  {
    nombre: 'data/fiscal/alquiler.ts · IPC_INTERANUAL_POR_MES',
    datos: IPC_INTERANUAL_POR_MES,
    fuente: () => serieINE(76134, 'IPC290750', /Índice general\. Variación anual/, 60, 36),
    cotejar: (p, ine) => cotejarMensualExacto(p, ine, Object.keys(p).sort()[0]),
  },
  {
    nombre: 'data/fiscal/alquiler.ts · IRAV_POR_TRIMESTRE',
    datos: IRAV_POR_TRIMESTRE,
    fuente: () => serieINE(72975, 'IRAV1', /Variación anual/, 60, 12),
    cotejar: cotejarMediaTrimestral,
  },
];

// ── --probar: reinyectar los casos de origen sobre copias y exigir que se detecten ─────────────

function casosDeOrigen(ines) {
  const [ipc, interanual, irav] = ines;
  const conIPC = (a) => ipc.definitivos.get(clave(a, 1)) !== undefined;
  // Copias limpias a partir del propio INE, para que el caso no dependa del estado del módulo.
  const mediaAnual = {};
  for (let a = 2002; a <= 2025; a++) {
    if (!conIPC(a)) continue;
    mediaAnual[a] = Array.from({ length: 12 }, (_, i) => ipc.definitivos.get(clave(a, i + 1))).reduce((s, x) => s + x, 0) / 12;
  }
  const base = mediaAnual[2025];
  const ipcLimpio = Object.fromEntries(Object.entries(mediaAnual).map(([a, v]) => [a, (v / base) * 100]));
  ipcLimpio[2025] = 100;
  const mensualLimpio = Object.fromEntries([...interanual.definitivos].filter(([k]) => k >= '2023-01'));
  const mesesIRAV = [...irav.definitivos.keys()].sort();
  const iravLimpio = {};
  for (let i = 0; i < mesesIRAV.length; i++) {
    const [a, m] = mesesIRAV[i].split('-').map(Number);
    if (m % 3 !== 1) continue;
    const tres = [0, 1, 2].map((j) => irav.definitivos.get(clave(a, m + j)));
    if (tres.some((x) => x === undefined)) continue;
    iravLimpio[`${a}-Q${(m + 2) / 3}`] = Math.round((tres.reduce((s, x) => s + x, 0) / 3) * 100) / 100;
  }
  // Quitamos el último trimestre completo para que el control «FALTA» no ensucie el caso limpio
  const ultimoQ = Object.keys(iravLimpio).sort().at(-1);
  const iravSinUltimo = { ...iravLimpio };
  delete iravSinUltimo[ultimoQ];

  const mesMal = '2024-07';
  return [
    { caso: 'limpio · IPC anual reconstruido del INE', i: 0, datos: ipcLimpio, espera: 0 },
    { caso: '19/09: eslabón 2013 mal empalmado (+0,5 % desde 2013)', i: 0,
      datos: Object.fromEntries(Object.entries(ipcLimpio).map(([a, v]) => [a, Number(a) < 2013 ? v * 0.995 : v])), espera: 1 },
    { caso: 'limpio · IPC interanual copiado del INE', i: 1, datos: mensualLimpio, espera: 0 },
    { caso: `10/10: ${mesMal} una décima alto, como en alquiler.ts`, i: 1,
      datos: { ...mensualLimpio, [mesMal]: Math.round((mensualLimpio[mesMal] + 0.1) * 10) / 10 }, espera: 1 },
    { caso: '10/10: el último mes definitivo publicado y sin recoger', i: 1,
      datos: Object.fromEntries(Object.entries(mensualLimpio).filter(([k]) => k !== Object.keys(mensualLimpio).sort().at(-1))), espera: 1 },
    { caso: `IRAV sin su último trimestre completo (${ultimoQ}), que el INE ya cerró`, i: 2, datos: iravSinUltimo, espera: 1 },
    { caso: 'limpio · IRAV completo', i: 2, datos: iravLimpio, espera: 0 },
    { caso: 'IRAV con un trimestre dos centésimas alto', i: 2,
      datos: { ...iravLimpio, [Object.keys(iravLimpio).sort()[0]]: iravLimpio[Object.keys(iravLimpio).sort()[0]] + 0.02 }, espera: 1 },
  ];
}

// ── Ejecución ───────────────────────────────────────────────────────────────────────────────────

// process.exitCode y no process.exit(): en Windows, salir con sockets de fetch abiertos hace
// saltar una aserción de libuv y el proceso devuelve 127 en vez del código previsto.
let ines;
try {
  ines = await Promise.all(SERIES.map((s) => s.fuente()));
} catch (e) {
  if (!(e instanceof InstrumentoRoto)) throw e;
  console.error(`\n🚨 INSTRUMENTO ROTO: ${e.message}`);
  console.error('   Ningún resultado de esta ejecución vale nada. Arreglar la llamada antes de interpretar.');
  process.exitCode = 2;
}

if (!ines) {
  // instrumento roto: ya se ha dicho, y exitCode = 2
} else if (PROBAR) {
  console.log('\nPRUEBA — casos de origen reinyectados sobre copias (no se toca data/)\n');
  let fallos = 0;
  for (const c of casosDeOrigen(ines)) {
    const { incidencias } = SERIES[c.i].cotejar(c.datos, ines[c.i]);
    const detecta = incidencias.length > 0 ? 1 : 0;
    const ok = detecta === c.espera;
    if (!ok) fallos++;
    console.log(`${ok ? '✅' : '❌'} ${c.caso}: ${c.espera ? 'debe hablar' : 'debe callar'} → ${incidencias.length} incidencia(s)${!ok && incidencias.length ? ` (${incidencias[0]})` : ''}`);
  }
  console.log(fallos ? `\n❌ ${fallos} caso(s) mal: el auditor no ve lo que debería ver` : '\n✅ el auditor detecta los casos de origen y calla en los limpios');
  process.exitCode = fallos ? 1 : 0;
} else {
let total = 0;
console.log(`\nAUDITORÍA DE SERIES OFICIALES · INE · ${new Intl.DateTimeFormat('es-ES').format(new Date())}`);
SERIES.forEach((s, i) => {
  const ine = ines[i];
  const { incidencias, filas } = s.cotejar(s.datos, ine);
  total += incidencias.length;
  console.log(`\n${incidencias.length ? '⚠️ ' : '✅'} ${s.nombre}`);
  console.log(`   frente a ${ine.cod} — ${ine.nombre}`);
  for (const f of filas) console.log(`   ${f}`);
  for (const inc of incidencias) console.log(`   ❌ ${inc}`);
  for (const [k, v] of [...ine.provisionales].sort()) {
    console.log(`   ⏳ ${k} = ${fmt(v, 2)} es PROVISIONAL (adelantado): no se incorpora hasta el definitivo`);
  }
});
console.log(total
  ? `\n⚠️ ${total} incidencia(s). Cada corrección, con la fuente abierta en sesión y el OK del usuario (/triaje-fiscal).`
  : '\n✅ Todas las series cuadran con el INE y no falta ningún dato definitivo.');
process.exitCode = total ? 1 : 0;
}
