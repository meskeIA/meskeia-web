import { NextRequest, NextResponse } from 'next/server';
import { calcularAmortizacionAnticipada } from '@/lib/calculadoras/amortizacionAnticipada';

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
    const resultado = calcularAmortizacionAnticipada({
      capitalInicial:      Number(body.capitalInicial),
      plazoAnios:          Number(body.plazoAnios),
      tin:                 Number(body.tin),
      importeAmortizacion: Number(body.importeAmortizacion),
      mesesTranscurridos:  body.mesesTranscurridos !== undefined ? Number(body.mesesTranscurridos) : undefined,
      fechaInicio:         body.fechaInicio,
      fechaAmortizacion:   body.fechaAmortizacion,
    });

    try {
      await fetch(`${req.nextUrl.origin}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appName: 'amortizacion-anticipada', mode: 'chatgpt' }),
      });
    } catch { /* analytics no crítico */ }

    return NextResponse.json(
      {
        ...resultado,
        aviso_legal: '⚠️ Resultado orientativo. No incluye posibles comisiones por amortización anticipada (máx. 0,25% primeros 3 años en hipotecas variables según Ley 5/2019). Consulta con tu banco. Fuente: meskeia.com/amortizacion-anticipada',
      },
      { headers: corsHeaders(origin) }
    );
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error en el cálculo';
    return NextResponse.json({ error: mensaje }, { status: 400, headers: corsHeaders(origin) });
  }
}
