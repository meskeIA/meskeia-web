/**
 * API Route: Resumen de violaciones CSP
 * Endpoint: GET /api/analytics/csp-violations
 *
 * Requiere header: x-api-key: ANALYTICS_SECRET
 *
 * Devuelve:
 * - total_7d: violaciones en los últimos 7 días
 * - total_30d: violaciones en los últimos 30 días
 * - por_directiva: agrupadas por directiva CSP violada
 * - por_pagina: páginas con más violaciones
 * - recientes: últimas 10 violaciones
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

export const runtime = 'nodejs';

function isAuthorized(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');
  const secret = process.env.ANALYTICS_SECRET;
  if (!secret || !apiKey) return false;
  return apiKey === secret;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    await initializeDatabase();
    const client = getTursoClient();

    const [total7d, total30d, porDirectiva, porPagina, recientes] = await Promise.all([
      client.execute(`
        SELECT COUNT(*) as total FROM csp_violations
        WHERE created_at >= datetime('now', '-7 days')
      `),
      client.execute(`
        SELECT COUNT(*) as total FROM csp_violations
        WHERE created_at >= datetime('now', '-30 days')
      `),
      client.execute(`
        SELECT directiva, COUNT(*) as total
        FROM csp_violations
        WHERE created_at >= datetime('now', '-30 days')
        GROUP BY directiva
        ORDER BY total DESC
        LIMIT 10
      `),
      client.execute(`
        SELECT pagina, COUNT(*) as total
        FROM csp_violations
        WHERE created_at >= datetime('now', '-30 days')
        GROUP BY pagina
        ORDER BY total DESC
        LIMIT 10
      `),
      client.execute(`
        SELECT pagina, bloqueado, directiva, archivo, linea, created_at
        FROM csp_violations
        ORDER BY created_at DESC
        LIMIT 10
      `),
    ]);

    return NextResponse.json({
      total_7d: total7d.rows[0]?.total ?? 0,
      total_30d: total30d.rows[0]?.total ?? 0,
      por_directiva: porDirectiva.rows,
      por_pagina: porPagina.rows,
      recientes: recientes.rows,
    });
  } catch (err) {
    console.error('[CSP-VIOLATIONS] Error al consultar:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
