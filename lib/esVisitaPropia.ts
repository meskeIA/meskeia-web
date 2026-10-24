/**
 * Decide si una visita que llega a /api/analytics/track es del propietario (`es_propio`).
 *
 * Se compara IP anonimizada contra IP anonimizada: `ip-filter` guarda `ip_excluida` ya
 * truncada. Vive aquí, y no en la ruta, porque un `route.ts` de Next solo puede exportar
 * los métodos HTTP, y la decisión tiene que poder probarse sin escribir en Turso.
 *
 * ── IP local: siempre propia (24/10/2026, acta del digest, P1) ───────────────────────────
 * `tests/analytics-duracion-spa.spec.ts` sorteaba las guardas del tracker y el servidor local,
 * que tiene las credenciales de Turso, escribía sus visitas en producción: 126 filas con
 * `ip_address = '::ffff::'` desde el 16/09, sin marcar, porque la IP excluida es la pública.
 * Una IP de bucle local solo llega desde el propio PC, así que cubre cualquier test futuro que
 * esquive las guardas. Se mira la IP de ORIGEN, antes de anonimizar: `::ffff::` es también lo
 * que queda de cualquier IPv4 mapeado, y marcarlo por la anonimizada se llevaría visitantes.
 *
 * Pruebas: tests/es-visita-propia-motor.spec.ts (`npm run test:calc`).
 */
const IPS_LOCALES = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);

export function esVisitaPropia(
  ipOrigen: string | null,
  ipAnonimizada: string | null,
  ipPropia: string | null
): boolean {
  if (ipOrigen !== null && IPS_LOCALES.has(ipOrigen)) return true;
  return ipPropia !== null && ipAnonimizada === ipPropia;
}
