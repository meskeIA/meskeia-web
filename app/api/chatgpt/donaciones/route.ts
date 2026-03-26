import { NextRequest, NextResponse } from 'next/server';
import { calcularDonacion } from '@/lib/calculadoras/donaciones';

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
    const resultado = calcularDonacion({
      valorDonacion:   Number(body.valorDonacion),
      ccaa:            String(body.ccaa),
      grupo:           body.grupo,
      cargas:          body.cargas !== undefined ? Number(body.cargas) : 0,
      escrituraPublica: body.escrituraPublica ?? true,
      discapacidad:    body.discapacidad ?? '0',
      patrimonioIdx:   body.patrimonioIdx !== undefined ? Number(body.patrimonioIdx) as 1 | 2 | 3 | 4 : 1,
    });

    // Registrar en analytics
    try {
      await fetch(`${req.nextUrl.origin}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aplicacion: 'estimador-impuesto-donaciones', modo: 'chatgpt' }),
      });
    } catch { /* analytics no crítico */ }

    return NextResponse.json(
      {
        ...resultado,
        aviso_legal: '⚠️ Resultado orientativo basado en Ley 29/1987 ISD y normativas autonómicas 2025. Las donaciones requieren asesoramiento notarial y fiscal profesional. No constituye asesoramiento jurídico ni fiscal. Fuente: meskeia.com/estimador-impuesto-donaciones',
      },
      { headers: corsHeaders(origin) }
    );
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error en el cálculo';
    return NextResponse.json({ error: mensaje }, { status: 400, headers: corsHeaders(origin) });
  }
}
