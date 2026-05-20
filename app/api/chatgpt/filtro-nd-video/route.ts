import { NextRequest, NextResponse } from 'next/server';
import { calcularFiltroNDVideo } from '@/lib/calculadoras/videografia';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

const ALLOWED_ORIGINS = ['https://chat.openai.com', 'https://chatgpt.com'];

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[1];
  return { 'Access-Control-Allow-Origin': allowed, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get('origin')) });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  try {
    const body = await req.json();
    const fps: number = body.fps;
    const obturador_actual_s: number = body.obturador_actual_s;

    if (!fps || !obturador_actual_s)
      return NextResponse.json({ error: 'Faltan parámetros: fps y obturador_actual_s son obligatorios.' }, { status: 400, headers: corsHeaders(origin) });

    const r = calcularFiltroNDVideo(fps, obturador_actual_s);

    try {
      await initializeDatabase();
      const db = getTursoClient();
      await db.execute({ sql: `INSERT INTO analytics (app_name, created_at, mode) VALUES (?, ?, ?)`, args: ['calculadora-filtro-nd-video', new Date().toISOString(), 'chatgpt'] });
    } catch { /* analytics no crítico */ }

    return NextResponse.json({
      fps,
      obturador_actual: r.obturadorActual,
      obturador_objetivo_180: r.obturadorObjetivo,
      necesita_nd: r.necesitaND,
      paradas_necesarias: r.paradas_necesarias_exactas,
      recomendacion: r.recomendacion,
      opciones: r.opciones.map(o => ({
        filtro: o.denominacion,
        paradas: o.paradas,
        obturador_resultante: o.obturadorResultante,
        recomendado: o.recomendado,
      })),
    }, { headers: corsHeaders(origin) });
  } catch {
    return NextResponse.json({ error: 'Error interno.' }, { status: 500, headers: corsHeaders(origin) });
  }
}
