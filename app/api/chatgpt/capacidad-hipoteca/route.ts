import { NextRequest, NextResponse } from 'next/server';
import { calcularCapacidadHipoteca } from '@/lib/calculadoras/capacidadHipoteca';

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
    const resultado = calcularCapacidadHipoteca({
      ingresosMensualesNetos:  Number(body.ingresosMensualesNetos),
      ahorrosDisponibles:      Number(body.ahorrosDisponibles),
      otrasDeudasMensuales:    body.otrasDeudasMensuales !== undefined ? Number(body.otrasDeudasMensuales) : 0,
      tasaInteres:             body.tasaInteres !== undefined ? Number(body.tasaInteres) : 3.5,
      plazo:                   body.plazo !== undefined ? Number(body.plazo) : 30,
      umbralEsfuerzo:          body.umbralEsfuerzo !== undefined ? Number(body.umbralEsfuerzo) : 30,
      porcentajeGastosCompra:  body.porcentajeGastosCompra !== undefined ? Number(body.porcentajeGastosCompra) : 10,
    });

    try {
      await fetch(`${req.nextUrl.origin}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aplicacion: 'capacidad-hipoteca', modo: 'chatgpt' }),
      });
    } catch { /* analytics no crítico */ }

    return NextResponse.json(
      {
        ...resultado,
        aviso_legal: '⚠️ Resultado orientativo basado en la regla de esfuerzo del Banco de España (≤30% ingresos). La capacidad real depende del análisis de riesgo de cada entidad. Fuente: meskeia.com/capacidad-hipoteca',
      },
      { headers: corsHeaders(origin) }
    );
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error en el cálculo';
    return NextResponse.json({ error: mensaje }, { status: 400, headers: corsHeaders(origin) });
  }
}
