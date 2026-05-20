import { NextRequest, NextResponse } from 'next/server';
import { calcularDDT, type TipoAmasadora } from '@/lib/calculadoras/cocina';
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
    const ddt_objetivo_c: number = body.ddt_objetivo_c ?? 24;
    const t_ambiente_c: number = body.t_ambiente_c;
    const t_harina_c: number = body.t_harina_c ?? body.t_ambiente_c;
    const tipo_amasadora: TipoAmasadora = body.tipo_amasadora ?? 'manual';
    const t_preferment_c: number | undefined = body.t_preferment_c;

    if (t_ambiente_c === undefined) {
      return NextResponse.json(
        { error: 'Parámetro requerido: t_ambiente_c (temperatura ambiente en °C). Opcionales: ddt_objetivo_c (por defecto 24°C), t_harina_c (si no se indica = t_ambiente), tipo_amasadora (manual|kitchen_aid|amasadora_espiral|thermomix), t_preferment_c (si usas preferment).' },
        { status: 400, headers: corsHeaders(origin) },
      );
    }

    const r = calcularDDT(ddt_objetivo_c, t_ambiente_c, t_harina_c, tipo_amasadora, t_preferment_c);

    try {
      await initializeDatabase();
      const db = getTursoClient();
      await db.execute({
        sql: `INSERT INTO analytics (app_name, created_at, mode) VALUES (?, ?, ?)`,
        args: ['calculadora-temperatura-masa', new Date().toISOString(), 'chatgpt'],
      });
    } catch { /* analytics no crítico */ }

    return NextResponse.json({
      temperatura_agua_recomendada_c: r.temperatura_agua_c,
      temperatura_agua_recomendada_f: r.temperatura_agua_f,
      ddt_objetivo_c: r.ddt_objetivo_c,
      factores_usados: {
        t_ambiente_c: r.t_ambiente_c,
        t_harina_c: r.t_harina_c,
        t_friccion_c: r.t_friccion_c,
        amasadora: r.factorFricion_descripcion,
      },
      interpretacion: r.interpretacion,
      advertencia: r.advertencia,
    }, { headers: corsHeaders(origin) });

  } catch {
    return NextResponse.json(
      { error: 'Error interno al procesar la solicitud.' },
      { status: 500, headers: corsHeaders(origin) },
    );
  }
}
