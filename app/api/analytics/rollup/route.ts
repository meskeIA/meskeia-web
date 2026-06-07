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
import { computarRollupPendientes, leerIpExcluida } from '@/lib/analytics-rollup';

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

    const ipExcluida = await leerIpExcluida(client);
    const t0 = Date.now();
    const { procesados, desde, hasta } = await computarRollupPendientes(client, ipExcluida, max);

    return NextResponse.json({
      status: 'success',
      procesados,
      desde,
      hasta,
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
