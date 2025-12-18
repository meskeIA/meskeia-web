/**
 * API Route: Guardar Duración de Sesión
 * Endpoint: POST /api/analytics/duration
 *
 * Reemplaza: api/v1/guardar-duracion.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient } from '@/lib/turso';

// Configuración para edge runtime
export const runtime = 'edge';

// Permitir CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const datos = await request.json();

    // Validar campos obligatorios
    if (!datos.aplicacion || datos.duracion_segundos === undefined) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Campos "aplicacion" y "duracion_segundos" son obligatorios',
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const client = getTursoClient();

    // Buscar el último registro de esta aplicación/sesión para actualizar duración
    // Si hay sesion_id, usarlo para encontrar el registro exacto
    if (datos.sesion_id) {
      await client.execute({
        sql: `UPDATE uso_aplicaciones
              SET duracion_segundos = ?
              WHERE sesion_id = ? AND aplicacion = ?`,
        args: [datos.duracion_segundos, datos.sesion_id, datos.aplicacion],
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
        args: [datos.duracion_segundos, datos.aplicacion],
      });
    }

    return NextResponse.json(
      {
        status: 'success',
        message: 'Duración registrada correctamente',
        data: {
          aplicacion: datos.aplicacion,
          duracion_segundos: datos.duracion_segundos,
        },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error en /api/analytics/duration:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
