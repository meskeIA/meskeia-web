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
 *
 * Prueba: `npm run inspector:probar-orden`.
 */

import { abrir } from './db.mjs';
import { abrir as abrirCabos, resumen } from '../cabos/cabos.mjs';

const UMBRAL_CABOS = 30;

function ordenDelDia() {
  const db = abrir();
  const altos = db.prepare(`
    SELECT slug, COUNT(*) n FROM hallazgos
    WHERE estado = 'abierto' AND severidad IN ('critico', 'alto')
    GROUP BY slug ORDER BY n DESC, slug`).all();
  const menores = db.prepare(`
    SELECT COUNT(*) n FROM hallazgos WHERE estado = 'abierto' AND severidad NOT IN ('critico', 'alto')`).get().n;
  db.close();

  const cdb = abrirCabos();
  const r = resumen(cdb);
  cdb.close();
  const cabos = r.porDestino.reparar ?? 0;
  const { entran, salen } = r.semana.reparar ?? { entran: 0, salen: 0 };
  const crecen = entran > salen;
  const urgenCabos = cabos > 0 && (crecen || cabos > UMBRAL_CABOS);

  const nAltos = altos.reduce((s, a) => s + a.n, 0);
  const deAltos = `${nAltos} alto${nAltos === 1 ? '' : 's'} abierto${nAltos === 1 ? '' : 's'}: ${altos.slice(0, 3).map((a) => a.slug).join(', ')}${altos.length > 3 ? '…' : ''}`;
  const deCabos = `${cabos} cabos técnicos; ${crecen ? 'la bandeja crece' : 'se vacían'}: ${entran} → ${salen} en 7 días`;
  const deMenores = menores ? `${menores} bajos y medios abiertos pueden esperar` : null;

  const pasos = [];
  if (nAltos) {
    pasos.push(`/reparar (${deAltos})`);
    if (urgenCabos) pasos.push(`/reparar cabos (${deCabos})`);
    pasos.push('/inspector');
  } else if (urgenCabos) {
    pasos.push(`/reparar cabos (${deCabos})`);
    pasos.push('/inspector (0 altos abiertos)');
  } else {
    pasos.push('/inspector (0 altos abiertos)');
    pasos.push('/reparar, solo si el Inspector deja altos');
  }
  const notas = [];
  if (!urgenCabos && cabos) notas.push(`/reparar cabos puede esperar (${deCabos})`);
  if (deMenores) notas.push(deMenores);

  return `Orden sugerido: ${pasos.map((p, i) => `${i + 1} ${p}`).join(' · ')}` + (notas.length ? ` — ${notas.join(' · ')}` : '');
}

console.log(ordenDelDia());
