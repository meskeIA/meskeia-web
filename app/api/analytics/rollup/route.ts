/**
 * API Route: Cómputo de agregados (rollup) de analytics
 * Endpoint: GET /api/analytics/rollup
 *
 * Computa las tablas de rollup para los días CERRADOS (< hoy) que aún no estén
 * agregados. Lo invocan:
 *  - El cron diario de Vercel (vercel.json) → mantiene el rollup al día.
 *  - El backfill local (scripts/rollup-backfill.mjs) → poblar el histórico.
 *  - El on-demand defensivo del router → reconstruir huecos si el cron falló.
 *
 * Autorización (cualquiera de las dos):
 *  - Authorization: Bearer <CRON_SECRET>  → la añade Vercel en sus crons.
 *  - x-api-key: <ANALYTICS_SECRET>        → para uso manual/backfill local.
 *
 * Parámetros (query):
 *  - max: nº máximo de días a procesar por invocación (default 60, acota el timeout).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, initializeDatabase } from '@/lib/turso';
import {
  computarRollupPendientes,
  computarRollupRango,
  derivarAcumulados,
  hoyFechaOrd,
  leerIpExcluida,
  limiteCerradoOrd,
} from '@/lib/analytics-rollup';

export const runtime = 'nodejs';
export const maxDuration = 60;

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization');
  if (cronSecret && auth === `Bearer ${cronSecret}`) return true;

  const apiKey = request.headers.get('x-api-key');
  const analyticsSecret = process.env.ANALYTICS_SECRET;
  if (analyticsSecret && apiKey === analyticsSecret) return true;

  return false;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ status: 'error', message: 'No autorizado' }, { status: 401 });
  }

  try {
    await initializeDatabase();
    const client = getTursoClient();

    const { searchParams } = new URL(request.url);
    const max = Math.min(Math.max(parseInt(searchParams.get('max') || '60', 10) || 60, 1), 400);

    // rebuild=1: fuerza recompute total (cambio de semántica de columnas). Vacía
    // rollup_control para que se recomputen todos los días; el DELETE+INSERT por
    // rango de computarRollupRango sobrescribe los datos viejos.
    if (searchParams.get('rebuild') === '1') {
      await client.execute(`DELETE FROM rollup_control`);
    }

    const ipExcluida = await leerIpExcluida(client);
    const t0 = Date.now();
    const { procesados, desde, hasta } = await computarRollupPendientes(client, ipExcluida, max);

    // Refresco de cola: recomputar los últimos N días cerrados AUNQUE ya estén
    // en rollup_control. Las duraciones llegan tarde (una pestaña abandonada
    // dispara beforeunload días después y actualiza duracion_segundos de una
    // fila cuyo día ya estaba agregado) → sin esto, el rollup deriva del crudo.
    // Idempotente (DELETE+INSERT por rango) y barato (~7 días de filas).
    // Solo corre por esta ruta (cron diario / manual), NUNCA en el on-demand
    // del dashboard, que llama a computarRollupPendientes directamente.
    const refrescar = Math.min(Math.max(parseInt(searchParams.get('refrescar') || '7', 10) || 0, 0), 60);
    let refrescados = 0;
    if (refrescar > 0) {
      const tope = limiteCerradoOrd();
      const desdeD = new Date(Number(tope.slice(0, 4)), Number(tope.slice(4, 6)) - 1, Number(tope.slice(6, 8)));
      desdeD.setDate(desdeD.getDate() - (refrescar - 1));
      await computarRollupRango(client, hoyFechaOrd(desdeD), tope, ipExcluida);
      await derivarAcumulados(client);
      refrescados = refrescar;
    }

    return NextResponse.json({
      status: 'success',
      procesados,
      desde,
      hasta,
      refrescados,
      // quedan: true si pudo haber más pendientes (procesó el lote completo)
      quedan: procesados >= max,
      ms: Date.now() - t0,
    });
  } catch (error) {
    console.error('Error en /api/analytics/rollup:', error);
    return NextResponse.json(
      { status: 'error', message: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
