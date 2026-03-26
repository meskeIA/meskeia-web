import { NextRequest, NextResponse } from 'next/server';
import { calcularHipoteca } from '@/lib/calculadoras/hipoteca';

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
    const resultado = calcularHipoteca({
      precioVivienda:    Number(body.precioVivienda),
      entrada:           Number(body.entrada),
      plazoAnios:        Number(body.plazoAnios),
      tipoHipoteca:      body.tipoHipoteca ?? 'fijo',
      interesAnual:      body.interesAnual !== undefined ? Number(body.interesAnual) : undefined,
      euribor:           body.euribor !== undefined ? Number(body.euribor) : undefined,
      diferencial:       body.diferencial !== undefined ? Number(body.diferencial) : undefined,
      plazoFijoMixta:    body.plazoFijoMixta !== undefined ? Number(body.plazoFijoMixta) : undefined,
      ingresosMensuales: body.ingresosMensuales !== undefined ? Number(body.ingresosMensuales) : undefined,
    });

    // Omitir resumenAnual completo para no saturar la respuesta
    const { resumenAnual: _, ...resumenReducido } = resultado;

    try {
      await fetch(`${req.nextUrl.origin}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aplicacion: 'calculadora-hipoteca', modo: 'chatgpt' }),
      });
    } catch { /* analytics no crítico */ }

    return NextResponse.json(
      {
        ...resumenReducido,
        aviso_legal: '⚠️ Resultado orientativo. Las condiciones reales dependen de la entidad bancaria. Consulta con tu banco o un asesor hipotecario antes de tomar decisiones. Fuente: meskeia.com/calculadora-hipoteca',
      },
      { headers: corsHeaders(origin) }
    );
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error en el cálculo';
    return NextResponse.json({ error: mensaje }, { status: 400, headers: corsHeaders(origin) });
  }
}
