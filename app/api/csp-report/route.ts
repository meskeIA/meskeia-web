/**
 * API Route: Recoger violaciones de Content-Security-Policy
 * Endpoint: POST /api/csp-report
 *
 * El navegador envía automáticamente un POST a este endpoint cuando detecta
 * una violación CSP (mientras la política esté en Report-Only o enforcement).
 *
 * Las violaciones se guardan en Turso (tabla csp_violations) para su análisis
 * en la auditoría semanal via /api/analytics/csp-violations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

interface CspViolation {
  'document-uri'?: string;
  'referrer'?: string;
  'blocked-uri'?: string;
  'violated-directive'?: string;
  'effective-directive'?: string;
  'original-policy'?: string;
  'disposition'?: string;
  'status-code'?: number;
  'source-file'?: string;
  'line-number'?: number;
  'column-number'?: number;
}

interface CspReport {
  'csp-report': CspViolation;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const report = JSON.parse(body) as CspReport;
    const violation = report['csp-report'];

    if (!violation) {
      return new NextResponse(null, { status: 204 });
    }

    const pagina = violation['document-uri'] ?? null;
    const bloqueado = violation['blocked-uri'] ?? null;
    const directiva = violation['effective-directive'] ?? violation['violated-directive'] ?? null;
    const archivo = violation['source-file'] ?? null;
    const linea = violation['line-number'] ?? null;
    const userAgent = request.headers.get('user-agent') ?? null;

    // Log en Vercel (para depuración inmediata)
    console.warn('[CSP-VIOLATION]', { pagina, bloqueado, directiva, archivo, linea });

    // Guardar en Turso de forma asíncrona — no bloquea la respuesta 204
    guardarViolacion({ pagina, bloqueado, directiva, archivo, linea, userAgent }).catch(
      (err) => console.error('[CSP-VIOLATION] Error al guardar en Turso:', err)
    );

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}

async function guardarViolacion(datos: {
  pagina: string | null;
  bloqueado: string | null;
  directiva: string | null;
  archivo: string | null;
  linea: number | null;
  userAgent: string | null;
}): Promise<void> {
  await initializeDatabase();
  const client = getTursoClient();
  await client.execute({
    sql: `INSERT INTO csp_violations (pagina, bloqueado, directiva, archivo, linea, user_agent)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      datos.pagina,
      datos.bloqueado,
      datos.directiva,
      datos.archivo,
      datos.linea,
      datos.userAgent,
    ],
  });
}
