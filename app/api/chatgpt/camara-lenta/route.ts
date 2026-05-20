import { NextRequest, NextResponse } from 'next/server';
import { calcularCamaraLenta } from '@/lib/calculadoras/videografia';
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
    const fps_grabacion: number = body.fps_grabacion;
    const fps_reproduccion: number = body.fps_reproduccion;
    const duracion_grabacion_s: number | undefined = body.duracion_grabacion_s;

    if (!fps_grabacion || !fps_reproduccion)
      return NextResponse.json({ error: 'Faltan parámetros: fps_grabacion y fps_reproduccion son obligatorios.' }, { status: 400, headers: corsHeaders(origin) });

    const r = calcularCamaraLenta(fps_grabacion, fps_reproduccion, duracion_grabacion_s);

    try {
      await initializeDatabase();
      const db = getTursoClient();
      await db.execute({ sql: `INSERT INTO analytics (app_name, created_at, mode) VALUES (?, ?, ?)`, args: ['calculadora-camara-lenta', new Date().toISOString(), 'chatgpt'] });
    } catch { /* analytics no crítico */ }

    const respuesta: Record<string, unknown> = {
      fps_grabacion,
      fps_reproduccion,
      factor_lentitud: `${r.factor_lentitud}×`,
      nivel: r.nivel,
      obturador_grabacion: r.obturador_grabacion,
      descripcion: r.descripcion,
    };
    if (r.duracion_resultado_s !== null) respuesta.duracion_resultado_s = r.duracion_resultado_s;

    return NextResponse.json(respuesta, { headers: corsHeaders(origin) });
  } catch {
    return NextResponse.json({ error: 'Error interno.' }, { status: 500, headers: corsHeaders(origin) });
  }
}
