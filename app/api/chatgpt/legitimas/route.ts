import { NextRequest, NextResponse } from 'next/server';
import { calcularLegitimas } from '@/lib/calculadoras/legitimas';

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
    const resultado = calcularLegitimas({
      patrimonioNeto: Number(body.patrimonioNeto),
      regimen:        body.regimen,
      numHijos:       Number(body.numHijos),
      tieneConyuge:   body.tieneConyuge ?? false,
    });

    // Registrar en analytics
    try {
      await fetch(`${req.nextUrl.origin}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appName: 'orientacion-tramitacion-herencias', mode: 'chatgpt' }),
      });
    } catch { /* analytics no crítico */ }

    return NextResponse.json(
      {
        ...resultado,
        aviso_legal: '⚠️ Resultado orientativo basado en normativa civil española 2025. Las legítimas dependen de múltiples factores y requieren asesoramiento notarial profesional. No constituye asesoramiento jurídico. Fuente: meskeia.com/orientacion-tramitacion-herencias',
      },
      { headers: corsHeaders(origin) }
    );
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error en el cálculo';
    return NextResponse.json({ error: mensaje }, { status: 400, headers: corsHeaders(origin) });
  }
}
