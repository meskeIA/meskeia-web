import { NextRequest, NextResponse } from 'next/server';
import { calcularZonasCardiacas } from '@/lib/calculadoras/deporte';
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
    const edad: number = body.edad;
    const fcReposo: number = body.fc_reposo;
    const fcMaxima: number | undefined = body.fc_maxima;

    if (!edad || !fcReposo) {
      return NextResponse.json(
        { error: 'Faltan parámetros: edad y fc_reposo son obligatorios. fc_maxima es opcional (si no se indica, se estima con 220−edad).' },
        { status: 400, headers: corsHeaders(origin) },
      );
    }

    const r = calcularZonasCardiacas(edad, fcReposo, fcMaxima);

    try {
      await initializeDatabase();
      const db = getTursoClient();
      await db.execute({
        sql: `INSERT INTO analytics (app_name, created_at, mode) VALUES (?, ?, ?)`,
        args: ['calculadora-zonas-cardiacas', new Date().toISOString(), 'chatgpt'],
      });
    } catch { /* analytics no crítico */ }

    return NextResponse.json({
      edad,
      fc_reposo: r.fcReposo,
      fc_max: r.fcMax,
      fc_max_estimada: r.fcMaxEstimada,
      fc_reserva: r.fcReserva,
      zonas: r.zonas.map(z => ({
        zona: z.zona,
        nombre: z.nombre,
        descripcion: z.descripcion,
        fc_min: z.fcMin,
        fc_max: z.fcMax,
        rango_porcentaje: `${z.porcentajeMin}–${z.porcentajeMax}%`,
        beneficio: z.beneficioPrincipal,
      })),
      nota: r.fcMaxEstimada
        ? 'FCmáx estimada con la fórmula 220−edad (±10-20 ppm). Para mayor precisión, usa tu FCmáx medida en un test de esfuerzo.'
        : 'FCmáx introducida manualmente.',
    }, { headers: corsHeaders(origin) });

  } catch {
    return NextResponse.json(
      { error: 'Error interno al procesar la solicitud.' },
      { status: 500, headers: corsHeaders(origin) },
    );
  }
}
