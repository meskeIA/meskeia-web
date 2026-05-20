import { NextRequest, NextResponse } from 'next/server';
import { calcularHidratacionPan, type ModoHidratacion } from '@/lib/calculadoras/cocina';
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
    const modo: ModoHidratacion = body.modo ?? 'calcular_porcentaje';
    const harina_g: number = body.harina_g;
    const agua_o_porcentaje: number = body.modo === 'calcular_agua' ? body.hidratacion_pct : body.agua_g;

    if (!harina_g || agua_o_porcentaje === undefined) {
      return NextResponse.json(
        { error: 'Modo "calcular_porcentaje": requiere harina_g y agua_g. Modo "calcular_agua": requiere harina_g e hidratacion_pct.' },
        { status: 400, headers: corsHeaders(origin) },
      );
    }

    const r = calcularHidratacionPan(modo, harina_g, agua_o_porcentaje);

    try {
      await initializeDatabase();
      const db = getTursoClient();
      await db.execute({
        sql: `INSERT INTO analytics (app_name, created_at, mode) VALUES (?, ?, ?)`,
        args: ['calculadora-hidratacion-pan', new Date().toISOString(), 'chatgpt'],
      });
    } catch { /* analytics no crítico */ }

    return NextResponse.json({
      harina_g: r.harina_g,
      agua_g: r.agua_g,
      hidratacion_pct: r.hidratacion_pct,
      clasificacion: r.clasificacion,
      descripcion: r.descripcion,
      ejemplos_panes: r.ejemplos,
    }, { headers: corsHeaders(origin) });

  } catch {
    return NextResponse.json(
      { error: 'Error interno al procesar la solicitud.' },
      { status: 500, headers: corsHeaders(origin) },
    );
  }
}
