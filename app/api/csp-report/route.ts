/**
 * API Route: Recoger violaciones de Content-Security-Policy
 * Endpoint: POST /api/csp-report
 *
 * El navegador envía automáticamente un POST a este endpoint cuando detecta
 * una violación CSP (mientras la política esté en Report-Only o enforcement).
 *
 * Formato del body (application/csp-report):
 * {
 *   "csp-report": {
 *     "document-uri": "https://meskeia.com/mi-app/",
 *     "blocked-uri": "https://dominio-externo.com/recurso",
 *     "violated-directive": "connect-src",
 *     "effective-directive": "connect-src",
 *     "original-policy": "..."
 *   }
 * }
 *
 * Las violaciones se registran en los logs de Vercel para su análisis.
 */

import { NextRequest, NextResponse } from 'next/server';

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
    // El navegador envía content-type: application/csp-report
    // que es JSON válido, podemos parsearlo directamente
    const body = await request.text();
    const report = JSON.parse(body) as CspReport;
    const violation = report['csp-report'];

    if (!violation) {
      return new NextResponse(null, { status: 204 });
    }

    // Registrar en logs de Vercel (visible en el dashboard)
    console.warn('[CSP-VIOLATION]', {
      pagina: violation['document-uri'],
      bloqueado: violation['blocked-uri'],
      directiva: violation['effective-directive'] || violation['violated-directive'],
      archivo: violation['source-file'],
      linea: violation['line-number'],
    });

    // 204 No Content: respuesta estándar para endpoints de CSP report
    return new NextResponse(null, { status: 204 });
  } catch {
    // Si el body no es JSON válido, ignorar silenciosamente
    return new NextResponse(null, { status: 204 });
  }
}
