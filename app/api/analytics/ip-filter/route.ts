/**
 * API Route: /api/analytics/ip-filter
 * Gestiona la IP excluida para desarrollo (meskeIA Analytics v3.0)
 *
 * GET: Obtiene la IP actual y la IP excluida guardada
 * POST: Guarda la IP actual como IP excluida
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Obtener IP del request
function getClientIP(request: NextRequest): string {
  // Vercel pone la IP real en x-forwarded-for
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  // Fallback a x-real-ip
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  return 'unknown';
}

// GET: Obtener configuración de IP
export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    const client = getTursoClient();

    // Obtener IP actual del visitante
    const ipActual = getClientIP(request);

    // Buscar IP excluida en la tabla de configuración
    const result = await client.execute({
      sql: `SELECT valor FROM analytics_config WHERE clave = 'ip_excluida'`,
      args: [],
    });

    const ipExcluida = result.rows.length > 0 ? String(result.rows[0].valor) : '';

    // Obtener estado del filtro
    const estadoResult = await client.execute({
      sql: `SELECT valor FROM analytics_config WHERE clave = 'filtro_ip_activo'`,
      args: [],
    });

    const filtroActivo = estadoResult.rows.length > 0 ? estadoResult.rows[0].valor === 'true' : true;

    return NextResponse.json({
      status: 'success',
      data: {
        ip_actual: ipActual,
        ip_excluida: ipExcluida,
        activo: filtroActivo,
      },
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Error al obtener configuración IP:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Error al obtener configuración',
    }, { status: 500, headers: corsHeaders });
  }
}

// POST: Guardar IP actual como excluida
export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    const client = getTursoClient();

    // Obtener IP actual
    const ipActual = getClientIP(request);

    // Obtener estado del filtro del body (opcional)
    let filtroActivo = true;
    try {
      const body = await request.json();
      if (typeof body.activo === 'boolean') {
        filtroActivo = body.activo;
      }
    } catch {
      // Si no hay body, mantener valor por defecto
    }

    // Guardar o actualizar IP excluida
    await client.execute({
      sql: `INSERT OR REPLACE INTO analytics_config (clave, valor, actualizado)
            VALUES ('ip_excluida', ?, datetime('now'))`,
      args: [ipActual],
    });

    // Guardar estado del filtro
    await client.execute({
      sql: `INSERT OR REPLACE INTO analytics_config (clave, valor, actualizado)
            VALUES ('filtro_ip_activo', ?, datetime('now'))`,
      args: [filtroActivo ? 'true' : 'false'],
    });

    return NextResponse.json({
      status: 'success',
      data: {
        ip_excluida: ipActual,
        activo: filtroActivo,
      },
      message: `IP ${ipActual} guardada correctamente`,
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Error al guardar IP:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Error al guardar IP',
    }, { status: 500, headers: corsHeaders });
  }
}

// OPTIONS: CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}
