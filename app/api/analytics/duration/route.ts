/**
 * API Route: Guardar Duración de Sesión
 * Endpoint: POST /api/analytics/duration
 *
 * Reemplaza: api/v1/guardar-duracion.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient } from '@/lib/turso';
import { getCorsHeaders } from '@/lib/cors';

// Configuración para edge runtime
export const runtime = 'edge';

export async function OPTIONS() {
  return NextResponse.json({}, { headers: getCorsHeaders('POST, OPTIONS') });
}

export async function POST(request: NextRequest) {
  try {
    // Leer como texto y parsear manualmente: sendBeacon en iOS envía text/plain,
    // fetch envía application/json — ambos llevan JSON como cuerpo
    const raw = await request.text();
    const datos = JSON.parse(raw);

    // Validar campos obligatorios
    if (!datos.aplicacion || typeof datos.aplicacion !== 'string' || datos.duracion_segundos === undefined) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Campos "aplicacion" y "duracion_segundos" son obligatorios',
        },
        { status: 400, headers: getCorsHeaders('POST, OPTIONS', request.headers.get('origin')) }
      );
    }

    // H5/L1: Validar que la duración sea un número razonable (0s - 24h)
    const duracion = Number(datos.duracion_segundos);
    if (isNaN(duracion) || duracion < 0 || duracion > 86400) {
      return NextResponse.json(
        { status: 'error', message: 'Duración fuera de rango (0-86400 segundos)' },
        { status: 400, headers: getCorsHeaders('POST, OPTIONS', request.headers.get('origin')) }
      );
    }

    const aplicacion = datos.aplicacion.slice(0, 100);
    const sesion_id = datos.sesion_id && typeof datos.sesion_id === 'string'
      ? datos.sesion_id.slice(0, 50)
      : null;

    const client = getTursoClient();

    // Buscar el último registro de esta aplicación/sesión para actualizar duración
    // Si hay sesion_id, usarlo para encontrar el registro exacto
    if (sesion_id) {
      await client.execute({
        sql: `UPDATE uso_aplicaciones
              SET duracion_segundos = ?
              WHERE sesion_id = ? AND aplicacion = ?`,
        args: [duracion, sesion_id, aplicacion],
      });
    } else {
      // Fallback: actualizar el último registro de esta app sin duración
      await client.execute({
        sql: `UPDATE uso_aplicaciones
              SET duracion_segundos = ?
              WHERE id = (
                SELECT id FROM uso_aplicaciones
                WHERE aplicacion = ? AND duracion_segundos IS NULL
                ORDER BY id DESC LIMIT 1
              )`,
        args: [duracion, aplicacion],
      });
    }

    return NextResponse.json(
      {
        status: 'success',
        message: 'Duración registrada correctamente',
        data: { aplicacion, duracion_segundos: duracion },
      },
      { status: 200, headers: getCorsHeaders('POST, OPTIONS', request.headers.get('origin')) }
    );
  } catch (error) {
    console.error('Error en /api/analytics/duration:', error);
    return NextResponse.json(
      { status: 'error', message: 'Error interno del servidor' },
      { status: 500, headers: getCorsHeaders('POST, OPTIONS', request.headers.get('origin')) }
    );
  }
}
