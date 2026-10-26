/**
 * Línea de base de la Ronda: contra QUÉ ronda se comparan las URLs rotas (cabo C0466)
 *
 * Prueba:  node scripts/pruebas/probar-ronda-base.mjs
 *
 * ── De dónde sale (26/10/2026) ────────────────────────────────────────────────
 * La Ronda comparaba con la última ronda completa, la que hubiera. El 26/10/2026 hubo dos
 * vueltas el mismo día (05:02 y ~06:32): la segunda se comparó con la primera, que ya había
 * reescrito `ultima-produccion.json`, y /playground-sql/ —rota por primera vez ese día («a.O is
 * not a function»)— salió como «0 nuevas · 1 persistentes». Como la segunda vuelta reescribe
 * además el acta del día (mismo nombre), la lista de nuevas de la primera se perdió, y el parte
 * dijo «Sin URLs nuevas rotas desde ayer». Una rotura nueva puede pasar así por ruido conocido.
 *
 * Ahora la base es la última ronda de un día ANTERIOR: el estado guarda, junto al de hoy, la
 * base con la que se comparó (`base`), y una segunda vuelta del mismo día la reutiliza. Y las
 * nuevas se acumulan en el día (`nuevasDelDia`), para que el acta de la última vuelta diga
 * también las que salieron en una vuelta anterior de hoy y ya no aparecen.
 */

/** Lo mínimo de una ronda que hace falta para compararse con ella. */
function compacta(ronda) {
  return ronda ? { fecha: ronda.fecha, conIncidencia: ronda.conIncidencia || [] } : null;
}

/**
 * La ronda contra la que se compara una ronda completa de `fecha` (AAAA-MM-DD), dado el estado
 * que dejó la anterior. Devuelve null si no hay ninguna de un día anterior.
 */
export function lineaDeBase(anterior, fecha) {
  if (!anterior) return null;
  if (anterior.fecha !== fecha) return compacta(anterior);
  // Segunda vuelta del día: la base es la de la primera. Un estado de hoy escrito antes de
  // este cambio no la lleva: entonces se compara con él, como antes, y no con nada.
  return anterior.base !== undefined ? anterior.base : compacta(anterior);
}

/** Las URLs nuevas del día, acumuladas entre vueltas, sin repetir y en orden de aparición. */
export function nuevasDelDia(anterior, fecha, nuevasAhora) {
  const previas = anterior && anterior.fecha === fecha ? anterior.nuevasDelDia || [] : [];
  return [...new Set([...previas, ...nuevasAhora])];
}

/** Las nuevas de una vuelta anterior de hoy que esta vuelta ya no ve rotas. */
export function nuevasQueYaNoAparecen(delDia, nuevasAhora) {
  const ahora = new Set(nuevasAhora);
  return delDia.filter((u) => !ahora.has(u));
}
