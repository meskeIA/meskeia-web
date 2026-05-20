import { NextRequest, NextResponse } from 'next/server';
import { calcular1RM } from '@/lib/calculadoras/deporte';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

const ALLOWED_ORIGINS = ['https://chat.openai.com', 'https://chatgpt.com'];

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[1];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  try {
    const body = await req.json();
    const peso_kg: number = body.peso_kg;
    const repeticiones: number = body.repeticiones;

    if (!peso_kg || !repeticiones) {
      return NextResponse.json(
        { error: 'Faltan parámetros: peso_kg y repeticiones son obligatorios.' },
        { status: 400, headers: corsHeaders(origin) },
      );
    }

    const r = calcular1RM(peso_kg, repeticiones);

    try {
      await initializeDatabase();
      const db = getTursoClient();
      await db.execute({
        sql: `INSERT INTO analytics (app_name, created_at, mode) VALUES (?, ?, ?)`,
        args: ['calculadora-1rm-gimnasio', new Date().toISOString(), 'chatgpt'],
      });
    } catch { /* analytics no crítico */ }

    return NextResponse.json({
      peso_kg,
      repeticiones,
      epley_kg: r.epley,
      brzycki_kg: r.brzycki,
      media_kg: r.media,
      tabla_cargas: r.tablaPorcentajes.map(t => ({
        porcentaje: `${t.porcentaje}%`,
        peso_kg: t.peso_kg,
        repeticiones_aproximadas: t.repsAproximadas,
      })),
      advertencia: r.advertencia,
    }, { headers: corsHeaders(origin) });

  } catch {
    return NextResponse.json(
      { error: 'Error interno al procesar la solicitud.' },
      { status: 500, headers: corsHeaders(origin) },
    );
  }
}
