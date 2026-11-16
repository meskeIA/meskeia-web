#!/usr/bin/env node
/**
 * inspector:orden — en qué orden conviene lanzar hoy /inspector, /reparar y /reparar cabos
 *
 * Ejecutar:  npm run -s inspector:orden
 *
 * Imprime UNA línea, «Orden sugerido: …», que /parte pone tal cual en «Te toca hoy». Es una
 * consulta: no lanza nada ni escribe en ninguna base.
 *
 * POR QUÉ (26/10/2026)
 * ────────────────────
 * El parte ponía los tres rituales en «Te toca hoy» sin orden, y el usuario no sabía, con los tres
 * ya hechos, cuál le convenía si quería otro más. No es indiferente: van en fila (/reparar no
 * arranca con el Inspector trabajando en su copia) y no rinden lo mismo. Desde el 14/09, la
 * PRIMERA inspección de una app encuentra 1,22 altos o críticos de media, y una re-inspección
 * 0,20; con el reposo de un mes (`cola.mjs`) las tandas van sobre todo a las primeras.
 *
 * LA REGLA (decidida por el usuario el 26/10/2026)
 * ────────────────────────────────────────────────
 *   1. Un hallazgo ALTO o CRÍTICO abierto → /reparar primero: es un defecto conocido en
 *      producción. Basta uno.
 *   2. Si no, los cabos técnicos (destino `reparar`) se adelantan cuando su bandeja CRECE en los
 *      últimos 7 días (entran más que salen) o pasa de UMBRAL_CABOS abiertos → /reparar cabos.
 *   3. Si no, /inspector: es el único que encuentra defectos nuevos. Después, /reparar solo si
 *      deja altos; los bajos y medios esperan a cuando venga bien (el reposo los deja esperar).
 *   3.bis EL UMBRAL DE LAS PRIMERAS (16/11/2026, decidido por el usuario): con más de
 *      UMBRAL_PRIMERAS medios, altos o críticos abiertos, la cola no saca primeras y el sitio del
 *      Inspector lo ocupa `/reparar medio` (medios y superiores, de cualquier fecha). Sin esto los
 *      medios no los drenaba nadie —el punto 3 los deja esperar— y el paso no se abriría nunca. Va
 *      detrás de los cabos urgentes: ellos ya se adelantaban al Inspector. Cifras: `db.mjs`.
 *   4. Los cabos de destino `campana` van APARTE, «en paralelo: /campana <el más antiguo>»
 *      (01/11/2026, P003 del repaso de procesos): una campaña no choca con las tareas, que
 *      trabajan en su copia, pero sí con un /push o con otra campaña, así que no ocupa puesto en
 *      la fila. El 31/10 el usuario preguntó dos veces si lanzar ya una /campana, y esta línea
 *      no las conocía.
 *
 * Desde el 01/11/2026 la imprimen también, como «Siguiente: …», el `cerrar` de las tareas del
 * Inspector y de /reparar y el final de una /campana (`scripts/campana/limpiar.mjs`): el usuario
 * lo preguntaba a lo largo del día, y la respuesta de memoria contradijo la regla (27/10).
 *
 * Prueba: `npm run inspector:probar-orden`.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { abrir, UMBRAL_PRIMERAS, umbralPrimeras } from './db.mjs';
import { abrir as abrirCabos, resumen, listar, codigo } from '../cabos/cabos.mjs';

const UMBRAL_CABOS = 30;
/** Lo apartado por la recogida de /reparar (reparar-tarea.mjs, 16/11/2026). APARTADAS_JSON: la prueba. */
const RUTA_APARTADAS = process.env.APARTADAS_JSON
  || path.join(os.homedir(), 'Mis Desarrollos', 'Vigilancia', 'ActasNocturnas', 'salida', 'reparar-apartadas.json');

const nAltosDe = (altos) => altos.reduce((s, a) => s + a.n, 0);

/**
 * Hallazgos que ninguna tanda puede tocar (16/11/2026): los reservados por una tanda apartada y los
 * que nombra un cabo abierto de destino `usuario` («Hallazgo 4868», «Hallazgos 4714 y 4717»). Un alto
 * así no pone /reparar primero: la cadena lanzaría tandas una tras otra para algo que espera al
 * usuario. Caso de origen: tras la recogida del 16/11 09:30, los dos únicos altos eran 4868 (decisión
 * fiscal, C0791) y 4869 (reservado), y el orden decía «1 /reparar».
 */
function bloqueados(cdb) {
  const ids = new Set();
  try {
    for (const a of JSON.parse(fs.readFileSync(RUTA_APARTADAS, 'utf8'))) {
      if (a.estado === 'abierta') for (const h of a.hallazgos || []) ids.add(Number(h));
    }
  } catch { /* sin apartadas */ }
  for (const c of listar(cdb, { destino: 'usuario' })) {
    for (const m of String(c.texto || '').matchAll(/\bhallazgos?\s+(\d{4,5}(?:\s*(?:,|y)\s*\d{4,5})*)/gi)) {
      for (const n of m[1].matchAll(/\d{4,5}/g)) ids.add(Number(n[0]));
    }
  }
  return ids;
}

function ordenDelDia() {
  const cdb0 = abrirCabos();
  const fuera = bloqueados(cdb0);
  cdb0.close();
  const db = abrir();
  const filasAltos = db.prepare(`
    SELECT id, slug FROM hallazgos
    WHERE estado = 'abierto' AND severidad IN ('critico', 'alto') ORDER BY slug`).all();
  const totalAltos = filasAltos.length;
  const porApp = new Map();
  for (const h of filasAltos.filter((x) => !fuera.has(x.id))) porApp.set(h.slug, (porApp.get(h.slug) ?? 0) + 1);
  const altos = [...porApp].map(([slug, n]) => ({ slug, n })).sort((a, b) => b.n - a.n || a.slug.localeCompare(b.slug));
  const altosFuera = totalAltos - nAltosDe(altos);
  const menores = db.prepare(`
    SELECT COUNT(*) n FROM hallazgos WHERE estado = 'abierto' AND severidad NOT IN ('critico', 'alto')`).get().n;
  const umbral = umbralPrimeras(db);
  db.close();

  const cdb = abrirCabos();
  const r = resumen(cdb);
  const campanas = r.porDestino.campana ?? 0;
  const campanaAntigua = campanas ? listar(cdb, { destino: 'campana' })[0] : null;
  cdb.close();
  const cabos = r.porDestino.reparar ?? 0;
  const { entran, salen } = r.semana.reparar ?? { entran: 0, salen: 0 };
  const crecen = entran > salen;
  const urgenCabos = cabos > 0 && (crecen || cabos > UMBRAL_CABOS);

  const nAltos = nAltosDe(altos);
  const deAltos = `${nAltos} alto${nAltos === 1 ? '' : 's'} abierto${nAltos === 1 ? '' : 's'}: ${altos.slice(0, 3).map((a) => a.slug).join(', ')}${altos.length > 3 ? '…' : ''}`;
  const deCabos = `${cabos} cabos técnicos; ${crecen ? 'la bandeja crece' : 'se vacían'}: en 7 días entran ${entran} y salen ${salen}`;
  const deMedios = `${umbral.abiertos} medios y altos abiertos: el Inspector no abre primeras por encima de ${UMBRAL_PRIMERAS}`;
  // Con el paso cerrado los medios ya no esperan: solo los bajos
  const bajos = umbral.cerradas ? menores - (umbral.abiertos - totalAltos) : menores;
  const deMenores = bajos ? `${bajos} ${umbral.cerradas ? 'bajos' : 'bajos y medios'} abiertos pueden esperar` : null;
  const inspector = umbral.cerradas ? `/reparar medio (${deMedios})` : null;

  const pasos = [];
  if (nAltos) {
    pasos.push(`/reparar (${deAltos})`);
    if (urgenCabos) pasos.push(`/reparar cabos (${deCabos})`);
    pasos.push(inspector ?? '/inspector');
  } else if (urgenCabos) {
    pasos.push(`/reparar cabos (${deCabos})`);
    pasos.push(inspector ?? '/inspector (0 altos abiertos)');
  } else if (inspector) {
    pasos.push(inspector);
    pasos.push(`/inspector (solo cambios y cabos hasta bajar de ${UMBRAL_PRIMERAS})`);
  } else {
    pasos.push('/inspector (0 altos abiertos)');
    pasos.push('/reparar, solo si el Inspector deja altos');
  }
  const notas = [];
  if (!urgenCabos && cabos) notas.push(`/reparar cabos puede esperar (${deCabos})`);
  if (deMenores) notas.push(deMenores);
  if (altosFuera) notas.push(`${altosFuera} alto${altosFuera === 1 ? '' : 's'} esperan tu decisión o están apartados: no cuentan (/reparar pendientes)`);

  const enParalelo = campanaAntigua
    ? ` · en paralelo: /campana ${codigo(campanaAntigua.id)} (${campanas} abierta${campanas === 1 ? '' : 's'})`
    : '';

  return `Orden sugerido: ${pasos.map((p, i) => `${i + 1} ${p}`).join(' · ')}${enParalelo}` + (notas.length ? ` — ${notas.join(' · ')}` : '');
}

console.log(ordenDelDia());
