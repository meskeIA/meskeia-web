import { NextRequest, NextResponse } from 'next/server';
import { calcularExposicionEquivalente, ParametroFijo } from '@/lib/calculadoras/fotografia';
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
    const isoBase: number = body.iso_base;
    const aperturaBase: number = body.apertura_base;
    const obturadorBase: number = body.obturador_base_s;
    const parametroFijo: ParametroFijo = body.parametro_fijo;
    const nuevoValor: number = body.nuevo_valor;

    if (!isoBase || !aperturaBase || !obturadorBase || !parametroFijo || nuevoValor === undefined) {
      return NextResponse.json(
        { error: 'Parámetros requeridos: iso_base, apertura_base, obturador_base_s, parametro_fijo (iso|apertura|obturador), nuevo_valor.' },
        { status: 400, headers: corsHeaders(origin) },
      );
    }

    if (!['iso', 'apertura', 'obturador'].includes(parametroFijo)) {
      return NextResponse.json(
        { error: 'parametro_fijo debe ser: iso, apertura u obturador.' },
        { status: 400, headers: corsHeaders(origin) },
      );
    }

    const r = calcularExposicionEquivalente(isoBase, aperturaBase, obturadorBase, parametroFijo, nuevoValor);

    try {
      await initializeDatabase();
      const db = getTursoClient();
      await db.execute({
        sql: `INSERT INTO analytics (app_name, created_at, mode) VALUES (?, ?, ?)`,
        args: ['simulador-fotografia', new Date().toISOString(), 'chatgpt'],
      });
    } catch { /* analytics no crítico */ }

    return NextResponse.json({
      exposicion_original: {
        iso: isoBase,
        apertura: `f/${aperturaBase}`,
        obturador: body.obturador_base_s >= 1 ? `${body.obturador_base_s} s` : `1/${Math.round(1 / body.obturador_base_s)}`,
      },
      parametro_fijo: parametroFijo,
      nuevo_valor: nuevoValor,
      exposicion_equivalente: {
        iso: r.iso,
        apertura: `f/${r.apertura}`,
        obturador: r.obturador_fraccion,
        obturador_s: r.obturador_s,
      },
      valores_en_pasos: {
        iso: r.vp_iso,
        apertura: r.vp_apertura,
        obturador: r.vp_obturador,
        ev_total: r.ev,
      },
      nota: 'Los valores calculados son exposiciones equivalentes. La calidad de imagen (ruido, profundidad de campo, congelado del movimiento) variará según qué parámetro cambies.',
    }, { headers: corsHeaders(origin) });

  } catch {
    return NextResponse.json(
      { error: 'Error interno al procesar la solicitud.' },
      { status: 500, headers: corsHeaders(origin) },
    );
  }
}
